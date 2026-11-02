// Shape checks that run before a route handler: right types, sane sizes,
// nothing unexpected. Routes still own their friendly "this is required"
// messages — this layer stops the junk that used to reach them (arrays where
// strings belong, megabyte-long names) and turned into 500s or bloated rows.
//
// A rule is { type, max, maxItems, enum }:
//   type: "string" | "numeric" (number or numeric string) | "boolean" | "date"
//         (YYYY-MM-DD) | "strings" (array of strings) | "ids" (array of ints)
//   max:  longest allowed string (for "strings", per item)
// Missing, null and "" always pass; requiredness is the route's call.
// Fields without a rule are dropped, so handlers only ever see known keys.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isRealDate = (v) => {
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

function check(value, rule) {
  switch (rule.type) {
    case "string":
      if (typeof value !== "string") return "must be text";
      if (value.length > rule.max) return `must be at most ${rule.max} characters`;
      if (rule.enum && !rule.enum.includes(value)) return `must be one of: ${rule.enum.join(", ")}`;
      return null;
    case "numeric":
      if (typeof value === "number" ? !Number.isFinite(value) : !/^-?\d+(\.\d+)?$/.test(String(value)))
        return "must be a number";
      return null;
    case "boolean":
      return typeof value === "boolean" ? null : "must be true or false";
    case "date":
      // Round-trip through a real calendar: Date.parse("2026-02-30") quietly
      // rolls over to 2 March, so a regex plus Date.parse isn't enough.
      return typeof value === "string" && DATE_RE.test(value) && isRealDate(value) ? null : "must be a real date (YYYY-MM-DD)";
    case "strings":
      if (!Array.isArray(value)) return "must be a list";
      if (value.length > (rule.maxItems ?? 20)) return `can have at most ${rule.maxItems ?? 20} items`;
      if (value.some((v) => typeof v !== "string" || v.length > rule.max)) return "has an invalid item";
      return null;
    case "ids":
      if (!Array.isArray(value)) return "must be a list";
      if (value.length > (rule.maxItems ?? 500)) return `can have at most ${rule.maxItems ?? 500} items`;
      if (value.some((v) => !Number.isInteger(Number(v)) || Number(v) < 1)) return "has an invalid id";
      return null;
    default:
      throw new Error(`Unknown validation type: ${rule.type}`);
  }
}

export function validateBody(rules) {
  return (req, res, next) => {
    const body = req.body ?? {};
    if (typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    const clean = {};
    for (const [field, rule] of Object.entries(rules)) {
      const value = body[field];
      if (value === undefined || value === null || value === "") {
        if (value !== undefined) clean[field] = value;
        continue;
      }
      const problem = check(value, rule);
      if (problem) return res.status(400).json({ message: `${rule.label ?? field} ${problem}.` });
      clean[field] = value;
    }
    req.body = clean;
    next();
  };
}

/** Rejects a malformed :id before it reaches the database. */
export function validateParam(name, pattern) {
  return (req, res, next) => {
    if (!pattern.test(req.params[name] ?? "")) return res.status(400).json({ message: `Invalid ${name}.` });
    next();
  };
}

export const NUMERIC_ID = /^[1-9]\d{0,9}$/;
export const REFERENCE_ID = /^(TOB|VTC)-\d{4}-[A-Z0-9]{5,8}$/;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Shared field shapes, so the same field gets the same limits everywhere.
export const text = (max, label) => ({ type: "string", max, label });
export const EMAIL = text(254, "Email");
export const PHONE = text(20, "Phone");
export const NAME = text(120, "Name");
export const PASSWORD = text(200, "Password");
