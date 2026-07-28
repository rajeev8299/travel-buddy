// Snapshot of the buddies/stories shown on the frontend (src/data.js) so the
// API has something to serve out of the box. Edit rows here — or better,
// once the app has real signups, drive these tables from actual data instead.

export const BUDDIES = [
  { name: "Ananya R.", city: "Varanasi", years: 6, rating: 4.9, tongue: "Hindi, English, Bhojpuri", hue: "#8E5AA8" },
  { name: "Tenzin D.", city: "Leh", years: 9, rating: 5.0, tongue: "Ladakhi, Hindi, English", hue: "#3A6BB0" },
  { name: "Maria F.", city: "South Goa", years: 4, rating: 4.8, tongue: "Konkani, English, Portuguese", hue: "#D2734A" },
  { name: "Ibalari S.", city: "Shillong", years: 5, rating: 4.9, tongue: "Khasi, English, Hindi", hue: "#2A8478" },
  { name: "Devendra P.", city: "Jaipur", years: 7, rating: 4.9, tongue: "Hindi, Rajasthani, English", hue: "#C25E3A" },
  { name: "Nithya S.", city: "Alleppey", years: 5, rating: 4.8, tongue: "Malayalam, Tamil, English", hue: "#2F8FA8" },
  { name: "Karma W.", city: "Spiti", years: 8, rating: 5.0, tongue: "Bhoti, Hindi, English", hue: "#5B6BB0" },
  { name: "Farhan A.", city: "Srinagar", years: 6, rating: 4.9, tongue: "Kashmiri, Urdu, English", hue: "#7A5AA8" },
];

// Same 12 photos the frontend ships in its own public/img/ folder (see
// src/data.js HERO_SLIDES) — seeded as "static" slides so the homepage has a
// rotating backdrop before an admin uploads anything of their own.
export const HERO_SLIDES = [
  { path: "img/boats.jpg", pos: "center 46%" },
  { path: "img/jaipur.jpg", pos: "center 52%" },
  { path: "img/market.jpg", pos: "center 55%" },
  { path: "img/ladakh.jpg", pos: "center 50%" },
  { path: "img/mural.jpg", pos: "center 55%" },
  { path: "img/meghalaya.jpg", pos: "center 50%" },
  { path: "img/harbour.jpg", pos: "center 55%" },
  { path: "img/alleppey.jpg", pos: "center 52%" },
  { path: "img/monks.jpg", pos: "center 60%" },
  { path: "img/goa.jpg", pos: "center 55%" },
  { path: "img/riverfront.jpg", pos: "center 48%" },
  { path: "img/stupa.jpg", pos: "center 45%" },
];

export const STORIES = [
  {
    quote:
      "We had three days in Jaipur and no plan. Our buddy took one look at us, cancelled the fort tour and walked us through the old city instead. Best decision of the trip.",
    name: "Devika & Arun M.",
    trip: "Jaipur, 3 days",
  },
  {
    quote:
      "I'm a solo woman traveller and I'd been nervous about Varanasi. Ananya met me at the station at 11pm and I never once felt unsafe. That is worth every rupee.",
    name: "Sara T.",
    trip: "Varanasi, 4 days",
  },
  {
    quote:
      "Tenzin noticed my altitude headache before I did, rerouted the whole day and got me to a lower village. Then we still made it to Pangong the next morning.",
    name: "Rahul K.",
    trip: "Leh–Ladakh, 7 days",
  },
  {
    quote:
      "My parents are in their seventies. I expected to spend the week worrying. Instead our buddy found the one boat with a proper handrail and we all just enjoyed ourselves.",
    name: "Priya N.",
    trip: "Alleppey, 5 days",
  },
];
