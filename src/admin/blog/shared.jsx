// Shared wording for the blog workflow (FR-BLOG-03). Every state says what
// happens next, so writers, editors and admins know whose turn it is.
export const STATE = {
  draft: { label: "Draft", tone: "muted", next: "The writer is working on it. Submit it when it's ready for an editor." },
  submitted: { label: "Submitted", tone: "info", next: "Waiting for an editor to start the review." },
  in_review: { label: "Editorial review", tone: "info", next: "An editor is reviewing and may edit it, then sends it to fact check or back with changes." },
  changes_requested: { label: "Changes requested", tone: "warn", next: "Back with the writer: read the comments, make the changes and submit again." },
  fact_check: { label: "Fact check", tone: "info", next: "Checking every practical fact against a source. Set the verified date and sources, then mark it verified." },
  verified: { label: "Awaiting approval", tone: "info", next: "Facts verified. An admin who didn't write or edit it must approve it." },
  approved: { label: "Approved", tone: "good", next: "Approved. An admin can publish it now or schedule it." },
  scheduled: { label: "Scheduled", tone: "good", next: "Will go live at the scheduled time if it's still approved and the fact check is still recent." },
  published: { label: "Published", tone: "good", next: "This is the live version." },
  superseded: { label: "Replaced", tone: "muted", next: "An earlier live version, replaced by a newer one." },
  discarded: { label: "Discarded", tone: "muted", next: "Abandoned. You can restore its content as a new draft." },
};

export const ACTION = {
  submit: { label: "Submit for review", primary: true },
  withdraw: { label: "Withdraw to draft" },
  start_review: { label: "Start review", primary: true },
  send_to_fact_check: { label: "Send to fact check", primary: true },
  verify: { label: "Mark facts verified", primary: true },
  request_changes: { label: "Request changes", needsComment: true },
  reopen: { label: "Reopen for edits", confirm: "Reopening clears the approval and any schedule. Continue?" },
  approve: { label: "Approve", primary: true },
  publish: { label: "Publish now", primary: true, confirm: "Publish this revision on the website now?" },
  schedule: { label: "Schedule" },
  unschedule: { label: "Cancel schedule" },
  discard: { label: "Discard", danger: true, confirm: "Discard this revision? Its content stays in the history and can be restored." },
};

export const HISTORY = {
  create: "Created",
  comment: "Commented",
  submit: "Submitted",
  withdraw: "Withdrew to draft",
  discard: "Discarded",
  start_review: "Started review",
  send_to_fact_check: "Sent to fact check",
  verify: "Verified facts",
  request_changes: "Requested changes",
  reopen: "Reopened",
  approve: "Approved",
  publish: "Published",
  publish_blocked: "Scheduled publish stopped",
  schedule: "Scheduled",
  unschedule: "Cancelled schedule",
  new_revision: "Started an update",
  restore: "Restored",
  archive: "Archived the article",
  unarchive: "Unarchived the article",
};

// SQLite timestamps are UTC without a zone.
export const parseUtc = (s) => (s ? new Date(/[TZ]/.test(s) ? s : `${s.replace(" ", "T")}Z`) : null);
export const when = (s) =>
  parseUtc(s)?.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) ?? "—";

/** API-relative upload paths → absolute URLs for <img> in the admin. */
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");
const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || "http://localhost:3100").replace(/\/$/, "");
export const mediaUrl = (u) => (!u ? "" : u.startsWith("/uploads/") ? `${API_ORIGIN}${u}` : u.startsWith("/img/") ? `${SITE_ORIGIN}${u}` : u);

export function StateBadge({ state }) {
  const s = STATE[state] ?? { label: state, tone: "muted" };
  return <span className={`admin-badge admin-badge--state-${s.tone}`}>{s.label}</span>;
}
