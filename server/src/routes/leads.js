import { Router } from "express";
import { db } from "../db.js";
import { insertWithReference } from "../reference.js";
import { notifyNewEnquiry } from "../notify.js";
import { issueAccessLink } from "../bookingAccess.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateBody, text, EMAIL, PHONE, NAME } from "../middleware/validate.js";

// Tracked leads from the Next.js site (Requirements.md FR-SVC-02/03). Every
// enquiry — trip, service, experience, partner application or complaint —
// gets a reference code before any WhatsApp hand-off, so it can be attributed.

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const BOOKABLE = new Set(["trip", "service", "experience"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Today's date in India (UTC+05:30), as YYYY-MM-DD. */
const istToday = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
const addYears = (ymd, n) => `${Number(ymd.slice(0, 4)) + n}${ymd.slice(4)}`;
const KIND = { trip: "trip request", service: "service enquiry", experience: "experience enquiry", partner: "partner application", complaint: "complaint", general: "enquiry" };

router.post(
  "/",
  validateBody({
    type: { type: "string", max: 20, enum: Object.keys(KIND), label: "Type" },
    service: text(40, "Service"),
    item: text(60, "Service item"),
    experience: text(80, "Experience"),
    context: text(160, "Context"),
    fullName: NAME,
    email: EMAIL,
    phone: PHONE,
    travellers: { type: "numeric", label: "Travellers" },
    arrive: { type: "date", label: "Arrival" },
    depart: { type: "date", label: "Departure" },
    message: text(2000, "Message"),
    planText: text(4000, "Trip plan"),
    sourcePage: text(200, "Source page"),
    sourceChannel: text(40, "Source"),
    consent: { type: "boolean", label: "Consent" },
    idempotencyKey: text(64, "Submission key"),
  }),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const fullName = (b.fullName || "").trim();
    const email = (b.email || "").trim().toLowerCase();
    const phone = (b.phone || "").replace(/[\s-]/g, "");
    const type = b.type || "general";

    if (!fullName) return res.status(400).json({ message: "Tell us your name so we know who to reply to." });
    if (!email && !phone) return res.status(400).json({ message: "Add an email or a phone number so we can reply." });
    if (email && !EMAIL_RE.test(email)) return res.status(400).json({ message: "That email doesn't look complete." });
    if (phone && !PHONE_RE.test(phone)) return res.status(400).json({ message: "Enter a 10-digit Indian mobile number." });
    if (b.arrive && b.depart && b.depart < b.arrive) return res.status(400).json({ message: "Departure can't be before arrival." });
    // Bookings are for the future; a complaint or partner application may refer to past dates.
    if (BOOKABLE.has(type) && b.arrive) {
      const today = istToday();
      if (b.arrive < today) return res.status(400).json({ message: "The arrival date is in the past — check the dates." });
      if (b.arrive > addYears(today, 2)) return res.status(400).json({ message: "We take requests up to two years ahead — check the arrival date." });
    }
    // Never quietly change a group size: reject anything that isn't 1–200.
    let travellers = null;
    if (b.travellers !== undefined && b.travellers !== null && b.travellers !== "") {
      travellers = Number(b.travellers);
      if (!Number.isInteger(travellers) || travellers < 1 || travellers > 200) {
        return res.status(400).json({ message: "Number of travellers must be a whole number from 1 to 200." });
      }
    }
    const key = UUID.test(b.idempotencyKey || "") ? b.idempotencyKey.toLowerCase() : null;
    if (b.consent !== true) return res.status(400).json({ message: "Please agree to be contacted about your enquiry." });
    // Duplicate submissions (QA-03). A retry carrying the same one-time key gets
    // the original receipt. Without a key (old clients, scripts), an identical
    // enquiry from the same contact within 10 minutes is treated the same way.
    const existing = key
      ? db.prepare("SELECT reference, type FROM leads WHERE idempotency_key = ?").get(key)
      : db
          .prepare(
            `SELECT reference, type FROM leads
             WHERE created_at >= datetime('now', '-10 minutes') AND type = ? AND full_name = ?
               AND COALESCE(email, '') = ? AND COALESCE(phone, '') = ?
               AND COALESCE(message, '') = ? AND COALESCE(context, '') = ? AND COALESCE(service, '') = ?
               AND COALESCE(item, '') = ? AND COALESCE(experience, '') = ?
               AND COALESCE(arrive, '') = ? AND COALESCE(depart, '') = ? AND COALESCE(travellers, 0) = ?
             ORDER BY created_at DESC LIMIT 1`,
          )
          .get(
            type, fullName, email, phone, (b.message || "").trim(), b.context || "", b.service || "",
            b.item || "", b.experience || "", b.arrive || "", b.depart || "", travellers ?? 0,
          );
    if (existing) {
      // A key-matched retry comes from the same visitor whose response got lost,
      // so it gets a working link. A content match might not be the same person,
      // so no link — the original confirmation email has it.
      const trackingUrl = key ? issueAccessLink(existing.reference, "customer").url : null;
      return res.status(200).json({ reference: existing.reference, type: existing.type, duplicate: true, trackingUrl });
    }

    // Per-contact limit on top of the per-IP one in app.js: at most 5 an hour
    // from the same email or phone (FR-SVC-02), so a script can't flood the inbox.
    const recent = db
      .prepare(
        `SELECT COUNT(*) AS n FROM leads WHERE created_at >= datetime('now', '-1 hour')
           AND ((? IS NOT NULL AND email = ?) OR (? IS NOT NULL AND phone = ?))`,
      )
      .get(email || null, email || null, phone || null, phone || null);
    if (recent.n >= 5) {
      return res.status(429).json({ message: "We've already received several enquiries from you in the last hour. We'll reply to those first — or message us on WhatsApp." });
    }

    const insert = db.prepare(
      `INSERT INTO leads (reference, type, service, item, experience, context, full_name, email, phone,
        travellers, arrive, depart, message, plan_text, source_page, source_channel, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    // The lead, its key and its first history entry are saved together or not at all.
    let reference;
    let trackingUrl;
    db.exec("BEGIN");
    try {
      reference = insertWithReference((ref) =>
        insert.run(
          ref, type, b.service || null, b.item || null, b.experience || null, b.context || null, fullName,
          email || null, phone || null, travellers, b.arrive || null, b.depart || null, (b.message || "").trim() || null,
          (b.planText || "").trim() || null, b.sourcePage || null, b.sourceChannel || null, key,
        ),
      );
      db.prepare("INSERT INTO lead_status_history (reference, status, changed_by) VALUES (?, 'new', 'traveller')").run(reference);
      ({ url: trackingUrl } = issueAccessLink(reference, "customer"));
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    notifyNewEnquiry(KIND[type], {
      isLead: true,
      trackingUrl,
      reference, fullName, email, phone, where: b.context || b.service || "", arrive: b.arrive, depart: b.depart,
      who: travellers ? `${travellers} travellers` : "", specialRequests: [b.message, b.planText].filter(Boolean).join("\n\n"),
    });
    res.status(201).json({ reference, type, trackingUrl });
  }),
);

export default router;
