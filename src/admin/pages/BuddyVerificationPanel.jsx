import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Lock } from "lucide-react";
import { api } from "../../lib/api";

// Verification for one buddy application: send the private link, review each
// document (the file is deleted the moment it's accepted or rejected), record
// reference and interview checks, then approve once nothing is missing.
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
const DOC_STATUS = {
  missing: ["Not uploaded", "muted"],
  uploaded: ["Waiting for your review", "warn"],
  accepted: ["Accepted", "good"],
  rejected: ["Re-upload requested", "warn"],
  replaced: ["Replaced", "muted"],
  expired: ["Deleted unreviewed after 30 days", "muted"],
};
const when = (s) => (s ? new Date(`${s.replace(" ", "T")}${/[TZ]/.test(s) ? "" : "Z"}`).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "");

function DocRow({ appId, doc, onChanged }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [label, tone] = DOC_STATUS[doc.status] ?? [doc.status, "muted"];
  const review = async (decision) => {
    setBusy(true);
    setError("");
    try {
      const r = await api.post(`/admin/buddy-applications/${appId}/documents/${doc.id}/review`, { decision, note: note.trim() || undefined });
      onChanged(r.verification);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="admin-verify-doc">
      <div className="admin-verify-doc__head">
        <strong>{doc.label}{doc.required ? "" : " (optional)"}</strong>
        <span className={`admin-badge admin-badge--state-${tone}`}>{label}</span>
      </div>
      {doc.uploadedAt && <p className="admin-hint">Uploaded {when(doc.uploadedAt)}{doc.mime ? ` · ${doc.mime === "application/pdf" ? "PDF" : "image"}, ${doc.size < 1024 ? "under 1" : Math.round(doc.size / 1024)} KB` : ""}</p>}
      {doc.reviewedAt && (
        <p className="admin-hint">
          {doc.status === "accepted" ? "Accepted" : "Rejected"} by {doc.reviewedBy} · {when(doc.reviewedAt)}{doc.note ? ` — “${doc.note}”` : ""} · <Lock size={11} aria-hidden="true" /> file deleted
        </p>
      )}
      {doc.status === "uploaded" && doc.fileAvailable && (
        <div className="admin-form__actions">
          <a className="btn btn--soft" href={`${API_BASE}/admin/buddy-applications/${appId}/documents/${doc.id}/file`} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} aria-hidden="true" /> Open file
          </a>
          {!rejecting ? (
            <>
              <button type="button" className="btn btn--solid" disabled={busy} onClick={() => review("accept")}>Accept</button>
              <button type="button" className="btn btn--soft" disabled={busy} onClick={() => setRejecting(true)}>Reject…</button>
            </>
          ) : (
            <>
              <label className="visually-hidden" htmlFor={`rej-${doc.id}`}>Why are you rejecting the {doc.label.toLowerCase()}?</label>
              <input id={`rej-${doc.id}`} className="admin-input" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What to fix, e.g. “Photo is blurry — please retake”" autoFocus />
              <button type="button" className="btn btn--solid" disabled={busy || !note.trim()} onClick={() => review("reject")}>Reject and ask again</button>
              <button type="button" className="btn btn--soft" onClick={() => setRejecting(false)}>Cancel</button>
            </>
          )}
        </div>
      )}
      {doc.status === "uploaded" && <p className="admin-hint">The file is deleted as soon as you accept or reject it.</p>}
      {error && <p className="admin__error" role="alert">{error}</p>}
    </li>
  );
}

function CheckRow({ appId, check, onChanged }) {
  const [outcome, setOutcome] = useState("passed");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api.post(`/admin/buddy-applications/${appId}/checks`, { kind: check.kind, outcome, note });
      onChanged(r.verification);
      setNote("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="admin-verify-doc">
      <div className="admin-verify-doc__head">
        <strong>{check.label}</strong>
        <span className={`admin-badge admin-badge--state-${check.outcome === "passed" ? "good" : check.outcome === "failed" ? "warn" : "muted"}`}>
          {check.outcome === "passed" ? "Passed" : check.outcome === "failed" ? "Failed" : "Not done"}
        </span>
      </div>
      {check.at && <p className="admin-hint">{check.by} · {when(check.at)} — {check.note}</p>}
      <form className="admin-inline-form" onSubmit={save}>
        <label className="visually-hidden" htmlFor={`co-${check.kind}`}>Outcome of {check.label.toLowerCase()}</label>
        <select id={`co-${check.kind}`} className="admin-select" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
        <label className="visually-hidden" htmlFor={`cn-${check.kind}`}>Note for {check.label.toLowerCase()}</label>
        <input id={`cn-${check.kind}`} className="admin-input" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Who you spoke to, what they said" />
        <button type="submit" className="btn btn--soft" disabled={busy || !note.trim()}>{check.outcome ? "Record again" : "Record"}</button>
      </form>
      {error && <p className="admin__error" role="alert">{error}</p>}
    </li>
  );
}

export default function BuddyVerificationPanel({ application, onStatusChanged }) {
  const [v, setV] = useState(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const id = application.id;

  const load = useCallback(() => {
    api.get(`/admin/buddy-applications/${id}/verification`).then((d) => setV(d.verification)).catch((err) => setError(err.message));
  }, [id]);
  useEffect(load, [load]);

  const requestDocs = async () => {
    setBusy(true);
    setError("");
    try {
      setLink(await api.post(`/admin/buddy-applications/${id}/request-documents`));
      load();
      onStatusChanged(id, application.status === "pending" ? "docs_requested" : application.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const decide = async (status) => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/admin/buddy-applications/${id}`, { status });
      onStatusChanged(id, status);
      setConfirmReject(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!v) return error ? <p className="admin__error" role="alert">{error}</p> : <p>Loading verification…</p>;
  const closed = ["approved", "rejected"].includes(v.status);
  const phone = application.phone ? `91${application.phone.replace(/\D/g, "").slice(-10)}` : null;

  return (
    <section aria-labelledby="verify-title" className="admin-verify">
      <h3 id="verify-title" className="admin-subhead"><Lock size={15} aria-hidden="true" /> Verification</h3>
      <p className="admin-hint">Documents are encrypted and deleted as soon as you accept or reject them. Every file you open is logged.</p>

      {!closed && (
        <div className="admin-card">
          <p>
            {v.link
              ? `Private link active until ${when(v.link.expiresAt)}${v.link.lastUsedAt ? `, last opened ${when(v.link.lastUsedAt)}` : ", not opened yet"}.`
              : "No working link. Send one to ask for documents and details."}
          </p>
          <button type="button" className="btn btn--soft" disabled={busy} onClick={requestDocs}>{v.link ? "Send a new link" : "Request documents"}</button>
          {link && (
            <div className="admin-note" role="note">
              <strong>Link emailed to the applicant (if email is set up). It won&apos;t be shown again:</strong>
              <input className="admin-input admin-mono" readOnly value={link.url} aria-label="Applicant's private link" onFocus={(e) => e.target.select()} />
              <div className="admin-form__actions">
                <button type="button" className="btn btn--soft" onClick={() => navigator.clipboard?.writeText(link.url)}>Copy link</button>
                {phone && <a className="btn btn--soft" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${phone}?text=${encodeURIComponent(`Namaste! Please complete your buddy application here (private link, don't share it): ${link.url}`)}`}>Send on WhatsApp</a>}
              </div>
            </div>
          )}
        </div>
      )}

      <h4>Documents</h4>
      <ul className="admin-verify-list">{v.documents.map((d) => <DocRow key={d.kind} appId={id} doc={d} onChanged={setV} />)}</ul>

      <h4>Our checks</h4>
      <ul className="admin-verify-list">{v.checks.map((c) => <CheckRow key={c.kind} appId={id} check={c} onChanged={setV} />)}</ul>

      <h4>Details from the applicant</h4>
      {v.profile ? (
        <dl className="admin-detail">
          <dt>Public name</dt><dd>{v.profile.displayName || "—"}</dd>
          <dt>Introduction</dt><dd>{v.profile.intro || "—"}</dd>
          <dt>Area</dt><dd>{v.profile.locality || "—"}</dd>
          <dt>Emergency contact</dt><dd>{v.profile.emergencyName ? `${v.profile.emergencyName} · ${v.profile.emergencyPhone}` : "—"}</dd>
          <dt>Availability</dt><dd>{v.profile.availability || "—"}</dd>
          <dt>Agreed</dt><dd>{v.profile.consentAt ? `Document checks ${when(v.profile.consentAt)}` : "Not yet"}{v.profile.conductAgreedAt ? ` · Code of conduct ${when(v.profile.conductAgreedAt)}` : ""}</dd>
          <dt>Submitted</dt><dd>{v.profile.submittedAt ? when(v.profile.submittedAt) : "Not yet"}</dd>
        </dl>
      ) : (
        <p className="admin-hint">Nothing yet.</p>
      )}

      {!closed && (
        <div className="admin-note" role="note">
          <strong>Ready to approve?</strong>
          {v.approvalGaps.length ? <ul>{v.approvalGaps.map((g) => <li key={g}>{g}</li>)}</ul> : <p>Every check is done.</p>}
          <div className="admin-form__actions">
            <button type="button" className="btn btn--solid" disabled={busy || v.approvalGaps.length > 0} onClick={() => decide("approved")}>Approve buddy</button>
            {!confirmReject ? (
              <button type="button" className="btn btn--soft" disabled={busy} onClick={() => setConfirmReject(true)}>Reject application…</button>
            ) : (
              <>
                <span>Rejecting deletes any files still waiting and closes their link.</span>
                <button type="button" className="btn btn--solid" disabled={busy} onClick={() => decide("rejected")}>Reject</button>
                <button type="button" className="btn btn--soft" onClick={() => setConfirmReject(false)}>Keep open</button>
              </>
            )}
          </div>
        </div>
      )}
      {closed && <p className="admin-hint">This application is {v.status}.</p>}
      {error && <p className="admin__error" role="alert">{error}</p>}
    </section>
  );
}
