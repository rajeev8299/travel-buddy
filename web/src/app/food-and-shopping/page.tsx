import Link from "next/link";
import { CardGrid, JsonLd, PageHero } from "@/components/content";
import { FOOD, MARKETS, SHOPPING } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Food & Shopping in Varanasi",
  description: "What to eat in Varanasi — kachori, chaat, lassi, malaiyo, paan — and where to shop for Banarasi silk and crafts, with etiquette and authenticity tips.",
  path: "/food-and-shopping",
  image: "/img/street_food.jpg",
});

export default function FoodAndShoppingPage() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Food & Shopping", path: "/food-and-shopping" }];
  return (
    <>
      <PageHero eyebrow="Food & shopping" title="Eat and shop like a Banarasi" intro="The city's food, its markets and its famous silk — what to try, where to look, and how to buy fairly." image={{ src: "/img/street_food.jpg", alt: "" }} crumbs={crumbs} />
      <section className="section">
        <div className="shell stack">
          <header className="section__head"><div><h2>Food you cannot miss</h2></div><Link className="btn btn--outline" href="/food">Food guide →</Link></header>
          <CardGrid cards={FOOD.slice(0, 6).map((f) => ({ href: `/food/${f.slug}`, title: f.title, text: f.summary, image: f.image, kicker: f.availability }))} />
        </div>
      </section>
      <section className="section section--sand">
        <div className="shell stack">
          <header className="section__head"><div><h2>Markets</h2></div><Link className="btn btn--outline" href="/markets">All markets →</Link></header>
          <CardGrid cards={MARKETS.map((m) => ({ href: `/markets/${m.slug}`, title: m.title, text: m.summary, image: m.image }))} />
        </div>
      </section>
      <section className="section">
        <div className="shell stack">
          <header className="section__head"><div><h2>Shopping guides</h2></div><Link className="btn btn--outline" href="/shopping">All shopping guides →</Link></header>
          <CardGrid cards={SHOPPING.map((s) => ({ href: `/shopping/${s.slug}`, title: s.title, text: s.summary, image: s.image }))} />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
