import { Router } from "express";
import { db } from "../../db.js";
import { activeLinkInfo, issueAccessLink } from "../../bookingAccess.js";
import { validateBody, validateParam, text, REFERENCE_ID } from "../../middleware/validate.js";
import {
  STATUSES, LOST_REASONS, S1_MINUTES, S2_MINUTES, S2_SAME_DAY_MINUTES, PARTNER_RESPONSE_MINUTES,
  leadSla, parseDb, istDate, median, weekStart, TRANSITIONS, REOPENABLE, confirmationGaps,
} from "../../leadPipeline.js";

// Lead pipeline (FR-SVC-04): new → contacted → partner_assigned → confirmed →
// completed | cancelled | lost. Every change is timestamped with who made it;
// the first move away from "new" records the first-response time (S1), the
// move to confirmed records time-to-confirmation (S2). Partner assignment
// records when the partner was asked and when they answered (FR-SVC-05).
const router = Router();
router.param("ref", validateParam("ref", REFERENCE_ID));

const COLUMNS = `reference, type, service, item, experience, context, full_name AS fullName, email, phone, travellers,
  arrive, depart, message, plan_text AS planText, source_page AS sourcePage, source_channel AS sourceChannel, status,
  partner_note AS partnerNote, created_at AS createdAt, first_response_at AS firstResponseAt, confirmed_at AS confirmedAt,
  booking_value AS bookingValue, commission, lost_reason AS lostReason, partner_name AS partnerName,
  partner_asked_at AS partnerAskedAt, partner_responded_at AS partnerRespondedAt, partner_response AS partnerResponse,
  current_quote_id AS quoteId, customer_accepted_quote_id AS acceptedQuoteId, customer_accepted_at AS customerAcceptedAt,
  customer_acceptance_note AS customerAcceptanceNote,
  (SELECT amount FROM lead_quotes q WHERE q.id = leads.current_quote_id) AS quoteAmount,
  updated_at AS updatedAt`;

/** Row → API shape: SLA timings plus what confirming still needs. */
const leadOut = (l) => ({
  ...l,
  ...leadSla(l),
  confirmationGaps: confirmationGaps({
    partner_name: l.partnerName, partner_response: l.partnerResponse, current_quote_id: l.quoteId, customer_accepted_quote_id: l.acceptedQuoteId,
  }),
});

router.get("/meta", (req, res) => {
  res.json({
    statuses: STATUSES,
    transitions: TRANSITIONS,
    reopenable: REOPENABLE,
    lostReasons: LOST_REASONS,
    targets: { s1Minutes: S1_MINUTES, s2Minutes: S2_MINUTES, s2SameDayMinutes: S2_SAME_DAY_MINUTES, partnerResponseMinutes: PARTNER_RESPONSE_MINUTES },
  });
});

router.get("/", (req, res) => {
  const { status } = req.query;
  const where = STATUSES.includes(status) ? "WHERE status = ?" : "";
  const rows = db
    .prepare(`SELECT ${COLUMNS} FROM leads ${where} ORDER BY created_at DESC LIMIT 1000`)
    .all(...(where ? [status] : []))
    .map(leadOut);
  res.json({ leads: rows });
});

// ?period=day (last 14 days) or week (last 8 weeks), bucketed by IST date the lead arrived.
router.get("/stats", (req, res) => {
  const byStatus = db.prepare("SELECT status, COUNT(*) AS n FROM leads GROUP BY status").all();
  const weekly = req.query.period === "week";
  const now = new Date();
  const leads = db
    .prepare(
      `SELECT type, status, arrive, created_at AS createdAt, first_response_at AS firstResponseAt, confirmed_at AS confirmedAt
       FROM leads WHERE created_at >= datetime('now', ?)`,
    )
    .all(weekly ? "-56 days" : "-14 days")
    .map((l) => ({ ...l, ...leadSla(l, now) }));

  const buckets = new Map();
  for (const l of leads) {
    const day = istDate(parseDb(l.createdAt));
    const key = weekly ? weekStart(day) : day;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(l);
  }
  const periods = [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([start, ls]) => {
      const s2 = ls.filter((l) => l.s2DueAt);
      return {
        start,
        leads: ls.length,
        s1Median: median(ls.map((l) => l.s1Minutes).filter((m) => m != null)),
        s1Breaches: ls.filter((l) => l.s1Breach).length,
        s2Median: median(s2.map((l) => l.s2Minutes).filter((m) => m != null)),
        s2Applicable: s2.length,
        s2Breaches: s2.filter((l) => l.s2Breach).length,
      };
    });

  // 30-day headline numbers.
  const recent = db
    .prepare(
      `SELECT type, status, arrive, created_at AS createdAt, first_response_at AS firstResponseAt, confirmed_at AS confirmedAt
       FROM leads WHERE created_at >= datetime('now', '-30 days')`,
    )
    .all()
    .map((l) => ({ ...l, ...leadSla(l, now) }));
  const answered = recent.map((l) => l.s1Minutes).filter((m) => m != null);
  const confirmed = recent.map((l) => l.s2Minutes).filter((m) => m != null);

  // FR-SVC-05: responded (accepted or declined) within the window ÷ asked, per partner per month.
  const partners = db
    .prepare(
      `SELECT partner_name AS partner, strftime('%Y-%m', partner_asked_at) AS month, COUNT(*) AS asked,
              SUM(CASE WHEN partner_responded_at IS NOT NULL
                        AND (julianday(partner_responded_at) - julianday(partner_asked_at)) * 1440 <= ? THEN 1 ELSE 0 END) AS inTime,
              SUM(CASE WHEN partner_response = 'accepted' THEN 1 ELSE 0 END) AS accepted
       FROM leads WHERE partner_asked_at IS NOT NULL AND partner_asked_at >= datetime('now', 'start of month', '-1 month')
       GROUP BY partner_name, month ORDER BY month DESC, asked DESC`,
    )
    .all(PARTNER_RESPONSE_MINUTES)
    .map((p) => ({ ...p, rate: p.asked ? Math.round((p.inTime / p.asked) * 100) : null }));

  res.json({
    byStatus,
    firstResponse: { medianMinutes: median(answered), answered: answered.length, breaches: recent.filter((l) => l.s1Breach).length },
    confirmation: { medianMinutes: median(confirmed), confirmed: confirmed.length, breaches: recent.filter((l) => l.s2Breach).length },
    period: weekly ? "week" : "day",
    periods,
    partners,
  });
});

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const rupees = (v) => (v === undefined || v === null || v === "" ? undefined : Number(v));
const validRupees = (n) => Number.isInteger(n) && n >= 0 && n <= 10_000_000;
const LABEL = { new: "New", contacted: "Contacted", partner_assigned: "Partner assigned", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled", lost: "Lost" };

/** Thrown inside the transaction to roll back and answer with a message. */
class Refusal extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    Object.assign(this, { status, extra });
  }
}

// One update = one transaction, applied in a fixed order — partner, quote,
// customer acceptance, status, close-out — each step checked against the state
// the previous one left. Anything invalid rolls the whole request back.
router.patch(
  "/:ref",
  validateBody({
    status: text(20, "Status"),
    partnerNote: text(500, "Partner note"),
    bookingValue: { type: "numeric", label: "Booking value" },
    commission: { type: "numeric", label: "Commission" },
    lostReason: text(60, "Reason"),
    partnerName: text(80, "Partner"),
    partnerResponse: { type: "string", max: 10, enum: ["accepted", "declined"], label: "Partner response" },
    quoteAmount: { type: "numeric", label: "Quote amount" },
    quoteInclusions: text(600, "What's included"),
    quoteExclusions: text(600, "What's not included"),
    customerAccepted: { type: "boolean", label: "Customer accepted" },
    acceptanceNote: text(300, "How the customer accepted"),
    reopen: { type: "boolean", label: "Reopen" },
    reopenReason: text(300, "Reason for reopening"),
  }),
  (req, res) => {
    const b = req.body;
    const ref = req.params.ref;
    const who = req.user.email;
    const get = () => db.prepare("SELECT * FROM leads WHERE reference = ?").get(ref);
    const history = db.prepare("INSERT INTO lead_status_history (reference, status, changed_by, detail) VALUES (?, ?, ?, ?)");
    const set = (sql, ...args) => db.prepare(`UPDATE leads SET ${sql}, updated_at = datetime('now') WHERE reference = ?`).run(...args, ref);

    if (!get()) return res.status(404).json({ message: "Lead not found." });
    db.exec("BEGIN");
    try {
      let lead = get();
      const closed = TRANSITIONS[lead.status].length === 0;
      const locked = ["confirmed", "completed"].includes(lead.status);

      // Reopen (cancelled/lost only): an explicit, reasoned step back to "contacted".
      if (b.reopen) {
        if (!REOPENABLE.includes(lead.status)) throw new Refusal(409, `Only cancelled or lost enquiries can be reopened; this one is ${LABEL[lead.status].toLowerCase()}.`);
        const reason = (b.reopenReason || "").trim();
        if (!reason) throw new Refusal(400, "Say why this enquiry is being reopened.");
        set(`status = 'contacted', confirmed_at = NULL, lost_reason = NULL, booking_value = NULL, commission = NULL,
             customer_accepted_quote_id = NULL, customer_accepted_at = NULL, customer_acceptance_note = NULL`);
        history.run(ref, "reopened", who, reason);
        lead = get();
      } else if (closed) {
        // A closed enquiry keeps its notes editable; a completed one also its
        // value and commission (corrections). Everything else needs a reopen.
        const editable = lead.status === "completed" ? ["partnerNote", "bookingValue", "commission"] : ["partnerNote"];
        const blocked = Object.keys(b).filter((k) => b[k] !== undefined && !editable.includes(k) && !(k === "status" && b[k] === lead.status));
        if (blocked.length) {
          throw new Refusal(409, `This enquiry is ${LABEL[lead.status].toLowerCase()}.${REOPENABLE.includes(lead.status) ? " Reopen it to make changes." : ""}`);
        }
      }

      // Partner: asking someone new restarts their response and voids the old quote's acceptance.
      const partnerName = b.partnerName?.trim();
      if (partnerName && partnerName !== lead.partner_name) {
        if (locked) throw new Refusal(409, "The booking is confirmed — cancel it first to change the partner.");
        set(`partner_name = ?, partner_asked_at = datetime('now'), partner_responded_at = NULL, partner_response = NULL,
             current_quote_id = NULL, customer_accepted_quote_id = NULL, customer_accepted_at = NULL, customer_acceptance_note = NULL`, partnerName);
        history.run(ref, "partner_asked", who, partnerName);
        lead = get();
      }
      if (b.partnerResponse) {
        if (!lead.partner_name) throw new Refusal(400, "Assign a partner first.");
        if (locked) throw new Refusal(409, "The booking is confirmed — the partner's answer can't change now.");
        set("partner_response = ?, partner_responded_at = datetime('now')", b.partnerResponse);
        history.run(ref, `partner_${b.partnerResponse}`, who, lead.partner_name);
        lead = get();
      }

      // Quote: a permanent snapshot. A new quote voids acceptance of the previous one.
      if (b.quoteAmount !== undefined || b.quoteInclusions !== undefined) {
        if (locked) throw new Refusal(409, "The booking is confirmed — cancel it first to change the quote.");
        if (!lead.partner_name) throw new Refusal(400, "Assign a partner before recording a quote.");
        const amount = rupees(b.quoteAmount);
        const inclusions = (b.quoteInclusions || "").trim();
        if (amount === undefined || !validRupees(amount) || amount < 1) throw new Refusal(400, "Enter the quoted price as a whole number of rupees.");
        if (inclusions.length < 3) throw new Refusal(400, "Say what the price includes.");
        const q = db
          .prepare("INSERT INTO lead_quotes (reference, amount, inclusions, exclusions, partner_name, created_by) VALUES (?, ?, ?, ?, ?, ?)")
          .run(ref, amount, inclusions, (b.quoteExclusions || "").trim() || null, lead.partner_name, who);
        set("current_quote_id = ?, customer_accepted_quote_id = NULL, customer_accepted_at = NULL, customer_acceptance_note = NULL", Number(q.lastInsertRowid));
        history.run(ref, "quote_sent", who, `${inr(amount)} — ${lead.partner_name}`);
        lead = get();
      }

      // Customer acceptance of the current quote, with how it arrived.
      if (b.customerAccepted) {
        if (locked) throw new Refusal(409, "The booking is already confirmed.");
        if (!lead.current_quote_id) throw new Refusal(400, "Record the quote before marking it accepted.");
        const note = (b.acceptanceNote || "").trim();
        if (!note) throw new Refusal(400, "Note how the customer accepted (e.g. WhatsApp reply at 3:10 pm).");
        set("customer_accepted_quote_id = current_quote_id, customer_accepted_at = datetime('now'), customer_acceptance_note = ?", note);
        db.prepare("UPDATE lead_quotes SET customer_response = 'accepted', customer_response_at = datetime('now'), customer_response_note = ? WHERE id = ?").run(note, lead.current_quote_id);
        history.run(ref, "customer_accepted", who, note);
        lead = get();
      }

      // Close-out values.
      const bookingValue = rupees(b.bookingValue);
      const commission = rupees(b.commission);
      if (bookingValue !== undefined && !validRupees(bookingValue)) throw new Refusal(400, "Booking value must be a whole number of rupees.");
      if (commission !== undefined && !validRupees(commission)) throw new Refusal(400, "Commission must be a whole number of rupees.");
      const value = bookingValue ?? lead.booking_value;
      const comm = commission ?? lead.commission;
      if (value != null && comm != null && comm > value) throw new Refusal(400, "Commission can't be more than the booking value.");
      if (b.lostReason !== undefined && !LOST_REASONS.includes(b.lostReason)) throw new Refusal(400, "Pick a reason from the list.");

      // Status: only the allowed next steps, each with what it needs.
      const status = b.status;
      if (status && status !== lead.status) {
        if (!STATUSES.includes(status)) throw new Refusal(400, `Status must be one of: ${STATUSES.join(", ")}.`);
        const allowed = TRANSITIONS[lead.status];
        if (!allowed.includes(status)) {
          throw new Refusal(409, `A ${LABEL[lead.status].toLowerCase()} enquiry can't move to ${LABEL[status].toLowerCase()}.` +
            (allowed.length ? ` Next steps: ${allowed.map((s) => LABEL[s].toLowerCase()).join(", ")}.` : ""), { allowed });
        }
        if (status === "partner_assigned" && !lead.partner_name) throw new Refusal(400, "Name the partner you've asked.");
        if (status === "confirmed") {
          const gaps = confirmationGaps(lead);
          if (gaps.length) throw new Refusal(409, `Not ready to confirm: ${gaps.join(" ")}`, { gaps });
        }
        if (status === "completed" && (value == null || comm == null)) {
          throw new Refusal(400, "Enter the booking value and the agreed commission (₹) to mark this completed.");
        }
        if (status === "lost" && !(b.lostReason ?? lead.lost_reason)) throw new Refusal(400, "Pick a reason to mark this lost.");
        set(
          `status = ?, first_response_at = COALESCE(first_response_at, CASE WHEN ? != 'new' THEN datetime('now') END),
             confirmed_at = COALESCE(confirmed_at, CASE WHEN ? IN ('confirmed', 'completed') THEN datetime('now') END)`,
          status, status, status,
        );
        const detail =
          status === "completed" ? `${inr(value)} value, ${inr(comm)} commission` : status === "lost" ? b.lostReason ?? lead.lost_reason : status === "partner_assigned" ? lead.partner_name : null;
        history.run(ref, status, who, detail);
      }
      if (bookingValue !== undefined || commission !== undefined) set("booking_value = ?, commission = ?", value ?? null, comm ?? null);
      if (b.lostReason !== undefined) set("lost_reason = ?", b.lostReason);
      if (b.partnerNote !== undefined) set("partner_note = ?", b.partnerNote || null);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      if (err instanceof Refusal) return res.status(err.status).json({ message: err.message, ...err.extra });
      throw err;
    }
    res.json({ lead: leadOut(db.prepare(`SELECT ${COLUMNS} FROM leads WHERE reference = ?`).get(ref)) });
  },
);

// The customer's private booking-page link. Only its dates can be shown later —
// the link itself isn't stored — so creating one returns it exactly once.
router.get("/:ref/access", (req, res) => {
  res.json({ link: activeLinkInfo(req.params.ref) });
});

router.post("/:ref/access-link", (req, res) => {
  if (!db.prepare("SELECT 1 FROM leads WHERE reference = ?").get(req.params.ref)) return res.status(404).json({ message: "Lead not found." });
  const link = issueAccessLink(req.params.ref, req.user.email, { revokeOthers: true });
  db.prepare("INSERT INTO lead_status_history (reference, status, changed_by, detail) VALUES (?, 'link_issued', ?, ?)").run(
    req.params.ref, req.user.email, "New booking-page link; earlier links stopped working",
  );
  res.status(201).json(link);
});

router.get("/:ref/quotes", (req, res) => {
  res.json({
    quotes: db
      .prepare(
        `SELECT id, amount, inclusions, exclusions, partner_name AS partnerName, created_by AS createdBy, created_at AS createdAt,
                customer_response AS customerResponse, customer_response_at AS customerResponseAt, customer_response_note AS customerResponseNote
         FROM lead_quotes WHERE reference = ? ORDER BY id DESC`,
      )
      .all(req.params.ref),
  });
});

router.get("/:ref/history", (req, res) => {
  res.json({
    history: db
      .prepare("SELECT status, detail, changed_by AS changedBy, changed_at AS changedAt FROM lead_status_history WHERE reference = ? ORDER BY id")
      .all(req.params.ref),
  });
});

export default router;
