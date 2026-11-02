import { notFound } from "next/navigation";
import { CardGrid, JsonLd, PageHero } from "@/components/content";
import { PLACES, PLACE_CATEGORIES, placePath } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import type { PlaceCategory } from "@/content/types";
import { NextStep } from "@/components/NextStep";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PLACE_CATEGORIES).map((category) => ({ category }));
}

const isCategory = (c: string): c is PlaceCategory => c in PLACE_CATEGORIES;

export async function generateMetadata({ params }: PageProps<"/places/[category]">) {
  const { category } = await params;
  if (!isCategory(category)) return {};
  const c = PLACE_CATEGORIES[category];
  return pageMeta({ title: `${c.title} in Varanasi`, description: c.summary, path: `/places/${category}`, image: c.image.src });
}

export default async function CategoryPage({ params }: PageProps<"/places/[category]">) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const c = PLACE_CATEGORIES[category];
  const places = PLACES.filter((p) => p.category === category);
  const crumbs = [{ name: "Home", path: "/" }, { name: "Places", path: "/places" }, { name: c.title, path: `/places/${category}` }];
  const card = (p: (typeof places)[number]) => ({
    href: p.canonical ?? placePath(p), title: p.title, text: p.summary, image: p.image, kicker: p.area,
  });

  return (
    <>
      <PageHero eyebrow="Places to visit" title={`${c.title} in Varanasi`} intro={c.summary} image={c.image} crumbs={crumbs} />
      <section className="section">
        <div className="shell">
          {category === "nearby" ? (
            <>
              <h2 style={{ marginBottom: 6 }}>Short excursions</h2>
              <p className="lead" style={{ marginBottom: 20 }}>Easy to fit into a day from Varanasi.</p>
              <CardGrid cards={places.filter((p) => p.tripType !== "intercity").map(card)} />
              <h2 style={{ margin: "48px 0 6px" }}>Longer trips</h2>
              <p className="lead" style={{ marginBottom: 20 }}>Intercity journeys — an overnight stay is usually more comfortable.</p>
              <CardGrid cards={places.filter((p) => p.tripType === "intercity").map(card)} />
            </>
          ) : (
            <CardGrid cards={places.map(card)} />
          )}
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
