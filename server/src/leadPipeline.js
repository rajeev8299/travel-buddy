// Lead pipeline rules (Requirements.md FR-SVC-04/05) and the service standards
// they are measured against (§2):
//   S1  first human reply ≤ 10 min, 06:00–22:00 IST; overnight enquiries by 07:00
//   S2  partner confirmed ≤ 2 h; same-day requests ≤ 30 min

export const STATUSES = ["new", "contacted", "partner_assigned", "confirmed", "completed", "cancelled", "lost"];

// Allowed next statuses (QA-01/02). Completed, cancelled and lost are final;
// cancelled or lost leads come back only through an explicit, reasoned reopen.
export const TRANSITIONS = {
  new: ["contacted", "partner_assigned", "cancelled", "lost"],
  contacted: ["partner_assigned", "cancelled", "lost"],
  partner_assigned: ["contacted", "confirmed", "cancelled", "lost"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  lost: [],
};
export const REOPENABLE = ["cancelled", "lost"];

/** What's still missing before a lead can be confirmed; empty when it can be. */
export function confirmationGaps(lead) {
  const gaps = [];
  if (!lead.partner_name) gaps.push("Assign a partner.");
  else if (lead.partner_response !== "accepted") gaps.push("The partner hasn't accepted yet.");
  if (!lead.current_quote_id) gaps.push("Record the quote sent to the customer.");
  else if (lead.customer_accepted_quote_id !== lead.current_quote_id) gaps.push("The customer hasn't accepted the current quote.");
  return gaps;
}
const OPEN = new Set(["new", "contacted", "partner_assigned"]);
// Partner applications, complaints and general questions are not bookings, so
// S2 (partner confirmed) doesn't apply to them.
const BOOKABLE = new Set(["trip", "service", "experience"]);

export const S1_MINUTES = 10;
export const S2_MINUTES = 120;
export const S2_SAME_DAY_MINUTES = 30;
export const PARTNER_RESPONSE_MINUTES = 30; // FR-SVC-05 response-rate window

// Configurable without a code change: LEAD_LOST_REASONS="A,B,C".
export const LOST_REASONS = (
  process.env.LEAD_LOST_REASONS ||
  "No reply from traveller,Price too high,Booked elsewhere,Plans changed,No partner available,Dates not available,Duplicate enquiry,Spam or not genuine,Other"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const MIN = 60_000;
const IST = 330 * MIN; // UTC+05:30, no daylight saving

/** SQLite "YYYY-MM-DD HH:MM:SS" (UTC) or ISO → Date. */
export const parseDb = (s) => (s ? new Date(s.includes("T") ? s : `${s.replace(" ", "T")}Z`) : null);
/** IST calendar date "YYYY-MM-DD" of an instant. */
export const istDate = (d) => new Date(d.getTime() + IST).toISOString().slice(0, 10);

/** When the first reply is due (S1). */
export function s1DueAt(created) {
  const ist = new Date(created.getTime() + IST); // its UTC fields read as IST wall time
  const hour = ist.getUTCHours();
  if (hour >= 6 && hour < 22) return new Date(created.getTime() + S1_MINUTES * MIN);
  const due = new Date(ist);
  due.setUTCHours(7, 0, 0, 0);
  if (hour >= 22) due.setUTCDate(due.getUTCDate() + 1);
  return new Date(due.getTime() - IST);
}

/** When the partner confirmation is due (S2), or null when S2 doesn't apply. */
export function s2DueAt(created, type, arrive) {
  if (!BOOKABLE.has(type)) return null;
  const sameDay = arrive && arrive <= istDate(created);
  return new Date(created.getTime() + (sameDay ? S2_SAME_DAY_MINUTES : S2_MINUTES) * MIN);
}

const minutesBetween = (a, b) => Math.round((b - a) / MIN);

/** Per-lead SLA figures for the admin list and the breach watcher. */
export function leadSla(lead, now = new Date()) {
  const created = parseDb(lead.createdAt);
  const first = parseDb(lead.firstResponseAt);
  const confirmed = parseDb(lead.confirmedAt);
  const s1Due = s1DueAt(created);
  const s2Due = s2DueAt(created, lead.type, lead.arrive);
  return {
    s1DueAt: s1Due.toISOString(),
    s1Minutes: first ? minutesBetween(created, first) : null,
    s1Breach: first ? first > s1Due : now > s1Due,
    s2DueAt: s2Due?.toISOString() ?? null,
    s2Minutes: s2Due && confirmed ? minutesBetween(created, confirmed) : null,
    // Cancelled or lost before confirmation isn't a missed confirmation.
    s2Breach: !s2Due ? false : confirmed ? confirmed > s2Due : OPEN.has(lead.status) && now > s2Due,
  };
}

export function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/** Monday (IST) of the week containing an IST date string. */
export function weekStart(date) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
