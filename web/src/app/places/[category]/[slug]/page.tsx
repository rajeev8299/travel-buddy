import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  CardGrid, FactBox, FaqList, JsonLd, Markdown, PageHero, ReviewNotice, SectionList, Sources, faqLd,
} from "@/components/content";
import { PLACES, PLACE_CATEGORIES, findActivity, findPlace, placePath } from "@/lib/content";
import { readBody } from "@/lib/markdown";
import { SITE_URL, breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return PLACES.map((p) => ({ category: p.category, slug: p.slug }));
}

const get = (category: string, slug: string) => PLACES.find((p) => p.category === category && p.slug === slug);

export async function generateMetadata({ params }: PageProps<"/places/[category]/[slug]">) {
  const { category, slug } = await params;
  const p = get(category, slug);
  if (!p) return {};
  return pageMeta({
    title: p.seoTitle ?? `${p.title}, Varanasi`,
    description: p.seoDescription ?? p.summary,
    path: placePath(p),
    image: p.image?.src,
    noindex: p.status !== "published" || Boolean(p.canonical),
    canonical: p.canonical,
  });
}

const SCHEMA_TYPE = { temples: "PlaceOfWorship", ghats: "TouristAttraction", heritage: "LandmarksOrHistoricalBuildings", nearby: "TouristDestination" };

export default async function PlacePage({ params }: PageProps<"/places/[category]/[slug]">) {
  const { category, slug } = await params;
  const p = get(category, slug);
  if (!p) notFound();
  if (p.canonical) permanentRedirect(p.canonical); // cross-listed (e.g. Sarnath under nearby)

  const cat = PLACE_CATEGORIES[p.category];
  const body = readBody("places", p.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Places", path: "/places" },
    { name: cat.title, path: `/places/${p.category}` },
    { name: p.title, path: placePath(p) },
  ];
  const relatedPlaces = (p.related?.places ?? []).map(findPlace).filter((x) => x && x.slug !== p.slug);
  const relatedThings = (p.related?.things ?? []).map(findActivity).filter(Boolean);
  const seniorText = { yes: "Yes — mostly level access", partly: "Partly — some steps or crowds", no: "Difficult — many steps" };

  return (
    <>
      <PageHero eyebrow={cat.title} title={p.title} intro={p.summary} image={p.image} crumbs={crumbs} />
      <section className="section">
        <div className="shell detail">
          <div>
            <div style={{ marginBottom: 24 }}><ReviewNotice status={p.status} lastVerified={p.lastVerified} /></div>
            {body ? <Markdown>{body}</Markdown> : <SectionList sections={p.sections} />}
            {!body && <FaqList faqs={p.faqs} />}
            <Sources sources={p.sources} />
          </div>
          <aside className="detail__aside" aria-label="Visit planning">
            <FactBox
              facts={[
                ...(p.area ? [{ label: "Area", value: p.area }] : []),
                ...(p.suggestedDuration ? [{ label: "Suggested time", value: p.suggestedDuration }] : []),
                ...(p.seniorFriendly ? [{ label: "Senior-friendly", value: seniorText[p.seniorFriendly] }] : []),
                ...(p.facts ?? []),
              ]}
            />
            <div className="cta-panel">
              <h2>Visit with a local</h2>
              <p>A checked local guide can handle queues, rules and the walk in — and explain what you&apos;re seeing.</p>
              <Link className="btn btn--primary btn--block" href={`/enquiry?service=guides&context=${encodeURIComponent(p.title)}`}>Request a local guide</Link>
            </div>
          </aside>
        </div>
      </section>

      {(relatedThings.length > 0 || relatedPlaces.length > 0) && (
        <section className="section section--sand">
          <div className="shell stack">
            {relatedThings.length > 0 && (
              <>
                <h2>Things to do here</h2>
                <CardGrid cards={relatedThings.map((a) => ({ href: `/things-to-do/${a!.slug}`, title: a!.title, text: a!.summary, image: a!.image, kicker: a!.typicalDuration }))} />
              </>
            )}
            {relatedPlaces.length > 0 && (
              <>
                <h2 style={{ marginTop: 32 }}>Nearby and related places</h2>
                <CardGrid cards={relatedPlaces.map((r) => ({ href: placePath(r!), title: r!.title, text: r!.summary, image: r!.image }))} />
              </>
            )}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@graph": [
            {
              "@type": SCHEMA_TYPE[p.category],
              name: p.title,
              description: p.summary,
              url: `${SITE_URL}${placePath(p)}`,
              image: p.image ? `${SITE_URL}${p.image.src}` : undefined,
              containedInPlace: { "@type": "City", name: "Varanasi" },
            },
            breadcrumbLd(crumbs),
            ...(!body && p.faqs?.length ? [faqLd(p.faqs)] : []),
          ],
        }}
      />
    </>
  );
}
