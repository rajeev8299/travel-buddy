import { Router } from "express";
import { db } from "../../db.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = Router();
const STATUSES = ["pending", "approved", "rejected"];

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
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(", ")}.` });
    }

    const result = db
      .prepare("UPDATE buddy_applications SET status = ? WHERE id = ?")
      .run(status, req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: "Application not found." });

    res.json({ ok: true, status });
  }),
);

export default router;
