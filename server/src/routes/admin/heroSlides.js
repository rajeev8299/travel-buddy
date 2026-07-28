import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { db } from "../../db.js";
import { heroSlideSrc } from "../../heroSlideSrc.js";
import { uploadHeroImage, uploadsDir } from "../../uploads.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = Router();

function deleteUploadedFile(imagePath) {
  const full = path.join(uploadsDir, imagePath);
  fs.unlink(full, () => {}); // best-effort — a missing file isn't worth failing the request over
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
    const pos = (req.body?.pos || "center 50%").trim();
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
  asyncHandler(async (req, res) => {
    const order = req.body?.order;
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: "order must be a non-empty array of slide ids." });
    }
    const update = db.prepare("UPDATE hero_slides SET sort_order = ? WHERE id = ?");
    order.forEach((id, i) => update.run(i, id));
    res.json({ ok: true });
  }),
);

router.put(
  "/:id",
  uploadHeroImage.single("image"),
  asyncHandler(async (req, res) => {
    const existing = db.prepare("SELECT * FROM hero_slides WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ message: "Slide not found." });

    const pos = req.body?.pos !== undefined ? req.body.pos.trim() : existing.pos;
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
