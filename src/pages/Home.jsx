import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Compass, ShieldCheck, Quote, Users } from "lucide-react";
import HeroBackdrop from "../components/HeroBackdrop";
import Finder from "../components/Finder";
import { useReveal } from "../hooks";
import { STATS } from "../data";

const DOORS = [
  {
    to: "/why-buddy",
    icon: ShieldCheck,
    kicker: "How this works",
    title: "Why Buddy",
    body: "What a verified local actually changes about a trip, and what we promise when things go sideways.",
  },
  {
    to: "/buddies",
    icon: Users,
    kicker: "180+ locals",
    title: "Your Buddies",
    body: "Meet a few of the people you could be travelling with. You get a video call before anything is booked.",
  },
  {
    to: "/stories",
    icon: Quote,
    kicker: "From travellers",
    title: "Stories",
    body: "The trips that went sideways and got better for it, told by the people they happened to.",
  },
  {
    to: "/plan",
    icon: Compass,
    kicker: "No payment yet",
    title: "Plan my trip",
    body: "Tell us what you're curious about and we'll match you with a buddy. Draft plan back within a day.",
  },
];

export default function Home() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef}>
      <section className="hero">
        <HeroBackdrop />
        <div className="hero__scrim" aria-hidden="true" />

        <div className="shell hero__inner">
          <p className="eyebrow" data-reveal>
            <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
            Local-led travel across India
          </p>

          <h1 data-reveal style={{ "--delay": "60ms" }}>
            Travel with someone who <em>actually lives there</em>
          </h1>

          <p className="hero__sub" data-reveal style={{ "--delay": "120ms" }}>
            Not a tour group. Not a checklist. A buddy who knows every ghat, every galli, and every
            story the guidebooks leave out — and who builds the day around you.
          </p>

          <Finder />

          <ul className="stats" data-reveal style={{ "--delay": "240ms" }}>
            {STATS.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <header className="section__head" data-reveal>
            <div>
              <p className="eyebrow eyebrow--dark">Start here</p>
              <h2>Four ways in</h2>
            </div>
            <p className="section__note">
              Everything below has a page of its own — nothing important is buried at the bottom of
              this one.
            </p>
          </header>

          <div className="grid grid--doors">
            {DOORS.map((d, i) => {
              const Icon = d.icon;
              return (
                <Link
                  key={d.to}
                  to={d.to}
                  className="door"
                  data-reveal
                  style={{ "--delay": `${i * 80}ms` }}
                >
                  <span className="door__icon">
                    <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <p className="door__kicker">{d.kicker}</p>
                  <h3>{d.title}</h3>
                  <p className="door__body">{d.body}</p>
                  <span className="door__go">
                    Open <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
