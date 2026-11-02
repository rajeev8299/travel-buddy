"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { API_URL, CONTACT_EMAIL } from "@/lib/site";

// A shortlisted buddy's private page: upload verification documents and
// complete their details. The link's secret is in the URL fragment (#t=…),
// never sent to a server except in request bodies. Files go straight to the
// API, which encrypts them; they're deleted once our team has checked them.

interface Doc {
  kind: string;
  label: string;
  hint: string;
  required: boolean;
  status: "missing" | "uploaded" | "accepted" | "rejected";
  note: string | null;
  canUpload: boolean;
}
interface Profile {
  displayName: string;
  intro: string;
  locality: string;
  emergencyName: string;
  emergencyPhone: string;
  availability: string;
  consent: boolean;
  conduct: boolean;
}
interface Verification {
  firstName: string;
  status: string;
  documents: Doc[];
  profile: Profile;
  submittedAt: string | null;
  gaps: string[];
}

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readToken = () => new URLSearchParams(window.location.hash.slice(1)).get("t") ?? "";
const MAX_MB = 8;
const STATUS: Record<Doc["status"], { text: string; className: string }> = {
  missing: { text: "Not uploaded yet", className: "badge" },
  uploaded: { text: "Uploaded — waiting for our check", className: "badge badge--review" },
  accepted: { text: "✓ Checked", className: "badge badge--verified" },
  rejected: { text: "Please upload again", className: "badge badge--warn" },
};

async function postJson<T>(path: string, body: object) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    referrerPolicy: "no-referrer",
  });
  return { ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as T & { message?: string; gaps?: string[] } };
}

function DocumentRow({ doc, token, onUpdated, disabled }: { doc: Doc; token: string; onUpdated: (v: Verification) => void; disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const s = STATUS[doc.status];
  const accept = doc.kind === "photo" ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,application/pdf";

  const upload = async (file?: File) => {
    if (!file) return;
    setError("");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`That file is over ${MAX_MB} MB — please upload a smaller copy.`);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("token", token); // before the file, so it's read first
      fd.append("kind", doc.kind);
      fd.append("file", file);
      const res = await fetch(`${API_URL}/buddy-verification/documents`, { method: "POST", body: fd, referrerPolicy: "no-referrer" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Upload failed — please try again.");
      onUpdated(data.verification);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed — please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <li className="verify-doc">
      <div className="verify-doc__head">
        <strong>{doc.label}{doc.required ? "" : " (optional)"}</strong>
        <span className={s.className}>{s.text}</span>
      </div>
      <p className="verify-muted">{doc.hint}</p>
      {doc.status === "rejected" && doc.note && <p className="field__error">Our team says: {doc.note}</p>}
      {doc.canUpload && (
        <div className="verify-doc__upload">
          <label className="btn btn--outline">
            {busy ? "Uploading…" : doc.status === "missing" ? "Choose file" : "Replace file"}
            <input ref={inputRef} type="file" accept={accept} className="visually-hidden" disabled={busy || disabled} onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          <span className="verify-muted">{doc.kind === "photo" ? "JPEG, PNG or WEBP" : "Photo or PDF"}, up to {MAX_MB} MB</span>
        </div>
      )}
      {error && <p className="field__error" role="alert">{error}</p>}
    </li>
  );
}

export default function BuddyVerification() {
  const token = useSyncExternalStore(subscribeHash, readToken, () => "");
  const [state, setState] = useState<{ status: "loading" | "ok" | "invalid" | "error"; v?: Verification; uploads?: boolean }>({ status: "loading" });
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [gaps, setGaps] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (token ? postJson<{ verification: Verification; uploadsAvailable: boolean }>("/buddy-verification/view", { token }) : Promise.resolve(null))
      .then((r) => {
        if (cancelled) return;
        if (!r) return setState({ status: "invalid" });
        if (r.ok) {
          setState({ status: "ok", v: r.data.verification, uploads: r.data.uploadsAvailable });
          setForm(r.data.verification.profile);
        } else setState({ status: r.status === 404 || r.status === 400 ? "invalid" : "error" });
      })
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const update = (v: Verification) => setState((s) => ({ ...s, v }));
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => (f ? { ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value } : f));

  const saveDetails = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form) return false;
    setSaving(true);
    setMessage("");
    try {
      const r = await postJson<{ verification: Verification }>("/buddy-verification/profile", { token, ...form });
      if (!r.ok) throw new Error(r.data.message || "Couldn't save — please try again.");
      update(r.data.verification);
      setMessage("Your details are saved.");
      return true;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't save — please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!(await saveDetails())) return;
    setSaving(true);
    try {
      const r = await postJson<{ verification: Verification }>("/buddy-verification/submit", { token });
      if (r.ok) {
        update(r.data.verification);
        setGaps([]);
        setMessage("Thank you — sent to our team for checking.");
      } else {
        setGaps(r.data.gaps ?? []);
        setMessage(r.data.message || "Please check the form.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (state.status === "loading") return <p aria-live="polite">Loading…</p>;
  if (state.status !== "ok" || !state.v || !form) {
    return (
      <div className="notice notice--warn" role="alert">
        <span aria-hidden="true">!</span>
        <div>
          <strong>{state.status === "error" ? "We couldn't load this page just now" : "This link isn't valid or has expired"}</strong>
          {state.status === "error" ? "Please try again in a minute." : "Links stop working after 14 days, when we send a newer one, or once your checks are complete."}{" "}
          Contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll help.
        </div>
      </div>
    );
  }

  const v = state.v;
  const submitted = Boolean(v.submittedAt);
  return (
    <div className="stack">
      <p>Namaste {v.firstName} — thank you for applying. To finish your application, please upload a few documents and complete your details.</p>

      <section className="notice notice--info" aria-labelledby="privacy-title">
        <span aria-hidden="true">🔒</span>
        <div>
          <strong id="privacy-title">How we handle your documents</strong>
          They&apos;re encrypted as soon as they reach us and seen only by our verification team. Once a document has been checked, we
          delete the file and keep only a note that it was checked, when, and the result. We never show them to travellers.
        </div>
      </section>

      {submitted && (
        <div className="notice notice--info" role="status">
          <span aria-hidden="true">✓</span>
          <div><strong>Sent for checking</strong>Our team will review your documents and contact you. If anything needs another look, it&apos;ll show below.</div>
        </div>
      )}

      {!state.uploads && (
        <div className="notice notice--warn" role="alert"><span aria-hidden="true">!</span><div><strong>Uploads are paused</strong>Please contact our team; you can still save your details.</div></div>
      )}

      <section aria-labelledby="docs-title">
        <h2 id="docs-title" style={{ fontSize: "1.25rem" }}>1. Your documents</h2>
        <ul className="verify-docs">
          {v.documents.map((d) => <DocumentRow key={d.kind} doc={d} token={token} onUpdated={update} disabled={!state.uploads} />)}
        </ul>
      </section>

      <form onSubmit={saveDetails} className="stack" aria-labelledby="details-title">
        <h2 id="details-title" style={{ fontSize: "1.25rem" }}>2. Your details</h2>
        <fieldset className="verify-fieldset">
          <legend>Shown to travellers</legend>
          <div className="field">
            <label htmlFor="v-name">Name travellers will see</label>
            <input id="v-name" maxLength={80} value={form.displayName} onChange={set("displayName")} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="v-intro">Short introduction <span className="verify-muted">({form.intro.length}/400)</span></label>
            <textarea id="v-intro" rows={3} maxLength={400} value={form.intro} onChange={set("intro")} placeholder="Who you are, what you love showing visitors." />
          </div>
        </fieldset>
        <fieldset className="verify-fieldset">
          <legend>Private — only our team sees this</legend>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="v-locality">Area where you live</label>
              <input id="v-locality" maxLength={80} value={form.locality} onChange={set("locality")} placeholder="e.g. Bhelupur, Varanasi" autoComplete="address-level3" />
            </div>
            <div className="field">
              <label htmlFor="v-ename">Emergency contact — name</label>
              <input id="v-ename" maxLength={80} value={form.emergencyName} onChange={set("emergencyName")} />
            </div>
            <div className="field">
              <label htmlFor="v-ephone">Emergency contact — mobile</label>
              <input id="v-ephone" type="tel" inputMode="numeric" maxLength={14} value={form.emergencyPhone} onChange={set("emergencyPhone")} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="v-avail">When you&apos;re usually available <span className="verify-muted">(optional)</span></label>
            <input id="v-avail" maxLength={300} value={form.availability} onChange={set("availability")} placeholder="e.g. Weekends, and weekday evenings after 5pm" />
          </div>
        </fieldset>
        <label className="verify-check">
          <input type="checkbox" checked={form.consent} onChange={set("consent")} />
          <span>I agree that Varanasi Trip Companion may check these documents and contact my references, and understand the files are deleted once checked.</span>
        </label>
        <label className="verify-check">
          <input type="checkbox" checked={form.conduct} onChange={set("conduct")} />
          <span>I agree to the buddy code of conduct: honest prices, no commission-driven shopping stops, respect for travellers&apos; safety and privacy.</span>
        </label>
        <div className="btn-row">
          <button type="submit" className="btn btn--outline" disabled={saving}>{saving ? "Saving…" : "Save details"}</button>
          <button type="button" className="btn btn--primary" disabled={saving || submitted} onClick={submit}>{submitted ? "Sent for checking" : "Send for checking"}</button>
        </div>
        <p role="status" aria-live="polite">{message}</p>
        {gaps.length > 0 && (
          <div className="notice notice--warn" role="alert">
            <span aria-hidden="true">!</span>
            <div><strong>Still needed</strong><ul style={{ margin: "4px 0 0", paddingLeft: "1.2em" }}>{gaps.map((g) => <li key={g}>{g}</li>)}</ul></div>
          </div>
        )}
      </form>
    </div>
  );
}
