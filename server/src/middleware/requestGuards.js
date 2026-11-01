// Request-level checks that sit in front of every API route.

/** The browser origins allowed to call the API with cookies.
 *  CLIENT_ORIGIN may list several, comma-separated. */
export function allowedOrigins() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

/** `Origin: null` is what file:// pages send — but so do sandboxed iframes on
 *  any site, so it's only trusted outside production unless explicitly
 *  enabled with ALLOW_FILE_ORIGIN=true. */
export function allowNullOrigin() {
  if (process.env.ALLOW_FILE_ORIGIN) return process.env.ALLOW_FILE_ORIGIN === "true";
  return process.env.NODE_ENV !== "production";
}

/** cors() origin callback. Requests without an Origin (curl, server-to-
 *  server) pass: they carry no browser cookies to abuse. Disallowed origins
 *  get a 403 from the server itself, not just a blocked response in the
 *  browser — which is also what stops cross-site form posts (CSRF). */
export function corsOrigin() {
  const origins = allowedOrigins();
  const nullOk = allowNullOrigin();
  return (origin, callback) => {
    if (!origin || origins.includes(origin) || (origin === "null" && nullOk)) return callback(null, true);
    callback(Object.assign(new Error("Not allowed by CORS."), { status: 403, expose: true }));
  };
}

/** Writes must be JSON (or multipart for image uploads). An HTML form can't
 *  send application/json, so this closes the classic CSRF route even if a
 *  browser ever skips the Origin header. */
export function requireJsonBody(req, res, next) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();
  const hasBody = Number(req.headers["content-length"] || 0) > 0 || req.headers["transfer-encoding"];
  if (!hasBody || req.is(["application/json", "multipart/form-data"])) return next();
  res.status(415).json({ message: "Send the request body as JSON." });
}

/** TRUST_PROXY: unset = no proxy (the API faces clients directly); a number
 *  = that many proxy hops; anything else is passed to Express as-is (e.g.
 *  "loopback" or a subnet). Without it, behind a proxy every visitor shares
 *  the proxy's IP and therefore one rate-limit bucket. */
export function trustProxySetting() {
  const v = process.env.TRUST_PROXY;
  if (!v) return false;
  return /^\d+$/.test(v) ? Number(v) : v;
}
