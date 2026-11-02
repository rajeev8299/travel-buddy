import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CardGrid, FaqList, JsonLd, SectionHead, faqLd, type CardData } from "@/components/content";
import {
  ACTIVITIES, ARTICLES, EXPERIENCES, FESTIVALS, FOOD, GUIDES, INTERESTS, ITINERARIES, MARKETS, PLACES, SERVICES, SHOPPING,
  findPlace, placePath,
} from "@/lib/content";
import { pageMeta } from "@/lib/site";
import type { Faq } from "@/content/types";
import styles from "./home.module.css";

export const metadata: Metadata = pageMeta({
  title: "Varanasi Travel Guide & Trip Planner",
  description:
    "Plan your Varanasi trip with verified, up-to-date guidance on ghats, temples, Ganga Aarti, food and Sarnath, plus trusted local experiences and services.",
  path: "/",
  image: "/img/ganga_sunrise.jpg",
});

const pick = <T,>(items: (T | undefined)[]) => items.filter(Boolean) as T[];

const HOME_FAQ: Faq[] = [
  { q: "How many days do I need in Varanasi?", a: "Two to three days lets you see the main ghats and temples, take a boat ride, watch the Ganga Aarti and visit Sarnath without rushing. One day covers the essentials if your time is short." },
  { q: "When is the best time to visit?", a: "The cooler months are the most comfortable for walking the ghats. The monsoon can raise the river enough to stop boat rides, and festival days bring very large crowds. See the seasons guide for details." },
  { q: "Can I take my phone and bag into Kashi Vishwanath Temple?", a: "Temple rules on phones, bags and other items change from time to time, and lockers are usually needed. Check the temple guide, which shows when the rules were last verified, before you go." },
  { q: "Is it appropriate to visit Manikarnika Ghat?", a: "Manikarnika is an active cremation ghat and a place of grief for families. You can pass respectfully, ideally from a boat and with a knowledgeable local. Never photograph cremations, and politely decline anyone asking for money for the wood." },
  { q: "Do boats run all year?", a: "Boat rides depend on the river. When the Ganga is high, usually during the monsoon, local authorities can suspend boating. The Today in Varanasi page shows current alerts." },
  { q: "Are your partners verified?", a: "Partners go through identity and reference checks and agree to our service standards before we list them as verified. Each offering shows its current verification status." },
  { q: "Is Varanasi safe for solo and women travellers?", a: "Many solo travellers visit comfortably, especially with sensible precautions in crowds and late at night. Our safety guide covers practical advice, and you can ask for a woman guide." },
  { q: "Does it cost anything to use Varanasi Trip Companion?", a: "Planning, guides and itineraries are free. If you enquire about a local experience or service, the partner confirms the price with you before you commit." },
];

export default function Home() {
  const popular = pick(["kashi-vishwanath", "dashashwamedh", "assi", "sarnath", "manikarnika", "ramnagar-fort"].map(findPlace));
  const spiritual = PLACES.filter((p) => p.category === "temples" && !p.canonical).slice(0, 4);
  const nearby = PLACES.filter((p) => p.category === "nearby" && !p.canonical).slice(0, 4);
  const plans = ITINERARIES.filter((i) => ["one-day", "two-days", "three-days"].includes(i.slug));

  const placeCard = (p: (typeof PLACES)[number]): CardData => ({
    href: placePath(p), title: p.title, text: p.summary, image: p.image, kicker: p.area,
  });

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroMedia}>
          <Image src="/img/ganga_sunrise.jpg" alt="" fill priority sizes="100vw" />
          <div className={styles.heroScrim} />
        </div>
        <div className={`shell ${styles.heroInner}`}>
          <p className="eyebrow">Varanasi · Kashi · Banaras</p>
          <h1 id="hero-title">Varanasi Is More Than a Destination. It&apos;s an Experience.</h1>
          <p className={styles.heroSub}>
            Discover sacred ghats, timeless temples, hidden lanes, local flavours and unforgettable experiences—all in one place.
          </p>
          <div className="btn-row">
            <Link className="btn btn--primary" href="/plan/trip-planner">Plan my trip</Link>
            <Link className="btn btn--outline" href="/explore">Explore Varanasi</Link>
          </div>
          <p className={styles.trust}>
            <Link href="/about/how-we-verify">Verified local partners</Link> · Information checked against official sources · Free to plan
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- discover varanasi */}
      <section className="section" aria-labelledby="discover">
        <div className="shell">
          <SectionHead id="discover" eyebrow="Discover Varanasi" title="One of the world's oldest living cities, on the banks of the Ganga."
            text="Learn how Kashi, Banaras and Varanasi became one name for faith, learning, music and craft." action={{ href: "/explore", label: "Explore Varanasi" }} />
          <CardGrid cards={ARTICLES.slice().sort((a, b) => a.order - b.order).slice(0, 4).map((a) => ({ href: `/explore/${a.slug}`, title: a.title, text: a.summary, image: a.image }))} cols={4} />
        </div>
      </section>

      {/* ---------------------------------------------------- popular places */}
      <section className="section section--sand" aria-labelledby="popular">
        <div className="shell">
          <SectionHead id="popular" eyebrow="Places to visit" title="The places most visitors ask about first."
            text="Each guide covers why it matters, how to get there, current visiting rules, and what to do nearby." action={{ href: "/places", label: "See all places" }} />
          <CardGrid cards={popular.map(placeCard)} />
        </div>
      </section>

      {/* -------------------------------------------------------- interests */}
      <section className="section" aria-labelledby="interests">
        <div className="shell">
          <SectionHead id="interests" eyebrow="Explore by your interests" title="Travel the way that suits you."
            text="Pick what moves you and we'll show the places, experiences and plans to match." />
          <div className={styles.interests}>
            {INTERESTS.map((i) => (
              <Link key={i.key} href={`/plan/trip-planner?interests=${i.key}`} className={styles.interest}>{i.label}</Link>
            ))}
          </div>
          <p style={{ marginTop: 20 }}><Link className="btn btn--outline" href="/plan/trip-planner">Build a plan around my interests →</Link></p>
        </div>
      </section>

      {/* ------------------------------------------------------- plans 1/2/3 */}
      <section className="section section--river" aria-labelledby="plans">
        <div className="shell">
          <SectionHead id="plans" eyebrow="Plan a perfect trip" title="Realistic 1, 2 and 3-day plans."
            text="Built by people who know the city — with walking stretches and rest breaks included, so your days flow instead of rush." />
          <div className="grid grid--3">
            {plans.map((p) => (
              <Link key={p.slug} href={`/plan/itineraries/${p.slug}`} className={styles.planCard}>
                <span className={styles.planDays}>{p.days} {p.days === 1 ? "day" : "days"}</span>
                <strong>{p.title}</strong>
                <span>{p.summary}</span>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 24 }}><Link className="btn btn--light" href="/plan/trip-planner">Make my own plan</Link></p>
        </div>
      </section>

      {/* ------------------------------------------------- local experiences */}
      <section className="section" aria-labelledby="experiences">
        <div className="shell">
          <SectionHead id="experiences" eyebrow="Must-try local experiences" title="Experiences with local partners."
            text="Enquire and we'll confirm the details with a checked local partner — no payment to plan." action={{ href: "/experiences", label: "See all experiences" }} />
          <CardGrid cards={(EXPERIENCES.length ? EXPERIENCES : []).slice(0, 3).map((e) => ({ href: `/experiences/${e.slug}`, title: e.title, text: e.summary, image: e.image, kicker: e.duration }))} />
          {ACTIVITIES.length > 0 && (
            <p style={{ marginTop: 18, color: "var(--muted)" }}>
              Prefer to go on your own? Read our <Link href="/things-to-do">guides to things to do</Link>.
            </p>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------- spiritual */}
      <section className="section section--sand" aria-labelledby="spiritual">
        <div className="shell">
          <SectionHead id="spiritual" eyebrow="Spiritual Varanasi" title="A sacred city to Hindus, Buddhists and Jains."
            text="Understand the rituals, visit respectfully, and plan darshan without the confusion." action={{ href: "/plan/itineraries/spiritual", label: "Plan a spiritual journey" }} />
          <CardGrid cards={spiritual.map(placeCard)} cols={4} />
        </div>
      </section>

      {/* ------------------------------------------------------------- food */}
      <section className="section" aria-labelledby="food">
        <div className="shell">
          <SectionHead id="food" eyebrow="Food you cannot miss" title="Banaras eats in its lanes."
            text="From morning kachori to winter malaiyo, here is what to try and where to look." action={{ href: "/food", label: "Read the food guide" }} />
          <CardGrid cards={FOOD.slice(0, 4).map((f) => ({ href: `/food/${f.slug}`, title: f.title, text: f.summary, image: f.image, kicker: f.availability }))} cols={4} />
        </div>
      </section>

      {/* -------------------------------------------------- markets and silk */}
      <section className="section section--sand" aria-labelledby="markets">
        <div className="shell">
          <SectionHead id="markets" eyebrow="Famous markets & Banarasi silk" title="Shop where the city has traded for centuries."
            text="Learn how to recognise genuine handloom silk and buy in ways that support artisans." action={{ href: "/shopping/etiquette-and-authenticity", label: "Shopping & etiquette guide" }} />
          <CardGrid
            cards={[
              ...SHOPPING.slice(0, 1).map((s) => ({ href: `/shopping/${s.slug}`, title: s.title, text: s.summary, image: s.image })),
              ...MARKETS.slice(0, 3).map((m) => ({ href: `/markets/${m.slug}`, title: m.title, text: m.summary, image: m.image, kicker: "Market" })),
            ]}
            cols={4}
          />
        </div>
      </section>

      {/* -------------------------------------------------------- festivals */}
      <section className="section" aria-labelledby="festivals">
        <div className="shell">
          <SectionHead id="festivals" eyebrow="Festivals & celebrations" title="When the whole city celebrates."
            text="Plan around festival crowds, or come for them. Dates appear only once officially confirmed." action={{ href: "/festivals", label: "See the festival guide" }} />
          <CardGrid cards={FESTIVALS.slice(0, 4).map((f) => ({ href: `/festivals/${f.slug}`, title: f.title, text: f.summary, image: f.image, kicker: f.season }))} cols={4} />
        </div>
      </section>

      {/* --------------------------------------------------------- services */}
      <section className="section section--sand" aria-labelledby="services">
        <div className="shell">
          <SectionHead id="services" eyebrow="Trusted local services" title="Help on the ground."
            text="Transfers, guides, boats and planning help. Tell us what you need and we'll confirm a checked local partner." action={{ href: "/services", label: "All travel services" }} />
          <div className="grid grid--4">
            {SERVICES.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="tile">
                <strong>{s.title}</strong>
                <span>{s.summary}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- essentials */}
      <section className="section" aria-labelledby="essentials">
        <div className="shell">
          <SectionHead id="essentials" eyebrow="Essential travel information" title="Everything practical, checked and dated."
            text="How to arrive, get around, stay safe, and what to know before you visit temples." action={{ href: "/travel-guide", label: "Open the travel guide" }} />
          <div className="grid grid--4">
            {pick(["how-to-reach", "getting-around", "temple-access-rules", "solo-and-women-safety", "best-time-to-visit", "scams-and-touts", "families-and-seniors", "emergency"].map((s) => GUIDES.find((g) => g.slug === s))).map((g) => (
              <Link key={g.slug} href={`/travel-guide/${g.slug}`} className="tile">
                <strong>{g.title}</strong>
                <span>{g.summary}</span>
              </Link>
            ))}
            <Link href="/travel-guide/today" className="tile">
              <strong>Today in Varanasi</strong>
              <span>Live alerts: river and boat status, closures and crowds.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- hidden gems / nearby */}
      <section className="section section--sand" aria-labelledby="nearby">
        <div className="shell">
          <SectionHead id="nearby" eyebrow="Hidden gems & nearby" title="Beyond the ghats."
            text="Quieter corners of the city, and places worth a day trip or a longer journey." action={{ href: "/places/nearby", label: "Nearby destinations" }} />
          <CardGrid cards={nearby.map(placeCard)} cols={4} />
        </div>
      </section>

      {/* -------------------------------------------------------------- FAQ */}
      <section className="section" aria-labelledby="faq-title">
        <div className="shell">
          <FaqList faqs={HOME_FAQ} heading="Quick answers before you go" />
          <p style={{ marginTop: 20 }}><Link href="/travel-guide/faq">All FAQs →</Link></p>
        </div>
      </section>

      {/* --------------------------------------------------- latest guides */}
      <section className="section section--sand" aria-labelledby="latest">
        <div className="shell">
          <SectionHead id="latest" eyebrow="Latest travel guides" title="Fresh from the ghats." action={{ href: "/travel-guide", label: "All guides" }} />
          <CardGrid cards={GUIDES.slice(0, 3).map((g) => ({ href: `/travel-guide/${g.slug}`, title: g.title, text: g.summary, image: g.image }))} />
        </div>
      </section>

      {/* ------------------------------------------------------ closing band */}
      <section className={styles.closing} aria-labelledby="closing">
        <div className="shell">
          <h2 id="closing">Ready to plan your Varanasi?</h2>
          <p>Tell us your dates and interests. We&apos;ll help you build a realistic plan, and connect you with a checked local if you&apos;d like one.</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn--primary" href="/plan/trip-planner">Plan my trip</Link>
            <Link className="btn btn--outline" href="/enquiry?service=assistance">Get local help</Link>
          </div>
        </div>
      </section>

      <JsonLd data={faqLd(HOME_FAQ)!} />
    </>
  );
}
