import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { BUDDIES, STORIES, HERO_SLIDES } from "./seedData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "travel.db"));

db.exec("PRAGMA journal_mode = WAL;");

// The `users` table originally only allowed role IN ('user', 'client'). Admin
// accounts need a third role, but SQLite can't ALTER a CHECK constraint in
// place — rebuild the table instead, keeping every existing row.
function migrateUsersTableForAdminRole() {
  const existing = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get();
  if (!existing || existing.sql.includes("'admin'")) return;

  db.exec(`
    ALTER TABLE users RENAME TO users_old;

    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('user', 'client', 'admin')),
      city TEXT,
      company TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    INSERT INTO users (id, full_name, email, password_hash, phone, role, city, company, created_at)
      SELECT id, full_name, email, password_hash, phone, role, city, company, created_at FROM users_old;

    DROP TABLE users_old;
  `);
}

migrateUsersTableForAdminRole();

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'client', 'admin')),
    city TEXT,
    company TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS buddies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    years INTEGER NOT NULL,
    rating REAL NOT NULL,
    tongue TEXT NOT NULL,
    hue TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT NOT NULL,
    name TEXT NOT NULL,
    trip TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS buddy_applications (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    dob TEXT NOT NULL,
    gender TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    years_in_city INTEGER NOT NULL,
    areas TEXT,
    languages TEXT NOT NULL,
    other_language TEXT,
    guiding_years TEXT NOT NULL,
    specialities TEXT NOT NULL,
    occupation TEXT,
    days_per_week TEXT NOT NULL,
    group_sizes TEXT NOT NULL,
    notice_days TEXT,
    vehicle TEXT,
    first_aid INTEGER NOT NULL DEFAULT 0,
    id_type TEXT NOT NULL,
    id_number TEXT NOT NULL,
    ref1_name TEXT NOT NULL,
    ref1_phone TEXT NOT NULL,
    ref2_name TEXT,
    ref2_phone TEXT,
    why_join TEXT NOT NULL,
    show_them TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS plan_requests (
    id TEXT PRIMARY KEY,
    where_to TEXT NOT NULL,
    arrive TEXT,
    depart TEXT,
    nights INTEGER,
    who TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL CHECK (source IN ('static', 'upload')),
    image_path TEXT NOT NULL,
    pos TEXT NOT NULL DEFAULT 'center 50%',
    sort_order INTEGER NOT NULL
  );
`);

function seedIfEmpty(table, rows, insertSql) {
  const { count } = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
  if (count > 0) return;
  const insert = db.prepare(insertSql);
  for (const row of rows) insert.run(...row);
}

seedIfEmpty(
  "buddies",
  BUDDIES.map((b) => [b.name, b.city, b.years, b.rating, b.tongue, b.hue]),
  "INSERT INTO buddies (name, city, years, rating, tongue, hue) VALUES (?, ?, ?, ?, ?, ?)",
);

seedIfEmpty(
  "stories",
  STORIES.map((s) => [s.quote, s.name, s.trip]),
  "INSERT INTO stories (quote, name, trip) VALUES (?, ?, ?)",
);

seedIfEmpty(
  "hero_slides",
  HERO_SLIDES.map((s, i) => ["static", s.path, s.pos, i]),
  "INSERT INTO hero_slides (source, image_path, pos, sort_order) VALUES (?, ?, ?, ?)",
);
