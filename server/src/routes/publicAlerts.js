import { Router } from "express";
import { db } from "../db.js";

// Live "Today in Varanasi" alerts (FR-GUIDE-02). Only alerts that are active
// right now are returned — expired ones disappear on their own.
const router = Router();

router.get("/alerts", (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, title, body, severity, starts_at AS startsAt, ends_at AS endsAt, created_at AS postedAt
       FROM travel_alerts
       WHERE starts_at <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AND ends_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       ORDER BY CASE severity WHEN 'warning' THEN 0 WHEN 'advisory' THEN 1 ELSE 2 END, created_at DESC`,
    )
    .all()
    .map((a) => ({ ...a, postedAt: `${a.postedAt.replace(" ", "T")}Z` }));
  // Revalidate every time (cheap 304s via ETag): a posted or taken-down
  // safety alert must show up straight away, not a minute later.
  res.set("Cache-Control", "no-cache");
  res.json({ alerts: rows });
});

export default router;
