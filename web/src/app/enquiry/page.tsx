import { Suspense } from "react";
import { PageHero } from "@/components/content";
import { EnquiryFormClient } from "@/components/ClientOnly";
import { SERVICES } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Send an enquiry",
  description: "Tell us what you need in Varanasi — a trip plan, transfers, a guide, a boat or help for family and seniors. Free, and you get a reference code instantly.",
  path: "/enquiry",
  noindex: true,
});

export default function EnquiryPage() {
  return (
    <>
      <PageHero eyebrow="Enquiry" title="Tell us what you need" intro="Free and no obligation. You get a reference code straight away; we reply on WhatsApp or email and confirm a checked local partner before anything is booked." crumbs={[{ name: "Home", path: "/" }, { name: "Enquiry", path: "/enquiry" }]} />
      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <Suspense fallback={<p>Loading the form…</p>}>
            <EnquiryFormClient services={SERVICES.map((s) => ({ slug: s.slug, title: s.title, items: s.items.map((i) => ({ slug: i.slug, title: i.title })) }))} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
