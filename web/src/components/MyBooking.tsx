"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";
import { API_URL, CONTACT_EMAIL, WHATSAPP_NUMBER, formatDate } from "@/lib/site";

// The customer's private "My booking request" page. The link's secret is in
// the URL fragment (#t=…), which browsers never send to a server; it's posted
// to the API in the request body. Nothing is cached or shared in a referrer.

interface Quote {
  id: number;
  amount: number;
  inclusions: string;
  exclusions: string | null;
  sentAt: string;
  response: "accepted" | "declined" | null;
  respondedAt: string | null;
  canRespond: boolean;
}
interface Booking {
  reference: string;
  type: string;
  about: string | null;
  arrive: string | null;
  depart: string | null;
  travellers: number | null;
  receivedAt: string;
  status: "new" | "contacted" | "partner_assigned" | "confirmed" | "completed" | "cancelled" | "lost";
  stage: { label: string; next: string };
  partner: { name: string } | null;
  quote: Quote | null;
  timeline: { event: string; at: string }[];
}

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readToken = () => new URLSearchParams(window.location.hash.slice(1)).get("t") ?? "";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const day = (iso: string) => formatDate(iso.slice(0, 10));
const at = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

const STEPS = ["Received", "Being arranged", "Quote", "Confirmed", "Completed"];
function stepIndex(b: Booking) {
  if (b.status === "completed") return 4;
  if (b.status === "confirmed") return 3;
  if (b.quote) return 2;
  if (b.status === "new") return 0;
  return 1;
}

async function post<T>(path: string, body: object): Promise<{ ok: boolean; status: number; data: T & { message?: string } }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    referrerPolicy: "no-referrer",
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

function NewLinkForm() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true);
    try {
      const r = await post<{ message: string }>("/booking/link", { reference: String(f.get("reference") || ""), email: String(f.get("email") || "") });
      setMessage(r.data.message || "Please try again in a few minutes.");
    } catch {
      setMessage("We couldn't reach our server. Please try again, or contact us.");
    } finally {
      setSending(false);
    }
  };
  return (
    <form onSubmit={submit} className="stack" aria-labelledby="newlink-title" style={{ marginTop: 16 }}>
      <h2 id="newlink-title" style={{ fontSize: "1.15rem" }}>Get a new link by email</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="nl-ref">Your reference</label>
          <input id="nl-ref" name="reference" required placeholder="TOB-2026-XXXXXXXX" autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="nl-email">Email you used</label>
          <input id="nl-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div><button type="submit" className="btn btn--primary" disabled={sending}>{sending ? "Sending…" : "Email me a new link"}</button></div>
      <p role="status" aria-live="polite">{message}</p>
    </form>
  );
}

function Help({ reference }: { reference?: string }) {
  const wa = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(reference ? `Namaste! A question about my booking request ${reference}.` : "Namaste! A question about my booking request.")}`
    : null;
  return (
    <section aria-labelledby="help-title" className="factbox" style={{ marginTop: 32 }}>
      <h2 id="help-title">Need help?</h2>
      <p>Our team stays your contact from request to trip.{reference ? ` Quote ${reference} in any message.` : ""}</p>
      <div className="btn-row" style={{ marginTop: 12 }}>
        {wa && <a className="btn btn--whatsapp" href={wa} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>}
        <a className="btn btn--outline" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(reference ? `Booking request ${reference}` : "My booking request")}`}>Email us</a>
      </div>
    </section>
  );
}

function QuoteCard({ quote, onRespond, busy }: { quote: Quote; onRespond: (decision: "accept" | "decline", reason?: string) => void; busy: boolean }) {
  const [step, setStep] = useState<"idle" | "accept" | "decline">("idle");
  const [reason, setReason] = useState("");
  const confirmRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (step !== "idle") confirmRef.current?.focus();
  }, [step]);

  return (
    <section aria-labelledby="quote-title" className="factbox booking-quote">
      <h2 id="quote-title">Your quote</h2>
      <p className="booking-quote__amount">{inr(quote.amount)}</p>
      <p className="booking-quote__meta">Sent {at(quote.sentAt)} · for your whole group</p>
      <dl>
        <div><dt>Included</dt><dd>{quote.inclusions}</dd></div>
        {quote.exclusions && <div><dt>Not included</dt><dd>{quote.exclusions}</dd></div>}
      </dl>

      {quote.response === "accepted" && <p className="badge badge--verified">✓ You accepted this quote {quote.respondedAt ? at(quote.respondedAt) : ""}</p>}
      {quote.response === "declined" && <p className="badge badge--warn">You declined this quote {quote.respondedAt ? at(quote.respondedAt) : ""}</p>}

      {quote.canRespond && step === "idle" && (
        <>
          <p style={{ marginTop: 12 }}>Nothing is booked or paid yet. Accepting lets us confirm with the partner — this page will say <strong>Confirmed</strong> once it&apos;s done. See our <Link href="/terms">terms</Link> and <Link href="/cancellation-policy">cancellation policy</Link>.</p>
          <div className="btn-row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn--primary" onClick={() => setStep("accept")} disabled={busy}>Accept quote</button>
            <button type="button" className="btn btn--outline" onClick={() => setStep("decline")} disabled={busy}>Decline</button>
          </div>
        </>
      )}

      {quote.canRespond && step === "accept" && (
        <div ref={confirmRef} tabIndex={-1} className="notice notice--info" role="group" aria-labelledby="accept-q" style={{ marginTop: 12 }}>
          <span aria-hidden="true">?</span>
          <div>
            <strong id="accept-q">Accept this quote of {inr(quote.amount)}?</strong>
            We&apos;ll confirm with the partner and update this page. You can still contact us with questions.
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn--primary" onClick={() => onRespond("accept")} disabled={busy}>{busy ? "Sending…" : "Yes, accept"}</button>
              <button type="button" className="btn btn--ghost" onClick={() => setStep("idle")} disabled={busy}>Not yet</button>
            </div>
          </div>
        </div>
      )}

      {quote.canRespond && step === "decline" && (
        <div ref={confirmRef} tabIndex={-1} className="notice notice--warn" role="group" aria-labelledby="decline-q" style={{ marginTop: 12 }}>
          <span aria-hidden="true">!</span>
          <div className="stack">
            <strong id="decline-q">Decline this quote?</strong>
            <div className="field">
              <label htmlFor="decline-reason">What would work better? <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <textarea id="decline-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn--primary" onClick={() => onRespond("decline", reason)} disabled={busy}>{busy ? "Sending…" : "Decline quote"}</button>
              <button type="button" className="btn btn--ghost" onClick={() => setStep("idle")} disabled={busy}>Go back</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function MyBooking() {
  const token = useSyncExternalStore(subscribeHash, readToken, () => "");
  const [state, setState] = useState<{ status: "loading" | "ok" | "invalid" | "error"; booking?: Booking }>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const tracked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = token
      ? post<{ booking: Booking }>("/booking/view", { token }).then((r) =>
          r.ok ? { status: "ok" as const, booking: r.data.booking } : { status: r.status === 404 || r.status === 400 ? ("invalid" as const) : ("error" as const) },
        )
      : Promise.resolve({ status: "invalid" as const });
    load
      .catch(() => ({ status: "error" as const }))
      .then((s) => {
        if (cancelled) return;
        setState(s);
        if (s.status === "ok" && s.booking && !tracked.current) {
          tracked.current = true;
          track("booking_viewed", { stage: s.booking.status });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const respond = async (decision: "accept" | "decline", reason?: string) => {
    const b = state.booking;
    if (!b?.quote) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await post<{ booking: Booking }>("/booking/respond", { token, quoteId: b.quote.id, decision, reason: reason || undefined });
      if (r.data.booking) setState({ status: "ok", booking: r.data.booking });
      if (r.ok) {
        track("quote_responded", { decision });
        setNotice(decision === "accept" ? "Thank you — you've accepted the quote. We'll confirm with the partner and update this page." : "Thanks for letting us know. We've told the team.");
      } else {
        setNotice(r.data.message || "That didn't work. Please try again, or contact us.");
      }
    } catch {
      setNotice("We couldn't reach our server. Please try again, or contact us.");
    } finally {
      setBusy(false);
    }
  };

  if (state.status === "loading") return <p aria-live="polite">Loading your booking request…</p>;
  if (state.status === "error") {
    return (
      <>
        <div className="notice notice--warn" role="alert"><span aria-hidden="true">!</span><div><strong>We couldn&apos;t load your request just now</strong>Please try again in a minute.</div></div>
        <Help />
      </>
    );
  }
  if (state.status === "invalid" || !state.booking) {
    return (
      <>
        <div className="notice notice--warn" role="alert">
          <span aria-hidden="true">!</span>
          <div><strong>This link isn&apos;t valid or has expired</strong>Links stop working after a while, or when we send you a newer one. Get a fresh link below, or contact us with your reference.</div>
        </div>
        <NewLinkForm />
        <Help />
      </>
    );
  }

  const b = state.booking;
  const closed = b.status === "cancelled" || b.status === "lost";
  const current = stepIndex(b);
  return (
    <div className="stack">
      <section aria-labelledby="status-title" className="booking-status">
        <p className="eyebrow">Reference {b.reference}</p>
        <h2 id="status-title">{b.stage.label}</h2>
        <p>{b.stage.next}</p>
      </section>

      {!closed && (
        <ol className="booking-steps" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className={i < current ? "is-done" : i === current ? "is-current" : undefined} aria-current={i === current ? "step" : undefined}>
              <span aria-hidden="true">{i < current ? "✓" : i + 1}</span> {s}
            </li>
          ))}
        </ol>
      )}

      <p role="status" aria-live="polite" className={notice ? "notice notice--info" : undefined}>{notice}</p>

      {b.quote && <QuoteCard quote={b.quote} onRespond={respond} busy={busy} />}

      <section aria-labelledby="request-title">
        <h2 id="request-title" style={{ fontSize: "1.2rem" }}>Your request</h2>
        <dl className="booking-details">
          <div><dt>Type</dt><dd>{b.type}</dd></div>
          {b.about && <div><dt>About</dt><dd>{b.about}</dd></div>}
          {b.arrive && <div><dt>Arriving</dt><dd>{day(b.arrive)}</dd></div>}
          {b.depart && <div><dt>Leaving</dt><dd>{day(b.depart)}</dd></div>}
          {b.travellers && <div><dt>Travellers</dt><dd>{b.travellers}</dd></div>}
          <div><dt>Received</dt><dd>{at(b.receivedAt)}</dd></div>
          {b.partner && <div><dt>Local partner</dt><dd>{b.partner.name}<br /><span className="booking-muted">Our team stays your contact throughout.</span></dd></div>}
        </dl>
      </section>

      <section aria-labelledby="timeline-title">
        <h2 id="timeline-title" style={{ fontSize: "1.2rem" }}>What&apos;s happened so far</h2>
        <ol className="booking-timeline">
          {[...b.timeline].reverse().map((t, i) => (
            <li key={`${t.at}-${i}`}><strong>{t.event}</strong> <span className="booking-muted">{at(t.at)}</span></li>
          ))}
        </ol>
      </section>

      <p className="booking-muted">
        This page is private to you. Anyone with this link can see your request and answer the quote, so please don&apos;t share it.
        Your booking is only confirmed when this page says <strong>Confirmed</strong>.
      </p>
      <Help reference={b.reference} />
      <p><Link href="/plan/trip-planner">Plan the rest of your days</Link> · <Link href="/travel-guide/today">Today in Varanasi</Link></p>
    </div>
  );
}
