import Link from "next/link";
import { notFound } from "next/navigation";
import { FactBox, JsonLd, PageHero } from "@/components/content";
import { PartnerBadge } from "@/components/PartnerBadge";
import { SERVICES } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => SERVICES.flatMap((c) => c.items.map((i) => ({ category: c.slug, slug: i.slug })));
const get = (cat: string, slug: string) => {
  const c = SERVICES.find((x) => x.slug === cat);
  const i = c?.items.find((x) => x.slug === slug);
  return c && i ? { c, i } : null;
};

export async function generateMetadata({ params }: PageProps<"/services/[category]/[slug]">) {
  const { category, slug } = await params;
  const r = get(category, slug);
  if (!r) return {};
  return pageMeta({ title: `${r.i.title} — Varanasi`, description: r.i.summary, path: `/services/${category}/${slug}`, image: r.c.image?.src, noindex: r.i.partnerStatus !== "verified" });
}

export default async function ServicePage({ params }: PageProps<"/services/[category]/[slug]">) {
  const { category, slug } = await params;
  const r = get(category, slug);
  if (!r) notFound();
  const { c, i } = r;
  const crumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: c.title, path: `/services/${c.slug}` }, { name: i.title, path: `/services/${c.slug}/${i.slug}` }];
  return (
    <>
      <PageHero eyebrow={c.title} title={i.title} intro={i.summary} image={c.image} crumbs={crumbs}>
        <p style={{ marginTop: 16 }}><PartnerBadge status={i.partnerStatus} /></p>
      </PageHero>
      <section className="section">
        <div className="shell detail">
          <div className="stack">
            <section>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>What&apos;s included</h2>
              <ul className="list-check">{i.includes.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            <section style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Good to know</h2>
              <ul className="list-check list-cross">{i.limitations.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            <section style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>How it works</h2>
              <ol style={{ paddingLeft: "1.2em", display: "grid", gap: 6 }}>
                <li>Send an enquiry — you get a reference code straight away.</li>
                <li>We reply and confirm a checked partner, timing and price.</li>
                <li>You confirm directly. No online payment.</li>
                <li>The day before, we send a reminder with your partner&apos;s details.</li>
              </ol>
              <p style={{ marginTop: 12, color: "var(--muted)" }}>Cancellations: see our <Link href="/cancellation-policy">cancellation policy</Link>.</p>
            </section>
          </div>
          <aside className="detail__aside">
            <FactBox
              title="At a glance"
              facts={[
                { label: "Coverage", value: i.coverage },
                { label: "Estimated cost", value: i.estimate ?? "Quoted on enquiry — confirmed before you book" },
                { label: "Response", value: i.responseExpectation },
              ]}
            />
            <div className="cta-panel">
              <h2>Request this service</h2>
              <p>Tell us your dates and what you need. Free to request. Our team confirms availability and price — nothing is booked until you accept a quote.</p>
              {/* Visible text kept short; the accessible name adds the service (and keeps proper nouns like Sarnath intact). */}
              <Link className="btn btn--primary btn--block" href={`/enquiry?service=${c.slug}&item=${i.slug}&context=${encodeURIComponent(i.title)}`} aria-label={`Request this service: ${i.title}`}>
                Request this service
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd data={{ "@graph": [{ "@type": "Service", name: i.title, description: i.summary, areaServed: "Varanasi", provider: { "@type": "TravelAgency", name: "Varanasi Trip Companion" } }, breadcrumbLd(crumbs)] }} />
    </>
  );
}
