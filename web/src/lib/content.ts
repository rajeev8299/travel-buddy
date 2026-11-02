import { PLACES } from "@/content/places";
import { ARTICLES } from "@/content/explore";
import { ACTIVITIES } from "@/content/things";
import { EXPERIENCES } from "@/content/experiences";
import { ITINERARIES } from "@/content/itineraries";
import { FESTIVALS } from "@/content/festivals";
import { FOOD, MARKETS, SHOPPING } from "@/content/food";
import { GUIDES } from "@/content/guides";
import { SERVICES } from "@/content/services";
import type { Interest, Place, PlaceCategory } from "@/content/types";

export { PLACES, ARTICLES, ACTIVITIES, EXPERIENCES, ITINERARIES, FESTIVALS, FOOD, MARKETS, SHOPPING, GUIDES, SERVICES };

export const PLACE_CATEGORIES: Record<PlaceCategory, { title: string; summary: string; image: { src: string; alt: string } }> = {
  temples: {
    title: "Temples",
    summary: "Kashi Vishwanath, Sankat Mochan, Durga Kund and more — with rules, darshan and respectful-visit guidance.",
    image: { src: "/img/ganga_aarti.jpg", alt: "Priests performing the Ganga Aarti with raised brass lamps at night" },
  },
  ghats: {
    title: "Ghats",
    summary: "The stepped riverfront from Assi to Raj Ghat — rituals, history and how to walk it well.",
    image: { src: "/img/varanasi.jpg", alt: "Stone ghat steps beside the Ganga in Varanasi" },
  },
  heritage: {
    title: "Heritage & culture",
    summary: "Sarnath, Ramnagar Fort, museums and monuments that tell the city's longer story.",
    image: { src: "/img/stupa.jpg", alt: "The Dhamek Stupa at Sarnath" },
  },
  nearby: {
    title: "Nearby destinations",
    summary: "Short excursions from Varanasi, and longer trips to Prayagraj, Bodh Gaya and Ayodhya.",
    image: { src: "/img/monks.jpg", alt: "Two monks in maroon robes seated near the Dhamek Stupa at Sarnath" },
  },
};

export const INTERESTS: { key: Interest; label: string }[] = [
  { key: "spiritual", label: "Spiritual" },
  { key: "river", label: "River & ghats" },
  { key: "heritage", label: "History & heritage" },
  { key: "food", label: "Food" },
  { key: "shopping", label: "Shopping & crafts" },
  { key: "culture", label: "Music & culture" },
  { key: "buddhist", label: "Buddhist Sarnath" },
  { key: "photography", label: "Photography" },
  { key: "family", label: "Family-friendly" },
  { key: "wellness", label: "Yoga & wellbeing" },
];

export const placePath = (p: Pick<Place, "category" | "slug">) => `/places/${p.category}/${p.slug}`;
export const findPlace = (slug: string) => PLACES.find((p) => p.slug === slug && !p.canonical) ?? PLACES.find((p) => p.slug === slug);
export const findActivity = (slug: string) => ACTIVITIES.find((a) => a.slug === slug);

/** Everything searchable, in one flat list (FR-SRCH). Built at build time. */
export interface SearchDoc {
  type: string;
  title: string;
  summary: string;
  href: string;
  keywords: string;
}

export function searchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  const add = (type: string, title: string, summary: string, href: string, extra = "") =>
    docs.push({ type, title, summary, href, keywords: `${title} ${summary} ${extra}`.toLowerCase() });

  for (const p of PLACES) if (!p.canonical) add(PLACE_CATEGORIES[p.category].title.replace(/s$/, ""), p.title, p.summary, placePath(p), `${p.area ?? ""} ${p.interests.join(" ")}`);
  for (const a of ARTICLES) add("Explore", a.title, a.summary, `/explore/${a.slug}`);
  for (const a of ACTIVITIES) add("Things to do", a.title, a.summary, `/things-to-do/${a.slug}`, a.interests.join(" "));
  for (const e of EXPERIENCES) add("Local experience", e.title, e.summary, `/experiences/${e.slug}`);
  for (const i of ITINERARIES) add("Itinerary", i.title, i.summary, `/plan/itineraries/${i.slug}`, i.audience.join(" "));
  for (const f of FESTIVALS) add("Festival", f.title, f.summary, `/festivals/${f.slug}`, f.season);
  for (const f of FOOD) add("Food", f.title, f.summary, `/food/${f.slug}`);
  for (const m of MARKETS) add("Market", m.title, m.summary, `/markets/${m.slug}`, m.knownFor.join(" "));
  for (const s of SHOPPING) add("Shopping", s.title, s.summary, `/shopping/${s.slug}`);
  for (const g of GUIDES) add("Travel guide", g.title, g.summary, `/travel-guide/${g.slug}`);
  for (const c of SERVICES) {
    add("Service", c.title, c.summary, `/services/${c.slug}`);
    for (const it of c.items) add("Service", it.title, it.summary, `/services/${c.slug}/${it.slug}`, c.title);
  }
  return docs;
}
