import { useEffect, useState } from "react";
import { MapPin, Calendar, Clock, User, Phone, Mail, CheckCircle, Clock3 } from "lucide-react";
import { api } from "../../lib/api";

export default function PlanRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/admin/plan-requests")
      .then((data) => setRequests(data.planRequests || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/plan-requests/${id}/status`, { status });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      setSuccess(`Request #${id} marked as ${status}!`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Custom Trip Bookings & Plan Requests</h1>
        <p className="admin-hint">
          All traveller custom itineraries received through "Plan My Trip" with real customer contact details, dates, preferred pacing, and assigned local buddies.
        </p>
      </div>

      {error && <div className="admin-toast admin-toast--error">{error}</div>}
      {success && <div className="admin-toast admin-toast--success">{success}</div>}
      {loading && <p>Loading requests…</p>}
      {!loading && requests.length === 0 && <p className="admin__empty">No trip plan requests received yet.</p>}

      {!loading && requests.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Traveller Details</th>
                <th>Destination</th>
                <th>Dates & Nights</th>
                <th>Pacing & Buddy</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong style={{ color: "var(--orange-deep)", fontFamily: "monospace", fontSize: "0.95rem" }}>
                      {r.id}
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>{r.fullName || "Guest Traveller"}</div>
                    {r.email && (
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={12} /> {r.email}
                      </div>
                    )}
                    {r.phone && (
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={12} /> {r.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                      <MapPin size={14} color="var(--orange)" /> {r.whereTo}
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{r.who}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.82rem" }}>
                      <Calendar size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                      {r.arrive || "TBD"} → {r.depart || "TBD"}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                      {r.nights ? `${r.nights} night(s)` : "Flexible dates"}
                    </div>
                  </td>
                  <td>
                    <div>{r.buddyName ? <strong>Buddy: {r.buddyName}</strong> : <span style={{ color: "var(--muted)" }}>Any local guide</span>}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{r.pace || r.style || "Balanced exploration"}</div>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${r.status || "pending"}`}>
                      {r.status || "pending"}
                    </span>
                  </td>
                  <td>
                    <select
                      value={r.status || "pending"}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.8rem",
                        borderRadius: "6px",
                        border: "1px solid var(--line)",
                        background: "#fff",
                        cursor: "pointer"
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
