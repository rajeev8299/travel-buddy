# 5. Admin CMS — Requirements and Field Definitions

**Product:** Varanasi Trip Companion · **Spec version:** 1.0 · 1 November 2026
**Depends on:** [01-sitemap.md](01-sitemap.md) · [04-page-templates.md](04-page-templates.md) · [09-verification-checklist.md](09-verification-checklist.md)

The CMS lets the content, operations and partner teams run the whole public site without code changes, while making it **impossible to publish unverified time-sensitive information** — the trust promise the business depends on.

---

## 5.1 Modules

| # | Module | Manages | Public URLs it drives | Phase |
|---|---|---|---|---|
| 1 | **Places** | Temples, ghats, heritage sites, nearby destinations | `/places/**` | MVP |
| 2 | **Categories & tags** | Taxonomies: place type, interest, area, audience, season | Filters, hubs, related cards | MVP |
| 3 | **Articles** | History & culture long-form, travel-guide articles | `/explore/**`, `/travel-guide/**` | MVP |
| 4 | **Food** | Food items and food areas | `/food/**` | MVP |
| 5 | **Shopping & markets** | Shopping guides and markets | `/shopping/**`, `/markets/**` | MVP |
| 6 | **Festivals & events** | Festivals and dated occurrences | `/festivals/**` | MVP |
| 7 | **Itineraries** | Ready-made plans; templates feeding the trip planner | `/plan/itineraries/**`, planner | MVP |
| 8 | **Things to Do** | Neutral activity guides | `/things-to-do/**` | MVP |
| 9 | **Experiences** | Partner offerings | `/experiences/**` | MVP |
| 10 | **Services** | Service categories and pages | `/services/**` | MVP |
| 11 | **Partners (suppliers)** | Partner records, KYC, verification, quality | `/partners/**` (P2), partner badges | MVP |
| 12 | **Leads** | Enquiries, reference codes, outcome, commission | — (internal) | MVP |
| 13 | **Travel alerts** | Live operational notices | `/travel-guide/today`, alert banners | MVP |
| 14 | **FAQs** | Q&A entries attached to pages and the hub | FAQ blocks, `/travel-guide/faq` | MVP |
| 15 | **Blog** | Stories and timely guides | `/blog/**` | P2 |
| 16 | **SEO metadata** | Per-entry overrides, redirects, sitemap exclusions | All | MVP |
| 17 | **Navigation** | Header menus, footer columns | Global | MVP |
| 18 | **Homepage sections** | Section order, headings, featured cards | `/` | MVP |
| 19 | **Media library** | Images, credits, consent, crops | All | MVP |
| 20 | **Users & roles** | Staff accounts and permissions | — | MVP |
| 21 | **Review queue** | Entries due/overdue for verification | — | MVP |
| 22 | **Audit log** | Every change, publish and data access | — | MVP |

---

## 5.2 Common base fields (every content entry)

Field names below are the canonical names; Requirements.md and the API reuse them.

| Field | Type | Req. | Validation / behaviour |
|---|---|---|---|
| `id` | UUID | Auto | Immutable |
| `type` | enum | Auto | One of the content types in §5.3 |
| `title_en` | string | Req. | 3–90 chars; unique within type |
| `title_hi` | string | Opt. (Req. if `hi_status = published`) | 3–90 chars |
| `slug` | string | Req. | `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 60 chars, unique within its URL parent; changing it after first publish auto-creates a 301 redirect |
| `summary_en` / `summary_hi` | string | Req. (EN) | 50–160 chars; used for cards and default meta description |
| `body_en` / `body_hi` | rich text (structured blocks) | Req. (EN) | Allowed blocks: heading (H2–H4), paragraph, list, quote, image, gallery, fact box, timeline, callout, labelled claim (with truth label), FAQ embed, related-cards embed. No raw HTML. Minimum word count per template ([04-page-templates.md](04-page-templates.md) §4.0.3). |
| `featured_image_id` | media ref | Req. | Must have alt text and credit; landscape ≥ 1600 px wide |
| `gallery_ids` | media ref[] | Opt. | ≤ 12; each with alt and credit |
| `category_ids` | taxonomy ref[] | Req. (≥ 1) | From the type's allowed categories |
| `tag_ids` | taxonomy ref[] | Opt. | ≤ 10 |
| `geo` | object `{lat, lng, area_id, address_text}` | Req. for places, markets, experiences' meeting points; else Opt. | lat 25.0–25.6, lng 82.7–83.3 for in-city items (warning, not block, for nearby destinations) |
| `related_ids` | typed refs[] | Opt. | Related places/things to do/itineraries/services; ≤ 12; bidirectional suggestions shown to editor |
| `source_refs` | array of `{title, publisher, url, accessed_at, type, note}` | Req. (≥ 1) for any entry with factual claims | `type ∈ official, ASI, government, academic, media, field_visit, partner_declared`; URL reachable check on save |
| `author_id` | user ref | Req. | — |
| `reviewer_id` | user ref | Req. to publish | Must differ from `author_id` and hold the fact-checker role |
| `created_at` / `updated_at` | timestamp | Auto | — |
| `published_at` | timestamp | Auto on first publish | — |
| `volatility` | enum `daily, weekly, monthly, quarterly, annual` | Req. | Sets the default review cadence ([09-verification-checklist.md](09-verification-checklist.md) §9.6) |
| `last_verified_at` | timestamp | Req. to publish if the entry has time-sensitive fields | Set only by a fact-checker action |
| `next_review_at` | date | Auto from `volatility`; editable earlier, never later than cadence max | Drives Review queue |
| `status` | enum (§5.4) | Auto | Workflow-controlled |
| `hi_status` | enum `none, draft, in_review, published` | Auto | Hindi is published independently once reviewed |
| `seo_title_en/hi` | string | Opt. | ≤ 60 chars; default from pattern ([06-seo.md](06-seo.md) §6.3) |
| `seo_description_en/hi` | string | Opt. | 70–160 chars; default from summary |
| `canonical_override` | URL | Opt. | Admin/editor only; used for cross-listing (e.g. Sarnath) |
| `noindex` | boolean | Auto/Opt. | Forced true while "Not yet verified" banner shows |
| `structured_data` | generated JSON-LD + optional overrides | Auto | Generated from type; overrides validated against schema type allowlist |
| `faq_ids` | FAQ refs[] | Opt. (Req. ≥ 3 for place, things-to-do, service in MVP) | — |
| `version` | integer | Auto | Incremented on every save (§5.6) |

### Time-sensitive fields (`ts_fields`)

Each content type declares which fields are time-sensitive (marked **TS** below). A TS field stores `{value, label, verified_at, verified_by, source_ref_index, expires_at}`. Labels: `official_rule, estimate, suggested`. A TS field without `verified_at` renders "Check before you go" instead of its value.

---

## 5.3 Type-specific fields

### 5.3.1 Place (`place`) — temples, ghats, heritage, nearby

| Field | Type | Req. | Notes |
|---|---|---|---|
| `place_kind` | enum `temple, ghat, heritage, museum, nearby` | Req. | Selects template variant |
| `excursion_class` | enum `in_city, short_excursion, intercity` | Req. for `nearby` | Sitemap grouping |
| `managing_authority` | string + URL | Req. (temple, heritage) | e.g. temple trust, ASI |
| `official_website` | URL | Opt. | — |
| `opening_hours` | **TS** structured (per day/season, closed days) | Opt. | Only with official or field source |
| `entry_fee` | **TS** structured (category → amount, currency) | Opt. | Official only |
| `darshan_aarti` | **TS** list `{name, time_window, notes}` | Opt. | Official source required; VIP/paid darshan only if official |
| `entry_rules` | **TS** list `{rule, label}` | Req. (temple) | — |
| `carry_avoid` | `{carry[], avoid[]}` | Req. (temple) | Suggested unless official |
| `photography_policy` | **TS** `{allowed: yes/no/restricted, detail, label}` | Req. | Mandatory "no" detail for cremation ghats |
| `is_cremation_ghat` | boolean | Req. (ghat) | Applies [04-page-templates.md](04-page-templates.md) §4.1.3 rules and blocks commercial CTAs |
| `accessibility` | `{steps_estimate, step_free_access, rest_points, crowd_notes, senior_notes}` | Req. | Estimates carry date |
| `last_mile` | `{drop_off_point, drop_off_geo, walk_minutes_estimate, route_notes}` | Req. (in-city) | — |
| `recommended_duration` | **TS** range in minutes + audience notes | Req. | Suggested |
| `history_documented` | rich text block (labelled) | Req. | Sources required |
| `history_tradition` | rich text block (labelled) | Opt. | — |
| `travel_from_varanasi` | `{modes[], distance_km_estimate, time_estimate}` **TS** | Req. (nearby) | Estimate or `[VERIFY]` |

### 5.3.2 Article (`article`) — history & culture, travel guide

| Field | Type | Req. | Notes |
|---|---|---|---|
| `article_kind` | enum `history_culture, travel_guide` | Req. | — |
| `in_brief` | string[] (3–5) | Req. | — |
| `timeline` | list `{date_text, sort_year, event, label, source_ref_index}` | Opt. | `label ∈ documented, archaeological, tradition` |
| `quick_answer` | string ≤ 400 chars | Req. (travel_guide) | — |
| `checklist` | string[] | Opt. | — |
| `reading_time_min` | integer | Auto | — |
| `is_emergency_page` | boolean | Auto for `/travel-guide/emergency` | Forces monthly cadence and offline caching |

### 5.3.3 Food item (`food`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `dietary` | flags `veg, vegan, jain_friendly, contains_dairy, contains_gluten, contains_nuts, contains_bhang` | Req. | `contains_bhang` forces caution block |
| `ingredients_typical` | string[] | Req. | — |
| `season` | enum[] months + `all_year` | Req. | Suggested |
| `time_of_day` | enum[] | Opt. | — |
| `food_area_ids` | market/area refs[] | Req. (≥ 1) | Areas, not stalls |
| `named_vendors` | partner/vendor refs[] | Opt. | Only vendors with completed identity + location verification record |

### 5.3.4 Market (`market`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `known_for` | string[] | Req. | — |
| `weekly_closure` | **TS** | Opt. | Verified only |
| `best_time` | text | Req. | Suggested |
| `shopping_guide_ids` | refs[] | Opt. | — |

### 5.3.5 Festival (`festival`) and occurrence (`festival_occurrence`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `typical_season` | text (e.g. "Kartik month, usually Oct–Nov") | Req. | Suggested |
| `locations` | place refs[] | Req. | — |
| `crowd_level` | enum `moderate, high, extreme` | Req. | Suggested |
| `occurrences` | list of `festival_occurrence` | Opt. | — |
| ↳ `year` | integer | Req. | — |
| ↳ `start_date` / `end_date` | date | Req. | — |
| ↳ `date_status` | enum `expected, confirmed` | Req. | **`confirmed` requires an official source ref and fact-checker verification**; only `confirmed` emits `Event` schema and appears in `/festivals/calendar` |
| ↳ `restrictions` | **TS** list with official notice links | Opt. | — |
| ↳ `expires_at` | date | Auto = `end_date + 1 day` | Then shown as past |

### 5.3.6 Itinerary (`itinerary`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `days` | integer 1–7 | Req. | — |
| `audiences` | enum[] `first_time, pilgrims, families, seniors, solo, heritage, food` | Req. | — |
| `walking_intensity` | enum `low, moderate, high` | Req. | — |
| `budget_band` | enum `budget, mid, premium` (+ Estimate note) | Opt. | — |
| `stops` | ordered list | Req. (≥ 3) | — |
| ↳ `day` | integer | Req. | — |
| ↳ `start_time_suggested` | time | Req. | Suggested |
| ↳ `place_id` or `activity_id` | ref | Req. | — |
| ↳ `duration_min` | integer | Req. | Suggested |
| ↳ `transfer` | `{mode: walk/auto/car/boat, minutes_estimate, note}` | Req. (except first stop each day) | Estimate |
| ↳ `break_after` | boolean + minutes | Opt. | — |
| ↳ `constraint_note` | text | Opt. | e.g. "Check temple hours" |
| `alternatives` | list `{condition, replacement_stop}` | Req. (≥ 2) | e.g. boat suspended |
| `planner_template` | boolean | Req. | If true, the trip planner may use it as a seed |

### 5.3.7 Things to Do (`activity`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `duration_estimate` | **TS** range | Req. | — |
| `best_time` | text | Req. | Suggested |
| `price_range_estimate` | **TS** range + unit | Opt. | — |
| `walking_intensity` | enum | Req. | — |
| `suitable_for` | enum[] | Req. | — |
| `place_ids` | refs[] | Req. | — |
| `experience_ids` | refs[] | Opt. | Only published experiences |
| `alert_area_ids` | area refs[] | Opt. | For live alert banners |

### 5.3.8 Experience (`experience`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `partner_id` | partner ref | Req. | Partner must be `verified` to publish |
| `activity_id` | ref | Req. | Matching Things-to-Do guide |
| `suitable_for` | string[] | Req. | — |
| `duration_estimate` | **TS** range | Req. | — |
| `start_window` | **TS** | Req. | Suggested |
| `meeting_point` | text + `geo` | Req. | — |
| `group_size` | `{min, max}` | Req. | — |
| `languages` | enum[] | Req. | — |
| `price` | **TS** `{from, to, unit, currency}` | Opt. | — |
| `price_verified` | boolean | Auto | True only when `price.verified_at` set from partner agreement |
| `schedule` | list `{time_offset, step}` | Req. | — |
| `inclusions` / `exclusions` | string[] | Req. | — |
| `safety_notes` | text | Req. | — |
| `cancellation_terms` | text or ref to policy | Req. | River/weather clause mandatory for `river` category |
| `host_bio` / `host_photo_id` | text / media | Req. | Partner consent record required |
| `response_sla_minutes` | integer | Req. | Default from settings |

### 5.3.9 Service (`service`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `service_category` | enum `transport, guides, river, stays, assistance` | Req. | — |
| `coverage` | `{areas[], hours, pickup_points[]}` | Req. | — |
| `cost_estimates` | **TS** list `{item, from, to, unit}` | Opt. | — |
| `cost_estimate_verified` | boolean | Auto | — |
| `inclusions` / `limitations` | string[] | Req. | — |
| `form_profile` | enum `transfer, guide, boat, stay, assistance` | Req. | Selects enquiry fields ([04-page-templates.md](04-page-templates.md) §4.5.2) |
| `partner_ids` | refs[] | Opt. | Routing candidates |
| `response_sla_minutes` | integer | Req. | — |

### 5.3.10 Partner / supplier (`partner`)

Personal data; access restricted to ops and admin (§5.5).

| Field | Type | Req. | Notes |
|---|---|---|---|
| `display_name` | string | Req. | Public |
| `legal_name` | string | Req. | Private |
| `partner_type` | enum `boat, guide, transport, stay, food_host, assistance` | Req. | — |
| `areas` | area refs[] | Req. | — |
| `languages` | enum[] | Req. | — |
| `contact_phone_whatsapp` | E.164 | Req. | Private; used only to route leads |
| `kyc` | `{method: digilocker/manual, verified_at, verified_by, document_type}` | Req. for `verified` | **Never store full ID numbers**; store method, type, last 4 digits at most, and the verifier |
| `licences` | list `{type, number_masked, issuer, expires_at, file_id}` | Opt. | e.g. boat licence, guide licence — only if the partner has one; expiry tracked |
| `references_checked` | boolean + note | Req. for `verified` | — |
| `training_completed_at` | date | Req. for `verified` | — |
| `agreement` | `{signed_at, commission_model, rate_text, file_id}` | Req. for `verified` | — |
| `verification_status` | enum `applied, under_review, trial, verified, suspended, offboarded` | Auto via actions | Only `verified` shows the public badge; `trial` shows "New partner" |
| `quality` | `{response_rate, on_time_rate, rating_avg, complaints_count, score}` | Auto | Computed from leads (P2 for full scoring) |
| `public_bio` / `photo_id` / `consent_at` | text / media / timestamp | Req. to show publicly | — |

### 5.3.11 Lead (`lead`) — internal

| Field | Type | Notes |
|---|---|---|
| `reference` | string `VTC-YYYY-XXXXXXXX` (today's code issues `TOB-…`; switch with the rebrand, old codes stay valid) | Crypto-random, shown to traveller |
| `source_type` / `source_id` | enum + ref | Page that created it (experience, service, itinerary, planner) |
| `utm` | object | Acquisition attribution |
| `traveller` | `{name, phone, email, dates, travellers, needs, notes}` | Personal data; retention per privacy policy |
| `assigned_partner_id` | ref | — |
| `status` | enum `new, contacted, partner_assigned, confirmed, completed, cancelled, lost` | — |
| `first_response_at`, `confirmed_at`, `completed_at` | timestamps | SLA metrics |
| `booking_value`, `commission_amount` | money | Recorded on completion |
| `lost_reason` | enum + note | — |

### 5.3.12 Travel alert (`alert`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `headline_en/hi` | string ≤ 90 | Req. | — |
| `detail_en/hi` | text ≤ 500 | Opt. | — |
| `severity` | enum `info, advisory, warning, critical` | Req. | Colour + ordering |
| `category` | enum `river, temple_access, traffic, weather, festival, safety, health` | Req. | — |
| `area_ids` / `place_ids` | refs[] | Req. (≥ 1) | Pages where the banner appears |
| `source_ref` | source | Req. | Official notice or field observation (with verifier) |
| `starts_at` / `expires_at` | timestamp | Req. | **`expires_at` max 72 h after `starts_at`**; must be renewed (re-verified) to stay up |
| `issued_by` | user ref | Auto | Ops or admin role only |

Alerts bypass editorial review (ops publish directly) but require a source; every publish is audit-logged.

### 5.3.13 FAQ (`faq`)

| Field | Type | Req. | Notes |
|---|---|---|---|
| `question_en/hi` | string ≤ 90 | Req. | — |
| `answer_en/hi` | rich text 40–120 words | Req. | — |
| `hub_group` | enum (see [04-page-templates.md](04-page-templates.md) §4.9.2) | Req. | — |
| `attached_to` | refs[] | Opt. | Pages showing it |
| `is_time_sensitive` | boolean | Req. | If true, inherits verification fields |

### 5.3.14 Blog post (`blog`) — P2

`publish_date`, `author_id`, `story_consent` (required for any traveller story: who consented, when, scope), `related_ids`. Traveller stories must be real and consented; no fabricated testimonials.

### 5.3.15 Navigation (`nav_menu`)

`location ∈ header, footer_explore, footer_plan, footer_services, footer_about, footer_legal`; ordered items `{label_en, label_hi, target (entry ref or path), children[]}`; max 5 top-level header items (sitemap §1.2); validation rejects links to unpublished entries.

### 5.3.16 Homepage section (`home_section`)

`key` (e.g. `popular_places`), `heading_en/hi`, `description_en/hi` (≤ 160), `cta_label`, `cta_target`, `card_source ∈ manual, query` (`query` e.g. "places where featured = true limit 6"), `card_ids` (manual), `visible`, `sort_order`, `schedule {from, to}` (e.g. festival section only in season).

### 5.3.17 Media (`media`)

`file`, generated renditions (640/1280/1920 WebP + original), `alt_en/hi` (Req.), `caption`, `credit {creator, license, source_url}` (Req.), `consent {people_identifiable: bool, consent_record_id}` (Req. when people are identifiable), `focal_point`, `sensitive_flag` (cremation/rituals — editor approval before use).

---

## 5.4 Workflow

### 5.4.1 States

```
Draft → Editorial Review → Fact Verification → Published → Scheduled Review → (Updated → Published) | Archived
                ↑ back to Draft (changes requested)   ↑ back to Draft (verification failed)
```

| State | Meaning | Public? |
|---|---|---|
| `draft` | Being written | No |
| `editorial_review` | Editor checks structure, tone, sensitivity, length | No |
| `fact_verification` | Fact-checker verifies every claim and TS field against sources | No |
| `published` | Live | Yes |
| `scheduled_review` | `next_review_at` reached; entry is in the Review queue | Yes — with "Verified on" date; TS fields past `expires_at` show "Check before you go" |
| `review_overdue` | Scheduled review not completed within grace period (daily: 0 h, weekly: 2 d, monthly: 7 d, quarterly/annual: 14 d) | Yes, with **"Not yet verified" banner** and `noindex` |
| `archived` | Retired; URL 301s to nearest parent or replacement | No |

Edits to a published entry create a **working copy** that goes through the same states; the published version stays live until the copy is published (Updated → Published).

### 5.4.2 Transitions and who may perform them

| Transition | Writer | Editor | Fact-checker | Ops | Admin |
|---|---|---|---|---|---|
| Create / edit draft | ✓ | ✓ | — | ✓ (alerts, partners, experiences, services) | ✓ |
| Draft → Editorial Review | ✓ | ✓ | — | ✓ | ✓ |
| Editorial Review → Draft (request changes) | — | ✓ | — | — | ✓ |
| Editorial Review → Fact Verification | — | ✓ | — | — | ✓ |
| Fact Verification → Published | — | — | ✓ (must not be author) | — | ✓ (emergency override, logged with reason) |
| Fact Verification → Draft (failed) | — | — | ✓ | — | ✓ |
| Mark verified (set `last_verified_at`) on TS field | — | — | ✓ | ✓ (field-visit verification of operational fields) | ✓ |
| Published → Archived | — | ✓ | — | — | ✓ |
| Publish alert | — | — | — | ✓ | ✓ |
| Partner verification status change | — | — | — | ✓ | ✓ |
| Manage users & roles, navigation, settings | — | nav & homepage only | — | — | ✓ |

### 5.4.3 Blocking rules (enforced server-side)

1. **No unverified TS fields at publish.** An entry cannot move to `published` if any populated TS field lacks `verified_at`, or if `last_verified_at` is older than the cadence allows.
2. **Reviewer ≠ author.** Same user cannot author and fact-check.
3. **Sources required.** Any entry with documented-history, archaeological or official-rule labels needs ≥ 1 matching `source_refs`.
4. **Truth labels required.** Labelled-claim blocks without a label fail validation.
5. **Expiry handling.** When a TS field passes `expires_at`, the public page automatically replaces its value with "Check before you go — [official source]" (no rebuild wait: the static page reads an expiry map, see §5.8). When the entry passes its overdue grace period, the banner + `noindex` apply.
6. **Festival dates.** `date_status = confirmed` needs official source + fact-checker.
7. **Partners.** Experiences/services can only reference `verified` partners to be publicly bookable; `trial` partners are routed leads internally only.
8. **Media.** No publish with images missing alt text, credit, or required consent.
9. **Minimum length.** Template minimum word counts enforced.
10. **Cremation ghats.** Entries with `is_cremation_ghat` cannot attach experiences or commercial CTAs, and media flagged `sensitive_flag` need editor approval.

---

## 5.5 Roles & data access

| Role | Content | Partners & leads (personal data) | Settings |
|---|---|---|---|
| Writer | Create/edit own drafts | None | None |
| Editor | All content; navigation; homepage | Read partner public fields | None |
| Fact-checker | Verify, publish | None | None |
| Ops | Alerts, experiences, services | Full partners and leads | SLA values |
| Admin | All | All | All |

Access to traveller and partner personal data is logged in the audit log (who, what record, when). Leads older than the retention period (privacy policy) are anonymised automatically.

---

## 5.6 Versioning & audit

- Every save stores an immutable revision `{entry_id, version, author, timestamp, diff, state}`; any revision can be previewed and restored (restoring creates a new draft).
- Audit log records: logins, state transitions, verification actions (with source used), publishes, archive/redirects, alert issue/renewal/expiry, partner status changes, personal-data views/exports, role changes. Append-only; retained ≥ 2 years.
- "Verification history" panel on each entry: who verified which TS field, when, against which source.

## 5.7 Media management, credits & consent

- Upload → automatic WebP renditions (640/1280/1920) and EXIF/GPS stripping.
- Credit and license required; footer photo-credit list is generated from media actually used on published pages.
- People-identifiable images require a consent record (name, date, scope, contact); minors require guardian consent.
- Sensitive imagery (cremation, rituals, mourners) flagged and requires editor approval; cremation-in-progress imagery is never allowed.

## 5.8 Bilingual handling (EN / HI)

- Each translatable field has `_en` and `_hi`; English is the source of truth.
- Storage: in the database (see [Requirements.md](../Requirements.md) §8), `ts_fields` are rows in the `fact` table and `source_refs` are rows in the `source` table; the field names in this document are the editor-facing names.
- Hindi versions have their own `hi_status` and must be reviewed by a native-speaker editor ([09-verification-checklist.md](09-verification-checklist.md) §9.9) before `/hi/` publication.
- When an English TS field changes, the Hindi page shows the updated value immediately (values are shared, only prose is translated) and prose is flagged "translation outdated" for the translator.
- `/hi/` pages exist only for entries with `hi_status = published`; hreflang emitted only between existing pairs.

## 5.9 Publish → static rebuild / revalidation

| Event | Action |
|---|---|
| Entry published/updated/archived | Rebuild that page, its hubs, related pages, sitemap; purge CDN for those URLs |
| Alert published/expired | No rebuild: alerts and TS expiries are served from a small JSON endpoint (`/api/public/live.json`, cached ≤ 60 s) that pages read client-side; pages remain correct offline-first with a "may be outdated" note |
| Nightly job | Recompute review queue, apply overdue banners/noindex, rebuild sitemap, broken-link and source-URL check |

Target: content edit visible on the live site ≤ 5 minutes after publish; alerts ≤ 1 minute.

---

## 5.10 Mapping to the existing stack and migration path

| Today (repo) | Role in the target CMS |
|---|---|
| `server/` Express + SQLite (`node:sqlite`), auth middleware (`requireAuth`, `requireRole`), validation middleware, notifications (`notify.js`) | Becomes the **CMS API**: add tables for entries, revisions, media, taxonomy, alerts, partners, leads, audit; reuse `requireRole` for writer/editor/fact-checker/ops/admin; reuse `validateBody` for field validation |
| `src/admin` React admin (dashboard, hero, applications, plan requests, buddies, stories, users) | Becomes the **CMS UI**: generic entry editor driven by per-type field schemas; review queue; alert console; partner & lead pipelines (evolving today's applications and plan-requests screens) |
| `scripts/build-site.mjs` + `docs/experiences.json` + `content/legal/` | Proof of concept for data-driven static generation; replaced by the site generator below |
| `docs/` static pages | Replaced page-by-page by generated pages (redirect map in [01-sitemap.md](01-sitemap.md) §1.5) |

**Recommended path**

1. **Phase 1a — Schema & API:** add the content tables and workflow endpoints to `server/`; keep SQLite (sufficient for a small editorial team) with WAL and daily backups; move to Postgres when concurrent editors or lead volume require it.
2. **Phase 1b — Generator:** replace `build-site.mjs` with a static-site generator (Astro recommended: ships zero JS by default, file-based routing matches the sitemap, image pipeline built in) that pulls published entries from the API at build time; publish triggers a build hook.
3. **Phase 1c — Admin:** build the entry editor, review queue, alerts console and partner/lead pipeline in `src/admin`; retire the duplicate public pages in the React app.
4. **Phase 1d — Migrate content:** move the six experience guides, legal pages and existing pages into the CMS; set up redirects.
5. **Phase 2:** Hindi publishing, partner profiles, reviews tied to booking codes, blog.
