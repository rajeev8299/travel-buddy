import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Fact, Faq, Img, Source, Status } from "@/content/types";
import { formatDate } from "@/lib/site";

/* ---------------------------------------------------------------- JSON-LD */

export function JsonLd({ data }: { data: object }) {
  // `<` escaped so content can never close the script tag (Next.js JSON-LD guidance).
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") }}
    />
  );
}

/* --------------------------------------------------------------- page hero */

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((c, i) =>
          i === items.length - 1 ? (
            <li key={c.path} aria-current="page">{c.name}</li>
          ) : (
            <li key={c.path}><Link href={c.path}>{c.name}</Link></li>
          ),
        )}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: Img;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <header className={image ? "pagehero" : "pagehero pagehero--plain"}>
      {image && (
        <div className="pagehero__media">
          <Image src={image.src} alt="" fill priority sizes="100vw" />
          <div className="pagehero__scrim" />
        </div>
      )}
      <div className="shell pagehero__inner">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------- cards */

export interface CardData {
  href: string;
  title: string;
  text?: string;
  kicker?: string;
  image?: Img;
  meta?: React.ReactNode;
  /** Images served by the API (blog uploads) bypass the optimizer, which can't reach it from inside Docker. */
  unoptimized?: boolean;
}

export function Card({ href, title, text, kicker, image, meta, unoptimized }: CardData) {
  return (
    <article className="card">
      {image && (
        <div className="card__media">
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 380px" unoptimized={unoptimized} />
        </div>
      )}
      <div className="card__body">
        {kicker && <p className="card__kicker">{kicker}</p>}
        <h3 className="card__title"><Link href={href}>{title}</Link></h3>
        {text && <p className="card__text">{text}</p>}
        {meta && <div className="card__meta">{meta}</div>}
      </div>
    </article>
  );
}

export function CardGrid({ cards, cols = 3 }: { cards: CardData[]; cols?: 2 | 3 | 4 }) {
  if (!cards.length) return <p className="empty">Nothing here yet — check back soon.</p>;
  return (
    <div className={`grid grid--${cols}`}>
      {cards.map((c) => <Card key={c.href} {...c} />)}
    </div>
  );
}

/* ------------------------------------------------------ verification bits */

export function ReviewNotice({ status, lastVerified }: { status: Status; lastVerified?: string | null }) {
  if (status === "published") {
    return lastVerified ? (
      <p className="badge badge--verified">✓ Verified on {formatDate(lastVerified)}</p>
    ) : null;
  }
  return (
    <div className="notice notice--review" role="note">
      <span aria-hidden="true">ⓘ</span>
      <div>
        <strong>This page is being verified</strong>
        Background and history are written; practical details (timings, fees, rules) are still being checked
        against official sources. Highlighted items are not yet confirmed.
      </div>
    </div>
  );
}

export function FactBox({
  title = "Visiting information",
  facts,
  extra,
}: {
  title?: string;
  facts: Fact[];
  extra?: React.ReactNode;
}) {
  const verifiedDates = facts.map((f) => f.verifiedOn).filter(Boolean) as string[];
  const latest = verifiedDates.sort().at(-1);
  return (
    <section className="factbox" aria-labelledby="factbox-title">
      <h2 id="factbox-title">{title}</h2>
      <dl>
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>
              {f.value ?? (
                <span className="verify">Not yet verified{f.source ? ` — check ${f.source}` : ""}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {extra}
      <p className="factbox__foot">
        {latest ? <>Last verified {formatDate(latest)}. </> : null}
        Rules and timings change, especially on festival days — confirm with the official source before you go.
      </p>
    </section>
  );
}

export function Sources({ sources }: { sources?: Source[] }) {
  if (!sources?.length) return null;
  return (
    <section className="stack" aria-labelledby="sources-title" style={{ marginTop: 40 }}>
      <h2 id="sources-title" style={{ fontSize: "1.15rem" }}>Sources</h2>
      <ul style={{ paddingLeft: "1.2em", color: "var(--muted)", fontSize: "0.92rem" }}>
        {sources.map((s) => (
          <li key={s.title}>
            {s.url ? <a href={s.url} rel="noopener noreferrer">{s.title}</a> : s.title}
            {s.publisher ? ` — ${s.publisher}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- markdown */

// [VERIFY: …] markers in drafts become a visible "being verified" note
// instead of leaking editorial syntax or, worse, being read as fact.
function preprocess(md: string) {
  // Both "[VERIFY: what — where]" and a bare "[VERIFY]".
  return md.replace(/\[VERIFY(?::([^\]]*))?\]/g, (_m, what?: string) => ` \`verify:${(what ?? "").trim()}\``);
}

/** `imageSrc` maps Markdown image paths (e.g. blog "/uploads/…" on the API origin);
 *  without it, images render with their path as written. Raw HTML stays disabled. */
export function Markdown({ children, imageSrc }: { children: string; imageSrc?: (src: string) => string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ children: c }) {
            const text = String(c);
            if (text.startsWith("verify:")) {
              return <span className="verify" title={text.slice(7)}>being verified</span>;
            }
            return <code>{c}</code>;
          },
          a({ href = "", children: c }) {
            return href.startsWith("/") ? <Link href={href}>{c}</Link> : <a href={href} rel="noopener noreferrer">{c}</a>;
          },
          img({ src, alt = "", title }) {
            if (typeof src !== "string" || !src) return null;
            // Fixed-ratio box (image letterboxed inside) so late-loading images don't shift the text.
            // The Markdown title is the photo credit. Spans, not <figure>: images sit inside a <p>.
            return (
              <span className="prose__figure">
                <span className="prose__img">
                  {/* eslint-disable-next-line @next/next/no-img-element -- size unknown; served by the API */}
                  <img src={imageSrc ? imageSrc(src) : src} alt={alt} loading="lazy" decoding="async" />
                </span>
                {title && <span className="prose__credit">Photo: {title}</span>}
              </span>
            );
          },
        }}
      >
        {preprocess(children)}
      </ReactMarkdown>
    </div>
  );
}

export function SectionList({ sections }: { sections?: { heading: string; body: string }[] }) {
  if (!sections?.length) return null;
  return <Markdown>{sections.map((s) => `## ${s.heading}\n\n${s.body}`).join("\n\n")}</Markdown>;
}

/* --------------------------------------------------------------------- FAQ */

export function FaqList({ faqs, heading = "Frequently asked questions" }: { faqs?: Faq[]; heading?: string }) {
  if (!faqs?.length) return null;
  return (
    <section aria-labelledby="faq-title" style={{ marginTop: 40 }}>
      <h2 id="faq-title" style={{ marginBottom: 16 }}>{heading}</h2>
      <div className="faq">
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <div>{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function faqLd(faqs?: Faq[]) {
  if (!faqs?.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/* ----------------------------------------------------------- section header */

export function SectionHead({
  eyebrow,
  title,
  text,
  action,
  id,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: { href: string; label: string };
  id?: string;
}) {
  return (
    <header className="section__head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id}>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action && (
        <Link className="btn btn--outline" href={action.href}>
          {action.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </header>
  );
}
