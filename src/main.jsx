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
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";
import { AuthProvider } from "./auth/authContext.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import HeroAdmin from "./admin/pages/HeroAdmin.jsx";
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
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="hero" element={<HeroAdmin />} />
            <Route path="applications" element={<Applications />} />
            <Route path="plan-requests" element={<PlanRequests />} />
            <Route path="buddies" element={<BuddiesAdmin />} />
            <Route path="stories" element={<StoriesAdmin />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          <Route element={<App />}>
            <Route index element={<Home />} />
            <Route path="why-buddy" element={<WhyBuddy />} />
            <Route path="buddies" element={<Buddies />} />
            <Route path="stories" element={<Stories />} />
            <Route path="become-a-buddy" element={<BecomeBuddy />} />
            <Route path="plan" element={<Plan />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
);
