import { Router } from "express";
import multer from "multer";
import { db } from "../db.js";
import { validateBody, text, PHONE } from "../middleware/validate.js";
import { DOCS, MAX_DOC_BYTES, applicationForToken, buddyGaps, buddyView, latestDocs } from "../buddyVerification.js";
import { deleteEncrypted, privateFilesConfigured, saveEncrypted, sniffDocument } from "../privateFiles.js";
import { notifyBuddySubmitted } from "../notify.js";
import { audit } from "../audit.js";

// The shortlisted applicant's side: see the checklist, upload documents,
// complete their details, submit for checking. Every call carries the private
// link's secret; nothing here is reachable with an application reference alone.
const router = Router();
const invalid = (res) => res.status(404).json({ message: "This link isn't valid, has expired, or verification is already complete. Please contact our team." });
const PHONE_RE = /^[6-9]\d{9}$/;

router.post("/view", validateBody({ token: text(64, "Link") }), (req, res) => {
  res.set("Cache-Control", "no-store");
  const app = applicationForToken(req.body.token);
  if (!app) return invalid(res);
  res.json({ verification: buddyView(app), uploadsAvailable: privateFilesConfigured() });
});

router.post(
  "/profile",
  validateBody({
    token: text(64, "Link"),
    displayName: text(80, "Name"),
    intro: text(400, "Introduction"),
    locality: text(80, "Area"),
    emergencyName: text(80, "Emergency contact"),
    emergencyPhone: PHONE,
    availability: text(300, "Availability"),
    consent: { type: "boolean", label: "Consent" },
    conduct: { type: "boolean", label: "Code of conduct" },
  }),
  (req, res) => {
    res.set("Cache-Control", "no-store");
    const app = applicationForToken(req.body.token);
    if (!app) return invalid(res);
    const b = req.body;
    const phone = (b.emergencyPhone || "").replace(/[\s-]/g, "");
    if (phone && !PHONE_RE.test(phone)) return res.status(400).json({ message: "Enter a 10-digit Indian mobile number for your emergency contact." });
    if (phone && phone === app.phone.replace(/[\s-]/g, "")) return res.status(400).json({ message: "Your emergency contact needs to be someone else's number." });
    const clean = (v) => (typeof v === "string" ? v.trim() || null : null);
    db.prepare(
      `INSERT INTO buddy_profiles (application_id, display_name, intro, locality, emergency_name, emergency_phone, availability, consent_at, conduct_agreed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CASE WHEN ? THEN datetime('now') END, CASE WHEN ? THEN datetime('now') END)
       ON CONFLICT (application_id) DO UPDATE SET display_name = excluded.display_name, intro = excluded.intro, locality = excluded.locality,
         emergency_name = excluded.emergency_name, emergency_phone = excluded.emergency_phone, availability = excluded.availability,
         consent_at = CASE WHEN ? THEN COALESCE(buddy_profiles.consent_at, datetime('now')) END,
         conduct_agreed_at = CASE WHEN ? THEN COALESCE(buddy_profiles.conduct_agreed_at, datetime('now')) END,
         updated_at = datetime('now')`,
    ).run(
      app.id, clean(b.displayName), clean(b.intro), clean(b.locality), clean(b.emergencyName), phone || null, clean(b.availability),
      b.consent ? 1 : 0, b.conduct ? 1 : 0, b.consent ? 1 : 0, b.conduct ? 1 : 0,
    );
    res.json({ verification: buddyView(app) });
  },
);

// Memory only: nothing is written until the link, type and size are checked
// and the bytes are encrypted.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_DOC_BYTES, files: 1, fields: 4 } });

router.post("/documents", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err?.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "That file is over 8 MB — please upload a smaller copy." });
    if (err) return next(err);
    res.set("Cache-Control", "no-store");
    const app = applicationForToken(req.body?.token);
    if (!app) return invalid(res);
    if (!privateFilesConfigured()) return res.status(503).json({ message: "Document uploads aren't available right now. Please contact our team." });
    const kind = req.body?.kind;
    if (!Object.hasOwn(DOCS, kind)) return res.status(400).json({ message: "Choose which document this is." });
    if (!req.file) return res.status(400).json({ message: "Choose a file to upload." });
    const mime = sniffDocument(req.file.buffer);
    if (!mime) return res.status(400).json({ message: "Upload a photo (JPEG, PNG, WEBP) or a PDF." });
    if (kind === "photo" && mime === "application/pdf") return res.status(400).json({ message: "Your photo needs to be an image, not a PDF." });
    const current = latestDocs(app.id)[kind];
    if (current?.status === "accepted") return res.status(409).json({ message: "This document has already been checked." });

    const storageKey = saveEncrypted(req.file.buffer);
    db.exec("BEGIN");
    try {
      // A not-yet-reviewed upload being replaced: its file goes now.
      if (current?.status === "uploaded") {
        db.prepare("UPDATE buddy_documents SET status = 'replaced', storage_key = NULL, file_deleted_at = datetime('now') WHERE id = ?").run(current.id);
      }
      db.prepare("INSERT INTO buddy_documents (application_id, kind, status, mime, size, storage_key) VALUES (?, ?, 'uploaded', ?, ?, ?)").run(
        app.id, kind, mime, req.file.size, storageKey,
      );
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      deleteEncrypted(storageKey);
      throw e;
    }
    if (current?.status === "uploaded") deleteEncrypted(current.storage_key);
    audit("applicant", "buddy_document.upload", app.id, `${kind} (${mime}, ${Math.round(req.file.size / 1024)} KB)`);
    res.status(201).json({ verification: buddyView(app) });
  });
});

router.post("/submit", validateBody({ token: text(64, "Link") }), (req, res) => {
  res.set("Cache-Control", "no-store");
  const app = applicationForToken(req.body.token);
  if (!app) return invalid(res);
  const gaps = buddyGaps(app);
  if (gaps.length) return res.status(400).json({ message: "A few things are still needed.", gaps });
  db.prepare("UPDATE buddy_profiles SET submitted_at = datetime('now') WHERE application_id = ?").run(app.id);
  db.prepare("UPDATE buddy_applications SET status = 'under_review' WHERE id = ?").run(app.id);
  audit("applicant", "buddy_verification.submit", app.id, null);
  notifyBuddySubmitted(app);
  res.json({ verification: buddyView({ ...app, status: "under_review" }) });
});

export default router;
