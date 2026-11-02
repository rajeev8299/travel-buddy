import Link from "next/link";
import { notFound } from "next/navigation";
import { CardGrid, FactBox, FaqList, JsonLd, Markdown, PageHero, ReviewNotice, SectionList, Sources, faqLd } from "@/components/content";
import { ACTIVITIES, EXPERIENCES, SERVICES, findPlace, placePath } from "@/lib/content";
import { readBody } from "@/lib/markdown";
import { SITE_URL, breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => ACTIVITIES.map((a) => ({ slug: a.slug }));
const get = (slug: string) => ACTIVITIES.find((a) => a.slug === slug);

export async function generateMetadata({ params }: PageProps<"/things-to-do/[slug]">) {
  const a = get((await params).slug);
  if (!a) return {};
  return pageMeta({ title: a.seoTitle ?? `${a.title} in Varanasi`, description: a.seoDescription ?? a.summary, path: `/things-to-do/${a.slug}`, image: a.image?.src, noindex: a.status !== "published" });
}

export default async function ActivityPage({ params }: PageProps<"/things-to-do/[slug]">) {
  const a = get((await params).slug);
  if (!a) notFound();
  const body = readBody("things-to-do", a.slug);
  const crumbs = [{ name: "Home", path: "/" }, { name: "Things to Do", path: "/things-to-do" }, { name: a.title, path: `/things-to-do/${a.slug}` }];
  const experiences = EXPERIENCES.filter((e) => e.activity === a.slug || a.related?.experiences?.includes(e.slug));
  const places = (a.related?.places ?? []).map(findPlace).filter(Boolean);
  const services = SERVICES.filter((s) => a.related?.services?.includes(s.slug));

  return (
    <>
      <PageHero eyebrow="Things to do" title={a.title} intro={a.summary} image={a.image} crumbs={crumbs} />
      <section className="section">
        <div className="shell detail">
          <div>
            <div style={{ marginBottom: 24 }}><ReviewNotice status={a.status} lastVerified={a.lastVerified} /></div>
            {body ? <Markdown>{body}</Markdown> : <SectionList sections={a.sections} />}
            {a.safety?.length ? (
              <section style={{ marginTop: 32 }} aria-labelledby="safety">
                <h2 id="safety" style={{ marginBottom: 12 }}>Safety and etiquette</h2>
                <ul className="list-check">{a.safety.map((s) => <li key={s}>{s}</li>)}</ul>
              </section>
            ) : null}
            {!body && <FaqList faqs={a.faqs} />}
            <Sources sources={a.sources} />
          </div>
          <aside className="detail__aside" aria-label="At a glance">
            <FactBox
              title="At a glance"
              facts={[
                { label: "When", value: a.timeOfDay },
                { label: "Suggested duration", value: a.typicalDuration },
                { label: "Good for", value: a.suitableFor.join(", ") },
              ]}
            />
            <div className="cta-panel">
              <h2>Want it arranged?</h2>
              <p>Tell us your dates and we&apos;ll arrange it with a local partner. Free to request. Our team confirms availability and price — nothing is booked until you accept a quote.</p>
              <Link className="btn btn--primary btn--block" href={`/enquiry?service=assistance&context=${encodeURIComponent(a.title)}`}>Get local help</Link>
            </div>
          </aside>
        </div>
      </section>

      {(experiences.length > 0 || places.length > 0 || services.length > 0) && (
        <section className="section section--sand">
          <div className="shell stack">
            {experiences.length > 0 && (
              <>
                <h2>Local experiences</h2>
                <CardGrid cards={experiences.map((e) => ({ href: `/experiences/${e.slug}`, title: e.title, text: e.summary, image: e.image, kicker: e.duration }))} />
              </>
            )}
            {places.length > 0 && (
              <>
                <h2 style={{ marginTop: 32 }}>Where</h2>
                <CardGrid cards={places.map((p) => ({ href: placePath(p!), title: p!.title, text: p!.summary, image: p!.image }))} />
              </>
            )}
            {services.length > 0 && (
              <p style={{ marginTop: 24 }}>
                Related services:{" "}
                {services.map((s, i) => (
                  <span key={s.slug}>{i > 0 && " · "}<Link href={`/services/${s.slug}`}>{s.title}</Link></span>
                ))}
              </p>
            )}
          </div>
        </section>
      )}
      <JsonLd
        data={{
          "@graph": [
            { "@type": "TouristAttraction", name: `${a.title} in Varanasi`, description: a.summary, url: `${SITE_URL}/things-to-do/${a.slug}`, image: a.image ? `${SITE_URL}${a.image.src}` : undefined },
            breadcrumbLd(crumbs),
            ...(!body && a.faqs?.length ? [faqLd(a.faqs)] : []),
          ],
        }}
      />
    </>
  );
}
