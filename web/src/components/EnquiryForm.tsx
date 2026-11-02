"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { API_URL } from "@/lib/site";

type LeadType = "trip" | "service" | "experience" | "partner" | "complaint" | "general";
interface ServiceOption { slug: string; title: string; items: { slug: string; title: string }[] }

const TYPE_LABEL: Record<LeadType, string> = {
  trip: "Help planning my trip",
  service: "A travel service (transfer, guide, boat, stay)",
  experience: "A local experience",
  partner: "I want to partner with you",
  complaint: "A complaint about a booking",
  general: "Something else",
};

/** The page the traveller came from (set by RouteTracker), else the HTTP referrer. */
function previousPage() {
  try {
    const prev = sessionStorage.getItem("vtc-prev-path");
    if (prev) return prev;
  } catch {
    /* storage blocked */
  }
  return document.referrer ? new URL(document.referrer).pathname : "/enquiry";
}

type Errors = Partial<Record<"fullName" | "contact" | "email" | "phone" | "dates" | "travellers" | "consent" | "form", string>>;

/** One key per filled-in form: if the network drops after the server saved the
 *  enquiry, sending again returns the same reference instead of a duplicate. */
function newSubmissionKey() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Today's date in India, as YYYY-MM-DD (the date inputs' earliest choice). */
const istToday = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);

export default function EnquiryForm({ services }: { services: ServiceOption[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const initialType: LeadType =
    (params.get("type") as LeadType) && TYPE_LABEL[params.get("type") as LeadType] ? (params.get("type") as LeadType)
    : params.get("experience") ? "experience"
    : params.get("service") ? (params.get("service") === "assistance" ? "trip" : "service")
    : "general";

  const [type, setType] = useState<LeadType>(initialType);
  const [service, setService] = useState(params.get("service") ?? "");
  const [item, setItem] = useState(params.get("item") ?? "");
  const [context] = useState(params.get("context") ?? "");
  // A plan sent from the trip planner (client-only component, so storage is available).
  const [planText, setPlanText] = useState(() => {
    try {
      return sessionStorage.getItem("vtc-enquiry-plan") ?? "";
    } catch {
      return "";
    }
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const started = useRef(false);
  const submissionKey = useRef<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const onFirstInput = () => {
    if (!started.current) {
      started.current = true;
      track("enquiry_started", { type });
    }
  };

  const items = services.find((s) => s.slug === service)?.items ?? [];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = Object.fromEntries(f.entries()) as Record<string, string>;
    const errs: Errors = {};
    if (!v.fullName?.trim()) errs.fullName = "Tell us your name so we know who to reply to.";
    if (!v.email?.trim() && !v.phone?.trim()) errs.contact = "Add an email or a phone number so we can reply.";
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errs.email = "That email doesn't look complete.";
    if (v.phone && !/^[6-9]\d{9}$/.test(v.phone.replace(/[\s-]/g, ""))) errs.phone = "Enter a 10-digit Indian mobile number.";
    if (v.arrive && v.depart && v.depart < v.arrive) errs.dates = "Departure can't be before arrival.";
    else if (showTravel && v.arrive && v.arrive < istToday()) errs.dates = "The arrival date is in the past — check the dates.";
    if (v.travellers && !/^\d+$/.test(v.travellers.trim())) errs.travellers = "Number of travellers must be a whole number from 1 to 200.";
    else if (v.travellers && (Number(v.travellers) < 1 || Number(v.travellers) > 200)) errs.travellers = "Number of travellers must be a whole number from 1 to 200.";
    if (!f.get("consent")) errs.consent = "Please agree so we can contact you about this enquiry.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSending(true);
    submissionKey.current ??= newSubmissionKey();
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          service: service || undefined,
          item: item || undefined,
          experience: params.get("experience") || undefined,
          context: context || undefined,
          fullName: v.fullName,
          email: v.email || undefined,
          phone: v.phone || undefined,
          travellers: v.travellers ? Number(v.travellers) : undefined,
          arrive: v.arrive || undefined,
          depart: v.depart || undefined,
          message: v.message || undefined,
          planText: planText || undefined,
          sourcePage: previousPage(),
          consent: true,
          idempotencyKey: submissionKey.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Something went wrong — please try again.");
      try { sessionStorage.removeItem("vtc-enquiry-plan"); } catch { /* ignore */ }
      // The private tracking link goes to the receipt via session storage, never
      // in the thank-you page's address (which servers and proxies can log).
      try {
        if (data.trackingUrl) sessionStorage.setItem("vtc-tracking-link", data.trackingUrl);
      } catch { /* storage blocked: the confirmation email still has the link */ }
      router.push(`/enquiry/thank-you?ref=${encodeURIComponent(data.reference)}&about=${encodeURIComponent(context || TYPE_LABEL[type])}`);
    } catch (err) {
      setErrors({ form: err instanceof Error && err.message !== "Failed to fetch" ? err.message : "We couldn't reach our server. Please try again, or email us." });
      setSending(false);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  const errList = Object.values(errors).filter(Boolean);
  const showTravel = type === "trip" || type === "service" || type === "experience";

  return (
    <form onSubmit={submit} noValidate onInput={onFirstInput} className="stack" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "clamp(18px,3vw,28px)" }}>
      {errList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} className="notice notice--warn" role="alert">
          <span aria-hidden="true">!</span>
          <div><strong>Please check the form</strong><ul style={{ margin: "4px 0 0", paddingLeft: "1.2em" }}>{errList.map((e) => <li key={e}>{e}</li>)}</ul></div>
        </div>
      )}

      {context && <p className="badge badge--partner">About: {context}</p>}

      <div className="field">
        <label htmlFor="e-type">What is this about?</label>
        <select id="e-type" value={type} onChange={(e) => setType(e.target.value as LeadType)}>
          {(Object.keys(TYPE_LABEL) as LeadType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
      </div>

      {type === "service" && (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="e-service">Service</label>
            <select id="e-service" value={service} onChange={(e) => { setService(e.target.value); setItem(""); }}>
              <option value="">Choose…</option>
              {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
            </select>
          </div>
          {items.length > 0 && (
            <div className="field">
              <label htmlFor="e-item">Type of service</label>
              <select id="e-item" value={item} onChange={(e) => setItem(e.target.value)}>
                <option value="">Not sure yet</option>
                {items.map((i) => <option key={i.slug} value={i.slug}>{i.title}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="e-name">Your name</label>
          <input id="e-name" name="fullName" autoComplete="name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "e-name-err" : undefined} />
          {errors.fullName && <p id="e-name-err" className="field__error">{errors.fullName}</p>}
        </div>
        <div className="field">
          <label htmlFor="e-email">Email</label>
          <input id="e-email" name="email" type="email" autoComplete="email" aria-invalid={!!(errors.email || errors.contact)} aria-describedby="e-contact-hint" />
          {errors.email && <p className="field__error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="e-phone">Mobile / WhatsApp</label>
          <input id="e-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="98765 43210" aria-invalid={!!(errors.phone || errors.contact)} aria-describedby="e-contact-hint" />
          {errors.phone && <p className="field__error">{errors.phone}</p>}
        </div>
      </div>
      <p id="e-contact-hint" className="field__hint" style={{ marginTop: -6 }}>Email or mobile — whichever you prefer us to reply on.</p>

      {showTravel && (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="e-arrive">Arriving</label>
            <input id="e-arrive" name="arrive" type="date" min={istToday()} aria-invalid={!!errors.dates} />
          </div>
          <div className="field">
            <label htmlFor="e-depart">Leaving</label>
            <input id="e-depart" name="depart" type="date" min={istToday()} aria-invalid={!!errors.dates} />
            {errors.dates && <p className="field__error">{errors.dates}</p>}
          </div>
          <div className="field">
            <label htmlFor="e-trav">Travellers</label>
            <input id="e-trav" name="travellers" type="number" min={1} max={200} step={1} defaultValue={2} aria-invalid={!!errors.travellers} />
            {errors.travellers && <p className="field__error">{errors.travellers}</p>}
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="e-msg">{type === "complaint" ? "What happened? Include your booking reference if you have one." : type === "partner" ? "Tell us about you: what you offer, where, and for how long. (Please don't send ID numbers.)" : "Anything we should know?"}</label>
        <textarea id="e-msg" name="message" rows={5} maxLength={2000} placeholder={type === "trip" || type === "service" ? "e.g. travelling with my parents, need low walking; interested in the Aarti from a boat" : undefined} />
      </div>

      {planText && (
        <details className="factbox">
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>Your trip plan will be attached</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", color: "var(--muted)", marginTop: 10 }}>{planText}</pre>
          <button type="button" className="btn btn--ghost" onClick={() => setPlanText("")}>Don&apos;t attach the plan</button>
        </details>
      )}

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <input type="checkbox" name="consent" style={{ marginTop: 5, width: 20, height: 20 }} aria-invalid={!!errors.consent} />
        <span>I agree that Varanasi Trip Companion may contact me about this enquiry and share the details a partner needs to help. See our <Link href="/privacy">privacy policy</Link>.</span>
      </label>
      {errors.consent && <p className="field__error">{errors.consent}</p>}

      <button type="submit" className="btn btn--primary" disabled={sending}>{sending ? "Sending…" : "Send enquiry"}</button>
      <p className="field__hint">Our reply-time target: within 10 minutes on WhatsApp, 6am–10pm IST. No payment is taken online.</p>
    </form>
  );
}
