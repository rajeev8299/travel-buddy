import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, Markdown, PageHero } from "@/components/content";
import { ABOUT } from "@/content/about";
import { breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => ABOUT.filter((a) => a.slug !== "about").map((a) => ({ slug: a.slug }));
const get = (slug: string) => ABOUT.find((a) => a.slug === slug && slug !== "about");

export async function generateMetadata({ params }: PageProps<"/about/[slug]">) {
  const a = get((await params).slug);
  if (!a) return {};
  return pageMeta({ title: a.title, description: a.summary, path: `/about/${a.slug}`, noindex: a.slug === "photo-credits" });
}

export default async function AboutSubPage({ params }: PageProps<"/about/[slug]">) {
  const a = get((await params).slug);
  if (!a) notFound();
  const crumbs = [{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: a.title, path: `/about/${a.slug}` }];
  const action =
    a.slug === "partner-with-us" ? { href: "/enquiry?type=partner", label: "Apply to partner with us" }
    : a.slug === "complaints" ? { href: "/enquiry?type=complaint", label: "Raise a complaint" }
    : a.slug === "contact" ? { href: "/enquiry", label: "Send us a message" }
    : null;
  return (
    <>
      <PageHero eyebrow="About us" title={a.title} intro={a.summary} crumbs={crumbs} />
      <section className="section">
        <div className="shell detail">
          <div>
            <Markdown>{a.body}</Markdown>
            {action && <p style={{ marginTop: 24 }}><Link className="btn btn--primary" href={action.href}>{action.label}</Link></p>}
          </div>
          <aside className="detail__aside">
            <nav className="factbox" aria-label="About pages">
              <h2>About us</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {ABOUT.map((x) => (
                  <li key={x.slug}>
                    {x.slug === a.slug ? <strong aria-current="page">{x.title}</strong> : <Link href={x.slug === "about" ? "/about" : `/about/${x.slug}`}>{x.title}</Link>}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
