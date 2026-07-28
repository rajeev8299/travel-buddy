import { useEffect, useState } from "react";
import { Users, MapPinned, ClipboardList, Quote, UsersRound } from "lucide-react";
import { api } from "../../lib/api";

const TILES = [
  { key: "users", label: "Registered users", icon: Users },
  { key: "buddies", label: "Buddies listed", icon: UsersRound },
  { key: "stories", label: "Stories published", icon: Quote },
  { key: "planRequests", label: "Plan requests", icon: MapPinned },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      {error && <p className="admin__error">{error}</p>}

      {stats && (
        <>
          <div className="admin-tiles">
            {TILES.map(({ key, label, icon: Icon }) => (
              <div className="admin-tile" key={key}>
                <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                <strong>{stats[key]}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <section className="admin-card">
            <h2>
              <ClipboardList size={18} strokeWidth={2} aria-hidden="true" /> Buddy applications
            </h2>
            <div className="admin-tiles admin-tiles--tight">
              <div className="admin-tile">
                <strong>{stats.applications.total}</strong>
                <span>Total</span>
              </div>
              <div className="admin-tile">
                <strong>{stats.applications.pending}</strong>
                <span>Pending</span>
              </div>
              <div className="admin-tile">
                <strong>{stats.applications.approved}</strong>
                <span>Approved</span>
              </div>
              <div className="admin-tile">
                <strong>{stats.applications.rejected}</strong>
                <span>Rejected</span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
