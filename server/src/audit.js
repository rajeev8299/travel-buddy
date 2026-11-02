import { db } from "./db.js";

/** Append-only record of an administrative change: who, what, to whom. Never
 *  passwords or tokens; field names and short summaries only. */
export function audit(actor, action, subject, detail = null) {
  db.prepare("INSERT INTO audit_log (actor, action, subject, detail) VALUES (?, ?, ?, ?)").run(actor, action, subject ?? null, detail);
}
