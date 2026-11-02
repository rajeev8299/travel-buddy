# Going live

How to take TravelOnBuddy from this repo to a public website with working forms. Read
"The one rule" first, then work through the steps in order.

## The one rule: same domain for site and API

Put the public site and the API on **the same domain**, for example:

| Part | Address |
|---|---|
| Public site (`web/`, Next.js) | `https://www.yourdomain.in` |
| API (`server/`) | `https://api.yourdomain.in` |
| Admin panel (`src/`) | `https://admin.yourdomain.in` |

Sign-in uses a `SameSite=Lax` cookie, which browsers only send between pages of the same site.
With the site on `github.io` and the API somewhere else, login, signup and "Log out" stop
working. Trip requests and buddy applications still go through.

## 1. Domain

1. Buy a `.in` or `.com` domain from any registrar.
2. Point `www` at the host running the Next.js site (`web/`, section 4b), `api` at the API and
   `admin` at the admin panel, all over HTTPS.
3. The old static site in `docs/` is **retired**. If GitHub Pages still serves it, turn Pages off
   (**Settings → Pages**) once the new site is live. The new site redirects the old `.html`
   addresses (`privacy.html`, `become-a-buddy.html`, the experience pages…) to their new pages, and
   the admin container sends anything outside `/admin/` to `SITE_URL`.

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
| `LEAD_LOST_REASONS` | optional: comma-separated reasons offered when a lead is marked lost |
| `SITE_URL` | `https://www.yourdomain.in` (where blog preview links point) |
| `BUDDY_DOCS_KEY` | 64 hex characters (`openssl rand -hex 32`). Encrypts buddy verification documents. Without it, uploads are refused. Keep a copy somewhere safe: files waiting for review can't be opened with a different key (reviewed files are deleted anyway). |
| `SITE_INTERNAL_URL` + `REVALIDATE_SECRET` | optional: the site's internal address and a long random secret (set the same secret on the site). Then a published article or a saved author profile shows on the site straight away instead of within a minute. |
| `BLOG_VERIFICATION_MAX_AGE_DAYS` | optional, default 180: an article whose fact check is older than this can't be published until it's checked again |

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

**Overdue replies:** when a lead gets no reply within its target (10 minutes between 6am and
10pm IST, otherwise by 7am), the API sends one "Reply overdue" alert per lead through the same
email and WhatsApp settings. The WhatsApp alert uses the same template, with
`OVERDUE … enquiry` as the first variable. Make sure whoever is on duty receives
`WHATSAPP_NOTIFY_TO`.

## 4. Admin panel

Build it with the live API address and host the `dist/` folder at `admin.yourdomain.in`:

```bash
VITE_API_URL=https://api.yourdomain.in/api VITE_SITE_URL=https://www.yourdomain.in npm run build
```

`VITE_SITE_URL` is the Varanasi Trip Companion site (next section). The Travel Alerts screen
links to its live *Today in Varanasi* page.

## 4b. Varanasi Trip Companion site (`web/`)

The Next.js site is a Docker image (`web/Dockerfile`) with nothing to persist. Its addresses are
baked in at build time, so rebuild it whenever they change:

| Build arg | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.yourdomain.in` (canonical URLs, sitemap, share links) |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.in/api` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | support number, digits with country code. While unset, the WhatsApp button is hidden. |

At runtime, also set `INTERNAL_API_URL` to an address the site's server can reach the API on (in
Docker Compose, `http://api:4000/api`). Blog pages are rendered on the server from the API and
cached for a minute, so a published or archived article shows up or disappears within a minute,
with no rebuild.

Add the site's address to the API's `CLIENT_ORIGIN`, or enquiries, live alerts and analytics are
blocked by CORS. See [`web/README.md`](web/README.md) for the content rules.

## 5. Before you announce it

- [ ] Fill in every `[[placeholder]]` in `web/content/legal/` (business name, address, GSTIN,
      Grievance Officer, payment terms, time limits), then rebuild the site. The pages stay marked
      "draft" and hidden from search until you do.
- [ ] Fact-check the content pages in `web/src/content/` and set each one's `status` to
      `"published"`; until then they're noindex and left out of the sitemap. Experience pages also
      need `partnerStatus: "verified"`.
- [ ] Start production on **new, empty data volumes** — never copy a local test database.
- [ ] Set `NODE_ENV=production`, `CLIENT_ORIGIN`, `PUBLIC_API_URL`, `TRUST_PROXY`, `SITE_URL`,
      `REVALIDATE_SECRET` and `BUDDY_DOCS_KEY` in `.env` (see `server/.env.example`), and keep a
      safe copy of `BUDDY_DOCS_KEY` — documents can't be read without it.
- [ ] Send yourself a test trip request and confirm the email and WhatsApp alerts arrive.
- [ ] Add the site to Google Search Console and Bing Webmaster Tools, and submit
      `https://www.yourdomain.in/sitemap.xml`.
- [ ] Create a Google Business Profile for TravelOnBuddy in Varanasi.

## Day-to-day

| Task | Command |
|---|---|
| Edit or add an experience | change `web/src/content/experiences.ts`, then rebuild the site |
| Reset someone's password | `docker compose exec api npm run reset-password -- someone@example.com` |
| Add a blog writer or reviewer | they sign up on the site, then an admin sets their role to **Author** or **Editor** under Admin → Users |

### Buddy verification

Applications arrive from the site's **Become a buddy** page (`/become-a-buddy`). Shortlist one in **People → Buddy Applications**, open it and press **Request documents**. The
applicant gets a private link (valid 14 days) to upload a photo ID, a recent photo and a police certificate
(and a guide licence if they have one), and to complete their details. Open each file, then **Accept** or
**Reject** it: the file is deleted either way, and only the record of the check is kept. Record the
reference calls and the interview; **Approve** stays disabled until everything has passed. Files nobody
reviews are deleted after 30 days. Only the last 4 characters of an ID number are ever stored, and
Aadhaar is accepted only as a masked copy.

### Blog workflow

Articles go draft → submitted → editorial review → fact check → admin approval → published (or
scheduled). Authors write and submit; editors review, request changes and verify facts; only an
admin who didn't write or edit that revision can approve it, so **you need at least two admin
accounts to publish anything**. Any change after approval voids it. Updating a live article creates
a new revision; the old one stays live until the update is approved and published.
