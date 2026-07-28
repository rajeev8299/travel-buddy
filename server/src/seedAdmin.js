import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

// Public signup can only ever create 'user' / 'client' accounts (see
// routes/auth.js), so the one admin account has to come from somewhere else:
// on every boot, make sure an admin exists for whatever ADMIN_EMAIL is set to.
export async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) return;

  const existing = db.prepare("SELECT id, role FROM users WHERE email = ?").get(email);
  if (existing) {
    if (existing.role !== "admin") {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existing.id);
      console.log(`Promoted existing account ${email} to admin.`);
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
