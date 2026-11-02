import { Router } from "express";
import { db } from "../../db.js";
import { audit } from "../../audit.js";
import { validateBody, validateParam, UUID } from "../../middleware/validate.js";

const router = Router();
router.param("id", validateParam("id", UUID));

router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.full_name AS fullName, u.email, u.phone, u.role, u.city, u.company, u.created_at AS createdAt, ap.slug AS profileSlug
       FROM users u LEFT JOIN author_profiles ap ON ap.user_id = u.id ORDER BY u.created_at DESC`,
    )
    .all();
  res.json({ users: rows });
});

// Staff roles for the blog (FR-BLOG-02/03): public signup only creates
// user/client accounts; author, editor and admin are granted here, by an admin.
const ROLES = ["user", "client", "author", "editor", "admin"];
router.patch("/:id/role", validateBody({ role: { type: "string", max: 10, enum: ROLES, label: "Role" } }), (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "Choose a role." });
  if (req.params.id === req.user.id) return res.status(409).json({ message: "You can't change your own role — ask another admin." });
  const target = db.prepare("SELECT id, role FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.status(404).json({ message: "User not found." });
  if (target.role === "admin" && role !== "admin" && db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n <= 1) {
    return res.status(409).json({ message: "This is the last admin account." });
  }
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, target.id);
  audit(req.user.id, "user.role_change", target.id, `${target.role} → ${role}`);
  res.json({ ok: true, role });
});

export default router;
