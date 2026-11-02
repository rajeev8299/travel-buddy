import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, PageHero } from "@/components/content";
import { PartnerBadge } from "@/components/PartnerBadge";
import { SERVICES } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => SERVICES.map((c) => ({ category: c.slug }));
const get = (slug: string) => SERVICES.find((c) => c.slug === slug);

export async function generateMetadata({ params }: PageProps<"/services/[category]">) {
  const c = get((await params).category);
  if (!c) return {};
  return pageMeta({ title: `${c.title} in Varanasi`, description: c.summary, path: `/services/${c.slug}`, image: c.image?.src });
}

export default async function ServiceCategoryPage({ params }: PageProps<"/services/[category]">) {
  const c = get((await params).category);
  if (!c) notFound();
  const crumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: c.title, path: `/services/${c.slug}` }];
  return (
    <>
      <PageHero eyebrow="Travel services" title={c.title} intro={c.summary} image={c.image} crumbs={crumbs}>
        <div className="btn-row" style={{ marginTop: 22 }}>
          <Link className="btn btn--primary" href={`/enquiry?service=${c.slug}`} aria-label={`Request this service: ${c.title}`}>Request this service</Link>
        </div>
      </PageHero>
      <section className="section">
        <div className="shell grid grid--3">
          {c.items.map((i) => (
            <article key={i.slug} className="card card--plain">
              <div className="card__body">
                <h2 className="card__title"><Link href={`/services/${c.slug}/${i.slug}`}>{i.title}</Link></h2>
                <p className="card__text">{i.summary}</p>
                <div className="card__meta"><PartnerBadge status={i.partnerStatus} /><span>{i.estimate ?? "Quoted on enquiry"}</span></div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
