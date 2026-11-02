# Varanasi Trip Companion — web app

The public website for **Varanasi Trip Companion** (*Discover the Soul of Varanasi. Plan Smarter.
Travel with Confidence.*). It's built with Next.js 16 (App Router, TypeScript), and its structure
follows [`../Requirements.md`](../Requirements.md) and the product specification in
[`../product/`](../product/).

## Run it

```bash
# API (Express, in ../server) — via Docker from the repo root
docker compose up -d api

# Site — dev server on port 3100
npm install
npm run dev -- -p 3100
```

You can also run everything in Docker with `docker compose up -d --build api site`, which serves
the site at http://localhost:3100.

| Env var (build time) | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3100` | Canonical URLs, sitemap, share links |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Enquiries, live alerts, analytics |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | *(unset)* | Support WhatsApp number (digits with country code). While unset, the WhatsApp hand-off button is hidden. |
| `INTERNAL_API_URL` (runtime) | `NEXT_PUBLIC_API_URL` | Where the site's server fetches blog content. In Docker Compose: `http://api:4000/api`. |

The API must allow the site's origin in `CLIENT_ORIGIN`. Docker Compose already does this for
`http://localhost:3100`.

## How it's organised

| Path | What |
|---|---|
| `src/app/` | Routes, following `product/01-sitemap.md`: places, things to do, local experiences, plan (itineraries, planner, saved and shared trips), travel guide (with live "Today"), festivals, food, shopping, markets, services, enquiry, about, legal, search |
| `src/content/*.ts` | Typed content collections. They mirror the CMS model in `product/05-cms.md` so they can later be swapped for the CMS API without touching pages. |
| `content/**/*.md` | Long-form bodies (places, explore articles, things to do) and the legal sources |
| `src/app/blog/`, `src/lib/blog.ts`, `src/components/blog.tsx` | The blog. Articles come from the API at request time (cached for a minute), not from files, so publishing needs no rebuild |
| `src/lib/planner.ts` | Trip-planner engine: interests, pace, walking, seniors/children, budget; edit, reorder, save to the device, share by link |
| `src/components/` | Header (5 dropdown menus and a mobile drawer), footer, alert strip, cards, fact box, review notice, Markdown, FAQ, planner, enquiry form |

## Content and truth rules

These are built into the components, so a page can't accidentally present a guess as fact.

- **Pages under review:** content with `status: "review"` shows a "This page is being verified"
  notice and is **noindex**. It's left out of the sitemap until it is `"published"`.
- **Unverified facts:** a fact with `value: null` renders as **"Not yet verified — check
  &lt;source&gt;"**. `[VERIFY: …]` markers in Markdown render as a visible "being verified" note.
- **Festival dates:** shown only when `status: "confirmed"`. `Event` structured data is emitted
  only then.
- **Partner status:** shown honestly ("being onboarded", "on trial" or "verified"). Experience
  and service pages are noindex until a verified partner runs them.
- **Planner disclaimer:** the planner always says it's a suggested plan, not live routing, and
  links to *Today in Varanasi*.

## Backend pieces used by the site

These all live in `../server`:

| Endpoint | Purpose |
|---|---|
| `POST /api/leads` | Every enquiry type (trip, service, experience, partner, complaint). Returns a reference code, then hands off to WhatsApp with that code prefilled. |
| `GET /api/public/alerts` | Live alerts. Only currently active ones are returned, and alerts expire within 72 hours. |
| `POST /api/events` | Privacy-friendly analytics. Event names are allow-listed and no personal data is accepted. |
| `GET /api/blog/…` | Live blog articles, categories, tags, authors, and signed previews. A post that isn't live comes back as `post: null` with status 200, because the site's cache only stores 200s and a 404 would keep an archived article online. |
| `/api/editorial/…` | The multi-author workflow (draft → review → fact check → approval by a second admin → published/scheduled). Authors, editors and admins only. |
| `/api/admin/leads`, `/api/admin/alerts` | Lead pipeline (`new → contacted → partner_assigned → confirmed → completed / cancelled / lost`, with history and first-response time) and alert management. Admin only. |

## Checks

```bash
npx tsc --noEmit -p . && npx eslint src && npm run build
```
