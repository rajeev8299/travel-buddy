import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList, JsonLd, PageHero, ReviewNotice } from "@/components/content";
import { ITINERARIES } from "@/lib/content";
import { hrefForStop } from "@/lib/itinerary-plans";
import { minutes } from "@/lib/planner";
import { SITE_URL, breadcrumbLd, pageMeta } from "@/lib/site";
import styles from "@/components/Planner.module.css";

export const dynamicParams = false;
export const generateStaticParams = () => ITINERARIES.map((i) => ({ slug: i.slug }));
const get = (slug: string) => ITINERARIES.find((i) => i.slug === slug);

export async function generateMetadata({ params }: PageProps<"/plan/itineraries/[slug]">) {
  const it = get((await params).slug);
  if (!it) return {};
  return pageMeta({ title: it.seoTitle ?? it.title, description: it.summary, path: `/plan/itineraries/${it.slug}`, image: it.image?.src, noindex: it.status !== "published" });
}

const verifyChips = (note: string) => note.replace(/\s*\[VERIFY[^\]]*\]/g, " (being verified)");

export default async function ItineraryPage({ params }: PageProps<"/plan/itineraries/[slug]">) {
  const it = get((await params).slug);
  if (!it) notFound();
  const crumbs = [{ name: "Home", path: "/" }, { name: "Plan", path: "/plan" }, { name: "Itineraries", path: "/plan/itineraries" }, { name: it.title, path: `/plan/itineraries/${it.slug}` }];
  return (
    <>
      <PageHero eyebrow={`${it.days}-day itinerary`} title={it.title} intro={it.summary} image={it.image} crumbs={crumbs}>
        <div className="btn-row" style={{ marginTop: 22 }}>
          <Link className="btn btn--primary" href={`/plan/trip-planner?from=${it.slug}`}>Customise this plan</Link>
        </div>
      </PageHero>
      <section className="section">
        <div className="shell" style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 20 }}><ReviewNotice status={it.status} lastVerified={it.lastVerified} /></div>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>
            <span className="label label--suggested">Suggested</span>
            For: {it.audience.join(", ")} · Pace: {it.pace} · Walking: {it.walking}. Times are suggestions — check{" "}
            <Link href="/travel-guide/today">Today in Varanasi</Link> for closures and crowds.
          </p>
          <div className={styles.plan}>
            {it.plan.map((d) => (
              <section key={d.day} className={styles.day} aria-labelledby={`d${d.day}`}>
                <header className={styles.dayHead}><h2 id={`d${d.day}`} style={{ fontSize: "1.3rem" }}>Day {d.day}: {d.title}</h2></header>
                <ol className={styles.items}>
                  {d.stops.map((s, i) => {
                    const href = hrefForStop(s);
                    return (
                      <li key={i} className={styles.item}>
                        <div className={styles.when}>{s.time}</div>
                        <div className={styles.what}>
                          <strong>{href ? <Link href={href}>{s.title}</Link> : s.title}</strong>
                          <span className={styles.meta}>About {minutes(s.durationMin)} · {s.walking} walking</span>
                          {s.note && <span className={styles.note}>{verifyChips(s.note)}</span>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
          {it.tips?.length ? (
            <section style={{ marginTop: 32 }}>
              <h2 style={{ marginBottom: 12 }}>Tips</h2>
              <ul className="list-check">{it.tips.map((t) => <li key={t}>{verifyChips(t)}</li>)}</ul>
            </section>
          ) : null}
          <FaqList faqs={it.faqs} />
          <div className="cta-panel" style={{ marginTop: 32 }}>
            <h2>Make it yours</h2>
            <p>Open this plan in the trip planner to change days, reorder stops, save it or share it.</p>
            <Link className="btn btn--primary" href={`/plan/trip-planner?from=${it.slug}`}>Customise this plan</Link>
          </div>
        </div>
      </section>
      <JsonLd data={{ "@graph": [{ "@type": "TouristTrip", name: it.title, description: it.summary, url: `${SITE_URL}/plan/itineraries/${it.slug}`, touristType: it.audience }, breadcrumbLd(crumbs)] }} />
    </>
  );
}
