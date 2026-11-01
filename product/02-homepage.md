# 2. Homepage Content

**Product:** Varanasi Trip Companion
**Positioning:** *Discover the Soul of Varanasi. Plan Smarter. Travel with Confidence.*
**Status:** Product specification v1.0, 1 November 2026. URLs follow [01-sitemap.md](01-sitemap.md).

The homepage is a set of doorways, not an article. Each section is a heading, one or two lines of copy, a row of cards and one clear action. All detail lives on the pages the cards link to.

---

## 2.1 Rules for the homepage

| Rule | Detail |
|---|---|
| Length | Each section description is **two sentences at most**. No paragraphs on the homepage. |
| Cards | 3–6 per section on desktop. On mobile they become a horizontal scroll row with snap. Every card has an image (or icon), a title, one line of copy and a link. |
| One action per section | Each section ends with exactly one text-link or button CTA. |
| Data, not prose | Cards come from the CMS (featured flag + sort order). No card copy is hard-coded. |
| Honesty | No ratings, prices, timings or "verified" badges unless the CMS record holds a current verification. Prices show "Price on request" until set. |
| Motion | Gentle fade-in only. No parallax, no autoplaying video, and `prefers-reduced-motion` is respected. |
| Performance | The hero image is the only above-the-fold image: WebP, `fetchpriority="high"`, sized by `srcset`. Every other image lazy-loads. |

## 2.2 Page order

| # | Section | Purpose |
|---|---|---|
| 0 | Today in Varanasi (alert strip) | Live, verified operating notes |
| 1 | Hero | Promise + the two main actions |
| 2 | Discover Varanasi | Orientation in one breath |
| 3 | Popular Places to Visit | The places almost everyone asks about |
| 4 | Explore by Your Interests | Lets travellers self-select |
| 5 | Plan a Perfect 1, 2 or 3-Day Trip | Core product: itineraries and the planner |
| 6 | Must-Try Local Experiences | Commercial: partner-run, enquirable |
| 7 | Spiritual Varanasi | The pilgrim and seeker segment |
| 8 | Food You Cannot Miss | High search demand, high delight |
| 9 | Famous Markets & Banarasi Silk | Shopping with authenticity guidance |
| 10 | Festivals & Celebrations | Seasonal planning |
| 11 | Trusted Local Services | Commercial: transport, guides, boats, stays |
| 12 | Essential Travel Information | Practical guidance, including emergency |
| 13 | Hidden Gems & Nearby Destinations | Depth, and longer stays |
| 14 | Frequently Asked Questions | Answers common questions (FAQ structured data) |
| 15 | Latest Travel Guides | Freshness (blog / guides) |

"Plan a Perfect Trip" sits fifth, ahead of the commercial sections. The feasibility plan's core metric is itinerary starts, so planning gets the higher slot.

---

## 2.3 Today in Varanasi: the alert strip

A thin bar above the hero. It shows **only when there is at least one active, verified alert**.

| Field | Spec |
|---|---|
| Content | Up to 3 alerts, rotating manually (no autoplay). Example forms: "Boats suspended: the Ganga is above the safe level. Ghat walks are running instead." · "Ganga Aarti has moved up the steps at Dashashwamedh because of high water." · "Heavy crowds expected at Kashi Vishwanath today." |
| Source | CMS → Travel Alerts module. Each alert has: type (river, temple, traffic, weather, festival, safety), message (max 120 characters), severity (info / caution / important), source, verified-at time, expires-at time. |
| Display rule | An alert disappears automatically at `expires_at`. An alert with no verified-at time can't be published. |
| Label | "Verified 6:10 am today" next to each alert, in relative time. |
| Action | "See all updates →" links to `/travel-guide/today`. |
| Accessibility | `role="status"`. Severity "important" uses an icon and text, not colour alone. A dismiss button hides the strip for 12 hours (stored on the device). |
| Empty state | The strip doesn't render. Never show "No alerts" or placeholder text. |

---

## 2.4 Hero

| Element | Content |
|---|---|
| Eyebrow | Varanasi · Kashi · Banaras |
| **Headline (H1)** | **Varanasi Is More Than a Destination. It's an Experience.** |
| **Subheading** | Discover sacred ghats, timeless temples, hidden lanes, local flavours and unforgettable experiences—all in one place. |
| **Primary CTA** | **Plan My Trip** → `/plan/trip-planner` |
| **Secondary CTA** | **Explore Varanasi** → `/explore/` |
| Under the CTAs | A single line of trust signals, each linking to its page: "Verified local partners · Information checked on the ground · Free to plan". The first links to `/about/how-we-verify`. |

**Background visual:**
- **First choice:** `img/ganga_sunrise.jpg`, the sun rising over the Ganga. Alternatives in rotation, up to 4: `img/boats.jpg`, `img/ghats_dawn.jpg`, `img/dev_diwali.jpg`. The rotation pauses on hover or focus, and is off under `prefers-reduced-motion`.
- Serve the responsive WebP set (`-640`, `-1280`, `-1920`). The first frame is the LCP image.
- **Contrast:** a dark gradient scrim from bottom to top, reaching at least 55% opacity behind the text block. Body text must reach 4.5:1 against the darkest *and* lightest part of the image under the text; test both. The headline is white on scrim; the eyebrow and CTAs meet 4.5:1 and 3:1 respectively.
- Decorative image: `alt=""`. The scene is described in the visible copy, not alt text.
- **Mobile:** the image is focused on the ghat steps (`object-position` set per image in the CMS). The headline stays within 3 lines at 360 px wide.

---

## 2.5 Sections

### 2.5.1 Discover Varanasi

> **One of the world's oldest living cities, on the banks of the Ganga.**
> Learn how Kashi, Banaras and Varanasi became one name for faith, learning, music and craft.

| Card | Short copy | Link |
|---|---|---|
| A city of three names | Why Varanasi is also Kashi and Banaras | `/explore/kashi-banaras-varanasi` |
| History through the ages | What archaeology, texts and tradition each tell us | `/explore/history` |
| The Ganga and the ghats | How the riverfront shapes daily life | `/explore/the-ganga` |
| Living heritage | Silk, music and the lanes of the old city | `/explore/banarasi-silk` |

**CTA:** Explore Varanasi → `/explore/`
**Notes:** Image cards use `varanasi`, `harbour`, `ghats_dawn` and `banaras_silk`. The history card must not present tradition as dated fact. Its copy says "what archaeology, texts and tradition each tell us".

### 2.5.2 Popular Places to Visit

> **The places most visitors ask about first.**
> Each guide covers why it matters, how to get there, current visiting rules, and what to do nearby.

| Card | Short copy | Link |
|---|---|---|
| Shri Kashi Vishwanath Temple | The city's most revered temple, and how to visit it calmly | `/places/temples/kashi-vishwanath` |
| Dashashwamedh Ghat | Home of the evening Ganga Aarti | `/places/ghats/dashashwamedh` |
| Assi Ghat | Mornings of music, yoga and river light | `/places/ghats/assi` |
| Sarnath | Where, in Buddhist tradition, the Buddha first taught | `/places/heritage/sarnath` |
| Ramnagar Fort | The riverside fort across the Ganga | `/places/heritage/ramnagar-fort` |
| Sankat Mochan Hanuman Temple | A beloved temple in the south of the city | `/places/temples/sankat-mochan` |

**CTA:** See all places → `/places/`
**Notes:** Each card shows a small "Last verified on [date]" line only when the place record has a current verification (see [05-cms.md](05-cms.md)). Order is set in the CMS.

### 2.5.3 Explore by Your Interests

> **Travel the way that suits you.**
> Pick what moves you and we'll show the places, experiences and plans to match.

| Interest chip | Opens |
|---|---|
| Spiritual & temples | `/things-to-do/temple-circuits` |
| River & ghats | `/places/ghats/` |
| History & heritage | `/places/heritage/` |
| Buddhist Sarnath | `/things-to-do/sarnath-buddhist-tour` |
| Food & street food | `/food/` |
| Silk & crafts | `/shopping/banarasi-silk-sarees` |
| Music & arts | `/explore/music-arts-literature` *(P2; until it's live, link to `/things-to-do/heritage-walks`)* |
| Photography | `/things-to-do/photography-walks` *(P2; until it's live, link to `/travel-guide/responsible-travel`)* |
| Families & seniors | `/travel-guide/families-and-seniors` |

**CTA:** Build a plan around my interests → `/plan/trip-planner` (selected chips are passed as `?interests=`)
**Notes:** Chips are icon + label, two rows on mobile. Selecting one updates a 3-card preview below the chips without reloading the page. Without JavaScript, each chip is a plain link.

### 2.5.4 Plan a Perfect 1, 2 or 3-Day Trip

> **Realistic plans, built by people who know the city.**
> Timings, walking stretches and rest breaks included, so your days flow instead of rush.

| Card | Short copy | Link |
|---|---|---|
| Varanasi in One Day | Sunrise on the river to the evening Aarti | `/plan/itineraries/one-day` |
| Varanasi in Two Days | Ghats, temples, lanes, and a slower second morning | `/plan/itineraries/two-days` |
| Varanasi in Three Days | Add Sarnath and the city's quieter corners | `/plan/itineraries/three-days` |
| Senior-Friendly Varanasi | Fewer steps, more rest, nothing rushed | `/plan/itineraries/senior-friendly` |

**CTA (button):** Make my own plan → `/plan/trip-planner`
**Notes:**
- Cards show the day count and walking intensity (Easy / Moderate / Active), taken from itinerary metadata.
- The planner never claims to account for live crowds or closures. It links to `/travel-guide/today` instead.

### 2.5.5 Must-Try Local Experiences

> **Experiences led by verified local partners.**
> Every partner is identity-checked and held to our service standards. Enquire and we'll confirm the details.

| Card | Short copy | Link |
|---|---|---|
| Sunrise boat ride | Row past the ghats as the city wakes | `/things-to-do/sunrise-boat-ride` → partner offerings on `/experiences/` |
| Ganga Aarti viewing | From the steps or from the river | `/things-to-do/ganga-aarti` |
| Old-city food walk | Kachori, chaat, lassi and paan, with a local | `/things-to-do/food-walks` |
| Silk weaving visit | Meet handloom weavers in Madanpura | `/things-to-do/silk-weaving-visits` |
| Heritage walk | The lanes and stories behind the ghats | `/things-to-do/heritage-walks` |

**CTA:** See all experiences → `/experiences/`
**Notes:**
- A **"Verified partner"** badge appears only on cards linked to at least one partner with an active verification. Otherwise there's no badge.
- Prices show only from verified CMS values: "From ₹X per person". Otherwise "Price on request".
- This section is labelled as commercial with a small "Partner experiences" tag, so it's clearly separate from the editorial sections.

### 2.5.6 Spiritual Varanasi

> **A sacred city to Hindus, Buddhists and Jains.**
> Understand the rituals, visit respectfully, and plan darshan without the confusion.

| Card | Short copy | Link |
|---|---|---|
| Spiritual significance | Why Varanasi holds such meaning | `/explore/spiritual-significance` |
| Temple circuits | Thoughtful routes between the major temples | `/things-to-do/temple-circuits` |
| Spiritual Varanasi in days | A plan for pilgrims and seekers | `/plan/itineraries/spiritual` |
| Visiting temples: current rules | Dress, items not allowed, lockers, queues | `/travel-guide/temple-access-rules` |

**CTA:** Plan a spiritual journey → `/plan/itineraries/spiritual`
**Notes:**
- Image: `kashi_vishwanath` or `monks`.
- The temple-rules card shows its "Last verified" date. If the rules page is past its review date, the card is hidden rather than shown out of date.

### 2.5.7 Food You Cannot Miss

> **Banaras eats in its lanes.**
> From morning kachori to winter malaiyo, here is what to try and where to look.

| Card | Short copy | Link |
|---|---|---|
| Kachori-sabzi & jalebi | The classic Banarasi breakfast | `/food/kachori-sabzi` |
| Tamatar chaat | Tangy, spiced, and very Banarasi | `/food/tamatar-chaat` |
| Malaiyo | A winter-only morning treat | `/food/malaiyo` |
| Lassi & thandai | Cooling drinks in clay cups | `/food/lassi-and-thandai` |
| Banarasi paan | The city's famous finish to a meal | `/food/banarasi-paan` |

**CTA:** Read the food guide → `/food/`
**Notes:**
- Image: `street_food`, `banaras_chai`.
- Seasonal items carry a "Seasonal" label, driven by the item's season field. Malaiyo is labelled "Winter".
- No named shops or stalls on the homepage.

### 2.5.8 Famous Markets & Banarasi Silk

> **Shop where the city has traded for centuries.**
> Learn how to recognise genuine handloom silk and buy in ways that support artisans.

| Card | Short copy | Link |
|---|---|---|
| Banarasi silk saree guide | Handloom, powerloom, and how to tell them apart | `/shopping/banarasi-silk-sarees` |
| Godowlia | The busy heart of the old city's markets | `/markets/godowlia` |
| Vishwanath Gali | The lane of offerings, bangles and souvenirs | `/markets/vishwanath-gali` |
| Madanpura | Lanes where weaving families still work | `/markets/madanpura` |

**CTA:** Shopping & etiquette guide → `/shopping/etiquette-and-authenticity`
**Notes:** Image: `banaras_silk`, `market`. Never call a shop "certified" or "verified" unless the platform has done that verification and the CMS records it.

### 2.5.9 Festivals & Celebrations

> **When the whole city celebrates.**
> Plan around festival crowds, or come for them. Dates appear only once officially confirmed.

| Card | Short copy | Link |
|---|---|---|
| Dev Deepawali | Lamps along the ghats on Kartik Purnima | `/festivals/dev-deepawali` |
| Mahashivratri | The great night of Shiva | `/festivals/mahashivratri` |
| Holi in Varanasi | Colour, music, and practical safety tips | `/festivals/holi` |
| Kartik Purnima | The full-moon festival of the month of Kartik | `/festivals/kartik-purnima` |

**CTA:** See the festival guide → `/festivals/`
**Notes:**
- Cards are ordered by the **next expected season** (the CMS "typical months" field).
- Each card shows "Expected: [month range]" until the CMS holds an officially confirmed date. Then it shows the date with "Confirmed by [source]".
- Image: `dev_diwali`.

### 2.5.10 Trusted Local Services

> **Help on the ground, from people we've checked.**
> Transfers, guides, boats and planning help. Tell us what you need and a verified partner will confirm.

| Card | Short copy | Link |
|---|---|---|
| Airport & station transfers | A known driver waiting when you arrive | `/services/transport/airport-transfer` |
| Local guides | Heritage, temple and Sarnath guides | `/services/guides/` |
| Boat rides | Shared or private boats on the Ganga | `/services/river/boat-rides` |
| Custom itinerary help | A local plans your trip with you | `/services/assistance/custom-itinerary` |

**CTA:** All travel services → `/services/`
**Notes:**
- Each card states the response expectation from the CMS, for example "Reply on WhatsApp within [X] minutes, 6 am–10 pm" [VERIFY: the service level the operations team commits to].
- Enquiries create a tracked lead with a reference code (see [Requirements.md](../Requirements.md)).
- Tagged "Partner services".

### 2.5.11 Essential Travel Information

> **Everything practical, checked and dated.**
> How to arrive, get around, stay safe, and what to know before you visit temples.

| Card | Short copy | Link |
|---|---|---|
| How to reach Varanasi | By air, rail and road | `/travel-guide/how-to-reach` |
| Getting around | Autos, e-rickshaws, and where vehicles stop | `/travel-guide/getting-around` |
| Best time to visit | Seasons, monsoon and festival crowds | `/travel-guide/best-time-to-visit` |
| Emergency contacts | Official numbers and hospitals, saved for offline use | `/travel-guide/emergency` |
| Solo & women travellers | Practical safety, from people who live here | `/travel-guide/solo-and-women-safety` |
| Scams to avoid | Common tricks and how to say no | `/travel-guide/scams-and-touts` |

**CTA:** Open the travel guide → `/travel-guide/`
**Notes:**
- The emergency card uses an icon, never a photo, and is always present.
- It is cached for offline use by the service worker. The cached copy shows its own verification date.

### 2.5.12 Hidden Gems & Nearby Destinations

> **Beyond the ghats.**
> Quieter corners of the city, and places worth a day trip or a longer journey.

| Card | Short copy | Link |
|---|---|---|
| Sarnath Museum | Treasures from the Sarnath excavations | `/places/heritage/sarnath-museum` |
| Dhamek Stupa | The great stupa at the heart of Sarnath | `/places/heritage/dhamek-stupa` |
| Harishchandra Ghat | A ghat of deep tradition. Please visit with care. | `/places/ghats/harishchandra` |
| Chunar Fort *(P2)* | A fort on the Ganga, within a day's reach | `/places/nearby/chunar-fort` |
| Prayagraj *(P2)* | Better as an overnight trip | `/places/nearby/prayagraj` |

**CTA:** Nearby destinations → `/places/nearby/`
**Notes:**
- P2 cards are hidden until their pages are published (CMS status).
- Day trips and intercity trips are labelled differently: "Day trip" vs "Overnight recommended".
- Distances appear only once verified [VERIFY: road distance and typical travel time from central Varanasi, from a dated mapping source].

### 2.5.13 Frequently Asked Questions

> **Quick answers before you go.**

These are rendered as an accordion with `FAQPage` structured data, using only the questions shown on the page. Answers stay general and point to the dated detail page for anything time-sensitive.

| Question | Answer |
|---|---|
| How many days do I need in Varanasi? | Two to three days lets you see the main ghats and temples, take a boat ride, watch the Ganga Aarti and visit Sarnath without rushing. One day covers the essentials if your time is short. [See our ready-made plans →](/plan/itineraries/) |
| When is the best time to visit? | The cooler months are the most comfortable for walking the ghats. The monsoon can raise the river enough to stop boat rides, and festival days bring very large crowds. [See the seasons guide →](/travel-guide/best-time-to-visit) |
| Can I visit Kashi Vishwanath Temple with my phone and bag? | Temple rules on phones, bags and other items change from time to time, and lockers are usually needed. Check our temple guide, which shows when the rules were last verified, before you go. [Current temple rules →](/travel-guide/temple-access-rules) |
| Is it appropriate to visit Manikarnika Ghat? | Manikarnika is an active cremation ghat and a place of grief for families. You can pass respectfully, ideally from a boat and with a knowledgeable local. Never photograph cremations, and politely decline anyone asking for money "for the wood". [How to visit respectfully →](/places/ghats/manikarnika) |
| Do boats run all year? | Boat rides depend on the river. When the Ganga is high, usually during the monsoon, local authorities can suspend boating. Our Today page shows the current status. [Today in Varanasi →](/travel-guide/today) |
| Are your partners verified? | Every partner goes through identity and reference checks and agrees to our service standards before we list them. Each profile shows its verification status and date. [How we verify →](/about/how-we-verify) |
| Is Varanasi safe for solo and women travellers? | Many solo travellers visit comfortably, especially with sensible precautions in crowds and late at night. Our guide covers practical advice, and you can ask for a woman guide. [Safety guide →](/travel-guide/solo-and-women-safety) |
| Does it cost anything to use Varanasi Trip Companion? | Planning, guides and itineraries are free. If you book a local experience or service through an enquiry, the partner confirms the price with you before you commit. |

**CTA:** All FAQs → `/travel-guide/faq`

### 2.5.14 Latest Travel Guides

> **Fresh from the ghats.**
> New guides, seasonal tips and stories from travellers and our local team.

**Cards:** the three most recently published or updated items from `/blog/` and `/travel-guide/`, sorted by updated date. Each card shows "Updated [date]".
**CTA:** All guides → `/blog/` *(P2. Until the blog launches, this section shows the three most recently updated `/travel-guide/` pages and links to `/travel-guide/`.)*
**Notes:**
- No fake stories.
- Traveller stories need written consent and a real trip record (see [03-content-strategy.md](03-content-strategy.md)).

---

## 2.6 Closing band (above the footer)

> **Ready to plan your Varanasi?**
> Tell us your dates and interests. We'll help you build a realistic plan, and connect you with a verified local if you'd like one.

**Buttons:** Plan My Trip → `/plan/trip-planner` · Chat on WhatsApp → `/about/contact` (opens WhatsApp with a prefilled message and a reference code; see Requirements).

## 2.7 Homepage SEO

| Item | Value |
|---|---|
| `<title>` | Varanasi Travel Guide & Trip Planner — Varanasi Trip Companion |
| Meta description | Plan your Varanasi trip with verified, up-to-date guidance on ghats, temples, Ganga Aarti, food and Sarnath, plus trusted local experiences and services. |
| H1 | Varanasi Is More Than a Destination. It's an Experience. |
| Structured data | `WebSite` (with `SearchAction` → `/search?q=`), `Organization` / `TravelAgency` (areaServed: Varanasi), `FAQPage` (section 2.5.13 only) |
| Canonical | `/` |
| Hindi | `/hi/` with `hreflang` pairs (P2) |
