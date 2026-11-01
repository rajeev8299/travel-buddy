import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { startSession, clearSessionCookie, getSessionUser, revokeSessions } from "../auth.js";
import { loadUser, requireAuth } from "../middleware/auth.js";
import { validateBody, text, EMAIL, PHONE, NAME, PASSWORD } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

// Compared against when the email is unknown, so a login for a missing
// account takes as long as one with a wrong password.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomUUID(), 10);

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.full_name.trim().split(" ")[0],
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || "",
    role: row.role,
    city: row.city || "",
    company: row.company || "",
  };
}

router.post(
  "/signup",
  validateBody({
    fullName: NAME,
    email: EMAIL,
    password: PASSWORD,
    phone: PHONE,
    role: { type: "string", max: 10, enum: ["user", "client"], label: "Role" },
    city: text(120, "City"),
    company: text(120, "Company"),
  }),
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const phone = (body.phone || "").replace(/[\s-]/g, "");
    const role = body.role === "client" ? "client" : "user";
    const city = (body.city || "").trim();
    const company = (body.company || "").trim();

    if (!fullName) return res.status(400).json({ message: "We need a name to call you by." });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "That email doesn't look complete." });
    if (password.length < 8) return res.status(400).json({ message: "Use at least 8 characters." });
    if (phone && !PHONE_RE.test(phone))
      return res.status(400).json({ message: "Enter a 10-digit Indian mobile number." });

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(409).json({ message: "An account with that email already exists." });

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    db.prepare(
      `INSERT INTO users (id, full_name, email, password_hash, phone, role, city, company)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, fullName, email, passwordHash, phone, role, city || null, company || null);

    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    startSession(res, row);
    res.status(201).json({ user: toPublicUser(row) });
  }),
);

router.post(
  "/login",
  validateBody({ email: EMAIL, password: PASSWORD }),
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
    if (!row || !ok) return res.status(401).json({ message: "That email and password don't match." });

    startSession(res, row);
    res.json({ user: toPublicUser(row) });
  }),
);

// Logging out ends the session on every device, so a copied cookie can't
// outlive it.
router.post("/logout", loadUser, (req, res) => {
  if (req.user) revokeSessions(req.user.id);
  clearSessionCookie(res);
  res.json({ ok: true });
});

// Needs a signed-in session as well as the current password: the account is
// the one in the session, never an email from the request body.
router.post(
  "/change-password",
  requireAuth,
  validateBody({ currentPassword: PASSWORD, newPassword: PASSWORD }),
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }

    const row = req.user;
    if (!(await bcrypt.compare(currentPassword, row.password_hash))) {
      return res.status(401).json({ message: "Current password does not match." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, row.id);
    revokeSessions(row.id);
    clearSessionCookie(res);

    res.json({ ok: true, message: "Password updated. Sign in with your new password." });
  }),
);

// There's no email channel to send a reset link through yet, so this only
// points people at the operator — and answers the same way whether or not
// the address has an account, so it can't be used to find accounts.
router.post("/forgot-password", validateBody({ email: EMAIL }), (req, res) => {
  const email = (req.body.email || "").trim();
  if (!email) return res.status(400).json({ message: "Email is required." });

  res.json({
    ok: true,
    message:
      "If that address has an account, the site operator can reset its password. Contact your TravelOnBuddy administrator.",
  });
});

router.get("/me", (req, res) => {
  res.json({ user: toPublicUser(getSessionUser(req)) });
});

export default router;
