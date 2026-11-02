import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { db } from "../../db.js";
import { heroSlideSrc } from "../../heroSlideSrc.js";
import { uploadHeroImage, uploadsDir, isRealImage } from "../../uploads.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParam, NUMERIC_ID } from "../../middleware/validate.js";

const router = Router();
router.param("id", validateParam("id", NUMERIC_ID));

function isValidPos(pos) {
  if (typeof pos !== "string") return false;
  const trimmed = pos.trim();
  if (!trimmed || trimmed.length > 50) return false;
  // Common valid formats: 'center 50%', '50% 50%', 'top left', 'center', 'right 40%', etc.
  return /^[a-zA-Z0-9\s%.-]+$/.test(trimmed);
}

function deleteUploadedFile(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return;
  // Security guard against directory traversal
  const safeBase = path.basename(imagePath);
  const full = path.join(uploadsDir, "hero", safeBase);
  fs.unlink(full, () => {}); // best-effort
}

function nextSortOrder() {
  const row = db.prepare("SELECT MAX(sort_order) AS max FROM hero_slides").get();
  return (row.max ?? -1) + 1;
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM hero_slides ORDER BY sort_order").all();
  res.json({
    slides: rows.map((r) => ({
      id: r.id,
      pos: r.pos,
      source: r.source,
      sortOrder: r.sort_order,
      src: heroSlideSrc(r, req),
    })),
  });
});

router.post(
  "/",
  uploadHeroImage.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "An image file is required." });
    if (!isRealImage(req.file.path)) {
      deleteUploadedFile(`hero/${req.file.filename}`);
      return res.status(400).json({ message: "That file isn't a JPEG, PNG or WEBP image." });
    }
    const rawPos = (req.body?.pos || "center 50%").trim();
    if (!isValidPos(rawPos)) {
      if (req.file) deleteUploadedFile(`hero/${req.file.filename}`);
      return res.status(400).json({ message: "Invalid focal position format. Example: 'center 50%'" });
    }
    const pos = rawPos;
    const imagePath = `hero/${req.file.filename}`;

    const result = db
      .prepare("INSERT INTO hero_slides (source, image_path, pos, sort_order) VALUES ('upload', ?, ?, ?)")
      .run(imagePath, pos, nextSortOrder());

    const row = db.prepare("SELECT * FROM hero_slides WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ slide: { id: row.id, pos: row.pos, source: row.source, sortOrder: row.sort_order, src: heroSlideSrc(row, req) } });
  }),
);

// Reordering (drag/move) posts the full desired id order — declared before
// "/:id" so Express doesn't try to parse "reorder" as a numeric id.
router.put(
  "/reorder",
  validateBody({ order: { type: "ids", maxItems: 200, label: "Order" } }),
  asyncHandler(async (req, res) => {
    const order = req.body?.order;
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: "order must be a non-empty array of slide ids." });
    }

    // Verify all IDs are valid numbers and exist
    const numericIds = order.map(Number);
    if (numericIds.some(isNaN)) {
      return res.status(400).json({ message: "order must contain valid numeric IDs." });
    }

    // Transactionally update sort orders to prevent corrupted states
    db.exec("BEGIN TRANSACTION;");
    try {
      const update = db.prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?");
      numericIds.forEach((id, i) => update.run(i, id));
      db.exec("COMMIT;");
      res.json({ ok: true });
    } catch (err) {
      db.exec("ROLLBACK;");
      throw err;
    }
  }),
);

router.put(
  "/:id",
  uploadHeroImage.single("image"),
  asyncHandler(async (req, res) => {
    // Multer has already saved any new image by now, so every early return
    // has to remove it or it's left orphaned in uploads/.
    const discardUpload = () => req.file && deleteUploadedFile(req.file.filename);
    if (req.file && !isRealImage(req.file.path)) {
      discardUpload();
      return res.status(400).json({ message: "That file isn't a JPEG, PNG or WEBP image." });
    }

    const existing = db.prepare("SELECT * FROM hero_slides WHERE id = ?").get(req.params.id);
    if (!existing) {
      discardUpload();
      return res.status(404).json({ message: "Slide not found." });
    }

    const rawPos = typeof req.body?.pos === "string" ? req.body.pos.trim() : existing.pos;
    if (!isValidPos(rawPos)) {
      discardUpload();
      return res.status(400).json({ message: "Invalid focal position format. Example: 'center 50%'" });
    }
    const pos = rawPos;
    let source = existing.source;
    let imagePath = existing.image_path;

    if (req.file) {
      if (existing.source === "upload") deleteUploadedFile(existing.image_path);
      source = "upload";
      imagePath = `hero/${req.file.filename}`;
    }

    db.prepare("UPDATE hero_slides SET pos = ?, source = ?, image_path = ? WHERE id = ?").run(
      pos,
      source,
      imagePath,
      req.params.id,
    );

    const row = db.prepare("SELECT * FROM hero_slides WHERE id = ?").get(req.params.id);
    res.json({ slide: { id: row.id, pos: row.pos, source: row.source, sortOrder: row.sort_order, src: heroSlideSrc(row, req) } });
  }),
);

router.delete("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM hero_slides WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ message: "Slide not found." });

  db.prepare("DELETE FROM hero_slides WHERE id = ?").run(req.params.id);
  if (existing.source === "upload") deleteUploadedFile(existing.image_path);

  res.json({ ok: true });
});

export default router;
