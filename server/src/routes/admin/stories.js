import { Router } from "express";
import { db } from "../../db.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParam, text, NUMERIC_ID } from "../../middleware/validate.js";

const router = Router();
router.param("id", validateParam("id", NUMERIC_ID));
const validateFields = validateBody({
  quote: text(1000, "Quote"),
  name: text(80, "Name"),
  trip: text(80, "Trip"),
});

function validate(v) {
  if (!v.quote?.trim()) return "Quote is required.";
  if (!v.name?.trim()) return "Name is required.";
  if (!v.trip?.trim()) return "Trip is required.";
  return null;
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM stories ORDER BY id").all();
  res.json({ stories: rows });
});

router.post(
  "/",
  validateFields,
  asyncHandler(async (req, res) => {
    const v = req.body || {};
    const error = validate(v);
    if (error) return res.status(400).json({ message: error });

    const result = db
      .prepare("INSERT INTO stories (quote, name, trip) VALUES (?, ?, ?)")
      .run(v.quote.trim(), v.name.trim(), v.trip.trim());

    const row = db.prepare("SELECT * FROM stories WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ story: row });
  }),
);

router.put(
  "/:id",
  validateFields,
  asyncHandler(async (req, res) => {
    const v = req.body || {};
    const error = validate(v);
    if (error) return res.status(400).json({ message: error });

    const result = db
      .prepare("UPDATE stories SET quote = ?, name = ?, trip = ? WHERE id = ?")
      .run(v.quote.trim(), v.name.trim(), v.trip.trim(), req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: "Story not found." });

    const row = db.prepare("SELECT * FROM stories WHERE id = ?").get(req.params.id);
    res.json({ story: row });
  }),
);

router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM stories WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: "Story not found." });
  res.json({ ok: true });
});

export default router;
