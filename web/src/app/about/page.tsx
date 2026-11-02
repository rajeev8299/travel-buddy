import Link from "next/link";
import { JsonLd, Markdown, PageHero } from "@/components/content";
import { ABOUT } from "@/content/about";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { NextStep } from "@/components/NextStep";

const about = ABOUT.find((a) => a.slug === "about")!;

export const metadata = pageMeta({ title: "About Varanasi Trip Companion", description: about.summary, path: "/about", image: "/img/boats.jpg" });

export default function AboutPage() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "About", path: "/about" }];
  return (
    <>
      <PageHero eyebrow="About us" title={about.title} intro={about.summary} image={{ src: "/img/boats.jpg", alt: "" }} crumbs={crumbs} />
      <section className="section">
        <div className="shell detail">
          <Markdown>{about.body}</Markdown>
          <aside className="detail__aside">
            <nav className="factbox" aria-label="About pages">
              <h2>More about us</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {ABOUT.filter((a) => a.slug !== "about").map((a) => (
                  <li key={a.slug}><Link href={`/about/${a.slug}`}>{a.title}</Link></li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
