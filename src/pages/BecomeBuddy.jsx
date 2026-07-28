import { Check } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BuddyForm from "../components/BuddyForm";
import { useReveal } from "../hooks";
import { asset } from "../data";

const ASKS = [
  "You actually live in the place you'd be guiding — not a nearby city.",
  "You can hold a conversation in English plus at least one local language.",
  "You're happy to be ID-verified and to give us two references we can call.",
  "You'd rather change the plan than push someone through it.",
];

const GIVES = [
  "₹2,800–₹4,500 a day depending on the town and group size, paid weekly.",
  "Public liability cover for every day you're out with travellers.",
  "You choose your own dates. No minimum, no exclusivity.",
  "A 24-hour support line for you, not just for the travellers.",
];

export default function BecomeBuddy() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Become a buddy"
        title="If you know your town properly, we'd like to meet you"
        intro="We're not looking for tour guides. We're looking for people who can show someone their own city the way they'd show a friend."
        image={asset("img/ladakh.jpg")}
        pos="center 55%"
      />

      <section className="section">
        <div className="shell grid grid--split">
          <div className="panel" data-reveal>
            <h2>What we ask</h2>
            <ul className="ticks">
              {ASKS.map((a) => (
                <li key={a}>
                  <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel panel--warm" data-reveal style={{ "--delay": "90ms" }}>
            <h2>What you get</h2>
            <ul className="ticks">
              {GIVES.map((g) => (
                <li key={g}>
                  <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="apply">
        <div className="shell">
          <header className="section__head" data-reveal>
            <div>
              <p className="eyebrow eyebrow--dark">Application</p>
              <h2>Tell us about yourself</h2>
            </div>
            <p className="section__note">
              About ten minutes. We reply to every application within three working days —
              yes, including the ones we turn down.
            </p>
          </header>

          <BuddyForm />
        </div>
      </section>
    </div>
  );
}
