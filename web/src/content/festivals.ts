import type { Festival } from "./types";

// Festivals & Culture. Dates are shown as confirmed only when status is
// "confirmed" and verified from an official source (FR-FEST). Until then
// every year carries value: null — the page shows the typical season instead.

const expected = [
  { year: 2026, value: null, status: "expected" as const },
  { year: 2027, value: null, status: "expected" as const },
];

export const FESTIVALS: Festival[] = [
  {
    slug: "dev-deepawali",
    title: "Dev Deepawali",
    summary: "On the full moon of Kartik the ghats are lined with lamps from end to end — Varanasi's most spectacular night of the year.",
    seoTitle: "Dev Deepawali in Varanasi: Guide & Tips",
    seoDescription: "Dev Deepawali in Varanasi: what it celebrates, how the ghats are lit, the best ways to see it and how to plan around the crowds.",
    image: { src: "/img/dev_diwali.jpg", alt: "Ghats lit up with strings of lights at night" },
    status: "review",
    season: "October–November, on Kartik Purnima (the full moon of the month of Kartik)",
    dates: expected,
    locations: ["All the main ghats, from Assi to Raj Ghat", "Dashashwamedh Ghat", "The river itself (boats)"],
    crowd: "very high",
    sections: [
      {
        heading: "Background and significance",
        body: "Dev Deepawali means \"the Diwali of the gods\". **Tradition holds** that on this night the gods descend to bathe in the Ganga at Varanasi, and the city lights lamps to welcome them. It is also associated with Shiva's victory over the demon Tripurasura, which is why the day is sometimes called Tripura Purnima. It falls on Kartik Purnima, about fifteen days after Diwali.",
      },
      {
        heading: "How it is celebrated",
        body: "As dusk falls, residents, temples and community groups light earthen lamps (*diyas*) along the steps of the ghats. The riverfront glows for kilometres. There are special Aartis, devotional music and, in recent years, fireworks and light displays organised by the city. Many people also take a ritual dip in the Ganga during the day, as on every Kartik Purnima.",
      },
      {
        heading: "Where to experience it",
        body: "Most visitors watch from a boat, which shows the full sweep of the lit ghats. Others walk the riverfront between the central ghats, or watch from a rooftop near the river. Dashashwamedh is the busiest point. Southern ghats such as Assi are usually a little less crowded, though still busy.",
      },
      {
        heading: "Planning and safety",
        body: "This is the busiest night of the year on the riverfront. Boats and riverside rooms are often booked months ahead and prices rise sharply. [VERIFY: current year's traffic, boating and security arrangements from the district administration]. Roads near the ghats are usually closed to vehicles, so plan to walk. Keep children close, agree a meeting point, and keep phones and wallets secure in the crowds.",
      },
    ],
    advice: [
      "Book a boat or a riverside room well in advance — and confirm the booking in writing",
      "Expect road closures near the ghats; plan to walk the last stretch",
      "Agree a meeting point with your group in case you get separated",
      "Keep valuables zipped away; crowds are very dense",
      "Check this page and Today in Varanasi for confirmed arrangements closer to the date",
    ],
    faqs: [
      { q: "When is Dev Deepawali?", a: "It falls on Kartik Purnima, the full moon of the Hindu month of Kartik — usually in November, sometimes late October. We show the exact date here only once it is confirmed by an official source." },
      { q: "Is it better to watch from a boat or the ghats?", a: "A boat gives the widest view of the lit riverfront; the ghats let you see the lamps and rituals up close. Many visitors do both — a boat at dusk, then a walk." },
      { q: "Do I need to book in advance?", a: "Yes. Boats and riverside rooms fill up early for this night. Ask for written confirmation of what is included and when the boat leaves." },
      { q: "Is Dev Deepawali the same as Diwali?", a: "No. Diwali comes first; Dev Deepawali follows about fifteen days later on Kartik Purnima." },
    ],
  },
  {
    slug: "kartik-purnima",
    title: "Kartik Purnima",
    summary: "The full moon that closes the sacred month of Kartik — a day for a holy dip in the Ganga, and the night of Dev Deepawali.",
    image: { src: "/img/ganga_sunrise.jpg", alt: "Bathers and wooden boats on the Ganga, with the ghats behind" },
    status: "review",
    season: "October–November (full moon of Kartik)",
    dates: expected,
    locations: ["The main bathing ghats", "Panchganga Ghat", "Dashashwamedh Ghat"],
    crowd: "very high",
    sections: [
      {
        heading: "Background and significance",
        body: "Kartik is considered one of the holiest months of the Hindu calendar, and its full moon (*purnima*) is its high point. **According to tradition**, bathing in the Ganga on this day brings great merit. In Varanasi, lamps are hung high on bamboo poles along the ghats throughout Kartik — the *akash deep*, or \"sky lamps\" — traditionally to guide the spirits of ancestors. The day also coincides, in many years, with Guru Nanak Jayanti.",
      },
      {
        heading: "How it is celebrated",
        body: "From before dawn, large numbers of pilgrims take a ritual dip at the ghats, followed by prayers and offerings. In the evening the city celebrates [Dev Deepawali](/festivals/dev-deepawali), when the ghats are lined with lamps.",
      },
      {
        heading: "Planning and safety",
        body: "Early-morning bathing crowds are very large, especially at the central ghats. If you are not bathing, watch respectfully from a distance and do not photograph people bathing without permission. Ghat steps can be wet and slippery. [VERIFY: current year's bathing and crowd-management arrangements from the district administration].",
      },
    ],
    advice: [
      "Go early if you want to see the morning bathing, and give bathers space",
      "Do not photograph people bathing without their permission",
      "Wear shoes with grip — the steps get wet",
      "Plan the evening around Dev Deepawali crowds",
    ],
    faqs: [
      { q: "Can visitors bathe in the Ganga on Kartik Purnima?", a: "Many pilgrims do. If you choose to, stay close to the steps, never go out of your depth, and follow any instructions from officials and boatmen." },
      { q: "What are the lamps on tall poles along the ghats?", a: "These are akash deep (sky lamps), hung through the month of Kartik. Tradition holds they guide the spirits of ancestors." },
      { q: "Is Kartik Purnima the same day as Dev Deepawali?", a: "Yes. Dev Deepawali is celebrated on the evening of Kartik Purnima." },
    ],
  },
  {
    slug: "mahashivratri",
    title: "Mahashivratri",
    summary: "The great night of Shiva — the most important festival in the City of Shiva, with all-night worship and long temple queues.",
    status: "review",
    season: "February–March (the night before the new moon in Phalguna)",
    dates: expected,
    locations: ["Shri Kashi Vishwanath Temple", "Shiva temples across the city", "The old-city lanes"],
    crowd: "very high",
    sections: [
      {
        heading: "Background and significance",
        body: "Varanasi is known as the city of Shiva, so Mahashivratri — \"the great night of Shiva\" — is its most important festival. **Devotees believe** it marks the wedding of Shiva and Parvati, and many keep a fast and an all-night vigil of prayer.",
      },
      {
        heading: "How it is celebrated",
        body: "Temples stay busy through the night with offerings of water, milk and bael leaves to the Shiva linga. Queues at [Kashi Vishwanath](/places/temples/kashi-vishwanath) can be extremely long. In Varanasi, colourful wedding processions for Shiva (*Shiv baraat*) are a well-known part of the celebration. [VERIFY: current procession routes and timings from the organisers and police].",
      },
      {
        heading: "Planning and safety",
        body: "Expect temple access rules, queue systems and traffic restrictions that differ from ordinary days. [VERIFY: Mahashivratri darshan and security arrangements from the Shri Kashi Vishwanath Temple Trust]. If you are travelling with older people or children, consider visiting smaller temples or watching processions from a safe spot rather than joining the main temple queue.",
      },
    ],
    advice: [
      "Check the temple trust's notices for special darshan arrangements before you go",
      "Leave phones and bags at your hotel if the temple does not allow them",
      "Carry water and expect long waits",
      "Seniors and children: consider a quieter temple and avoid the densest crowds",
    ],
    faqs: [
      { q: "Can I visit Kashi Vishwanath on Mahashivratri?", a: "Yes, but expect very long queues and special arrangements. Check the temple trust's official notices for the current year before you go." },
      { q: "What is the Shiv baraat?", a: "A festive procession celebrating Shiva's wedding, with music and costumes, held in Varanasi around Mahashivratri. Routes and timings vary each year." },
      { q: "Is it a good time for a first visit?", a: "It is unforgettable, but very crowded. If you prefer calm, avoid the festival days and come a little before or after." },
    ],
  },
  {
    slug: "holi",
    title: "Holi in Varanasi",
    summary: "The festival of colours, celebrated with bonfires, colour and music — joyful, loud, and worth planning carefully.",
    image: { src: "/img/mural.jpg", alt: "Colourful painted walls and steps on a Varanasi ghat" },
    status: "review",
    season: "March (Phalguna Purnima, after Holika Dahan the night before)",
    dates: expected,
    locations: ["The ghats", "Old-city neighbourhoods", "Kashi Vishwanath (Rangbhari Ekadashi, a few days earlier)"],
    crowd: "high",
    sections: [
      {
        heading: "Background and significance",
        body: "Holi celebrates the arrival of spring and, **according to tradition**, the victory of good over evil, remembered in the story of Prahlad and Holika. The night before, bonfires are lit for **Holika Dahan**. In Varanasi the season begins a few days earlier with **Rangbhari Ekadashi**, associated with Shiva and Parvati and celebrated at Kashi Vishwanath.",
      },
      {
        heading: "How it is celebrated",
        body: "On Holi morning people throw coloured powder and water, visit friends, and share sweets and thandai. Celebrations in the old city and on the ghats can be very boisterous. Varanasi is also known for a tradition of playing Holi with ash at the cremation grounds (*Masaan Holi*), which is a religious observance — watch only from a respectful distance and never photograph mourners. [VERIFY: current status and date of Masaan Holi].",
      },
      {
        heading: "Planning and safety",
        body: "Holi is joyful but can get rowdy, especially by late morning. Many travellers — particularly women and solo travellers — prefer to celebrate with a local host or a hotel group rather than on the street. Wear old clothes, oil your skin and hair beforehand, protect your eyes and phone, and be cautious with drinks: thandai served at Holi may contain bhang.",
      },
    ],
    advice: [
      "Celebrate with a trusted group or host, especially if you are a woman or travelling solo",
      "Wear old clothes and protect your eyes, phone and camera",
      "Be careful with drinks — thandai may contain bhang",
      "Most celebrations wind down by early afternoon; shops may stay closed for the day",
    ],
    faqs: [
      { q: "Is Holi safe for tourists in Varanasi?", a: "Many visitors enjoy it, but it can be rowdy. Celebrating with a trusted host or group, and heading indoors by midday, makes for a better experience." },
      { q: "What is Rangbhari Ekadashi?", a: "An observance a few days before Holi, associated with Shiva and Parvati, when colour is played at Kashi Vishwanath. It marks the start of Holi celebrations in the city." },
      { q: "Will shops and transport run on Holi?", a: "Many shops close and transport is limited for most of the day. Plan meals and travel around it." },
    ],
  },
  {
    slug: "ganga-mahotsav",
    title: "Ganga Mahotsav",
    summary: "A cultural festival of classical music and dance on the ghats, usually held in the days around Dev Deepawali.",
    image: { src: "/img/riverfront.jpg", alt: "Temples and old buildings along the Varanasi riverfront" },
    status: "review",
    season: "October–November, around Kartik Purnima",
    dates: expected,
    locations: ["Riverfront venues on the central ghats [VERIFY: current venue]"],
    crowd: "high",
    sections: [
      {
        heading: "Background",
        body: "Ganga Mahotsav is a cultural festival organised by Uttar Pradesh Tourism [VERIFY: organiser], celebrating the Ganga and the musical heritage of Banaras — home of a renowned tradition of Hindustani classical music. It is usually timed to run up to Dev Deepawali.",
      },
      {
        heading: "What to expect",
        body: "Evening performances of classical and folk music and dance on a stage by the river, often with well-known artists, alongside craft and food stalls. Programmes change each year. [VERIFY: this year's programme, venue and entry arrangements from UP Tourism].",
      },
      {
        heading: "Planning",
        body: "Because it overlaps with Dev Deepawali, rooms and boats near the ghats are in high demand. Arrive early for a seat near the stage and dress warmly — November evenings by the river can be cool.",
      },
    ],
    advice: [
      "Check the official programme before you plan your evenings",
      "Combine it with Dev Deepawali, but book rooms early",
      "Bring a shawl for the evening breeze off the river",
    ],
    faqs: [
      { q: "Is Ganga Mahotsav free?", a: "Arrangements vary by year. We will show entry details here once they are confirmed by the organisers." },
      { q: "Who performs?", a: "Classical and folk musicians and dancers. The line-up changes every year and is published by the organisers." },
      { q: "When does it take place?", a: "Usually in the days leading up to Dev Deepawali in October–November. Confirmed dates appear here once officially announced." },
    ],
  },
  {
    slug: "nag-nathaiya",
    title: "Nag Nathaiya",
    summary: "A riverside enactment of Krishna subduing the serpent Kaliya, staged at Tulsi Ghat during Kartik.",
    status: "review",
    season: "October–November (month of Kartik)",
    dates: expected,
    locations: ["Tulsi Ghat"],
    crowd: "high",
    sections: [
      {
        heading: "Background and significance",
        body: "Nag Nathaiya is part of Varanasi's tradition of Krishna Lila — dramatic retellings of episodes from Krishna's life. **Tradition** links its origins to the poet-saint Tulsidas, after whom [Tulsi Ghat](/places/ghats/tulsi) is named. It re-enacts the story of the child Krishna leaping into the Yamuna — here, the Ganga — to defeat the serpent Kaliya.",
      },
      {
        heading: "How it is celebrated",
        body: "A young performer playing Krishna dives into the river and reappears standing on a model of the serpent, to cheers from crowds on the ghat and in boats. The performance is brief, but people gather early. [VERIFY: this year's date and timing from the organisers].",
      },
      {
        heading: "Planning and safety",
        body: "Tulsi Ghat is small and fills quickly. Arrive early, watch from a safe spot on the steps or from a boat if allowed, and keep children close near the water.",
      },
    ],
    advice: [
      "Arrive well before the performance — the ghat fills up fast",
      "Keep children well back from the water's edge",
      "Combine it with a morning at nearby Assi Ghat",
    ],
    faqs: [
      { q: "How long is the Nag Nathaiya performance?", a: "The main moment is short, but crowds gather well beforehand. Plan to spend an hour or two." },
      { q: "Where is the best view?", a: "From the steps of Tulsi Ghat or a boat on the river, where permitted. Arrive early for either." },
      { q: "When is Nag Nathaiya held?", a: "During the month of Kartik (October–November). We show the exact date once it is confirmed." },
    ],
  },
  {
    slug: "ramnagar-ramlila",
    title: "Ramnagar Ramlila",
    summary: "A month-long, open-air performance of the Ramayana across the town of Ramnagar, under the patronage of the Kashi Naresh.",
    image: { src: "/img/harbour.jpg", alt: "Boats on the Ganga at Varanasi" },
    status: "review",
    season: "September–October, around Dussehra",
    dates: expected,
    locations: ["Ramnagar (open-air sites across the town)", "Ramnagar Fort"],
    crowd: "high",
    sections: [
      {
        heading: "Background and significance",
        body: "The Ramnagar Ramlila is one of the most famous traditional performances of the Ramayana in India. It has been held under the patronage of the Kashi Naresh, whose seat is [Ramnagar Fort](/places/heritage/ramnagar-fort), since the 19th century [VERIFY: start date and ruler credited]. UNESCO recognises the Ramlila tradition as Intangible Cultural Heritage [VERIFY: inscription wording and year].",
      },
      {
        heading: "How it is performed",
        body: "Episodes are staged each evening over about a month, with different parts of Ramnagar standing in for places in the story, so the audience moves with the performance. The texts follow Tulsidas's *Ramcharitmanas*. Many spectators follow along with the text, and the atmosphere is devotional rather than theatrical.",
      },
      {
        heading: "Planning and safety",
        body: "Ramnagar is across the river from the ghats; check how you will get back after dark before you go. Performances are outdoors on uneven ground, with limited seating. [VERIFY: this year's schedule and the episodes on each date].",
      },
    ],
    advice: [
      "Find out which episode is being staged each evening and pick the ones you want to see",
      "Arrange your return transport before the evening performance",
      "Wear comfortable shoes — you will walk between sites",
      "Treat it as a devotional event: dress modestly and stay quiet during recitations",
    ],
    faqs: [
      { q: "How long does the Ramnagar Ramlila last?", a: "About a month, with a different episode each evening, around the festival of Dussehra." },
      { q: "Do I need tickets?", a: "Arrangements are traditional and vary; we will show confirmed details here when verified." },
      { q: "Can I see just one evening?", a: "Yes. Many visitors choose one or two episodes, such as those around Dussehra." },
    ],
  },
  {
    slug: "buddha-purnima-sarnath",
    title: "Buddhist observances in Sarnath",
    summary: "Buddha Purnima and other Buddhist observances at the place where the Buddha gave his first teaching.",
    image: { src: "/img/monks.jpg", alt: "Two monks in maroon robes seated near the Dhamek Stupa at Sarnath" },
    status: "review",
    season: "Buddha Purnima: April–May (Vaishakha full moon); other observances through the year",
    dates: expected,
    locations: ["Sarnath archaeological complex", "Mulagandha Kuti Vihara", "Monasteries and national temples in Sarnath"],
    crowd: "moderate",
    sections: [
      {
        heading: "Background and significance",
        body: "**Buddhist tradition** holds that the Buddha gave his first teaching at [Sarnath](/places/heritage/sarnath) after his enlightenment at Bodh Gaya. Buddha Purnima, on the full moon of Vaishakha, commemorates his birth, enlightenment and passing. The full moon of Asalha (July), remembered as the day of the first sermon, is also significant here.",
      },
      {
        heading: "How it is observed",
        body: "Monasteries hold prayers, chanting and offerings, and there are processions and gatherings of monks and lay followers from many countries. On some occasions, relics are shown to the public at the Mulagandha Kuti Vihara [VERIFY: which occasions and current practice, from the Maha Bodhi Society].",
      },
      {
        heading: "Planning",
        body: "Sarnath is calmer than the ghats even on festival days, but parking and roads near the main site get busy. Dress modestly, remove shoes where asked, and ask before photographing monks or ceremonies. Late April and May are very hot — go early in the day.",
      },
    ],
    advice: [
      "Go early in the day — late spring heat is intense",
      "Ask before photographing monks or ceremonies",
      "Dress modestly and remove shoes where asked",
    ],
    faqs: [
      { q: "When is Buddha Purnima?", a: "On the full moon of Vaishakha, usually in April or May. We show the confirmed date when it is announced." },
      { q: "Can non-Buddhists attend?", a: "Yes. Visitors are generally welcome to watch respectfully; follow the guidance of monks and organisers." },
      { q: "Is there anything to see on other days?", a: "Yes — Sarnath's stupas, museum and temples are worth visiting year-round." },
    ],
  },
  {
    slug: "sawan",
    title: "Sawan (Shravan) month",
    summary: "The monsoon month sacred to Shiva, when Kashi Vishwanath draws huge crowds — especially on Mondays.",
    image: { src: "/img/boats.jpg", alt: "Boats moored along the ghats of Varanasi" },
    status: "review",
    season: "July–August (the month of Shravan)",
    dates: expected,
    locations: ["Shri Kashi Vishwanath Temple", "Shiva temples across the city", "Highways into the city (pilgrim routes)"],
    crowd: "very high",
    sections: [
      {
        heading: "Background and significance",
        body: "Shravan, or Sawan, is a month especially devoted to Shiva. **Devotees believe** worship in this month is particularly meritorious, and Mondays (*Sawan somvar*) are the most important days. Many pilgrims, known as *kanwariyas*, carry Ganga water on foot to offer at Shiva temples.",
      },
      {
        heading: "What to expect",
        body: "Very long queues at [Kashi Vishwanath](/places/temples/kashi-vishwanath), especially on Mondays, with special darshan and traffic arrangements [VERIFY: this year's arrangements from the temple trust and police]. Sawan also falls in the monsoon: when the Ganga rises, boat rides are often suspended and some lower ghats flood.",
      },
      {
        heading: "Planning and safety",
        body: "If you are not travelling for Sawan itself, avoid Mondays for temple visits. Expect diversions on roads used by pilgrims. Check [Today in Varanasi](/travel-guide/today) for river and boating notices before planning a boat ride.",
      },
    ],
    advice: [
      "Avoid Mondays for a temple visit unless you are coming for Sawan",
      "Expect boat rides to be suspended when the river is high",
      "Carry rain gear and footwear with grip",
      "Check road diversions on pilgrim routes before driving into the city",
    ],
    faqs: [
      { q: "Can I take a boat ride during Sawan?", a: "Only if boating is permitted. During the monsoon the district administration often suspends boating when the river is high — check Today in Varanasi before you plan." },
      { q: "Why are Mondays so crowded?", a: "Mondays in Sawan are considered especially auspicious for worshipping Shiva, so the temples see their biggest crowds." },
      { q: "Is Sawan a good time to visit?", a: "For pilgrims, yes. For sightseeing, the heat, rain, crowds and boating restrictions make October to March easier." },
    ],
  },
];
