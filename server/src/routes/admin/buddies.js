import { Router } from "express";
import { db } from "../../db.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = Router();

function validate(v) {
  if (!v.name?.trim()) return "Name is required.";
  if (!v.city?.trim()) return "City is required.";
  if (v.years === undefined || Number(v.years) < 0) return "Years must be a positive number.";
  if (v.rating === undefined || Number(v.rating) < 0 || Number(v.rating) > 5)
    return "Rating must be between 0 and 5.";
  if (!v.tongue?.trim()) return "Languages spoken (tongue) is required.";
  if (!/^#[0-9a-fA-F]{6}$/.test(v.hue || "")) return "Hue must be a hex color like #8E5AA8.";
  return null;
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM buddies ORDER BY id").all();
  res.json({ buddies: rows });
});

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const v = req.body || {};
    const error = validate(v);
    if (error) return res.status(400).json({ message: error });

    const result = db
      .prepare("INSERT INTO buddies (name, city, years, rating, tongue, hue) VALUES (?, ?, ?, ?, ?, ?)")
      .run(v.name.trim(), v.city.trim(), Number(v.years), Number(v.rating), v.tongue.trim(), v.hue);

    const row = db.prepare("SELECT * FROM buddies WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ buddy: row });
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const v = req.body || {};
    const error = validate(v);
    if (error) return res.status(400).json({ message: error });

    const result = db
      .prepare("UPDATE buddies SET name = ?, city = ?, years = ?, rating = ?, tongue = ?, hue = ? WHERE id = ?")
      .run(v.name.trim(), v.city.trim(), Number(v.years), Number(v.rating), v.tongue.trim(), v.hue, req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: "Buddy not found." });

    const row = db.prepare("SELECT * FROM buddies WHERE id = ?").get(req.params.id);
    res.json({ buddy: row });
  }),
);

router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM buddies WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: "Buddy not found." });
  res.json({ ok: true });
});

export default router;
