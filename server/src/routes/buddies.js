import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT name, city, years, rating, tongue, hue FROM buddies ORDER BY id").all();
  res.json({ buddies: rows });
});

export default router;
