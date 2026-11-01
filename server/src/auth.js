import jwt from "jsonwebtoken";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set — check server/.env");
}
// A short secret can be brute-forced offline from any issued token.
if (JWT_SECRET.length < 32 || JWT_SECRET.startsWith("change-me")) {
  throw new Error("JWT_SECRET must be a random value of at least 32 characters — generate one with `openssl rand -hex 32`.");
}

const COOKIE_NAME = "tob_session";
// Admin sessions reach every applicant's ID details, so they expire sooner.
const SESSION_HOURS = { admin: 12, default: 7 * 24 };

function sessionHours(role) {
  return SESSION_HOURS[role] ?? SESSION_HOURS.default;
}

// `ver` must match users.token_version; bumping that column (logout,
// password change) invalidates every token issued before it.
function signToken(user) {
  return jwt.sign({ sub: user.id, ver: user.token_version }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: `${sessionHours(user.role)}h`,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}

/** Signs a token for `user` (a users row) and sets it as the session cookie. */
export function startSession(res, user) {
  res.cookie(COOKIE_NAME, signToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionHours(user.role) * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

/** Ends every session the user has, on every device. */
export function revokeSessions(userId) {
  db.prepare("UPDATE users SET token_version = token_version + 1 WHERE id = ?").run(userId);
}

/** The signed-in user's row for this request, or null. One query: the token
 *  version check and the user lookup share it. */
export function getSessionUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.sub || !Number.isInteger(payload.ver)) return null;

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
  if (!row || row.token_version !== payload.ver) return null;
  return row;
}
