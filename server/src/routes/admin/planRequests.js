import { Router } from "express";
import { db } from "../../db.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, where_to AS whereTo, arrive, depart, nights, who, created_at AS createdAt
       FROM plan_requests ORDER BY created_at DESC`,
    )
    .all();
  res.json({ planRequests: rows });
});

export default router;
