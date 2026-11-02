import Link from "next/link";
import { NextStep } from "@/components/NextStep";
import type { Base, Fact } from "@/content/types";
import { breadcrumbLd } from "@/lib/site";
import {
  CardGrid, FactBox, FaqList, JsonLd, PageHero, ReviewNotice, SectionList, Sources, faqLd, type CardData, type Crumb,
} from "./content";

/** Shared layout for editorial topic pages (food, markets, shopping, guides):
 *  hero → review notice → sections → lists → FAQ → sources, with a fact box
 *  and a call to action alongside. */
export default function TopicPage({
  entry,
  eyebrow,
  crumbs,
  facts,
  factTitle,
  lists,
  sections,
  body,
  cta,
  related,
  relatedTitle = "Related",
}: {
  entry: Base;
  eyebrow: string;
  crumbs: Crumb[];
  facts?: Fact[];
  factTitle?: string;
  lists?: { title: string; items: string[] }[];
  sections?: { heading: string; body: string }[];
  body?: React.ReactNode;
  cta?: { title: string; text: string; href: string; label: string };
  related?: CardData[];
  relatedTitle?: string;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={entry.title} intro={entry.summary} image={entry.image} crumbs={crumbs} />
      <section className="section">
        <div className={`shell ${facts?.length || cta ? "detail" : ""}`}>
          <div>
            <div style={{ marginBottom: 24 }}><ReviewNotice status={entry.status} lastVerified={entry.lastVerified} /></div>
            {body}
            <SectionList sections={sections} />
            {lists?.filter((l) => l.items.length).map((l) => (
              <section key={l.title} style={{ marginTop: 28 }}>
                <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>{l.title}</h2>
                <ul className="list-check">{l.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </section>
            ))}
            <FaqList faqs={entry.faqs} />
            <Sources sources={entry.sources} />
          </div>
          {(facts?.length || cta) && (
            <aside className="detail__aside">
              {facts?.length ? <FactBox title={factTitle} facts={facts} /> : null}
              {cta && (
                <div className="cta-panel">
                  <h2>{cta.title}</h2>
                  <p>{cta.text}</p>
                  <Link className="btn btn--primary btn--block" href={cta.href}>{cta.label}</Link>
                </div>
              )}
            </aside>
          )}
        </div>
      </section>
      {!cta?.href.startsWith("/enquiry") && <NextStep context={entry.title} />}
      {related?.length ? (
        <section className="section section--sand">
          <div className="shell">
            <h2 style={{ marginBottom: 20 }}>{relatedTitle}</h2>
            <CardGrid cards={related} />
          </div>
        </section>
      ) : null}
      <JsonLd data={{ "@graph": [breadcrumbLd(crumbs), ...(entry.faqs?.length ? [faqLd(entry.faqs)] : [])] }} />
    </>
  );
}

/** Simple hub: hero + card grid. */
export function HubPage({
  eyebrow, title, intro, image, crumbs, cards, children,
}: {
  eyebrow: string; title: string; intro: string; image?: { src: string; alt: string }; crumbs: Crumb[]; cards: CardData[]; children?: React.ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} image={image} crumbs={crumbs} />
      <section className="section">
        <div className="shell">
          {children}
          <CardGrid cards={cards} />
        </div>
      </section>
      <NextStep />
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
