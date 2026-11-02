import { PageHero } from "@/components/content";
import MyTrips from "@/components/MyTrips";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({ title: "My saved trips", description: "Trips you've saved on this device.", path: "/plan/my-trips", noindex: true });

export default function MyTripsPage() {
  return (
    <>
      <PageHero eyebrow="Plan" title="My saved trips" intro="Saved on this device only — no account needed. Use Share to move a plan to another phone." crumbs={[{ name: "Home", path: "/" }, { name: "Plan", path: "/plan" }, { name: "My trips", path: "/plan/my-trips" }]} />
      <section className="section">
        <div className="shell" style={{ maxWidth: 900 }}>
          <MyTrips />
        </div>
      </section>
    </>
  );
}
