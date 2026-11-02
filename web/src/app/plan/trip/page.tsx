import { Suspense } from "react";
import { PageHero } from "@/components/content";
import SharedTrip from "@/components/SharedTrip";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({ title: "A shared Varanasi plan", description: "A Varanasi trip plan shared with you.", path: "/plan/trip", noindex: true });

export default function SharedTripPage() {
  return (
    <>
      <PageHero eyebrow="Shared plan" title="A Varanasi trip plan" intro="Someone shared this plan with you. Open it in the planner to make your own copy." crumbs={[{ name: "Home", path: "/" }, { name: "Plan", path: "/plan" }, { name: "Shared plan", path: "/plan/trip" }]} />
      <section className="section">
        <div className="shell" style={{ maxWidth: 900 }}>
          <Suspense fallback={<p>Loading…</p>}><SharedTrip /></Suspense>
        </div>
      </section>
    </>
  );
}
