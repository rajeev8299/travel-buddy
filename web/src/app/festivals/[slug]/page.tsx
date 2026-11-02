import Link from "next/link";
import { notFound } from "next/navigation";
import { FactBox, FaqList, JsonLd, PageHero, ReviewNotice, SectionList, Sources, faqLd } from "@/components/content";
import { FESTIVALS } from "@/lib/content";
import { SITE_URL, breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => FESTIVALS.map((f) => ({ slug: f.slug }));
const get = (slug: string) => FESTIVALS.find((f) => f.slug === slug);

export async function generateMetadata({ params }: PageProps<"/festivals/[slug]">) {
  const f = get((await params).slug);
  if (!f) return {};
  return pageMeta({ title: `${f.title} in Varanasi`, description: f.summary, path: `/festivals/${f.slug}`, image: f.image?.src, noindex: f.status !== "published" });
}

export default async function FestivalPage({ params }: PageProps<"/festivals/[slug]">) {
  const f = get((await params).slug);
  if (!f) notFound();
  const crumbs = [{ name: "Home", path: "/" }, { name: "Festivals", path: "/festivals" }, { name: f.title, path: `/festivals/${f.slug}` }];
  const confirmed = f.dates.filter((d) => d.status === "confirmed" && d.value);

  return (
    <>
      <PageHero eyebrow="Festival" title={f.title} intro={f.summary} image={f.image} crumbs={crumbs} />
      <section className="section">
        <div className="shell detail">
          <div>
            <div style={{ marginBottom: 24 }}><ReviewNotice status={f.status} lastVerified={f.lastVerified} /></div>
            <SectionList sections={f.sections} />
            {f.advice.length > 0 && (
              <section style={{ marginTop: 32 }}>
                <h2 style={{ marginBottom: 12 }}>Planning advice</h2>
                <ul className="list-check">{f.advice.map((a) => <li key={a}>{a}</li>)}</ul>
              </section>
            )}
            <FaqList faqs={f.faqs} />
            <Sources sources={f.sources} />
          </div>
          <aside className="detail__aside" aria-label="Festival facts">
            <FactBox
              title="Dates & crowds"
              facts={[
                { label: "Typical season", value: f.season },
                ...f.dates.map((d) => ({
                  label: `Date in ${d.year}`,
                  value: d.status === "confirmed" ? d.value : null,
                  source: "the official calendar or organisers",
                })),
                { label: "Where", value: f.locations.join(", ") },
                { label: "Crowd level", value: f.crowd },
              ]}
            />
            <div className="cta-panel">
              <h2>Planning a festival trip?</h2>
              <p>Rooms and boats fill up early. Tell us your dates and we&apos;ll help with a realistic plan.</p>
              <Link className="btn btn--primary btn--block" href={`/enquiry?service=assistance&context=${encodeURIComponent(f.title)}`}>Get local help</Link>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd
        data={{
          "@graph": [
            // Event markup only for officially confirmed dates (SEO spec §6.9).
            ...confirmed.map((d) => ({ "@type": "Event", name: `${f.title} ${d.year}`, startDate: d.value, location: { "@type": "Place", name: "Varanasi" }, url: `${SITE_URL}/festivals/${f.slug}` })),
            breadcrumbLd(crumbs),
            ...(f.faqs?.length ? [faqLd(f.faqs)] : []),
          ],
        }}
      />
    </>
  );
}
