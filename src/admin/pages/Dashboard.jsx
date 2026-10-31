import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  MapPinned,
  ClipboardList,
  Quote,
  UsersRound,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Image,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api";

const TILES = [
  { key: "users", label: "Registered Users", icon: Users, to: "/admin/users", color: "#6366f1" },
  { key: "buddies", label: "Local Buddies", icon: UsersRound, to: "/admin/buddies", color: "#f59e0b" },
  { key: "stories", label: "Traveller Stories", icon: Quote, to: "/admin/stories", color: "#10b981" },
  { key: "planRequests", label: "Trip Requests", icon: MapPinned, to: "/admin/plan-requests", color: "#ec4899" },
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
      <div className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={22} color="var(--orange)" />
          <h1>Executive Operations Dashboard</h1>
        </div>
        <p className="admin-hint">
          Real-time metrics, live traveller submissions, local buddy verification pipeline, and platform content management.
        </p>
      </div>

      {error && <div className="admin-toast admin-toast--error">{error}</div>}

      {stats && (
        <>
          {/* Main Key Performance Metric Cards */}
          <div className="admin-tiles">
            {TILES.map(({ key, label, icon: Icon, to, color }) => (
              <Link to={to} className="admin-tile admin-tile--interactive" key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                  <div
                    style={{
                      background: `${color}18`,
                      color: color,
                      padding: "8px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--orange-deep)", display: "flex", alignItems: "center", gap: 2 }}>
                    View <ArrowRight size={12} />
                  </span>
                </div>
                <strong>{stats[key]}</strong>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Quick Action Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 24 }}>
            {/* Buddy Application Pipeline */}
            <section className="admin-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2>
                  <ClipboardList size={18} strokeWidth={2} aria-hidden="true" /> Buddy Applications
                </h2>
                <Link to="/admin/applications" style={{ fontSize: "0.84rem", color: "var(--orange-deep)", fontWeight: 600, textDecoration: "none" }}>
                  Manage →
                </Link>
              </div>
              <div className="admin-tiles admin-tiles--tight">
                <div className="admin-tile">
                  <strong>{stats.applications.total}</strong>
                  <span>Total</span>
                </div>
                <div className="admin-tile" style={{ borderColor: "#fef3c7" }}>
                  <strong style={{ color: "#d97706" }}>{stats.applications.pending}</strong>
                  <span>Pending</span>
                </div>
                <div className="admin-tile" style={{ borderColor: "#d1fae5" }}>
                  <strong style={{ color: "#059669" }}>{stats.applications.approved}</strong>
                  <span>Approved</span>
                </div>
                <div className="admin-tile" style={{ borderColor: "#fee2e2" }}>
                  <strong style={{ color: "#dc2626" }}>{stats.applications.rejected}</strong>
                  <span>Rejected</span>
                </div>
              </div>
            </section>

            {/* Platform Quick Health & Content Access */}
            <section className="admin-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2>
                  <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" /> Media & System Quicklinks
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  to="/admin/hero"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--sand)",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "var(--ink)",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Image size={16} color="var(--orange-deep)" /> Hero Gallery & Media Manager
                  </span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/admin/plan-requests"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--sand)",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "var(--ink)",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPinned size={16} color="var(--orange-deep)" /> Review Custom Trip Bookings
                  </span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/admin/buddies"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--sand)",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "var(--ink)",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <UsersRound size={16} color="var(--orange-deep)" /> Add or Edit Local Buddies
                  </span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
