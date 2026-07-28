import { Compass, ShieldCheck, Sparkles } from "lucide-react";

export const BRAND = "TravelOnBuddy";
export const TAGLINE = "Travel together, travel better";

/* Public-folder assets must go through BASE_URL — the build is opened
   straight off disk via file://, where a bare "/img/x.jpg" resolves to the
   filesystem root instead of the app folder. */
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/* API-served content (hero slides, buddies, stories) can point at a path
   inside our own public/ folder ("img/x.jpg", needs BASE_URL) or a full URL
   on the backend (an admin-uploaded file) — this tells them apart. */
export const resolveSrc = (src) => (/^https?:\/\//.test(src) ? src : asset(src));

/* `end` marks the index route — without it NavLink treats "/" as a prefix and
   Home would light up as active on every page. */
export const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/why-buddy", label: "Why Buddy" },
  { to: "/buddies", label: "Your Buddies" },
  { to: "/stories", label: "Stories" },
];

/* Interleaved so no two consecutive frames share a palette or a subject —
   the Varanasi shots are spaced out between the other destinations. Each
   `pos` keeps that photo's subject in frame once the wide hero crop bites. */
export const HERO_SLIDES = [
  { src: asset("img/boats.jpg"), pos: "center 46%" },
  { src: asset("img/jaipur.jpg"), pos: "center 52%" },
  { src: asset("img/market.jpg"), pos: "center 55%" },
  { src: asset("img/ladakh.jpg"), pos: "center 50%" },
  { src: asset("img/mural.jpg"), pos: "center 55%" },
  { src: asset("img/meghalaya.jpg"), pos: "center 50%" },
  { src: asset("img/harbour.jpg"), pos: "center 55%" },
  { src: asset("img/alleppey.jpg"), pos: "center 52%" },
  { src: asset("img/monks.jpg"), pos: "center 60%" },
  { src: asset("img/goa.jpg"), pos: "center 55%" },
  { src: asset("img/riverfront.jpg"), pos: "center 48%" },
  { src: asset("img/stupa.jpg"), pos: "center 45%" },
];

export const SLIDE_MS = 6500;

/* Options for the "Where to" combobox on Home and Plan. */
export const CITIES = [
  { name: "Varanasi", state: "Uttar Pradesh" },
  { name: "Jaipur", state: "Rajasthan" },
  { name: "Udaipur", state: "Rajasthan" },
  { name: "Jaisalmer", state: "Rajasthan" },
  { name: "Pushkar", state: "Rajasthan" },
  { name: "Agra", state: "Uttar Pradesh" },
  { name: "Rishikesh", state: "Uttarakhand" },
  { name: "Amritsar", state: "Punjab" },
  { name: "Leh–Ladakh", state: "Ladakh" },
  { name: "Spiti Valley", state: "Himachal Pradesh" },
  { name: "Darjeeling", state: "West Bengal" },
  { name: "Shillong", state: "Meghalaya" },
  { name: "Cherrapunji", state: "Meghalaya" },
  { name: "Kaziranga", state: "Assam" },
  { name: "Alleppey", state: "Kerala" },
  { name: "Munnar", state: "Kerala" },
  { name: "Kochi", state: "Kerala" },
  { name: "Hampi", state: "Karnataka" },
  { name: "Coorg", state: "Karnataka" },
  { name: "Mysore", state: "Karnataka" },
  { name: "Pondicherry", state: "Puducherry" },
  { name: "South Goa", state: "Goa" },
  { name: "Khajuraho", state: "Madhya Pradesh" },
  { name: "Andaman Islands", state: "Andaman & Nicobar" },
];

export const FEATURES = [
  {
    icon: Compass,
    title: "A real local, not a script",
    body: "Your buddy actually lives there. They'll change the plan when it rains, when a wedding procession blocks the lane, or when you'd simply rather sit and watch.",
  },
  {
    icon: ShieldCheck,
    title: "Verified and accountable",
    body: "Every buddy is ID-checked, reference-checked and insured. One number to call, 24 hours a day, for as long as you're travelling with us.",
  },
  {
    icon: Sparkles,
    title: "Built around your pace",
    body: "Tell us you hate early mornings, love street food, or need a wheelchair-friendly route. The itinerary is written after that conversation, not before it.",
  },
];

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

export const STATS = [
  { value: "180+", label: "verified local buddies" },
  { value: "42", label: "towns & cities" },
  { value: "4.9", label: "average trip rating" },
];

/* ------------------------------------------------------------- auth / roles
   Two audiences share the site: travellers (the people booking trips) and
   clients (B2B partners — hotels, travel desks, concierges). They get the
   same form shape but different copy and slightly different fields, so the
   pages stay a thin wrapper around a single component. */
export const ROLES = [
  {
    id: "user",
    label: "Traveller",
    blurb: "I'm planning a trip and want to be matched with a local buddy.",
  },
  {
    id: "client",
    label: "Client",
    blurb: "I run a hotel, travel desk or concierge and want to refer guests.",
  },
];

export const AUTH = {
  login: {
    title: "Welcome back",
    eyebrow: "Log in",
    intro:
      "Pick up where you left off — your saved trips, draft plans and the buddies you've been chatting with are all here.",
    cta: "Log in",
    switchPrompt: "New to TravelOnBuddy?",
    switchLabel: "Create an account",
    switchTo: "/signup",
  },
  signup: {
    title: "Create your account",
    eyebrow: "Sign up",
    intro:
      "A few details and you're in. You can finish your profile whenever — we won't block the fun parts on paperwork.",
    cta: "Create account",
    switchPrompt: "Already with us?",
    switchLabel: "Log in instead",
    switchTo: "/login",
  },
};
