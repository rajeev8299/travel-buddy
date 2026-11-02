import type { Guide } from "./types";

// Travel Guide — practical essentials (product/01-sitemap.md /travel-guide/*).
// "today" is not here: it is rendered from live alerts (FR-GUIDE-02).
// Rules: no invented phone numbers, distances, fares or timings. Anything that
// must be checked carries a [VERIFY: … — source] marker, rendered on the page
// as "being verified". The only number stated as fact is 112, India's
// national emergency number.

export const GUIDES: Guide[] = [
  // ------------------------------------------------------------ essentials
  {
    slug: "emergency",
    group: "essentials",
    title: "Emergency contacts & hospitals",
    summary: "Who to call in an emergency in Varanasi, where to find medical help, and what to do if something goes wrong.",
    image: { src: "/img/varanasi.jpg", alt: "The Varanasi riverfront on a clear day" },
    status: "review",
    sources: [
      { title: "Emergency Response Support System (112)", publisher: "Ministry of Home Affairs, Government of India" },
      { title: "Varanasi district administration — official website", publisher: "Government of Uttar Pradesh" },
      { title: "Uttar Pradesh Police — official website", publisher: "Government of Uttar Pradesh" },
    ],
    sections: [
      {
        heading: "In an emergency, call 112",
        body: `**112** is India's single national emergency number. It connects you to police, fire and ambulance services, and it works from any mobile phone.

- Say clearly that you are in **Varanasi** and give a landmark: the ghat name, the temple, the hotel or the nearest crossing (for example Godowlia).
- If you can, share your live location with a companion or your hotel.
- Keep this page saved on your phone. It also works offline once you have opened it.`,
      },
      {
        heading: "Other helplines",
        body: `These numbers are being checked against official sources before we publish them.

| Service | Number |
|---|---|
| Ambulance (Uttar Pradesh) | [VERIFY: state ambulance number — UP health department] |
| Women's helpline | [VERIFY: UP women's helpline number — UP Police] |
| Tourist helpline | [VERIFY: national tourist helpline — Ministry of Tourism] |
| Tourist police, Varanasi | [VERIFY: local tourist police contact — Varanasi Police] |
| Railway helpline | [VERIFY: railway passenger helpline — Indian Railways] |`,
      },
      {
        heading: "Hospitals and medical help",
        body: `Varanasi has large government and private hospitals, including the hospital of Banaras Hindu University. We list specific hospitals, addresses and casualty-department contacts only after checking them with the hospitals themselves.

- Major hospitals with 24-hour emergency departments: [VERIFY: names, addresses and emergency numbers — hospital websites / district health office]
- Pharmacies are common across the city; for prescription medicines carry your prescription.
- Heat, dehydration and stomach upsets are the most common traveller problems. Drink safe water and rest in the hottest hours.`,
      },
      {
        heading: "If you lose something or are robbed",
        body: `- Report it at the nearest police station or through 112. Ask for a written record of your complaint — you may need it for insurance or a replacement passport.
- Foreign nationals who lose a passport should contact their embassy or consulate. [VERIFY: process for a lost passport report — Ministry of External Affairs / FRRO]
- Block lost cards and UPI apps immediately through your bank.`,
      },
      {
        heading: "Contact us during your trip",
        body: `If you booked a service through us, contact our support team on WhatsApp or by email with your booking reference. We aim to reply within 10 minutes between 6am and 10pm. For anything urgent or unsafe, call **112** first.`,
      },
    ],
    faqs: [
      { q: "What number do I call in an emergency in Varanasi?", a: "Call 112, India's national emergency number. It reaches police, fire and ambulance services from any phone." },
      { q: "Does 112 work without a local SIM?", a: "Emergency calls generally work from any mobile phone in India, but we are confirming how it behaves on foreign roaming SIMs before stating it as fact." },
    ],
  },
  {
    slug: "temple-access-rules",
    group: "essentials",
    title: "Current temple & festival access rules",
    summary: "Phones, bags, dress and queue rules change often in Varanasi's busiest temples. Here is how to check what applies on your day.",
    image: { src: "/img/ganga_aarti.jpg", alt: "Priests performing the Ganga Aarti with raised brass lamps at night" },
    status: "review",
    sources: [
      { title: "Shri Kashi Vishwanath Temple Trust — official notices", publisher: "Shri Kashi Vishwanath Temple Trust" },
      { title: "Varanasi Police — traffic and security advisories" },
    ],
    sections: [
      {
        heading: "Why these rules change",
        body: `Security, crowd management and festival arrangements in Varanasi are adjusted often — sometimes the same week. Rules for phones, bags, queues and vehicle access around the old city can change for Mondays, festivals and VIP visits. That is why we show every rule with the date it was last checked.`,
      },
      {
        heading: "Shri Kashi Vishwanath Temple",
        body: `| Rule | Current position |
|---|---|
| Phones, cameras, bags | [VERIFY: current rule and locker availability — Shri Kashi Vishwanath Temple Trust] |
| Dress code | [VERIFY: current guidance — temple trust] |
| Darshan timings and Aarti | [VERIFY: current schedule — temple trust website] |
| Paid / quick darshan options | [VERIFY: current options and booking method — temple trust website] |
| Entry for foreign nationals | [VERIFY: current procedure — temple trust] |

See the full [Kashi Vishwanath visitor guide](/places/temples/kashi-vishwanath).`,
      },
      {
        heading: "Ghats and the Ganga Aarti",
        body: `- The ghats are open public spaces with no ticket.
- On festival nights, police may close roads near Dashashwamedh and restrict access to some steps. [VERIFY: festival traffic plan — Varanasi Police advisories]
- When the Ganga is in flood, the Aarti usually moves higher up the steps and boating may be suspended by the district administration.`,
      },
      {
        heading: "How to check on the day",
        body: `1. Look at **[Today in Varanasi](/travel-guide/today)** for our latest checked alerts.
2. Check the official temple trust website or notice board.
3. Ask at your hotel or your buddy — they will know about local closures.
4. On Mondays, in the month of Sawan and on Mahashivratri, expect much longer queues and stricter security.`,
      },
    ],
    faqs: [
      { q: "Can I take my phone into Kashi Vishwanath Temple?", a: "Rules on phones and bags are set by the temple trust and can change. We are verifying the current rule; check the trust's official notices before you go." },
    ],
  },
  {
    slug: "responsible-travel",
    group: "essentials",
    title: "Responsible & respectful travel",
    summary: "How to visit a living sacred city with respect — at temples, on the ghats, at the cremation ghats and in people's neighbourhoods.",
    image: { src: "/img/varanasi.jpg", alt: "Stone ghat steps beside the Ganga in Varanasi" },
    status: "review",
    sections: [
      {
        heading: "A living city, not a museum",
        body: `Varanasi is a place where people pray, bathe, work, grieve and live. Most visitors are welcomed warmly. A little care about how you dress, photograph and move through sacred spaces makes a real difference to the people who live here.`,
      },
      {
        heading: "At temples",
        body: `- Dress modestly: shoulders and knees covered.
- Remove shoes where others do, and follow signs about who may enter which areas.
- Follow the rules on phones, cameras and bags — they are set by each temple. See [temple access rules](/travel-guide/temple-access-rules).
- Don't touch idols or offerings unless invited to.`,
      },
      {
        heading: "At the cremation ghats",
        body: `Manikarnika and Harishchandra are working cremation grounds where families say goodbye to loved ones.

- **Never photograph or film cremations or mourners.**
- Keep a respectful distance, speak quietly and don't block the way.
- Decline anyone who offers to "explain" the rites in exchange for money. If you want to understand them, ask a verified guide in advance.

Read our guide to [visiting Manikarnika respectfully](/places/ghats/manikarnika).`,
      },
      {
        heading: "Photography with consent",
        body: `- Ask before photographing people, especially sadhus, bathers and women. Some will ask for money; it is fine to say no and not take the picture.
- Avoid photographing people bathing or performing rituals at close range.
- Drones need official permission. [VERIFY: current drone rules for Varanasi — DGCA / district administration]`,
      },
      {
        heading: "Leave less behind",
        body: `- Carry a refillable bottle and avoid single-use plastic, especially on the river.
- Don't throw anything into the Ganga — offerings are part of worship for devotees, but litter is not.
- Buy directly from artisans and pay fair prices. See our [shopping etiquette guide](/shopping/etiquette-and-authenticity).`,
      },
    ],
  },
  {
    slug: "faq",
    group: "essentials",
    title: "Frequently asked questions",
    summary: "Quick answers to the questions travellers ask most often about visiting Varanasi.",
    image: { src: "/img/boats.jpg", alt: "Boats along the ghats of Varanasi" },
    status: "review",
    sections: [
      {
        heading: "Can't find your answer?",
        body: `Search the site, read the full [Travel Guide](/travel-guide), or [send us an enquiry](/enquiry) — a person from our Varanasi team will reply.`,
      },
    ],
    faqs: [
      { q: "How many days do I need in Varanasi?", a: "Two to three days is enough to see the ghats, a sunrise boat ride, the evening Ganga Aarti, the old city and a half-day at Sarnath without rushing. One day covers the essentials. See our ready-made 1, 2 and 3-day plans." },
      { q: "What is the best time of year to visit?", a: "October to March is the most comfortable and the busiest season. April to June is very hot, and in the monsoon (roughly July to September) the river can flood and boat rides may be suspended. See our best-time-to-visit guide." },
      { q: "Is Varanasi safe for solo and women travellers?", a: "Most visitors have safe, rewarding trips. Take ordinary city precautions: avoid empty lanes and ghats late at night, use known transport, and be firm with touts. Our solo-travel safety guide has practical advice." },
      { q: "Do I need a guide?", a: "Not to walk the ghats. A good local guide helps most in the old city's lanes, at temples where rules change often, and at Sarnath. If you hire one, arrange it in advance rather than accepting offers on the street." },
      { q: "When is the Ganga Aarti?", a: "The main Aarti at Dashashwamedh takes place every evening around sunset, so the start time moves with the season. We publish the current time only after confirming it with the organisers." },
      { q: "How much does a boat ride cost?", a: "Prices depend on the boat type, group size, duration and season, and we only publish fares we have verified. Agree the price, route and duration before you board." },
      { q: "Can non-Hindus visit Kashi Vishwanath Temple?", a: "Entry procedures for different visitors are set by the temple trust. We are verifying the current position — please check the trust's official notices." },
      { q: "Can I photograph the cremation ghats?", a: "No. Do not photograph or film cremations or mourners at Manikarnika or Harishchandra Ghat. These are places of grief for families." },
      { q: "Is the water safe to drink?", a: "Drink sealed bottled water or water from a filter you trust. Avoid tap water and ice of unknown origin. See our food and water safety guide." },
      { q: "Can cars reach the ghats?", a: "Usually not. Vehicles stop on the main roads, and the last stretch to most ghats and old-city hotels is on foot through narrow lanes. Our last-mile walking guide explains where vehicles stop." },
      { q: "Can I pay by UPI?", a: "UPI is widely used in Varanasi, from shops to many small stalls. Carry some cash as well, especially for boats, small vendors and temple offerings." },
      { q: "How far is Sarnath and how long should I spend there?", a: "Sarnath is a short drive north-east of the city. Plan half a day including travel. We publish the exact distance and travel time once verified." },
      { q: "What should I wear?", a: "Light, breathable clothes that cover shoulders and knees — this works for temples and is comfortable in the heat. In winter, mornings on the river are cold; bring a warm layer." },
      { q: "Do I need to book anything in advance?", a: "Most things can be arranged a day ahead. Book early for festivals such as Dev Deepawali, for boats on festival evenings, and for rooms near the ghats in peak season." },
      { q: "Is your information up to date?", a: "Every practical detail shows the date it was last verified. Anything not yet confirmed is marked 'being verified'. Rules and timings can change on the day — always check official notices." },
    ],
  },

  // ---------------------------------------------------------- getting here
  {
    slug: "how-to-reach",
    group: "getting-here",
    title: "How to reach Varanasi",
    summary: "By air, rail and road — the airport, the main railway stations and what to expect when you arrive.",
    image: { src: "/img/varanasi.jpg", alt: "The Varanasi riverfront" },
    status: "review",
    sources: [
      { title: "Airports Authority of India — Varanasi airport" },
      { title: "Indian Railways — official enquiry and booking services" },
    ],
    sections: [
      {
        heading: "By air",
        body: `Varanasi is served by **Lal Bahadur Shastri International Airport at Babatpur**, outside the city. It has domestic flights to major Indian cities and some international connections. [VERIFY: current routes — Airports Authority of India / airlines]

The drive from the airport to the ghats takes [VERIFY: typical travel time and distance — mapped route]. See our [airport guide](/travel-guide/airport).`,
      },
      {
        heading: "By train",
        body: `Varanasi is a major rail hub. The stations most visitors use are:

- **Varanasi Junction** — the main station, in the city.
- **Banaras** station — in the city.
- **Pt. Deen Dayal Upadhyaya Junction** — a major junction outside the city, on many long-distance routes.

Check which station your train uses — they are in different places. See our [railway stations guide](/travel-guide/railway-stations).`,
      },
      {
        heading: "By road",
        body: `Varanasi is connected by national highways and intercity buses to cities across Uttar Pradesh and neighbouring states, including Prayagraj, Lucknow and Bodh Gaya. [VERIFY: current bus services and terminals — UPSRTC]

Private cars and taxis can be arranged for intercity trips. Drive times vary a lot with traffic and road works, so allow extra time.`,
      },
      {
        heading: "When you arrive",
        body: `- Pre-arrange your pickup, or use official prepaid / app-based taxis where available. Agree the fare before you set off.
- Your car will probably stop some distance from a ghat-side hotel — the last stretch is on foot. See [last-mile walking](/travel-guide/last-mile-walking).
- Share your hotel's exact name and nearest landmark with your driver.`,
      },
    ],
  },
  {
    slug: "airport",
    group: "getting-here",
    title: "Airport information",
    summary: "Lal Bahadur Shastri International Airport at Babatpur: getting into the city, transfers and tips on arrival.",
    image: { src: "/img/varanasi.jpg", alt: "Varanasi on a clear day" },
    status: "review",
    sources: [{ title: "Airports Authority of India — Varanasi airport", publisher: "Airports Authority of India" }],
    sections: [
      {
        heading: "About the airport",
        body: `Varanasi's airport is **Lal Bahadur Shastri International Airport**, at **Babatpur**, north-west of the city.

| | |
|---|---|
| Distance to the ghats | [VERIFY: distance — mapped route] |
| Typical drive time | [VERIFY: typical travel time — mapped route; varies with traffic] |
| Airport facilities | [VERIFY: current facilities — Airports Authority of India] |`,
      },
      {
        heading: "Getting into the city",
        body: `- **Pre-booked transfer:** the simplest option, especially if you arrive late or are staying near the ghats. You can [enquire about an airport transfer](/services/transport/airport-transfer).
- **Taxis at the airport:** [VERIFY: prepaid taxi counter and app-cab availability — airport operator]
- Allow extra time in the opposite direction: city traffic near the old city can be slow, particularly in the evening and on festival days.`,
      },
      {
        heading: "Arrival tips",
        body: `- Keep your hotel's exact name, address and nearest landmark handy.
- Cars usually cannot reach hotels in the old-city lanes. Ask your hotel where the car will stop and whether someone can meet you.
- If a driver tells you your hotel is "closed" or "full", call the hotel yourself — this is a common tout trick.`,
      },
    ],
  },
  {
    slug: "railway-stations",
    group: "getting-here",
    title: "Railway stations",
    summary: "Varanasi Junction, Banaras and Pt. Deen Dayal Upadhyaya Junction — which is which, and how to get from each to your hotel.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    sources: [{ title: "Indian Railways — station information and enquiry", publisher: "Indian Railways" }],
    sections: [
      {
        heading: "The three stations",
        body: `| Station | Where | Notes |
|---|---|---|
| **Varanasi Junction** | In the city | The main station. [VERIFY: station code and distance to the ghats — Indian Railways / mapped route] |
| **Banaras** | In the city | [VERIFY: station code and distance to the ghats — Indian Railways / mapped route] |
| **Pt. Deen Dayal Upadhyaya Junction** | Outside the city | Major junction on many long-distance routes. [VERIFY: distance and travel time to the ghats — mapped route] |

Always check which station is on your ticket — getting to the wrong one can cost you an hour.`,
      },
      {
        heading: "From the station to your hotel",
        body: `- Pre-book a [railway station transfer](/services/transport/railway-transfer), especially for night arrivals.
- Auto-rickshaws and taxis wait outside the stations. Agree the fare before you start.
- For hotels near the ghats, the car or auto will stop on the main road — expect a short walk with your luggage.`,
      },
      {
        heading: "Station tips",
        body: `- Keep your bags close in crowded areas.
- Use the official enquiry counters or app for platform and delay information.
- Retiring rooms and waiting rooms: [VERIFY: availability — Indian Railways]`,
      },
    ],
  },

  // ------------------------------------------------------------- practical
  {
    slug: "best-time-to-visit",
    group: "practical",
    title: "Best time to visit Varanasi",
    summary: "Month by month: the comfortable winter season, the hot summer, the monsoon floods and the big festivals.",
    image: { src: "/img/ganga_sunrise.jpg", alt: "Bathers and wooden boats on the Ganga, with the ghats behind" },
    status: "review",
    sections: [
      {
        heading: "At a glance",
        body: `| Season | Months | What to expect |
|---|---|---|
| **Winter (peak season)** | October–March | Pleasant days, cold mornings and foggy dawns in mid-winter. Busiest time, with big festivals. |
| **Summer** | April–June | Very hot. Plan sightseeing for early morning and evening. Fewer visitors. |
| **Monsoon** | July–September | Humid with heavy rain. The Ganga rises and may flood the lower ghats; boating can be suspended. |

*Seasons are general patterns; check the forecast for your dates.*`,
      },
      {
        heading: "Festivals worth planning around",
        body: `- **Dev Deepawali** (Kartik Purnima, usually October–November): the ghats lit with lamps — spectacular and very crowded.
- **Mahashivratri** (February–March): huge crowds at Shiva temples.
- **Holi** (February–March): exuberant celebrations; plan carefully if travelling alone.
- **Sawan** (July–August): Mondays bring very large crowds to Kashi Vishwanath.

We publish exact dates only once they are confirmed. See the [festivals calendar](/festivals).`,
      },
      {
        heading: "Which season suits you",
        body: `- **First visit, comfort first:** November to February.
- **Festivals and atmosphere:** time your trip with Dev Deepawali — book early.
- **Fewer crowds and lower prices:** summer, if you can handle the heat and plan around midday.
- **Seeing the river in flood:** monsoon — dramatic, but be flexible about boats and ghat walks.`,
      },
    ],
  },
  {
    slug: "weather-and-monsoon",
    group: "practical",
    title: "Weather & monsoon",
    summary: "Heat, winter fog and monsoon floods: how Varanasi's weather affects boat rides, the Aarti and your plans.",
    image: { src: "/img/harbour.jpg", alt: "Boats moored on the Ganga" },
    status: "review",
    sections: [
      {
        heading: "Summer heat",
        body: `From April to June days are very hot. Start early, rest in the middle of the day and do the ghats and lanes in the evening. Drink plenty of safe water and carry a hat or scarf.`,
      },
      {
        heading: "Winter fog",
        body: `In mid-winter, dense fog can settle on the river in the early morning. Sunrise boat rides still run but the view may be limited, and fog can delay trains and flights. Mornings and nights are cold — bring a warm layer.`,
      },
      {
        heading: "Monsoon and floods",
        body: `During the monsoon the Ganga rises, sometimes covering the lower steps and the walkway between ghats.

- The district administration may **suspend boating** when the river is high. [VERIFY: current boating status — district administration advisories]
- The Ganga Aarti usually moves higher up the steps or to rooftops.
- Some ghat-to-ghat walks become impossible; your route may need to go through the lanes instead.

Check **[Today in Varanasi](/travel-guide/today)** for current river conditions.`,
      },
      {
        heading: "How we handle weather",
        body: `If a boat ride or experience you booked through us can't run because of weather or a river closure, we offer an alternative, a new date or a full refund — your choice. See our [cancellation policy](/cancellation-policy).`,
      },
    ],
  },
  {
    slug: "what-to-pack",
    group: "practical",
    title: "What to pack",
    summary: "Clothes for temples and heat, comfortable shoes for the steps, and the small things that make Varanasi easier.",
    image: { src: "/img/varanasi.jpg", alt: "Stone ghat steps beside the Ganga in Varanasi" },
    status: "review",
    sections: [
      {
        heading: "Clothes",
        body: `- Light, loose clothing that covers shoulders and knees — right for temples and comfortable in the heat.
- A scarf or shawl: useful for temples, sun and cold mornings on the river.
- A warm layer from November to February.
- A light rain jacket or umbrella in the monsoon.`,
      },
      {
        heading: "Shoes",
        body: `- Comfortable walking shoes with good grip — the ghat steps are steep and can be slippery.
- Slip-on shoes or sandals make it easier where you need to remove footwear at temples.`,
      },
      {
        heading: "Useful extras",
        body: `- Refillable water bottle and oral rehydration salts.
- Hand sanitiser and tissues.
- A small torch for early mornings and dim lanes.
- Power bank — you'll use your phone for maps and payments.
- Copies of your ID and travel documents (paper and on your phone).
- Any regular medicines, with prescriptions.`,
      },
      {
        heading: "What to leave behind",
        body: `- Expensive jewellery and anything you'd hate to lose in a crowd.
- Large bags if you plan to visit temples with strict bag rules — check the [current access rules](/travel-guide/temple-access-rules).`,
      },
    ],
  },
  {
    slug: "getting-around",
    group: "practical",
    title: "Getting around Varanasi",
    summary: "Auto-rickshaws, e-rickshaws, cycle-rickshaws, taxis and boats — and why your feet are the best transport in the old city.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    sections: [
      {
        heading: "Your options",
        body: `| Mode | Good for | Tips |
|---|---|---|
| **Walking** | The ghats and old-city lanes | Often the only way to reach ghat-side places |
| **Auto-rickshaw** | Short trips across the city | Agree the fare first. [VERIFY: typical fare ranges — local survey] |
| **E-rickshaw** | Short, shared or private hops | Common on main roads |
| **Cycle-rickshaw** | Short distances in crowded areas | Slow but useful near markets |
| **Taxi / app cab** | Airport, stations, Sarnath, Ramnagar | [VERIFY: app-cab availability — operators] |
| **Boat** | Moving along the riverfront | Agree route, duration and price before boarding |`,
      },
      {
        heading: "Agreeing a fare",
        body: `- Agree the price and destination before you start.
- Have small notes or UPI ready.
- If a price seems far too high, politely walk to the next driver.

We will publish typical fare ranges only after checking them ourselves.`,
      },
      {
        heading: "Traffic and road closures",
        body: `Traffic in the city centre can be slow, especially in the evening, on Mondays near Kashi Vishwanath and on festival days. Police sometimes close roads to vehicles near the ghats. Check [Today in Varanasi](/travel-guide/today) before you set off.`,
      },
    ],
  },
  {
    slug: "last-mile-walking",
    group: "practical",
    title: "Last-mile walking: where vehicles stop",
    summary: "Cars can't reach most ghats or the old city. Here's what the final walk is like and how to plan for it — especially with seniors or luggage.",
    image: { src: "/img/varanasi.jpg", alt: "Stone ghat steps beside the Ganga in Varanasi" },
    status: "review",
    sections: [
      {
        heading: "Why you'll walk",
        body: `The old city of Varanasi grew along the river as a maze of narrow lanes (galis). Most are too narrow for cars, and many are shared with motorbikes, cows and pedestrians. Vehicles stop on the main roads above the ghats, and you walk the rest.`,
      },
      {
        heading: "Common drop-off points",
        body: `| Destination | Where vehicles usually stop | Walk |
|---|---|---|
| Dashashwamedh Ghat / Kashi Vishwanath | Around Godowlia crossing | [VERIFY: typical walking time and route — field check] |
| Assi Ghat | Close to the ghat | [VERIFY: field check] |
| Hotels in the old-city lanes | Nearest main road | Varies by hotel — ask your hotel |

*Drop-off points change with traffic rules and festival closures.*`,
      },
      {
        heading: "Walking with seniors, children or luggage",
        body: `- Ask your hotel to send someone to meet you at the drop-off point.
- Porters are sometimes available near main drop-off points — agree the price first.
- Cycle-rickshaws and e-rickshaws can sometimes go further than cars.
- The ghat steps are steep and uneven; allow time and take breaks. See [family & senior-friendly travel](/travel-guide/families-and-seniors).`,
      },
      {
        heading: "Finding your way",
        body: `Phone maps can be unreliable in the narrowest lanes. Note a landmark near your hotel — a temple, a ghat name or a well-known shop — and ask locals for that landmark rather than a street address.`,
      },
    ],
  },
  {
    slug: "money-and-upi",
    group: "practical",
    title: "Cash, UPI and payments",
    summary: "UPI is everywhere, but cash still matters on the river and in the lanes. How to pay, tip and avoid problems.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    sections: [
      {
        heading: "UPI and cards",
        body: `UPI (scan-to-pay) is widely used in Varanasi, including at many small shops and stalls. Cards are accepted in most hotels, larger restaurants and shops.

International visitors: options for using UPI with a foreign phone number or card are changing. [VERIFY: current UPI options for foreign visitors — NPCI / RBI]`,
      },
      {
        heading: "Cash",
        body: `- Carry some cash in small notes for boats, auto-rickshaws, small food stalls, tips and temple offerings.
- ATMs are common in the city centre; some near the ghats can run out of cash on busy days.
- Keep cash in more than one place.`,
      },
      {
        heading: "Tips and offerings",
        body: `- Tipping is appreciated for good service but not compulsory.
- Temple donations and offerings are always voluntary. Be wary of anyone who demands a "donation" as a condition of entry or photography.`,
      },
    ],
  },
  {
    slug: "connectivity",
    group: "practical",
    title: "Mobile connectivity & SIMs",
    summary: "Getting online in Varanasi: mobile data, Wi-Fi, and buying a SIM as a visitor.",
    image: { src: "/img/varanasi.jpg", alt: "Varanasi city by the river" },
    status: "review",
    sections: [
      {
        heading: "Mobile data",
        body: `Mobile coverage is generally good across the city. In the narrowest old-city lanes and inside some buildings, signal can drop. Download offline maps and save your itinerary and the [emergency page](/travel-guide/emergency) before you go out.`,
      },
      {
        heading: "Buying a SIM",
        body: `Indian residents can use their existing SIM. International visitors can buy a local SIM with their passport and visa; activation may not be instant. [VERIFY: current documents and activation time for tourist SIMs — telecom operators / DoT]

eSIM options for international visitors: [VERIFY: current availability — operators]`,
      },
      {
        heading: "Wi-Fi",
        body: `Most hotels and many cafés offer Wi-Fi. Avoid entering banking passwords on public networks.`,
      },
    ],
  },

  // ---------------------------------------------------------------- safety
  {
    slug: "food-and-water-safety",
    group: "safety",
    title: "Drinking water & food safety",
    summary: "Enjoy Banarasi street food without getting ill: water, ice, busy stalls and what to do if your stomach complains.",
    image: { src: "/img/street_food.jpg", alt: "A kachori served with fried green chillies" },
    status: "review",
    sections: [
      {
        heading: "Water",
        body: `- Drink sealed bottled water or water from a filter you trust. Check the seal.
- Avoid tap water, including for brushing teeth if you have a sensitive stomach.
- Be cautious with ice and drinks made with unknown water.
- Carry oral rehydration salts, especially in summer.`,
      },
      {
        heading: "Street food",
        body: `Street food is a highlight of Varanasi. To enjoy it safely:

- Eat where it's busy — high turnover means fresh food.
- Prefer food that is freshly cooked and served hot (kachori, jalebi, chaat assembled in front of you).
- Be more careful with raw salads, cut fruit and chutneys in hot weather.
- Start gently on your first day.

See our [food guide](/food) and [food walks](/things-to-do/food-walks).`,
      },
      {
        heading: "Thandai and bhang",
        body: `Some thandai in Varanasi is served with bhang (cannabis), especially around Holi and Mahashivratri. Always ask before you drink, and avoid it if you are unsure. [VERIFY: current legal position on bhang sales — Uttar Pradesh excise rules]`,
      },
      {
        heading: "If you get ill",
        body: `Rest, drink rehydration salts and plenty of safe water. Seek medical help if you have a high fever, blood in your stool, or can't keep fluids down. See [emergency contacts & hospitals](/travel-guide/emergency).`,
      },
    ],
  },
  {
    slug: "solo-and-women-safety",
    group: "safety",
    title: "Solo-travel & women's safety",
    summary: "Practical advice for solo travellers and women in Varanasi: transport, the ghats at night, touts, and who to call.",
    image: { src: "/img/varanasi.jpg", alt: "Stone ghat steps beside the Ganga in Varanasi" },
    status: "review",
    sections: [
      {
        heading: "The short version",
        body: `Many solo and women travellers visit Varanasi every year and have safe, memorable trips. Most problems are persistent touts, staring or crowding — not danger. A few habits make a big difference.`,
      },
      {
        heading: "Everyday precautions",
        body: `- Avoid empty ghats and deserted lanes late at night; the riverfront is lively in the evening but quiet after the Aarti crowds leave.
- Arrange airport and station pickups in advance, especially at night.
- Share your plans and live location with someone you trust.
- Dress modestly — it reduces unwanted attention and is respectful at temples.
- Be firm and brief with people who won't leave you alone; walking into a shop or towards a group of families usually ends it.`,
      },
      {
        heading: "Guides and companions",
        body: `If you would like company in the old city or on the river, book a verified guide in advance. Ask us for a **woman guide** if you prefer — we will tell you honestly whether one is available for your dates.`,
      },
      {
        heading: "Help",
        body: `- Emergency: **112**.
- Women's helpline: [VERIFY: UP women's helpline number — UP Police]
- If you booked through us, our support team is on WhatsApp.

See [emergency contacts](/travel-guide/emergency) and [common scams](/travel-guide/scams-and-touts).`,
      },
    ],
  },
  {
    slug: "families-and-seniors",
    group: "safety",
    title: "Family & senior-friendly travel",
    summary: "Planning Varanasi with children or older relatives: steps, walking distances, heat, crowds and gentler alternatives.",
    image: { src: "/img/boats.jpg", alt: "Boats on the Ganga" },
    status: "review",
    sections: [
      {
        heading: "What makes Varanasi demanding",
        body: `- **Steps:** the ghats are steep stone steps, often without handrails.
- **Walking:** cars can't reach the ghats or the old city — see [last-mile walking](/travel-guide/last-mile-walking).
- **Crowds:** temples and the evening Aarti can be very crowded, especially on festival days.
- **Heat:** from April to June, midday sightseeing is exhausting.`,
      },
      {
        heading: "Gentler ways to see the city",
        body: `- Watch the Ganga Aarti **from a boat** instead of the crowded steps.
- Choose ghats with wider, easier access — ask us for current advice.
- Visit Sarnath, where the site is spread out but largely flat. See [Sarnath](/places/heritage/sarnath).
- Plan temple visits for quieter times and avoid Mondays and festival days.
- Book a car to the nearest drop-off point and arrange a porter or helper for the last stretch.`,
      },
      {
        heading: "With children",
        body: `- Keep children close in crowds and on the ghat steps; the river can be fast-flowing.
- Life jackets on boats: ask for them and make sure children wear them.
- Break the day into short outings with rest in between.`,
      },
      {
        heading: "Let us plan it",
        body: `Our [senior-friendly itinerary](/plan/itineraries/senior-friendly) keeps walking low and adds breaks. For more help, ask our [travel assistance team](/services/assistance/senior-friendly).`,
      },
    ],
  },
  {
    slug: "accessibility",
    group: "safety",
    title: "Accessibility",
    summary: "An honest guide to visiting Varanasi with limited mobility: what is hard, what is possible, and how we can help.",
    image: { src: "/img/stupa.jpg", alt: "The flat lawns around the Dhamek Stupa at Sarnath" },
    status: "review",
    sections: [
      {
        heading: "An honest picture",
        body: `Varanasi's riverfront is built of steep stone steps, and the old city is a network of narrow, uneven lanes. Wheelchair access to most ghats and old-city temples is very limited. We would rather tell you this clearly than have you discover it on arrival.`,
      },
      {
        heading: "What is more accessible",
        body: `- **Sarnath:** largely flat grounds and paths. [VERIFY: step-free access to the museum and stupa area — ASI]
- **Boat rides:** boarding involves steps, but once aboard a boat is a comfortable way to see the whole riverfront. Ask for a boat and boarding point with easier access.
- **Newer riverfront areas and the Kashi Vishwanath corridor:** [VERIFY: current step-free routes, lifts and wheelchair availability — temple trust / site operators]`,
      },
      {
        heading: "How we can help",
        body: `Tell us what you need — wheelchair use, limited walking, hearing or vision needs — and our [accessibility assistance](/services/assistance/accessibility) team will suggest what is realistic and what is not. We do not promise access we have not checked.`,
      },
    ],
  },
  {
    slug: "scams-and-touts",
    group: "safety",
    title: "Common scams and how to avoid them",
    summary: "The tricks most often reported by visitors to Varanasi — and simple ways to avoid them without spoiling your trip.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    sections: [
      {
        heading: "The most commonly reported",
        body: `- **"Donations" at the cremation ghats:** people approach visitors at Manikarnika, explain the rites and then ask for money "for wood for the poor". Politely decline and keep walking.
- **Unofficial "guides":** offers to show you a temple or a shortcut that end in a shop or a demand for money.
- **"Your hotel is closed":** a driver claims your hotel is full or shut and takes you elsewhere for a commission. Call the hotel yourself.
- **Silk shop commissions:** guides or drivers take you to shops where they earn commission and prices are inflated. Read our [silk buying guide](/shopping/banarasi-silk-sarees).
- **Unagreed prices:** a boat, rickshaw or massage with no price agreed upfront and a high bill at the end.
- **Blessings and tilak:** someone puts a mark on your forehead or a thread on your wrist and asks for money.`,
      },
      {
        heading: "Simple rules",
        body: `1. Agree the price, route and duration before any service starts.
2. Book guides, boats and drivers in advance from people you or we have checked.
3. Say "no, thank you" firmly once and keep walking — no need for explanations.
4. Never hand over your passport or phone to strangers.
5. Donations are always voluntary.`,
      },
      {
        heading: "Our promise",
        body: `Partners who work with us agree to fixed, confirmed prices and **no shopping commissions**. If anyone working through us overcharges or pressures you, [tell us](/about/complaints) — we treat it as a serious breach.`,
      },
    ],
  },
];
