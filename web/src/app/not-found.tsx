import Link from "next/link";
import { PageHero } from "@/components/content";

export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title="That lane doesn't lead anywhere" intro="Like the gallis of the old city, links sometimes end at a wall. Try one of these instead." />
      <section className="section">
        <div className="shell grid grid--3">
          <Link className="tile" href="/places"><strong>Places to visit</strong><span>Temples, ghats and Sarnath</span></Link>
          <Link className="tile" href="/plan/trip-planner"><strong>Plan your trip</strong><span>A realistic plan in a minute</span></Link>
          <Link className="tile" href="/search"><strong>Search</strong><span>Find what you were looking for</span></Link>
        </div>
      </section>
    </>
  );
}
