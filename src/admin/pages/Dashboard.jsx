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
  Inbox,
  BellRing,
} from "lucide-react";
import { api } from "../../lib/api";
import NeedsAction from "./NeedsAction";

const TILES = [
  { key: "users", label: "Registered Users", icon: Users, to: "/admin/users", color: "#6366f1" },
  { key: "buddies", label: "Local Buddies", icon: UsersRound, to: "/admin/buddies", color: "#f59e0b" },
  { key: "stories", label: "Traveller Stories", icon: Quote, to: "/admin/stories", color: "#10b981" },
  { key: "planRequests", label: "Trip Requests", icon: MapPinned, to: "/admin/plan-requests", color: "#ec4899" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [ops, setOps] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
    // Today's operations: new leads waiting, reply speed, live alerts.
    Promise.all([api.get("/admin/leads/stats"), api.get("/admin/alerts")])
      .then(([leads, alerts]) => {
        const now = new Date();
        setOps({
          newLeads: leads.byStatus.find((r) => r.status === "new")?.n ?? 0,
          medianResponse: leads.firstResponse?.medianMinutes,
          liveAlerts: alerts.alerts.filter((a) => new Date(a.startsAt) <= now && new Date(a.endsAt) > now).length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={22} color="var(--orange)" aria-hidden="true" />
          <h1>Dashboard</h1>
        </div>
        <p className="admin-hint">What needs doing now first, then the numbers.</p>
      </div>

      {error && <div className="admin-toast admin-toast--error">{error}</div>}

      <NeedsAction />

      {ops && (
        <section aria-labelledby="ops-title" style={{ marginBottom: 24 }}>
          <h2 id="ops-title" style={{ fontSize: "1.05rem", marginBottom: 10 }}>Today&apos;s operations</h2>
          <div className="admin-tiles admin-tiles--tight">
            <Link to="/admin/leads" className="admin-tile admin-tile--interactive" style={{ borderColor: ops.newLeads ? "#fde68a" : undefined }}>
              <Inbox size={20} color="var(--orange-deeper)" aria-hidden="true" />
              <strong>{ops.newLeads}</strong>
              <span>New leads awaiting a reply</span>
            </Link>
            <Link to="/admin/leads" className="admin-tile admin-tile--interactive">
              <TrendingUp size={20} color="var(--orange-deeper)" aria-hidden="true" />
              <strong>{ops.medianResponse != null ? `${ops.medianResponse} min` : "—"}</strong>
              <span>Median first reply, 30 days (target 10 min)</span>
            </Link>
            <Link to="/admin/alerts" className="admin-tile admin-tile--interactive">
              <BellRing size={20} color="var(--orange-deeper)" aria-hidden="true" />
              <strong>{ops.liveAlerts}</strong>
              <span>Live travel alerts</span>
            </Link>
          </div>
        </section>
      )}

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
