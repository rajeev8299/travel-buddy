import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { signToken, setSessionCookie, clearSessionCookie, getUserIdFromRequest } from "../auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

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
    setSessionCookie(res, signToken(id));
    res.status(201).json({ user: toPublicUser(row) });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    const ok = row ? await bcrypt.compare(password, row.password_hash) : false;
    if (!ok) return res.status(401).json({ message: "That email and password don't match." });

    setSessionCookie(res, signToken(row.id));
    res.json({ user: toPublicUser(row) });
  }),
);

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.json({ user: null });

    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    res.json({ user: toPublicUser(row) });
  }),
);

export default router;
