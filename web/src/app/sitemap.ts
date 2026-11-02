import type { MetadataRoute } from "next";
import { ABOUT } from "@/content/about";
import {
  ACTIVITIES, ARTICLES, EXPERIENCES, FESTIVALS, FOOD, GUIDES, ITINERARIES, MARKETS, PLACES, PLACE_CATEGORIES, SERVICES, SHOPPING, placePath,
} from "@/lib/content";
import { getBlogIndex, getCategories } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// Only indexable pages: hubs always; detail pages once their content is
// verified ("published"). Pages under review are noindex and stay out of the
// sitemap until a fact-checker signs them off (product/06-seo.md).
// Blog posts come from the API: only live ones. The build has no API, so the
// prerendered sitemap leaves them out; a short revalidate fills them in within
// a minute of a deploy instead of serving that empty copy for longer.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string, priority = 0.6) => ({ url: `${SITE_URL}${path}`, priority });
  const hubs = [
    url("/", 1), url("/explore", 0.8), url("/places", 0.9), url("/things-to-do", 0.9), url("/experiences", 0.7),
    url("/plan", 0.9), url("/plan/trip-planner", 0.9), url("/plan/itineraries", 0.8), url("/travel-guide", 0.8),
    url("/festivals", 0.7), url("/food-and-shopping", 0.6), url("/food", 0.7), url("/shopping", 0.6), url("/markets", 0.6),
    url("/services", 0.7), url("/blog", 0.7), url("/about", 0.4), url("/become-a-buddy", 0.5),
    ...Object.keys(PLACE_CATEGORIES).map((c) => url(`/places/${c}`, 0.8)),
    ...SERVICES.map((s) => url(`/services/${s.slug}`, 0.6)),
    ...ABOUT.filter((a) => !["about", "photo-credits"].includes(a.slug)).map((a) => url(`/about/${a.slug}`, 0.3)),
  ];
  const pub = <T extends { status: string }>(xs: T[]) => xs.filter((x) => x.status === "published");
  const details = [
    ...pub(PLACES).filter((p) => !p.canonical).map((p) => url(placePath(p), 0.8)),
    ...pub(ARTICLES).map((a) => url(`/explore/${a.slug}`)),
    ...pub(ACTIVITIES).map((a) => url(`/things-to-do/${a.slug}`, 0.8)),
    ...pub(EXPERIENCES).filter((e) => e.partnerStatus === "verified").map((e) => url(`/experiences/${e.slug}`)),
    ...pub(ITINERARIES).map((i) => url(`/plan/itineraries/${i.slug}`, 0.8)),
    ...pub(FESTIVALS).map((f) => url(`/festivals/${f.slug}`)),
    ...pub(FOOD).map((f) => url(`/food/${f.slug}`)),
    ...pub(MARKETS).map((m) => url(`/markets/${m.slug}`)),
    ...pub(SHOPPING).map((s) => url(`/shopping/${s.slug}`)),
    ...pub(GUIDES).map((g) => url(`/travel-guide/${g.slug}`, 0.7)),
  ];
  const [posts, categories] = await Promise.all([getBlogIndex(60).catch(() => []), getCategories(60).catch(() => [])]);
  const blog = [
    ...categories.filter((c) => c.count > 0).map((c) => url(`/blog/category/${c.slug}`, 0.5)),
    ...posts.map((p) => ({ ...url(`/blog/${p.slug}`), lastModified: p.updatedAt })),
  ];
  return [...hubs, ...details, ...blog];
}
