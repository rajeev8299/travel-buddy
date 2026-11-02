import crypto from "node:crypto";
import { db } from "./db.js";
import { deleteEncrypted } from "./privateFiles.js";

// Buddy verification rules. A shortlisted applicant gets a private link (same
// design as the booking page: 256-bit secret in the URL fragment, only its hash
// stored, expiring, revocable) to upload documents and complete their details.
// Each document file is deleted as soon as the team reviews it; the row stays
// as the record of who checked what, when, and the outcome.

export const DOCS = {
  photo_id: { label: "Government photo ID", required: true, hint: "Passport, driving licence, voter ID or PAN card. For Aadhaar, upload a masked Aadhaar (first 8 digits hidden) — never the full number." },
  photo: { label: "Recent photo of you", required: true, hint: "A clear, recent photo of your face, so we can match it to your ID." },
  police: { label: "Police verification certificate", required: true, hint: "Your police clearance or character certificate." },
  guide_licence: { label: "Guide licence", required: false, hint: "Only if you have one — e.g. a UP Tourism or Ministry of Tourism approved guide licence." },
};
export const CHECKS = { reference_1: "Reference 1 called", reference_2: "Reference 2 called", interview: "Interview" };
export const MAX_DOC_BYTES = 8 * 1024 * 1024;
const LINK_DAYS = 14;
const UNREVIEWED_DAYS = 30;
const TOKEN_RE = /^[\w-]{43}$/;
const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");
const SITE_URL = () => (process.env.SITE_URL || "http://localhost:3100").replace(/\/$/, "");

export function issueBuddyLink(applicationId, createdBy) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + LINK_DAYS * 86_400_000).toISOString();
  db.prepare("UPDATE buddy_access_tokens SET revoked_at = datetime('now') WHERE application_id = ? AND revoked_at IS NULL").run(applicationId);
  db.prepare("INSERT INTO buddy_access_tokens (application_id, token_hash, created_by, expires_at) VALUES (?, ?, ?, ?)").run(applicationId, hash(token), createdBy, expiresAt);
  return { url: `${SITE_URL()}/buddy-verification#t=${token}`, expiresAt };
}

/** The application a link opens — only while verification is open. */
export function applicationForToken(token) {
  if (typeof token !== "string" || !TOKEN_RE.test(token)) return null;
  const row = db
    .prepare("SELECT id, application_id FROM buddy_access_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?")
    .get(hash(token), new Date().toISOString());
  if (!row) return null;
  const app = db.prepare("SELECT * FROM buddy_applications WHERE id = ?").get(row.application_id);
  if (!app || !["docs_requested", "under_review"].includes(app.status)) return null;
  db.prepare("UPDATE buddy_access_tokens SET last_used_at = datetime('now') WHERE id = ?").run(row.id);
  return app;
}

export function activeBuddyLink(applicationId) {
  return (
    db
      .prepare(
        `SELECT created_at AS createdAt, expires_at AS expiresAt, last_used_at AS lastUsedAt FROM buddy_access_tokens
         WHERE application_id = ? AND revoked_at IS NULL AND expires_at > ? ORDER BY id DESC LIMIT 1`,
      )
      .get(applicationId, new Date().toISOString()) ?? null
  );
}

/** Newest document row of each kind. */
export function latestDocs(applicationId) {
  const rows = db.prepare("SELECT * FROM buddy_documents WHERE application_id = ? ORDER BY id DESC").all(applicationId);
  const byKind = {};
  for (const r of rows) byKind[r.kind] ??= r;
  return byKind;
}

const latestChecks = (applicationId) => {
  const rows = db.prepare("SELECT * FROM buddy_checks WHERE application_id = ? ORDER BY id DESC").all(applicationId);
  const byKind = {};
  for (const r of rows) byKind[r.kind] ??= r;
  return byKind;
};

export const profileFor = (applicationId) => db.prepare("SELECT * FROM buddy_profiles WHERE application_id = ?").get(applicationId) ?? null;

/** What's missing from the buddy's side before they can submit. */
export function buddyGaps(app) {
  const docs = latestDocs(app.id);
  const p = profileFor(app.id);
  const gaps = [];
  for (const [kind, d] of Object.entries(DOCS)) {
    const s = docs[kind]?.status;
    if (d.required && !["uploaded", "accepted"].includes(s)) gaps.push(`Upload your ${d.label.toLowerCase()}.`);
  }
  if (!p?.display_name || !p?.intro) gaps.push("Add the name and short introduction travellers will see.");
  if (!p?.emergency_name || !p?.emergency_phone) gaps.push("Add an emergency contact.");
  if (!p?.locality) gaps.push("Add the area where you live.");
  if (!p?.consent_at) gaps.push("Agree to how we check and delete your documents.");
  if (!p?.conduct_agreed_at) gaps.push("Agree to the buddy code of conduct.");
  return gaps;
}

/** What's missing before an admin can approve. */
export function approvalGaps(app) {
  const docs = latestDocs(app.id);
  const checks = latestChecks(app.id);
  const gaps = [];
  for (const [kind, d] of Object.entries(DOCS)) {
    const s = docs[kind]?.status;
    if (d.required && s !== "accepted") gaps.push(`${d.label}: ${s === "uploaded" ? "waiting for review" : s === "rejected" ? "re-upload requested" : "not provided"}.`);
    if (!d.required && s === "uploaded") gaps.push(`${d.label}: waiting for review.`);
  }
  const needed = ["reference_1", ...(app.ref2_name ? ["reference_2"] : []), "interview"];
  for (const k of needed) if (checks[k]?.outcome !== "passed") gaps.push(`${CHECKS[k]}: ${checks[k] ? "failed" : "not done"}.`);
  if (!profileFor(app.id)?.submitted_at) gaps.push("The applicant hasn't submitted their details yet.");
  return gaps;
}

/** Admin's view: every check and its record — never file contents or links. */
export function verificationState(app) {
  const docs = latestDocs(app.id);
  const checks = latestChecks(app.id);
  const p = profileFor(app.id);
  return {
    status: app.status,
    documents: Object.entries(DOCS).map(([kind, d]) => {
      const r = docs[kind];
      return {
        kind,
        label: d.label,
        required: d.required,
        id: r?.id ?? null,
        status: r?.status ?? "missing",
        mime: r?.mime ?? null,
        size: r?.size ?? null,
        uploadedAt: r?.uploaded_at ?? null,
        reviewedBy: r?.reviewed_by ?? null,
        reviewedAt: r?.reviewed_at ?? null,
        note: r?.review_note ?? null,
        fileAvailable: Boolean(r?.storage_key),
      };
    }),
    checks: Object.entries(CHECKS)
      .filter(([k]) => k !== "reference_2" || app.ref2_name)
      .map(([kind, label]) => ({ kind, label, outcome: checks[kind]?.outcome ?? null, note: checks[kind]?.note ?? null, by: checks[kind]?.checked_by ?? null, at: checks[kind]?.checked_at ?? null })),
    profile: p && {
      displayName: p.display_name, intro: p.intro, locality: p.locality, emergencyName: p.emergency_name, emergencyPhone: p.emergency_phone,
      availability: p.availability, consentAt: p.consent_at, conductAgreedAt: p.conduct_agreed_at, submittedAt: p.submitted_at,
    },
    link: activeBuddyLink(app.id),
    approvalGaps: approvalGaps(app),
  };
}

/** The applicant's view: their own checklist and details — no reviewer names. */
export function buddyView(app) {
  const docs = latestDocs(app.id);
  const p = profileFor(app.id);
  return {
    firstName: app.full_name.split(" ")[0],
    status: app.status,
    documents: Object.entries(DOCS).map(([kind, d]) => {
      const r = docs[kind];
      const status = r?.status === "replaced" || r?.status === "expired" || !r ? "missing" : r.status;
      return { kind, label: d.label, hint: d.hint, required: d.required, status, note: status === "rejected" ? r.review_note : null, canUpload: status !== "accepted" };
    }),
    profile: {
      displayName: p?.display_name ?? app.full_name,
      intro: p?.intro ?? "",
      locality: p?.locality ?? "",
      emergencyName: p?.emergency_name ?? "",
      emergencyPhone: p?.emergency_phone ?? "",
      availability: p?.availability ?? "",
      consent: Boolean(p?.consent_at),
      conduct: Boolean(p?.conduct_agreed_at),
    },
    submittedAt: p?.submitted_at ?? null,
    gaps: buddyGaps(app),
  };
}

/** Never-reviewed files don't linger: deleted after 30 days, row kept as "expired". */
export function expireUnreviewedDocs() {
  const old = db
    .prepare("SELECT id, storage_key FROM buddy_documents WHERE status = 'uploaded' AND uploaded_at < datetime('now', ?)")
    .all(`-${UNREVIEWED_DAYS} days`);
  for (const d of old) {
    deleteEncrypted(d.storage_key);
    db.prepare("UPDATE buddy_documents SET status = 'expired', storage_key = NULL, file_deleted_at = datetime('now') WHERE id = ?").run(d.id);
  }
  return old.length;
}

export function startDocumentCleanup() {
  const tick = () => {
    try {
      const n = expireUnreviewedDocs();
      if (n) console.log(`[docs] deleted ${n} unreviewed document(s) after ${UNREVIEWED_DAYS} days`);
    } catch (err) {
      console.error(`[docs] cleanup failed: ${err.message}`);
    }
  };
  tick();
  setInterval(tick, 3_600_000).unref();
}
