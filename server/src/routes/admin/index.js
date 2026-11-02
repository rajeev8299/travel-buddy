import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import statsRoutes from "./stats.js";
import usersRoutes from "./users.js";
import buddyApplicationsRoutes from "./buddyApplications.js";
import planRequestsRoutes from "./planRequests.js";
import buddiesRoutes from "./buddies.js";
import storiesRoutes from "./stories.js";
import heroSlidesRoutes from "./heroSlides.js";
import leadsRoutes from "./leads.js";
import alertsRoutes from "./alerts.js";
import actionsRoutes from "./actions.js";

const router = Router();

router.use(requireAdmin);

router.use("/stats", statsRoutes);
router.use("/users", usersRoutes);
router.use("/buddy-applications", buddyApplicationsRoutes);
router.use("/plan-requests", planRequestsRoutes);
router.use("/buddies", buddiesRoutes);
router.use("/stories", storiesRoutes);
router.use("/hero-slides", heroSlidesRoutes);
router.use("/leads", leadsRoutes);
router.use("/alerts", alertsRoutes);
router.use("/actions", actionsRoutes);

export default router;
