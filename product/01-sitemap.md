# 1. Website Sitemap and Information Architecture

**Product:** Varanasi Trip Companion
**Positioning:** *Discover the Soul of Varanasi. Plan Smarter. Travel with Confidence.*
**Status:** Product specification v1.0, 1 November 2026. It supersedes the page structure of the current prototype (`docs/`).

Every other document in `product/` uses the URL slugs defined here. Change them here first.

---

## 1.1 Principles

1. **Two kinds of page, kept apart.** *Knowledge pages* are free, informational and unbiased: places, history, food, festivals, guides. *Commercial pages* are partner-run offerings with an enquiry: Local Experiences and Travel Services. A traveller should always be able to tell which kind they are reading.
2. **Short landing pages, deep detail pages.** Hubs show cards and a one-line description. The detail lives one click below.
3. **Every page links somewhere useful next.** Each place links to things to do there, itineraries that include it, and services that get you there.
4. **Readable, stable URLs.** Lowercase and hyphenated, with no dates or IDs, so a URL can live forever.
5. **Mobile first.** At most 5 top-level menu items, plus search and one primary call to action.

## 1.2 Main navigation

The brief's 11 sections are grouped into 5 menus, so the bar stays short on a phone.

| Top-level (visible) | Dropdown contents | Brief section |
|---|---|---|
| **Explore** ▾ | Explore Varanasi (history and culture hub) · Places to Visit · Festivals & Culture · Food & Shopping | 2, 3, 8, 9 |
| **Things to Do** ▾ | Things to Do (activity guides) · Local Experiences (partner-run, enquirable) | 4, 6 |
| **Plan** ▾ | Plan Your Trip (itineraries and planner) · Travel Guide (essentials, alerts, emergency) | 5, 10 |
| **Services** ▾ | Transport · Guides & Tours · River Experiences · Stays · Travel Assistance | 7 |
| **About** ▾ | About Us · How We Verify · Partner With Us · Contact | 11 |
| 🔍 Search | Universal search covering places, guides, experiences, services, itineraries and festivals | |
| **Plan My Trip** (primary button) | Opens the trip planner | |

**Header behaviour:**
- Sticky, and shrinks on scroll.
- On mobile: a menu button opens a full-height drawer with one accordion per menu. Search stays visible at the top.
- Desktop dropdowns open on hover or focus, and close with Escape.
- Includes a language switch (EN / हिंदी).

**Footer:**
- Explore links, Plan links and Services links.
- A "Today in Varanasi" alerts link.
- An emergency-contacts link, always visible.
- About, Partner With Us, Privacy, Terms, Cancellation Policy.
- Photo credits.

## 1.3 Full sitemap

Legend:
- **[MVP]** Phase 1
- **[P2]** Phase 2
- **[F]** Future
- *(hub)* A listing or landing page
- *(detail)* An individual page

```
/                                         Home                                      [MVP]
/search                                   Universal search results                  [MVP]

── EXPLORE ─────────────────────────────────────────────────────────────────────────────
/explore/                                 Explore Varanasi (hub)                    [MVP]
  /explore/introduction                   Introduction to Varanasi                  [MVP]
  /explore/history                        History through the ages                  [MVP]
  /explore/kashi-banaras-varanasi         The names Kashi, Banaras and Varanasi     [MVP]
  /explore/spiritual-significance         Religious & spiritual significance        [MVP]
  /explore/hindu-traditions               Varanasi in Hindu traditions              [P2]
  /explore/buddhism-and-jainism           Varanasi in Buddhism and Jainism          [MVP]
  /explore/the-ganga                      The Ganga and the riverfront              [MVP]
  /explore/history-of-the-ghats           History and importance of the ghats       [MVP]
  /explore/architecture-and-lanes         Architecture and the narrow lanes (galis) [P2]
  /explore/learning-and-heritage          Cultural and educational heritage         [P2]
  /explore/banaras-hindu-university       Banaras Hindu University                  [P2]
  /explore/music-arts-literature          Music, classical arts and literature      [P2]
  /explore/banarasi-silk                  Banarasi silk and weaving traditions      [MVP]
  /explore/crafts                         Local craftsmanship                       [P2]
  /explore/food-culture                   Traditional food culture                  [P2]
  /explore/everyday-life                  Everyday life in Varanasi                 [F]
  /explore/modern-varanasi                Modern Varanasi and tourism               [F]

/places/                                  Places to Visit (directory, filterable)   [MVP]
  /places/temples/                        Temples (hub)                             [MVP]
    /places/temples/kashi-vishwanath      Shri Kashi Vishwanath Temple              [MVP]
    /places/temples/sankat-mochan         Sankat Mochan Hanuman Temple              [MVP]
    /places/temples/durga-kund            Durga Kund Temple                         [MVP]
    /places/temples/kaal-bhairav          Kaal Bhairav Temple                       [MVP]
    /places/temples/annapurna             Annapurna Temple                          [P2]
    /places/temples/tulsi-manas           Tulsi Manas Temple                        [P2]
    /places/temples/new-vishwanath-bhu    New Vishwanath Temple, BHU                [MVP]
    /places/temples/mrityunjay-mahadev    Mrityunjay Mahadev Temple                 [P2]
  /places/ghats/                          Ghats (hub, with a riverfront map)        [MVP]
    /places/ghats/dashashwamedh           Dashashwamedh Ghat                        [MVP]
    /places/ghats/assi                    Assi Ghat                                 [MVP]
    /places/ghats/manikarnika             Manikarnika Ghat                          [MVP]
    /places/ghats/harishchandra           Harishchandra Ghat                        [MVP]
    /places/ghats/namo                    Namo Ghat                                 [P2]
    /places/ghats/panchganga              Panchganga Ghat                           [P2]
    /places/ghats/kedar                   Kedar Ghat                                [P2]
    /places/ghats/tulsi                   Tulsi Ghat                                [P2]
    /places/ghats/raj                     Raj Ghat                                  [P2]
    /places/ghats/chet-singh              Chet Singh Ghat                           [P2]
    /places/ghats/scindia                 Scindia Ghat                              [P2]
    /places/ghats/ahilyabai               Ahilyabai Ghat                            [P2]
  /places/heritage/                       Historical & cultural attractions (hub)   [MVP]
    /places/heritage/ramnagar-fort        Ramnagar Fort                             [MVP]
    /places/heritage/sarnath              Sarnath archaeological complex            [MVP]
    /places/heritage/dhamek-stupa         Dhamek Stupa                              [MVP]
    /places/heritage/chaukhandi-stupa     Chaukhandi Stupa                          [P2]
    /places/heritage/mulagandha-kuti-vihara  Mulagandha Kuti Vihara                 [P2]
    /places/heritage/sarnath-museum       Sarnath Museum                            [MVP]
    /places/heritage/bharat-kala-bhavan   Bharat Kala Bhavan (BHU)                  [P2]
    /places/heritage/bharat-mata-temple   Bharat Mata Temple                        [P2]
    /places/heritage/alamgir-mosque       Alamgir Mosque                            [F]
    /places/heritage/jantar-mantar        Jantar Mantar at Man Mahal                [P2]
  /places/nearby/                         Nearby destinations (hub)                 [MVP]
    Short excursions (same day):
    /places/nearby/sarnath                → canonical: /places/heritage/sarnath (cross-listed, not duplicated)
    /places/nearby/chunar-fort            Chunar Fort                               [P2]
    /places/nearby/vindhyachal            Vindhyachal                               [P2]
    Intercity trips (overnight recommended):
    /places/nearby/prayagraj              Prayagraj                                 [P2]
    /places/nearby/bodh-gaya              Bodh Gaya                                 [F]
    /places/nearby/gaya                   Gaya                                      [F]
    /places/nearby/ayodhya                Ayodhya                                   [F]

/festivals/                               Festivals & Culture (hub with calendar)   [MVP]
  /festivals/dev-deepawali                Dev Deepawali                             [MVP]
  /festivals/kartik-purnima               Kartik Purnima                            [MVP] (shared page with Dev Deepawali if editorial prefers)
  /festivals/mahashivratri                Mahashivratri                             [MVP]
  /festivals/holi                         Holi in Varanasi                          [MVP]
  /festivals/ganga-mahotsav               Ganga Mahotsav                            [P2]
  /festivals/nag-nathaiya                 Nag Nathaiya                              [P2]
  /festivals/ramnagar-ramlila             Ramnagar Ramlila                          [P2]
  /festivals/buddha-purnima-sarnath       Buddhist observances in Sarnath           [P2]
  /festivals/sawan                        Sawan (Shravan) month                     [P2]
  /festivals/calendar                     Events calendar (only confirmed dates)    [P2]

/food-and-shopping/                       Food & Shopping (hub)                     [MVP]
  /food/                                  Banarasi food guide (hub)                 [MVP]
    /food/kachori-sabzi                   Banarasi kachori-sabzi & jalebi           [MVP]
    /food/tamatar-chaat                   Tamatar chaat                             [MVP]
    /food/chooda-matar                    Chooda matar                              [P2]
    /food/malaiyo                         Malaiyo (winter)                          [MVP]
    /food/lassi-and-thandai               Lassi and thandai                         [MVP]
    /food/banarasi-paan                   Banarasi paan                             [MVP]
    /food/baati-chokha                    Baati chokha                              [P2]
    /food/sweets                          Rabri and traditional sweets              [P2]
    /food/vegetarian-meals                Local vegetarian meals (thali)            [P2]
    /food/food-areas                      Where to eat: food areas, not shop lists  [MVP]
  /shopping/                              Shopping guide (hub)                      [MVP]
    /shopping/banarasi-silk-sarees        Banarasi silk sarees: buying guide        [MVP]
    /shopping/brocade-and-handloom        Brocade, handloom & textiles              [P2]
    /shopping/handicrafts                 Handicrafts, wooden toys & souvenirs      [P2]
    /shopping/religious-goods             Religious goods                           [P2]
    /shopping/musical-instruments         Traditional musical instruments           [F]
    /shopping/jewellery                   Traditional jewellery                     [F]
    /shopping/etiquette-and-authenticity  Bargaining, authenticity, artisans        [MVP]
  /markets/                               Markets (hub)                             [MVP]
    /markets/godowlia                     Godowlia                                  [MVP]
    /markets/vishwanath-gali              Vishwanath Gali                           [MVP]
    /markets/chowk                        Chowk                                     [P2]
    /markets/thatheri-bazaar              Thatheri Bazaar                           [P2]
    /markets/madanpura                    Madanpura                                 [MVP]
    /markets/lahurabir                    Lahurabir                                 [F]

── THINGS TO DO ────────────────────────────────────────────────────────────────────────
/things-to-do/                            Things to Do (hub, filter by interest)    [MVP]
  /things-to-do/sunrise-boat-ride         Sunrise boat rides                        [MVP]
  /things-to-do/sunset-boat-ride          Sunset boat rides                         [MVP]
  /things-to-do/ganga-aarti               Watching the Ganga Aarti                  [MVP]
  /things-to-do/morning-ghat-walk         Morning walk along the ghats              [MVP]
  /things-to-do/heritage-walks            Heritage walking tours                    [MVP]
  /things-to-do/temple-circuits           Temple pilgrimage circuits                [MVP]
  /things-to-do/sarnath-buddhist-tour     Sarnath heritage & Buddhist tours         [MVP]
  /things-to-do/food-walks                Traditional food walks                    [MVP]
  /things-to-do/silk-weaving-visits       Banarasi silk weaving visits              [MVP]
  /things-to-do/handicraft-workshops      Handicraft workshops                      [P2]
  /things-to-do/classical-music           Classical music experiences               [P2]
  /things-to-do/photography-walks         Photography walks (with etiquette)        [P2]
  /things-to-do/yoga-and-meditation       Yoga and meditation                       [P2]
  /things-to-do/market-exploration        Local market exploration                  [P2]
  /things-to-do/festival-experiences      Festival experiences                      [P2]

/experiences/                             Local Experiences (partner-run, enquiry)  [MVP]
  /experiences/<slug>                     e.g. /experiences/sunrise-rowing-boat-assi
                                          Each is a specific offering by a verified
                                          partner, linked from the matching
                                          /things-to-do/ guide.

── PLAN ────────────────────────────────────────────────────────────────────────────────
/plan/                                    Plan Your Trip (hub)                      [MVP]
  /plan/trip-planner                      Interactive trip planner                  [MVP]
  /plan/my-trips                          Saved itineraries (device, then account)  [MVP]
  /plan/trip/<share-id>                   Shared itinerary (read-only, noindex)     [MVP]
  /plan/itineraries/                      Ready-made plans (hub)                    [MVP]
    /plan/itineraries/one-day             Varanasi in One Day                       [MVP]
    /plan/itineraries/two-days            Varanasi in Two Days                      [MVP]
    /plan/itineraries/three-days          Varanasi in Three Days                    [MVP]
    /plan/itineraries/spiritual           Spiritual Varanasi                        [MVP]
    /plan/itineraries/with-sarnath        Varanasi with Sarnath                     [MVP]
    /plan/itineraries/families            Varanasi for Families                     [P2]
    /plan/itineraries/senior-friendly     Senior-Friendly Varanasi                  [MVP]
    /plan/itineraries/solo                Solo Traveller's Varanasi                 [P2]
    /plan/itineraries/heritage            Cultural and Heritage Varanasi            [P2]
    /plan/itineraries/food-and-markets    Food and Market Exploration               [P2]

/travel-guide/                            Travel Guide (hub)                        [MVP]
  /travel-guide/today                     Today in Varanasi: live alerts            [MVP]
  /travel-guide/emergency                 Emergency contacts & hospitals            [MVP]
  /travel-guide/how-to-reach              How to reach (air, rail, road)            [MVP]
  /travel-guide/airport                   Airport information                       [MVP]
  /travel-guide/railway-stations          Railway stations                          [MVP]
  /travel-guide/best-time-to-visit        Best seasons to visit                     [MVP]
  /travel-guide/weather-and-monsoon       Weather & monsoon                         [MVP]
  /travel-guide/what-to-pack              What to pack                              [P2]
  /travel-guide/getting-around            Local transport & fares guidance          [MVP]
  /travel-guide/last-mile-walking         Last-mile walking: where vehicles stop    [MVP]
  /travel-guide/money-and-upi             Cash, UPI and payments                    [P2]
  /travel-guide/connectivity              Mobile connectivity & SIMs                [P2]
  /travel-guide/food-and-water-safety     Drinking water & food safety              [MVP]
  /travel-guide/responsible-travel        Responsible & respectful travel           [MVP]
  /travel-guide/solo-and-women-safety     Solo-travel safety                        [MVP]
  /travel-guide/families-and-seniors      Family & senior-friendly travel           [MVP]
  /travel-guide/accessibility             Accessibility                             [P2]
  /travel-guide/temple-access-rules       Current temple & festival access rules    [MVP]
  /travel-guide/scams-and-touts           Common scams and how to avoid them        [MVP]
  /travel-guide/faq                       Frequently asked questions                [MVP]

/blog/                                    Latest travel guides & stories            [P2]
  /blog/<slug>

── SERVICES ────────────────────────────────────────────────────────────────────────────
/services/                                Travel Services (hub)                     [MVP]
  /services/transport/                    Local transport                           [MVP]
    /services/transport/airport-transfer
    /services/transport/railway-transfer
    /services/transport/car-hire
    /services/transport/sightseeing
    /services/transport/outstation                                                  [P2]
    (auto and e-rickshaw information lives at /travel-guide/getting-around: guidance, not a service)
  /services/guides/                       Tours & guides                            [MVP]
    /services/guides/heritage-guides
    /services/guides/temple-tours
    /services/guides/sarnath-guides
    /services/guides/walking-tours
    /services/guides/private-group-tours                                            [P2]
  /services/river/                        River experiences                         [MVP]
    /services/river/boat-rides
    /services/river/private-boats
    /services/river/group-boats
  /services/stays/                        Accommodation referrals                   [P2]
    /services/stays/hotels · /homestays · /guesthouses · /family-stays
  /services/assistance/                   Travel assistance                         [MVP]
    /services/assistance/custom-itinerary
    /services/assistance/families
    /services/assistance/senior-friendly
    /services/assistance/group-pilgrimage                                           [P2]
    /services/assistance/accessibility                                              [P2]
  /partners/<slug>                        Verified partner profile                  [P2]
  /enquiry                                Generic enquiry form (prefilled by context) [MVP]
  /enquiry/thank-you                      Confirmation with reference code          [MVP]

── ABOUT ───────────────────────────────────────────────────────────────────────────────
/about/                                   About Us                                  [MVP]
  /about/how-we-verify                    Our verification standards                [MVP]
  /about/partner-with-us                  Partner application (all partner types)   [MVP]
  /about/service-standards                What travellers can expect from partners  [MVP]
  /about/contact                          Contact & WhatsApp                        [MVP]
  /about/complaints                       Raise a complaint                         [MVP]
/privacy  /terms  /cancellation-policy    Legal                                     [MVP]

── HINDI ───────────────────────────────────────────────────────────────────────────────
/hi/…                                     Mirror of the English URL tree for every
                                          page that has a reviewed Hindi version
                                          (hreflang-linked)                         [P2]

── ACCOUNT & ADMIN (not indexed) ───────────────────────────────────────────────────────
/account/                                 Sign in (phone OTP), saved trips          [P2]
/admin/                                   CMS & operations console                  [MVP]
```

## 1.4 "Things to Do", "Local Experiences" and "Services": how they differ

| | Things to Do | Local Experiences | Travel Services |
|---|---|---|---|
| **Question it answers** | "What is a sunrise boat ride and how do I do it well?" | "Book *this* sunrise boat ride with *this* verified boatman" | "I need an airport pickup / a guide / a stay" |
| **Content type** | Editorial guide (neutral) | Partner offering | Service category with matching partners |
| **Commercial?** | No. It links to experiences and services. | Yes. Tracked enquiry. | Yes. Tracked enquiry. |
| **Example** | `/things-to-do/sunrise-boat-ride` | `/experiences/sunrise-rowing-boat-assi` | `/services/river/boat-rides` |

## 1.5 Mapping from the current prototype

The current site in `docs/` has 20 pages. Each one maps to a new URL, and old URLs get 301 redirects (or `<meta refresh>` + canonical on static hosting).

| Current | New |
|---|---|
| `index.html` | `/` |
| `why-buddy.html` | `/about/how-we-verify` + `/about/service-standards` |
| `buddies.html` | `/services/guides/` |
| `stories.html` | `/blog/` (only real, consented traveller stories) |
| `become-a-buddy.html` | `/about/partner-with-us` |
| `plan.html` | `/plan/` |
| `experiences.html` + 6 experience pages | `/things-to-do/` + matching `/things-to-do/<slug>` guides; partner offerings move to `/experiences/` |
| `login.html`, `signup.html` | `/account/` (Phase 2; travellers don't need accounts in the MVP) |
| `privacy.html`, `terms.html`, `refund-policy.html` | `/privacy`, `/terms`, `/cancellation-policy` |

## 1.6 Page counts

| Phase | Knowledge pages | Commercial pages | Total |
|---|---|---|---|
| **MVP** | ~83 (including hub pages; see [07-content-priorities.md](07-content-priorities.md)) | ~20 (service categories + first experiences) | **~100** (the top of the feasibility plan's 50–100 range) |
| **P2** | ~55 | Partner profiles | ~60+ |
| **Future** | ~15 | | ~15 |
