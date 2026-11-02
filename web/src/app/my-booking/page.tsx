import { PageHero } from "@/components/content";
import { MyBookingClient } from "@/components/ClientOnly";
import { pageMeta } from "@/lib/site";

// Private: noindex, and no Referer leaves this page (the link's secret is in
// the fragment, which isn't sent anyway — this is belt and braces).
export const metadata = {
  ...pageMeta({ title: "Your booking request", description: "Follow your Varanasi booking request.", path: "/my-booking", noindex: true }),
  referrer: "no-referrer" as const,
};

export default function MyBookingPage() {
  return (
    <>
      <PageHero eyebrow="My booking request" title="Your booking request" intro="See where your request is, review your quote and accept it when you're ready." />
      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <MyBookingClient />
        </div>
      </section>
    </>
  );
}
