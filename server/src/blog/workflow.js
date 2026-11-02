import { db } from "../db.js";
import { contentHash, submitProblems, verifyProblems } from "./content.js";
import { refreshSite } from "../siteRefresh.js";

// Editorial workflow (FR-BLOG-02…05):
//   draft → submitted → in_review → fact_check → verified → approved → published
//                                                              ↘ scheduled ↗
// with changes_requested (back to the writer), reopen (locked → in_review),
// withdraw, discard and comment. Rules enforced here, on every call:
//   - authors only touch their own posts; editors and admins see everything
//   - only admins approve, publish, schedule and archive
//   - nobody approves a revision they wrote or edited — admins included
//   - approval covers the exact content: any change after it voids the approval
//   - publishing and scheduled publishing recheck approval and how recent the
//     fact check is at the moment they run

export const OPEN_STATES = ["draft", "submitted", "in_review", "changes_requested", "fact_check", "verified", "approved", "scheduled"];
const WRITER_EDITABLE = ["draft", "changes_requested"];
const EDITOR_EDITABLE = ["draft", "changes_requested", "submitted", "in_review", "fact_check"];
// A fact check older than this has to be redone before the article goes live.
export const VERIFICATION_MAX_AGE_DAYS = Number(process.env.BLOG_VERIFICATION_MAX_AGE_DAYS) || 180;

const isStaffEditor = (u) => u.role === "editor" || u.role === "admin";

export const getPost = (id) => db.prepare("SELECT * FROM blog_posts WHERE id = ?").get(id);
export const getRevision = (id) => db.prepare("SELECT * FROM blog_revisions WHERE id = ?").get(id);
export const contributorsOf = (revisionId) =>
  db.prepare("SELECT user_id FROM blog_revision_contributors WHERE revision_id = ?").all(revisionId).map((r) => r.user_id);

export function canView(user, post) {
  return isStaffEditor(user) || post.author_id === user.id;
}

export function canEdit(user, post, rev) {
  if (isStaffEditor(user)) return EDITOR_EDITABLE.includes(rev.state);
  return post.author_id === user.id && WRITER_EDITABLE.includes(rev.state);
}

export function addContributor(revisionId, userId) {
  db.prepare("INSERT OR IGNORE INTO blog_revision_contributors (revision_id, user_id) VALUES (?, ?)").run(revisionId, userId);
}

export function log(revisionId, userId, action, body = null) {
  db.prepare("INSERT INTO blog_reviews (revision_id, user_id, action, body) VALUES (?, ?, ?, ?)").run(revisionId, userId, action, body);
}

/** `extra` is a fixed SQL fragment from this file; its values are bound via `params`. */
const setState = (revId, state, extra = "", params = []) =>
  db.prepare(`UPDATE blog_revisions SET state = ?, updated_at = datetime('now') ${extra} WHERE id = ?`).run(state, ...params, revId);
const CLEAR_APPROVAL = ", content_hash = NULL, approved_by = NULL, approved_at = NULL, scheduled_for = NULL";

function verificationAgeProblem(rev, now = new Date()) {
  if (!rev.verified_on) return "The facts haven't been verified.";
  const days = (now - new Date(`${rev.verified_on}T00:00:00Z`)) / 86_400_000;
  return days > VERIFICATION_MAX_AGE_DAYS ? `The fact check is from ${rev.verified_on}, more than ${VERIFICATION_MAX_AGE_DAYS} days ago — check the facts again.` : null;
}

/** Why this revision can't go live right now, or null. Run at approval-check time and at publish time. */
export function publishBlocker(rev, post, now = new Date()) {
  if (post.archived_at) return "The post is archived.";
  if (!rev.approved_by || !rev.content_hash) return "The revision isn't approved.";
  if (rev.content_hash !== contentHash(rev, post.slug)) return "The content changed after approval, so it needs approving again.";
  if (contributorsOf(rev.id).includes(rev.approved_by)) return "The approver also worked on this revision; another admin must approve it.";
  return verificationAgeProblem(rev, now);
}

/** Makes `rev` the live revision. Caller has already checked publishBlocker. */
function goLive(rev, post) {
  if (post.live_revision_id && post.live_revision_id !== rev.id) setState(post.live_revision_id, "superseded");
  setState(rev.id, "published", ", published_at = datetime('now'), scheduled_for = NULL");
  db.prepare(
    `UPDATE blog_posts SET live_revision_id = ?, first_published_at = COALESCE(first_published_at, datetime('now')),
       last_published_at = datetime('now') WHERE id = ?`,
  ).run(rev.id, post.id);
  refreshSite("publish");
}

/**
 * The actions this user may take on this revision now, each with whether it
 * needs a comment. The admin UI shows exactly these; `act` re-checks them.
 */
export function allowedActions(user, post, rev) {
  if (!canView(user, post)) return [];
  const own = post.author_id === user.id;
  const editor = isStaffEditor(user);
  const admin = user.role === "admin";
  const a = [];
  const add = (action, ok) => ok && a.push(action);
  add("comment", rev.state !== "discarded");
  add("submit", WRITER_EDITABLE.includes(rev.state) && (own || editor));
  add("withdraw", rev.state === "submitted" && (own || editor));
  add("discard", ["draft", "changes_requested", "submitted"].includes(rev.state) && (own || editor));
  add("start_review", rev.state === "submitted" && editor);
  add("send_to_fact_check", rev.state === "in_review" && editor);
  add("verify", rev.state === "fact_check" && editor);
  add("request_changes", ["submitted", "in_review", "fact_check", "verified", "approved", "scheduled"].includes(rev.state) && editor);
  add("reopen", ["verified", "approved", "scheduled"].includes(rev.state) && editor);
  add("approve", rev.state === "verified" && admin && !contributorsOf(rev.id).includes(user.id));
  add("publish", rev.state === "approved" && admin);
  add("schedule", rev.state === "approved" && admin);
  add("unschedule", rev.state === "scheduled" && admin);
  return a;
}

/** Runs a workflow action. Returns { error, status } or { ok: true }. */
export function act(user, rev, action, { comment, scheduledFor } = {}) {
  const post = getPost(rev.post_id);
  if (!post || !canView(user, post)) return { error: "Not found.", status: 404 };
  if (!allowedActions(user, post, rev).includes(action)) {
    if (action === "approve" && rev.state === "verified" && user.role === "admin") {
      return { error: "You wrote or edited this revision, so another admin has to approve it.", status: 403 };
    }
    return { error: "That step isn't available for this article right now.", status: 409 };
  }
  const note = (comment || "").trim() || null;
  if (["comment", "request_changes"].includes(action) && !note) {
    return { error: action === "comment" ? "Write a comment first." : "Say what needs to change.", status: 400 };
  }

  switch (action) {
    case "comment":
      break;
    case "submit": {
      const problems = submitProblems(rev);
      if (problems.length) return { error: problems.join(" "), problems, status: 400 };
      setState(rev.id, "submitted");
      break;
    }
    case "withdraw":
      setState(rev.id, "draft");
      break;
    case "discard":
      setState(rev.id, "discarded");
      break;
    case "start_review":
      setState(rev.id, "in_review");
      break;
    case "send_to_fact_check":
      setState(rev.id, "fact_check");
      break;
    case "verify": {
      const problems = verifyProblems(rev);
      const stale = rev.verified_on && verificationAgeProblem(rev);
      if (stale) problems.push(stale);
      if (problems.length) return { error: problems.join(" "), problems, status: 400 };
      setState(rev.id, "verified");
      break;
    }
    case "request_changes":
      setState(rev.id, "changes_requested", CLEAR_APPROVAL);
      break;
    case "reopen":
      setState(rev.id, "in_review", CLEAR_APPROVAL);
      break;
    case "approve": {
      const stale = verificationAgeProblem(rev);
      if (stale) return { error: stale, status: 400 };
      setState(rev.id, "approved", ", content_hash = ?, approved_by = ?, approved_at = datetime('now')", [contentHash(rev, post.slug), user.id]);
      break;
    }
    case "publish": {
      const fresh = getRevision(rev.id);
      const blocker = publishBlocker(fresh, post);
      if (blocker) return { error: blocker, status: 409 };
      goLive(fresh, post);
      break;
    }
    case "schedule": {
      const at = new Date(scheduledFor || "");
      if (Number.isNaN(at.getTime())) return { error: "Choose a date and time to publish.", status: 400 };
      if (at <= new Date()) return { error: "Choose a time in the future.", status: 400 };
      if (at - new Date() > 366 * 86_400_000) return { error: "Schedule at most a year ahead.", status: 400 };
      const blocker = publishBlocker(getRevision(rev.id), post);
      if (blocker) return { error: blocker, status: 409 };
      setState(rev.id, "scheduled", ", scheduled_for = ?", [at.toISOString()]);
      break;
    }
    case "unschedule":
      setState(rev.id, "approved", ", scheduled_for = NULL");
      break;
    default:
      return { error: "Unknown action.", status: 400 };
  }
  log(rev.id, user.id, action, action === "schedule" ? `${new Date(scheduledFor).toISOString()}${note ? ` — ${note}` : ""}` : note);
  return { ok: true };
}

/** Any edit to a revision: records the contributor, and an edit to approved
 *  content can't happen (locked states aren't editable), but the hash check at
 *  publish time catches anything that slips past. */
export function applyEdit(user, rev, fields) {
  const cols = Object.keys(fields);
  if (cols.length) {
    db.prepare(`UPDATE blog_revisions SET ${cols.map((c) => `${c} = ?`).join(", ")}, updated_at = datetime('now') WHERE id = ?`).run(
      ...cols.map((c) => fields[c]),
      rev.id,
    );
  }
  addContributor(rev.id, user.id);
}

/** Scheduled publishing (FR-BLOG-04): due revisions go live only if they still
 *  pass every check; otherwise they're sent back with the reason logged. */
export function publishDue(now = new Date()) {
  const due = db.prepare("SELECT * FROM blog_revisions WHERE state = 'scheduled' AND scheduled_for <= ?").all(now.toISOString());
  let published = 0;
  for (const rev of due) {
    const post = getPost(rev.post_id);
    db.exec("BEGIN");
    try {
      const blocker = publishBlocker(rev, post, now);
      if (blocker) {
        const back = rev.verified_on && blocker.startsWith("The fact check") ? "fact_check" : "in_review";
        setState(rev.id, back, CLEAR_APPROVAL);
        log(rev.id, "system", "publish_blocked", blocker);
        console.log(`[blog] scheduled revision ${rev.id} not published: ${blocker}`);
      } else {
        goLive(rev, post);
        log(rev.id, "system", "publish", "Published on schedule.");
        published++;
      }
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      console.error(`[blog] scheduled publish failed for revision ${rev.id}: ${err.message}`);
    }
  }
  return published;
}

export function startBlogScheduler() {
  const tick = () => {
    try {
      publishDue();
    } catch (err) {
      console.error(`[blog] scheduler failed: ${err.message}`);
    }
  };
  tick();
  setInterval(tick, 60_000).unref();
}

export { submitProblems };
