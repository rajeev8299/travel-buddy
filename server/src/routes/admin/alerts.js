import { Router } from "express";
import { db } from "../../db.js";
import { validateBody, validateParam, text, NUMERIC_ID } from "../../middleware/validate.js";

// Admin-managed travel alerts. Alerts must expire: at most 72 hours after they
// start (product/05-cms.md), so stale warnings never linger on the site.
const MAX_HOURS = 72;
const router = Router();
router.param("id", validateParam("id", NUMERIC_ID));

router.get("/", (req, res) => {
  res.json({
    alerts: db
      .prepare("SELECT id, title, body, severity, starts_at AS startsAt, ends_at AS endsAt, posted_by AS postedBy, created_at AS createdAt FROM travel_alerts ORDER BY created_at DESC LIMIT 100")
      .all(),
  });
});

router.post(
  "/",
  validateBody({
    title: text(140, "Title"),
    body: text(600, "Details"),
    severity: { type: "string", max: 10, enum: ["info", "advisory", "warning"], label: "Severity" },
    hours: { type: "numeric", label: "Hours" },
  }),
  (req, res) => {
    const { title, body, severity = "info" } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "A short title is required." });
    const hours = Math.min(Math.max(Number(req.body.hours) || 24, 1), MAX_HOURS);
    const start = new Date();
    const end = new Date(start.getTime() + hours * 3600_000);
    const r = db
      .prepare("INSERT INTO travel_alerts (title, body, severity, starts_at, ends_at, posted_by) VALUES (?, ?, ?, ?, ?, ?)")
      .run(title.trim(), body?.trim() || null, severity, start.toISOString(), end.toISOString(), req.user.email);
    res.status(201).json({ id: Number(r.lastInsertRowid), endsAt: end.toISOString() });
  },
);

router.delete("/:id", (req, res) => {
  const r = db.prepare("DELETE FROM travel_alerts WHERE id = ?").run(req.params.id);
  if (!r.changes) return res.status(404).json({ message: "Alert not found." });
  res.json({ ok: true });
});

export default router;
