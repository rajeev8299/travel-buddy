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

// Lead pipeline fields added after the leads table first shipped
// (FR-SVC-04/05): confirmation time for S2, close-out details, partner
// assignment with ask/answer times, and when an S1 breach alert went out.
function migrateLeadsPipeline() {
  const cols = db.prepare("PRAGMA table_info(leads)").all().map((c) => c.name);
  const add = {
    confirmed_at: "TEXT",
    booking_value: "INTEGER",
    commission: "INTEGER",
    lost_reason: "TEXT",
    partner_name: "TEXT",
    partner_asked_at: "TEXT",
    partner_responded_at: "TEXT",
    partner_response: "TEXT CHECK (partner_response IN ('accepted', 'declined'))",
    s1_alerted_at: "TEXT",
    // One-time key per form submission (QA-03): a retried POST returns the original reference.
    idempotency_key: "TEXT",
    // Booking confirmation (QA-01): the quote on offer and the customer's acceptance of it.
    current_quote_id: "INTEGER",
    customer_accepted_quote_id: "INTEGER",
    customer_accepted_at: "TEXT",
    customer_acceptance_note: "TEXT",
  };
  for (const [name, type] of Object.entries(add)) {
    if (!cols.includes(name)) db.exec(`ALTER TABLE leads ADD COLUMN ${name} ${type};`);
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS leads_idempotency ON leads (idempotency_key)");
  // Every quote ever sent, unchanged once written: what the customer accepted
  // can always be shown exactly, even after a newer quote.
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL REFERENCES leads (reference),
      amount INTEGER NOT NULL,
      inclusions TEXT NOT NULL,
      exclusions TEXT,
      partner_name TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS lead_quotes_reference ON lead_quotes (reference, id);

    -- Private links to the customer's "My booking request" page. Only a
    -- SHA-256 hash of each link's secret is stored, never the secret itself.
    CREATE TABLE IF NOT EXISTS lead_access_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL REFERENCES leads (reference),
      token_hash TEXT NOT NULL UNIQUE,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      last_used_at TEXT
    );
    CREATE INDEX IF NOT EXISTS lead_access_tokens_reference ON lead_access_tokens (reference);

    -- One row per notification send attempt: no message bodies, no addresses.
    CREATE TABLE IF NOT EXISTS notification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
      audience TEXT NOT NULL CHECK (audience IN ('team', 'customer')),
      kind TEXT NOT NULL,
      reference TEXT,
      status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS notification_log_status ON notification_log (status, created_at);
  `);
  // The customer's answer to each quote snapshot (accepted on the booking page or recorded by staff).
  const quoteCols = db.prepare("PRAGMA table_info(lead_quotes)").all().map((c) => c.name);
  for (const [name, type] of [["customer_response", "TEXT CHECK (customer_response IN ('accepted', 'declined'))"], ["customer_response_at", "TEXT"], ["customer_response_note", "TEXT"]]) {
    if (!quoteCols.includes(name)) db.exec(`ALTER TABLE lead_quotes ADD COLUMN ${name} ${type};`);
  }
  const hist = db.prepare("PRAGMA table_info(lead_status_history)").all().map((c) => c.name);
  if (!hist.includes("detail")) db.exec("ALTER TABLE lead_status_history ADD COLUMN detail TEXT;");
}

// Blog roles (FR-BLOG-02/03): authors and editors sign in to the admin panel
// but only see the blog. SQLite can't widen a CHECK constraint in place, so
// the table is rebuilt. The copy is created under a new name and renamed into
// place, never the other way round: renaming the live table would make SQLite
// repoint any foreign keys at the old copy.
function migrateUsersEditorialRoles() {
  const existing = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'").get();
  if (!existing || existing.sql.includes("'editor'")) return;
  db.exec("PRAGMA foreign_keys = OFF;");
  db.exec("BEGIN");
  try {
    db.exec(`
      CREATE TABLE users_new (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('user', 'client', 'author', 'editor', 'admin')),
        city TEXT,
        company TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        token_version INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO users_new (id, full_name, email, password_hash, phone, role, city, company, created_at, token_version)
        SELECT id, full_name, email, password_hash, phone, role, city, company, created_at, token_version FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
    `);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  } finally {
    db.exec("PRAGMA foreign_keys = ON;");
  }
}

// Multi-author blog (Requirements.md §12, FR-BLOG-01…05). A post keeps its
// live revision while a newer one goes through review; every comment and
// workflow step is a blog_reviews row, which doubles as the audit trail.
// Author/user ids aren't foreign keys, matching the rest of the schema: the
// users table is rebuilt by migrations and must stay free of inbound keys.
function createBlogTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS author_profiles (
      user_id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      author_id TEXT NOT NULL,
      live_revision_id INTEGER,
      first_published_at TEXT,
      last_published_at TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES blog_posts (id),
      number INTEGER NOT NULL,
      state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN (
        'draft', 'submitted', 'in_review', 'changes_requested', 'fact_check', 'verified',
        'approved', 'scheduled', 'published', 'superseded', 'discarded')),
      title TEXT NOT NULL DEFAULT '',
      excerpt TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      category TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      cover_url TEXT,
      cover_alt TEXT,
      cover_credit TEXT,
      sources TEXT NOT NULL DEFAULT '[]',
      verified_on TEXT,
      seo_title TEXT,
      seo_description TEXT,
      created_by TEXT NOT NULL,
      content_hash TEXT,
      approved_by TEXT,
      approved_at TEXT,
      scheduled_for TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (post_id, number)
    );
    CREATE INDEX IF NOT EXISTS blog_revisions_state ON blog_revisions (state, scheduled_for);

    CREATE TABLE IF NOT EXISTS blog_revision_contributors (
      revision_id INTEGER NOT NULL REFERENCES blog_revisions (id),
      user_id TEXT NOT NULL,
      PRIMARY KEY (revision_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS blog_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      revision_id INTEGER NOT NULL REFERENCES blog_revisions (id),
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      body TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS blog_reviews_revision ON blog_reviews (revision_id, id);
  `);
  const seed = db.prepare("INSERT OR IGNORE INTO blog_categories (slug, name, description, sort_order) VALUES (?, ?, ?, ?)");
  [
    ["plan-your-trip", "Plan your trip", "Timing, routes, budgets and practical planning for Varanasi.", 1],
    ["ghats-and-temples", "Ghats & temples", "Visiting the ghats and temples respectfully and well.", 2],
    ["food", "Food & markets", "What to eat, where locals shop, and how to do both safely.", 3],
    ["festivals", "Festivals", "Dev Deepawali, Ganga Mahotsav and the city's other big days.", 4],
    ["culture", "Culture & etiquette", "Customs, rituals and how to be a considerate visitor.", 5],
    ["stories", "Traveller stories", "First-hand accounts from travellers, shared with consent.", 6],
  ].forEach((c) => seed.run(...c));
}

// Two seeded hero photos turned out not to be Varanasi at all (a camper van on
// a beach; India Gate in Delhi). Remove those seeded rows from databases that
// already have them. Admin uploads (source 'upload') are never touched.
function removeWrongSeedHeroSlides() {
  db.prepare("DELETE FROM hero_slides WHERE source = 'static' AND image_path IN ('img/ghats_dawn.jpg', 'img/banaras_ghats_steps.jpg')").run();
}

// Author profiles grew languages, expertise (both self-described) and a photo
// crop position. An admin can change a published author's address; the old one
// is kept as a redirect so existing links keep working.
// audit_log is the general, append-only record of administrative changes.
function migrateAuthorProfilesAndAudit() {
  const cols = db.prepare("PRAGMA table_info(author_profiles)").all().map((c) => c.name);
  for (const [name, type] of [["languages", "TEXT NOT NULL DEFAULT '[]'"], ["expertise", "TEXT NOT NULL DEFAULT '[]'"], ["avatar_pos", "TEXT"]]) {
    if (!cols.includes(name)) db.exec(`ALTER TABLE author_profiles ADD COLUMN ${name} ${type};`);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS author_slug_redirects (
      old_slug TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      subject TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS audit_log_subject ON audit_log (subject, id);
  `);
}

// Full ID numbers must not be kept (several were stored in plain text, Aadhaar
// among the options). Reduce every stored number to its last 4 characters.
// Permanent by design — agreed with the business owner.
function maskStoredIdNumbers() {
  const rows = db.prepare("SELECT id, id_number FROM buddy_applications WHERE length(id_number) > 4").all();
  const mask = db.prepare("UPDATE buddy_applications SET id_number = ? WHERE id = ?");
  for (const r of rows) mask.run(String(r.id_number).replace(/[^A-Za-z0-9]/g, "").slice(-4).toUpperCase(), r.id);
}

// Buddy verification: a private link per shortlisted applicant, the documents
// they upload (encrypted files; the row outlives the file as the record of the
// check), the team's own checks (references, interview) and the details the
// buddy completes. Files are deleted as soon as they're reviewed.
function createBuddyVerificationTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS buddy_access_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id TEXT NOT NULL REFERENCES buddy_applications (id),
      token_hash TEXT NOT NULL UNIQUE,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      last_used_at TEXT
    );
    CREATE TABLE IF NOT EXISTS buddy_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id TEXT NOT NULL REFERENCES buddy_applications (id),
      kind TEXT NOT NULL CHECK (kind IN ('photo_id', 'photo', 'police', 'guide_licence')),
      status TEXT NOT NULL CHECK (status IN ('uploaded', 'accepted', 'rejected', 'replaced', 'expired')),
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      storage_key TEXT,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_note TEXT,
      file_deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS buddy_documents_app ON buddy_documents (application_id, kind, id);
    CREATE TABLE IF NOT EXISTS buddy_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id TEXT NOT NULL REFERENCES buddy_applications (id),
      kind TEXT NOT NULL CHECK (kind IN ('reference_1', 'reference_2', 'interview')),
      outcome TEXT NOT NULL CHECK (outcome IN ('passed', 'failed')),
      note TEXT,
      checked_by TEXT NOT NULL,
      checked_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS buddy_profiles (
      application_id TEXT PRIMARY KEY REFERENCES buddy_applications (id),
      display_name TEXT,
      intro TEXT,
      locality TEXT,
      emergency_name TEXT,
      emergency_phone TEXT,
      availability TEXT,
      consent_at TEXT,
      conduct_agreed_at TEXT,
      submitted_at TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
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
    role TEXT NOT NULL CHECK (role IN ('user', 'client', 'author', 'editor', 'admin')),
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
`);

// Next.js site (web/): tracked leads for every enquiry type, live travel
// alerts, and privacy-friendly analytics events.
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    reference TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('trip', 'service', 'experience', 'partner', 'complaint', 'general')),
    service TEXT,
    item TEXT,
    experience TEXT,
    context TEXT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    travellers INTEGER,
    arrive TEXT,
    depart TEXT,
    message TEXT,
    plan_text TEXT,
    source_page TEXT,
    source_channel TEXT,
    status TEXT NOT NULL DEFAULT 'new'
      CHECK (status IN ('new', 'contacted', 'partner_assigned', 'confirmed', 'completed', 'cancelled', 'lost')),
    partner_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    first_response_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS leads_status ON leads (status, created_at);
  CREATE INDEX IF NOT EXISTS leads_email ON leads (email, created_at);
  CREATE INDEX IF NOT EXISTS leads_phone ON leads (phone, created_at);

  CREATE TABLE IF NOT EXISTS lead_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL REFERENCES leads (reference),
    status TEXT NOT NULL,
    changed_by TEXT,
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS travel_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'advisory', 'warning')),
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    posted_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    page TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    props TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS analytics_name_time ON analytics_events (name, created_at);
`);

migrateUsersTableForAdminRole();
migratePlanRequestsTable();
migrateUsersTokenVersion();
migrateLeadsPipeline();
migrateUsersEditorialRoles();
createBlogTables();
migrateAuthorProfilesAndAudit();
maskStoredIdNumbers();
createBuddyVerificationTables();

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
removeWrongSeedHeroSlides();
