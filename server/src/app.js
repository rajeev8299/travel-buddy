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

  // 2. Global Rate Limiter (200 requests per 15 minutes per IP)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." },
  });
  app.use(globalLimiter);

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
