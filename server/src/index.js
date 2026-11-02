import "dotenv/config";
import "./db.js";
import { seedAdmin } from "./seedAdmin.js";
import { createApp } from "./app.js";
import { startSlaWatch } from "./slaWatch.js";
import { startBlogScheduler } from "./blog/workflow.js";
import { startDocumentCleanup } from "./buddyVerification.js";

const port = process.env.PORT || 4000;

// A public https deploy without NODE_ENV=production would send the sign-in
// cookie without Secure and accept `Origin: null`. Say so loudly at boot.
if (process.env.NODE_ENV !== "production" && /^https:/.test(process.env.SITE_URL || "")) {
  console.warn("WARNING: SITE_URL is https but NODE_ENV isn't 'production' — sign-in cookies won't be marked Secure. Set NODE_ENV=production.");
}
if (process.env.NODE_ENV === "production" && !process.env.BUDDY_DOCS_KEY) {
  console.warn("WARNING: BUDDY_DOCS_KEY is not set — buddy document uploads are refused until it is.");
}

await seedAdmin();
startSlaWatch();
startBlogScheduler();
startDocumentCleanup();

const app = createApp();

app.listen(port, () => {
  console.log(`TravelOnBuddy API listening on http://localhost:${port}`);
});
