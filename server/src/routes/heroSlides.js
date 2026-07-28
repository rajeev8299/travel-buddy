import { Router } from "express";
import { db } from "../db.js";
import { heroSlideSrc } from "../heroSlideSrc.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM hero_slides ORDER BY sort_order").all();
  res.json({
    slides: rows.map((r) => ({ id: r.id, pos: r.pos, src: heroSlideSrc(r, req) })),
  });
});

export default router;
