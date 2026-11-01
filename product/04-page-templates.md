# 4. Page Templates

**Product:** Varanasi Trip Companion · **Spec version:** 1.0 · 1 November 2026
**Depends on:** [01-sitemap.md](01-sitemap.md) (URLs, content types, phase tags) · [05-cms.md](05-cms.md) (field names) · [09-verification-checklist.md](09-verification-checklist.md) (labels and review cadence)

Every public page is built from one of the templates below. A template fixes section order, what is mandatory, length targets, the labels that must appear, and the structured data emitted. Writers fill CMS fields; they never hand-build page layout.

---

## 4.0 Conventions used by every template

### 4.0.1 Truth labels (mandatory wherever the content type applies)

| Label | Shown as | Use for | Rule |
|---|---|---|---|
| **Verified on {date}** | Small badge under the H1 and inside every fact box | Any page or block containing time-sensitive facts | Date = `last_verified_at` of the entry or block. Hidden if never verified. |
| **Not yet verified** | Full-width amber banner at top of page | Entry whose time-sensitive fields have no verification, or whose `next_review_at` has passed | Cannot be dismissed. Page is `noindex` while shown (see [06-seo.md](06-seo.md)). |
| **Documented history** | Inline tag on a paragraph or timeline item | Facts supported by dated records, inscriptions or scholarly sources | Must have a source in `source_refs`. |
| **Archaeological evidence** | Inline tag | Findings from excavation/ASI records | Must cite the source. |
| **Tradition** | Inline tag, italic intro ("According to tradition…") | Religious, mythological and oral accounts | Never phrased as fact; never mixed in the same sentence as documented history. |
| **Suggested** | Tag on routes, durations, schedules, best-time advice | Our editorial recommendations | Never presented as an official rule. |
| **Estimate** | Tag on prices, durations, distances | Approximate figures from our own checks | Must show a range and the date it was checked. |
| **Official rule** | Tag inside fact boxes | Rules published by the managing authority (temple trust, ASI, district administration) | Must link the official source. |

### 4.0.2 Shared components

| Component | Purpose | Contents |
|---|---|---|
| **Hero** | Orientation | H1, one-line summary (≤ 160 chars), photo with alt text and credit, breadcrumb, verification badge. |
| **Fact box** | Scannable practical info | Key–value rows; each row carries its own label (Official rule / Estimate / Suggested) and verification date. Rows whose value is unverified show "Check before you go" instead of a value. |
| **Alert banner** | Live conditions | Pulled from active Travel Alerts linked to the page or its area (e.g. "Boating suspended — river above danger mark"). Severity colour, issued time, expiry. Hidden when no active alert. |
| **Map block** | Location & last mile | Static map image (lazy) + "Open in Maps" link from `geo`. Shows *drop-off point* and *walking route* when the place has `last_mile` data. |
| **Related cards** | Next step | 3–6 cards: nearby places, things to do here, itineraries that include it, services that get you there. Rules in [06-seo.md](06-seo.md) §6.8. |
| **Enquiry CTA** | Commercial next step | "Plan this with a local" / "Enquire on WhatsApp" — creates a tracked lead with a reference code before opening WhatsApp. Only on commercial templates and as a secondary CTA elsewhere. |
| **FAQ block** | Answer common questions | 3–8 Q&As, accordion; emits `FAQPage` only when answers are fully visible text. |
| **Sources block** | Trust | Numbered list of `source_refs` with title, publisher, accessed date; at page foot. |
| **Last reviewed footer** | Accountability | "Written by {author} · Fact-checked by {reviewer} · Last verified {date} · Next review {date}". |

### 4.0.3 Length guidance (body text, excluding fact boxes and FAQs)

| Page kind | Target words | Hard minimum to publish |
|---|---|---|
| Hub / landing page | 80–200 intro + cards | 60 |
| Detail page (place, food, market) | 600–1,200 | 350 |
| Long-form article (history & culture) | 1,500–3,000 | 1,000 |
| Things-to-Do guide | 700–1,200 | 450 |
| Experience / service page | 300–600 | 200 |
| Itinerary | 500–1,000 + timeline | 350 |
| Travel-guide article | 600–1,500 | 400 |

Below the minimum the CMS blocks publishing (thin-content rule, [06-seo.md](06-seo.md) §6.12).

---

## 4.1 Place-detail template

**Used by:** `/places/temples/<slug>`, `/places/ghats/<slug>`, `/places/heritage/<slug>`, `/places/nearby/<slug>`.
**Schema.org:** see variant table (4.1.2). Always plus `BreadcrumbList`, and `FAQPage` when the FAQ block is present.

### 4.1.1 Section order (master — the temple variant uses every section)

| # | Section (H2) | Purpose | Req. | Length | Labels / components |
|---|---|---|---|---|---|
| 0 | Hero | Identify the place, set trust | Req. | H1 + ≤160-char summary | Verification badge; "Not yet verified" banner if applicable; Alert banner |
| 1 | **Introduction & significance** | Why this place matters, in plain language | Req. | 100–200 | Tradition tag for religious significance |
| 2 | **History & traditions** | What is documented vs. what is believed | Req. | 200–450 | Two clearly separated sub-blocks: *Documented history* (with dated timeline items) and *Tradition* (with "According to tradition…"). Sources required for every documented claim. |
| 3 | **Architecture & details to notice** | What to look at | Req. (temple, heritage); Opt. (ghat, nearby) | 100–250 | Photo gallery (2–6 images, all credited) |
| 4 | **Visiting information** (fact box) | The practical facts | Req. | Fact box only | Rows: Opening hours · Entry fee · Managing authority · Best time to visit · Closed days · Official website. Every row: Official rule / Estimate / Suggested + verified date. Unverified rows show "Check before you go — [link to official source]". |
| 5 | **Darshan & Aarti** | How worship/viewing works | Req. (temple); Opt. (ghat with Aarti) | 100–250 | Only timings with an official source and a verified date; otherwise "Timings change with the season — check [official source] or ask us". Never mention VIP/paid darshan without an official source. |
| 6 | **Entry rules & restrictions** | Avoid being turned away | Req. (temple, heritage); Opt. otherwise | Bulleted list | Each rule: Official rule (linked) or Suggested (etiquette) |
| 7 | **What to carry / what to avoid** | Practical preparation | Req. (temple); Opt. otherwise | Two short lists | Suggested; locker availability only if verified |
| 8 | **Photography** | Respect and rules | Req. | 40–120 | Official rule where one exists; for cremation ghats this section is mandatory and leads the page's practical sections (see 4.1.3) |
| 9 | **Accessibility & senior-friendly guidance** | Steps, distance, crowds, rest points | Req. | 60–200 | Suggested; facts like "number of steps" only if measured (Estimate + date) |
| 10 | **Getting there & last-mile walking** | Where vehicles stop and how long the walk is | Req. | 80–200 + Map block | Drop-off point; walking time as Estimate; route note (narrow lanes, slopes, crowd points); link to `/travel-guide/last-mile-walking` |
| 11 | **Nearby** | Combine visits | Req. | Related cards (3–6) | Cards from `related_places`; walking distance as Estimate |
| 12 | **How long to spend** | Planning | Req. | 1–2 sentences | Suggested; per traveller type if useful (e.g. "Pilgrims: …, sightseers: …") |
| 13 | **Plan it** | Commercial next step | Req. | CTA + 2–3 cards | Things to Do here · itineraries that include it · relevant services (guides, transport) |
| 14 | **FAQ** | Long-tail questions | Req. (MVP: ≥ 3 Q&As) | 3–8 Q&As | FAQPage schema |
| 15 | Sources & review footer | Trust | Req. | List | Sources block + Last reviewed footer |

### 4.1.2 Variants

| Variant | Sections used | Section-specific notes | Schema.org type |
|---|---|---|---|
| **Temple** | 0–15 (all) | §5 Darshan & Aarti and §6 Entry rules mandatory; §7 must mention dress guidance (Suggested unless the trust publishes a rule). | `HinduTemple` (subtype of `PlaceOfWorship`) + `TouristAttraction` (multi-type); `BuddhistTemple` for Sarnath viharas |
| **Ghat** | 0–4, 5 (if Aarti), 8–15 | §2 includes who built/renovated the ghat (Documented) and naming legends (Tradition). §4 rows: river-level/boating status link (alert), best light (Suggested). Add **River & safety** sub-section in §9: no swimming advice, slippery steps, monsoon flooding. | `TouristAttraction` + `Place` |
| **Heritage site** | 0–4, 6, 8–15 | §4 must include managing authority (e.g. ASI) and ticketing link if verified. §2 uses *Archaeological evidence* label where applicable. | `LandmarksOrHistoricalBuildings` + `TouristAttraction`; `Museum` for museums |
| **Nearby destination** | 0–2, 4, 9–15 + **Getting there from Varanasi** (replaces §10) | Category banner: "Short excursion (same day)" or "Intercity trip (overnight recommended)" from sitemap grouping. Distance and travel time only as Estimate with date, or "[VERIFY]". | `TouristDestination` |

### 4.1.3 Cremation-ghat rules (Manikarnika, Harishchandra)

1. Section order changes: **Respectful visiting** (merged §8 Photography + etiquette) moves directly after §1.
2. Opening line of that section is fixed: "Cremations here are private family rites. Please do not photograph or film them, keep a respectful distance and follow requests from families and staff."
3. No content frames cremation as a sight, spectacle or "experience"; no experience/service CTA on these pages except a generic "Hire a guide who can explain the traditions respectfully".
4. Scam warning (people asking for "wood donations") appears as a neutral note linking `/travel-guide/scams-and-touts`.
5. Hero image must not show identifiable mourners or a cremation in progress.

---

## 4.2 History & culture templates

### 4.2.1 Long-form article (`/explore/<slug>`)

**Schema.org:** `Article` (+ `BreadcrumbList`). `about` → linked places.

| # | Section | Purpose | Req. | Length | Notes |
|---|---|---|---|---|---|
| 0 | Hero | Title, standfirst (≤ 200 chars), image | Req. | — | Author & reviewer names shown |
| 1 | **In brief** | 3–5 bullet key takeaways | Req. | 50–100 | For skimmers and AI/search snippets |
| 2 | **Body sections** (H2s, logical or chronological) | The explanation | Req. | 1,000–2,500 | Each claim carries Documented history / Archaeological evidence / Tradition labels. Mythological and devotional accounts in their own clearly introduced paragraphs. Dates as "c." where approximate, with source. |
| 3 | **Timeline** (component) | Chronology at a glance | Opt. (Req. for `/explore/history`, `/explore/history-of-the-ghats`) | 5–20 rows | Each row: date or period · event · label · source no. |
| 4 | **Where to see it** | Bridge from knowledge to visit | Req. | Related cards (3–6) | Places, things to do, itineraries |
| 5 | **Further reading** | Credibility | Opt. | 3–8 items | Books, museum or official pages |
| 6 | Sources & review footer | Trust | Req. | — | Minimum 3 sources for any article ≥ 1,500 words |

Writing rules: inclusive and respectful; name communities as they name themselves; where historians disagree, say so and present the main positions; legally contested sites are described factually with reference to "ongoing proceedings" and no editorial position.

### 4.2.2 Exploration-card summary

Used on `/explore/`, home sections, related cards.

| Field | Rule |
|---|---|
| Title | ≤ 50 chars |
| Summary | 1 sentence, ≤ 140 chars, no unverifiable superlatives ("oldest", "only") unless sourced |
| Image | 4:3 crop, alt text required |
| Kicker | Category · reading time (e.g. "History · 8 min read") |
| Link | The canonical detail URL |

---

## 4.3 Things-to-Do guide (`/things-to-do/<slug>`)

Editorial, neutral, non-commercial guide to an activity. **Schema.org:** `Article` (with `about` → `TouristAttraction`s) + `BreadcrumbList` + `FAQPage`.

| # | Section | Purpose | Req. | Length | Labels / components |
|---|---|---|---|---|---|
| 0 | Hero | What the activity is in one line | Req. | — | Alert banner (e.g. boating status) |
| 1 | **Why do it** | Value for the traveller | Req. | 80–150 | — |
| 2 | **At a glance** (fact box) | Plan quickly | Req. | Fact box | Typical duration (Estimate) · Best time/season (Suggested) · Where it starts (places) · Price range (Estimate with date, or "Varies — see experiences") · Suitable for · Walking intensity |
| 3 | **How it works** | Step-by-step | Req. | 150–300 | Suggested; separates official rules (linked) from advice |
| 4 | **Choosing well** | How to pick an operator/route; what fair looks like | Req. | 100–250 | Generic guidance, no named businesses unless verified partners |
| 5 | **Safety & etiquette** | Avoid harm and offence | Req. | 60–200 | Official rule / Suggested |
| 6 | **Seasonal & disruption notes** | Monsoon, festivals, crowds | Req. where relevant | 40–150 | Links to live alerts and festival pages |
| 7 | **Book with a verified local** | Commercial bridge | Req. | 2–4 Experience cards | Only *published* Local Experiences with verified partners; otherwise generic enquiry CTA |
| 8 | **Related** | Next steps | Req. | 3–6 cards | Places where it happens, itineraries |
| 9 | FAQ | Long-tail | Req. | 3–8 | FAQPage |
| 10 | Sources & review footer | Trust | Req. | — | — |

---

## 4.4 Local Experience template (`/experiences/<slug>`)

A specific offering run by a verified partner, enquiry-only in Phase 1. **Schema.org:** `TouristTrip` (+ `provider` → partner's `LocalBusiness` only if partner `verification_status = verified`) + `BreadcrumbList`. `offers` only when `price_verified = true`.

| # | Section | Purpose | Req. | Length | Labels / components |
|---|---|---|---|---|---|
| 0 | Hero | Name, one-line promise, partner badge | Req. | — | **Partner badge** showing verification status ("Verified partner · checked {date}" or "Listing under review" — never "verified" without a completed KYC record). Alert banner. |
| 1 | **Suitable for** | Help self-selection | Req. | 3–6 bullets | e.g. first-time visitors, seniors (with walking note), families |
| 2 | **Key facts** (fact box) | Decide fast | Req. | Fact box | Duration (Estimate) · Start time window (Suggested) · Meeting point · Group size · Languages · **Price range** — only if `price_verified`, shown as "₹X–₹Y per {unit} · checked {date}"; else "Price on request" |
| 3 | **Suggested schedule** | What happens when | Req. | Timeline 3–8 steps | Suggested label |
| 4 | **Included** | Set expectations | Req. | List | — |
| 5 | **Not included** | Prevent disputes | Req. | List | Must state tips, offerings, entry fees, food unless included |
| 6 | **Safety & accessibility** | Reduce risk | Req. | 60–150 | Life jackets for boats (only if verified as provided), walking intensity, weather/river cancellation |
| 7 | **Cancellation terms** | Trust | Req. | Summary + link | Pulled from partner terms or default `/cancellation-policy`; river/weather clause always shown for river experiences |
| 8 | **About your host** | Human trust | Req. | 50–120 + photo | Only partner-approved, consented bio and photo |
| 9 | **Enquire** | Conversion | Req. | Form/CTA | Fields in §4.5.2; response expectation ("We reply on WhatsApp within {response_sla}") |
| 10 | **Learn first** | Link to neutral guide | Req. | 1–2 cards | The matching `/things-to-do/` guide |
| 11 | Reviews | Social proof | P2 | — | Only reviews tied to a completed booking code |

---

## 4.5 Local Service template

### 4.5.1 Service page (`/services/<category>/<slug>`)

**Schema.org:** `Service` (`areaServed: Varanasi`, `provider` → `Organization` Varanasi Trip Companion) + `BreadcrumbList` + `FAQPage`.

| # | Section | Purpose | Req. | Length | Labels / components |
|---|---|---|---|---|---|
| 0 | Hero | What the service solves | Req. | — | — |
| 1 | **What we arrange** | Clear description | Req. | 80–200 | — |
| 2 | **Coverage** | Where and when | Req. | List | Areas, hours of service, pick-up points (e.g. airport, stations — names only, verified) |
| 3 | **Who provides it** | Supplier trust | Req. | Status panel | Count of verified partners for this category and what "verified" means (link `/about/how-we-verify`). Individual partner cards when `/partners/<slug>` exists (P2). |
| 4 | **Estimated costs** | Budgeting | Opt. | Table | Only if `cost_estimate_verified`; ranges with unit and checked date; label Estimate; "Final price confirmed by the partner before you travel" |
| 5 | **Included / limitations** | Expectations | Req. | Two lists | e.g. "Vehicles cannot enter the old-city lanes; the driver will drop you at {point}" |
| 6 | **How it works & response time** | Reduce anxiety | Req. | 3–5 steps | Steps: enquire → reference code → partner confirmation → day-before reminder. SLA from settings, e.g. "Reply within 10 minutes, 6 am–10 pm" |
| 7 | **Enquiry form** | Conversion | Req. | Form | §4.5.2 |
| 8 | FAQ | Objections | Req. | 3–6 | — |
| 9 | Related | Context | Req. | 3 cards | Travel-guide articles (e.g. how to reach), places |

### 4.5.2 Enquiry form fields (shared by services and experiences)

| Field | Type | Req. | Notes |
|---|---|---|---|
| Name | text ≤ 120 | Req. | — |
| WhatsApp / phone | tel | Req. one of phone/email | Indian or international format |
| Email | email | Req. one of phone/email | — |
| Service / experience | hidden, prefilled | Req. | From page context |
| Date(s) | date / range | Req. for time-bound services | Not in the past |
| Time / flight / train no. | text ≤ 40 | Opt. (Req. for transfers) | — |
| Travellers | number + "seniors / children / mobility needs" checkboxes | Req. | — |
| Pick-up / meeting point | text | Req. for transport | — |
| Budget | select (ranges) | Opt. | — |
| Notes | textarea ≤ 2,000 | Opt. | — |
| Consent | checkbox | Req. | "Share my details with the matched partner" + privacy link |

On submit: create lead with reference code → thank-you page `/enquiry/thank-you` showing the code and a **"Continue on WhatsApp"** button with the code prefilled.

---

## 4.6 Festival template (`/festivals/<slug>`)

**Schema.org:** `Article` always; add `Event` **only** for an occurrence with `date_status = confirmed` (official source + verified date). Never emit `Event` for estimated dates.

| # | Section | Purpose | Req. | Length | Labels / components |
|---|---|---|---|---|---|
| 0 | Hero | Name + **date panel** | Req. | — | Date panel shows either "{dates} · Confirmed by {source} on {date}" or "Usually in {month range} — exact dates not yet confirmed" |
| 1 | **Background & significance** | Meaning | Req. | 150–300 | Tradition / Documented history labels |
| 2 | **How it is celebrated** | What you'll see | Req. | 150–300 | — |
| 3 | **When it happens** | Planning | Req. | Fact box | Typical season (Suggested, based on lunar calendar) · This year's dates (Confirmed only) · Main days |
| 4 | **Where to experience it** | Locations | Req. | Cards | Linked places (ghats, temples) |
| 5 | **Crowds & restrictions** | Realism | Req. | 100–200 | Official restrictions (linked notices) vs. our expectations (Suggested); traffic diversions only from official notices |
| 6 | **Safety** | Reduce harm | Req. | 60–150 | Crowd safety, river safety, belongings, emergency link |
| 7 | **Plan around it** | Next step | Req. | Cards | Itineraries, experiences, stays enquiry |
| 8 | FAQ | Long-tail | Req. | 3–6 | — |
| 9 | Sources & review footer | Trust | Req. | — | Review cadence: before each occurrence |

---

## 4.7 Food item and Market templates

### 4.7.1 Food item (`/food/<slug>`)

**Schema.org:** `Article` (+ `about` → `Thing`); no `Recipe` (we are not publishing recipes) and no `Restaurant` unless a verified partner.

| # | Section | Req. | Length | Notes |
|---|---|---|---|---|
| 0 | Hero (dish photo, credited) | Req. | — | — |
| 1 | **What it is** | Req. | 60–150 | — |
| 2 | **Culinary context** | Req. | 80–200 | Tradition label for origin stories |
| 3 | **Typical ingredients & dietary notes** (fact box) | Req. | Fact box | Vegetarian/vegan/Jain-friendly/contains dairy/gluten/nuts; **bhang** warning where relevant (thandai) — legal and health caution |
| 4 | **When to find it** | Req. | 1–3 sentences | Season and time of day (Suggested) |
| 5 | **Where to try it** | Req. | 60–150 | Areas (link `/markets/…`, `/food/food-areas`), **not** named stalls unless researched and identity/location verified; no ratings, hygiene claims or endorsements |
| 6 | **Tips** | Req. | 3–6 bullets | Hygiene, ordering, etiquette |
| 7 | **Try it on a food walk** | Opt. | Cards | Food-walk experiences/guide |
| 8 | FAQ, Sources & review footer | Req. | — | — |

### 4.7.2 Market (`/markets/<slug>`)

**Schema.org:** `Place` + `TouristAttraction`.

| # | Section | Req. | Length | Notes |
|---|---|---|---|---|
| 0 | Hero + Alert banner | Req. | — | — |
| 1 | **What it's known for** | Req. | 80–200 | — |
| 2 | **What to buy** | Req. | List | Link shopping guides |
| 3 | **Best time & crowds** | Req. | 40–100 | Suggested; weekly closures only if verified |
| 4 | **Bargaining & authenticity** | Req. | 80–200 | Generic guidance; link `/shopping/etiquette-and-authenticity`; no shop named as "certified" unless we verified it |
| 5 | **Getting there & walking** | Req. | Map block | Last-mile note |
| 6 | Nearby, FAQ, Sources & review footer | Req. | — | — |

---

## 4.8 Itinerary template (`/plan/itineraries/<slug>`)

**Schema.org:** `TouristTrip` with `itinerary` → `ItemList` of `TouristAttraction`s + `BreadcrumbList`.

| # | Section | Purpose | Req. | Length | Labels / components |
|---|---|---|---|---|---|
| 0 | Hero | Who it's for, length | Req. | — | "Suggested itinerary" tag always; Alert banner aggregating alerts for included places |
| 1 | **At a glance** | Fit check | Req. | Fact box | Days · Walking intensity (low/moderate/high) · Suitable for · Best season · Rough budget band (Estimate) |
| 2 | **Day-by-day timeline** | The plan | Req. | Per stop: time window, place link, suggested duration, travel/walk segment (mode + Estimate minutes), rest break, note | Each stop's opening-hours dependency shown as "Check: {place} hours" if unverified. Explicit disclaimer: "Times are suggestions; they don't account for live crowds or closures." |
| 3 | **Before you go** | Preparation | Req. | 3–6 bullets | Dress, cash, booking needs |
| 4 | **Alternatives** | Flexibility | Req. | 2–4 swaps | "If boats are suspended…", "If you prefer less walking…" |
| 5 | **Customise it** | Product CTA | Req. | Button | "Open in trip planner" (loads stops into `/plan/trip-planner`) + "Ask a local to adjust it" (enquiry) |
| 6 | FAQ, Sources & review footer | Req. | — | — | — |

---

## 4.9 Travel-guide article & FAQ structure

### 4.9.1 Travel-guide article (`/travel-guide/<slug>`)

**Schema.org:** `Article` (+ `FAQPage`, `BreadcrumbList`). `/travel-guide/emergency` and `/travel-guide/today` additionally carry `SpecialAnnouncement` **only** for official public-safety notices with a source.

| # | Section | Req. | Length | Notes |
|---|---|---|---|---|
| 0 | Hero + verification badge + Alert banner | Req. | — | Volatile articles (emergency, access rules, today) show the verified time, not just date |
| 1 | **Quick answer** | Req. | 40–80 | The direct answer to the page's main question |
| 2 | **Body** (H2 per sub-question) | Req. | 400–1,300 | Official rule / Suggested / Estimate labels on every practical claim |
| 3 | **Checklist** (component) | Opt. | 5–12 items | e.g. what to pack |
| 4 | **Official sources** | Req. for emergency, transport, access rules | List | Links to the authority |
| 5 | Related, FAQ, Sources & review footer | Req. | — | — |

**Emergency page specifics** (`/travel-guide/emergency`): numbers only from official sources, each with source link and verified date; displayed as tap-to-call; available offline (cached by the PWA); review cadence monthly; never more than 30 days since verification — otherwise the page shows "Not yet verified" and the national emergency number from the official source.

### 4.9.2 FAQ structure

| Rule | Detail |
|---|---|
| **Where FAQs live** | (a) On each detail page (3–8 page-specific Q&As); (b) the central `/travel-guide/faq` hub, grouped; (c) never duplicated verbatim across pages — the hub links to page FAQs instead. |
| **Hub groups** | Planning & timing · Getting there & around · Temples & rituals · Ghats & the river · Food & water · Money & connectivity · Safety & health · Families, seniors & accessibility · Booking with us (enquiries, partners, cancellations) |
| **Question style** | The traveller's own words, as a full question, ≤ 90 chars: "Can I take my phone into Kashi Vishwanath Temple?" |
| **Answer style** | First sentence answers directly (yes/no/number/range); 40–120 words total; labels apply (Official rule / Suggested / Estimate); link to the detail page for more. |
| **Volatile answers** | Answers containing time-sensitive facts carry `last_verified_at` and inherit the parent page's review cadence. |
| **Schema** | `FAQPage` with every Q&A visible on the page; not emitted on commercial pages where answers are promotional. |
| **Sourcing** | Each FAQ entry stores `source_refs` like any other content (see [05-cms.md](05-cms.md) §5.3.10). |
