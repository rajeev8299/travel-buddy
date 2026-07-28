import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import statsRoutes from "./stats.js";
import usersRoutes from "./users.js";
import buddyApplicationsRoutes from "./buddyApplications.js";
import planRequestsRoutes from "./planRequests.js";
import buddiesRoutes from "./buddies.js";
import storiesRoutes from "./stories.js";
import heroSlidesRoutes from "./heroSlides.js";

const router = Router();

router.use(requireAdmin);

router.use("/stats", statsRoutes);
router.use("/users", usersRoutes);
router.use("/buddy-applications", buddyApplicationsRoutes);
router.use("/plan-requests", planRequestsRoutes);
router.use("/buddies", buddiesRoutes);
router.use("/stories", storiesRoutes);
router.use("/hero-slides", heroSlidesRoutes);

export default router;
