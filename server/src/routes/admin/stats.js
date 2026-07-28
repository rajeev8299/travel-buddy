import { Router } from "express";
import { db } from "../../db.js";

const router = Router();

router.get("/", (req, res) => {
  const users = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  const buddies = db.prepare("SELECT COUNT(*) AS n FROM buddies").get().n;
  const stories = db.prepare("SELECT COUNT(*) AS n FROM stories").get().n;
  const planRequests = db.prepare("SELECT COUNT(*) AS n FROM plan_requests").get().n;

  const byStatus = db
    .prepare("SELECT status, COUNT(*) AS n FROM buddy_applications GROUP BY status")
    .all();
  const applications = { total: 0, pending: 0, approved: 0, rejected: 0 };
  for (const row of byStatus) {
    applications[row.status] = row.n;
    applications.total += row.n;
  }

  res.json({ users, buddies, stories, planRequests, applications });
});

export default router;
