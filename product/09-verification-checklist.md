# 9. Content Research and Verification Checklist

**Product:** Varanasi Trip Companion · **Spec version:** 1.0 · 1 November 2026
**Depends on:** [04-page-templates.md](04-page-templates.md) (truth labels) · [05-cms.md](05-cms.md) (fields and workflow)

Trust is the product. This checklist is what a writer and a fact-checker complete before anything reaches a traveller. In the CMS, these steps map to the **Fact Verification** state; nothing time-sensitive publishes without them.

---

## 9.1 Source hierarchy

Use the highest available tier. A lower tier may support but never override a higher one; conflicts are escalated (§9.11).

| Tier | Source type | Examples (types, not endorsements) | Good for |
|---|---|---|---|
| **1** | Official authority for the subject | Temple trust's official website/notices; Archaeological Survey of India (ASI) site pages and notices; UP Tourism / Ministry of Tourism; district administration & police notices; Indian Railways, Airports Authority of India; official event organisers | Timings, rules, fees, closures, emergency numbers, dates, restrictions |
| **2** | Academic & institutional | Peer-reviewed research, university publications, museum catalogues, published histories by recognised scholars, gazetteers | History, archaeology, architecture, cultural context |
| **3** | Reputable media | National newspapers and broadcasters with named reporting | Recent changes, announcements (must trace to Tier 1 where possible) |
| **4** | Field verification | Our own visit, call or photo by a named team member | Last-mile walking, drop-off points, crowd patterns, stall locations, whether a rule is enforced in practice |
| **5** | Partner-declared | Information supplied by a partner (prices, schedules) | Experience/service details — always labelled and confirmed in a signed agreement |
| ✗ | Not acceptable as sole source | Blogs, travel forums, social posts, AI output, aggregator listings, Wikipedia (use only to find primary sources) | Leads for research only |

**Two-source rule:** any documented-history claim, date, figure, distance or price needs either one Tier-1 source or two independent Tier-2/3 sources.

## 9.2 Evidence capture (stored in `source_refs`)

For every source used, record:

| Item | Required |
|---|---|
| Title and publisher | ✓ |
| URL (or citation for print) | ✓ |
| Accessed / observed date | ✓ |
| Source type (§9.1 tier) | ✓ |
| What it supports (field or claim) | ✓ |
| Screenshot or PDF snapshot (for Tier-1 web notices, which change) | ✓ for time-sensitive facts |
| Field photo (with time, location) | ✓ for Tier-4 verification |
| Verifier name | ✓ |

## 9.3 Truth labels to apply

| Label | Apply when | Never |
|---|---|---|
| **Documented history** | Dated records, inscriptions, scholarly consensus | For legends, or with a single weak source |
| **Archaeological evidence** | Excavation reports, ASI records, museum-held finds | For interpretations stated as fact |
| **Tradition** | Religious, mythological, devotional or oral accounts | Mixed into the same sentence as documented facts; presented as verified history |
| **Official rule** | Rule published by the managing authority, with link | For informal practice or "what people say" |
| **Suggested** | Our recommendations: routes, durations, best times | As a rule or guarantee |
| **Estimate** | Approximate prices, durations, distances from our checks | Without a range and a checked date |

## 9.4 General checklist (every entry)

- [ ] Target traveller question written in the CMS (why this page exists)
- [ ] Every factual sentence traceable to a `source_ref` or labelled Suggested
- [ ] Truth labels applied; tradition separated from documented history
- [ ] No invented hours, fees, prices, distances, phone numbers, dates, queue times or VIP arrangements
- [ ] Numbers carry units, ranges where appropriate, and checked date
- [ ] Names of places, deities, communities and people spelled consistently (house style list)
- [ ] Images: rights confirmed, credit recorded, alt text written, consent for identifiable people
- [ ] Internal links meet the minimum for the type ([06-seo.md](06-seo.md) §6.8.2)
- [ ] Volatility class set and `next_review_at` computed
- [ ] Reviewer is not the author

## 9.5 Per-type checklists

### Temple
- [ ] Managing authority identified; official website/notice links captured
- [ ] Opening hours, darshan/aarti times: Tier 1 only, screenshot saved; if unavailable → leave unverified ("Check before you go")
- [ ] Entry rules (phones, bags, dress, ID, items prohibited): Tier 1 or field-observed (Tier 4, labelled as observed practice)
- [ ] Locker/cloakroom availability: field-verified
- [ ] Photography policy: Tier 1 or posted signage photo
- [ ] Paid/priority darshan: mention only with Tier-1 source
- [ ] History: documented vs. tradition separated; contested history stated neutrally with reference to ongoing proceedings where applicable
- [ ] Accessibility: steps/ramps/wheelchair use checked on site; crowd peaks noted as Suggested
- [ ] Last mile: drop-off point and walking route walked by a team member; time recorded as Estimate
- [ ] Religious sensitivity review completed (§9.7)

### Ghat
- [ ] Name, location on riverfront, neighbours verified (field)
- [ ] Builder/patron and dates: Tier 2 sources; legends labelled Tradition
- [ ] Aarti or morning programme: organiser and typical timing from organiser (Tier 1) or field observation; seasonal variation noted
- [ ] River safety: current boating/river status source identified for alerts (district administration notices)
- [ ] Cremation ghats: respectful-visiting section, no-photography line, no commercial CTAs, image check (§9.7)

### Heritage site / museum
- [ ] Protection status and managing body (e.g. ASI) confirmed
- [ ] Ticketing, hours, weekly closure: Tier 1
- [ ] Archaeological claims cite excavation/ASI/museum sources
- [ ] Artefacts described match the museum's own description

### Nearby destination
- [ ] Category (short excursion / intercity) agreed
- [ ] Distance and travel time: map measurement + field or operator confirmation, labelled Estimate with date
- [ ] Transport options (rail/road) confirmed with operators' official sources

### Festival
- [ ] Significance and practices sourced; tradition labelled
- [ ] Typical season derived from the calendar basis (lunar month), labelled Suggested
- [ ] **Exact dates: only from official/organiser announcement** → `date_status = confirmed`; otherwise expected
- [ ] Restrictions, traffic diversions, boat suspensions: official notices only, with expiry
- [ ] Crowd-safety guidance reviewed (§9.8)

### Food item
- [ ] Description and ingredients from ≥ 2 sources or field tasting notes
- [ ] Dietary flags checked (dairy, gluten, nuts, Jain, bhang)
- [ ] Seasonality confirmed
- [ ] Areas named, not stalls — unless a vendor's identity and location are verified in person; no ratings, hygiene certificates or endorsements

### Market
- [ ] Location and extent walked
- [ ] What it's known for observed in person
- [ ] Weekly closures: field or trader association confirmation
- [ ] Authenticity advice reviewed by a textile/craft-knowledgeable reviewer (for silk)
- [ ] No shop described as "certified/verified" unless we performed and recorded that verification

### Service / partner
- [ ] Identity verified (DigiLocker or in-person document check); only method, type and masked reference stored
- [ ] Licences relevant to the service (e.g. boat, vehicle, guide) checked if held; expiry recorded
- [ ] Two references contacted
- [ ] In-person meeting and training completed
- [ ] Signed agreement: commission, pricing, cancellation, conduct
- [ ] Prices and inclusions confirmed in writing (Tier 5) before display
- [ ] Trial bookings (3) completed with check calls before `verified`
- [ ] Public bio and photo consented

### Emergency & safety information
- [ ] Every number from a Tier-1 source (central/state government, police, hospital official site), with screenshot
- [ ] Each number test-called or confirmed in service within the last 30 days
- [ ] Hospital entries: official name, address, emergency department availability confirmed
- [ ] Reviewed by a second fact-checker (four-eyes) before publish
- [ ] Review cadence: monthly; page auto-flags at 30 days

### Transport & last mile
- [ ] Airport/stations: official names and codes from Tier 1
- [ ] Vehicle restriction points and drop-offs: field-verified, with photos
- [ ] Fare guidance: labelled Estimate with date; official/prepaid rates only from Tier 1
- [ ] Walking times measured on foot at a normal pace, labelled Estimate

### Itinerary
- [ ] Every stop links to a published, verified place/activity
- [ ] Sequence walked or driven at least once by a team member
- [ ] Opening-hours dependencies checked against each stop's verified hours
- [ ] Transfers labelled Estimate; breaks included
- [ ] Senior/family variants checked for steps and walking distance
- [ ] Alternatives (boat suspended, temple closed, heat) provided
- [ ] Disclaimer present: does not account for live crowds or closures

## 9.6 Review cadence by volatility

| Volatility | Cadence | Typical fields / content | Overdue grace |
|---|---|---|---|
| **Daily** | Every morning (and afternoon in peak season) | River/boating status, Aarti location changes, closures, crowd alerts (as Travel Alerts with ≤ 72 h expiry) | 0 h |
| **Weekly** | Every 7 days | Temple timings and entry rules, festival-period restrictions, experience prices during peak season | 2 days |
| **Monthly** | Every 30 days | Emergency contacts, transport fares guidance, last-mile notes, service coverage, partner status | 7 days |
| **Quarterly** | Every 90 days | Place visiting guides, food and market pages, things-to-do guides, itineraries | 14 days |
| **Annual** | Every 365 days | History & culture articles, architecture, evergreen explore pages | 14 days |
| **Event-driven** | Before each occurrence | Festival pages | Must be verified before the occurrence window opens |

## 9.7 Cultural and religious sensitivity review

- [ ] Reviewer familiar with the relevant tradition (Hindu, Buddhist, Jain, Muslim, Sikh, etc.) for religious content
- [ ] Respectful, inclusive language; communities named as they name themselves
- [ ] No ridicule, exoticising or "spectacle" framing of rituals, death rites, sadhus or worshippers
- [ ] Cremation and mourning: privacy first; no photo encouragement; no commercial framing
- [ ] Contested sites and histories: neutral, factual, reference to legal proceedings without opinion
- [ ] Images: no identifiable mourners, no intrusive ritual close-ups without consent, dress-appropriate
- [ ] Hindi and English convey the same respect level

## 9.8 Safety and legal review

- [ ] Safety advice (river, crowds, heat, solo/women's safety, scams) reviewed by ops lead
- [ ] Health claims avoided; medical guidance limited to "seek care" + official resources
- [ ] Bhang/intoxicant references carry legal and health caution
- [ ] No defamatory statements about named businesses or people
- [ ] Partner claims match signed agreements
- [ ] Personal data in content (names, photos) has consent
- [ ] Legal pages reviewed by a lawyer before removing draft status

## 9.9 Hindi translation review

- [ ] Translated from the latest approved English version
- [ ] Reviewed by a native Hindi speaker other than the translator
- [ ] Religious and place names in their accepted Devanagari forms
- [ ] Time-sensitive values shared (not re-typed) from the English entry
- [ ] Truth labels translated with the agreed glossary (e.g. Tradition → परंपरा)
- [ ] Reading level suitable for general travellers

## 9.10 Sign-off record (stored per entry, per verification)

| Field | Example |
|---|---|
| Entry | `/places/temples/kashi-vishwanath` |
| Version | 7 |
| Fields verified | `opening_hours`, `entry_rules`, `photography_policy` |
| Sources used | #1 official site (screenshot 2026-11-03), #4 field visit |
| Method | Desk + field visit |
| Verifier | {name} (fact-checker) |
| Second check | {name} (only for emergency/safety) |
| Sensitivity review | {name}, passed |
| Date/time | [VERIFY: actual timestamp at sign-off] |
| Next review | Auto from cadence |
| Notes | e.g. "Hours differ in Sawan; seasonal row added" |

## 9.11 Conflicts and corrections

- Conflicting sources → use the higher tier; if same tier, contact the authority; until resolved, publish neither value ("Check before you go").
- Reader-reported error → acknowledged within 24 h; time-sensitive errors corrected or hidden within 2 h of confirmation; correction logged in the audit trail.

## 9.12 Red-flag list — never publish without verification

1. Opening hours, darshan/aarti times, closed days
2. Entry fees, ticket prices, paid/VIP darshan arrangements
3. Queue durations
4. Festival dates and event schedules
5. Emergency, police, ambulance, hospital and helpline numbers
6. Traffic diversions, vehicle restrictions, boating suspensions
7. Prices of experiences, services, transport fares
8. Distances and travel times stated as exact
9. Partner verification status, licences, ratings, reviews
10. Named restaurants, stalls or shops with any quality, hygiene or authenticity claim
11. Superlatives ("oldest", "largest", "only") and specific historical dates
12. Health, safety or legal claims
13. Any statement about contested religious sites beyond neutral, sourced facts
