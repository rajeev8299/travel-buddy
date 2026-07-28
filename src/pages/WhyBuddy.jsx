import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { FeatureCard } from "../components/Cards";
import { useReveal } from "../hooks";
import { FEATURES, asset } from "../data";

const STEPS = [
  {
    n: "01",
    title: "Tell us what you're curious about",
    body: "Not an itinerary — a mood. Street food, quiet mornings, temples, trekking, or nothing in particular.",
  },
  {
    n: "02",
    title: "We match you with a buddy",
    body: "Usually within a day. Someone who lives where you're going and speaks the languages you need.",
  },
  {
    n: "03",
    title: "You meet on a video call",
    body: "Before any money changes hands. If the fit is wrong, we find you someone else — no awkwardness.",
  },
  {
    n: "04",
    title: "The plan gets written together",
    body: "Then rewritten on the ground, as often as the day needs it. That's the whole point.",
  },
];

export default function WhyBuddy() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Why Buddy"
        title="The difference is the person, not the package"
        intro="A tour sells you a route. A buddy gives you someone who already knows the shortcuts, the closures, and where to sit down when you're tired."
        image={asset("img/meghalaya.jpg")}
        pos="center 50%"
      />

      <section className="section">
        <div className="shell">
          <div className="grid grid--features">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="shell">
          <header className="section__head" data-reveal>
            <div>
              <p className="eyebrow eyebrow--dark">How it works</p>
              <h2>Four steps, one conversation</h2>
            </div>
          </header>

          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.n} data-reveal style={{ "--delay": `${i * 80}ms` }}>
                <span className="steps__n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell promise" data-reveal>
          <h2>Our safety promise</h2>
          <p>
            Every buddy is ID-verified and reference-checked, and carries public liability cover for
            the days you're with them. You get a 24-hour number that reaches a real person in India,
            not a ticket queue. If a buddy doesn't show, we refund the day and find you another one
            the same morning.
          </p>
          <Link className="btn btn--solid btn--lg" to="/plan">
            Start planning
          </Link>
        </div>
      </section>
    </div>
  );
}
