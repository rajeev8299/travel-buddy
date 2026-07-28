import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT quote, name, trip FROM stories ORDER BY id").all();
  res.json({ stories: rows });
});

export default router;
