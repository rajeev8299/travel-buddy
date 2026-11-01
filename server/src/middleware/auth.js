import { getSessionUser } from "../auth.js";

// Every route that needs to know who's calling goes through these, so the
// session check (signature, expiry, token version, user still exists) lives
// in one place. The user row is attached as req.user.

/** Attaches req.user (or null) without rejecting anyone. */
export function loadUser(req, res, next) {
  req.user = getSessionUser(req);
  next();
}

/** 401 unless the request carries a valid session. */
export function requireAuth(req, res, next) {
  req.user ??= getSessionUser(req);
  if (!req.user) return res.status(401).json({ message: "Sign in first." });
  next();
}

/** 401 without a session, 403 when the user's role isn't one of `roles`.
 *  The role is read from the database on every request, never from the token,
 *  so demoting someone takes effect immediately. */
export function requireRole(...roles) {
  return (req, res, next) =>
    requireAuth(req, res, () => {
      if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Admins only." });
      next();
    });
}

export const requireAdmin = requireRole("admin");
