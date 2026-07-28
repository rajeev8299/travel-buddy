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
    const where = (body.where || "").trim() || "anywhere in India";
    const who = body.who || "2 travellers";
    const arrive = body.arrive || null;
    const depart = body.depart || null;

    if (arrive && depart && depart <= arrive) {
      return res.status(400).json({ message: "Departure has to be at least one day after arrival." });
    }

    const nights = countNights(arrive, depart);
    const id = makeReferenceCode();

    db.prepare(
      "INSERT INTO plan_requests (id, where_to, arrive, depart, nights, who) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(id, where, arrive, depart, nights, who);

    res.status(201).json({ reference: id, where, arrive, depart, nights, who });
  }),
);

export default router;
