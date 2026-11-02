import { db } from "./db.js";
import { s1DueAt, parseDb } from "./leadPipeline.js";
import { notifyOverdueLead } from "./notify.js";

// FR-SVC-04: a lead with no reply past its S1 due time alerts the on-duty
// team once. Checked every minute; only leads from the last day, so a restart
// after downtime doesn't page anyone about week-old enquiries.
const CHECK_MS = 60_000;

export function checkS1Breaches(now = new Date()) {
  const waiting = db
    .prepare(
      `SELECT reference, type, context, service, full_name AS fullName, email, phone, created_at AS createdAt
       FROM leads
       WHERE status = 'new' AND first_response_at IS NULL AND s1_alerted_at IS NULL
         AND created_at >= datetime('now', '-1 day')`,
    )
    .all();
  const mark = db.prepare("UPDATE leads SET s1_alerted_at = datetime('now') WHERE reference = ? AND s1_alerted_at IS NULL");
  let sent = 0;
  for (const lead of waiting) {
    const created = parseDb(lead.createdAt);
    if (now <= s1DueAt(created)) continue;
    // Mark first so a slow send can't trigger a second alert on the next tick.
    if (!mark.run(lead.reference).changes) continue;
    notifyOverdueLead(lead, Math.round((now - created) / 60_000));
    sent++;
  }
  return sent;
}

export function startSlaWatch() {
  const tick = () => {
    try {
      checkS1Breaches();
    } catch (err) {
      console.error(`[sla] check failed: ${err.message}`);
    }
  };
  tick();
  setInterval(tick, CHECK_MS).unref();
}
