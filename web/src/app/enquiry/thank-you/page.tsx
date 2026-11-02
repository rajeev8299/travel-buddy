import { Suspense } from "react";
import { PageHero } from "@/components/content";
import ThankYou from "@/components/ThankYou";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({ title: "Enquiry received", description: "Your enquiry reference.", path: "/enquiry/thank-you", noindex: true });

export default function ThankYouPage() {
  return (
    <>
      <PageHero eyebrow="Enquiry received" title="Thank you — we've got it" crumbs={[{ name: "Home", path: "/" }, { name: "Enquiry", path: "/enquiry" }, { name: "Received", path: "/enquiry/thank-you" }]} />
      <section className="section">
        <div className="shell" style={{ maxWidth: 760 }}>
          <Suspense fallback={null}><ThankYou /></Suspense>
        </div>
      </section>
    </>
  );
}
