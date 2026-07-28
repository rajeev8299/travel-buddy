import { db } from "../db.js";
import { getUserIdFromRequest } from "../auth.js";

export function requireAdmin(req, res, next) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ message: "Sign in first." });

  const row = db.prepare("SELECT role FROM users WHERE id = ?").get(userId);
  if (!row || row.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }

  req.userId = userId;
  next();
}
