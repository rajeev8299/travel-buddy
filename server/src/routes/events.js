import { Router } from "express";
import { db } from "../db.js";

// First-party analytics (FR-ANL-01). No personal data: every event has an
// explicit list of the properties it may carry, each a short code, a bounded
// number or a yes/no — anything else (names, emails, phones, free text) is
// dropped before it reaches the database. The page path, referrer and UTM
// fields are held to strict formats for the same reason.

const oneOf = (...values) => (v) => (values.includes(v) ? v : undefined);
const intIn = (min, max) => (v) => (Number.isInteger(v) && v >= min && v <= max ? v : undefined);
const bool = (v) => (typeof v === "boolean" ? v : undefined);

const EVENTS = {
  page_view: {},
  search_performed: { results: intIn(0, 1000) },
  itinerary_viewed: {},
  itinerary_started: {},
  itinerary_generated: { days: intIn(1, 5), pace: oneOf("relaxed", "balanced", "full"), seniors: bool, children: bool },
  itinerary_edited: {},
  itinerary_saved: {},
  itinerary_shared: { via: oneOf("link", "whatsapp") },
  itinerary_completed: { via: oneOf("share", "save", "enquiry") },
  partner_click: {},
  enquiry_started: { type: oneOf("trip", "service", "experience", "partner", "complaint", "general") },
  whatsapp_handoff: {},
  alert_viewed: { count: intIn(0, 100) },
  emergency_viewed: {},
  feedback_submitted: {},
  article_shared: { via: oneOf("native", "whatsapp", "facebook", "x", "linkedin", "email", "copy") },
  booking_viewed: { stage: oneOf("new", "contacted", "partner_assigned", "confirmed", "completed", "cancelled", "lost") },
  quote_responded: { decision: oneOf("accept", "decline") },
};

// Something that looks like an email address or a phone number never belongs
// in a path or campaign tag; drop the field rather than store it.
const looksPersonal = (s) => /@|\d{7,}/.test(s);
/** Site path only: no query string or fragment (they can carry anything). */
const cleanPage = (v) => {
  if (typeof v !== "string") return null;
  const path = v.split(/[?#]/)[0];
  return /^\/[\w\-/.%]{0,199}$/.test(path) && !looksPersonal(path) ? path : null;
};
const cleanHost = (v) => (typeof v === "string" && /^[a-z0-9.-]{1,100}$/i.test(v) ? v.toLowerCase() : null);
const cleanTag = (v) => (typeof v === "string" && /^[\w.\-]{1,60}$/.test(v) && !looksPersonal(v) ? v : null);

const router = Router();

router.post("/", (req, res) => {
  const { name, page, referrer, utm_source: utmSource, utm_medium: utmMedium, props } = req.body ?? {};
  const schema = Object.hasOwn(EVENTS, name) ? EVENTS[name] : null;
  if (!schema) return res.status(400).json({ message: "Unknown event." });
  const clean = {};
  if (props && typeof props === "object" && !Array.isArray(props)) {
    for (const [key, check] of Object.entries(schema)) {
      const value = check(props[key]);
      if (value !== undefined) clean[key] = value;
    }
  }
  db.prepare("INSERT INTO analytics_events (name, page, referrer, utm_source, utm_medium, props) VALUES (?, ?, ?, ?, ?, ?)").run(
    name, cleanPage(page), cleanHost(referrer), cleanTag(utmSource), cleanTag(utmMedium), JSON.stringify(clean),
  );
  res.status(204).end();
});

export default router;
