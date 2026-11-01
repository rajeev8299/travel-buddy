import { Router } from "express";
import { db } from "../db.js";
import { insertWithReference } from "../reference.js";
import { notifyNewEnquiry } from "../notify.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateBody, text, EMAIL, PHONE, NAME } from "../middleware/validate.js";

const router = Router();

function countNights(arrive, depart) {
  if (!arrive || !depart) return null;
  const a = new Date(arrive);
  const d = new Date(depart);
  if (Number.isNaN(a.getTime()) || Number.isNaN(d.getTime())) return null;
  const nights = Math.round((d - a) / 86_400_000);
  return nights > 0 ? nights : null;
}

router.post(
  "/",
  validateBody({
    where: text(120, "Destination"),
    arrive: { type: "date", label: "Arrival" },
    depart: { type: "date", label: "Departure" },
    who: text(40, "Travellers"),
    fullName: NAME,
    email: EMAIL,
    phone: PHONE,
    style: text(300, "Travel style"),
    pace: text(40, "Pace"),
    specialRequests: text(2000, "Special requests"),
    notes: text(2000, "Notes"),
    buddyName: text(120, "Buddy name"),
  }),
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const where = (body.where || "").trim() || "Varanasi";
    const who = body.who || "2 travellers";
    const arrive = body.arrive || null;
    const depart = body.depart || null;

    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();

    // Basic required validation: must have full name and either email or phone
    if (!fullName) {
      return res.status(400).json({ message: "Full name is required." });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: "Please provide either an email or a contact phone number." });
    }

    if (arrive && depart && depart <= arrive) {
      return res.status(400).json({ message: "Departure has to be at least one day after arrival." });
    }

    const nights = countNights(arrive, depart);

    const style = (body.style || "").trim();
    const pace = (body.pace || "").trim();
    const specialRequests = (body.specialRequests || body.notes || "").trim();
    const buddyName = (body.buddyName || "").trim();

    const insert = db.prepare(
      `INSERT INTO plan_requests (
        id, where_to, arrive, depart, nights, who,
        full_name, email, phone, style, pace, special_requests, buddy_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    );
    const id = insertWithReference((ref) =>
      insert.run(
        ref,
        where,
        arrive,
        depart,
        nights,
        who,
        fullName || null,
        email || null,
        phone || null,
        style || null,
        pace || null,
        specialRequests || null,
        buddyName || null,
      ),
    );

    notifyNewEnquiry("trip request", { reference: id, where, arrive, depart, who, fullName, email, phone, specialRequests });

    res.status(201).json({
      reference: id,
      where,
      arrive,
      depart,
      nights,
      who,
      fullName,
      email,
      phone,
      buddyName,
      status: "pending",
    });
  }),
);

export default router;
