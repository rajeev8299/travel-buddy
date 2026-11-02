import Link from "next/link";
import { notFound } from "next/navigation";
import { FactBox, JsonLd, PageHero, ReviewNotice } from "@/components/content";
import { PartnerBadge } from "@/components/PartnerBadge";
import { EXPERIENCES, findActivity } from "@/lib/content";
import { SITE_URL, breadcrumbLd, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => EXPERIENCES.map((e) => ({ slug: e.slug }));
const get = (slug: string) => EXPERIENCES.find((e) => e.slug === slug);

export async function generateMetadata({ params }: PageProps<"/experiences/[slug]">) {
  const e = get((await params).slug);
  if (!e) return {};
  // Commercial pages stay out of search until a verified partner runs them.
  return pageMeta({ title: `${e.title} — Varanasi`, description: e.summary, path: `/experiences/${e.slug}`, image: e.image?.src, noindex: e.status !== "published" || e.partnerStatus !== "verified" });
}

function List({ title, items, cross }: { title: string; items: string[]; cross?: boolean }) {
  if (!items.length) return null;
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>{title}</h2>
      <ul className={cross ? "list-check list-cross" : "list-check"}>{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  );
}

export default async function ExperiencePage({ params }: PageProps<"/experiences/[slug]">) {
  const e = get((await params).slug);
  if (!e) notFound();
  const activity = findActivity(e.activity);
  const crumbs = [{ name: "Home", path: "/" }, { name: "Local Experiences", path: "/experiences" }, { name: e.title, path: `/experiences/${e.slug}` }];
  const enquire = `/enquiry?experience=${encodeURIComponent(e.slug)}&context=${encodeURIComponent(e.title)}`;

  return (
    <>
      <PageHero eyebrow="Local experience" title={e.title} intro={e.summary} image={e.image} crumbs={crumbs}>
        <p style={{ marginTop: 16 }}><PartnerBadge status={e.partnerStatus} /></p>
      </PageHero>
      <section className="section">
        <div className="shell detail">
          <div>
            <div style={{ marginBottom: 24 }}><ReviewNotice status={e.status} lastVerified={e.lastVerified} /></div>
            {e.partnerStatus !== "verified" && (
              <div className="notice notice--review" style={{ marginBottom: 24 }} role="note">
                <span aria-hidden="true">ⓘ</span>
                <div>
                  <strong>Partner onboarding in progress</strong>
                  You can enquire now. We&apos;ll only confirm with a partner who has passed our identity and reference checks.
                </div>
              </div>
            )}
            <section>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Suggested schedule</h2>
              <ol style={{ paddingLeft: "1.2em", display: "grid", gap: 8 }}>{e.schedule.map((s) => <li key={s}>{s}</li>)}</ol>
            </section>
            <List title="Suitable for" items={e.suitableFor} />
            <List title="Included" items={e.inclusions} />
            <List title="Not included" items={e.exclusions} cross />
            <List title="Safety" items={e.safety} />
            <section style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Cancellation</h2>
              <p>{e.cancellation} <Link href="/cancellation-policy">Read the cancellation policy</Link>.</p>
            </section>
            {activity && (
              <p style={{ marginTop: 28 }}>
                Planning it yourself? Read our independent guide: <Link href={`/things-to-do/${activity.slug}`}>{activity.title}</Link>.
              </p>
            )}
          </div>
          <aside className="detail__aside" aria-label="Request this experience">
            <FactBox
              title="At a glance"
              facts={[
                { label: "Duration", value: e.duration },
                { label: "Meeting point", value: e.meetingPoint },
                { label: "Price", value: e.priceRange ?? "On request — confirmed before you book" },
                ...(e.partnerName ? [{ label: "Partner", value: e.partnerName }] : []),
              ]}
            />
            <div className="cta-panel">
              <h2>Request this experience</h2>
              <p>Free to request. Our team confirms availability and price — nothing is booked until you accept a quote. You&apos;ll get a reference code straight away.</p>
              <Link className="btn btn--primary btn--block" href={enquire}>Request this experience</Link>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd
        data={{
          "@graph": [
            { "@type": "TouristTrip", name: e.title, description: e.summary, url: `${SITE_URL}/experiences/${e.slug}`, touristType: e.suitableFor },
            breadcrumbLd(crumbs),
          ],
        }}
      />
    </>
  );
}
