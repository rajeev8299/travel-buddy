import Link from "next/link";
import { JsonLd, PageHero } from "@/components/content";
import { GUIDES } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import type { Guide } from "@/content/types";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Varanasi Travel Guide: Essentials, Safety & Getting Around",
  description: "How to reach Varanasi, getting around and last-mile walking, temple rules, safety, money, weather and today's alerts — practical, checked and dated.",
  path: "/travel-guide",
  image: "/img/varanasi.jpg",
});

const GROUPS: { key: Guide["group"]; title: string }[] = [
  { key: "essentials", title: "Essentials" },
  { key: "getting-here", title: "Getting here" },
  { key: "practical", title: "Getting around & practicalities" },
  { key: "safety", title: "Health, safety & access" },
];

export default function TravelGuideHub() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Travel Guide", path: "/travel-guide" }];
  return (
    <>
      <PageHero eyebrow="Travel guide" title="Everything practical, checked and dated" intro="How to arrive, get around, stay safe, and what to know before you visit temples. Time-sensitive details show when they were last verified." image={{ src: "/img/varanasi.jpg", alt: "" }} crumbs={crumbs} />
      <section className="section">
        <div className="shell">
          <div className="grid grid--2" style={{ marginBottom: 40 }}>
            <Link href="/travel-guide/today" className="tile" style={{ borderColor: "var(--river)" }}>
              <strong>Today in Varanasi</strong>
              <span>Live alerts — river and boat status, closures, festival crowds.</span>
            </Link>
            <Link href="/travel-guide/emergency" className="tile" style={{ borderColor: "var(--warn)" }}>
              <strong>Emergency contacts</strong>
              <span>India&apos;s emergency number is 112. Hospitals and helplines inside.</span>
            </Link>
          </div>
          {GROUPS.map((g) => {
            const items = GUIDES.filter((x) => x.group === g.key);
            if (!items.length) return null;
            return (
              <section key={g.key} style={{ marginBottom: 40 }} aria-labelledby={`g-${g.key}`}>
                <h2 id={`g-${g.key}`} style={{ marginBottom: 16 }}>{g.title}</h2>
                <div className="grid grid--3">
                  {items.map((x) => (
                    <Link key={x.slug} href={`/travel-guide/${x.slug}`} className="tile">
                      <strong>{x.title}</strong>
                      <span>{x.summary}</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
