import { useCallback, useEffect, useState } from "react";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

const FILTERS = ["all", "pending", "approved", "rejected"];

function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge--${status}`}>{status}</span>;
}

function DetailModal({ id, onClose }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/admin/buddy-applications/${id}`)
      .then((data) => setDetail(data.application))
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="admin-modal__card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.2} />
        </button>

        {error && <p className="admin__error">{error}</p>}
        {!detail && !error && <p>Loading…</p>}

        {detail && (
          <>
            <h2>{detail.full_name}</h2>
            <p className="admin-modal__meta">
              {detail.city}, {detail.state} · {detail.email} · {detail.phone}
            </p>

            <dl className="admin-detail">
              <dt>Date of birth</dt>
              <dd>{detail.dob}</dd>
              <dt>Gender</dt>
              <dd>{detail.gender || "—"}</dd>
              <dt>WhatsApp</dt>
              <dd>{detail.whatsapp || "—"}</dd>
              <dt>Years in city</dt>
              <dd>{detail.years_in_city}</dd>
              <dt>Areas known</dt>
              <dd>{detail.areas || "—"}</dd>
              <dt>Languages</dt>
              <dd>{detail.languages.join(", ") || "—"}</dd>
              <dt>Other language</dt>
              <dd>{detail.other_language || "—"}</dd>
              <dt>Guiding experience</dt>
              <dd>{detail.guiding_years}</dd>
              <dt>Specialities</dt>
              <dd>{detail.specialities.join(", ") || "—"}</dd>
              <dt>Occupation</dt>
              <dd>{detail.occupation || "—"}</dd>
              <dt>Days per week</dt>
              <dd>{detail.days_per_week}</dd>
              <dt>Group sizes</dt>
              <dd>{detail.groupSizes.join(", ") || "—"}</dd>
              <dt>Notice needed</dt>
              <dd>{detail.notice_days || "—"}</dd>
              <dt>Vehicle</dt>
              <dd>{detail.vehicle || "—"}</dd>
              <dt>First aid trained</dt>
              <dd>{detail.firstAid ? "Yes" : "No"}</dd>
              <dt>ID</dt>
              <dd>
                {detail.id_type} — {detail.id_number}
              </dd>
              <dt>Reference 1</dt>
              <dd>
                {detail.ref1_name} · {detail.ref1_phone}
              </dd>
              <dt>Reference 2</dt>
              <dd>{detail.ref2_name ? `${detail.ref2_name} · ${detail.ref2_phone}` : "—"}</dd>
              <dt>Why join</dt>
              <dd>{detail.why_join}</dd>
              <dt>What they'd show a visitor</dt>
              <dd>{detail.show_them}</dd>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const load = useCallback((status) => {
    setLoading(true);
    const path = status && status !== "all" ? `/admin/buddy-applications?status=${status}` : "/admin/buddy-applications";
    api
      .get(path)
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(filter), [filter, load]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/buddy-applications/${id}`, { status });
      setApplications((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1>Buddy Applications</h1>

      <div className="admin-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={f === filter ? "is-active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="admin__error">{error}</p>}
      {loading && <p>Loading…</p>}

      {!loading && applications.length === 0 && <p className="admin__empty">No applications here.</p>}

      {!loading && applications.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Contact</th>
                <th>Languages</th>
                <th>Status</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td>{a.fullName}</td>
                  <td>
                    {a.city}, {a.state}
                  </td>
                  <td>
                    {a.email}
                    <br />
                    {a.phone}
                  </td>
                  <td>{a.languages.join(", ")}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>{a.createdAt}</td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setViewingId(a.id)}
                      aria-label="View details"
                    >
                      <Eye size={15} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm admin-approve"
                      disabled={busyId === a.id || a.status === "approved"}
                      onClick={() => setStatus(a.id, "approved")}
                      aria-label="Approve"
                    >
                      {busyId === a.id ? <Loader2 size={15} className="spin" /> : <Check size={15} strokeWidth={2.4} />}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm admin-reject"
                      disabled={busyId === a.id || a.status === "rejected"}
                      onClick={() => setStatus(a.id, "rejected")}
                      aria-label="Reject"
                    >
                      <X size={15} strokeWidth={2.4} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewingId && <DetailModal id={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  );
}
