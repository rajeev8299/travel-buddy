import { Suspense } from "react";
import { PageHero } from "@/components/content";
import { TripPlannerClient } from "@/components/ClientOnly";
import { itineraryTemplates } from "@/lib/itinerary-plans";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Varanasi Trip Planner",
  description: "Create a realistic Varanasi itinerary from your dates, interests, pace and walking — then edit, save and share it.",
  path: "/plan/trip-planner",
  image: "/img/boats.jpg",
});

export default function PlannerPage() {
  return (
    <>
      <PageHero eyebrow="Trip planner" title="Plan your Varanasi days" intro="Tell us how you like to travel. We'll suggest a realistic plan you can reorder, edit, save and share — free, no sign-up." crumbs={[{ name: "Home", path: "/" }, { name: "Plan", path: "/plan" }, { name: "Trip planner", path: "/plan/trip-planner" }]} />
      <section className="section">
        <div className="shell" style={{ maxWidth: 980 }}>
          <Suspense fallback={<p>Loading the planner…</p>}>
            <TripPlannerClient templates={itineraryTemplates()} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
