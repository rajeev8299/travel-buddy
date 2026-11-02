import { CardGrid, JsonLd, PageHero } from "@/components/content";
import { ARTICLES } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Explore Varanasi: History, Faith & Culture",
  description: "The story of Varanasi — its names, history, the Ganga and the ghats, its place in Hindu, Buddhist and Jain traditions, and its arts and crafts.",
  path: "/explore",
  image: "/img/mural.jpg",
});

export default function ExplorePage() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Explore Varanasi", path: "/explore" }];
  const sorted = ARTICLES.slice().sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHero
        eyebrow="Explore Varanasi"
        title="The story of Kashi, Banaras and Varanasi"
        intro="History, faith, the river and the arts — written to separate what is documented from what tradition holds."
        image={{ src: "/img/mural.jpg", alt: "" }}
        crumbs={crumbs}
      />
      <section className="section">
        <div className="shell">
          <CardGrid
            cards={sorted.map((a) => ({
              href: `/explore/${a.slug}`, title: a.title, text: a.summary, image: a.image,
              kicker: a.readingMinutes ? `${a.readingMinutes} min read` : undefined,
            }))}
          />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
