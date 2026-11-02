import Link from "next/link";
import { CardGrid, JsonLd, PageHero, SectionHead } from "@/components/content";
import { ITINERARIES } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Plan Your Varanasi Trip",
  description: "Build a realistic Varanasi itinerary for 1, 2 or 3 days — or start from a ready-made plan for pilgrims, families, seniors, solo travellers and food lovers.",
  path: "/plan",
  image: "/img/boats.jpg",
});

export default function PlanHub() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Plan Your Trip", path: "/plan" }];
  return (
    <>
      <PageHero eyebrow="Plan your trip" title="Plan Varanasi realistically" intro="Build your own day-by-day plan around your interests, pace and walking — or start from one of ours and make it yours." image={{ src: "/img/boats.jpg", alt: "" }} crumbs={crumbs}>
        <div className="btn-row" style={{ marginTop: 22 }}>
          <Link className="btn btn--primary" href="/plan/trip-planner">Open the trip planner</Link>
          <Link className="btn btn--outline" href="/plan/my-trips">My saved trips</Link>
        </div>
      </PageHero>
      <section className="section">
        <div className="shell">
          <SectionHead title="Ready-made plans" text="Realistic plans with walking stretches and rest breaks included. Open one, then customise it in the planner." />
          <CardGrid cards={ITINERARIES.map((i) => ({ href: `/plan/itineraries/${i.slug}`, title: i.title, text: i.summary, image: i.image, kicker: `${i.days} ${i.days === 1 ? "day" : "days"} · ${i.walking} walking` }))} />
        </div>
      </section>
      <section className="section section--sand">
        <div className="shell grid grid--3">
          <Link href="/travel-guide/best-time-to-visit" className="tile"><strong>When to go</strong><span>Seasons, heat, monsoon and festival crowds.</span></Link>
          <Link href="/travel-guide/how-to-reach" className="tile"><strong>Getting here</strong><span>Airport, railway stations and arrival tips.</span></Link>
          <Link href="/services/assistance" className="tile"><strong>Get planning help</strong><span>Families, seniors, groups and custom itineraries.</span></Link>
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
