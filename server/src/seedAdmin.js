import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

// Public signup can only ever create 'user' / 'client' accounts (see
// routes/auth.js), so the one admin account has to come from somewhere else:
// on boot, create an admin for ADMIN_EMAIL if no account uses that address.
//
// An existing non-admin account is never promoted: signup doesn't verify
// email ownership, so whoever registered the address first would otherwise
// become admin with their own password.
export async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) return;

  const existing = db.prepare("SELECT role FROM users WHERE email = ?").get(email);
  if (existing) {
    if (existing.role !== "admin") {
      console.warn(
        `ADMIN_EMAIL ${email} belongs to an existing non-admin account; not promoting it. ` +
          "Pick an unused address for ADMIN_EMAIL.",
      );
    }
    return;
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare(
    `INSERT INTO users (id, full_name, email, password_hash, role)
     VALUES (?, ?, ?, ?, 'admin')`,
  ).run(id, "Admin", email, passwordHash);
  console.log(`Seeded admin account: ${email}`);
}
