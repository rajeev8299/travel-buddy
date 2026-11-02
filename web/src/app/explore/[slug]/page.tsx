import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList, JsonLd, Markdown, PageHero, ReviewNotice, Sources, faqLd } from "@/components/content";
import { NextStep } from "@/components/NextStep";
import { ARTICLES } from "@/lib/content";
import { readBody } from "@/lib/markdown";
import { SITE_NAME, SITE_URL, breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.slug }));
const get = (slug: string) => ARTICLES.find((a) => a.slug === slug);

export async function generateMetadata({ params }: PageProps<"/explore/[slug]">) {
  const a = get((await params).slug);
  if (!a) return {};
  return pageMeta({ title: a.seoTitle ?? a.title, description: a.seoDescription ?? a.summary, path: `/explore/${a.slug}`, image: a.image?.src, noindex: a.status !== "published" });
}

export default async function ArticlePage({ params }: PageProps<"/explore/[slug]">) {
  const a = get((await params).slug);
  if (!a) notFound();
  const body = readBody("explore", a.slug);
  const crumbs = [{ name: "Home", path: "/" }, { name: "Explore", path: "/explore" }, { name: a.title, path: `/explore/${a.slug}` }];
  const sorted = ARTICLES.slice().sort((x, y) => x.order - y.order);
  const i = sorted.findIndex((x) => x.slug === a.slug);
  const next = sorted[i + 1];

  return (
    <>
      <PageHero eyebrow={a.readingMinutes ? `Explore · ${a.readingMinutes} min read` : "Explore"} title={a.title} intro={a.summary} image={a.image} crumbs={crumbs} />
      <section className="section">
        <div className="shell detail">
          <article>
            <div style={{ marginBottom: 24 }}><ReviewNotice status={a.status} lastVerified={a.lastVerified} /></div>
            {body ? <Markdown>{body}</Markdown> : <p className="lead">{a.summary}</p>}
            <FaqList faqs={a.faqs} />
            <Sources sources={a.sources} />
          </article>
          <aside className="detail__aside" aria-label="More to explore">
            <nav className="factbox" aria-label="Explore articles">
              <h2>Explore Varanasi</h2>
              <ol style={{ paddingLeft: "1.2em", margin: 0, display: "grid", gap: 6, fontSize: "0.93rem" }}>
                {sorted.map((x) => (
                  <li key={x.slug}>
                    {x.slug === a.slug ? <strong aria-current="page">{x.title}</strong> : <Link href={`/explore/${x.slug}`}>{x.title}</Link>}
                  </li>
                ))}
              </ol>
            </nav>
            {next && (
              <Link className="btn btn--outline btn--block" href={`/explore/${next.slug}`}>Next: {next.title} →</Link>
            )}
          </aside>
        </div>
      </section>
      <NextStep context={a.title} title="Seeing it for yourself?" />
      <JsonLd
        data={{
          "@graph": [
            { "@type": "Article", headline: a.title, description: a.summary, url: `${SITE_URL}/explore/${a.slug}`, image: a.image ? `${SITE_URL}${a.image.src}` : undefined, publisher: { "@type": "Organization", name: SITE_NAME } },
            breadcrumbLd(crumbs),
            ...(a.faqs?.length ? [faqLd(a.faqs)] : []),
          ],
        }}
      />
    </>
  );
}
