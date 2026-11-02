import Link from "next/link";
import { CardGrid, JsonLd, PageHero } from "@/components/content";
import { PartnerBadge } from "@/components/PartnerBadge";
import { EXPERIENCES } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Local Experiences in Varanasi",
  description: "Boat rides, food walks, temple visits and Sarnath trips run by checked local partners. Enquire for free — the partner confirms details and price.",
  path: "/experiences",
  image: "/img/harbour.jpg",
});

export default function ExperiencesPage() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Local Experiences", path: "/experiences" }];
  return (
    <>
      <PageHero
        eyebrow="Local experiences"
        title="Local experiences with checked partners"
        intro="Specific offerings run by local boatmen, guides and hosts. Enquire for free — we confirm the partner, timing and price before you commit."
        image={{ src: "/img/harbour.jpg", alt: "" }}
        crumbs={crumbs}
      />
      <section className="section">
        <div className="shell">
          <div className="notice notice--info" style={{ marginBottom: 28 }}>
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>How booking works</strong>
              Send an enquiry and you get a reference code straight away. We reply on WhatsApp or email, confirm a checked partner and the price, and only then is anything booked. No online payment.{" "}
              <Link href="/about/how-we-verify">How we check partners</Link>
            </div>
          </div>
          <CardGrid
            cards={EXPERIENCES.map((e) => ({
              href: `/experiences/${e.slug}`, title: e.title, text: e.summary, image: e.image, kicker: e.duration,
              meta: <><PartnerBadge status={e.partnerStatus} /> <span>{e.priceRange ?? "Price on request"}</span></>,
            }))}
          />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
