import nodemailer from "nodemailer";

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

async function sendEmails(kind, e) {
  const t = mailer();
  if (!t) return;
  const from = process.env.MAIL_FROM || `${SITE_NAME} <no-reply@localhost>`;
  const jobs = [];
  if (process.env.NOTIFY_EMAIL_TO) jobs.push(t.sendMail({ from, to: process.env.NOTIFY_EMAIL_TO, replyTo: e.email || undefined, ...teamEmail(kind, e) }));
  if (e.email) jobs.push(t.sendMail({ from, to: e.email, ...customerEmail(kind, e) }));
  await Promise.all(jobs);
}

async function sendWhatsApp(kind, e) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_NOTIFY_TO, WHATSAPP_TEMPLATE } = process.env;
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_NOTIFY_TO || !WHATSAPP_TEMPLATE) return;
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

/** Fire-and-forget: call after the response has been decided. */
export function notifyNewEnquiry(kind, enquiry) {
  console.log(`[notify] new ${kind} ${enquiry.reference}`);
  for (const [channel, send] of [["email", sendEmails], ["whatsapp", sendWhatsApp]]) {
    send(kind, enquiry).catch((err) => console.error(`[notify] ${channel} failed for ${enquiry.reference}: ${err.message}`));
  }
}
