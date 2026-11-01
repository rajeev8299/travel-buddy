import { Router } from "express";
import { db } from "../../db.js";
import { validateBody, validateParam, text, REFERENCE_ID } from "../../middleware/validate.js";

const router = Router();
router.param("id", validateParam("id", REFERENCE_ID));

router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, where_to AS whereTo, arrive, depart, nights, who,
              full_name AS fullName, email, phone, style, pace, special_requests AS specialRequests,
              buddy_name AS buddyName, status, created_at AS createdAt
       FROM plan_requests ORDER BY created_at DESC`,
    )
    .all();
  res.json({ planRequests: rows });
});

router.patch("/:id/status", validateBody({ status: text(20, "Status") }), (req, res) => {
  const { status } = req.body || {};
  if (!["pending", "confirmed", "contacted", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const result = db.prepare("UPDATE plan_requests SET status = ? WHERE id = ?").run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: "Plan request not found." });

  res.json({ ok: true, status });
});

export default router;
