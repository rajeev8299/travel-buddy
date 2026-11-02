"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";
import { WHATSAPP_NUMBER } from "@/lib/site";

const noSubscribe = () => () => {};
const readTrackingLink = () => {
  try {
    const url = sessionStorage.getItem("vtc-tracking-link") ?? "";
    return /^https?:\/\/[^\s]+\/my-booking#t=[\w-]{43}$/.test(url) ? url : "";
  } catch {
    return "";
  }
};

export default function ThankYou() {
  const trackingLink = useSyncExternalStore(noSubscribe, readTrackingLink, () => "");
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const about = params.get("about") ?? "";
  const valid = /^(TOB|VTC)-\d{4}-[A-Z0-9]{5,8}$/.test(ref);
  // The hand-off goes to OUR support number with the reference prefilled, so
  // every conversation stays attributed (Requirements.md FR-SVC-03).
  const wa = WHATSAPP_NUMBER && valid
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Namaste! My enquiry reference is ${ref}${about ? ` (${about})` : ""}.`)}`
    : null;

  return (
    <div className="stack">
      {valid ? (
        <div className="factbox" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>Your reference</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600, letterSpacing: "0.04em" }}>{ref}</p>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>Keep this — quote it in any message to us.</p>
        </div>
      ) : (
        <p>Your enquiry was sent.</p>
      )}
      {trackingLink && (
        <div className="notice notice--info">
          <span aria-hidden="true">→</span>
          <div>
            <strong>Follow your request online</strong>
            See its status, review your quote and accept it on your private page. Bookmark it — and please don&apos;t share it. If you gave an email, we&apos;ve sent the link there too.
            <div style={{ marginTop: 10 }}><a className="btn btn--primary" href={trackingLink}>Open my booking request</a></div>
          </div>
        </div>
      )}
      <h2 style={{ fontSize: "1.3rem", marginTop: 24 }}>What happens next</h2>
      <ol style={{ paddingLeft: "1.2em", display: "grid", gap: 8 }}>
        <li>We reply on WhatsApp or email — our target is within 10 minutes, 6am–10pm IST.</li>
        <li>We confirm a checked local partner, the timing and the price.</li>
        <li>You decide. Nothing is booked or paid until you agree.</li>
      </ol>
      {wa && (
        <a className="btn btn--whatsapp" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_handoff")}>Continue on WhatsApp</a>
      )}
      <p style={{ marginTop: 16 }}>While you wait: <Link href="/plan/trip-planner">plan your days</Link> or read <Link href="/travel-guide/today">today&apos;s alerts</Link>.</p>
    </div>
  );
}
