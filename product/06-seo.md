# 6. SEO Architecture and Internal Linking

**Product:** Varanasi Trip Companion · **Spec version:** 1.0 · 1 November 2026
**Depends on:** [01-sitemap.md](01-sitemap.md) · [04-page-templates.md](04-page-templates.md) · [05-cms.md](05-cms.md)

Organic search is the primary acquisition channel (feasibility plan: ≥ 60% organic share by month 6). The strategy is to be the most useful, most current and most trustworthy answer for each Varanasi trip-planning question — not to produce volume.

---

## 6.1 Rendering strategy

| Page kind | Rendering | Why |
|---|---|---|
| All knowledge pages, hubs, experiences, services | **Static generation** at publish (Astro, see [05-cms.md](05-cms.md) §5.10) | Full HTML for crawlers, fastest load on mobile, cheap hosting/CDN |
| Live alerts, TS-field expiry, enquiry forms | Static HTML + small client-side fetch of `/api/public/live.json` | Content stays indexable; live data never blocks rendering |
| Trip planner | Static shell + client-side app | Interactive; the indexable content is the itinerary pages, not planner states |
| Shared itineraries `/plan/trip/<id>`, `/account/`, `/admin/` | Client-rendered | `noindex` (§6.6) |
| Search results `/search` | Client-rendered | `noindex, follow` |

Rule: no indexable content may depend on JavaScript to appear.

## 6.2 URL rules

1. Exactly the paths in [01-sitemap.md](01-sitemap.md); lowercase, hyphenated, ASCII, ≤ 60-char slug, no dates/IDs/file extensions.
2. Trailing slash on hubs (`/places/ghats/`), none on detail pages (`/places/ghats/assi`); the other form 301s.
3. No query parameters on indexable URLs; filters on hubs use `?type=…` but canonical to the clean hub URL.
4. Slug changes create 301s automatically (CMS); old prototype URLs redirect per sitemap §1.5.
5. Hindi mirror under `/hi/` with identical slugs (Latin slugs keep links shareable).
6. Single host: `https://www.<domain>` (apex 301s to www); HTTPS only.

## 6.3 Title and meta description patterns

Brand suffix: ` | Varanasi Trip Companion` (omitted if the title would exceed 60 chars). Descriptions 120–155 chars, written per page; patterns below are defaults when the editor leaves the SEO fields empty.

| Type | Title pattern | Example | Description pattern |
|---|---|---|---|
| Home | Varanasi Travel Guide & Trip Planner \| Varanasi Trip Companion | — | Positioning line + "places, itineraries and trusted local services" |
| Temple | {Name}, Varanasi: Visitor Guide, Rules & Tips | Kashi Vishwanath Temple, Varanasi: Visitor Guide, Rules & Tips | What it is · what you need to know (rules/darshan) · verified date |
| Ghat | {Name} Ghat, Varanasi: History, Aarti & Visiting Tips | Assi Ghat, Varanasi: History, Morning Aarti & Visiting Tips | — |
| Cremation ghat | {Name} Ghat, Varanasi: History & Respectful Visiting | Manikarnika Ghat, Varanasi: History & Respectful Visiting | Must mention respectful conduct; no "things to see" framing |
| Heritage | {Name}: History & Visitor Guide (Varanasi) | Dhamek Stupa, Sarnath: History & Visitor Guide | — |
| Nearby | {Name} from Varanasi: {Day Trip / Travel Guide} | Chunar Fort from Varanasi: Day Trip Guide | — |
| Things to Do | {Activity} in Varanasi: How to Do It Well | Sunrise Boat Ride in Varanasi: How to Do It Well | Duration · best time · what to know |
| Experience | {Experience name} with a Local \| Varanasi | — | Who it's for · duration · enquiry |
| Service | {Service} in Varanasi \| Verified Local Partners | Airport Transfer in Varanasi \| Verified Local Partners | Coverage · response time |
| Itinerary | Varanasi in {N} Days: A Realistic Itinerary | Varanasi in Two Days: A Realistic Itinerary | — |
| Festival | {Festival} in Varanasi: Guide, Dates & Crowd Tips | Dev Deepawali in Varanasi: Guide, Dates & Crowd Tips | "Dates" in title only when a confirmed occurrence exists |
| Food | {Dish} in Varanasi: What It Is & Where to Try It | — | — |
| Market | {Market}, Varanasi: Shopping Guide | — | — |
| Article (explore) | {Topic}: {Angle} | The History of Varanasi's Ghats | — |
| Travel guide | {Question-form or task} | How to Reach Varanasi by Air, Rail and Road | Quick answer sentence |

## 6.4 Heading rules

- One H1 per page = the page title (not the SEO title).
- H2s follow the template section order ([04-page-templates.md](04-page-templates.md)); no skipped levels; card titles inside sections are H3.
- Visually hidden H2s allowed where the design implies a section (existing `.visually-hidden` utility).
- Footer column headings are H2 (already implemented).

## 6.5 Canonicals, duplicates and cross-listing

| Case | Rule |
|---|---|
| Sarnath appears under heritage and nearby | Canonical page `/places/heritage/sarnath`; `/places/nearby/sarnath` is a 301 to it; the nearby hub lists the same card |
| Kartik Purnima / Dev Deepawali | If merged editorially, one page canonical and the other 301s; never two near-identical pages |
| Things to Do vs. Experience on the same activity | Distinct intent (neutral guide vs. offering); each self-canonical; the guide links to experiences, experiences link back |
| Hub filter URLs | Canonical to clean hub |
| Itinerary vs. planner output | Planner outputs are `noindex`; only curated itineraries are indexable |
| Paginated hubs | Self-canonical per page; `rel=next/prev` not relied upon; ensure every detail page is linked from at least one hub page 1 or sitemap |

## 6.6 Robots, noindex and sitemaps

**`robots.txt`** (at domain root): allow all; disallow `/admin/`, `/account/`, `/api/`, `/plan/trip/`, `/search`; `Sitemap:` index URL.

**`noindex`** (meta robots) on: `/search`, `/plan/trip/<id>`, `/plan/my-trips`, `/account/**`, `/enquiry/thank-you`, legal pages while draft, any entry showing the "Not yet verified" banner (overdue review), archived-with-no-replacement 410s.

**Sitemap index** `/sitemap.xml` → child sitemaps, regenerated on publish and nightly:

| Child sitemap | Contents |
|---|---|
| `sitemap-pages.xml` | Home, hubs, about, legal (published) |
| `sitemap-places.xml` | All `/places/**` |
| `sitemap-explore.xml` | `/explore/**` |
| `sitemap-things-to-do.xml` | `/things-to-do/**`, `/experiences/**` |
| `sitemap-plan.xml` | `/plan/itineraries/**`, `/travel-guide/**` |
| `sitemap-food-shopping.xml` | `/food/**`, `/shopping/**`, `/markets/**` |
| `sitemap-festivals.xml` | `/festivals/**` |
| `sitemap-services.xml` | `/services/**`, `/partners/**` |
| `sitemap-hi.xml` | `/hi/**` with `xhtml:link` alternates |
| `sitemap-images.xml` | Featured images with captions (P2) |

`<lastmod>` = the later of `updated_at` and `last_verified_at` (re-verification is a meaningful update).

## 6.7 hreflang (EN / HI)

- Emit `hreflang="en-IN"`, `hreflang="hi-IN"` and `x-default` (English) **only** for pages where both versions are published.
- Language switcher links to the counterpart or, if none, to the Hindi hub with a note.
- `<html lang>` matches page language; Hindi pages use Devanagari titles and descriptions.

## 6.8 Internal linking model

### 6.8.1 Rules

1. **Hub → detail:** every detail page linked from its hub (cards) and at least one other context.
2. **Place ↔ Activity ↔ Itinerary ↔ Service triangle:** each place links to things to do there, itineraries containing it, and services that reach it; each of those links back.
3. **Knowledge → commerce, never the reverse only:** neutral guides link to experiences/services; commercial pages link to the neutral guide ("Learn first").
4. **Contextual in-body links:** first mention of a place/food/festival with its own page is linked (max once per page per target).
5. **Anchor text** is descriptive ("Assi Ghat morning programme"), never "click here".
6. **Alerts** link to the affected pages and the relevant guide.
7. **No orphans:** nightly job flags published pages with < 2 inbound internal links.

### 6.8.2 Minimum links per page type

| Page type | Min. outbound internal links | Required targets |
|---|---|---|
| Home | 20 | Every top-level hub, top 6 places, itineraries hub, planner, emergency |
| Hub | All children + 3 cross-hub | — |
| Place (temple/ghat/heritage) | 8 | 3 nearby places · ≥1 things-to-do · ≥1 itinerary · ≥1 service · last-mile guide · related festival if any |
| Explore article | 6 | ≥3 places, ≥1 things-to-do, ≥1 itinerary |
| Things to Do | 6 | Places where it happens · experiences (if any) · ≥1 itinerary · safety/etiquette guide |
| Experience | 4 | Matching things-to-do · meeting-point place · cancellation policy · service category |
| Service | 4 | Relevant travel-guide article · ≥1 place · how-we-verify · contact |
| Itinerary | 1 per stop + 3 | Every stop's page · planner · ≥1 service · best-time guide |
| Festival | 6 | Locations · itineraries · crowd/safety guide · today/alerts |
| Food / market | 4 | Food areas/markets · food walk guide · food & water safety |
| Travel guide | 4 | Related guides · relevant places/services · emergency (for safety topics) |

## 6.9 Keyword / intent → target URL map

| Intent cluster | Representative queries (EN; Hindi equivalents in P2) | Target URL | Supporting URLs |
|---|---|---|---|
| Places to visit | places to visit in varanasi; tourist places varanasi; varanasi sightseeing | `/places/` | `/places/temples/`, `/places/ghats/`, `/places/heritage/` |
| Things to do | best things to do in varanasi; what to do in varanasi at night/morning | `/things-to-do/` | Activity guides |
| Itinerary | varanasi itinerary; 1 day / 2 days / 3 days in varanasi | `/plan/itineraries/` | `/one-day`, `/two-days`, `/three-days` |
| Travel guide | varanasi travel guide; varanasi tips; first time in varanasi | `/travel-guide/` | `/travel-guide/faq`, `/responsible-travel` |
| Kashi Vishwanath | kashi vishwanath temple guide; kashi vishwanath darshan; mobile allowed in kashi vishwanath; kashi vishwanath dress code | `/places/temples/kashi-vishwanath` | `/travel-guide/temple-access-rules`, `/things-to-do/temple-circuits` |
| Ganga Aarti | ganga aarti varanasi; ganga aarti time; best place to watch ganga aarti; ganga aarti from boat | `/things-to-do/ganga-aarti` | `/places/ghats/dashashwamedh`, `/places/ghats/assi`, `/things-to-do/sunset-boat-ride` |
| Boat rides | varanasi boat ride; sunrise boat ride varanasi; boat ride price varanasi | `/things-to-do/sunrise-boat-ride` | `/things-to-do/sunset-boat-ride`, `/services/river/boat-rides`, `/experiences/*` |
| Food | varanasi food guide; famous food of varanasi; varanasi street food | `/food/` | Dish pages, `/food/food-areas`, `/things-to-do/food-walks` |
| Silk shopping | banarasi silk saree shopping guide; how to identify real banarasi saree; where to buy banarasi saree | `/shopping/banarasi-silk-sarees` | `/explore/banarasi-silk`, `/markets/madanpura`, `/things-to-do/silk-weaving-visits` |
| Sarnath | varanasi to sarnath day trip; sarnath places to visit; dhamek stupa | `/things-to-do/sarnath-buddhist-tour` | `/places/heritage/sarnath`, `/places/heritage/dhamek-stupa`, `/plan/itineraries/with-sarnath` |
| How to reach | how to reach varanasi; varanasi airport to city; varanasi railway station to ghat | `/travel-guide/how-to-reach` | `/travel-guide/airport`, `/travel-guide/railway-stations`, `/services/transport/*` |
| Family travel | varanasi with family; varanasi with kids; varanasi for senior citizens | `/travel-guide/families-and-seniors` | `/plan/itineraries/families`, `/plan/itineraries/senior-friendly` |
| Best time | best time to visit varanasi; varanasi in monsoon/winter | `/travel-guide/best-time-to-visit` | `/travel-guide/weather-and-monsoon` |
| Festivals | dev deepawali varanasi; mahashivratri varanasi; holi in varanasi | `/festivals/<slug>` | `/festivals/`, itineraries |
| Safety | is varanasi safe; varanasi scams; solo female travel varanasi | `/travel-guide/solo-and-women-safety` | `/travel-guide/scams-and-touts` |
| Ghats | ghats of varanasi; assi ghat; manikarnika ghat | `/places/ghats/` | Ghat pages, `/explore/history-of-the-ghats` |
| History & names | history of varanasi; why is varanasi called kashi | `/explore/history` | `/explore/kashi-banaras-varanasi` |
| Services | varanasi airport taxi; guide in varanasi; private boat varanasi | `/services/transport/airport-transfer`, `/services/guides/`, `/services/river/private-boats` | — |

One primary URL per cluster; supporting pages target long-tail siblings and link to the primary.

## 6.10 Structured data per type

| Template | JSON-LD types | Conditions |
|---|---|---|
| Home | `Organization` (TravelAgency) + `WebSite` (with `SearchAction` → `/search?q=`) | — |
| Temple | `HinduTemple`/`BuddhistTemple` + `TouristAttraction` | `openingHoursSpecification` only from verified TS field |
| Ghat / market | `TouristAttraction` (+ `Place` `geo`) | — |
| Heritage | `LandmarksOrHistoricalBuildings` + `TouristAttraction`; `Museum` for museums | — |
| Nearby | `TouristDestination` | — |
| Explore / travel guide / food / things-to-do | `Article` (`author`, `reviewedBy`, `dateModified`) | — |
| Itinerary / experience | `TouristTrip` (`itinerary` as `ItemList`) | `offers` only when price verified |
| Festival | `Article`; `Event` per **confirmed** occurrence only | Never for expected dates |
| Service | `Service` | — |
| Partner profile (P2) | `LocalBusiness` subtype | **Only** for `verification_status = verified` |
| Hubs | `ItemList` of child URLs | — |
| Any page with FAQ block | `FAQPage` | Answers fully visible |
| All | `BreadcrumbList` | Mirrors visible breadcrumb |

Validation: every build runs JSON-LD through a schema validator; publish fails on errors.

## 6.11 Image SEO

- WebP renditions 640/1280/1920 with `srcset`/`sizes` (pipeline already in `scripts/optimize-images.sh`); originals kept for Open Graph.
- Descriptive file names (`assi-ghat-morning-aarti.webp`), alt text that describes the scene (not keyword lists), credit in caption/footer.
- `width`/`height` on every image to prevent layout shift; hero image `fetchpriority="high"`, others `loading="lazy"`.
- Open Graph image per page 1200×630 crop (P2: generated).

## 6.12 Content-quality rules

1. Every page must answer a real traveller question better than existing results; editors note the target intent in the CMS.
2. No pages created only to target keyword variants; merge near-duplicates (§6.5).
3. AI-assisted drafts are allowed only as a starting point; every published claim is checked against a source and labelled ([09-verification-checklist.md](09-verification-checklist.md)).
4. Minimum lengths per template; pages below are blocked.
5. No fabricated reviews, ratings, prices, timings or partner statuses; no unsourced superlatives.
6. Author and reviewer shown on every page (E-E-A-T), with an `/about/how-we-verify` page explaining the process.
7. Outdated pages are not left live: overdue review → banner + `noindex` until re-verified.

## 6.13 Core Web Vitals budgets (mid-range Android, 4G)

| Metric (p75, field data) | Budget |
|---|---|
| LCP | ≤ 2.5 s (target 2.0 s) |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| Initial HTML | ≤ 50 KB gzipped |
| JS on knowledge pages | ≤ 50 KB gzipped (planner page ≤ 150 KB) |
| CSS | ≤ 40 KB gzipped |
| Hero image (640 w) | ≤ 80 KB |
| Total page weight (first view) | ≤ 500 KB |
| Web fonts | ≤ 2 families, `font-display: swap`, subset |

Budgets enforced in CI with Lighthouse on representative templates.

## 6.14 Measurement

- **Search Console & Bing Webmaster Tools:** sitemap submission, coverage, queries per cluster (§6.9), CWV field data.
- **First-party analytics events** (no PII; canonical list in [Requirements.md](../Requirements.md) FR-ANL-01): `page_view`, `search_performed`, `itinerary_viewed`, `itinerary_started`, `itinerary_generated`, `itinerary_edited`, `itinerary_saved`, `itinerary_shared`, `itinerary_completed`, `partner_click`, `enquiry_started`, `lead_created`, `lead_status_changed`, `whatsapp_handoff`, `alert_viewed`, `emergency_viewed`, `feedback_submitted`; each with `source_channel` (organic, direct, social, partner_qr, referral, paid) from referrer/UTM.
- Weekly dashboard: organic share, landing pages by cluster, organic → planner → lead funnel, pages losing traffic, pages overdue for review.

## 6.15 Launch checklist

- [ ] Final domain live on HTTPS; www/apex and trailing-slash redirects correct
- [ ] Prototype → new URL 301 map in place ([01-sitemap.md](01-sitemap.md) §1.5)
- [ ] `robots.txt` at domain root; sitemap index submitted to Google and Bing
- [ ] Every MVP page has unique title + description; no duplicates (crawl report)
- [ ] JSON-LD validates on every template; no `Event` without confirmed date; no `LocalBusiness` for unverified partners
- [ ] `noindex` on search, shared trips, account, thank-you, drafts and overdue pages
- [ ] Breadcrumbs visible and in schema
- [ ] Zero orphan pages; minimum internal links met
- [ ] CWV budgets pass on Home, a temple page, a hub, the planner
- [ ] All images have alt text and credits; WebP renditions served
- [ ] Hindi: only reviewed pages published; hreflang pairs valid
- [ ] Google Business Profile created; Organization schema matches it
- [ ] Analytics events firing; Search Console linked
