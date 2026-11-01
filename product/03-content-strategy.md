# 3. Content Strategy

**Product:** Varanasi Trip Companion
**Positioning:** *Discover the Soul of Varanasi. Plan Smarter. Travel with Confidence.*
**Status:** Product specification v1.0, 1 November 2026. URLs follow [01-sitemap.md](01-sitemap.md). Priorities are in [07-content-priorities.md](07-content-priorities.md).

The feasibility plan is clear that **generic attraction lists aren't a business**. What sets this content apart is information that's current, checked on the ground, practical about routes and access, and culturally careful. Every content decision below serves that.

---

## 3.1 Audiences

These are the segments from the feasibility plan. Each category below names the segments it serves first.

| Code | Segment | What they need most |
|---|---|---|
| **IND** | Independent domestic travellers | Itineraries, timing, transport, food, boat rides |
| **PIL** | Pilgrims and families | Darshan sequence, temple rules, senior-friendly movement, safety |
| **INT** | International cultural travellers | English guidance, cultural context, transparency, verified guides |
| **BUD** | Buddhist visitors to Sarnath | Sarnath interpretation, multilingual guides, transport |
| **LMV** | Last-minute visitors | What's on today, current conditions, immediate help |
| **B2B** | Hotels, homestays, local operators | Partner standards, how to list, guest-facing resources |

## 3.2 Content types

| Type | Purpose | Typical length | Main format |
|---|---|---|---|
| **Hub** | Orientation and choice | 80–150 words + cards | Cards, filters, map |
| **Place detail** | Everything needed to visit one place | 900–1,800 words | Template in [04-page-templates.md](04-page-templates.md) |
| **Long-form article** | History and culture, explained properly | 1,500–3,000 words | Sections, sources, timeline |
| **Activity guide** (Things to Do) | How to do something well | 800–1,500 words | Steps, checklist, linked offerings |
| **Experience / service** (commercial) | A specific partner offering or category | 300–700 words | Facts table, inclusions, enquiry |
| **Itinerary** | A realistic day-by-day plan | 600–1,500 words | Time blocks, map, walking notes |
| **Practical guide** | Arriving, moving, staying safe | 600–1,500 words | Checklists, tables, dated facts |
| **Alert** | Today's operating conditions | ≤ 120 characters + optional detail | Strip + `/travel-guide/today` list |
| **FAQ** | Direct answers | 40–90 words per answer | Accordion + `FAQPage` markup |
| **Story / blog** | Freshness and authority | 700–1,500 words | Narrative, consented photos |

---

## 3.3 Category strategies

The same structure is used for every category:
- **Purpose**
- **Audiences**
- **Search intents** (examples; full keyword map in [06-seo.md](06-seo.md))
- **Depth and format**
- **What must be verified, and how often**
- **Required internal links**
- **Sensitivity rules**

### 3.3.1 Explore Varanasi (history and culture) · `/explore/`

| | |
|---|---|
| **Purpose** | Build authority and trust. Explain *why* Varanasi matters so that visits mean more. This is evergreen content and the main source of links from other sites. |
| **Audiences** | INT, BUD, IND (curious), students and researchers |
| **Search intents** | "history of Varanasi", "why is Varanasi called Kashi", "Varanasi significance in Hinduism", "Sarnath and Buddhism", "Banarasi silk history", "history of ghats in Varanasi" |
| **Depth and format** | Long-form articles (1,500–3,000 words), each with: a 60-word summary at the top; a "Key facts" box; clearly labelled sections; a timeline where useful; a sources list. Cards on hubs carry the summary. |
| **Verification** | Historical and archaeological claims need a citable source (ASI publications, museum catalogues, peer-reviewed or university-press history, government gazetteers). **Review yearly**, or when a source is updated. |
| **Internal links** | Each article links to 3+ places it mentions, 1 itinerary, and 1 activity guide. Places link back to the article that explains them. |
| **Sensitivity** | See §3.4. Every claim is labelled in the text as **documented history**, **archaeological evidence**, or **religious tradition**, and tradition is never presented as dated fact. Contested sites and ongoing legal matters are described neutrally and briefly, with no position taken. |

### 3.3.2 Temples · `/places/temples/`

| | |
|---|---|
| **Purpose** | The most practical and most time-sensitive part of the site, and the strongest trust builder for pilgrims. |
| **Audiences** | PIL (primary), IND, INT, LMV |
| **Search intents** | "Kashi Vishwanath darshan", "Kashi Vishwanath mobile allowed", "Sankat Mochan temple Varanasi", "Kaal Bhairav temple significance", "temples to visit in Varanasi" |
| **Depth and format** | Place-detail template, 1,000–1,800 words. A visiting box at the top: dated rules, items not allowed, dress, photography, accessibility. Then significance, history, architecture, nearby places, FAQ. |
| **Verification** | **Darshan and aarti times, entry rules, prohibited items, locker arrangements, special-darshan or ticket options, photography rules: weekly**, and before every major festival. Sources: the official temple trust website or office, district administration notices, and in-person checks by the local reviewer. [VERIFY: official source for each temple. The Kashi Vishwanath official trust website is the primary source for that temple.] Never invent timings, fees, queue durations or VIP arrangements. If unverified, the page says "Check at the temple or on [official source]". |
| **Internal links** | Temple circuits, the spiritual itinerary, temple access rules, last-mile walking, nearby ghats, guide services (temple tours). |
| **Sensitivity** | Respectful naming (use "Shri" where customary), no ranking of faiths or temples, no promises about spiritual results, and dress and conduct guidance written as respect, not policing. Where entry restrictions exist, state them factually from the official source. |

### 3.3.3 Ghats · `/places/ghats/`

| | |
|---|---|
| **Purpose** | The riverfront is the heart of most visits. This content helps people choose ghats by time of day, mood and accessibility. |
| **Audiences** | IND, INT, PIL, photographers |
| **Search intents** | "best ghats in Varanasi", "Assi Ghat morning", "Dashashwamedh Ghat aarti", "Manikarnika Ghat visit etiquette", "ghats of Varanasi list" |
| **Depth and format** | A hub with an illustrated riverfront strip (south → north), plus a place page for each ghat (700–1,400 words): history and tradition, what happens there, best times, steps and accessibility, nearby, etiquette. |
| **Verification** | Aarti location changes in high water, step conditions, construction or closures: **weekly in the monsoon, monthly otherwise**. History: yearly. |
| **Internal links** | Neighbouring ghats (previous and next along the river), boat rides, the morning ghat walk, the Aarti guide, itineraries that pass the ghat. |
| **Sensitivity** | **Cremation ghats (Manikarnika, Harishchandra):** written as places of grief and ritual, never as attractions. No photography of cremations, the bereaved or bodies. Recommend viewing from a distance or a boat, with a knowledgeable local. Warn about requests for "wood donations" and unofficial "guides". Never use "must-see", "fascinating" or "spectacle" for these ghats. No cremation imagery anywhere on the site. |

### 3.3.4 Heritage attractions · `/places/heritage/`

| | |
|---|---|
| **Purpose** | Depth beyond the river, and the main home of Buddhist and archaeological content. |
| **Audiences** | INT, BUD, IND, students |
| **Search intents** | "Sarnath places to visit", "Dhamek Stupa history", "Sarnath Museum", "Ramnagar Fort", "Bharat Kala Bhavan", "Jantar Mantar Varanasi" |
| **Depth and format** | Place-detail template with a stronger history section, 1,000–1,800 words. Sarnath gets a hub-style page that links its monuments. |
| **Verification** | Opening days and hours, weekly closures, ticketing and photography rules: **monthly** [VERIFY: Archaeological Survey of India listings and site notices for Sarnath monuments and museum; site management for Ramnagar Fort and Bharat Kala Bhavan]. History: yearly. |
| **Internal links** | The Buddhism and Jainism article, the Sarnath tour guide, the "with Sarnath" itinerary, Sarnath guide services, transport to Sarnath. |
| **Sensitivity** | Buddhist sites are active places of worship: respectful dress and conduct, and quiet near shrines. Mosques and other faiths' sites follow the same neutral, respectful standard. |

### 3.3.5 Nearby destinations · `/places/nearby/`

| | |
|---|---|
| **Purpose** | Longer stays and repeat value. It also lays the groundwork for the planned spiritual-circuit expansion (Phase 4). |
| **Audiences** | IND, PIL, BUD |
| **Search intents** | "places near Varanasi", "Varanasi to Sarnath", "Chunar Fort from Varanasi", "Varanasi to Prayagraj trip", "Varanasi to Bodh Gaya" |
| **Depth and format** | Two clearly separate groups: **Day trips** (Sarnath, Chunar, Vindhyachal) and **Overnight trips** (Prayagraj, Bodh Gaya, Gaya, Ayodhya). 600–1,200 words each, covering: why go, how to get there, how long to allow, what to combine. |
| **Verification** | Distances and typical travel times: [VERIFY: dated mapping source, recorded in the CMS]. Train and road options: every quarter. |
| **Internal links** | Outstation transport service, matching itinerary, the Sarnath canonical page. |
| **Sensitivity** | Same faith-respect rules as temples. Don't promise travel times; give ranges with a date. |

### 3.3.6 Things to Do · `/things-to-do/`

| | |
|---|---|
| **Purpose** | Neutral, expert "how to do this well" guides. This is the bridge between inspiration and enquiry. |
| **Audiences** | IND, INT, LMV |
| **Search intents** | "sunrise boat ride Varanasi", "best way to see Ganga Aarti", "Varanasi food walk", "Varanasi heritage walk", "Sarnath tour" |
| **Depth and format** | Activity guide, 800–1,500 words: who it suits, typical duration, best times, how to choose an operator, what's fair to expect, safety, etiquette, and a "Do it with a verified partner" block listing `/experiences/` offerings. |
| **Verification** | Seasonal factors (boat suspension in high water, Aarti changes): **weekly in season changes**. Price **ranges** only if they come from at least 3 verified partner quotes, dated [VERIFY]. |
| **Internal links** | Places involved, partner experiences, matching service category, itineraries. |
| **Sensitivity** | Photography walks must include the etiquette rules in §3.6. Religious rituals are described as observed, not staged. |

### 3.3.7 Local Experiences (commercial) · `/experiences/`

| | |
|---|---|
| **Purpose** | Turn interest into tracked enquiries. Each is one partner's real offering. |
| **Audiences** | IND, INT, BUD, LMV |
| **Search intents** | "book boat ride Varanasi", "private boat Varanasi", "Varanasi food tour", "Sarnath guide" |
| **Depth and format** | Experience template (see [04-page-templates.md](04-page-templates.md)), 300–700 words: summary, facts table, schedule, inclusions and exclusions, safety, cancellation terms, partner verification status, enquiry or WhatsApp. |
| **Verification** | Partner verification status and date, price, schedule, inclusions: **checked with the partner every month and on every change**. An offering whose partner verification has expired is unpublished automatically. |
| **Internal links** | Its Things-to-Do guide, the place(s) involved, the partner profile (P2), similar experiences. |
| **Sensitivity** | Always labelled "Partner experience". No fabricated reviews or ratings. Ratings appear only from verified, booking-linked reviews (Phase 2). |

### 3.3.8 Travel Services (commercial) · `/services/`

| | |
|---|---|
| **Purpose** | Practical help (transfers, guides, boats, stays, planning) as tracked leads, with no checkout in the MVP. |
| **Audiences** | LMV, PIL, INT, IND |
| **Search intents** | "Varanasi airport taxi", "Varanasi railway station pickup", "guide in Varanasi", "boat booking Varanasi", "hotels near Dashashwamedh" (stays are Phase 2) |
| **Depth and format** | Service-category template: what's covered, coverage area, how it works, response expectations, estimated cost ranges *only where supported*, inclusions and limitations, matching verified partners, enquiry form. |
| **Verification** | Partner status: monthly. Response-time promise: tracked live in operations. Cost ranges: monthly from partner quotes. |
| **Internal links** | Matching Travel Guide pages (how to reach, getting around), Things to Do, itineraries. |
| **Sensitivity** | Never call a partner "verified" unless the CMS has a current verification. Explain plainly what the platform does and does not guarantee. |

### 3.3.9 Food · `/food/`

| | |
|---|---|
| **Purpose** | High search demand and high delight. Shows local depth without becoming a restaurant directory. |
| **Audiences** | IND, INT, food lovers |
| **Search intents** | "famous food of Varanasi", "Banarasi kachori", "malaiyo Varanasi", "tamatar chaat", "Banarasi paan", "where to eat in Varanasi" |
| **Depth and format** | A page per dish (500–900 words): description, culinary context, typical ingredients, dietary cautions (dairy, gluten, nuts, spice, bhang in some thandai), when it's available (seasonal), food areas, tips. `/food/food-areas` covers *areas*, not ranked shops. |
| **Verification** | Seasonal availability: yearly. **Any named business needs identity and location verified by the local reviewer, with the date recorded**. No ratings, hygiene certifications or endorsements unless the platform actually issued them. |
| **Internal links** | Food walks, the food-and-markets itinerary, the market pages for each area. |
| **Sensitivity** | Clearly mark items that may contain bhang (cannabis), with legal and health cautions [VERIFY: current legal status and licensed outlets in Uttar Pradesh]. Respect vegetarian norms near temples. |

### 3.3.10 Shopping and markets · `/shopping/` · `/markets/`

| | |
|---|---|
| **Purpose** | Help travellers buy authentic goods, avoid being misled, and support artisans. |
| **Audiences** | INT, IND, PIL (religious goods) |
| **Search intents** | "Banarasi saree buying guide", "how to identify real Banarasi silk", "Varanasi markets", "Godowlia market", "what to buy in Varanasi" |
| **Depth and format** | Buying guides (800–1,500 words) with authenticity checklists. Market pages (500–900 words) cover what's sold there, character, best times, getting there, etiquette. |
| **Verification** | Market days and closures: quarterly. Authenticity schemes (e.g. Geographical Indication for Banarasi products): [VERIFY: GI registry entry and current scheme details]. |
| **Internal links** | The silk article, silk weaving visits, the Madanpura market, the food-and-markets itinerary. |
| **Sensitivity** | No "certified" or "verified" shop claims unless the platform did the verification. Bargaining guidance is respectful. Explain commission-driven touting honestly and neutrally. |

### 3.3.11 Festivals and culture · `/festivals/`

| | |
|---|---|
| **Purpose** | Seasonal planning: both to attend and to avoid. A strong source of recurring search traffic. |
| **Audiences** | PIL, IND, INT, LMV |
| **Search intents** | "Dev Deepawali Varanasi", "Mahashivratri Varanasi", "Holi in Varanasi", "Ramnagar Ramlila", "Varanasi festival calendar" |
| **Depth and format** | Festival page (900–1,500 words): background and significance (labelled tradition / history), traditions, typical season, **dates for the year only once officially confirmed**, key locations, crowd expectations, restrictions, safety, matching itineraries and experiences. The calendar page lists confirmed dates only. |
| **Verification** | Exact dates, traffic diversions, boat restrictions, entry controls: **confirmed per occurrence** from official sources [VERIFY: district administration, UP Tourism, temple trust notices]. Pages are reviewed **6 weeks before** the typical season. |
| **Internal links** | Places involved, temple access rules, Today alerts, partner experiences (e.g. boat viewing on Dev Deepawali, if verified). |
| **Sensitivity** | Holi safety for women and children, with respectful advice on consent and colour. Religious meaning is presented without sensationalism. |

### 3.3.12 Itineraries and planner · `/plan/`

| | |
|---|---|
| **Purpose** | The core product metric (itinerary starts and completions). Turns content into a usable plan. |
| **Audiences** | All. The senior-friendly and family plans serve PIL. |
| **Search intents** | "Varanasi itinerary 2 days", "1 day in Varanasi", "Varanasi and Sarnath itinerary", "Varanasi itinerary for seniors" |
| **Depth and format** | Time-blocked days: morning / midday / evening, with walking distance and intensity, rest breaks, last-mile notes, alternatives (rain, high water, crowds), and links to every place and service. Each ready-made plan is also a template in the planner. |
| **Verification** | Time blocks depend on opening hours and rules, so each itinerary **inherits the earliest review date of the places it uses**. If any of them is overdue, the itinerary shows "Some details are being re-checked". Reviewed monthly by the local reviewer. |
| **Internal links** | Every place, activity and service mentioned. Today alerts. Transport. |
| **Sensitivity** | Never claim live crowd or closure awareness unless a validated data source is integrated. |

### 3.3.13 Travel Guide and essentials · `/travel-guide/`

| | |
|---|---|
| **Purpose** | Practical, dated, safety-critical information. Holds the "verified today" layer. |
| **Audiences** | LMV, INT, PIL, IND |
| **Search intents** | "how to reach Varanasi", "Varanasi airport to city", "best time to visit Varanasi", "Varanasi in monsoon", "is Varanasi safe", "Varanasi scams", "emergency numbers Varanasi" |
| **Depth and format** | Practical guides with checklists and tables. Every operational fact carries a "Last verified" date. `/travel-guide/today` lists the active alerts. `/travel-guide/emergency` is short, works offline and is printable. |
| **Verification** | **Emergency numbers and hospitals: monthly**, from official sources only [VERIFY: Government of India / UP emergency numbers; hospital contact details confirmed directly]. Alerts: per occurrence, with expiry. Transport and fares guidance: monthly. Seasons: yearly. |
| **Internal links** | Services (transfers), places with access rules, itineraries. |
| **Sensitivity** | Women's safety advice is practical, not alarming. Scam guidance doesn't stereotype communities or professions. |

### 3.3.14 Blog · `/blog/` (Phase 2)

| | |
|---|---|
| **Purpose** | Freshness, seasonal topics, and stories that build trust. |
| **Audiences** | All, plus social and newsletter channels |
| **Search intents** | Seasonal and long-tail: "Varanasi in winter", "Dev Deepawali tips", "Varanasi with kids" |
| **Depth and format** | 700–1,500 words, with an author and a date. Traveller stories only with **written consent**, a real trip record and consented photos. |
| **Verification** | Any operational fact in a post links to the dated Travel Guide page instead of repeating it. |
| **Internal links** | At least 3 evergreen pages. |
| **Sensitivity** | No invented testimonials. Disclose any sponsorship clearly, as the feasibility plan requires. |

---

## 3.4 Facts, traditions and estimates: labelling rules

Every content entry tags each important claim with one of these. The visual treatment is set in the templates.

| Label | Meaning | How it's written |
|---|---|---|
| **Documented history** | Supported by dated records, inscriptions, contemporary accounts or scholarly consensus | Plain statement + source in the sources list |
| **Archaeological evidence** | Supported by excavation or material finds | "Excavations at … revealed …" + source (ASI or museum) |
| **Religious tradition** | Held in scripture, legend or belief | "According to tradition…", "Devotees believe…", "In Hindu (or Buddhist, or Jain) tradition…" |
| **Estimate** | A range from our own observation or partner data | "Typically…", "Usually…", with the date observed |
| **Suggested** | Our recommendation (routes, times, pacing) | "We suggest…" |
| **Proposed service** | Something offered by a partner | Labelled as a partner offering, with verification status |

Never date a legend ("built 5,000 years ago"). Never present one community's tradition as the only view. Where scholars disagree, say so in one sentence.

## 3.5 Voice and tone

- **Warm, calm, expert, like a well-read local friend.** It's not a brochure and not an encyclopedia.
- Short sentences, active voice, second person ("you").
- Specific over superlative. "Arrive early to sit near the front" is better than "an unforgettable experience".
- Respect first: sacred practices are described, not judged or exoticised.
- Honest about limits: "We haven't verified this yet", "Check at the gate".
- **Words to avoid:** "exotic", "mystical land", "spectacle" (for rituals), "hidden secret" (overused), "must-see" for cremation ghats, "guaranteed".
- **House style:** Indian English spelling; ₹ before amounts; 12-hour time with am/pm; "the Ganga" (mention "Ganges" once per page for international search); "Kashi Vishwanath" with "Shri" in titles.

## 3.6 Images and photography

| Rule | Detail |
|---|---|
| Credits | Every image has a record in `credits.json` / the CMS media library: creator, licence, source. Photos needing attribution (e.g. CC BY) are credited on the page. |
| Consent | Identifiable people need a model release, or the photo must be a crowd scene where no individual is the subject. Children: always consent, otherwise blur or don't use. |
| **Cremations** | **No photographs of cremations, bodies or mourners, anywhere on the site.** Cremation-ghat pages use river or architecture views taken from a distance, or illustration. |
| Temples | Only where photography is permitted, and with no interior shots that the official rules prohibit. |
| Alt text | Describes the content and context: "Boats moored at Dashashwamedh Ghat at dusk". Decorative images use `alt=""`. |
| Authenticity | Real Varanasi photography only. No AI-generated imagery presented as real places, no stock from other cities. Colour grading should stay natural. |
| Performance | Responsive WebP versions at 640, 1280 and 1920 px. The original JPEG is kept for social sharing. |

## 3.7 Bilingual approach (English and Hindi)

- **English first (MVP).** Hindi follows for the pages pilgrims and domestic families use most (P2): temples, the spiritual itinerary, temple rules, emergency, how to reach, festivals.
- **Hindi is written or edited by a native writer, not machine-translated.** Machine translation may be used as a first draft only, and must be reviewed.
- Each language version has its own verification date. A Hindi page can't show a fact that its English page has moved to "needs review".
- Place names follow local usage in each script (काशी विश्वनाथ, दशाश्वमेध घाट). The English slug is kept under `/hi/`.

## 3.8 Editorial standards: no thin or filler content

A page is **not** published if any of these apply:

1. It mainly restates what's on other pages, or could describe any city.
2. It has no practical detail a visitor could act on: when, how, what to carry, what to avoid.
3. It states timings, prices, distances or dates without a source and a verification date.
4. It was AI-generated and not substantially rewritten, fact-checked and reviewed by a person with local knowledge.
5. It targets a keyword that an existing page already answers. Improve that page instead.
6. A local reviewer hasn't read it.

**Required on every page:**
- Author.
- Reviewer.
- "Last verified" date for operational facts.
- At least one original detail from local knowledge (a route tip, a timing pattern, a cultural note).
- A sources list for history and culture.
- No keyword stuffing. One main search intent per page.

## 3.9 Who produces content

| Role | Responsibility | Where they sit |
|---|---|---|
| **Content lead / editor** | Plans the calendar, edits for voice, owns templates and SEO briefs | Core team |
| **Writer(s)** | Drafts pages from briefs and sources | In-house or freelance (domain knowledge preferred) |
| **Local reviewer** | Checks on the ground: routes, steps, current practice, cultural tone | Based in Varanasi |
| **Fact-checker** | Checks every dated or historical claim against sources; records source and date in the CMS | Separate from the writer |
| **Cultural / religious reviewer** | Reviews temple, cremation-ghat, festival and faith content | Advisor panel (Hindu, Buddhist, Jain and Muslim perspectives as relevant) |
| **Hindi editor** | Writes and reviews Hindi versions | P2 |
| **Operations** | Daily alerts (river, Aarti, closures); partner offerings and verification | City ops team |

The workflow is **Draft → Editorial Review → Fact Verification → Published → Scheduled Review → Updated / Archived**, enforced in the CMS (see [05-cms.md](05-cms.md)). Time-sensitive content can't skip Fact Verification.

## 3.10 Review cadence summary

| Information | Review frequency | Owner |
|---|---|---|
| Alerts (river, Aarti location, closures, crowds) | Per occurrence, each with an expiry | Ops |
| Temple timings, rules, prohibited items | Weekly, and before festivals | Ops + fact-checker |
| Partner offerings, prices, verification status | Monthly, and on any change | Partner manager |
| Emergency numbers and hospitals | Monthly | Fact-checker |
| Heritage site hours and closures | Monthly | Fact-checker |
| Transport, fares, getting around | Monthly | Ops |
| Itineraries | Monthly (and inherits place reviews) | Local reviewer |
| Festivals | 6 weeks before the season; dates per occurrence | Content lead |
| Food and markets | Quarterly | Local reviewer |
| History and culture articles | Yearly | Content lead |
