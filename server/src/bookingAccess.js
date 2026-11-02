import crypto from "node:crypto";
import { db } from "./db.js";

// Secure "My booking request" access (customer booking tracking).
//
// A customer reaches their request only through a private link with a 256-bit
// random secret; a reference number alone never grants access. Only a SHA-256
// hash of the secret is stored, links expire, and staff can revoke them by
// issuing a new one. The secret travels after the "#" in the link, which
// browsers never send to a server, and the page posts it in a request body —
// so it stays out of access logs and Referer headers.

const LINK_DAYS = 60;
const SITE_URL = () => (process.env.SITE_URL || "http://localhost:3100").replace(/\/$/, "");
const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const TOKEN_RE = /^[\w-]{43}$/; // 32 random bytes, base64url

/** New private link for a lead. `revokeOthers` when staff deliberately replace the link. */
export function issueAccessLink(reference, createdBy, { revokeOthers = false } = {}) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + LINK_DAYS * 86_400_000).toISOString();
  if (revokeOthers) {
    db.prepare("UPDATE lead_access_tokens SET revoked_at = datetime('now') WHERE reference = ? AND revoked_at IS NULL").run(reference);
  }
  db.prepare("INSERT INTO lead_access_tokens (reference, token_hash, created_by, expires_at) VALUES (?, ?, ?, ?)").run(
    reference, hash(token), createdBy, expiresAt,
  );
  return { url: `${SITE_URL()}/my-booking#t=${token}`, expiresAt };
}

/** The lead a link opens, or null when the link is unknown, expired or revoked. */
export function leadForToken(token) {
  if (typeof token !== "string" || !TOKEN_RE.test(token)) return null;
  const row = db
    .prepare("SELECT id, reference FROM lead_access_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?")
    .get(hash(token), new Date().toISOString());
  if (!row) return null;
  db.prepare("UPDATE lead_access_tokens SET last_used_at = datetime('now') WHERE id = ?").run(row.id);
  return db.prepare("SELECT * FROM leads WHERE reference = ?").get(row.reference) ?? null;
}

/** For staff: the newest usable link's dates (never the link itself — it isn't stored). */
export function activeLinkInfo(reference) {
  return (
    db
      .prepare(
        `SELECT created_at AS createdAt, created_by AS createdBy, expires_at AS expiresAt, last_used_at AS lastUsedAt
         FROM lead_access_tokens WHERE reference = ? AND revoked_at IS NULL AND expires_at > ? ORDER BY id DESC LIMIT 1`,
      )
      .get(reference, new Date().toISOString()) ?? null
  );
}

// ------------------------------------------------------- customer's view

const iso = (s) => (s ? `${s.replace(" ", "T")}${/[Zz]|[+-]\d\d:?\d\d$/.test(s) ? "" : "Z"}` : null);

const humanize = (slug) => (/^[a-z0-9-]+$/.test(slug) ? slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()) : slug);

const TYPE = { trip: "Trip plan", service: "Service", experience: "Experience", partner: "Partner application", complaint: "Complaint", general: "General enquiry" };

// Customer-facing timeline. Internal steps (which partners were asked or
// declined, who on the team did what, lost reasons) are left out.
const EVENT = {
  new: "Request received",
  contacted: "We replied",
  partner_accepted: "A local partner accepted your request",
  quote_sent: "Quote sent",
  customer_accepted: "You accepted the quote",
  customer_declined: "You declined the quote",
  confirmed: "Booking confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  lost: "Request closed",
  reopened: "Request reopened",
};

function stage(lead, quote, accepted, declined) {
  switch (lead.status) {
    case "new":
      return { label: "Received", next: "We'll reply on WhatsApp or email — our target is within 10 minutes between 6am and 10pm IST (overnight requests by 7am)." };
    case "contacted":
    case "partner_assigned":
      if (quote && accepted) return { label: "Quote accepted", next: "Thank you. We're confirming everything with the local partner — this page will say Confirmed when it's done." };
      if (quote && declined) return { label: "Quote declined", next: "We've told the team. They may send a revised quote, or contact us if you'd like to talk it through." };
      if (quote) return { label: "Quote ready", next: "Please review the quote below and accept or decline it. Nothing is booked or paid until you accept and we confirm." };
      if (lead.status === "partner_assigned") return { label: "Arranging", next: "We've asked a checked local partner and are waiting for their answer. We'll send you a quote next." };
      return { label: "In progress", next: "We're checking availability with a local partner. We'll send you a quote next." };
    case "confirmed":
      return { label: "Confirmed", next: "Your booking is confirmed. We'll send meeting details and a reminder the day before." };
    case "completed":
      return { label: "Completed", next: "Thank you for travelling with us. We'd love to hear how it went." };
    case "cancelled":
      return { label: "Cancelled", next: "This request was cancelled. If that's unexpected, please contact us." };
    default:
      return { label: "Closed", next: "This request is no longer active. If you'd still like to go ahead, contact us and we'll help." };
  }
}

/** Everything the customer page shows — and nothing else. */
export function customerView(lead) {
  const quote = lead.current_quote_id ? db.prepare("SELECT * FROM lead_quotes WHERE id = ?").get(lead.current_quote_id) : null;
  const accepted = Boolean(quote) && lead.customer_accepted_quote_id === quote.id;
  const declined = Boolean(quote) && !accepted && quote.customer_response === "declined";
  const open = ["contacted", "partner_assigned"].includes(lead.status);
  const timeline = db
    .prepare("SELECT status, changed_at FROM lead_status_history WHERE reference = ? ORDER BY id")
    .all(lead.reference)
    .filter((h) => EVENT[h.status])
    .map((h) => ({ event: EVENT[h.status], at: iso(h.changed_at) }));
  return {
    reference: lead.reference,
    type: TYPE[lead.type] ?? "Enquiry",
    // The page title the visitor came from, else a tidied slug ("sunrise-boat" → "Sunrise boat").
    about: lead.context || [lead.experience, lead.service, lead.item].filter(Boolean).map(humanize).join(" · ") || null,
    arrive: lead.arrive,
    depart: lead.depart,
    travellers: lead.travellers,
    receivedAt: iso(lead.created_at),
    status: lead.status,
    stage: stage(lead, quote, accepted, declined),
    // Shown once the partner has accepted, as agreed; contact details stay with our team.
    partner: lead.partner_name && lead.partner_response === "accepted" ? { name: lead.partner_name } : null,
    quote: quote && {
      id: quote.id,
      amount: quote.amount,
      inclusions: quote.inclusions,
      exclusions: quote.exclusions,
      sentAt: iso(quote.created_at),
      response: accepted ? "accepted" : declined ? "declined" : null,
      respondedAt: accepted ? iso(lead.customer_accepted_at) : declined ? iso(quote.customer_response_at) : null,
      canRespond: open && !accepted && !declined,
    },
    timeline,
  };
}
