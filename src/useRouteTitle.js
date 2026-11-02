import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "TravelOnBuddy";

// Hash routes never reload the page, so the <title> has to be set here or
// every screen keeps the first one — which screen readers announce and tab
// strips show.
const TITLES = {
  "/": `${SITE} — Travel Together, Travel Better`,
  "/why-buddy": "Why Buddy",
  "/buddies": "Your Buddies",
  "/stories": "Stories",
  "/become-a-buddy": "Become a Buddy",
  "/plan": "Plan My Trip",
  "/book-trip": "Book Your Trip",
  "/login": "Log In",
  "/signup": "Sign Up",
  "/admin": "Dashboard · Admin",
  "/admin/login": "Admin Sign In",
  "/admin/hero": "Hero Photos · Admin",
  "/admin/applications": "Buddy Applications · Admin",
  "/admin/plan-requests": "Plan Requests · Admin",
  "/admin/buddies": "Buddies · Admin",
  "/admin/stories": "Stories · Admin",
  "/admin/users": "Users · Admin",
  "/admin/leads": "Leads · Admin",
  "/admin/alerts": "Travel Alerts · Admin",
  "/admin/blog": "Blog · Admin",
  "/admin/blog/profile": "My Profile · Admin",
};

export function RouteTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Article editor addresses carry ids (/admin/blog/3/7).
    const title = TITLES[pathname] ?? (pathname.startsWith("/admin/blog/") ? "Edit Article · Admin" : "Page Not Found");
    document.title = pathname === "/" ? title : `${title} — ${SITE}`;
  }, [pathname]);
  return null;
}
