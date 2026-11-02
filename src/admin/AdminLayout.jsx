import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Users2,
  Quote,
  Image,
  Inbox,
  BellRing,
  Newspaper,
  UserRound,
} from "lucide-react";
import { useAuth } from "../auth/authContext";
import { isStaff, ROLE_LABEL, STAFF_ROLES } from "./roles";
import UserMenu from "./UserMenu";
import "./admin.css";

// Grouped by job; the old TravelOnBuddy site's modules sit apart while the
// platform moves over. Links without `roles` are admin-only.
const LINKS = [
  { group: "Operations", to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { group: "Operations", to: "/admin/leads", label: "Enquiries & bookings", icon: Inbox },
  { group: "Operations", to: "/admin/alerts", label: "Travel Alerts", icon: BellRing },
  // Not "active" on the profile page, which lives under /admin/blog too.
  { group: "Content", to: "/admin/blog", label: "Blog", authorLabel: "My articles", icon: Newspaper, roles: STAFF_ROLES, except: "/admin/blog/profile" },
  { group: "Content", to: "/admin/blog/profile", label: "My profile", icon: UserRound, roles: STAFF_ROLES },
  { group: "People", to: "/admin/applications", label: "Buddy Applications", icon: ClipboardList },
  { group: "People", to: "/admin/users", label: "Users", icon: Users2 },
  { group: "Old site", to: "/admin/hero", label: "Hero Photos", icon: Image },
  { group: "Old site", to: "/admin/plan-requests", label: "Plan Requests", icon: MapPinned },
  { group: "Old site", to: "/admin/buddies", label: "Buddies", icon: Users2 },
  { group: "Old site", to: "/admin/stories", label: "Stories", icon: Quote },
];

export default function AdminLayout() {
  const { user, ready, signOut } = useAuth();
  const { pathname } = useLocation();

  if (!ready) return null;
  if (!user || !isStaff(user.role)) return <Navigate to="/admin/login" replace />;
  // Links without `roles` are admin-only. Authors and editors land on the blog.
  const links = LINKS.filter((l) => (l.roles ?? ["admin"]).includes(user.role));
  if (user.role !== "admin" && !pathname.startsWith("/admin/blog")) return <Navigate to="/admin/blog" replace />;

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">TravelOnBuddy</div>
        <p className="admin__brand-sub">{ROLE_LABEL[user.role]}</p>

        <nav className="admin__nav">
          {[...new Set(links.map((l) => l.group))].map((group) => {
            const id = `nav-${group.toLowerCase().replace(/\W+/g, "-")}`;
            const labelled = new Set(links.map((l) => l.group)).size > 1; // authors have one group; no heading needed
            return (
              <div key={group} className="admin__nav-group" role="group" aria-labelledby={labelled ? id : undefined}>
                {labelled && <p id={id} className="admin__nav-label">{group}</p>}
                {links.filter((l) => l.group === group).map(({ to, label, authorLabel, icon: Icon, end, except }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => (isActive && !(except && pathname.startsWith(except)) ? "is-active" : undefined)}
                  >
                    <Icon size={17} strokeWidth={2} aria-hidden="true" />
                    {user.role === "author" && authorLabel ? authorLabel : label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <UserMenu user={user} onSignOut={signOut} />
      </aside>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
