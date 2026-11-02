import { API_URL } from "./site";

// First-party, privacy-friendly events (Requirements.md FR-ANL-01): event name
// plus non-personal properties only — never names, phone numbers, emails or
// free text. Fire-and-forget; failures are ignored.
export type EventName =
  | "page_view" | "search_performed" | "itinerary_viewed" | "itinerary_started" | "itinerary_generated"
  | "itinerary_edited" | "itinerary_saved" | "itinerary_shared" | "itinerary_completed" | "partner_click"
  | "enquiry_started" | "whatsapp_handoff" | "alert_viewed" | "emergency_viewed" | "feedback_submitted" | "article_shared"
  | "booking_viewed" | "quote_responded";

export function track(name: EventName, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  try {
    const utm = new URLSearchParams(window.location.search);
    fetch(`${API_URL}/events`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        page: window.location.pathname,
        referrer: document.referrer ? new URL(document.referrer).hostname : "",
        utm_source: utm.get("utm_source") ?? "",
        utm_medium: utm.get("utm_medium") ?? "",
        props,
      }),
    }).catch(() => {});
  } catch {
    /* never let analytics break the page */
  }
}
