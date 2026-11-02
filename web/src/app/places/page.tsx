import Link from "next/link";
import FilterableCards, { type FilterItem } from "@/components/FilterableCards";
import { JsonLd, PageHero } from "@/components/content";
import { INTERESTS, PLACES, PLACE_CATEGORIES, placePath } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import type { PlaceCategory } from "@/content/types";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Places to Visit in Varanasi",
  description: "Temples, ghats, Sarnath, museums and nearby destinations — a searchable directory of places to visit in Varanasi, with respectful visiting guidance.",
  path: "/places",
  image: "/img/riverfront.jpg",
});

export default function PlacesPage() {
  const items: FilterItem[] = PLACES.filter((p) => !p.canonical).map((p) => ({
    href: placePath(p),
    title: p.title,
    text: p.summary,
    image: p.image,
    kicker: PLACE_CATEGORIES[p.category].title,
    facets: { category: [p.category], interest: p.interests, senior: p.seniorFriendly ? [p.seniorFriendly] : [] },
    search: `${p.title} ${p.summary} ${p.area ?? ""}`.toLowerCase(),
  }));

  return (
    <>
      <PageHero
        eyebrow="Places to visit"
        title="Places to visit in Varanasi"
        intro="Temples, ghats, heritage sites and nearby destinations — with what each means, how to visit respectfully, and what's been verified."
        image={{ src: "/img/riverfront.jpg", alt: "" }}
        crumbs={[{ name: "Home", path: "/" }, { name: "Places to Visit", path: "/places" }]}
      />
      <section className="section">
        <div className="shell">
          <div className="grid grid--4" style={{ marginBottom: 40 }}>
            {(Object.keys(PLACE_CATEGORIES) as PlaceCategory[]).map((c) => (
              <Link key={c} href={`/places/${c}`} className="tile">
                <strong>{PLACE_CATEGORIES[c].title}</strong>
                <span>{PLACE_CATEGORIES[c].summary}</span>
              </Link>
            ))}
          </div>
          <h2 style={{ marginBottom: 18 }}>All places</h2>
          <FilterableCards
            items={items}
            placeholder="e.g. Assi, Sarnath, temple"
            facets={[
              { key: "category", label: "Type", options: (Object.keys(PLACE_CATEGORIES) as PlaceCategory[]).map((c) => ({ value: c, label: PLACE_CATEGORIES[c].title })) },
              { key: "interest", label: "Interest", options: INTERESTS.map((i) => ({ value: i.key, label: i.label })) },
              { key: "senior", label: "Senior-friendly", options: [{ value: "yes", label: "Yes" }, { value: "partly", label: "Partly" }] },
            ]}
          />
        </div>
      </section>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Places to Visit", path: "/places" }])} />
      <NextStep />
    </>
  );
}
