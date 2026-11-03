import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { BUDDIES, STORIES, HERO_SLIDES } from "./seedData.js";
import { FOOD_CATEGORIES, FOOD_LOCALITIES, INITIAL_FOOD_SHOPS } from "./foodSeedData.js";

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

function migratePlanRequestsTable() {
  const existing = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'plan_requests'")
    .get();
  if (!existing) return;

  const cols = db.prepare("PRAGMA table_info(plan_requests)").all().map((c) => c.name);
  if (!cols.includes("email")) {
    db.exec(`
      ALTER TABLE plan_requests ADD COLUMN full_name TEXT;
      ALTER TABLE plan_requests ADD COLUMN email TEXT;
      ALTER TABLE plan_requests ADD COLUMN phone TEXT;
      ALTER TABLE plan_requests ADD COLUMN style TEXT;
      ALTER TABLE plan_requests ADD COLUMN pace TEXT;
      ALTER TABLE plan_requests ADD COLUMN special_requests TEXT;
      ALTER TABLE plan_requests ADD COLUMN buddy_name TEXT;
      ALTER TABLE plan_requests ADD COLUMN status TEXT DEFAULT 'pending';
    `);
  }
}

// Bumped on logout / password change; tokens carrying an older version are
// rejected, which is how a stateless JWT session gets revoked.
function migrateUsersTokenVersion() {
  const cols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
  if (!cols.includes("token_version")) {
    db.exec("ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;");
  }
}

// Create every table in its current shape first, then upgrade databases
// created by older versions. (Migrating before creating left a fresh
// database's plan_requests table without its newer columns.)
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
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    token_version INTEGER NOT NULL DEFAULT 0
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
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    style TEXT,
    pace TEXT,
    special_requests TEXT,
    buddy_name TEXT,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL CHECK (source IN ('static', 'upload')),
    image_path TEXT NOT NULL,
    pos TEXT NOT NULL DEFAULT 'center 50%',
    sort_order INTEGER NOT NULL
  );

  /* Banaras Food Explorer Schema */
  CREATE TABLE IF NOT EXISTS food_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT 'UtensilsCrossed',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS food_localities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS food_shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES food_categories(id),
    locality_id INTEGER NOT NULL REFERENCES food_localities(id),
    address TEXT NOT NULL,
    nearby_landmark TEXT,
    latitude REAL,
    longitude REAL,
    google_maps_url TEXT,
    phone TEXT,
    description TEXT,
    must_try TEXT,
    price_for_two INTEGER DEFAULT 150,
    price_tier TEXT DEFAULT '₹',
    open_time TEXT DEFAULT '08:00 AM',
    close_time TEXT DEFAULT '10:30 PM',
    opening_days TEXT DEFAULT 'Mon - Sun',
    is_pure_veg INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 1,
    is_published INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.7,
    review_count INTEGER DEFAULT 120,
    cover_image TEXT DEFAULT 'img/street_food.jpg',
    location_verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS food_menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL REFERENCES food_shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    is_veg INTEGER DEFAULT 1,
    is_popular INTEGER DEFAULT 0,
    image TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_food_shops_locality ON food_shops(locality_id);
  CREATE INDEX IF NOT EXISTS idx_food_shops_category ON food_shops(category_id);
  CREATE INDEX IF NOT EXISTS idx_food_shops_coords ON food_shops(latitude, longitude);
`);

migrateUsersTableForAdminRole();
migratePlanRequestsTable();
migrateUsersTokenVersion();

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

/* Seed Food Categories */
seedIfEmpty(
  "food_categories",
  FOOD_CATEGORIES.map((c) => [c.name, c.slug, c.icon, c.sort_order]),
  "INSERT INTO food_categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)",
);

/* Seed Food Localities */
seedIfEmpty(
  "food_localities",
  FOOD_LOCALITIES.map((l) => [l.name, l.slug]),
  "INSERT INTO food_localities (name, slug) VALUES (?, ?)",
);

/* Seed Initial Verified Food Shops & Menus */
function seedFoodShops() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM food_shops").get();
  if (count > 0) return;

  const getCatId = db.prepare("SELECT id FROM food_categories WHERE slug = ?");
  const getLocId = db.prepare("SELECT id FROM food_localities WHERE slug = ?");

  const insertShop = db.prepare(`
    INSERT INTO food_shops (
      name, slug, category_id, locality_id, address, nearby_landmark,
      latitude, longitude, phone, description, must_try, price_for_two,
      price_tier, open_time, close_time, opening_days, is_pure_veg,
      is_verified, is_published, rating, review_count, cover_image, location_verified_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const insertMenu = db.prepare(`
    INSERT INTO food_menu_items (shop_id, name, price, description, is_veg, is_popular)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const s of INITIAL_FOOD_SHOPS) {
    const cat = getCatId.get(s.category_slug);
    const loc = getLocId.get(s.locality_slug);
    const catId = cat ? cat.id : 1;
    const locId = loc ? loc.id : 1;

    const res = insertShop.run(
      s.name,
      s.slug,
      catId,
      locId,
      s.address,
      s.nearby_landmark,
      s.latitude,
      s.longitude,
      s.phone,
      s.description,
      s.must_try,
      s.price_for_two,
      s.price_tier,
      s.open_time,
      s.close_time,
      s.opening_days,
      s.is_pure_veg,
      s.is_verified,
      s.is_published,
      s.rating,
      s.review_count,
      s.cover_image,
    );

    const shopId = res.lastInsertRowid;
    if (s.menu && s.menu.length) {
      for (const m of s.menu) {
        insertMenu.run(shopId, m.name, m.price, m.description || "", m.is_veg, m.is_popular);
      }
    }
  }
}

seedFoodShops();
