import { Router } from "express";
import { db } from "../../db.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParam, text, REFERENCE_ID, NUMERIC_ID } from "../../middleware/validate.js";
import { CHECKS, approvalGaps, issueBuddyLink, verificationState } from "../../buddyVerification.js";
import { deleteEncrypted, readDecrypted } from "../../privateFiles.js";
import { notifyBuddyLink } from "../../notify.js";
import { audit } from "../../audit.js";

const router = Router();
router.param("id", validateParam("id", REFERENCE_ID));
router.param("docId", validateParam("docId", NUMERIC_ID));
// pending → docs_requested (private link sent) → under_review (applicant
// submitted) → approved | rejected. Approval needs every check passed.
const STATUSES = ["pending", "docs_requested", "under_review", "approved", "rejected"];
const getApp = (id) => db.prepare("SELECT * FROM buddy_applications WHERE id = ?").get(id);

function parseListRow(row) {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    city: row.city,
    state: row.state,
    guidingYears: row.guidingYears,
    languages: JSON.parse(row.languages || "[]"),
    groupSizes: JSON.parse(row.groupSizes || "[]"),
    firstAid: !!row.firstAid,
    status: row.status,
    createdAt: row.createdAt,
  };
}

function parseDetailRow(row) {
  return {
    ...row,
    languages: JSON.parse(row.languages || "[]"),
    specialities: JSON.parse(row.specialities || "[]"),
    groupSizes: JSON.parse(row.group_sizes || "[]"),
    firstAid: !!row.first_aid,
  };
}

router.get("/", (req, res) => {
  const { status } = req.query;
  const select = `SELECT id, full_name AS fullName, email, phone, city, state,
                    guiding_years AS guidingYears, languages, group_sizes AS groupSizes,
                    first_aid AS firstAid, status, created_at AS createdAt
                  FROM buddy_applications`;
  const rows = status
    ? db.prepare(`${select} WHERE status = ? ORDER BY created_at DESC`).all(status)
    : db.prepare(`${select} ORDER BY created_at DESC`).all();

  res.json({ applications: rows.map(parseListRow) });
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM buddy_applications WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ message: "Application not found." });
  res.json({ application: parseDetailRow(row) });
});

router.patch(
  "/:id",
  validateBody({ status: text(20, "Status") }),
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Approve or reject here; documents are requested with “Request documents”." });
    }
    const app = getApp(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found." });
    if (status === "approved") {
      const gaps = approvalGaps(app);
      if (gaps.length) return res.status(409).json({ message: `Not ready to approve: ${gaps.join(" ")}`, gaps });
    }
    db.exec("BEGIN");
    try {
      db.prepare("UPDATE buddy_applications SET status = ? WHERE id = ?").run(status, app.id);
      if (status !== "approved") {
        // A closed application keeps no documents and no working link.
        for (const d of db.prepare("SELECT id, storage_key FROM buddy_documents WHERE application_id = ? AND storage_key IS NOT NULL").all(app.id)) {
          deleteEncrypted(d.storage_key);
          db.prepare("UPDATE buddy_documents SET status = CASE WHEN status = 'uploaded' THEN 'expired' ELSE status END, storage_key = NULL, file_deleted_at = datetime('now') WHERE id = ?").run(d.id);
        }
        db.prepare("UPDATE buddy_access_tokens SET revoked_at = datetime('now') WHERE application_id = ? AND revoked_at IS NULL").run(app.id);
      }
      audit(req.user.id, "buddy_application.status", app.id, `${app.status} → ${status}`);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
    res.json({ ok: true, status });
  }),
);

// ------------------------------------------------------------ verification

router.get("/:id/verification", (req, res) => {
  const app = getApp(req.params.id);
  if (!app) return res.status(404).json({ message: "Application not found." });
  res.json({ verification: verificationState(app) });
});

// Sends (or re-sends) the private link. The link is returned once — it isn't stored.
router.post("/:id/request-documents", (req, res) => {
  const app = getApp(req.params.id);
  if (!app) return res.status(404).json({ message: "Application not found." });
  if (["approved", "rejected"].includes(app.status)) return res.status(409).json({ message: `This application is already ${app.status}.` });
  const link = issueBuddyLink(app.id, req.user.id);
  if (app.status === "pending") db.prepare("UPDATE buddy_applications SET status = 'docs_requested' WHERE id = ?").run(app.id);
  audit(req.user.id, "buddy_verification.link", app.id, "Private verification link issued; earlier links stopped working");
  notifyBuddyLink(app, link);
  res.status(201).json(link);
});

// Shows one document to an admin. Decrypted in memory, never cached, every view logged.
router.get("/:id/documents/:docId/file", (req, res) => {
  const doc = db.prepare("SELECT * FROM buddy_documents WHERE id = ? AND application_id = ?").get(req.params.docId, req.params.id);
  if (!doc?.storage_key) return res.status(404).json({ message: "This file has already been checked and deleted." });
  const body = readDecrypted(doc.storage_key);
  audit(req.user.id, "buddy_document.view", req.params.id, `${doc.kind} #${doc.id}`);
  res.set({
    "Content-Type": doc.mime,
    "Content-Disposition": `inline; filename="${doc.kind}${doc.mime === "application/pdf" ? ".pdf" : ""}"`,
    "Cache-Control": "no-store, private",
    "X-Content-Type-Options": "nosniff",
    ...(doc.mime.startsWith("image/") ? { "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'" } : {}),
  });
  res.send(body);
});

// Accept or reject, then the file is deleted either way; the row is the record.
router.post(
  "/:id/documents/:docId/review",
  validateBody({ decision: { type: "string", max: 10, enum: ["accept", "reject"], label: "Decision" }, note: text(300, "Note") }),
  (req, res) => {
    const app = getApp(req.params.id);
    const doc = app && db.prepare("SELECT * FROM buddy_documents WHERE id = ? AND application_id = ?").get(req.params.docId, app.id);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    if (doc.status !== "uploaded") return res.status(409).json({ message: "This document has already been reviewed." });
    const { decision } = req.body;
    const note = (req.body.note || "").trim();
    if (!decision) return res.status(400).json({ message: "Accept or reject the document." });
    if (decision === "reject" && !note) return res.status(400).json({ message: "Say what's wrong, so the applicant can fix it (e.g. “Photo is blurry”)." });
    db.exec("BEGIN");
    try {
      db.prepare(
        `UPDATE buddy_documents SET status = ?, reviewed_by = ?, reviewed_at = datetime('now'), review_note = ?, storage_key = NULL,
           file_deleted_at = datetime('now') WHERE id = ?`,
      ).run(decision === "accept" ? "accepted" : "rejected", req.user.email, note || null, doc.id);
      if (decision === "reject") {
        // Back to the applicant to upload again and re-submit.
        db.prepare("UPDATE buddy_applications SET status = 'docs_requested' WHERE id = ? AND status = 'under_review'").run(app.id);
        db.prepare("UPDATE buddy_profiles SET submitted_at = NULL WHERE application_id = ?").run(app.id);
      }
      audit(req.user.id, `buddy_document.${decision}`, app.id, `${doc.kind} #${doc.id}${note ? ` — ${note}` : ""}; file deleted`);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
    deleteEncrypted(doc.storage_key);
    res.json({ verification: verificationState(getApp(app.id)) });
  },
);

router.post(
  "/:id/checks",
  validateBody({ kind: { type: "string", max: 20, enum: Object.keys(CHECKS), label: "Check" }, outcome: { type: "string", max: 10, enum: ["passed", "failed"], label: "Outcome" }, note: text(500, "Note") }),
  (req, res) => {
    const app = getApp(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found." });
    const { kind, outcome } = req.body;
    const note = (req.body.note || "").trim();
    if (!kind || !outcome) return res.status(400).json({ message: "Choose the check and its outcome." });
    if (!note) return res.status(400).json({ message: "Add a short note on what was checked (e.g. who you spoke to)." });
    db.prepare("INSERT INTO buddy_checks (application_id, kind, outcome, note, checked_by) VALUES (?, ?, ?, ?, ?)").run(app.id, kind, outcome, note, req.user.email);
    audit(req.user.id, "buddy_check", app.id, `${CHECKS[kind]}: ${outcome}`);
    res.json({ verification: verificationState(app) });
  },
);

export default router;
