// Content model for the public site. Mirrors the CMS model in
// product/05-cms.md so these local files can later be replaced by the CMS API
// without touching the pages.
//
// Truth rules (Requirements.md FR-CMS-05, product/09-verification-checklist.md):
// - `status: "review"` content is shown with a "being verified" notice and is
//   kept out of search engines (noindex) until a fact-checker signs it off.
// - A time-sensitive Fact with `value: null` is rendered as "not yet verified"
//   with the source to check — never as a guess.

export type Status = "published" | "review";

export interface Source {
  title: string;
  url?: string;
  publisher?: string;
}

/** A time-sensitive or operational fact (timings, fees, rules, distances…). */
export interface Fact {
  label: string;
  /** null until verified against `source`. */
  value: string | null;
  verifiedOn?: string; // ISO date
  source?: string; // where to verify it, e.g. "Shri Kashi Vishwanath Temple Trust website"
}

export interface Faq {
  q: string;
  a: string;
}

export interface Img {
  src: string; // path under /public, e.g. "/img/boats.jpg"
  alt: string;
}

export interface Base {
  slug: string;
  title: string;
  /** ≤ 160 chars; used on cards and as the default meta description. */
  summary: string;
  image?: Img;
  status: Status;
  lastVerified?: string | null;
  nextReview?: string | null;
  sources?: Source[];
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  faqs?: Faq[];
}

export type PlaceCategory = "temples" | "ghats" | "heritage" | "nearby";

export interface Place extends Base {
  category: PlaceCategory;
  /** nearby destinations only */
  tripType?: "short-excursion" | "intercity";
  area?: string;
  /** Suggested time to spend (labelled "Suggested" on the page). */
  suggestedDuration?: string;
  interests: Interest[];
  seniorFriendly?: "yes" | "partly" | "no";
  facts?: Fact[];
  /** Short sections when there is no long-form Markdown file. */
  sections?: { heading: string; body: string }[];
  related?: { places?: string[]; things?: string[] };
  /** For cross-listed pages (e.g. Sarnath in nearby) — canonical path. */
  canonical?: string;
}

export type Interest =
  | "spiritual"
  | "heritage"
  | "river"
  | "food"
  | "shopping"
  | "culture"
  | "buddhist"
  | "photography"
  | "family"
  | "wellness";

export interface Activity extends Base {
  interests: Interest[];
  typicalDuration: string; // "Suggested" label
  timeOfDay: string;
  suitableFor: string[];
  sections?: { heading: string; body: string }[];
  safety?: string[];
  related?: { places?: string[]; experiences?: string[]; services?: string[] };
}

export type PartnerStatus = "verified" | "trial" | "pending";

export interface Experience extends Base {
  activity: string; // things-to-do slug
  partnerStatus: PartnerStatus;
  partnerName?: string;
  duration: string;
  schedule: string[];
  suitableFor: string[];
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string;
  priceRange: string | null; // null → "Price on request"
  safety: string[];
  cancellation: string;
}

export interface ItineraryStop {
  time: string; // "Early morning", "07:30" etc — suggested
  title: string;
  place?: string; // place slug
  thing?: string; // activity slug
  durationMin: number;
  walking: "low" | "moderate" | "high";
  note?: string;
}

export interface Itinerary extends Base {
  days: number;
  audience: string[];
  pace: "relaxed" | "balanced" | "full";
  walking: "low" | "moderate" | "high";
  plan: { day: number; title: string; stops: ItineraryStop[] }[];
  tips?: string[];
}

export interface Festival extends Base {
  season: string; // typical season, e.g. "October–November (Kartik Purnima)"
  /** Only shown as confirmed when verified from an official source. */
  dates: { year: number; value: string | null; status: "confirmed" | "expected" }[];
  locations: string[];
  crowd: "moderate" | "high" | "very high";
  sections?: { heading: string; body: string }[];
  advice: string[];
}

export interface FoodItem extends Base {
  availability: string;
  dietary: string;
  whereToFind: string;
  tips: string[];
  sections?: { heading: string; body: string }[];
}

export interface Market extends Base {
  knownFor: string[];
  tips: string[];
  sections?: { heading: string; body: string }[];
}

export interface ShoppingGuide extends Base {
  sections: { heading: string; body: string }[];
}

export interface Article extends Base {
  /** Explore hub ordering */
  order: number;
  readingMinutes?: number;
}

export interface Guide extends Base {
  group: "essentials" | "getting-here" | "safety" | "practical";
  sections?: { heading: string; body: string }[];
}

export interface ServiceItem {
  slug: string;
  title: string;
  summary: string;
  coverage: string;
  includes: string[];
  limitations: string[];
  estimate: string | null; // null → "Quoted on enquiry"
  responseExpectation: string;
  partnerStatus: PartnerStatus;
}

export interface ServiceCategory {
  slug: string;
  title: string;
  summary: string;
  image?: Img;
  items: ServiceItem[];
}
