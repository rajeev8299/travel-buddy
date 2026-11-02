import crypto from "node:crypto";

// Signed, expiring preview links for unpublished revisions. HMAC over the
// revision id and expiry with the server secret: the link can't be forged or
// pointed at another revision, and stops working after PREVIEW_MINUTES.
const PREVIEW_MINUTES = 30;
const key = () => `blog-preview:${process.env.JWT_SECRET}`;
const sign = (payload) => crypto.createHmac("sha256", key()).update(payload).digest("base64url");

export function signPreview(revisionId) {
  const exp = Date.now() + PREVIEW_MINUTES * 60_000;
  const payload = `${revisionId}.${exp}`;
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(exp).toISOString() };
}

/** Revision id for a valid, unexpired token; otherwise null. */
export function verifyPreview(token) {
  const m = /^(\d{1,10})\.(\d{13})\.([\w-]{43})$/.exec(token || "");
  if (!m) return null;
  const expected = Buffer.from(sign(`${m[1]}.${m[2]}`));
  const given = Buffer.from(m[3]);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  if (Number(m[2]) < Date.now()) return null;
  return Number(m[1]);
}
