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

/* All hero slides are authentic Varanasi (Banaras) & Sarnath photographs.
   Features sunrise Ganga boats, Dev Deepawali night reflections, riverfront ghats,
   ancient stone steps, and morning Dhamek Stupa ruins. */
export const HERO_SLIDES = [
  { src: asset("img/boats.jpg"), pos: "center 46%" },
  { src: asset("img/dev_diwali.jpg"), pos: "center 50%" },
  { src: asset("img/market.jpg"), pos: "center 55%" },
  { src: asset("img/ganga_sunrise.jpg"), pos: "center 48%" },
  { src: asset("img/mural.jpg"), pos: "center 55%" },
  { src: asset("img/ghats_dawn.jpg"), pos: "center 50%" },
  { src: asset("img/harbour.jpg"), pos: "center 55%" },
  { src: asset("img/kashi_vishwanath.jpg"), pos: "center 52%" },
  { src: asset("img/monks.jpg"), pos: "center 60%" },
  { src: asset("img/banaras_ghats_steps.jpg"), pos: "center 55%" },
  { src: asset("img/riverfront.jpg"), pos: "center 48%" },
  { src: asset("img/stupa.jpg"), pos: "center 45%" },
];

export const SLIDE_MS = 6500;

/* Options for the "Where to" combobox on Home and Plan. */
export const CITIES = [
  { name: "Varanasi", state: "Anywhere in the city" },
  { name: "Dashashwamedh Ghat", state: "Ganga Aarti" },
  { name: "Assi Ghat", state: "Southern ghats" },
  { name: "Manikarnika Ghat", state: "Northern ghats" },
  { name: "Kashi Vishwanath", state: "Old city" },
  { name: "Godowlia & Chowk", state: "Old-city bazaars" },
  { name: "Madanpura", state: "Silk weavers" },
  { name: "Sarnath", state: "Day trip, 10 km" },
  { name: "Ramnagar Fort", state: "Across the river" },
  { name: "BHU & Lanka", state: "University area" },
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
  { name: "Ananya R.", city: "Assi Ghat", years: 6, rating: 4.9, tongue: "Hindi, English, Bhojpuri", hue: "#8E5AA8" },
  { name: "Vikas M.", city: "Dashashwamedh", years: 9, rating: 5.0, tongue: "Hindi, Bhojpuri, English", hue: "#3A6BB0" },
  { name: "Shabana K.", city: "Madanpura", years: 5, rating: 4.9, tongue: "Urdu, Hindi, English", hue: "#D2734A" },
  { name: "Tenzin L.", city: "Sarnath", years: 7, rating: 4.9, tongue: "Tibetan, Hindi, English", hue: "#2A8478" },
  { name: "Rohit P.", city: "Godowlia", years: 4, rating: 4.8, tongue: "Hindi, Bengali, English", hue: "#C25E3A" },
  { name: "Meera S.", city: "Shivala Ghat", years: 5, rating: 4.8, tongue: "Hindi, English, French", hue: "#2F8FA8" },
  { name: "Ajay N.", city: "Manikarnika", years: 8, rating: 5.0, tongue: "Hindi, Bhojpuri, English", hue: "#5B6BB0" },
  { name: "Lakshmi V.", city: "Kedar Ghat", years: 6, rating: 4.9, tongue: "Tamil, Hindi, English", hue: "#7A5AA8" },
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

export const STATS = [
  { value: "180+", label: "verified local buddies" },
  { value: "84", label: "ghats along the Ganga" },
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
