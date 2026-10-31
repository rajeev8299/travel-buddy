import { Router } from "express";
import { db } from "../db.js";
import { makeReferenceCode } from "../auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

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
    const id = makeReferenceCode();

    const style = (body.style || "").trim();
    const pace = (body.pace || "").trim();
    const specialRequests = (body.specialRequests || body.notes || "").trim();
    const buddyName = (body.buddyName || "").trim();

    db.prepare(
      `INSERT INTO plan_requests (
        id, where_to, arrive, depart, nights, who,
        full_name, email, phone, style, pace, special_requests, buddy_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    ).run(
      id,
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
    );

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

router.get(
  "/:reference",
  asyncHandler(async (req, res) => {
    const reference = (req.params.reference || "").trim();
    if (!reference) return res.status(400).json({ message: "Reference is required." });

    const row = db
      .prepare(
        `SELECT id, where_to AS whereTo, arrive, depart, nights, who,
                full_name AS fullName, email, phone, style, pace,
                special_requests AS specialRequests, buddy_name AS buddyName,
                status, created_at AS createdAt
         FROM plan_requests WHERE id = ?`,
      )
      .get(reference);

    if (!row) {
      return res.status(404).json({ message: "Trip request not found." });
    }

    res.json({ request: row });
  }),
);

export default router;
