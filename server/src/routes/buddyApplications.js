import { Router } from "express";
import { db } from "../db.js";
import { insertWithReference } from "../reference.js";
import { notifyNewEnquiry } from "../notify.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateBody, text, EMAIL, PHONE, NAME } from "../middleware/validate.js";

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
// Only the last 4 characters of an ID number are ever stored — enough to match
// the document later, useless if leaked. A full number sent by an old form is
// cut down here before it reaches the database. Never a full Aadhaar number.
const idLast4 = (s) => String(s || "").replace(/[^A-Za-z0-9]/g, "").slice(-4).toUpperCase();

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
  if (!v.idType || idLast4(v.idNumber).length !== 4) return "Choose your ID document and enter the last 4 characters of its number.";
  if (!v.ref1Name?.trim() || !phone(v.ref1Phone)) return "A reachable first reference is required.";
  if ((v.whyJoin || "").trim().length < 30) return "Tell us a bit more about why you want to join.";
  if ((v.showThem || "").trim().length < 30) return "Tell us a bit more about what you'd show them.";
  if (!v.consent) return "Consent to the ID and reference check is required.";
  return null;
}

router.post(
  "/",
  validateBody({
    fullName: NAME,
    dob: { type: "date", label: "Date of birth" },
    gender: text(40, "Gender"),
    email: EMAIL,
    phone: PHONE,
    whatsapp: PHONE,
    city: text(120, "City"),
    state: text(120, "State"),
    yearsInCity: { type: "numeric", label: "Years in city" },
    areas: text(1000, "Areas"),
    languages: { type: "strings", max: 40, maxItems: 20, label: "Languages" },
    otherLanguage: text(120, "Other language"),
    guidingYears: text(40, "Guiding experience"),
    specialities: { type: "strings", max: 60, maxItems: 20, label: "Specialities" },
    occupation: text(120, "Occupation"),
    daysPerWeek: text(40, "Days per week"),
    groupSizes: { type: "strings", max: 40, maxItems: 10, label: "Group sizes" },
    noticeDays: text(40, "Notice"),
    vehicle: text(40, "Vehicle"),
    firstAid: { type: "boolean", label: "First aid" },
    idType: text(40, "ID type"),
    idNumber: text(40, "ID number"),
    ref1Name: NAME,
    ref1Phone: PHONE,
    ref2Name: NAME,
    ref2Phone: PHONE,
    whyJoin: text(2000, "Why you want to join"),
    showThem: text(2000, "What you'd show them"),
    consent: { type: "boolean", label: "Consent" },
  }),
  asyncHandler(async (req, res) => {
    const v = req.body || {};
    const error = validate(v);
    if (error) return res.status(400).json({ message: error });

    const insert = db.prepare(
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
    );
    const id = insertWithReference((ref) =>
      insert.run(
        ref,
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
        idLast4(v.idNumber),
        v.ref1Name.trim(),
        v.ref1Phone.trim(),
        v.ref2Name?.trim() || null,
        v.ref2Phone?.trim() || null,
        v.whyJoin.trim(),
        v.showThem.trim(),
      ),
    );

    notifyNewEnquiry("buddy application", {
      reference: id,
      fullName: v.fullName.trim(),
      email: v.email.trim().toLowerCase(),
      phone: v.phone.trim(),
      where: v.city.trim(),
    });

    res.status(201).json({
      reference: id,
      name: v.fullName.trim().split(" ")[0],
      email: v.email.trim(),
    });
  }),
);

export default router;
