# Going live

How to take TravelOnBuddy from this repo to a public website with working forms. Read
"The one rule" first, then work through the steps in order.

## The one rule: same domain for site and API

Put the public site and the API on **the same domain**, for example:

| Part | Address |
|---|---|
| Public site (`docs/`) | `https://www.yourdomain.in` |
| API (`server/`) | `https://api.yourdomain.in` |
| Admin panel (`src/`) | `https://admin.yourdomain.in` |

Sign-in uses a `SameSite=Lax` cookie, which browsers only send between pages of the same site.
With the site on `github.io` and the API somewhere else, login, signup and "Log out" stop
working. Trip requests and buddy applications still go through.

## 1. Domain

1. Buy a `.in` or `.com` domain from any registrar.
2. Point `www` at GitHub Pages: add a CNAME record for `www` → `rajeev8299.github.io`. Then in
   the repo go to **Settings → Pages → Custom domain**, enter `www.yourdomain.in`, and turn on
   **Enforce HTTPS**.
3. Run this once, then commit and push:

   ```bash
   node scripts/set-site-url.mjs https://www.yourdomain.in/ https://api.yourdomain.in/api
   ```

   It rewrites every canonical, social and sitemap URL, writes `docs/CNAME`, and tells the site
   where the live API is.

## 2. API

The API is a Docker image (`server/Dockerfile`) with two folders that must persist:
`/app/data` (the SQLite database) and `/app/uploads` (hero photos). Any host that runs Docker
and offers a persistent disk works. Pick a region close to your users, such as Mumbai.

Set these environment variables on the host:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` (secure cookies, no `Origin: null`) |
| `JWT_SECRET` | output of `openssl rand -hex 32` |
| `CLIENT_ORIGIN` | `https://www.yourdomain.in,https://admin.yourdomain.in` |
| `PUBLIC_API_URL` | `https://api.yourdomain.in` |
| `TRUST_PROXY` | `1` (the host's load balancer is one proxy hop) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin login, used only on first start |
| `SMTP_URL`, `MAIL_FROM`, `NOTIFY_EMAIL_TO` | enquiry emails (see below) |
| `WHATSAPP_*` | WhatsApp alerts (see below) |

Then point `api.yourdomain.in` at the host and turn on HTTPS. Check that
`https://api.yourdomain.in/api/health` returns `{"ok":true}`.

**Backups:** copy `/app/data/travel.db` somewhere off the server every day. A scheduled job
running `sqlite3 travel.db ".backup backup.db"` is the safe way to copy a live database.

## 3. Enquiry notifications

Without these settings, new trip requests and buddy applications are saved but nobody is told
about them.

- **Email:** create a mailbox (Zoho Mail and Google Workspace both work well in India) and set
  `SMTP_URL`, `MAIL_FROM` and `NOTIFY_EMAIL_TO`. The team gets every enquiry, and the customer
  gets a confirmation with their reference number.
- **WhatsApp:** in Meta Business Manager, set up the WhatsApp Cloud API and get a template
  approved with three variables, for example: *"New {{1}}: {{2}} from {{3}}. Open the admin
  panel to follow up."* Then set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_NOTIFY_TO` (your team number with country code, no `+`) and `WHATSAPP_TEMPLATE`.

Sending runs in the background, so a failed send never blocks a customer's request. Check the
API logs for `[notify]` lines.

## 4. Admin panel

Build it with the live API address and host the `dist/` folder at `admin.yourdomain.in`:

```bash
VITE_API_URL=https://api.yourdomain.in/api npm run build
```

## 5. Before you announce it

- [ ] Fill in every `[[placeholder]]` in `content/legal/` (business name, address, GSTIN,
      Grievance Officer, refund time limits), then run `node scripts/build-site.mjs`. The pages
      stay marked "draft" and hidden from search until you do.
- [ ] Set prices in `docs/experiences.json` (`"price": { "from": 1500, "per": "person" }`), then
      run `node scripts/build-site.mjs`.
- [ ] Replace the sample stories and buddies with real ones, and check the home-page figures
      ("180+ buddies", "4.9 rating").
- [ ] Send yourself a test trip request and confirm the email and WhatsApp alerts arrive.
- [ ] Add the site to Google Search Console and Bing Webmaster Tools, and submit
      `https://www.yourdomain.in/sitemap.xml`.
- [ ] Create a Google Business Profile for TravelOnBuddy in Varanasi.

## Day-to-day

| Task | Command |
|---|---|
| Edit or add an experience | change `docs/experiences.json`, then `node scripts/build-site.mjs` |
| Add a photo | put the JPEG in `docs/img/`, add it to `docs/credits.json`, run `scripts/optimize-images.sh` and `node scripts/build-site.mjs` |
| Reset someone's password | `docker compose exec api npm run reset-password -- someone@example.com` |
