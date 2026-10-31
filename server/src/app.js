import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import buddiesRoutes from "./routes/buddies.js";
import storiesRoutes from "./routes/stories.js";
import buddyApplicationsRoutes from "./routes/buddyApplications.js";
import planRequestsRoutes from "./routes/planRequests.js";
import heroSlidesRoutes from "./routes/heroSlides.js";
import adminRoutes from "./routes/admin/index.js";
import { uploadsDir } from "./uploads.js";

export function createApp() {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed per-frontend proxy or allow Vite inline scripts in dev
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // 2. Global Rate Limiter (200 requests per 15 minutes per IP)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." },
  });
  app.use(globalLimiter);

  // 3. Stricter Rate Limiter for Auth / Login (20 attempts per 15 minutes)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts, please try again in 15 minutes." },
  });
  app.use("/api/auth", authLimiter);

  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin === clientOrigin || origin === "null") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
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
    if (err.message === "Not allowed by CORS") {
      return res.status(403).json({ message: "Not allowed by CORS." });
    }
    // Multer errors (bad file type, over the size limit) are the caller's
    // fault — worth a 400 with the real reason instead of a generic 500.
    if (err.name === "MulterError" || /image/i.test(err.message || "")) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong on our end." });
  });

  return app;
}
