import { NavLink, Navigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Users2,
  Quote,
  Image,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/authContext";
import "./admin.css";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/hero", label: "Hero Photos", icon: Image },
  { to: "/admin/applications", label: "Buddy Applications", icon: ClipboardList },
  { to: "/admin/plan-requests", label: "Plan Requests", icon: MapPinned },
  { to: "/admin/buddies", label: "Buddies", icon: Users2 },
  { to: "/admin/stories", label: "Stories", icon: Quote },
  { to: "/admin/users", label: "Users", icon: Users2 },
];

export default function AdminLayout() {
  const { user, ready, signOut } = useAuth();

  if (!ready) return null;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">TravelOnBuddy</div>
        <p className="admin__brand-sub">Admin</p>

        <nav className="admin__nav">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              <Icon size={17} strokeWidth={2} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__me">
          <p>{user.email}</p>
          <button type="button" className="btn btn--ghost" onClick={signOut}>
            <LogOut size={15} strokeWidth={2.2} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
