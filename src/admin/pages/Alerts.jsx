import { useCallback, useEffect, useState } from "react";
import { BellRing, Trash2, ExternalLink } from "lucide-react";
import { api } from "../../lib/api";

// "Today in Varanasi" alerts shown on the public site (FR-GUIDE-02). Every
// alert expires — at most 72 hours after it is posted — so stale warnings
// never linger. Post from a phone in under a minute.
const SITE_URL = (import.meta.env.VITE_SITE_URL || "http://localhost:3100").replace(/\/$/, "");
const DURATIONS = [2, 6, 12, 24, 48, 72];
const SEVERITY = {
  info: { label: "Info", hint: "Good to know (e.g. Aarti starting earlier this week)" },
  advisory: { label: "Advisory", hint: "Plan around it (e.g. heavy festival crowds, road closures)" },
  warning: { label: "Warning", hint: "Affects plans now (e.g. boating suspended, temple closed)" },
};

const fmt = (iso) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const isActive = (a) => new Date(a.startsAt) <= new Date() && new Date(a.endsAt) > new Date();

function remaining(iso) {
  const mins = Math.round((new Date(iso) - Date.now()) / 60000);
  if (mins <= 0) return "expired";
  if (mins < 60) return `${mins} min left`;
  return `${Math.round(mins / 60)} h left`;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ title: "", body: "", severity: "info", hours: 24 });
  const [posting, setPosting] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const load = useCallback(() => {
    api
      .get("/admin/alerts")
      .then((d) => setAlerts(d.alerts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "hours" ? Number(e.target.value) : e.target.value }));

  const post = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFieldError("Add a short title — it's what travellers see first.");
      return;
    }
    setFieldError("");
    setPosting(true);
    try {
      const r = await api.post("/admin/alerts", { title: form.title.trim(), body: form.body.trim() || undefined, severity: form.severity, hours: form.hours });
      setForm({ title: "", body: "", severity: "info", hours: 24 });
      setToast(`Alert posted — live until ${fmt(r.endsAt)}.`);
      setTimeout(() => setToast(""), 5000);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Take down "${a.title}"? It disappears from the website straight away.`)) return;
    try {
      await api.del(`/admin/alerts/${a.id}`);
      setAlerts((prev) => prev.filter((x) => x.id !== a.id));
      setToast("Alert removed.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      setError(err.message);
    }
  };

  const active = alerts.filter(isActive);
  const past = alerts.filter((a) => !isActive(a)).slice(0, 15);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Travel alerts</h1>
        <p className="admin-hint">
          Shown on the website&apos;s alert strip and the{" "}
          <a href={`${SITE_URL}/travel-guide/today`} target="_blank" rel="noopener noreferrer">
            Today in Varanasi <ExternalLink size={12} aria-hidden="true" />
          </a>{" "}
          page. Check river level, Aarti changes and closures each morning and afternoon, and post anything that changes plans.
        </p>
      </div>

      {error && <div className="admin-toast admin-toast--error" role="alert">{error}</div>}
      {toast && <div className="admin-toast admin-toast--success" role="status">{toast}</div>}

      <form className="admin-card admin-form" onSubmit={post} noValidate aria-labelledby="new-alert">
        <h2 id="new-alert"><BellRing size={18} aria-hidden="true" /> Post an alert</h2>
        <div className="admin-field">
          <label htmlFor="alert-title">Title</label>
          <input
            id="alert-title"
            className="admin-input"
            maxLength={140}
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Boating suspended today — river above the danger mark"
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? "alert-title-err alert-title-count" : "alert-title-count"}
          />
          <p id="alert-title-count" className="admin-hint">{form.title.length}/140 characters</p>
          {fieldError && <p id="alert-title-err" className="admin__error">{fieldError}</p>}
        </div>
        <div className="admin-field">
          <label htmlFor="alert-body">Details <span className="admin-hint">(optional — what to do instead, source)</span></label>
          <textarea id="alert-body" className="admin-textarea" rows={3} maxLength={600} value={form.body} onChange={set("body")} />
        </div>
        <div className="admin-form__row">
          <fieldset className="admin-field">
            <legend>Severity</legend>
            {Object.entries(SEVERITY).map(([k, v]) => (
              <label key={k} className="admin-radio">
                <input type="radio" name="severity" value={k} checked={form.severity === k} onChange={set("severity")} />
                <span><strong>{v.label}</strong> — {v.hint}</span>
              </label>
            ))}
          </fieldset>
          <div className="admin-field">
            <label htmlFor="alert-hours">Expires after</label>
            <select id="alert-hours" className="admin-select" value={form.hours} onChange={set("hours")}>
              {DURATIONS.map((h) => <option key={h} value={h}>{h} hours</option>)}
            </select>
            <p className="admin-hint">Maximum 72 hours. Post a fresh alert if it still applies.</p>
          </div>
        </div>
        <button type="submit" className="btn btn--solid" disabled={posting}>{posting ? "Posting…" : "Post alert"}</button>
      </form>

      <h2 className="admin-subhead">Live now ({active.length})</h2>
      {loading && <p>Loading…</p>}
      {!loading && active.length === 0 && <p className="admin__empty">No live alerts. The website says so honestly — it never claims &ldquo;all clear&rdquo;.</p>}
      <ul className="admin-alerts">
        {active.map((a) => (
          <li key={a.id} className={`admin-alert admin-alert--${a.severity}`}>
            <div>
              <span className={`admin-badge admin-badge--sev-${a.severity}`}>{SEVERITY[a.severity]?.label}</span>
              <strong>{a.title}</strong>
              {a.body && <p>{a.body}</p>}
              <p className="admin-sub">Posted {fmt(a.startsAt)} by {a.postedBy || "—"} · until {fmt(a.endsAt)} · {remaining(a.endsAt)}</p>
            </div>
            <button type="button" className="btn btn--soft" onClick={() => remove(a)} aria-label={`Take down alert: ${a.title}`}>
              <Trash2 size={15} aria-hidden="true" /> Take down
            </button>
          </li>
        ))}
      </ul>

      {past.length > 0 && (
        <>
          <h2 className="admin-subhead">Recently expired</h2>
          <ul className="admin-alerts admin-alerts--past">
            {past.map((a) => (
              <li key={a.id} className="admin-alert">
                <div>
                  <strong>{a.title}</strong>
                  <p className="admin-sub">{fmt(a.startsAt)} → {fmt(a.endsAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
