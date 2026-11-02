import type { Itinerary } from "./types";

// Ready-made plans. Times are suggestions, never live crowd- or closure-aware
// routing. Check today's alerts and official timings before you go.

export const ITINERARIES: Itinerary[] = [
  {
    slug: "one-day",
    title: "Varanasi in One Day",
    summary: "Sunrise on the river, the old city and its temple, and the evening Ganga Aarti — the essential Varanasi day.",
    image: { src: "/img/boats.jpg", alt: "Boats along the ghats of Varanasi" },
    status: "review",
    days: 1,
    audience: ["First-time visitors", "Short stays"],
    pace: "full",
    walking: "moderate",
    plan: [
      {
        day: 1,
        title: "River, temple and Aarti",
        stops: [
          { time: "Before sunrise", title: "Sunrise boat ride from Assi", place: "assi", thing: "sunrise-boat-ride", durationMin: 120, walking: "low", note: "Boats don't run when the river is in flood — check today's alerts." },
          { time: "Mid-morning", title: "Breakfast in the old city", thing: "food-walks", durationMin: 60, walking: "low", note: "Kachori-sabzi and jalebi near Godowlia." },
          { time: "Late morning", title: "Kashi Vishwanath Temple", place: "kashi-vishwanath", thing: "temple-circuits", durationMin: 150, walking: "moderate", note: "Last stretch is on foot through narrow lanes. Check phone and bag rules before you go [VERIFY]." },
          { time: "Afternoon", title: "Rest at your hotel", durationMin: 120, walking: "low", note: "Avoid the midday heat, especially April to June." },
          { time: "Late afternoon", title: "Walk the central ghats", place: "dashashwamedh", thing: "morning-ghat-walk", durationMin: 60, walking: "moderate" },
          { time: "Evening", title: "Ganga Aarti at Dashashwamedh", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low", note: "Arrive early for a place on the steps, or watch from a boat." },
        ],
      },
    ],
    tips: [
      "Start early — the river is at its best at first light.",
      "Wear shoes that are easy to slip off for temples.",
      "Check today's alerts for river and temple notices.",
    ],
  },
  {
    slug: "two-days",
    title: "Varanasi in Two Days",
    summary: "Two unhurried days: the river and old city on day one, Sarnath and the southern temples on day two.",
    image: { src: "/img/boats.jpg", alt: "Boats on the Ganga in front of the ghats of Varanasi" },
    status: "review",
    days: 2,
    audience: ["First-time visitors", "Couples", "Culture seekers"],
    pace: "balanced",
    walking: "moderate",
    plan: [
      {
        day: 1,
        title: "The river and the old city",
        stops: [
          { time: "Before sunrise", title: "Sunrise boat ride", place: "assi", thing: "sunrise-boat-ride", durationMin: 120, walking: "low" },
          { time: "Mid-morning", title: "Heritage walk through the lanes", thing: "heritage-walks", durationMin: 150, walking: "moderate", note: "Carry water; take breaks in the shade." },
          { time: "Afternoon", title: "Rest", durationMin: 120, walking: "low" },
          { time: "Evening", title: "Ganga Aarti at Dashashwamedh", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low" },
        ],
      },
      {
        day: 2,
        title: "Sarnath and the southern temples",
        stops: [
          { time: "Morning", title: "Sarnath: stupas, ruins and museum", place: "sarnath", thing: "sarnath-buddhist-tour", durationMin: 240, walking: "moderate", note: "The museum has a weekly closing day — check before you go [VERIFY]." },
          { time: "Afternoon", title: "Lunch and rest", durationMin: 90, walking: "low" },
          { time: "Late afternoon", title: "Sankat Mochan and Durga Kund temples", place: "sankat-mochan", thing: "temple-circuits", durationMin: 120, walking: "low", note: "Both are reachable by road." },
          { time: "Evening", title: "Assi Ghat at dusk", place: "assi", durationMin: 60, walking: "low" },
        ],
      },
    ],
    tips: [
      "Arrange transport for Sarnath in advance.",
      "Mondays are typically busier at Shiva temples — plan temple visits accordingly [VERIFY].",
    ],
  },
  {
    slug: "three-days",
    title: "Varanasi in Three Days",
    summary: "Time to slow down: the river, the temples, Sarnath, the silk weavers and the food of the old city.",
    image: { src: "/img/riverfront.jpg", alt: "The Varanasi riverfront" },
    status: "review",
    days: 3,
    audience: ["Culture seekers", "Couples", "Repeat visitors"],
    pace: "balanced",
    walking: "moderate",
    plan: [
      {
        day: 1,
        title: "Arrive and meet the river",
        stops: [
          { time: "Afternoon", title: "Check in and rest", durationMin: 120, walking: "low", note: "Allow for the last stretch to ghat-side hotels on foot." },
          { time: "Late afternoon", title: "Sunset boat ride", place: "dashashwamedh", thing: "sunset-boat-ride", durationMin: 90, walking: "low" },
          { time: "Evening", title: "Ganga Aarti from the boat or steps", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 60, walking: "low" },
        ],
      },
      {
        day: 2,
        title: "Ghats, temple and food",
        stops: [
          { time: "Early morning", title: "Morning walk along the ghats", place: "assi", thing: "morning-ghat-walk", durationMin: 150, walking: "moderate" },
          { time: "Late morning", title: "Kashi Vishwanath Temple", place: "kashi-vishwanath", thing: "temple-circuits", durationMin: 150, walking: "moderate" },
          { time: "Afternoon", title: "Rest", durationMin: 120, walking: "low" },
          { time: "Evening", title: "Old-city food walk", thing: "food-walks", durationMin: 180, walking: "moderate" },
        ],
      },
      {
        day: 3,
        title: "Sarnath and the weavers",
        stops: [
          { time: "Morning", title: "Sarnath", place: "sarnath", thing: "sarnath-buddhist-tour", durationMin: 240, walking: "moderate" },
          { time: "Afternoon", title: "Silk weavers of Madanpura", thing: "silk-weaving-visits", durationMin: 150, walking: "low" },
          { time: "Evening", title: "Free evening by the river", place: "assi", durationMin: 90, walking: "low" },
        ],
      },
    ],
    tips: [
      "Build in an afternoon rest each day, especially in the warmer months.",
      "Book a guide for the old city on your first full day.",
    ],
  },
  {
    slug: "spiritual",
    title: "Spiritual Varanasi",
    summary: "A pilgrim's two days: dawn rituals on the river, the great temples, and the evening Aarti.",
    image: { src: "/img/ganga_aarti.jpg", alt: "Priests performing the Ganga Aarti with raised brass lamps at night" },
    status: "review",
    days: 2,
    audience: ["Pilgrims", "Families", "Spiritual travellers"],
    pace: "balanced",
    walking: "moderate",
    plan: [
      {
        day: 1,
        title: "River and Vishwanath",
        stops: [
          { time: "Before sunrise", title: "Sunrise on the river", place: "dashashwamedh", thing: "sunrise-boat-ride", durationMin: 120, walking: "low" },
          { time: "Morning", title: "Kashi Vishwanath Temple", place: "kashi-vishwanath", thing: "temple-circuits", durationMin: 180, walking: "moderate", note: "Queues are often shorter early; check current timings [VERIFY]." },
          { time: "Late morning", title: "Annapurna Temple", place: "annapurna", durationMin: 45, walking: "low", note: "Close to Kashi Vishwanath in the old city." },
          { time: "Afternoon", title: "Rest", durationMin: 150, walking: "low" },
          { time: "Evening", title: "Ganga Aarti", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low" },
        ],
      },
      {
        day: 2,
        title: "Kaal Bhairav and the southern temples",
        stops: [
          { time: "Morning", title: "Kaal Bhairav Temple", place: "kaal-bhairav", thing: "temple-circuits", durationMin: 90, walking: "moderate" },
          { time: "Late morning", title: "Durga Kund Temple", place: "durga-kund", durationMin: 60, walking: "low" },
          { time: "Midday", title: "Sankat Mochan Hanuman Temple", place: "sankat-mochan", durationMin: 60, walking: "low" },
          { time: "Afternoon", title: "New Vishwanath Temple at BHU", place: "new-vishwanath-bhu", durationMin: 90, walking: "low" },
          { time: "Evening", title: "Assi Ghat at dusk", place: "assi", durationMin: 60, walking: "low" },
        ],
      },
    ],
    tips: [
      "Check each temple's rules on phones, bags and dress before you go.",
      "Mondays, Sawan and Mahashivratri bring large crowds to Shiva temples [VERIFY: current crowd advisories].",
    ],
  },
  {
    slug: "with-sarnath",
    title: "Varanasi with Sarnath",
    summary: "Two days that pair the Ganga's ghats with Sarnath, where the Buddha first taught.",
    image: { src: "/img/stupa.jpg", alt: "The Dhamek Stupa at Sarnath" },
    status: "review",
    days: 2,
    audience: ["Buddhist pilgrims", "History lovers", "Families"],
    pace: "relaxed",
    walking: "moderate",
    plan: [
      {
        day: 1,
        title: "The ghats",
        stops: [
          { time: "Before sunrise", title: "Sunrise boat ride", place: "assi", thing: "sunrise-boat-ride", durationMin: 120, walking: "low" },
          { time: "Morning", title: "Morning walk along the ghats", place: "assi", thing: "morning-ghat-walk", durationMin: 120, walking: "moderate" },
          { time: "Afternoon", title: "Rest", durationMin: 150, walking: "low" },
          { time: "Evening", title: "Ganga Aarti", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low" },
        ],
      },
      {
        day: 2,
        title: "A full day at Sarnath",
        stops: [
          { time: "Morning", title: "Dhamek Stupa and the archaeological site", place: "dhamek-stupa", thing: "sarnath-buddhist-tour", durationMin: 150, walking: "moderate" },
          { time: "Late morning", title: "Sarnath Museum", place: "sarnath-museum", durationMin: 90, walking: "low", note: "Weekly closing day — check before you go [VERIFY]." },
          { time: "Afternoon", title: "Mulagandha Kuti Vihara and the temples", place: "mulagandha-kuti-vihara", durationMin: 90, walking: "low" },
          { time: "Late afternoon", title: "Chaukhandi Stupa", place: "chaukhandi-stupa", durationMin: 45, walking: "low" },
        ],
      },
    ],
    tips: ["Arrange transport for Sarnath in advance.", "Carry water and sun protection at Sarnath."],
  },
  {
    slug: "families",
    title: "Varanasi for Families",
    summary: "Two gentle days with children: boat rides, short walks, Sarnath's open spaces and plenty of breaks.",
    image: { src: "/img/harbour.jpg", alt: "Boats on the Ganga at Varanasi" },
    status: "review",
    days: 2,
    audience: ["Families with children"],
    pace: "relaxed",
    walking: "low",
    plan: [
      {
        day: 1,
        title: "On the river",
        stops: [
          { time: "Morning", title: "Boat ride from Assi", place: "assi", thing: "sunrise-boat-ride", durationMin: 90, walking: "low", note: "A slightly later start is fine with young children." },
          { time: "Late morning", title: "Snack break and rest", durationMin: 60, walking: "low" },
          { time: "Afternoon", title: "Rest at the hotel", durationMin: 150, walking: "low" },
          { time: "Evening", title: "Ganga Aarti from a boat", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low", note: "A boat keeps small children out of the crowd on the steps." },
        ],
      },
      {
        day: 2,
        title: "Sarnath and a craft session",
        stops: [
          { time: "Morning", title: "Sarnath by car", place: "sarnath", thing: "sarnath-buddhist-tour", durationMin: 180, walking: "low", note: "Plenty of open space; take breaks in the shade." },
          { time: "Afternoon", title: "Rest", durationMin: 120, walking: "low" },
          { time: "Late afternoon", title: "Handicraft workshop", thing: "handicraft-workshops", durationMin: 90, walking: "low" },
        ],
      },
    ],
    tips: [
      "Keep small children close in crowded lanes and on ghat steps.",
      "Ask for child-sized life jackets on boats.",
      "Plan a rest every afternoon.",
    ],
  },
  {
    slug: "senior-friendly",
    title: "Senior-Friendly Varanasi",
    summary: "Two calm days with little walking: the river from a boat, Sarnath by car and the southern temples reachable by road.",
    image: { src: "/img/boats.jpg", alt: "Boats along the ghats" },
    status: "review",
    days: 2,
    audience: ["Senior travellers", "Travellers with limited mobility"],
    pace: "relaxed",
    walking: "low",
    plan: [
      {
        day: 1,
        title: "The river, seated",
        stops: [
          { time: "Morning", title: "Gentle boat ride", place: "assi", thing: "sunrise-boat-ride", durationMin: 90, walking: "low", note: "Ask for help getting on and off; choose a ghat with gentler steps." },
          { time: "Late morning", title: "Rest and refreshments", durationMin: 60, walking: "low" },
          { time: "Afternoon", title: "Rest at the hotel", durationMin: 180, walking: "low" },
          { time: "Evening", title: "Ganga Aarti from a boat", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low", note: "Avoids standing in the crowd on the steps." },
        ],
      },
      {
        day: 2,
        title: "Temples by road and Sarnath",
        stops: [
          { time: "Morning", title: "Sankat Mochan Hanuman Temple", place: "sankat-mochan", durationMin: 60, walking: "low", note: "Reachable by road." },
          { time: "Late morning", title: "New Vishwanath Temple at BHU", place: "new-vishwanath-bhu", durationMin: 60, walking: "low", note: "Set in the BHU campus; reachable by car." },
          { time: "Afternoon", title: "Rest", durationMin: 150, walking: "low" },
          { time: "Late afternoon", title: "Sarnath by car", place: "sarnath", durationMin: 150, walking: "low", note: "Visit only the parts that feel comfortable; benches and shade are limited [VERIFY]." },
        ],
      },
    ],
    tips: [
      "Visiting Kashi Vishwanath involves walking through narrow lanes and queues; ask us about assistance options.",
      "Carry any medication and water with you.",
      "Avoid the midday heat between April and June.",
    ],
  },
  {
    slug: "solo",
    title: "Solo Traveller's Varanasi",
    summary: "Two days to explore on your own terms — dawn walks, the old city, food, music and the river.",
    image: { src: "/img/mural.jpg", alt: "Steps and a painted wall on a ghat" },
    status: "review",
    days: 2,
    audience: ["Solo travellers"],
    pace: "balanced",
    walking: "high",
    plan: [
      {
        day: 1,
        title: "Ghats and lanes",
        stops: [
          { time: "Early morning", title: "Morning walk along the ghats", place: "assi", thing: "morning-ghat-walk", durationMin: 180, walking: "high" },
          { time: "Late morning", title: "Heritage walk in the old city", thing: "heritage-walks", durationMin: 150, walking: "moderate", note: "A guide helps on the first visit — the lanes are a maze." },
          { time: "Afternoon", title: "Rest", durationMin: 120, walking: "low" },
          { time: "Evening", title: "Ganga Aarti", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low" },
        ],
      },
      {
        day: 2,
        title: "Food, river and music",
        stops: [
          { time: "Before sunrise", title: "Sunrise boat ride", place: "assi", thing: "sunrise-boat-ride", durationMin: 120, walking: "low", note: "Shared boats can be a sociable option." },
          { time: "Morning", title: "Food walk", thing: "food-walks", durationMin: 150, walking: "moderate" },
          { time: "Afternoon", title: "Yoga or a quiet afternoon", thing: "yoga-and-meditation", durationMin: 90, walking: "low" },
          { time: "Evening", title: "Classical music", thing: "classical-music", durationMin: 120, walking: "low", note: "Check current listings [VERIFY]." },
        ],
      },
    ],
    tips: [
      "Share your plans with someone and keep your phone charged.",
      "Decline unsolicited guides and 'helpers' politely and firmly.",
      "Read our solo-travel safety guide before you go.",
    ],
  },
  {
    slug: "heritage",
    title: "Cultural and Heritage Varanasi",
    summary: "Three days of history and culture: the ghats' architecture, Ramnagar Fort, Sarnath, BHU's museum and the weavers.",
    image: { src: "/img/varanasi.jpg", alt: "The Varanasi riverfront on a clear day" },
    status: "review",
    days: 3,
    audience: ["History lovers", "Culture seekers"],
    pace: "balanced",
    walking: "moderate",
    plan: [
      {
        day: 1,
        title: "The riverfront's history",
        stops: [
          { time: "Morning", title: "Heritage walk along the ghats", place: "scindia", thing: "heritage-walks", durationMin: 180, walking: "moderate" },
          { time: "Afternoon", title: "Rest", durationMin: 120, walking: "low" },
          { time: "Late afternoon", title: "Jantar Mantar at Man Mahal", place: "jantar-mantar", durationMin: 60, walking: "low", note: "Check current opening arrangements [VERIFY]." },
          { time: "Evening", title: "Ganga Aarti", place: "dashashwamedh", thing: "ganga-aarti", durationMin: 90, walking: "low" },
        ],
      },
      {
        day: 2,
        title: "Ramnagar and BHU",
        stops: [
          { time: "Morning", title: "Ramnagar Fort and museum", place: "ramnagar-fort", durationMin: 180, walking: "moderate" },
          { time: "Afternoon", title: "Bharat Kala Bhavan at BHU", place: "bharat-kala-bhavan", durationMin: 120, walking: "low", note: "Check museum hours [VERIFY]." },
          { time: "Late afternoon", title: "New Vishwanath Temple at BHU", place: "new-vishwanath-bhu", durationMin: 60, walking: "low" },
        ],
      },
      {
        day: 3,
        title: "Sarnath and the weavers",
        stops: [
          { time: "Morning", title: "Sarnath", place: "sarnath", thing: "sarnath-buddhist-tour", durationMin: 240, walking: "moderate" },
          { time: "Afternoon", title: "Silk weavers of Madanpura", thing: "silk-weaving-visits", durationMin: 150, walking: "low" },
        ],
      },
    ],
    tips: ["A guide with a background in history makes the old city far richer.", "Check museum opening days before you plan."],
  },
  {
    slug: "food-and-markets",
    title: "Food and Market Exploration",
    summary: "A day of breakfast kachori, bazaars, silk lanes, chaat and sweets — Varanasi through its food and markets.",
    image: { src: "/img/street_food.jpg", alt: "A kachori served with fried green chillies" },
    status: "review",
    days: 1,
    audience: ["Food lovers", "Shoppers"],
    pace: "balanced",
    walking: "moderate",
    plan: [
      {
        day: 1,
        title: "Eat, browse, repeat",
        stops: [
          { time: "Morning", title: "Breakfast food walk", thing: "food-walks", durationMin: 120, walking: "moderate", note: "Kachori-sabzi and jalebi near Godowlia." },
          { time: "Late morning", title: "Markets of the old city", thing: "market-exploration", durationMin: 150, walking: "moderate" },
          { time: "Afternoon", title: "Rest", durationMin: 120, walking: "low" },
          { time: "Late afternoon", title: "Silk weavers of Madanpura", thing: "silk-weaving-visits", durationMin: 120, walking: "low" },
          { time: "Evening", title: "Evening chaat, sweets and paan", thing: "food-walks", durationMin: 120, walking: "moderate" },
        ],
      },
    ],
    tips: [
      "Pace yourself — tastings add up.",
      "Carry some cash; smaller stalls may prefer it.",
      "Ask before drinking thandai whether it contains bhang.",
    ],
  },
];
