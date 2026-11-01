// Moves the public site to a new address (e.g. your own domain) in one go:
//   node scripts/set-site-url.mjs https://www.example.in/ [https://api.example.in/api]
// Updates scripts/site.config.json, rewrites every canonical/social/sitemap
// URL in docs/, writes docs/CNAME for a custom domain on GitHub Pages, and
// re-runs the site build. The second argument sets the live API address.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const configPath = path.join(ROOT, "scripts/site.config.json");

const [newUrlArg, apiArg] = process.argv.slice(2);
if (!newUrlArg || !/^https:\/\//.test(newUrlArg)) {
  console.error("Usage: node scripts/set-site-url.mjs https://www.example.in/ [https://api.example.in/api]");
  process.exit(1);
}
const newUrl = newUrlArg.endsWith("/") ? newUrlArg : `${newUrlArg}/`;
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const oldUrl = config.url;

let changed = 0;
for (const f of fs.readdirSync(DOCS).filter((f) => /\.(html|txt|xml)$/.test(f))) {
  const p = path.join(DOCS, f);
  const src = fs.readFileSync(p, "utf8");
  if (src.includes(oldUrl)) {
    fs.writeFileSync(p, src.split(oldUrl).join(newUrl));
    changed++;
  }
}

const host = new URL(newUrl).hostname;
const cnamePath = path.join(DOCS, "CNAME");
if (host.endsWith(".github.io")) fs.rmSync(cnamePath, { force: true });
else fs.writeFileSync(cnamePath, `${host}\n`);

config.url = newUrl;
if (apiArg) config.api = apiArg;
config.lastmod = new Date().toISOString().slice(0, 10);
fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Site URL ${oldUrl} → ${newUrl} (${changed} files)${apiArg ? `, API → ${apiArg}` : ""}`);
execFileSync(process.execPath, [path.join(ROOT, "scripts/build-site.mjs")], { stdio: "inherit" });
