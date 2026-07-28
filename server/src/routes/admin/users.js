import { Router } from "express";
import { db } from "../../db.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, full_name AS fullName, email, phone, role, city, company, created_at AS createdAt
       FROM users ORDER BY created_at DESC`,
    )
    .all();
  res.json({ users: rows });
});

export default router;
