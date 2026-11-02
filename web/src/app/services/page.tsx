import Link from "next/link";
import { JsonLd, PageHero } from "@/components/content";
import { SERVICES } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Travel Services in Varanasi",
  description: "Airport and station transfers, local guides, boat rides, stays and planning help for families, seniors and groups — enquire and we confirm a checked local partner.",
  path: "/services",
  image: "/img/harbour.jpg",
});

export default function ServicesHub() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Travel Services", path: "/services" }];
  return (
    <>
      <PageHero eyebrow="Travel services" title="Help on the ground in Varanasi" intro="Transfers, guides, boats, stays and planning help. Tell us what you need — we reply fast and confirm a checked local partner before anything is booked." image={{ src: "/img/harbour.jpg", alt: "" }} crumbs={crumbs} />
      <section className="section">
        <div className="shell">
          <ol className="grid grid--4" style={{ listStyle: "none", padding: 0, marginBottom: 40 }}>
            {["Send an enquiry — free", "Get a reference code instantly", "We confirm a checked partner and the price", "You decide. No online payment."].map((s, i) => (
              <li key={s} className="tile"><span className="card__kicker">Step {i + 1}</span><strong>{s}</strong></li>
            ))}
          </ol>
          <div className="grid grid--2">
            {SERVICES.map((c) => (
              <section key={c.slug} className="card card--plain" style={{ padding: 22 }} aria-labelledby={`svc-${c.slug}`}>
                <h2 id={`svc-${c.slug}`} style={{ fontSize: "1.35rem" }}><Link href={`/services/${c.slug}`}>{c.title}</Link></h2>
                <p style={{ color: "var(--muted)", margin: "8px 0 12px" }}>{c.summary}</p>
                <ul style={{ paddingLeft: "1.2em", margin: 0, display: "grid", gap: 4 }}>
                  {c.items.map((i) => <li key={i.slug}><Link href={`/services/${c.slug}/${i.slug}`}>{i.title}</Link></li>)}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
