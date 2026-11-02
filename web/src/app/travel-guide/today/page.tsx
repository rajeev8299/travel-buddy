import { PageHero } from "@/components/content";
import TodayAlerts from "@/components/TodayAlerts";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Today in Varanasi: Live Alerts",
  description: "Current alerts for Varanasi — river and boat status, Aarti changes, closures and festival crowds — each with when it was posted and when it expires.",
  path: "/travel-guide/today",
  image: "/img/ganga_sunrise.jpg",
});

export default function TodayPage() {
  return (
    <>
      <PageHero
        eyebrow="Travel guide"
        title="Today in Varanasi"
        intro="Live alerts posted by our local team: river and boat status, Aarti changes, closures and crowds. Each alert shows when it was posted and expires automatically."
        crumbs={[{ name: "Home", path: "/" }, { name: "Travel Guide", path: "/travel-guide" }, { name: "Today", path: "/travel-guide/today" }]}
      />
      <section className="section">
        <div className="shell" style={{ maxWidth: 860 }}>
          <TodayAlerts />
        </div>
      </section>
    </>
  );
}
