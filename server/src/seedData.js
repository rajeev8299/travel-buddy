// Snapshot of the buddies/stories shown on the frontend (src/data.js) so the
// API has something to serve out of the box. Edit rows here — or better,
// once the app has real signups, drive these tables from actual data instead.

export const BUDDIES = [
  { name: "Ananya R.", city: "Assi Ghat", years: 6, rating: 4.9, tongue: "Hindi, English, Bhojpuri", hue: "#8E5AA8" },
  { name: "Vikas M.", city: "Dashashwamedh", years: 9, rating: 5.0, tongue: "Hindi, Bhojpuri, English", hue: "#3A6BB0" },
  { name: "Shabana K.", city: "Madanpura", years: 5, rating: 4.9, tongue: "Urdu, Hindi, English", hue: "#D2734A" },
  { name: "Tenzin L.", city: "Sarnath", years: 7, rating: 4.9, tongue: "Tibetan, Hindi, English", hue: "#2A8478" },
  { name: "Rohit P.", city: "Godowlia", years: 4, rating: 4.8, tongue: "Hindi, Bengali, English", hue: "#C25E3A" },
  { name: "Meera S.", city: "Shivala Ghat", years: 5, rating: 4.8, tongue: "Hindi, English, French", hue: "#2F8FA8" },
  { name: "Ajay N.", city: "Manikarnika", years: 8, rating: 5.0, tongue: "Hindi, Bhojpuri, English", hue: "#5B6BB0" },
  { name: "Lakshmi V.", city: "Kedar Ghat", years: 6, rating: 4.9, tongue: "Tamil, Hindi, English", hue: "#7A5AA8" },
];

// Authentic Banaras & Sarnath photographs
export const HERO_SLIDES = [
  { path: "img/boats.jpg", pos: "center 46%" },
  { path: "img/dev_diwali.jpg", pos: "center 50%" },
  { path: "img/market.jpg", pos: "center 55%" },
  { path: "img/ganga_sunrise.jpg", pos: "center 48%" },
  { path: "img/mural.jpg", pos: "center 55%" },
  { path: "img/harbour.jpg", pos: "center 55%" },
  { path: "img/kashi_vishwanath.jpg", pos: "center 52%" },
  { path: "img/monks.jpg", pos: "center 60%" },
  { path: "img/riverfront.jpg", pos: "center 48%" },
  { path: "img/stupa.jpg", pos: "center 45%" },
];

export const STORIES = [
  {
    quote:
      "We had three days and no plan. Our buddy took one look at us, skipped the crowded evening boat and walked us down to Assi at dawn instead. Best decision of the trip.",
    name: "Devika & Arun M.",
    trip: "Varanasi, 3 days",
  },
  {
    quote:
      "I'm a solo woman traveller and I'd been nervous about Varanasi. Ananya met me at the station at 11pm and I never once felt unsafe. That is worth every rupee.",
    name: "Sara T.",
    trip: "Varanasi, 4 days",
  },
  {
    quote:
      "Vikas noticed I was wilting in the afternoon heat, swapped the temple queue for a shaded silk workshop in Madanpura, and still got us to Dashashwamedh in time for the Aarti.",
    name: "Rahul K.",
    trip: "Varanasi & Sarnath, 5 days",
  },
  {
    quote:
      "My parents are in their seventies. I expected to spend the week worrying about the ghat steps. Instead our buddy found the gentlest way down and a boat with a proper handrail.",
    name: "Priya N.",
    trip: "Varanasi, 5 days",
  },
];
