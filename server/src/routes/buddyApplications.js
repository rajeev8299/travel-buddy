import { Router } from "express";
import { db } from "../db.js";
import { makeReferenceCode } from "../auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

function ageFrom(dob) {
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}

// Mirrors the client-side checks in src/components/BuddyForm.jsx — never
// trust the browser alone for something that ends up in the DB.
function validate(v) {
  const phone = (s) => PHONE_RE.test((s || "").replace(/[\s-]/g, ""));
  if (!v.fullName?.trim()) return "We need a name to call you by.";
  const age = ageFrom(v.dob);
  if (age === null || age < 18) return "Buddies have to be 18 or older.";
  if (!EMAIL_RE.test((v.email || "").trim())) return "That email doesn't look complete.";
  if (!phone(v.phone)) return "Enter a 10-digit Indian mobile number.";
  if (!v.city?.trim() || !v.state?.trim()) return "City and state are required.";
  if (v.yearsInCity === "" || v.yearsInCity == null || Number(v.yearsInCity) < 0)
    return "Years lived there is required.";
  if ((!v.languages || v.languages.length === 0) && !v.otherLanguage?.trim())
    return "Pick at least one language.";
  if (!v.guidingYears) return "Years of guiding experience is required.";
  if (!v.daysPerWeek) return "Days a week you're free is required.";
  if (!v.idType || !v.idNumber?.trim()) return "ID document and number are required.";
  if (!v.ref1Name?.trim() || !phone(v.ref1Phone)) return "A reachable first reference is required.";
  if ((v.whyJoin || "").trim().length < 30) return "Tell us a bit more about why you want to join.";
  if ((v.showThem || "").trim().length < 30) return "Tell us a bit more about what you'd show them.";
  if (!v.consent) return "Consent to the ID and reference check is required.";
  return null;
}

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const v = req.body || {};
    const error = validate(v);
    if (error) return res.status(400).json({ message: error });

    const id = makeReferenceCode();
    db.prepare(
      `INSERT INTO buddy_applications (
        id, full_name, dob, gender, email, phone, whatsapp,
        city, state, years_in_city, areas,
        languages, other_language,
        guiding_years, specialities, occupation,
        days_per_week, group_sizes, notice_days, vehicle, first_aid,
        id_type, id_number,
        ref1_name, ref1_phone, ref2_name, ref2_phone,
        why_join, show_them
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      v.fullName.trim(),
      v.dob,
      v.gender || null,
      v.email.trim().toLowerCase(),
      v.phone.trim(),
      v.whatsapp?.trim() || null,
      v.city.trim(),
      v.state.trim(),
      Number(v.yearsInCity),
      v.areas?.trim() || null,
      JSON.stringify(v.languages || []),
      v.otherLanguage?.trim() || null,
      v.guidingYears,
      JSON.stringify(v.specialities || []),
      v.occupation?.trim() || null,
      v.daysPerWeek,
      JSON.stringify(v.groupSizes || []),
      v.noticeDays || null,
      v.vehicle || null,
      v.firstAid ? 1 : 0,
      v.idType,
      v.idNumber.trim(),
      v.ref1Name.trim(),
      v.ref1Phone.trim(),
      v.ref2Name?.trim() || null,
      v.ref2Phone?.trim() || null,
      v.whyJoin.trim(),
      v.showThem.trim(),
    );

    res.status(201).json({
      reference: id,
      name: v.fullName.trim().split(" ")[0],
      email: v.email.trim(),
    });
  }),
);

export default router;
