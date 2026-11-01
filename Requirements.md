# Varanasi Trip Companion — Requirements Specification

## 1. Document control

| Field | Value |
|---|---|
| Document | Requirements Specification (functional + non-functional) |
| Version | 1.1 |
| Date | 1 November 2026 |
| Status | Draft for review |
| Product owner | [[Name]] |
| Engineering lead | [[Name]] |
| Content & verification lead | [[Name]] |
| City operations lead (Varanasi) | [[Name]] |
| Approvers | [[Names]] |

### 1.1 Related documents

| Document | Role |
|---|---|
| *Varanasi Trip Companion — Business Feasibility, Market Analysis and Financial Plan* v1.0 (2 Aug 2026) | Strategic foundation: positioning, lead-first model, phases, decision-gate metrics, risk register. This specification implements it and must not contradict it. |
| `product/01-sitemap.md` | Canonical URLs, navigation and page-level phase tags. Requirement IDs below refer to those URLs. |
| `product/` (other files) | Homepage copy, content strategy, page templates, CMS field definitions, SEO architecture, sample content, verification checklist. |
| `SECURITY_AUDIT.md`, `UX_A11Y_REVIEW.md` | Audits of the current prototype; fixed items are referenced as existing controls in §7. |
| `DEPLOY.md` | How the current prototype is deployed. |

### 1.2 Conventions

**Accepted plan update (1 November 2026):** The target is one Next.js application for the public website, admin and backend, using MySQL and Prisma. Section 12 records the accepted additions and delivery priorities; it supersedes conflicting earlier phase assignments and publishing permissions. Existing-stack descriptions are migration baselines, not target architecture. No application migration is implemented by this document update.

- **Priority:** **MVP** = Phase 1 (required for launch) · **P2** = Phase 2 · **F** = Phase 3 or later.
- **IDs:** `FR-<MODULE>-<nn>` for functional requirements, `NFR-<AREA>-<nn>` for non-functional ones. IDs are permanent; retired requirements are marked *withdrawn*, not renumbered.
- **"Must / should / may"** follow RFC 2119 meaning.
- **"Verified information"** means a CMS entry whose fact-verification step is complete and whose `next_review_at` is in the future (see FR-CMS-04).
- **"Time-sensitive"** means any fact that can change without notice: timings, fees, access rules, closures, river/boat status, festival dates, prices, phone numbers, transport restrictions.
- Placeholders in `[[double brackets]]` are business decisions not yet made.

---

## 2. Product overview

### 2.1 Vision
A mobile-first travel companion that helps people **plan Varanasi realistically, move through the city confidently and book trusted local experiences**, and that stays useful during the trip, not only before it.

### 2.2 Positioning
> **Discover the Soul of Varanasi. Plan Smarter. Travel with Confidence.**

Per the feasibility plan, the product leads with *verified planning and local execution*, not "everything about Varanasi". Generic attraction lists are necessary but not differentiating; the advantage comes from verified operational information, realistic routes and trusted partners.

### 2.3 Goals
1. **G1 Useful knowledge:** be the most accurate, current and respectful source of practical Varanasi travel information.
2. **G2 Realistic planning:** turn a traveller's time, interests and constraints into a plan that works on the ground.
3. **G3 Trusted local service:** connect travellers to verified partners through tracked enquiries, with published service standards.
4. **G4 Measurable business:** attribute every partner transaction to a lead, so the 6-month decision gates can be evaluated honestly.
5. **G5 Maintainable operations:** let a small team keep content current without code changes.

### 2.4 Success metrics

**Decision-gate metrics (feasibility plan §17, six-month targets)**

| ID | Metric | Target |
|---|---|---|
| M1 | Monthly active users | 25,000+ |
| M2 | Organic share of traffic | 60%+ |
| M3 | Users starting an itinerary | 10%+ |
| M4 | Started itineraries completed | 40%+ |
| M5 | Users clicking a partner action | 5%+ |
| M6 | Qualified leads becoming transactions | 8%–12% |
| M7 | Active verified partners | 50+ |
| M8 | Partner response rate | 90%+ |
| M9 | Time-sensitive content verified on schedule | 95%+ |
| M10 | User satisfaction | 4.3 / 5+ |
| M11 | Serious partner complaints | < 2% of transactions |

**Service standards (operational commitments agreed for launch)**

| ID | Standard | Target |
|---|---|---|
| S1 | First human reply to an enquiry (WhatsApp / email) | ≤ 10 minutes, 06:00–22:00 IST; overnight enquiries by 07:00 |
| S2 | Partner confirmed (name, photo, meeting point, price) | ≤ 2 hours; same-day requests ≤ 30 minutes |
| S3 | Day-before reminder with expected conditions | 100% of confirmed bookings |
| S4 | Pickup punctuality (verified transport partners) | ≥ 95% on time |
| S5 | Partner no-show → replacement offered | ≤ 45 minutes, else full refund of that service |
| S6 | Post-trip feedback request sent | ≤ 24 hours after the service |
| S7 | Complaint acknowledged / resolved | Acknowledged ≤ 2 hours; resolved ≤ 48 hours |
| S8 | Overcharge (price above confirmed price) complaints | Zero tolerance; partner review on first occurrence |

---

## 3. Scope by phase

| Phase | Feasibility-plan intent | In scope |
|---|---|---|
| **Phase 1 — MVP** | Demand validation and trusted content | Mobile-first site; ~100 verified knowledge pages (`product/01-sitemap.md` [MVP]); ready-made 1/2/3-day and segment itineraries; interactive trip planner (save on device, share link); places directory with filters; things-to-do guides; local experiences and service categories with **tracked enquiries** (booking codes, WhatsApp deep links); lead pipeline and partner response tracking in admin; CMS with verification workflow and expiry; today's alerts and emergency information; privacy-friendly analytics for M1–M11; partner application and verification records; English content, Hindi-ready data model. |
| **Phase 2** | Commercial conversion | Partner dashboard (partners update lead status); booking codes with QR confirmation; verified traveller reviews tied to completed leads; premium personalised itineraries; affiliate accommodation links; limited bookable local experiences (only after the decision gate); Hindi content for priority pages; traveller accounts (phone OTP); partner public profiles; blog. |
| **Phase 3** | Defensibility | Crowd-aware planning (only with a validated data source); accessibility and senior-friendly routing data; live disruption alerts pushed to saved trips; full offline itinerary and emergency access; Hindi and English voice guidance; partner performance scoring visible to ops; hotel concierge tools. |
| **Phase 4** | Geographic expansion | Multi-destination data model and templates (Ayodhya, Prayagraj, Bodh Gaya, Gaya, Vindhyachal, Chitrakoot, Mathura, Vrindavan) after Varanasi shows positive unit economics. |

### 3.1 Explicitly out of scope for the MVP
1. Collecting payments, checkout, holding customer funds, refunds processed by the platform.
2. OTA-style inventory, availability calendars or instant confirmation for hotels, boats or vehicles.
3. Native iOS/Android apps (the site is a PWA).
4. Any claim that plans account for live crowds, queues or closures, unless an integrated, validated current-data source exists (FR-PLAN-09).
5. Publishing unverified time-sensitive facts (FR-CMS-05).
6. User-generated reviews not tied to a completed, tracked service (fake-review risk).
7. Traveller accounts as a requirement for any MVP feature.
8. Paid advertising tooling, sponsored placements without disclosure.

---

## 4. Personas and user classes

### 4.1 Travellers (from the feasibility plan's segments)

| Persona | Primary needs | Key features |
|---|---|---|
| **T1 Independent domestic traveller** (launch segment) | Itinerary, realistic timing, boat rides, food, transport | Itineraries, planner, things-to-do, services |
| **T2 Pilgrim / family** | Darshan sequence, temple rules, senior-friendly movement, safety, nearby stays | Temple pages, spiritual & senior-friendly itineraries, access rules, assistance services |
| **T3 International cultural traveller** | English guidance, transparency, verified guides, safe transport | Explore hub, verified guides, airport transfer, scams guide |
| **T4 Buddhist visitor** | Sarnath itinerary, interpretation, multilingual guide | Sarnath pages, Sarnath guides, Buddhist observances |
| **T5 Last-minute visitor** | What's possible today, current conditions, quick help | Today in Varanasi, one-day plan, WhatsApp enquiry |
| **T6 Accessibility / senior traveller** | Step-free or low-walking options, rest points | Walking-intensity filter, senior-friendly itinerary, accessibility guide |

### 4.2 Partners (supply side)

| Partner type | Examples |
|---|---|
| **P1 River** | Rowing boat operators, motorboat operators, Aarti boat providers |
| **P2 Guides** | Heritage guides, temple guides, Sarnath guides, walking-tour hosts, local companions (formerly "buddies" in the prototype) |
| **P3 Transport** | Airport/railway transfer drivers, car hire, sightseeing transport, outstation |
| **P4 Stays** (P2) | Hotels, homestays, guesthouses |
| **P5 Experience hosts** | Food-walk hosts, weavers' workshops, music teachers, yoga teachers |

### 4.3 Internal roles

| Role | Permissions (summary) |
|---|---|
| **Writer** | Create and edit drafts; submit for editorial review |
| **Editor** | Edit any draft; approve editorial review; manage SEO fields, navigation, homepage sections |
| **Fact-checker** | Complete fact verification; set `last_verified_at`, `next_review_at`, confidence; reject with notes |
| **Publisher** (Admin only) | Approve the exact reviewed revision; publish verified entries; schedule; archive. Editors and authors cannot publish independently. |
| **Ops** | Manage partners, verification records, leads, today's alerts |
| **Support** | View and update leads and complaints; message travellers; cannot edit content or partners' verification |
| **Admin** | All of the above plus user/role management, settings, audit log |

---

## 5. Architecture and key decisions

### 5.1 Current state of this repository (prototype)

| Layer | What exists |
|---|---|
| Public site | Static HTML/CSS/JS in `docs/` (GitHub Pages). A generator, `scripts/build-site.mjs`, builds 6 experience pages, an experiences listing, legal pages from `content/legal/`, `sitemap.xml` and photo credits. `scripts/set-site-url.mjs` handles domain switches. A PWA service worker. Responsive WebP images via `scripts/optimize-images.sh`. JSON-LD (TravelAgency, BreadcrumbList, TouristTrip). |
| API | Express 5 + Node 24 + SQLite (`node:sqlite`) in `server/`. Tables: `users`, `buddies`, `stories`, `buddy_applications`, `plan_requests`, `hero_slides`. |
| Security | `middleware/auth.js` (`loadUser`, `requireAuth`, `requireRole`, `requireAdmin`), `middleware/validate.js` (`validateBody`, `validateParam`), `middleware/requestGuards.js` (CORS allow-list, JSON-only writes, `TRUST_PROXY`). Helmet, a global rate limit, and a failed-login rate limit. Revocable JWT sessions (`token_version`). Collision-safe reference codes. Upload type and size limits. |
| Notifications | `server/src/notify.js`: SMTP (team email and traveller confirmation) and WhatsApp Cloud API template alerts, both optional and env-configured. |
| Admin | React (Vite) admin in `src/admin/`: dashboard, hero photos, buddy applications, plan requests (status), buddies, stories, users. |
| Ops | Docker Compose (API + nginx web), `DEPLOY.md`, password-reset CLI. |

### 5.2 Architecture decisions (ADR summaries)

**ADR-01 — One Next.js application with an integrated CMS**
- *Decision:* Migrate public pages, React admin and Express endpoints into Next.js App Router with TypeScript. Route Handlers provide browser-facing APIs; Server Components call server-only services directly. Preserve validation, authorization, session revocation and API contracts during migration.
- *Rationale:* Content review, verification, partners and booking requests share one application and database. Shared service and repository layers avoid duplicating business rules across pages and handlers.

**ADR-02 — Indexable Next.js public pages**
- *Decision:* Render public content with Server Components and prerendering/revalidation where appropriate. Publishing, archiving and expiry invalidate affected pages and search data. Client Components handle forms, filters and itinerary interactions. Private admin, preview and customer tracking responses are not publicly cached.
- *Deployment:* A Node/Docker runtime serves the website and API on one origin. GitHub Pages is no longer the full-stack deployment target. Production media uses object storage; secrets remain server-side.

**ADR-03 — "Today" alerts are served live, not baked into static pages**
- *Decision:* Time-sensitive banners (today's alerts, current access rules) load from a cached API endpoint (≤ 5 min cache) and render on static pages. A static fallback says "check today's alerts" and never shows a stale value.
- *Rationale:* A static rebuild cadence must never decide whether a safety notice is current.

**ADR-04 — MySQL with Prisma**
- *Decision:* Use MySQL for the migrated application and Prisma for schema migrations and database access. Migrate SQLite records while preserving IDs, password hashes, references and timestamps; verify counts, relationships and representative records before cutover. SQLite remains only the legacy source.
- *Operations:* Use connection pooling, database constraints and transactions for booking transitions, content approval and notification job creation. Rehearse backup restoration and migration rollback before launch.

**ADR-05 — Images: original upload → generated responsive WebP/AVIF → CDN**
- *Decision:* Admin uploads originals to object storage (S3-compatible). The build or an on-upload job generates 640/1280/1920 WebP (AVIF optional) and records width/height. Pages use `srcset` and explicit dimensions. Originals are kept for social images. This extends the current `optimize-images.sh`.
- *Alternatives:* An image CDN with on-the-fly transforms (cost per transform; simpler). Acceptable if cost is within [[budget]].

**ADR-06 — Search: static index for the MVP, server search later**
- *Decision:* MVP search covers published places, guides, blog posts, experiences, services, itineraries and festivals, with category and suitability filters. Start with indexed MySQL queries through Prisma; evaluate MySQL full-text or a dedicated search service when measured relevance or scale requires it. Drafts, archived entries and private customer records are excluded.

**ADR-07 — Leads before payments**
- *Decision:* Every commercial action creates a tracked lead with a booking code before handing off to WhatsApp, a phone call or email. No payment collection in the MVP (feasibility plan §8.3).

**ADR-08 — First-party, privacy-friendly analytics**
- *Decision:* Record anonymous aggregate events in our own API: no third-party trackers, no cross-site identifiers, no personal data in events. A random per-device ID is held in `localStorage` only after the traveller accepts analytics; without consent, events are counted without an ID (M1 is then estimated from sessions).
- *Alternatives:* Plausible or Umami (self-hosted). Acceptable substitutes if they meet NFR-PRIV.

---

## 6. Functional requirements

> Each requirement lists priority, description, user stories and acceptance criteria. "Published" always means published through the FR-CMS workflow.

### 6.1 Navigation — FR-NAV

**FR-NAV-01 Primary navigation** — *MVP*
Five top-level menus (Explore, Things to Do, Plan, Services, About), a search entry point and a primary "Plan My Trip" button, grouped exactly as `product/01-sitemap.md` §1.2.
- *Story:* As a traveller on a phone, I want a short menu, so that I can find what I need without scrolling a long list.
- *Acceptance:*
  - [ ] The header shows at most 5 top-level items plus search and "Plan My Trip" at ≥ 1024 px.
  - [ ] Below 1024 px a menu button opens a drawer with one accordion per menu. All 11 sections from the brief are reachable within 2 taps.
  - [ ] Dropdowns open on hover and keyboard focus, close on Escape and outside click, and expose `aria-expanded`.
  - [ ] The drawer traps focus while open and returns focus to the menu button on close.
  - [ ] The current section is marked with `aria-current="page"` (or `"true"` on the parent).
  - [ ] The header is sticky and never covers focused elements (WCAG 2.4.11).

**FR-NAV-02 Breadcrumbs** — *MVP*
Every page below a hub shows a breadcrumb trail matching its URL hierarchy, with BreadcrumbList structured data.
- *Acceptance:* Given `/places/temples/kashi-vishwanath`, the breadcrumb reads Home › Places to Visit › Temples › Shri Kashi Vishwanath Temple, and the JSON-LD contains the same 4 items.

**FR-NAV-03 Footer** — *MVP*
The footer contains Explore, Plan and Services links, "Today in Varanasi", emergency contacts, About, Partner With Us, the legal links and photo credits.
- *Acceptance:* An emergency-contacts link is present in the footer of every page, including the 404 and offline pages.

**FR-NAV-04 Contextual "what next" links** — *MVP*
Every detail page ends with related items: places ↔ things to do ↔ itineraries ↔ services ↔ festivals (relationships from FR-CMS-03).
- *Story:* As a traveller reading about Assi Ghat, I want to see things to do there and plans that include it, so that I can act on what I just read.
- *Acceptance:* Each published place, things-to-do, festival and itinerary page shows ≥ 3 related links when ≥ 3 related published entries exist. It never links to unpublished or archived entries.

**FR-NAV-05 Language switch** — *P2*
EN/हिंदी switch. It goes to the same page in the other language if one exists, otherwise to that language's homepage, with a notice.

### 6.2 Universal search — FR-SRCH

**FR-SRCH-01 Search across all content types** — *MVP*
One search box covering places, explore articles, things to do, local experiences, services, itineraries, festivals, food, shopping, markets and travel-guide pages.
- *Story:* As a traveller, I want to type "aarti" and see the guide, the ghat, the boat experience and today's timing alert, so that I don't need to know where things are filed.
- *Acceptance:*
  - [ ] Results are grouped by type with a count per group, and each shows title, type label, short description and URL.
  - [ ] Results return in ≤ 300 ms after typing stops (debounce 150 ms) on a mid-range Android device with the index cached.
  - [ ] Matching is case-, diacritic- and transliteration-tolerant for common variants. A synonym list in the CMS handles e.g. "Kashi Vishwanath" / "Vishwanath" / "golden temple varanasi", "Dashashwamedh" / "Dasaswamedh", "Banaras" / "Benares" / "Varanasi".
  - [ ] Only published, non-expired entries are indexed.
  - [ ] An empty result state suggests popular searches and a "Ask us on WhatsApp" enquiry link.
  - [ ] The search page is `/search?q=` and is `noindex`.

**FR-SRCH-02 Search filters** — *P2*
Filter results by type, area of the city and interest tag.

**FR-SRCH-03 Hindi search** — *P2*
Devanagari queries match Hindi content, and transliterated Latin-script Hindi matches both.

### 6.3 Destination knowledge hub — FR-EXPL

**FR-EXPL-01 Explore hub** — *MVP*
`/explore/` lists all published explore articles as cards (image, title, one-line summary), grouped as History, Faith & Philosophy, River & Ghats, Arts & Crafts, Life in Varanasi.

**FR-EXPL-02 Long-form articles** — *MVP for [MVP] slugs, P2 for the rest*
One article per topic in the sitemap's `/explore/` tree, using the article template (`product/` templates document).
- *Story:* As a curious traveller, I want to understand why Varanasi matters before I arrive, so that I experience it with context and respect.
- *Acceptance:*
  - [ ] Each article has a summary (≤ 160 characters), a reading-time estimate, a table of contents for articles over 1,200 words, sources and a "last reviewed" date.
  - [ ] **Claim labelling:** every historical or religious claim is presented in one of three registers, using the CMS's inline claim labels:
    - *documented history* (with a source)
    - *archaeological evidence* (with a source)
    - *tradition / belief* (attributed, e.g. "According to Hindu tradition…")
  - [ ] Mythological accounts are never stated as historical fact. The fact-checker cannot pass an article with an unlabelled claim of this kind.
  - [ ] Contested historical or legal matters (e.g. sites under litigation) are described neutrally, with dates and sources, and reviewed by the editor before publication.

**FR-EXPL-03 Summary cards** — *MVP*
Every article provides a card summary (≤ 160 characters) and card image, used in hubs, homepage and related links.

### 6.4 Places directory — FR-PLC

**FR-PLC-01 Directory with filters** — *MVP*
`/places/` lists all published places with filters: category (temple, ghat, heritage, museum, nearby: short excursion / intercity), interests, area, accessibility (low walking, step-free access known), suitable for (families, seniors), and "open now" (P2, only for places with verified opening hours).
- *Acceptance:*
  - [ ] Filters combine with AND across groups and OR within a group.
  - [ ] Results update without a full page reload, and the URL reflects the filters (shareable).
  - [ ] Without JavaScript, the hub still lists all places, grouped by category.
  - [ ] A list/map toggle is available (map is P2, see FR-PLC-05).

**FR-PLC-02 Place detail page** — *MVP*
Uses the place template. The required sections for **temples** are: introduction and significance; history and traditions (claim-labelled); architecture; visiting information; darshan and Aarti information; entry rules and restrictions; what to carry or avoid; photography rules; accessibility and senior guidance; transport and last-mile walking; nearby attractions; recommended duration; FAQs.
- *Story:* As a pilgrim travelling with my parents, I want to know the entry rules, what can't go inside and how far we must walk, so that we arrive prepared.
- *Acceptance:*
  - [ ] Every time-sensitive field (timings, fees, rules, photography policy) shows its own "Verified on <date> · Source: <name>" line.
  - [ ] If a time-sensitive field has expired (`next_review_at` in the past) it is **hidden** and replaced by "We're re-checking this — see the official source", linking to the official source. It is never shown as current (FR-CMS-05).
  - [ ] Fields with no verified value show "Not yet verified". The system never fills them with an estimate.
  - [ ] The page shows the place's verified location as coordinates and a link that opens in the device's maps app.
  - [ ] Recommended duration is labelled as a suggestion, not a rule.

**FR-PLC-03 Ghat pages with cultural-sensitivity rules** — *MVP*
Ghat pages cover history, cultural importance, nearby landmarks, suggested visiting times (labelled as suggestions), accessibility and photography etiquette.
- *Acceptance:*
  - [ ] Pages for cremation ghats (Manikarnika, Harishchandra) carry a mandatory "Respect and privacy" block above the fold. It states that cremations are private family rites and that photographing or filming them is inappropriate.
  - [ ] These pages never use cremation as a promotional image, CTA or "experience".
  - [ ] Such pages cannot be published until an editor ticks the "cultural review completed" checkbox (FR-CMS-04).

**FR-PLC-04 Nearby destinations split** — *MVP*
`/places/nearby/` separates *Short excursions (same day)* from *Intercity trips (overnight recommended)*.
- *Acceptance:* Distance and travel time are shown only when verified (with a date and source) and always as approximate ranges. Sarnath is cross-listed with a canonical URL of `/places/heritage/sarnath`, never duplicated.

**FR-PLC-05 Map view** — *P2*
A map of places with clustering, filters shared with the list view, and a "walking distance from here" ring.

### 6.5 Things to Do — FR-TTD

**FR-TTD-01 Activity guides** — *MVP*
One neutral editorial guide per activity in `/things-to-do/` (sunrise and sunset boat rides, Ganga Aarti, morning ghat walk, heritage walks, temple circuits, Sarnath Buddhist tour, food walks, silk-weaving visits; P2 items as tagged).
- *Acceptance:* Each guide covers who it suits, typical duration, a suggested schedule, what to expect, safety guidance, etiquette, seasonal notes (e.g. monsoon river closures) and how to do it independently. It **then** links to matching Local Experiences and Services, under a clearly labelled "Book with a verified local" section.

**FR-TTD-02 Interest filters** — *MVP*
The hub filters by interest (spiritual, heritage, food, river, crafts, music, photography, wellbeing), time of day and suitability (families, seniors, solo).

**FR-TTD-03 Photography etiquette** — *MVP for the photography-walk guide, which is P2*
Every activity involving people, rituals or sacred spaces includes photography guidance (ask permission, respect "no photography" signs, never photograph cremations).

### 6.6 Local Experiences — FR-EXP

**FR-EXP-01 Experience offering pages** — *MVP*
Each `/experiences/<slug>` is a specific offering by one or more verified partners. Sections: who it is for, duration, suggested schedule, meeting point, price range (only if confirmed by the partner, with a date), inclusions, exclusions, safety, cancellation terms, partner verification status, enquiry options.
- *Story:* As a traveller, I want to see exactly what is included and how much it roughly costs before I message anyone, so that I can trust what I'm booking.
- *Acceptance:*
  - [ ] Price displays as "₹X–₹Y per <unit>, confirmed with the partner on <date>", or "Price on request" if no confirmed range exists.
  - [ ] Partner verification status shows one of: *Verified (ID, references, in-person) on <date>* · *Under verification* (offering cannot be published) · *Suspended* (offering automatically unpublished).
  - [ ] Cancellation terms link to `/cancellation-policy`, plus any partner-specific terms.
  - [ ] An offering cannot be published unless at least one linked partner has status *Verified* and the offering's facts are fact-checked.

**FR-EXP-02 Experience–guide linkage** — *MVP*
Every experience links to its parent Things-to-Do guide, and every guide lists its active experiences.

**FR-EXP-03 Limited online booking** — *P2, gated*
Bookable experiences with payment are enabled **only** after the six-month decision gate ("Proceed to limited checkout").

### 6.7 Travel Services and lead tracking — FR-SVC

**FR-SVC-01 Service category pages** — *MVP*
Category pages for transport, guides and tours, river experiences, travel assistance (stays in P2). Each shows a description, service coverage (areas and times), what's included, limitations, estimated cost (only when verified), response expectations (S1/S2), and the verified partners offering it (count and status, not a full directory in the MVP).

**FR-SVC-02 Context-aware enquiry form** — *MVP*
A single enquiry flow available from any service, experience, itinerary or place page, prefilled with that context (service type, experience, itinerary, area, dates).
- *Story:* As a traveller, I want to send one short enquiry with my dates and contact details, so that someone local gets back to me quickly.
- *Acceptance:*
  - [ ] Required fields: name, and either a WhatsApp/phone number or an email.
  - [ ] Optional fields: dates, number of travellers, seniors/children, notes.
  - [ ] Consent checkbox (unticked by default) linking to `/privacy`: *"I agree that Varanasi Trip Companion may share my request with verified local partners to arrange my trip."*
  - [ ] Validation runs on both client and server. The server uses `validateBody` with length limits, and invalid input returns 400 with a field message.
  - [ ] On success, the traveller sees a reference/booking code (format `TOB-YYYY-XXXXXXXX` today; `VTC-YYYY-XXXXXXXX` once the Varanasi Trip Companion rebrand ships — old codes stay valid), the S1 response promise, and a "Continue on WhatsApp" button.
  - [ ] The submission is rate-limited per IP and per contact (≤ 5 per hour per phone/email) to deter spam.

**FR-SVC-03 Tracked WhatsApp hand-off** — *MVP*
"Contact on WhatsApp" first creates a lead server-side, then opens `https://wa.me/<number>?text=<prefilled message including booking code>`.
- *Acceptance:*
  - [ ] Given a traveller taps "Contact on WhatsApp" on an experience page, a lead is created with source page, item, UTM parameters and booking code **before** the redirect.
  - [ ] The prefilled message contains the booking code and item name.
  - [ ] In the MVP the WhatsApp number is the platform's support number, not the partner's, so that every conversation passes through the team and attribution is not lost (feasibility risk "supplier bypasses platform").
  - [ ] If WhatsApp is not installed, the link falls back to WhatsApp Web, and the page also shows the booking code and an email alternative.

**FR-SVC-04 Lead pipeline** — *MVP*
The admin shows every lead with status: `new → contacted → partner_assigned → confirmed → completed | cancelled | lost`. Each status change is timestamped and records the user who made it.
- *Acceptance:*
  - [ ] The system computes and shows first-response time (S1) and time-to-confirmation (S2) per lead, and medians per day/week.
  - [ ] A lead that breaches S1 (no `contacted` within 10 min, 06:00–22:00 IST) is highlighted and triggers an alert to the on-duty support channel.
  - [ ] `completed` requires the booking value and agreed commission (₹) to be entered. `lost` requires a reason from a configurable list.
  - [ ] Leads are filterable by status, service type, partner, date and SLA breach, and exportable as CSV (role Ops/Admin only).
  - [ ] Personal data in leads is visible only to roles Support, Ops and Admin.

**FR-SVC-05 Partner assignment and response tracking** — *MVP*
Ops assigns one partner per lead (or one per service line). The system records when the partner was asked, when they accepted or declined, and their response time (M8).
- *Acceptance:* The partner response rate is computed as accepted-or-declined within [[30]] minutes ÷ requests sent, per partner per month, and shown on the partner record.

**FR-SVC-06 Notifications** — *MVP (exists, extend)*
New leads notify the team by email and WhatsApp template, and send the traveller an email confirmation (the existing `notify.js`). Extensions: the day-before reminder (S3) and the post-service feedback request (S6) are queued automatically from lead status and dates.
- *Acceptance:*
  - [ ] Notification failures never fail the traveller's request.
  - [ ] Each send attempt is logged with channel, status and timestamp, without message body PII.

**FR-SVC-07 Booking codes and QR confirmation** — *P2*
Partners confirm service delivery by scanning or entering the booking code. This marks the lead as `completed` pending ops review, and attributes commission.

**FR-SVC-08 Complaints** — *MVP*
`/about/complaints` lets a traveller raise a complaint, optionally with a booking code. Complaints have status, owner, an S7 timer and a resolution note. Complaints linked to a partner update that partner's score (FR-PART-04).

### 6.8 Food and Shopping — FR-FOOD / FR-SHOP

**FR-FOOD-01 Food guide pages** — *MVP for [MVP] slugs*
Each dish page covers description, culinary context, typical ingredients, dietary cautions (dairy, nuts, gluten, spice, and bhang in some thandai, with legal and health caution), typical availability (season, time of day), the areas where it is commonly found, and practical tips.
- *Acceptance:*
  - [ ] No restaurant or stall is named unless it exists as a CMS *business* entry whose identity and location are verified (with date and source). Ratings, hygiene certifications or endorsements are never shown unless we hold them ourselves.
  - [ ] Seasonal items (e.g. malaiyo) show their season and are flagged "out of season" outside it.

**FR-FOOD-02 Food areas** — *MVP*
`/food/food-areas` describes areas, not ranked shop lists.

**FR-SHOP-01 Shopping guides** — *MVP for [MVP] slugs*
Cover product categories (silk sarees, brocade, handloom, crafts, religious goods, toys, instruments, jewellery as phased), plus etiquette, bargaining guidance, authenticity advice and ways to support genuine artisans.
- *Acceptance:*
  - [ ] Shops are never labelled "certified" or "verified" unless the platform performed and recorded that verification.
  - [ ] Authenticity advice cites official schemes (e.g. Geographical Indication registration for Banaras brocades and sarees) **with a source**, and explains how a buyer can check, not just a claim.
  - [ ] Pages state the platform's no-shopping-commission policy for partners.

**FR-SHOP-02 Market pages** — *MVP for [MVP] slugs*
Market pages (Godowlia, Vishwanath Gali, Madanpura, etc.) cover what each market is known for, typical hours (verified or omitted), crowd notes, accessibility and nearby places.

### 6.9 Festivals and Culture — FR-FEST

**FR-FEST-01 Festival pages** — *MVP for [MVP] slugs*
Sections: background and significance (claim-labelled), traditions and celebrations, typical season, exact dates for the relevant year, important locations, crowd expectations, travel restrictions and planning advice, safety guidance, related itineraries and experiences.
- *Story:* As a traveller planning around Dev Deepawali, I want to know whether this year's date is confirmed and what restrictions apply, so that I don't plan on a rumour.
- *Acceptance:*
  - [ ] The "exact date" field has states *Confirmed (source, date verified)*, *Expected (based on the Hindu calendar; not yet officially confirmed)* or *Unknown*. The page labels it accordingly, and only *Confirmed* is shown without a caveat.
  - [ ] Event schedules (programmes, closures, traffic diversions) are shown only from an official or organiser source with a verification date. Otherwise the page says "Schedule not yet announced".
  - [ ] Festival pages automatically show the current year's entry, and archive the previous year's dates as history.

**FR-FEST-02 Festival calendar** — *P2*
A month view listing only *Confirmed* and clearly labelled *Expected* dates, with an `.ics` download for confirmed events.

### 6.10 Plan Your Trip — FR-PLAN

**FR-PLAN-01 Ready-made itineraries** — *MVP*
Published itineraries per the sitemap. Each has days → time blocks → stops, with walking segments, transport segments, breaks, alternatives (monsoon, festival-day, low-walking), and links to places, guides, experiences and services.
- *Acceptance:*
  - [ ] Every block shows a suggested time window labelled "suggested".
  - [ ] Any stop with verified opening hours is scheduled inside them. Stops without verified hours carry a "check timings" note.
  - [ ] Each itinerary shows its total walking estimate and an effort level (low / moderate / high).

**FR-PLAN-02 Trip planner inputs** — *MVP*
Inputs:
- Travel dates (or number of days if dates are unknown), 1–7 days.
- Arrival time and point (airport, Varanasi Junction, Banaras station, DDU, road).
- Interests (multi-select).
- Number of travellers.
- Travelling with seniors and/or children.
- Preferred walking intensity (low / moderate / high).
- Approximate budget (budget / mid / premium; used only to choose between paid options and suggest services).
- Pace (relaxed / balanced / packed).
- *Acceptance:*
  - [ ] All inputs are optional except days or dates. Defaults: 2 days, balanced, moderate walking.
  - [ ] The form is keyboard and screen-reader operable, with labelled controls and grouped options (fieldset/legend).

**FR-PLAN-03 Itinerary generation** — *MVP*
Generate a day-by-day plan from published place, activity and template data using rule-based logic:
- Opening hours (verified only).
- Fixed-time events (sunrise, the Aarti window when verified).
- Typical travel and walking times between areas (editor-maintained matrix, labelled as typical).
- Walking-intensity limits.
- Breaks every ≤ 3 hours.
- Senior/child rules (fewer stairs-heavy ghats, shorter walking blocks).
- Seasonal rules (monsoon: replace boat blocks with ghat or rooftop alternatives).
- Festival rules (crowd warnings on festival dates in the data).
- *Story:* As a family with a grandparent, I want a 2-day plan with little walking and rest breaks, so that everyone enjoys it.
- *Acceptance:*
  - [ ] Given 2 days, low walking and seniors, no day exceeds the editor-set low-walking limit (default [[3 km]]) and no block exceeds [[90]] minutes without a break.
  - [ ] Given dates in the configured monsoon window with a river advisory active, boat blocks are replaced and the replacement is explained.
  - [ ] Generation completes in ≤ 1 s on a mid-range phone, and works offline once data is cached.
  - [ ] Every generated plan shows: *"Suggested plan based on typical conditions. Check Today in Varanasi for current alerts."*

**FR-PLAN-04 Edit and reorder** — *MVP*
Users can remove, add (from search or suggestions), reorder (drag and keyboard buttons) and move stops between days. Travel and walking times recalculate after each change.
- *Acceptance:* Every reorder action is possible without a pointer (move up/down buttons), and announces the result to screen readers.

**FR-PLAN-05 Save** — *MVP*
Save to the device (localStorage/IndexedDB) under `/plan/my-trips`, no account needed. Saved trips are available offline via the service worker. P2: sync to an account (FR-ACC-02).

**FR-PLAN-06 Share** — *MVP*
"Share" creates a read-only link `/plan/trip/<share-id>` (stored server-side, no personal data, `noindex`), plus "Send to WhatsApp" and "Copy link".
- *Acceptance:* Shared links stay valid for ≥ 12 months. The recipient can "Make a copy" to edit their own version.

**FR-PLAN-07 Print / PDF** — *P2*
A printer-friendly view with a QR code to the shared link.

**FR-PLAN-08 Enquire from a plan** — *MVP*
"Get help with this plan" creates a lead containing the itinerary (share-id) and the services it implies (e.g. airport transfer, Aarti boat, Sarnath transport).

**FR-PLAN-09 No live-condition claims without data** — *MVP*
The planner must not state or imply that it accounts for live crowds, queues or closures. Phase 3 crowd-aware planning requires a documented, validated data source, and ADR approval before any such claim is shown.

**FR-PLAN-10 Planner analytics events** — *MVP*
Emit `itinerary_started`, `itinerary_generated`, `itinerary_edited`, `itinerary_saved`, `itinerary_shared` and `itinerary_completed` (completed = saved or shared or enquired) for M3/M4.

### 6.11 Travel Guide and alerts — FR-GUIDE

**FR-GUIDE-01 Travel essentials pages** — *MVP for [MVP] slugs*
Pages per the sitemap's `/travel-guide/` tree, using the travel-guide template.
- *Acceptance:* Every time-sensitive statement carries a verification line. Emergency, transport-restriction and public-safety information cites an official source only.

**FR-GUIDE-02 Today in Varanasi (alerts)** — *MVP*
Ops can post alerts with: title, body, category (river/boat, Aarti, temple access, traffic and closures, weather, festival crowd, safety), severity (info / caution / critical), affected areas and places, start and end time, source.
- *Story:* As a traveller arriving today, I want to know whether boats are running and where the Aarti is, so that I don't waste the evening.
- *Acceptance:*
  - [ ] Active alerts show on `/travel-guide/today`, as a banner on affected place, itinerary and things-to-do pages, and in the planner.
  - [ ] Alerts disappear automatically at their end time. Alerts without an end time expire after [[24]] hours unless renewed.
  - [ ] Critical alerts require the Ops or Admin role and a source.
  - [ ] Posting an alert takes ≤ 1 minute from the admin on a phone (mobile-friendly form).
  - [ ] Alerts are served via the API with ≤ 5 minutes caching (ADR-03). If the API is unreachable, pages show "Live alerts unavailable — check official sources" rather than nothing.

**FR-GUIDE-03 Emergency information** — *MVP*
`/travel-guide/emergency`: national and state emergency numbers, police, ambulance, women's helpline, tourist helpline, nearest hospitals by area, embassy guidance for foreign nationals.
- *Acceptance:*
  - [ ] Every number and address has a source and a verification date, and is re-verified at least every [[30]] days (`next_review_at`).
  - [ ] An expired entry is shown with "Last verified <date> — please confirm" rather than hidden, because safety information must never disappear silently. Its expiry also raises a critical item in the review queue.
  - [ ] The page is precached by the service worker and works offline.
  - [ ] It is reachable in one tap from the footer and from the menu drawer on every page.

**FR-GUIDE-04 FAQ** — *MVP*
FAQ entries are managed in the CMS, attached to pages, and output as FAQPage structured data only where the content is visible on the page.

### 6.12 Content management — FR-CMS

**FR-CMS-01 Content modules** — *MVP (P2 where noted)*
Modules:
- Places (temples, ghats, heritage, museums, nearby)
- Categories and tags
- Explore articles
- Food items
- Shopping guides
- Markets
- Businesses (P2)
- Festivals and festival occurrences
- Itineraries
- Things-to-do guides
- Local experiences
- Services
- Partners (verified suppliers)
- Travel alerts
- FAQs
- Blog posts (P2)
- SEO metadata
- Navigation
- Homepage sections
- Media library
- Synonyms (search)
- Redirects

**FR-CMS-02 Common fields** — *MVP*
Every content entry supports:
- `title`, `slug`, `summary`, `body` (rich text: headings, lists, tables, images, callouts, inline claim labels)
- `featured_image` + `gallery` (with alt text required, caption, credit, licence)
- `category`, `tags`, `location` (lat/long + area + address text)
- related entries
- `source_refs` (list: title, publisher, URL, accessed date, type official/scholarly/organiser/field-visit), stored as `source` rows (§8)
- `author_id`, `reviewer_id`, `fact_checker_id`, `created_at`, `updated_at`, `last_verified_at`, `next_review_at`
- `status`, `seo_title`, `seo_description`, `og_image`, structured-data type
- Localised fields in pairs (`title_en`/`title_hi`, `summary_en`/`summary_hi`, `body_en`/`body_hi`, …) plus `hi_status`, and `version`. Field-level definitions: [product/05-cms.md](product/05-cms.md) §5.2–5.3
- *Acceptance:*
  - [ ] Images cannot be saved without alt text and a credit/licence.
  - [ ] Slugs are unique per type and lowercase-hyphenated; the Hindi page uses the same slug under `/hi/`. Changing a published slug creates a 301 redirect automatically.

**FR-CMS-03 Relationships** — *MVP*
Typed many-to-many relations (place↔activity, place↔itinerary, activity↔experience, experience↔partner, service↔partner, festival↔place, alert↔place/area). They power FR-NAV-04 and the planner.

**FR-CMS-04 Editorial workflow** — *MVP*
States: `draft → editorial_review → fact_verification → published → scheduled_review → (updated → editorial_review…) | archived`.
- *Acceptance:*
  - [ ] Transitions are role-restricted (§4.3). A writer cannot publish. The fact-checker must differ from the author.
  - [ ] Fact verification requires `last_verified_at`, `next_review_at`, ≥ 1 source per time-sensitive field and a confidence (high/medium/low). Low confidence on a time-sensitive field blocks publishing.
  - [ ] Content flagged as culturally sensitive (cremation ghats, religious rites, contested history) additionally requires an editor's "cultural review completed" tick.
  - [ ] When `next_review_at` passes, a published entry moves to `scheduled_review`. It stays public, but its expired time-sensitive fields are suppressed (FR-PLC-02), and it appears in the review queue.

**FR-CMS-05 Field-level verification for time-sensitive facts** — *MVP*
Timings, fees, rules, prices, phone numbers, dates and distances are structured fields, not free text, each with its own `verified_at`, `expires_at` and source.
- *Acceptance:*
  - [ ] Publishing is blocked if any time-sensitive field lacks verification.
  - [ ] Free-text body content is scanned for time and price patterns (e.g. `\d{1,2}(:\d{2})?\s?(am|pm)`, `₹\s?\d`). Any match warns the fact-checker to move it into a structured field.

**FR-CMS-06 Versioning and audit** — *MVP*
Every save creates a version. Editors can diff and restore. An audit log records who did what and when (create, edit, transition, publish, archive, role change, partner verification change, lead export) and cannot be edited by anyone, including admins.

**FR-CMS-07 Bilingual content** — *MVP data model, P2 content*
Each entry stores English and Hindi prose side by side (`_en` / `_hi` fields). Time-sensitive values (`fact` rows) are shared by both languages, so a timing or rule can never differ between them; only prose is translated. Hindi has its own workflow status (`hi_status`) and cannot be published until a reviewer fluent in Hindi has approved it. When English prose changes, the Hindi version is flagged "translation outdated". Machine-translated text is labelled as a draft and cannot be published unreviewed.

**FR-CMS-08 Publish pipeline** — *MVP*
Publishing, unpublishing, archiving or expiry triggers a site rebuild. The changed page is live in ≤ 10 minutes, and the search index and sitemap update in the same build.

**FR-CMS-09 Review queue and freshness dashboard** — *MVP*
Shows entries due for review in the next 7 days, overdue entries, and the percentage of time-sensitive fields verified on schedule (M9), with breakdowns by module and owner.

**FR-CMS-10 Navigation and homepage management** — *MVP*
Editors manage menu items, homepage sections (order, title, description, card source: manual picks or a query by tag) and FAQ placement without code changes.

**FR-CMS-11 Media management** — *MVP*
Upload, crop focal point, alt text, credit and licence. Responsive variants are generated automatically (ADR-05). Images used by published pages cannot be deleted.

### 6.13 SEO — FR-SEO

**FR-SEO-01 Indexable static pages** — *MVP*: all public knowledge and commercial pages are pre-rendered HTML (ADR-02).
**FR-SEO-02 Metadata** — *MVP*: unique `<title>` (≤ 60 characters target) and meta description (≤ 155 characters) per page, editable in the CMS. Duplicates are flagged by the build.
**FR-SEO-03 Canonicals and redirects** — *MVP*: a self-referencing canonical on every indexable page; cross-listed pages (e.g. `/places/nearby/sarnath`) canonicalise to the primary URL; prototype URLs 301 to new ones (`product/01-sitemap.md` §1.5).
**FR-SEO-04 Sitemaps and robots** — *MVP*: an XML sitemap per locale, limited to published, indexable pages, with `lastmod` = `updated_at`. `robots.txt` disallows `/admin/`, `/account/`, `/plan/trip/`, `/search` and `/enquiry`.
**FR-SEO-05 Structured data** — *MVP*: TravelAgency/Organization + WebSite (home); TouristAttraction/PlaceOfWorship/LandmarksOrHistoricalBuildings (places); TouristTrip (experiences, itineraries); Event (festivals with **confirmed** dates only); Article (explore/blog); FAQPage (where FAQs are visible); BreadcrumbList (all). It must validate with no errors in Google's Rich Results Test.
**FR-SEO-06 Internal linking** — *MVP*: related-content blocks (FR-NAV-04), hub ↔ detail links, and contextual in-body links from the CMS. Orphan pages (no internal inbound links) are reported by the build.
**FR-SEO-07 Hreflang** — *P2*: `en-IN`/`hi-IN` alternates and `x-default` for pages with both locales.
**FR-SEO-08 No thin content** — *MVP*: the build warns on indexable pages under [[300]] words of body text (excluding hubs) and on near-duplicate summaries.

### 6.14 Internationalisation — FR-I18N

**FR-I18N-01 Locale-aware URLs** — *P2*: Hindi under `/hi/…` mirroring the English tree.
**FR-I18N-02 UI strings** — *MVP*: all interface text lives in translation files (no hard-coded copy in components), with English shipped in the MVP.
**FR-I18N-03 Formats** — *MVP*: Indian number formatting (₹1,50,000), dates as "12 Nov 2026", times in IST with "IST" shown where ambiguity matters (international visitors).
**FR-I18N-04 Fonts** — *P2*: Devanagari-capable font stack with good legibility at small sizes.

### 6.15 Analytics — FR-ANL

**FR-ANL-01 Event collection** — *MVP*
First-party events (the canonical list, also used in [product/06-seo.md](product/06-seo.md) §6.14): `page_view`, `search_performed`, `itinerary_viewed`, `itinerary_started`, `itinerary_generated`, `itinerary_edited`, `itinerary_saved`, `itinerary_shared`, `itinerary_completed`, `partner_click`, `enquiry_started`, `lead_created`, `lead_status_changed`, `whatsapp_handoff`, `alert_viewed`, `emergency_viewed`, `feedback_submitted`. Lead events are recorded server-side when a lead is created or changes status. Each carries page, referrer category (organic search / social / partner QR / direct / referral / paid), UTM fields and locale.
- *Acceptance:*
  - [ ] No names, phone numbers, emails or free text appear in events.
  - [ ] IP addresses are not stored. They are used transiently for rate limiting only.
  - [ ] Respects the consent setting (ADR-08). Respects Do-Not-Track / Global Privacy Control by disabling the device ID.

**FR-ANL-02 Decision-gate dashboard** — *MVP*
The admin dashboard shows M1–M11 and S1–S8 for selectable periods, with targets and red/amber/green status.

**FR-ANL-03 Partner QR attribution** — *MVP*
Ops can generate partner/hotel-specific QR links (UTM-tagged short URLs). Visits and leads from each QR are attributed to that source.

### 6.16 Partners — FR-PART

**FR-PART-01 Partner application** — *MVP*
`/about/partner-with-us` accepts applications for all partner types (P1–P5), replacing the prototype's buddy application. Type-specific fields cover: boat registration/licence details where applicable; vehicle type and permit details; guide licence if held; languages; areas; services offered; indicative price range; availability.
- *Acceptance:* Government ID numbers are **not** collected in the web form. Identity is verified in person or via DigiLocker during onboarding (NFR-PRIV-04).

**FR-PART-02 Verification record** — *MVP*
Ops records the verification steps, each with date and verifier: identity checked (method), references called (2), in-person meeting, training completed, trial bookings (3) completed, service-standard agreement signed, police verification (optional, recommended for guides and drivers [[policy]]). Status: `applied → under_verification → verified → suspended | rejected`.
- *Acceptance:* Only `verified` partners can be linked to published offerings. Suspending a partner unpublishes their sole-partner offerings within the next build, and removes them from new lead assignment immediately.

**FR-PART-03 Partner record** — *MVP*
Contact details (internal only), services, areas, languages, confirmed price ranges (with dates), agreed commission terms (internal), documents (stored encrypted, NFR-PRIV-04), notes.

**FR-PART-04 Quality score** — *MVP computed and internal; F visible to partners*
Computed monthly from response rate, acceptance rate, on-time rate (from ops check-ins), traveller rating, complaints and no-shows. Thresholds trigger a warning, a review or suspension per the written service standard.

**FR-PART-05 Partner dashboard** — *P2*
Partners log in (phone OTP) to accept leads, update status, enter booking codes and see their score.

### 6.17 Admin console — FR-ADM

**FR-ADM-01 Roles and permissions** — *MVP*: role-based access per §4.3, enforced server-side with `requireRole` (extending the existing `middleware/auth.js`).
**FR-ADM-02 Mobile-usable admin** — *MVP*: alerts, lead status updates and partner assignment work on a 375 px wide phone.
**FR-ADM-03 Existing admin features retained** — *MVP*: dashboard, hero photos, plan requests (become leads), applications (become partner applications), users; with the accessibility fixes already applied (dialog focus handling, delete confirmations).
**FR-ADM-04 Data export and deletion** — *MVP*: export a traveller's data and delete or anonymise it on request (NFR-PRIV-03), logged in the audit trail.

### 6.18 Accounts — FR-ACC

**FR-ACC-01 No traveller account required** — *MVP*: every traveller feature (planner, save on device, share, enquiry) works without an account. The prototype's traveller signup/login is removed from the public navigation.
**FR-ACC-02 Phone-OTP accounts** — *P2*: sign in with a one-time code to sync saved trips across devices and see your enquiries. No passwords for travellers.
**FR-ACC-03 Staff accounts** — *MVP*: email + password (existing, bcrypt, revocable sessions, 12-hour admin sessions) plus mandatory TOTP two-factor authentication for Admin, Ops and Publisher roles.

---

## 7. Non-functional requirements

### 7.1 Performance — NFR-PERF
- **NFR-PERF-01** *MVP*: on a mid-range Android device over 4G (Lighthouse "Moto G Power / Slow 4G" profile), the 75th percentile meets LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 for home, hub and detail templates.
- **NFR-PERF-02** *MVP*: initial page weight ≤ 500 KB (compressed) excluding the LCP image; LCP image ≤ 200 KB at a 640 px viewport; JavaScript ≤ 120 KB compressed on knowledge pages (the planner route may load up to 250 KB).
- **NFR-PERF-03** *MVP*: all content images are responsive (`srcset`), WebP/AVIF, lazy-loaded below the fold, with explicit width and height (no layout shift).
- **NFR-PERF-04** *MVP*: API p95 latency ≤ 300 ms for reads and ≤ 800 ms for enquiry creation (excluding notification sending, which is asynchronous).
- **NFR-PERF-05** *MVP*: no decorative animation blocks first render. `prefers-reduced-motion` disables non-essential motion.

### 7.2 Accessibility — NFR-A11Y
- **NFR-A11Y-01** *MVP*: WCAG 2.2 Level AA across public pages and admin.
- **NFR-A11Y-02** *MVP*: carry forward the fixes already made in the prototype:
  - real buttons with `aria-pressed` for choices
  - visible focus on all fields, including composite fields
  - form errors linked via `aria-describedby` / `aria-invalid`
  - accessible dialogs (focus moves in, is trapped, Escape closes, focus returns)
  - confirmation before destructive actions
  - per-route page titles
  - heading order without skips
- **NFR-A11Y-03** *MVP*: resolve open items from `UX_A11Y_REVIEW.md` (contrast tokens, carousel pause control, 24×24 px minimum targets, skip link, combobox keyboard behaviour) before launch.
- **NFR-A11Y-04** *MVP*: automated checks (axe or equivalent) in CI with zero serious/critical violations. Manual screen-reader pass (TalkBack + VoiceOver) on 5 key journeys before each major release.

### 7.3 Security — NFR-SEC
- **NFR-SEC-01** *MVP*: all routes needing identity use `requireAuth` / `requireRole`. The role is read from the database on every request, and authorisation is tested per route (anonymous → 401, wrong role → 403).
- **NFR-SEC-02** *MVP*: every write endpoint validates its body with `validateBody` (types, lengths, enums, unknown keys dropped) and its route params with `validateParam`.
- **NFR-SEC-03** *MVP*:
  - CORS allow-list from `CLIENT_ORIGIN`.
  - Writes must be JSON or multipart (cross-site request forgery guard).
  - `Origin: null` is rejected in production.
  - `TRUST_PROXY` is set correctly behind the load balancer.
- **NFR-SEC-04** *MVP*: rate limits:
  - global per IP
  - failed logins (per IP and per account)
  - enquiries (FR-SVC-02)
  - analytics ingestion (per IP, with silent drop)
- **NFR-SEC-05** *MVP*: sessions are revocable (`token_version`). Logout and password change end all sessions. Admin sessions are ≤ 12 hours. Cookies are HttpOnly, Secure and SameSite=Lax. TOTP is required for privileged roles (FR-ACC-03).
- **NFR-SEC-06** *MVP*: uploads are type-checked by magic bytes as well as MIME type, size-limited, re-encoded, and stored outside the web root with random names.
- **NFR-SEC-07** *MVP*: secrets come from environment/secret manager only. `JWT_SECRET` must be ≥ 32 characters (startup check exists). There are no secrets in the repository.
- **NFR-SEC-08** *MVP*: security headers (CSP for public pages, `frame-ancestors 'none'` for admin, HSTS, nosniff, Referrer-Policy).
- **NFR-SEC-09** *MVP*: `npm audit` (production dependencies) passes with no high/critical issues in CI. Dependencies are reviewed monthly.
- **NFR-SEC-10** *MVP*: the open items in `SECURITY_AUDIT.md` (ID-number encryption, admin audit log, per-account throttling, non-root containers) are closed before launch.

### 7.4 Privacy — NFR-PRIV (India DPDP Act 2023)
- **NFR-PRIV-01** *MVP*: explicit, unbundled consent at every point where personal data is collected (enquiry, partner application, analytics ID). Consent records store purpose, timestamp and policy version.
- **NFR-PRIV-02** *MVP*: data minimisation. The enquiry asks only for what's needed to respond. No date of birth, ID number or address from travellers.
- **NFR-PRIV-03** *MVP*: data-principal rights (access, correction, erasure, consent withdrawal, grievance) are handled via the admin within [[30]] days. A named Grievance Officer is published in `/privacy`.
- **NFR-PRIV-04** *MVP*: partner identity documents are not collected via the public form. Where stored, they are encrypted at rest with application-level encryption (key outside the database), access-logged, and visible only to Ops/Admin. Only masked identifiers are shown by default.
- **NFR-PRIV-05** *MVP*: retention schedule enforced by a scheduled job:
  - leads: [[3 years]] after the service date (accounting)
  - unaccepted partner applications: [[6 months]]
  - analytics events: aggregated after [[13 months]]
  - audit log: [[3 years]]
- **NFR-PRIV-06** *MVP*: processors (hosting, email, WhatsApp, maps) are listed in the privacy policy. Personal data is shared with a partner only for an assigned lead, and only the fields needed.

### 7.5 Reliability and backups — NFR-REL
- **NFR-REL-01** *MVP*: the public static site stays available if the API is down. Interactive parts degrade with a clear message, and emergency information is still shown (precached).
- **NFR-REL-02** *MVP*: API monthly availability ≥ 99.5% (06:00–22:00 IST ≥ 99.9% target in peak season).
- **NFR-REL-03** *MVP*: MySQL backup at least daily using a consistent backup method, stored off-server, encrypted, retained 30 days. Include media recovery in the runbook. A restore test runs monthly. Recovery point objective (RPO) ≤ 24 hours; recovery time objective (RTO) ≤ 4 hours.
- **NFR-REL-04** *MVP*: graceful shutdown. Containers run as non-root, with health checks.

### 7.6 Observability — NFR-OBS
- **NFR-OBS-01** *MVP*: structured JSON logs with request ID. No personal data in logs (references only, as in the current `notify.js`).
- **NFR-OBS-02** *MVP*: error tracking (front-end and API) with alerting to the on-call channel.
- **NFR-OBS-03** *MVP*: uptime checks on `/api/health`, the homepage and the enquiry endpoint, every 1 minute, alerting within 3 minutes.
- **NFR-OBS-04** *MVP*: notification delivery failures (email/WhatsApp) alert ops if > 3 occur in 15 minutes.

### 7.7 Content freshness — NFR-FRESH
- **NFR-FRESH-01** *MVP*: default review cadences, configurable per field type:

  | Field type | Review cadence |
  |---|---|
  | Today's alerts | Daily (they expire) |
  | River/boat status, Aarti location | Daily in monsoon and festival periods; weekly otherwise |
  | Temple timings and rules | Weekly |
  | Prices and partner price ranges | Monthly |
  | Transport guidance, emergency numbers | 30 days |
  | Festival dates | On announcement and 14 days before |
  | Evergreen history/culture | 12 months |

- **NFR-FRESH-02** *MVP*: ≥ 95% of time-sensitive fields verified on schedule (M9). Any expired emergency entry is a critical incident.

### 7.8 Localisation — NFR-L10N
- **NFR-L10N-01** *P2*: Hindi pages meet the same accessibility, performance and SEO requirements as English.
- **NFR-L10N-02** *MVP*: content and UI support Unicode throughout (Devanagari in names, search, slugs transliterated to Latin for URLs).

### 7.9 Browser and device support — NFR-COMPAT
- **NFR-COMPAT-01** *MVP*: the last 2 major versions of Chrome (Android and desktop), Safari (iOS 16+), Samsung Internet, Firefox and Edge. Fully usable at 320 px width.
- **NFR-COMPAT-02** *MVP*: core content readable without JavaScript. The planner and search may require JavaScript.

### 7.10 SEO technical — NFR-SEO
- **NFR-SEO-01** *MVP*: all indexable pages return 200 with server-rendered content, a single `<h1>` and a logical heading order.
- **NFR-SEO-02** *MVP*: there are no indexable soft-404s. Removed content returns 410 (or 301 to a successor).
- **NFR-SEO-03** *MVP*: images have descriptive alt text (FR-CMS-02) and descriptive file names.
- **NFR-SEO-04** *MVP*: the site is served on a custom domain over HTTPS with a single canonical host (www or apex). `robots.txt` lives at the host root (see `DEPLOY.md`).

---

## 8. Data model overview

### 8.1 Core entities

| Entity | Key fields | Relationships |
|---|---|---|
| `content_entry` (base for all CMS types) | id, type, slug, title_en/title_hi, summary_en/summary_hi, body_en/body_hi, status, hi_status, volatility, featured_image_id, seo_title, seo_description, structured_data_type, author_id, reviewer_id, fact_checker_id, created_at, updated_at, published_at, last_verified_at, next_review_at, version, cultural_review_by, cultural_review_at | has many `source`, `fact`, `tag`, `relation`, `version` |
| `place` (extends content_entry) | category (temple/ghat/heritage/museum/nearby), subcategory (short_excursion/intercity), lat, lng, area_id, address_text, recommended_duration_min, accessibility_flags | ↔ activities, itineraries, festivals, alerts |
| `fact` (time-sensitive structured field) | entry_id, key (e.g. `opening_hours`, `entry_fee`, `photography_policy`, `phone`), value (JSON), source_id, verified_at, verified_by, expires_at, confidence | belongs to content_entry |
| `source` | entry_id, title, publisher, url, type (official/scholarly/organiser/field_visit/partner), accessed_at | |
| `itinerary` (extends) | days, effort_level, total_walk_km, audience_tags | has many `itinerary_day` → `itinerary_block` (start, end, place_id/activity_id, travel_mode, walk_m, notes, alternatives) |
| `activity` (things-to-do, extends) | suitability_tags, typical_duration_min, time_of_day | ↔ experiences, places |
| `experience` (extends) | inclusions, exclusions, meeting_point, price_min, price_max, price_unit, price_confirmed_at, cancellation_terms | ↔ partners (≥ 1 verified to publish), activity |
| `service` (extends) | category, coverage_areas, coverage_hours, response_expectation | ↔ partners |
| `festival` (extends) + `festival_occurrence` | occurrence: year, start_date, end_date, date_status (confirmed/expected/unknown), source_id, schedule (JSON) | ↔ places, itineraries |
| `alert` | title, body, category, severity, area_ids, place_ids, starts_at, ends_at, source_id, posted_by | |
| `faq` | question_en/question_hi, answer_en/answer_hi, entry_ids | |
| `media` | storage_key, alt, caption, credit, licence, width, height, focal_point, variants | |
| `area` | name, slug, polygon or centroid | |
| `travel_time` | from_area_id, to_area_id, mode, typical_min, peak_min, verified_at | used by the planner |
| `partner` | type (river/guide/transport/stay/host), display_name, contact (internal), languages, areas, status, verification_steps (JSON), score, commission_terms (internal) | ↔ experiences, services, leads |
| `partner_document` | partner_id, kind, encrypted_blob_key, masked_value, uploaded_by, uploaded_at | encrypted (NFR-PRIV-04) |
| `lead` (evolves today's `plan_requests`) | booking_code, status, source_page, item_type, item_id, itinerary_share_id, traveller_name, phone, email, dates, travellers, notes, consent_version, utm_*, created_at, first_response_at, confirmed_at, completed_at, value, commission, lost_reason | ↔ partner (assigned), `lead_event` (status history) |
| `complaint` | lead_id?, partner_id?, description, status, owner_id, opened_at, resolved_at, resolution | |
| `feedback` | lead_id, rating, comment, published (P2 verified reviews) | |
| `shared_trip` | share_id, itinerary_json, created_at, expires_at | no personal data |
| `analytics_event` / `analytics_daily` | name, page, referrer_class, utm_*, device_id?, locale, ts → daily aggregates | no personal data |
| `user` (staff; evolves today's `users`) | role, totp_secret (encrypted), token_version | |
| `audit_log` | actor_id, action, entity, entity_id, before/after hash, ts | append-only |
| `redirect` | from_path, to_path, code | |

### 8.2 Integrations

| Integration | Purpose | Phase | Notes |
|---|---|---|---|
| WhatsApp Cloud API | Team alerts (template), traveller reminders and feedback (template) | MVP | Exists for team alerts (`notify.js`). Templates need Meta approval. |
| SMTP provider | Traveller confirmations, team notifications | MVP | Exists (`nodemailer` 10.3.1). |
| `wa.me` deep links | Traveller → support WhatsApp hand-off | MVP | No API needed |
| Maps provider [[Google Maps / Mapbox / OSM-based]] | Place coordinates, "open in maps", P2 map view | MVP links / P2 map | Choose based on cost and Indian address quality |
| Search | Static index (Pagefind or equivalent) → FTS later | MVP | ADR-06 |
| Object storage + CDN | Media | MVP | ADR-05 |
| Analytics | First-party (ADR-08) | MVP | |
| Error tracking | Front-end + API | MVP | [[Sentry or equivalent]] |
| DigiLocker (or manual verification) | Partner identity verification | P2 | Avoids storing ID numbers |
| Payment gateway | Limited checkout | P2, gated | Only after the decision gate (ADR-07) |

---

## 9. Traceability

| Requirement(s) | Serves feasibility-plan metric / risk |
|---|---|
| FR-CMS-04, FR-CMS-05, FR-CMS-09, NFR-FRESH | M9; risks "Outdated timings or prices", "Incorrect emergency information" |
| FR-GUIDE-02, FR-PLAN-03 (seasonal rules), ADR-03 | Risk "Crowd or weather disruption"; differentiation "Verified-today information" |
| FR-GUIDE-03 | Risk "Incorrect emergency information" (very high impact) |
| FR-PLAN-01…10 | M3, M4; differentiation "Local route intelligence", "Pilgrim-specific planning" |
| FR-SVC-02…05, FR-SVC-07, ADR-07 | M5, M6, M8; risks "Low transaction conversion", "Supplier bypasses platform", "Refund and support overload" |
| FR-SVC-04 (SLA timers), FR-SVC-06, FR-SVC-08 | Service standards S1–S8; M10, M11 |
| FR-PART-01…05 | M7, M8, M11; risk "Poor partner service" |
| FR-SEO-*, FR-SRCH-01, FR-EXPL-*, NFR-PERF | M1, M2; risk "SEO algorithm change", "High paid acquisition cost" (organic-first) |
| FR-ANL-01…03 | Measures M1–M8; enables the §17.1 proceed/pause decision |
| FR-PLC-03, FR-EXPL-02 (claim labelling), FR-TTD-03 | Risk "Negative cultural reaction", "Cultural sensitivity" |
| NFR-SEC, NFR-PRIV | Risk "Data or account breach" |
| FR-I18N, FR-CMS-07 | Segment reach (pilgrims and families), Phase 3 Hindi guidance |
| FR-ANL-03 (QR attribution) | Go-to-market "Hotel and homestay QR partnerships" |
| §3.1 out of scope, FR-EXP-03 gate | Feasibility §8.3 "Why full checkout should be delayed" |

---

## 10. Implementation status (repository as of 1 Nov 2026)

| Module | Status | What exists | Gap to MVP |
|---|---|---|---|
| FR-NAV | Partial | Header/drawer/footer with Escape-to-close, focus return, logout, photo credits, legal links (`docs/js/nav.js`) | New 5-menu IA with dropdowns, breadcrumbs, related-content blocks, emergency link |
| FR-SRCH | Not started | — | Static search index and UI |
| FR-EXPL | Not started | — | All articles; claim-label component |
| FR-PLC | Not started | — | Directory, filters, place template, facts with verification |
| FR-TTD | Partial | 6 experience pages generated from `docs/experiences.json` (`scripts/build-site.mjs`), with TouristTrip JSON-LD | Split into neutral guides (`/things-to-do/`) vs partner offerings (`/experiences/`); remaining activities |
| FR-EXP | Partial | Same 6 pages, "Price on request", enquiry prefill via `plan.html?experience=` | Partner linkage, verification status, inclusions/exclusions, confirmed price ranges |
| FR-SVC | Partial | Enquiry finder with contact step (`docs/js/finder.js`); React booking flow; `plan_requests` table with statuses `pending/confirmed/contacted/completed/cancelled`; admin status changes; collision-safe reference codes (`server/src/reference.js`); email + WhatsApp team alerts and traveller email confirmation (`server/src/notify.js`) | Lead entity with booking code shown to the traveller, WhatsApp hand-off tracking, SLA timers, partner assignment and response tracking, value/commission, complaints, reminders/feedback |
| FR-FOOD / FR-SHOP | Not started | Footer "Popular in Varanasi" links only | All guides; business entity with verification |
| FR-FEST | Not started | — | Festival pages, occurrence date states |
| FR-PLAN | Not started (planner) | Itinerary content does not exist | Templates, planner engine, save/share, travel-time matrix |
| FR-GUIDE | Not started | Offline page, service worker | Essentials pages, alerts module, emergency page (precached) |
| FR-CMS | Not started (CMS) | Admin CRUD for buddies, stories and hero photos only; data-driven generator for experiences and legal pages; draft/noindex handling for legal placeholders | Content modules, fields, workflow, facts, versions, audit, review queue, publish pipeline |
| FR-SEO | Partial | Per-page titles/descriptions, canonicals, OG/Twitter tags, JSON-LD (TravelAgency, BreadcrumbList, TouristTrip, ItemList), generated sitemap, robots.txt, `set-site-url.mjs`, React app `noindex` | New URL tree, redirects, build-time SEO checks, hreflang |
| FR-I18N | Not started | — | String extraction, data model locale |
| FR-ANL | Not started | — | Events, dashboard, QR attribution |
| FR-PART | Partial | Buddy applications form + admin review (approve/reject); sample buddies table | All partner types, verification steps, scoring, suspension, documents |
| FR-ADM | Partial | React admin: dashboard, hero, applications, plan requests, buddies, stories, users; dialog/confirmation accessibility fixes; session-expiry redirect | Roles beyond admin, mobile-first ops screens, TOTP, exports |
| FR-ACC | Partial (to be reduced) | Traveller signup/login/logout with revocable JWT sessions; staff login | Remove traveller accounts from MVP navigation; add staff TOTP |
| NFR-SEC | Largely met | `requireAuth`/`requireRole`, `validateBody`/`validateParam`, CORS allow-list, JSON-only writes, `Origin: null` blocked in production, rate limits, revocable sessions, JWT secret checks, upload limits, nginx framing headers; `npm audit` clean | ID-document encryption, audit log, per-account throttling, magic-byte checks, CSP, non-root containers, TOTP |
| NFR-A11Y | Partial | Fixes listed in NFR-A11Y-02 | Items in NFR-A11Y-03; CI checks |
| NFR-PERF | Partial | Responsive WebP (`scripts/optimize-images.sh`), `srcset` on hero/page headers | Budgets measured in CI; framework migration |
| NFR-PRIV | Partial | Draft privacy/terms/cancellation pages with placeholders (`content/legal/`), minimal enquiry form | Consent records, rights handling, retention jobs, grievance officer details |
| NFR-REL / NFR-OBS | Partial | Docker Compose, health endpoint, `DEPLOY.md` backup guidance | Monitoring, error tracking, automated backups and restore tests |

---

## 11. Open questions and business decisions

| # | Question | Needed by | Owner |
|---|---|---|---|
| Q1 | **Brand:** rename from "TravelOnBuddy" (prototype) to "Varanasi Trip Companion" everywhere (site, emails, booking-code prefix, WhatsApp templates, legal entity references)? | Before content production | [[Product owner]] |
| Q2 | **Domain** (and www vs apex) | Before launch; blocks robots.txt and canonical host | [[Product owner]] |
| Q3 | **Hosting** for API, static site, object storage (region: India) | Sprint 1 | [[Engineering lead]] |
| Q4 | **Maps provider** (cost, Indian address coverage, offline needs) | Before FR-PLC map work | [[Engineering lead]] |
| Q5 | **Partner commission terms** per partner type, and whether partners or the platform owns the traveller relationship after the first booking | Before FR-SVC-04 value/commission fields go live | [[City ops lead]] |
| Q6 | **Hindi translation resourcing:** in-house reviewer vs agency; which pages are first | P2 planning | [[Content lead]] |
| Q7 | **Police verification** policy for guides and drivers | Before partner onboarding | [[City ops lead]] |
| Q8 | **Support hours and staffing** to meet S1 (06:00–22:00), and the overnight policy | Before launch | [[City ops lead]] |
| Q9 | Retention periods and Grievance Officer (NFR-PRIV-03/05); legal review of policies | Before launch | [[Legal/Admin]] |
| Q10 | Low-walking default limits and the travel-time matrix values (FR-PLAN-03) | Before planner build | [[Content lead]] + [[City ops lead]] |
| Q11 | Whether WhatsApp hand-off goes to the platform number only (MVP default) or directly to partners in P2 | P2 | [[Product owner]] |
| Q12 | Production MySQL host, object storage provider and notification worker scheduling | Sprint 1 | [[Engineering lead]] |

---

## 12. Accepted feature additions and delivery plan

This section incorporates the user's Next.js/MySQL, contact form, website booking and multi-author blog requests, plus the subsequently accepted recommendations. Blog publication is now MVP, overriding its earlier Phase 2 placement. MVP planning delivers reviewed itinerary templates; saved, editable and shareable personal trips move to Phase 2. Website booking means a request subject to availability and admin confirmation, not instant inventory or payment collection.

### 12.1 MVP requirements and acceptance criteria

| ID | Feature and user story | Acceptance criteria |
|---|---|---|
| FR-CONTACT-01 | As a visitor, I can contact the team without creating an account. | Collect name, email, optional phone, subject and message; validate on the server with shared Zod schemas; rate-limit submissions and apply spam controls. Commit the record to MySQL before showing success with a reference. Database failures never show a success receipt. |
| FR-CONTACT-02 | As support staff, I can manage submitted messages. | Inbox supports New, In progress, Resolved and Spam, assignment, internal notes and timestamps. Only authorized staff can access personal data; notes and changes are audited. |
| FR-BOOK-01 | As a visitor, I can request a booking from an experience or service page. | Persist selected offering, preferred date/time, adults/children, contact details, relevant pickup location, optional accessibility needs and special requests. Use a unique reference and duplicate-submission protection. Success messages state that availability and confirmation are pending; no payment is collected. |
| FR-BOOK-02 | As operations staff, I can manage a booking through completion. | Support Requested → Under review → Quoted → Confirmed → Completed, plus Cancelled with reasons. Validate allowed transitions on the server and record actor/time/history. Record supplier assignment and preserve quoted price, currency, inclusions and offering snapshots. Confirmation requires a reviewed quote and recorded customer acceptance. |
| FR-BOOK-03 | As a customer, I can securely check my booking status. | Provide a private, expiring access link or verified access flow. A booking reference alone cannot expose personal data. Show current status, applicable quote and confirmed details; private responses are noindex and no-store. Allow expired access to be recovered through verified contact details. |
| FR-NOTIFY-01 | As a customer, I receive acknowledgements and booking updates. | Store notification jobs alongside successful writes using a transactional outbox. Retry failures without duplicating bookings or status updates. Record delivery attempts and show failures to staff. Templates describe actual status and configured support expectations. |
| FR-DASH-01 | As an admin, I can see what needs attention. | Dashboard shows new contacts, pending booking requests, unassigned/overdue follow-ups, failed notifications, articles awaiting approval and content due for verification. Counts link to filtered work queues; response targets are configurable. |
| FR-BLOG-01 | As a traveller, I can discover and read useful articles. | Blog listing, article pages, categories, tags, search, pagination, author profiles and related articles work on mobile. Each article supports formatted text, headings, images/galleries with alt text and credits, sources, verification dates, SEO metadata and social previews. Only approved published revisions appear publicly. |
| FR-BLOG-02 | As an author, I can write and submit my own articles. | Authors create drafts, edit their own drafts, preview privately and submit for review. Server checks ownership and permissions on every write. Public signup cannot grant author, editor or admin roles. Rich content and media are validated and rendered safely. |
| FR-BLOG-03 | As an editor, I can review an article without publishing it. | Editors can edit drafts, leave reviewer comments and request changes. Workflow is Draft → Submitted → Editorial review → Fact verification → Admin approval → Published; Changes requested, Scheduled and Archived are supported. Writer/Author are equivalent role names for this workflow. |
| FR-BLOG-04 | As an admin, I control final publication. | Only admins approve and publish the exact reviewed revision. A contributor cannot approve their own revision, including an admin who authored it; another admin must approve. New edits invalidate that revision's approval. A published revision stays live while a replacement is reviewed. Scheduled publication rechecks approval and time-sensitive verification at execution time. |
| FR-BLOG-05 | As editorial staff, I can preview and recover revisions. | Private authorized preview, version comparison, reviewer comments and restore are available. Restore creates a draft requiring review. Drafts, previews and scheduled unpublished posts are excluded from public APIs, related content, search, sitemap and feeds. |
| FR-TRUST-01 | As a traveller, I can understand what supplier verification means. | Store evidence, verification scope, reviewer and expiry. Show a verified badge only while the required checks remain current; expiry/suspension removes it. Identity documents and internal notes remain private. |
| FR-FRESH-01 | As a reviewer, I know which facts need checking. | Record sources, fact type, last verification and next review/expiry. Surface overdue items in admin; suppress or label expired operational facts across pages and search. No unverified future festival dates, prices, opening hours or live availability claims are published as confirmed. |
| FR-DISCOVER-01 | As a traveller, I can find relevant content. | Search places, articles, experiences, services and itineraries; filter by applicable interest, location, duration, walking intensity and documented accessibility. Include accessible loading/no-results states and published content only. |
| FR-TEMPLATE-01 | As a traveller, I can choose a realistic itinerary template. | Publish reviewed 1-, 2- and 3-day plans with walking guidance, breaks, suggested travel time and source/review metadata. Suggestions never imply validated live crowds or closures. |
| FR-AUDIT-01 | As an admin, I can trace important changes and recover data. | Append-only audit records cover role changes, booking transitions, supplier verification, content approval/publication and administrative edits. Restrict audit access, omit secrets and unnecessary personal data, and verify database/media backup restoration before launch. |

### 12.2 Phase 2

| Feature | Acceptance criteria |
|---|---|
| Saved trips and favourites | Visitors can save places and experiences; define device-local versus account-backed ownership, deletion and synchronization before implementation. Accounts remain optional for basic discovery and booking requests. |
| Editable, shareable itineraries | Add/remove/reorder activities, save changes and share a read-only plan. Share links exclude contact and booking data and can be revoked. Routes remain suggested unless validated current-data integration exists. |
| Verified traveller reviews | Permit reviews linked to completed bookings, prevent duplicate reviews per eligible service, support moderation and disclosure, and block supplier self-review. |
| Partner dashboard | Suppliers see only assigned leads and necessary customer details, accept or decline requests and update progress. Server-side tenant/ownership checks prevent cross-supplier access; changes feed the audit log. |
| English and Hindi website | Publish reviewed translations for priority pages, language-specific URLs and metadata, language switching and appropriate hreflang. Preserve untranslated content as an explicit fallback without pretending it is translated. |

### 12.3 Later phases

- **Online payments and refunds:** introduce only after pricing, supplier confirmation, customer acceptance and cancellation policies are operationally established. Include signed webhook verification, idempotency, reconciliation, refund tracking and a separate payment status model before launch.
- **Offline saved guides:** cache selected published guides and itineraries with clear freshness labels. Never cache authenticated admin/API responses or imply that cached operational facts are current. Provide update and removal controls.
- Retain the original future scope for validated route intelligence, operational alerts, accessibility routing and multi-destination expansion.

### 12.4 MySQL data model additions

Use Prisma migrations and explicit foreign keys/indexes for the following modules. Existing equivalent entities may be extended rather than duplicated.

| Module | Planned tables |
|---|---|
| Identity | users, roles, user_roles, sessions (if database-backed sessions are selected) |
| Contact | contact_submissions, contact_notes |
| Booking | booking_requests (evolves lead/plan_requests), booking_status_history, booking_quotes, booking_assignments, booking_access_tokens |
| Blog | blog_posts, blog_post_translations, blog_revisions, editorial_reviews, categories, tags, post_tags, media, content_sources |
| Operations | supplier_verifications (extends partner records), notification_jobs, audit_logs |
| Phase 2 | saved_trips, favourites, traveller_reviews, partner_memberships |

Preserve existing IDs, password hashes, timestamps and reference codes during SQLite-to-MySQL migration. Reconcile record counts and relationships, rehearse the import on a backup and document rollback. Store access-token hashes rather than raw tracking credentials. Notifications must survive web-process restarts through a worker or scheduled dispatcher.

### 12.5 Delivery milestones

1. **Requirements and schema:** confirm route map, role matrix, content fields, MySQL schema and migration/rollback procedure. This document update is planning only.
2. **Next.js foundation:** App Router, TypeScript, Prisma/MySQL, shared layouts, authentication and server-enforced permissions. Keep database/services server-only and use same-origin APIs.
3. **Contact and enquiries:** persistent contact form, inbox, notifications, spam controls and relevant dashboard queues.
4. **Website booking requests:** offering CTAs, request form, quotes, supplier assignment, secure customer tracking and status history.
5. **Multi-author blog:** rich editor, private previews, revisions, fact verification, admin approval, scheduling and public article discovery.
6. **Destination CMS and discovery:** verified supplier records, expiry controls, search/filters, itinerary templates and indexable public content. Expand the dashboard and audit coverage.
7. **Migration and launch:** migrate legacy pages/admin/API and existing data, rehearse restores, map old HTML URLs, provide hash-link compatibility, retire stale service workers and validate SEO/mobile/accessibility.
8. **Phase 2:** saved trips, editable/shared itineraries, completed-booking reviews, partner dashboard and reviewed English/Hindi publishing.
9. **Later:** gated payments/refunds and offline saved guides, followed by validated advanced travel intelligence.

### 12.6 Required validation before launch

- Production build, lint and TypeScript checks pass.
- Integration tests verify durable contact/booking writes, duplicate protection, quote acceptance, allowed transitions and notification retries.
- Authorization tests cover author ownership, editor restrictions, self-approval prevention, private tracking and admin-only publication.
- Publishing tests verify that edits require new approval, scheduled publication checks the approved revision, and drafts/expired facts stay out of public discovery.
- Browser tests cover the public contact and booking flows, author submission, admin approval and mobile navigation.
- Migration reconciliation and a MySQL/media restore rehearsal pass; cutover and rollback ownership are recorded.
