import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Phone, MessageCircle, RefreshCw, Clock3, Download } from "lucide-react";
import { api } from "../../lib/api";
import AdminDialog from "../AdminDialog";

// Lead pipeline for every enquiry from the Varanasi Trip Companion site
// (Requirements.md FR-SVC-04/05). The API computes the service-standard
// timings per lead — S1 first reply, S2 partner confirmed — and enforces the
// close-out rules; this screen shows them and collects what each status needs.
const STATUSES = ["new", "contacted", "partner_assigned", "confirmed", "completed", "cancelled", "lost"];
const STATUS_LABEL = {
  new: "New",
  contacted: "Contacted",
  partner_assigned: "Partner assigned",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  lost: "Lost",
};
const HISTORY_LABEL = {
  ...STATUS_LABEL,
  partner_asked: "Partner asked",
  partner_accepted: "Partner accepted",
  partner_declined: "Partner declined",
  quote_sent: "Quote recorded",
  customer_accepted: "Customer accepted the quote",
  reopened: "Reopened",
  customer_declined: "Customer declined the quote",
  link_issued: "New booking-page link",
};
const CLOSED = ["completed", "cancelled", "lost"];
const FROZEN = ["confirmed", ...CLOSED]; // partner and quote can't change any more
const TYPE_LABEL = {
  trip: "Trip plan",
  service: "Service",
  experience: "Experience",
  partner: "Partner application",
  complaint: "Complaint",
  general: "General",
};
const SLA_FILTERS = { all: "Any timing", s1: "Missed reply target (S1)", s2: "Missed confirmation target (S2)", any: "Missed either" };

// SQLite timestamps are UTC without a zone ("2026-11-01 11:33:06").
const parseUtc = (s) => (s ? new Date(s.includes("T") ? s : `${s.replace(" ", "T")}Z`) : null);
const when = (d) => d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const clock = (d) => d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const istDay = (s) => parseUtc(s).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function mins(m) {
  if (m == null) return "—";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

function ago(date) {
  const m = Math.round((Date.now() - date.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function whatsappLink(phone, reference) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(`Namaste! This is Varanasi Trip Companion about your enquiry ${reference}.`)}`;
}

/** The statuses that need details first (FR-SVC-04/05), if those details aren't on the lead yet. */
function needsInput(lead, next) {
  if (next === "partner_assigned") return !lead.partnerName;
  if (next === "completed") return lead.bookingValue == null || lead.commission == null;
  if (next === "lost") return !lead.lostReason;
  if (next === "confirmed") return (lead.confirmationGaps?.length ?? 0) > 0;
  return false;
}

/** Short SLA flags for the table row. */
function slaFlags(l) {
  const flags = [];
  if (!l.firstResponseAt) {
    flags.push(l.s1Breach ? { text: "reply overdue", bad: true } : { text: `reply by ${clock(new Date(l.s1DueAt))}` });
  } else if (l.s1Breach) {
    flags.push({ text: `replied late (${mins(l.s1Minutes)})`, bad: true });
  }
  if (l.s2Breach) flags.push({ text: l.confirmedAt ? `confirmed late (${mins(l.s2Minutes)})` : "confirmation overdue", bad: true });
  return flags;
}

// --------------------------------------------------------------- CSV export

const CSV_COLUMNS = [
  ["Reference", (l) => l.reference],
  ["Received (IST)", (l) => parseUtc(l.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })],
  ["Type", (l) => TYPE_LABEL[l.type]],
  ["Service", (l) => [l.service, l.item].filter(Boolean).join(" / ")],
  ["About", (l) => l.context || l.experience],
  ["Name", (l) => l.fullName],
  ["Email", (l) => l.email],
  ["Phone", (l) => l.phone],
  ["Travellers", (l) => l.travellers],
  ["Arrive", (l) => l.arrive],
  ["Depart", (l) => l.depart],
  ["Status", (l) => STATUS_LABEL[l.status]],
  ["First reply (min)", (l) => l.s1Minutes],
  ["S1 met", (l) => (l.s1Breach ? "No" : l.firstResponseAt ? "Yes" : "Pending")],
  ["To confirmation (min)", (l) => l.s2Minutes],
  ["S2 met", (l) => (!l.s2DueAt ? "n/a" : l.s2Breach ? "No" : l.confirmedAt ? "Yes" : "Pending")],
  ["Partner", (l) => l.partnerName],
  ["Partner response", (l) => l.partnerResponse],
  ["Booking value (INR)", (l) => l.bookingValue],
  ["Commission (INR)", (l) => l.commission],
  ["Lost reason", (l) => l.lostReason],
  ["Source page", (l) => l.sourcePage],
];

// Quote every cell; a leading = + - @ would run as a formula in Excel/Sheets.
const cell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

function downloadCsv(rows) {
  const csv = [CSV_COLUMNS.map(([h]) => cell(h)), ...rows.map((l) => CSV_COLUMNS.map(([, f]) => cell(f(l))))].map((r) => r.join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" })); // BOM: Excel reads ₹ and Hindi names
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------------------------------------------------------ pieces

/** Only the allowed next steps (from the API); closed enquiries can't be changed here. */
function StatusSelect({ lead, onChange, busy, transitions }) {
  const options = [lead.status, ...(transitions ? transitions[lead.status] ?? [] : STATUSES.filter((s) => s !== lead.status))];
  return (
    <select
      value={lead.status}
      disabled={busy || options.length === 1}
      title={options.length === 1 ? "Closed — reopen it from the enquiry to make changes" : undefined}
      onChange={(e) => onChange(lead, e.target.value)}
      aria-label={`Status for ${lead.reference}`}
      className="admin-select"
    >
      {options.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
    </select>
  );
}

/** Collects what a status needs before it can be set. */
function OutcomeForm({ lead, status, lostReasons, onSaved, onCancel }) {
  const [form, setForm] = useState({
    partnerName: lead.partnerName || "",
    bookingValue: lead.bookingValue ?? lead.quoteAmount ?? "",
    commission: lead.commission ?? "",
    lostReason: lead.lostReason || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const firstRef = useRef(null);
  useEffect(() => firstRef.current?.focus(), []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const body = { status };
    if (status === "partner_assigned") body.partnerName = form.partnerName.trim();
    if (status === "completed") Object.assign(body, { bookingValue: form.bookingValue, commission: form.commission });
    if (status === "lost") body.lostReason = form.lostReason;
    setSaving(true);
    setError("");
    try {
      const r = await api.patch(`/admin/leads/${lead.reference}`, body);
      onSaved(r.lead, `${lead.reference} → ${STATUS_LABEL[status]}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const gaps = status === "confirmed" ? lead.confirmationGaps ?? [] : [];
  return (
    <form className="admin-card admin-form admin-outcome" onSubmit={submit} aria-labelledby="outcome-title">
      <h3 id="outcome-title">Mark as {STATUS_LABEL[status].toLowerCase()}</h3>
      {status === "confirmed" && gaps.length > 0 && (
        <div className="admin-note" role="note">
          <strong>Not ready to confirm yet:</strong>
          <ul>{gaps.map((g) => <li key={g}>{g}</li>)}</ul>
          Use the Booking section below, then confirm.
        </div>
      )}
      {status === "partner_assigned" && (
        <div className="admin-field">
          <label htmlFor="outcome-partner">Partner you&apos;ve asked</label>
          <input id="outcome-partner" ref={firstRef} className="admin-input" maxLength={80} required value={form.partnerName} onChange={set("partnerName")} placeholder="e.g. Ganga Boat Co-op (Ramesh)" />
          <p className="admin-hint">Records the time you asked, so the partner&apos;s response time can be tracked. The customer sees this name once the partner accepts — name only, no phone numbers.</p>
        </div>
      )}
      {status === "completed" && (
        <div className="admin-form__row">
          <div className="admin-field">
            <label htmlFor="outcome-value">Booking value (₹)</label>
            <input id="outcome-value" ref={firstRef} className="admin-input" type="number" inputMode="numeric" min={0} step={1} required value={form.bookingValue} onChange={set("bookingValue")} />
          </div>
          <div className="admin-field">
            <label htmlFor="outcome-commission">Agreed commission (₹)</label>
            <input id="outcome-commission" className="admin-input" type="number" inputMode="numeric" min={0} step={1} required value={form.commission} onChange={set("commission")} />
          </div>
        </div>
      )}
      {status === "lost" && (
        <div className="admin-field">
          <label htmlFor="outcome-reason">Reason</label>
          <select id="outcome-reason" ref={firstRef} className="admin-select" required value={form.lostReason} onChange={set("lostReason")}>
            <option value="">Choose a reason…</option>
            {lostReasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}
      {error && <p className="admin__error" role="alert">{error}</p>}
      <div className="admin-form__actions">
        <button type="submit" className="btn btn--solid" disabled={saving || gaps.length > 0}>{saving ? "Saving…" : `Mark ${STATUS_LABEL[status].toLowerCase()}`}</button>
        <button type="button" className="btn btn--soft" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/** Quote, customer acceptance and confirmation readiness (QA-01), plus reopen
 *  for cancelled/lost enquiries (QA-02). The API enforces the same rules. */
function BookingPanel({ lead, onSaved }) {
  const [quotes, setQuotes] = useState([]);
  const [quote, setQuote] = useState({ amount: "", inclusions: "", exclusions: "" });
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/admin/leads/${lead.reference}/quotes`).then((d) => setQuotes(d.quotes)).catch(() => setQuotes([]));
  }, [lead.reference, lead.quoteId]);

  const send = async (body, done, reset) => {
    setBusy(true);
    setError("");
    try {
      const r = await api.patch(`/admin/leads/${lead.reference}`, body);
      onSaved(r.lead, done);
      reset?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const current = quotes.find((q) => q.id === lead.quoteId);
  const earlier = quotes.filter((q) => q.id !== lead.quoteId);
  const accepted = Boolean(lead.quoteId) && lead.acceptedQuoteId === lead.quoteId;
  const frozen = FROZEN.includes(lead.status);
  const checklist = [
    ["Partner accepted", lead.partnerResponse === "accepted"],
    ["Quote recorded", Boolean(lead.quoteId)],
    ["Customer accepted the quote", accepted],
  ];

  return (
    <section aria-labelledby="booking-title">
      <h3 id="booking-title" className="admin-subhead">Booking</h3>
      {current ? (
        <div className="admin-quote">
          <p><strong>{inr(current.amount)}</strong> · {current.partnerName} · recorded {when(parseUtc(current.createdAt))}</p>
          <p>Includes: {current.inclusions}</p>
          {current.exclusions && <p>Not included: {current.exclusions}</p>}
          {accepted ? (
            <p className="admin-ok">✓ Customer accepted {when(parseUtc(lead.customerAcceptedAt))} — {lead.customerAcceptanceNote}</p>
          ) : current.customerResponse === "declined" ? (
            <p className="admin-overdue">Customer declined {when(parseUtc(current.customerResponseAt))} — {current.customerResponseNote}. Send a revised quote or contact them.</p>
          ) : (
            <p className="admin-overdue">Waiting for the customer to accept this quote.</p>
          )}
        </div>
      ) : (
        <p className="admin-hint">No quote recorded yet.</p>
      )}

      {current && !accepted && !frozen && (
        <form
          className="admin-inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            send({ customerAccepted: true, acceptanceNote: note }, "Customer acceptance recorded.", () => setNote(""));
          }}
        >
          <label htmlFor="accept-note">How did the customer accept?</label>
          <input id="accept-note" className="admin-input" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Replied YES on WhatsApp at 3:10 pm" />
          <button type="submit" className="btn btn--soft" disabled={busy || !note.trim()}>Customer accepted</button>
        </form>
      )}

      {!frozen && (lead.partnerName ? (
        <form
          className="admin-form admin-quote-form"
          onSubmit={(e) => {
            e.preventDefault();
            send(
              { quoteAmount: quote.amount, quoteInclusions: quote.inclusions, quoteExclusions: quote.exclusions },
              "Quote recorded.",
              () => setQuote({ amount: "", inclusions: "", exclusions: "" }),
            );
          }}
        >
          <h4>{current ? "Revise the quote" : "Record the quote sent to the customer"}</h4>
          {current && <p className="admin-hint">A revised quote replaces this one, and the customer has to accept it again.</p>}
          <div className="admin-form__row">
            <div className="admin-field">
              <label htmlFor="quote-amount">Price (₹)</label>
              <input id="quote-amount" className="admin-input" type="number" inputMode="numeric" min={1} step={1} required value={quote.amount} onChange={(e) => setQuote({ ...quote, amount: e.target.value })} />
            </div>
          </div>
          <div className="admin-field">
            <label htmlFor="quote-inc">What&apos;s included</label>
            <textarea id="quote-inc" className="admin-textarea" rows={2} maxLength={600} required value={quote.inclusions} onChange={(e) => setQuote({ ...quote, inclusions: e.target.value })} />
          </div>
          <div className="admin-field">
            <label htmlFor="quote-exc">Not included <span className="admin-hint">(optional)</span></label>
            <textarea id="quote-exc" className="admin-textarea" rows={2} maxLength={600} value={quote.exclusions} onChange={(e) => setQuote({ ...quote, exclusions: e.target.value })} />
          </div>
          <div className="admin-form__actions">
            <button type="submit" className="btn btn--soft" disabled={busy || !quote.amount || quote.inclusions.trim().length < 3}>Record quote</button>
          </div>
        </form>
      ) : (
        !CLOSED.includes(lead.status) && <p className="admin-hint">Assign a partner before recording a quote.</p>
      ))}

      {["contacted", "partner_assigned"].includes(lead.status) && (
        <div className="admin-note" role="note">
          <strong>Ready to confirm?</strong>
          <ul className="admin-checklist">
            {checklist.map(([label, ok]) => (
              <li key={label} className={ok ? "is-done" : undefined}>
                <span aria-hidden="true">{ok ? "✓" : "○"}</span> {label}
                <span className="visually-hidden">{ok ? " — done" : " — not yet"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {earlier.length > 0 && (
        <details className="admin-details">
          <summary>Earlier quotes ({earlier.length})</summary>
          <ul className="admin-timeline">
            {earlier.map((q) => (
              <li key={q.id}>{inr(q.amount)} · {q.partnerName} · {when(parseUtc(q.createdAt))} — {q.inclusions}</li>
            ))}
          </ul>
        </details>
      )}

      {["cancelled", "lost"].includes(lead.status) && (
        <form
          className="admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            send({ reopen: true, reopenReason: reason }, "Reopened.", () => setReason(""));
          }}
        >
          <div className="admin-field">
            <label htmlFor="reopen-reason">Reopen this enquiry — why?</label>
            <input id="reopen-reason" className="admin-input" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer wrote back with new dates" />
          </div>
          <div className="admin-form__actions">
            <button type="submit" className="btn btn--soft" disabled={busy || !reason.trim()}>Reopen</button>
          </div>
        </form>
      )}
      {error && <p className="admin__error" role="alert">{error}</p>}
    </section>
  );
}

/** The customer's private booking page. The link is shown once when created —
 *  only a hash is stored — so staff copy or send it straight away. */
function CustomerLinkPanel({ lead }) {
  const [info, setInfo] = useState(undefined);
  const [fresh, setFresh] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api.get(`/admin/leads/${lead.reference}/access`).then((d) => setInfo(d.link)).catch(() => setInfo(null));
  }, [lead.reference, fresh]);

  const create = async () => {
    setConfirming(false);
    setBusy(true);
    setMsg("");
    try {
      setFresh(await api.post(`/admin/leads/${lead.reference}/access-link`));
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fresh.url);
      setMsg("Link copied.");
    } catch {
      setMsg("Copy blocked — select the link and copy it.");
    }
  };
  const phone = lead.phone ? `91${lead.phone.replace(/\D/g, "").slice(-10)}` : null;
  const text = fresh ? `Namaste! You can follow your booking request ${lead.reference}, see your quote and accept it here (private link, please don't share): ${fresh.url}` : "";

  return (
    <section aria-labelledby="custlink-title">
      <h3 id="custlink-title" className="admin-subhead">Customer&apos;s booking page</h3>
      {info === undefined ? (
        <p className="admin-hint">Checking…</p>
      ) : info ? (
        <p className="admin-hint">
          Active link created {when(parseUtc(info.createdAt))}, works until {when(parseUtc(info.expiresAt))}.{" "}
          {info.lastUsedAt ? `Last opened ${when(parseUtc(info.lastUsedAt))}.` : "Not opened yet."}
        </p>
      ) : (
        <p className="admin-hint">No working link — create one to send the customer.</p>
      )}
      {fresh && (
        <div className="admin-note" role="note">
          <strong>New link — copy or send it now; it won&apos;t be shown again.</strong>
          <input className="admin-input admin-mono" readOnly value={fresh.url} aria-label="Customer's booking page link" onFocus={(e) => e.target.select()} />
          <div className="admin-form__actions">
            <button type="button" className="btn btn--soft" onClick={copy}>Copy link</button>
            {phone && <a className="btn btn--soft" href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>}
            {lead.email && <a className="btn btn--soft" href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your booking request ${lead.reference}`)}&body=${encodeURIComponent(text)}`}>Send by email</a>}
          </div>
        </div>
      )}
      {confirming ? (
        <div className="admin-form__actions" role="group" aria-label="Confirm replacing the link">
          <span>The customer&apos;s current link will stop working.</span>
          <button type="button" className="btn btn--solid" disabled={busy} onClick={create}>Replace link</button>
          <button type="button" className="btn btn--soft" onClick={() => setConfirming(false)}>Keep current link</button>
        </div>
      ) : (
        <div className="admin-form__actions">
          <button type="button" className="btn btn--soft" disabled={busy} onClick={info ? () => setConfirming(true) : create}>{info ? "Replace link…" : "Create link"}</button>
          {msg && <span className="admin-hint" role="status">{msg}</span>}
        </div>
      )}
    </section>
  );
}

/** FR-SVC-05: who was asked, when, and how fast they answered. */
function PartnerPanel({ lead, onSaved }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (body, done) => {
    setBusy(true);
    setError("");
    try {
      const r = await api.patch(`/admin/leads/${lead.reference}`, body);
      onSaved(r.lead, done);
      setName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const asked = parseUtc(lead.partnerAskedAt);
  const answered = parseUtc(lead.partnerRespondedAt);
  return (
    <section aria-labelledby="partner-title">
      <h3 id="partner-title" className="admin-subhead">Partner</h3>
      {lead.partnerName ? (
        <p>
          <strong>{lead.partnerName}</strong> · asked {clock(asked)}
          {answered
            ? ` · ${lead.partnerResponse} after ${mins(Math.round((answered - asked) / 60000))}`
            : " · waiting for an answer"}
        </p>
      ) : (
        <p className="admin-hint">No partner asked yet.</p>
      )}
      {lead.partnerName && !lead.partnerResponse && !FROZEN.includes(lead.status) && (
        <div className="admin-form__actions">
          <button type="button" className="btn btn--soft" disabled={busy} onClick={() => send({ partnerResponse: "accepted" }, `${lead.partnerName} accepted.`)}>Partner accepted</button>
          <button type="button" className="btn btn--soft" disabled={busy} onClick={() => send({ partnerResponse: "declined" }, `${lead.partnerName} declined.`)}>Partner declined</button>
        </div>
      )}
      {!FROZEN.includes(lead.status) && (
      <form
        className="admin-inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) send({ partnerName: name.trim() }, `Asked ${name.trim()}.`);
        }}
      >
        <label htmlFor="partner-name">{lead.partnerName ? "Ask a different partner" : "Ask a partner"}</label>
        <input id="partner-name" className="admin-input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Partner name" aria-describedby="partner-name-hint" />
        <p id="partner-name-hint" className="admin-hint">Shown to the customer once the partner accepts — name only, no phone numbers.</p>
        <button type="submit" className="btn btn--soft" disabled={busy || !name.trim()}>Record ask</button>
      </form>
      )}
      {error && <p className="admin__error" role="alert">{error}</p>}
    </section>
  );
}

function LeadDetail({ lead, pending, lostReasons, transitions, onClose, onStatus, onSaved, onCancelPending, busy }) {
  const [history, setHistory] = useState(null);
  const [note, setNote] = useState(lead.partnerNote || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get(`/admin/leads/${lead.reference}/history`).then((d) => setHistory(d.history)).catch(() => setHistory([]));
  }, [lead.reference, lead.status, lead.partnerName, lead.partnerResponse]);

  const saveNote = async () => {
    setSaving(true);
    setMsg("");
    try {
      const r = await api.patch(`/admin/leads/${lead.reference}`, { partnerNote: note });
      onSaved(r.lead);
      setMsg("Note saved.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const wa = whatsappLink(lead.phone, lead.reference);
  return (
    <AdminDialog labelledBy="lead-title" onClose={onClose}>
      <h2 id="lead-title">{lead.fullName} <span className="admin-mono">{lead.reference}</span></h2>
      <p className="admin-modal__meta">
        {TYPE_LABEL[lead.type]}{lead.context ? ` · ${lead.context}` : ""} · received {when(parseUtc(lead.createdAt))}
      </p>

      <div className="admin-lead-actions">
        {lead.email && <a className="btn btn--soft" href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your enquiry ${lead.reference}`)}`}><Mail size={15} aria-hidden="true" /> Email</a>}
        {lead.phone && <a className="btn btn--soft" href={`tel:+91${lead.phone}`}><Phone size={15} aria-hidden="true" /> Call</a>}
        {wa && <a className="btn btn--soft" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true" /> WhatsApp</a>}
        <StatusSelect lead={lead} onChange={onStatus} busy={busy} transitions={transitions} />
      </div>

      {pending && (
        <OutcomeForm key={pending} lead={lead} status={pending} lostReasons={lostReasons} onSaved={onSaved} onCancel={onCancelPending} />
      )}

      <dl className="admin-detail">
        <dt>Email</dt><dd>{lead.email || "—"}</dd>
        <dt>Phone</dt><dd>{lead.phone || "—"}</dd>
        <dt>Dates</dt><dd>{lead.arrive || lead.depart ? `${lead.arrive || "?"} → ${lead.depart || "?"}` : "Not given"}</dd>
        <dt>Travellers</dt><dd>{lead.travellers || "—"}</dd>
        <dt>Service</dt><dd>{[lead.service, lead.item].filter(Boolean).join(" · ") || "—"}</dd>
        <dt>Experience</dt><dd>{lead.experience || "—"}</dd>
        <dt>Came from</dt><dd>{lead.sourcePage || "—"}</dd>
        <dt>First reply (S1)</dt>
        <dd className={lead.s1Breach ? "admin-overdue" : undefined}>
          {lead.firstResponseAt
            ? `${mins(lead.s1Minutes)} after it arrived${lead.s1Breach ? " — missed target" : ""}`
            : `${lead.s1Breach ? "Overdue — was" : "Due"} by ${clock(new Date(lead.s1DueAt))}`}
        </dd>
        <dt>Confirmation (S2)</dt>
        <dd className={lead.s2Breach ? "admin-overdue" : undefined}>
          {!lead.s2DueAt
            ? "Not a booking"
            : lead.confirmedAt
              ? `${mins(lead.s2Minutes)} after it arrived${lead.s2Breach ? " — missed target" : ""}`
              : ["cancelled", "lost"].includes(lead.status)
                ? "Not confirmed"
                : `${lead.s2Breach ? "Overdue — was" : "Due"} by ${clock(new Date(lead.s2DueAt))}`}
        </dd>
        {lead.bookingValue != null && (<><dt>Booking value</dt><dd>{inr(lead.bookingValue)} · commission {inr(lead.commission ?? 0)}</dd></>)}
        {lead.lostReason && (<><dt>Lost because</dt><dd>{lead.lostReason}</dd></>)}
      </dl>

      {lead.message && (
        <>
          <h3 className="admin-subhead">Message</h3>
          <p className="admin-pre">{lead.message}</p>
        </>
      )}
      {lead.planText && (
        <>
          <h3 className="admin-subhead">Attached trip plan</h3>
          <p className="admin-pre">{lead.planText}</p>
        </>
      )}

      <PartnerPanel lead={lead} onSaved={onSaved} />

      <BookingPanel lead={lead} onSaved={onSaved} />

      <CustomerLinkPanel lead={lead} />

      <h3 className="admin-subhead"><label htmlFor="lead-note">Internal note (price, meeting point, follow-up)</label></h3>
      <textarea id="lead-note" className="admin-textarea" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="admin-form__actions">
        <button type="button" className="btn btn--solid" onClick={saveNote} disabled={saving || note === (lead.partnerNote || "")}>
          {saving ? "Saving…" : "Save note"}
        </button>
        {msg && <span role="status" className="admin-hint">{msg}</span>}
      </div>

      <h3 className="admin-subhead">History</h3>
      {history === null ? (
        <p>Loading…</p>
      ) : (
        <ol className="admin-timeline">
          {history.map((h, i) => (
            <li key={i}>
              <strong>{HISTORY_LABEL[h.status] || h.status}</strong>
              {h.detail ? ` (${h.detail})` : ""} · {when(parseUtc(h.changedAt))} · {h.changedBy}
            </li>
          ))}
        </ol>
      )}
    </AdminDialog>
  );
}

/** Medians per day/week (FR-SVC-04) and partner response rates (FR-SVC-05). */
function ServiceReport({ stats, period, onPeriod }) {
  if (!stats) return null;
  return (
    <section aria-labelledby="report-title" className="admin-report">
      <div className="admin-report__head">
        <h2 id="report-title" className="admin-subhead">Response times</h2>
        <div className="admin-filters" role="group" aria-label="Group by">
          {[["day", "Daily (14 days)"], ["week", "Weekly (8 weeks)"]].map(([k, label]) => (
            <button key={k} type="button" className={period === k ? "is-active" : ""} aria-pressed={period === k} onClick={() => onPeriod(k)}>{label}</button>
          ))}
        </div>
      </div>
      {stats.periods.length === 0 ? (
        <p className="admin__empty">No leads in this period.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption className="visually-hidden">Lead response times by {period}</caption>
            <thead>
              <tr>
                <th scope="col">{period === "week" ? "Week of" : "Day"}</th>
                <th scope="col">Leads</th>
                <th scope="col">Median first reply</th>
                <th scope="col">Missed S1</th>
                <th scope="col">Median to confirmation</th>
                <th scope="col">Missed S2</th>
              </tr>
            </thead>
            <tbody>
              {stats.periods.map((p) => (
                <tr key={p.start}>
                  <th scope="row">{new Date(`${p.start}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</th>
                  <td>{p.leads}</td>
                  <td>{mins(p.s1Median)}</td>
                  <td className={p.s1Breaches ? "admin-overdue" : undefined}>{p.s1Breaches}</td>
                  <td>{mins(p.s2Median)}</td>
                  <td className={p.s2Breaches ? "admin-overdue" : undefined}>{p.s2Applicable ? `${p.s2Breaches} of ${p.s2Applicable}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="admin-subhead">Partner response rate</h2>
      <p className="admin-hint">Answered (accepted or declined) within 30 minutes of being asked, this month and last.</p>
      {stats.partners.length === 0 ? (
        <p className="admin__empty">No partners asked yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption className="visually-hidden">Partner response rates</caption>
            <thead>
              <tr>
                <th scope="col">Partner</th>
                <th scope="col">Month</th>
                <th scope="col">Asked</th>
                <th scope="col">Answered in 30 min</th>
                <th scope="col">Rate</th>
                <th scope="col">Accepted</th>
              </tr>
            </thead>
            <tbody>
              {stats.partners.map((p) => (
                <tr key={`${p.partner}-${p.month}`}>
                  <th scope="row">{p.partner}</th>
                  <td>{new Date(`${p.month}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" })}</td>
                  <td>{p.asked}</td>
                  <td>{p.inTime}</td>
                  <td>{p.rate}%</td>
                  <td>{p.accepted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// -------------------------------------------------------------------- page

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ lostReasons: [], transitions: null });
  const [period, setPeriod] = useState("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [filters, setFilters] = useState({ status: "all", type: "all", service: "all", partner: "all", sla: "all", from: "", to: "", q: "" });
  const [busyRef, setBusyRef] = useState(null);
  const [openRef, setOpenRef] = useState(null);
  const [pending, setPending] = useState(null); // status awaiting details in the dialog
  const [params, setParams] = useSearchParams();

  // Deep link from the dashboard: /admin/leads?open=TOB-… opens that enquiry.
  const openParam = params.get("open");
  useEffect(() => {
    if (!openParam || !leads.some((l) => l.reference === openParam)) return;
    setOpenRef(openParam);
    setParams({}, { replace: true });
  }, [openParam, leads, setParams]);

  const loadStats = useCallback((p) => api.get(`/admin/leads/stats?period=${p}`).then(setStats).catch(() => {}), []);
  const load = useCallback(() => {
    Promise.all([api.get("/admin/leads"), api.get(`/admin/leads/stats?period=${period}`)])
      .then(([l, s]) => {
        setLeads(l.leads || []);
        setStats(s);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    api.get("/admin/leads/meta").then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000); // new enquiries and SLA flags update without a reload
    return () => clearInterval(t);
  }, [load]);

  const flash = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  };

  const saved = (lead, message) => {
    setLeads((prev) => prev.map((l) => (l.reference === lead.reference ? lead : l)));
    if (message) flash(message);
    setPending(null);
    loadStats(period);
  };

  const changeStatus = async (lead, next) => {
    if (needsInput(lead, next)) {
      setOpenRef(lead.reference);
      setPending(next);
      return;
    }
    setBusyRef(lead.reference);
    try {
      const r = await api.patch(`/admin/leads/${lead.reference}`, { status: next });
      saved(r.lead, `${lead.reference} → ${STATUS_LABEL[next]}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyRef(null);
    }
  };

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));
  const services = useMemo(() => [...new Set(leads.map((l) => l.service).filter(Boolean))].sort(), [leads]);
  const partners = useMemo(() => [...new Set(leads.map((l) => l.partnerName).filter(Boolean))].sort(), [leads]);
  const counts = useMemo(() => Object.fromEntries((stats?.byStatus || []).map((r) => [r.status, r.n])), [stats]);

  const shown = useMemo(() => {
    const f = filters;
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    return leads.filter((l) => {
      const day = istDay(l.createdAt);
      return (
        (f.status === "all" || l.status === f.status) &&
        (f.type === "all" || l.type === f.type) &&
        (f.service === "all" || l.service === f.service) &&
        (f.partner === "all" || (f.partner === "none" ? !l.partnerName : l.partnerName === f.partner)) &&
        (f.sla === "all" || (f.sla === "s1" && l.s1Breach) || (f.sla === "s2" && l.s2Breach) || (f.sla === "any" && (l.s1Breach || l.s2Breach))) &&
        (!f.from || day >= f.from) &&
        (!f.to || day <= f.to) &&
        words.every((w) => [l.reference, l.fullName, l.email, l.phone, l.context, l.partnerName].join(" ").toLowerCase().includes(w))
      );
    });
  }, [leads, filters]);

  const filtered = Object.entries(filters).some(([k, v]) => (k === "from" || k === "to" || k === "q" ? v : v !== "all"));
  const open = leads.find((l) => l.reference === openRef);
  const s1 = stats?.firstResponse;
  const s2 = stats?.confirmation;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Leads</h1>
        <p className="admin-hint">
          Every enquiry from the website. Targets: first reply within 10 minutes (6am–10pm; overnight by 7am), partner
          confirmed within 2 hours (30 minutes for same-day requests).
        </p>
      </div>

      <div className="admin-tiles admin-tiles--tight" style={{ marginBottom: 20 }}>
        <div className="admin-tile" style={{ borderColor: counts.new ? "#fde68a" : undefined }}>
          <strong>{counts.new || 0}</strong>
          <span>New — awaiting a reply</span>
        </div>
        <div className="admin-tile">
          <strong>{(counts.contacted || 0) + (counts.partner_assigned || 0)}</strong>
          <span>In progress</span>
        </div>
        <div className="admin-tile" style={{ borderColor: s1?.breaches ? "#fecaca" : undefined }}>
          <strong>{mins(s1?.medianMinutes)}</strong>
          <span>Median first reply · {s1?.breaches ?? 0} missed (30 days)</span>
        </div>
        <div className="admin-tile" style={{ borderColor: s2?.breaches ? "#fecaca" : undefined }}>
          <strong>{mins(s2?.medianMinutes)}</strong>
          <span>Median to confirmation · {s2?.breaches ?? 0} missed (30 days)</span>
        </div>
      </div>

      <div className="admin-filters" role="group" aria-label="Filter by status">
        {["all", ...STATUSES].map((s) => (
          <button key={s} type="button" className={s === filters.status ? "is-active" : ""} aria-pressed={s === filters.status} onClick={() => setFilter("status")(s)}>
            {s === "all" ? "All" : STATUS_LABEL[s]}{s !== "all" && counts[s] ? ` (${counts[s]})` : ""}
          </button>
        ))}
      </div>
      <div className="admin-toolbar">
        <label>
          <span className="visually-hidden">Search leads</span>
          <input type="search" value={filters.q} onChange={setFilter("q")} placeholder="Search reference, name, email, phone, partner…" className="admin-input" />
        </label>
        <label>
          <span className="visually-hidden">Filter by type</span>
          <select value={filters.type} onChange={setFilter("type")} className="admin-select">
            <option value="all">All types</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        {services.length > 0 && (
          <label>
            <span className="visually-hidden">Filter by service</span>
            <select value={filters.service} onChange={setFilter("service")} className="admin-select">
              <option value="all">All services</option>
              {services.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <label>
          <span className="visually-hidden">Filter by partner</span>
          <select value={filters.partner} onChange={setFilter("partner")} className="admin-select">
            <option value="all">All partners</option>
            <option value="none">No partner yet</option>
            {partners.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>
          <span className="visually-hidden">Filter by service standard</span>
          <select value={filters.sla} onChange={setFilter("sla")} className="admin-select">
            {Object.entries(SLA_FILTERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="admin-date">
          From <input type="date" value={filters.from} max={filters.to || undefined} onChange={setFilter("from")} className="admin-input" />
        </label>
        <label className="admin-date">
          To <input type="date" value={filters.to} min={filters.from || undefined} onChange={setFilter("to")} className="admin-input" />
        </label>
        {filtered && (
          <button type="button" className="btn btn--soft" onClick={() => setFilters({ status: "all", type: "all", service: "all", partner: "all", sla: "all", from: "", to: "", q: "" })}>
            Clear filters
          </button>
        )}
        <button type="button" className="btn btn--soft" onClick={load} aria-label="Refresh leads"><RefreshCw size={15} aria-hidden="true" /> Refresh</button>
        <button type="button" className="btn btn--soft" onClick={() => downloadCsv(shown)} disabled={!shown.length}>
          <Download size={15} aria-hidden="true" /> Export CSV ({shown.length})
        </button>
      </div>

      {error && <div className="admin-toast admin-toast--error" role="alert">{error}</div>}
      {toast && <div className="admin-toast admin-toast--success" role="status">{toast}</div>}
      {loading && <p>Loading leads…</p>}
      {!loading && shown.length === 0 && <p className="admin__empty">No leads match.</p>}

      {!loading && shown.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--leads">
            <caption className="visually-hidden">Website leads</caption>
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">From</th>
                <th scope="col">About</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => {
                const created = parseUtc(l.createdAt);
                const flags = slaFlags(l);
                const live = (!l.firstResponseAt && l.s1Breach) || (!l.confirmedAt && l.s2Breach);
                return (
                  <tr key={l.reference} className={live ? "admin-row--overdue" : undefined}>
                    <td>
                      <span className="admin-mono">{l.reference}</span>
                      <div className="admin-sub">
                        <Clock3 size={12} aria-hidden="true" /> {ago(created)}
                        {flags.map((f) => (
                          <span key={f.text} className={f.bad ? "admin-overdue" : undefined}> · {f.text}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong>{l.fullName}</strong>
                      <div className="admin-sub">{l.phone || l.email}</div>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--type-${l.type}`}>{TYPE_LABEL[l.type]}</span>
                      <div className="admin-sub">{l.context || l.service || "—"}</div>
                      {(l.arrive || l.travellers) && (
                        <div className="admin-sub">
                          {l.arrive ? `${l.arrive}${l.depart ? ` → ${l.depart}` : ""}` : ""}
                          {l.arrive && l.travellers ? " · " : ""}
                          {l.travellers ? `${l.travellers} travellers` : ""}
                        </div>
                      )}
                      {l.partnerName && <div className="admin-sub">Partner: {l.partnerName}{l.partnerResponse ? ` (${l.partnerResponse})` : ""}</div>}
                    </td>
                    <td><StatusSelect lead={l} onChange={changeStatus} busy={busyRef === l.reference} transitions={meta.transitions} /></td>
                    <td className="admin-table__actions">
                      <button type="button" className="btn btn--soft" onClick={() => setOpenRef(l.reference)} aria-label={`View ${l.reference} from ${l.fullName}`}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ServiceReport
        stats={stats}
        period={period}
        onPeriod={setPeriod}
      />

      {open && (
        <LeadDetail
          lead={open}
          pending={pending}
          lostReasons={meta.lostReasons}
          transitions={meta.transitions}
          busy={busyRef === open.reference}
          onClose={() => {
            setOpenRef(null);
            setPending(null);
          }}
          onStatus={changeStatus}
          onSaved={saved}
          onCancelPending={() => setPending(null)}
        />
      )}
    </div>
  );
}
