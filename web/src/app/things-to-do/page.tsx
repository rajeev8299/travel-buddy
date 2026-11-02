import Link from "next/link";
import FilterableCards, { type FilterItem } from "@/components/FilterableCards";
import { JsonLd, PageHero } from "@/components/content";
import { ACTIVITIES, INTERESTS } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Things to Do in Varanasi",
  description: "Boat rides at sunrise and sunset, the Ganga Aarti, ghat walks, temple circuits, Sarnath, food walks, silk weaving and more — how to do each one well.",
  path: "/things-to-do",
  image: "/img/boats.jpg",
});

export default function ThingsPage() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Things to Do", path: "/things-to-do" }];
  const items: FilterItem[] = ACTIVITIES.map((a) => ({
    href: `/things-to-do/${a.slug}`,
    title: a.title,
    text: a.summary,
    image: a.image,
    kicker: `${a.timeOfDay} · ${a.typicalDuration}`,
    facets: { interest: a.interests },
    search: `${a.title} ${a.summary} ${a.suitableFor.join(" ")}`.toLowerCase(),
  }));
  return (
    <>
      <PageHero
        eyebrow="Things to do"
        title="Things to do in Varanasi"
        intro="Independent guides to the city's essential experiences — what each is, when to go and how to do it respectfully."
        image={{ src: "/img/boats.jpg", alt: "" }}
        crumbs={crumbs}
      />
      <section className="section">
        <div className="shell">
          <p className="notice notice--info" style={{ marginBottom: 28 }}>
            These guides are independent. Want someone to arrange it? See{" "}
            <Link href="/experiences">local experiences</Link> run by checked partners.
          </p>
          <FilterableCards items={items} placeholder="e.g. boat, Aarti, food" facets={[{ key: "interest", label: "Interest", options: INTERESTS.map((i) => ({ value: i.key, label: i.label })) }]} />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
