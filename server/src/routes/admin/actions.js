import { Router } from "express";
import { db } from "../../db.js";
import { leadSla, parseDb } from "../../leadPipeline.js";
import { contributorsOf, VERIFICATION_MAX_AGE_DAYS } from "../../blog/workflow.js";
import { emailConfigured, whatsappConfigured } from "../../notify.js";

// The dashboard's "Needs action" list: everything waiting on the team, each
// item phrased as the next step and linked to the screen where it's done.
// Tones: urgent (a promise to a customer is at risk), warn (should happen
// today), normal (in the queue), info (no action yet, just good to know).
const router = Router();

const MIN = 60_000;
const DAY = 86_400_000;
const OPEN = ["contacted", "partner_assigned"];
const BOOKABLE = new Set(["trip", "service", "experience"]);
const TYPE = { trip: "Trip plan", service: "Service", experience: "Experience", partner: "Partner application", complaint: "Complaint", general: "Enquiry" };
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const ago = (date, now) => {
  const m = Math.round((now - date) / MIN);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
};
const leadHref = (ref) => `/admin/leads?open=${encodeURIComponent(ref)}`;
const RANK = { urgent: 0, warn: 1, normal: 2, info: 3 };
// Within a tone, `first` items (a customer waiting on us right now) lead; then oldest first.
const byTone = (a, b) => RANK[a.tone] - RANK[b.tone] || (b.first ? 1 : 0) - (a.first ? 1 : 0) || (a.at < b.at ? -1 : 1);

function enquiryActions(now) {
  const leads = db
    .prepare(
      `SELECT l.reference, l.type, l.full_name AS fullName, l.status, l.arrive, l.context, l.experience, l.created_at AS createdAt,
              l.first_response_at AS firstResponseAt, l.confirmed_at AS confirmedAt, l.partner_name AS partnerName,
              l.partner_asked_at AS partnerAskedAt, l.partner_response AS partnerResponse, l.current_quote_id AS quoteId,
              l.customer_accepted_quote_id AS acceptedQuoteId, q.amount AS quoteAmount, q.created_at AS quotedAt,
              q.customer_response AS quoteResponse, q.customer_response_note AS quoteResponseNote
       FROM leads l LEFT JOIN lead_quotes q ON q.id = l.current_quote_id
       WHERE l.status IN ('new', 'contacted', 'partner_assigned')`,
    )
    .all();

  const replies = [];
  const bookings = [];
  for (const l of leads) {
    const sla = leadSla(l, now);
    const created = parseDb(l.createdAt);
    const about = l.context || l.experience || null;
    const what = about ? `${TYPE[l.type]} · ${about}` : TYPE[l.type];
    const base = { id: l.reference, href: leadHref(l.reference), at: created.toISOString() };
    if (l.status === "new") {
      replies.push({
        ...base,
        tone: sla.s1Breach ? "urgent" : "warn",
        title: `Reply to ${l.fullName}`,
        detail: `${what} · arrived ${ago(created, now)}${sla.s1Breach ? " — reply overdue" : ""}`,
      });
      continue;
    }
    // One next step per booking — the most important one.
    const accepted = l.quoteId && l.acceptedQuoteId === l.quoteId;
    const asked = parseDb(l.partnerAskedAt);
    const quoted = parseDb(l.quotedAt);
    let action = null;
    if (accepted) {
      action = { tone: "urgent", first: true, title: `Confirm booking for ${l.fullName}`, detail: `Customer accepted ${inr(l.quoteAmount)} — confirm with ${l.partnerName}, then mark Confirmed` };
    } else if (l.quoteId && l.quoteResponse === "declined") {
      action = { tone: "warn", title: `Send ${l.fullName} a revised quote`, detail: `Declined ${inr(l.quoteAmount)}${l.quoteResponseNote ? ` — "${l.quoteResponseNote.slice(0, 80)}"` : ""}` };
    } else if (l.partnerName && !l.partnerResponse && asked && now - asked > 30 * MIN) {
      action = { tone: "warn", title: `Chase ${l.partnerName}`, detail: `Asked ${ago(asked, now)} about ${l.fullName}'s ${about ?? TYPE[l.type].toLowerCase()} — no answer yet` };
    } else if (l.quoteId && !accepted && quoted && now - quoted > 2 * DAY) {
      action = { tone: "normal", title: `Follow up on ${l.fullName}'s quote`, detail: `${inr(l.quoteAmount)} sent ${ago(quoted, now)}, no answer yet` };
    } else if (!l.partnerName) {
      action = { tone: "normal", title: `Find a partner for ${l.fullName}`, detail: what };
    } else if (l.partnerResponse === "declined") {
      action = { tone: "warn", title: `Find another partner for ${l.fullName}`, detail: `${l.partnerName} declined` };
    } else if (l.partnerResponse === "accepted" && !l.quoteId) {
      action = { tone: "normal", title: `Send ${l.fullName} a quote`, detail: `${l.partnerName} accepted — record the quote you send` };
    }
    if (action && BOOKABLE.has(l.type) && sla.s2Breach && action.tone !== "urgent") {
      action = { ...action, tone: "urgent", detail: `${action.detail} · confirmation target missed` };
    }
    if (action) bookings.push({ ...base, ...action });
  }
  return { replies: replies.sort(byTone), bookings: bookings.sort(byTone) };
}

function editorialActions(user, now) {
  const revs = db
    .prepare(
      `SELECT r.id, r.post_id, r.state, r.title, r.updated_at, r.scheduled_for FROM blog_revisions r
       JOIN blog_posts p ON p.id = r.post_id
       WHERE r.state IN ('submitted', 'in_review', 'fact_check', 'verified', 'approved', 'scheduled') AND p.archived_at IS NULL`,
    )
    .all();
  const items = [];
  for (const r of revs) {
    const base = { id: `rev-${r.id}`, href: `/admin/blog/${r.post_id}/${r.id}`, at: parseDb(r.updated_at).toISOString() };
    const title = r.title || "Untitled";
    const waiting = ago(parseDb(r.updated_at), now);
    if (r.state === "verified") {
      const mine = contributorsOf(r.id).includes(user.id);
      items.push(
        mine
          ? { ...base, tone: "info", title: `“${title}” needs another admin`, detail: `Facts verified ${waiting}. You worked on it, so someone else must approve` }
          : { ...base, tone: "warn", title: `Approve “${title}”`, detail: `Facts verified ${waiting} — ready for your approval` },
      );
    } else if (r.state === "approved") {
      items.push({ ...base, tone: "normal", title: `Publish or schedule “${title}”`, detail: `Approved ${waiting}` });
    } else if (r.state === "submitted") {
      items.push({ ...base, tone: "normal", title: `Start reviewing “${title}”`, detail: `Submitted ${waiting}` });
    } else if (r.state === "scheduled") {
      items.push({ ...base, tone: "info", title: `“${title}” goes live ${new Date(r.scheduled_for).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}`, detail: "Scheduled — no action needed" });
    } else if (now - parseDb(r.updated_at) > 3 * DAY) {
      items.push({ ...base, tone: "normal", title: `“${title}” has been in ${r.state === "fact_check" ? "fact check" : "review"} for a while`, detail: `No change ${waiting}` });
    }
  }
  return items.sort(byTone);
}

/** Live articles whose fact check will soon be too old to republish, or already is. */
function verificationActions(now) {
  const live = db
    .prepare(
      `SELECT p.id AS postId, r.id AS revId, r.title, r.verified_on FROM blog_posts p JOIN blog_revisions r ON r.id = p.live_revision_id
       WHERE p.archived_at IS NULL AND r.state = 'published' AND r.verified_on IS NOT NULL`,
    )
    .all();
  const items = [];
  for (const p of live) {
    const left = Math.floor(VERIFICATION_MAX_AGE_DAYS - (now - new Date(`${p.verified_on}T00:00:00Z`)) / DAY);
    if (left > 30) continue;
    items.push({
      id: `ver-${p.postId}`,
      href: `/admin/blog/${p.postId}/${p.revId}`,
      at: p.verified_on,
      tone: left < 0 ? "urgent" : left <= 7 ? "warn" : "normal",
      title: left < 0 ? `Re-check facts in “${p.title}”` : `Fact check for “${p.title}” expires in ${left} day${left === 1 ? "" : "s"}`,
      detail: `Last checked ${p.verified_on}. Start an update and send it through fact check${left < 0 ? " — it can't be republished until then" : ""}`,
    });
  }
  return items.sort(byTone);
}

/** Failed sends in the last week, and channels that aren't set up at all. */
function deliveryActions() {
  const items = [];
  if (!emailConfigured()) {
    items.push({ id: "cfg-email", tone: "warn", title: "Email isn't set up", detail: "Enquiry confirmations, booking links and team alerts aren't being emailed. See DEPLOY.md → Enquiry notifications.", href: null, at: "" });
  }
  if (!whatsappConfigured()) {
    items.push({ id: "cfg-whatsapp", tone: "info", title: "WhatsApp alerts aren't set up", detail: "The team isn't alerted on WhatsApp about new enquiries or overdue replies.", href: null, at: "" });
  }
  const failed = db
    .prepare(
      `SELECT id, channel, audience, kind, reference, error, created_at FROM notification_log
       WHERE status = 'failed' AND created_at >= datetime('now', '-7 days') ORDER BY id DESC LIMIT 50`,
    )
    .all();
  for (const f of failed) {
    items.push({
      id: `ntf-${f.id}`,
      tone: f.audience === "customer" ? "urgent" : "warn",
      title: `${f.channel === "email" ? "Email" : "WhatsApp"} to ${f.audience === "customer" ? "the customer" : "the team"} failed: ${f.kind}`,
      detail: `${f.reference ?? "No reference"} · ${new Date(`${f.created_at.replace(" ", "T")}Z`).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}${f.error ? ` · ${f.error}` : ""}${f.audience === "customer" ? " — contact them another way" : ""}`,
      href: f.reference && /^(TOB|VTC)-/.test(f.reference) ? leadHref(f.reference) : null,
      at: f.created_at,
    });
  }
  return items.sort(byTone);
}

router.get("/", (req, res) => {
  const now = new Date();
  const { replies, bookings } = enquiryActions(now);
  const groups = [
    { key: "replies", title: "New enquiries", empty: "No one is waiting for a first reply.", items: replies },
    { key: "bookings", title: "Bookings needing a next step", empty: "Every open booking is waiting on someone else.", items: bookings },
    { key: "editorial", title: "Articles", empty: "No articles are waiting on you.", items: editorialActions(req.user, now) },
    { key: "verification", title: "Fact checks expiring", empty: "No published article's fact check expires in the next 30 days.", items: verificationActions(now) },
    { key: "delivery", title: "Message delivery", empty: "No failed messages in the last 7 days.", items: deliveryActions() },
  ];
  res.json({ generatedAt: now.toISOString(), groups });
});

export default router;
