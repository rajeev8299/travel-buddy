import nodemailer from "nodemailer";
import { db } from "./db.js";

// Tells the team (and the customer) about new enquiries the moment they land,
// instead of someone having to check the admin panel.
//
// Every channel is optional and switched on by its env vars — with none set,
// enquiries are only logged (reference + type, no personal data):
//   Email:    SMTP_URL (e.g. smtps://user:pass@smtp.zoho.in:465), MAIL_FROM,
//             NOTIFY_EMAIL_TO (team inbox; comma-separated for several)
//   WhatsApp: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_NOTIFY_TO
//             (team number, e.g. 919876543210), WHATSAPP_TEMPLATE — an approved
//             template with 3 body variables: {{1}} kind, {{2}} reference,
//             {{3}} name. WhatsApp only allows business-initiated messages
//             through approved templates.
//
// Sending never blocks or fails the request that triggered it.

const SITE_NAME = "TravelOnBuddy";
const TIMEOUT_MS = 8000;

let transport;
function mailer() {
  if (!process.env.SMTP_URL) return null;
  transport ??= nodemailer.createTransport(process.env.SMTP_URL, {
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: TIMEOUT_MS,
  });
  return transport;
}

const line = (label, value) => (value ? `${label}: ${value}\n` : "");

function teamEmail(kind, e) {
  return {
    subject: `New ${kind} — ${e.reference}`,
    text:
      `A new ${kind} just came in.\n\n` +
      line("Reference", e.reference) +
      line("Name", e.fullName) +
      line("Email", e.email) +
      line("Phone", e.phone) +
      line("Where", e.where) +
      line("Dates", e.arrive && e.depart ? `${e.arrive} → ${e.depart}` : e.arrive || "") +
      line("Travellers", e.who) +
      line("Notes", e.specialRequests) +
      `\nOpen the admin panel to follow up.\n`,
  };
}

function customerEmail(kind, e) {
  // Enquiries from the Varanasi Trip Companion site: their own wording, plus the
  // private link to follow the request.
  if (e.isLead) {
    return {
      subject: `We've got your ${kind} — ${e.reference}`,
      text:
        `Namaste ${e.fullName?.split(" ")[0] || ""},\n\n` +
        `Thanks — your ${kind} is in. Your reference is ${e.reference}.\n\n` +
        `We reply on WhatsApp or email — our target is within 10 minutes between 6am and 10pm IST.\n\n` +
        (e.trackingUrl ? `Follow your request, see your quote and accept it here (a private link — please don't share it):\n${e.trackingUrl}\n\n` : "") +
        `Nothing is booked or paid until you accept a quote and we confirm.\n\n` +
        `— Varanasi Trip Companion\n`,
    };
  }
  const what = kind === "trip request" ? "trip request" : "buddy application";
  const next =
    kind === "trip request"
      ? "A member of our Varanasi team will match you with a local buddy and send a draft plan within 24 hours."
      : "Someone from the buddy team will reply within three working days.";
  return {
    subject: `We've got your ${what} — ${e.reference}`,
    text:
      `Namaste ${e.fullName?.split(" ")[0] || ""},\n\n` +
      `Thanks — your ${what} is in. Your reference is ${e.reference}.\n\n` +
      `${next}\n\n` +
      `If anything changes, just reply to this email and quote your reference.\n\n` +
      `— ${SITE_NAME}, Varanasi\n`,
  };
}

// ------------------------------------------------------------ delivery log
// Every send attempt is recorded (FR-SVC-06): channel, who it was for, what
// kind of message, the reference, and whether it went. Never the message body
// or the recipient's address — errors are scrubbed of emails and numbers.
const logStmt = () =>
  db.prepare("INSERT INTO notification_log (channel, audience, kind, reference, status, error) VALUES (?, ?, ?, ?, ?, ?)");
const scrub = (msg) => String(msg || "").replace(/[^\s@<>"']+@[^\s@<>"']+/g, "<email>").replace(/\d{7,}/g, "<number>").slice(0, 300);

function record(channel, audience, kind, reference, err) {
  try {
    logStmt().run(channel, audience, kind, reference || null, err ? "failed" : "sent", err ? scrub(err.message) : null);
  } catch (logErr) {
    console.error(`[notify] could not record delivery: ${logErr.message}`);
  }
  if (err) console.error(`[notify] ${channel} (${kind}) failed for ${reference}: ${scrub(err.message)}`);
}

/** Send one email and record the outcome. Silent no-op when email isn't set up. */
function deliverEmail(msg, { audience, kind, reference }) {
  const t = mailer();
  if (!t || !msg.to) return Promise.resolve();
  return t
    .sendMail({ from: process.env.MAIL_FROM || `${SITE_NAME} <no-reply@localhost>`, ...msg })
    .then(() => record("email", audience, kind, reference))
    .catch((err) => record("email", audience, kind, reference, err));
}

export const whatsappConfigured = () =>
  ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_NOTIFY_TO", "WHATSAPP_TEMPLATE"].every((k) => process.env[k]);
export const emailConfigured = () => Boolean(process.env.SMTP_URL);

async function sendWhatsApp(kind, e) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_NOTIFY_TO, WHATSAPP_TEMPLATE } = process.env;
  const res = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: WHATSAPP_NOTIFY_TO,
      type: "template",
      template: {
        name: WHATSAPP_TEMPLATE,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
        components: [
          {
            type: "body",
            parameters: [kind, e.reference, e.fullName || "—"].map((text) => ({ type: "text", text: String(text).slice(0, 60) })),
          },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/** Team WhatsApp template message, recorded. No-op when WhatsApp isn't set up. */
function deliverWhatsApp(text, e, kind) {
  if (!whatsappConfigured()) return Promise.resolve();
  return sendWhatsApp(text, e)
    .then(() => record("whatsapp", "team", kind, e.reference))
    .catch((err) => record("whatsapp", "team", kind, e.reference, err));
}

/** Fire-and-forget: call after the response has been decided. */
export function notifyNewEnquiry(kind, enquiry) {
  console.log(`[notify] new ${kind} ${enquiry.reference}`);
  const ctx = { reference: enquiry.reference };
  deliverEmail({ to: process.env.NOTIFY_EMAIL_TO, replyTo: enquiry.email || undefined, ...teamEmail(kind, enquiry) }, { ...ctx, audience: "team", kind: "new enquiry" });
  if (enquiry.email) deliverEmail({ to: enquiry.email, ...customerEmail(kind, enquiry) }, { ...ctx, audience: "customer", kind: "enquiry confirmation" });
  deliverWhatsApp(kind, enquiry, "new enquiry");
}

/** On-duty alert when a lead misses S1 (no reply in time). Team channels only;
 *  the traveller is never emailed about our own lateness. */
export function notifyOverdueLead(lead, minutesWaiting) {
  console.log(`[notify] S1 breach ${lead.reference} (${minutesWaiting} min)`);
  deliverEmail(
    {
      to: process.env.NOTIFY_EMAIL_TO,
      subject: `Reply overdue — ${lead.reference}`,
      text:
        `No one has replied to ${lead.reference} yet. It arrived ${minutesWaiting} minutes ago and the reply target is 10 minutes.\n\n` +
        line("Name", lead.fullName) +
        line("Phone", lead.phone) +
        line("Email", lead.email) +
        line("About", lead.context || lead.service || lead.type) +
        `\nReply now, then set the lead to "Contacted" in the admin panel.\n`,
    },
    { audience: "team", kind: "overdue reply alert", reference: lead.reference },
  );
  deliverWhatsApp(`OVERDUE ${lead.type} enquiry (${minutesWaiting} min, no reply)`, lead, "overdue reply alert");
}

/** A fresh private link, emailed only to the address already on the enquiry. */
export function notifyBookingLink(lead, link) {
  console.log(`[notify] booking link ${lead.reference}`);
  if (!lead.email) return;
  deliverEmail(
    {
      to: lead.email,
      subject: `Your booking request ${lead.reference}`,
      text:
        `Namaste ${lead.full_name?.split(" ")[0] || ""},\n\n` +
        `Here's a new private link to your booking request ${lead.reference}:\n${link.url}\n\n` +
        `It works until ${new Date(link.expiresAt).toDateString()}. Please don't share it. If you didn't ask for this, you can ignore it.\n\n` +
        `— Varanasi Trip Companion\n`,
    },
    { audience: "customer", kind: "booking link", reference: lead.reference },
  );
}

/** The team hears straight away when a customer accepts or declines a quote. */
export function notifyCustomerResponse(lead, decision, reason) {
  console.log(`[notify] customer ${decision}ed quote ${lead.reference}`);
  const kind = decision === "accept" ? "quote accepted alert" : "quote declined alert";
  deliverEmail(
    {
      to: process.env.NOTIFY_EMAIL_TO,
      subject: `Customer ${decision === "accept" ? "ACCEPTED" : "declined"} the quote — ${lead.reference}`,
      text:
        `${lead.full_name} ${decision === "accept" ? "accepted" : "declined"} the quote for ${lead.reference} on the booking page.\n` +
        (reason ? `Reason: ${reason}\n` : "") +
        (decision === "accept" ? `\nConfirm with the partner, then mark the booking Confirmed in the admin panel.\n` : ""),
    },
    { audience: "team", kind, reference: lead.reference },
  );
  deliverWhatsApp(`quote ${decision === "accept" ? "ACCEPTED" : "declined"} by customer`, { reference: lead.reference, fullName: lead.full_name }, kind);
}

/** The applicant's private verification link, to the email on their application. */
export function notifyBuddyLink(app, link) {
  console.log(`[notify] buddy verification link ${app.id}`);
  deliverEmail(
    {
      to: app.email,
      subject: "Next step: verify your buddy application",
      text:
        `Namaste ${app.full_name?.split(" ")[0] || ""},\n\n` +
        `Thank you for applying to be a local buddy. We'd like to take your application forward.\n\n` +
        `Please upload your documents and complete your details here (a private link — don't share it):\n${link.url}\n\n` +
        `It works until ${new Date(link.expiresAt).toDateString()}. Your documents are encrypted, seen only by our verification team, ` +
        `and deleted as soon as they've been checked.\n\n— Varanasi Trip Companion\n`,
    },
    { audience: "customer", kind: "buddy verification link", reference: app.id },
  );
}

/** Team alert: an applicant has submitted documents for checking. */
export function notifyBuddySubmitted(app) {
  console.log(`[notify] buddy documents submitted ${app.id}`);
  deliverEmail(
    {
      to: process.env.NOTIFY_EMAIL_TO,
      subject: `Buddy documents ready to check — ${app.id}`,
      text: `${app.full_name} has uploaded their verification documents and completed their details.\n\nReview them in the admin panel (Old site → Buddy Applications → ${app.id}). Files are deleted as soon as you accept or reject them.\n`,
    },
    { audience: "team", kind: "buddy documents submitted", reference: app.id },
  );
}
