import "dotenv/config";
import "./db.js";
import { seedAdmin } from "./seedAdmin.js";
import { createApp } from "./app.js";

const port = process.env.PORT || 4000;

await seedAdmin();

const app = createApp();

app.listen(port, () => {
  console.log(`TravelOnBuddy API listening on http://localhost:${port}`);
});
