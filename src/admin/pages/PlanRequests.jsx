import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function PlanRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/plan-requests")
      .then((data) => setRequests(data.planRequests))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Plan Requests</h1>

      {error && <p className="admin__error">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && requests.length === 0 && <p className="admin__empty">No plan requests yet.</p>}

      {!loading && requests.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Where</th>
                <th>Arrive</th>
                <th>Depart</th>
                <th>Nights</th>
                <th>Who</th>
                <th>Requested</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.whereTo}</td>
                  <td>{r.arrive || "flexible"}</td>
                  <td>{r.depart || "flexible"}</td>
                  <td>{r.nights ?? "—"}</td>
                  <td>{r.who}</td>
                  <td>{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
