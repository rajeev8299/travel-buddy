import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  app.use(
    cors({
      // The plain HTML site in docs/ is meant to be opened straight off disk
      // (double-click, no server) — browsers send `Origin: null` for those
      // file:// pages, so it's allowed alongside the Vite dev origin. A null
      // origin can't carry the session cookie either way (SameSite blocks
      // that), so this only widens access to the cookie-free endpoints.
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
  app.use(express.json());
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
