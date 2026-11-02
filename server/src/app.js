import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import authRoutes from "./routes/auth.js";
import buddiesRoutes from "./routes/buddies.js";
import storiesRoutes from "./routes/stories.js";
import buddyApplicationsRoutes from "./routes/buddyApplications.js";
import planRequestsRoutes from "./routes/planRequests.js";
import heroSlidesRoutes from "./routes/heroSlides.js";
import adminRoutes from "./routes/admin/index.js";
import leadsRoutes from "./routes/leads.js";
import publicAlertsRoutes from "./routes/publicAlerts.js";
import eventsRoutes from "./routes/events.js";
import blogRoutes from "./routes/blog.js";
import editorialRoutes from "./routes/editorial.js";
import bookingRoutes from "./routes/booking.js";
import buddyVerificationRoutes from "./routes/buddyVerification.js";
import { uploadsDir } from "./uploads.js";
import { corsOrigin, requireJsonBody, trustProxySetting } from "./middleware/requestGuards.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", trustProxySetting());

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed per-frontend proxy or allow Vite inline scripts in dev
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS runs before the rate limiters so a 429 still carries CORS headers —
  // otherwise the browser hides it and the UI reports "Can't reach the server".
  app.use(cors({ origin: corsOrigin(), credentials: true }));

  // 2. Global Rate Limiter (300 requests per 15 minutes per IP). The public
  // site's background traffic (analytics events, the live-alert feed) has its
  // own bucket: every page view makes 2–3 of those calls, and a hotel or tour
  // group behind one IP would otherwise use up the budget its enquiries need.
  // The site's server also reads the blog API (cached for a minute per page).
  const SITE_FEEDS = ["/api/events", "/api/public", "/api/blog"];
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    skip: (req) => SITE_FEEDS.some((p) => req.path.startsWith(p)),
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." },
  });
  app.use(globalLimiter);
  app.use(
    SITE_FEEDS,
    rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false, message: { message: "Too many requests." } })
  );

  // Customer booking pages: plenty for normal use; the links are unguessable
  // anyway, but this caps scripted probing. Asking for a new link (it sends an
  // email) is much tighter.
  app.use(
    "/api/booking",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { message: "Too many requests. Please try again shortly." } })
  );
  app.use(
    "/api/buddy-verification",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { message: "Too many requests. Please try again shortly." } })
  );
  app.use(
    "/api/booking/link",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { message: "Too many link requests. Please try again later or contact us." } })
  );

  // Enquiries: generous enough for a group sending several, tight enough to
  // slow form spam.
  app.use(
    "/api/leads",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      skip: (req) => req.method !== "POST",
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many enquiries from this connection. Please try again shortly, or message us on WhatsApp." },
    })
  );

  // 3. Stricter limit on the endpoints that check a password (20 failed
  // attempts per 15 minutes). /auth/me and /auth/logout are deliberately
  // left out: the React app calls /auth/me on every page load, and counting
  // those locked people out of login just for browsing.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts, please try again in 15 minutes." },
  });
  app.use(["/api/auth/login", "/api/auth/signup", "/api/auth/change-password"], authLimiter);

  // Every JSON body the API accepts is a short form; uploads are multipart and
  // limited separately by multer.
  app.use("/api", requireJsonBody);
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(uploadsDir));

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/buddies", buddiesRoutes);
  app.use("/api/stories", storiesRoutes);
  app.use("/api/buddy-applications", buddyApplicationsRoutes);
  app.use("/api/plan-requests", planRequestsRoutes);
  app.use("/api/hero-slides", heroSlidesRoutes);
  app.use("/api/leads", leadsRoutes);
  app.use("/api/public", publicAlertsRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/blog", blogRoutes);
  app.use("/api/editorial", editorialRoutes);
  app.use("/api/booking", bookingRoutes);
  app.use("/api/buddy-verification", buddyVerificationRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: "Not found." });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Upload problems (too big, wrong field) are the caller's fault.
    if (err instanceof multer.MulterError) {
      return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message: err.message });
    }
    // Errors explicitly marked safe to show: CORS rejections, rejected file
    // types, and body-parser's own (malformed JSON → 400, too large → 413).
    // Anything else could leak internals, so it gets a generic message.
    if (err.expose && err.status >= 400 && err.status < 500) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong on our end." });
  });

  return app;
}
