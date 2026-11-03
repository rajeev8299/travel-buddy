import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import WhyBuddy from "./pages/WhyBuddy.jsx";
import Buddies from "./pages/Buddies.jsx";
import Stories from "./pages/Stories.jsx";
import BecomeBuddy from "./pages/BecomeBuddy.jsx";
import Plan from "./pages/Plan.jsx";
import BookTrip from "./pages/BookTrip.jsx";
import FoodExplorer from "./pages/FoodExplorer.jsx";
import FoodShopDetail from "./pages/FoodShopDetail.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";
import { AuthProvider } from "./auth/authContext.jsx";
import { RouteTitle } from "./useRouteTitle.js";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import HeroAdmin from "./admin/pages/HeroAdmin.jsx";
import FoodAdmin from "./admin/pages/FoodAdmin.jsx";
import Applications from "./admin/pages/Applications.jsx";
import PlanRequests from "./admin/pages/PlanRequests.jsx";
import BuddiesAdmin from "./admin/pages/BuddiesAdmin.jsx";
import StoriesAdmin from "./admin/pages/StoriesAdmin.jsx";
import AdminUsers from "./admin/pages/Users.jsx";
// Loaded here (not just inside App.jsx) so .btn/.form/.field styles exist
// even when the very first page rendered is an /admin/* route, which never
// mounts <App/>.
import "./App.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <RouteTitle />
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="food-explorer" element={<FoodAdmin />} />
            <Route path="hero" element={<HeroAdmin />} />
            <Route path="applications" element={<Applications />} />
            <Route path="plan-requests" element={<PlanRequests />} />
            <Route path="buddies" element={<BuddiesAdmin />} />
            <Route path="stories" element={<StoriesAdmin />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          <Route element={<App />}>
            <Route index element={<Home />} />
            <Route path="food-explorer" element={<FoodExplorer />} />
            <Route path="food-explorer/:slug" element={<FoodShopDetail />} />
            <Route path="why-buddy" element={<WhyBuddy />} />
            <Route path="buddies" element={<Buddies />} />
            <Route path="stories" element={<Stories />} />
            <Route path="become-a-buddy" element={<BecomeBuddy />} />
            <Route path="plan" element={<Plan />} />
            <Route path="book-trip" element={<BookTrip />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
);

// Register Progressive Web App Service Worker in production/http environments
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  if (window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.info("[PWA] New update ready. Refresh to update.");
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration failed: ", err);
        });
    });
  }
}
