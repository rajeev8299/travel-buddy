import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { BuddyCard } from "../components/Cards";
import { useReveal } from "../hooks";
import { BUDDIES, asset } from "../data";
import { api } from "../lib/api";

export default function Buddies() {
  const pageRef = useReveal();
  // Static list first so the page never looks empty — the API result (or an
  // offline server) simply takes over once it lands.
  const [buddies, setBuddies] = useState(BUDDIES);

  useEffect(() => {
    api
      .get("/buddies")
      .then((data) => {
        if (data?.buddies?.length) setBuddies(data.buddies);
      })
      .catch(() => {});
  }, []);

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Your buddies"
        title="The people you'd actually be travelling with"
        intro="Locals from the ghats, the old city and Sarnath, all ID-verified and reference-checked. You meet yours on a video call before anything is booked."
        image={asset("img/varanasi.jpg")}
        pos="center 45%"
      />

      <section className="section">
        <div className="shell">
          <div className="grid grid--buddies">
            {buddies.map((b, i) => (
              <BuddyCard key={b.name} buddy={b} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="shell promise" data-reveal>
          <h2>Looking for a particular side of Banaras?</h2>
          <p>
            This is a sample. Tell us what you want to see (the silk weavers, the morning ghats, a
            quiet day in Sarnath) and we'll match you with the buddy who knows it best.
          </p>
          <div className="cta__actions">
            <Link className="btn btn--solid btn--lg" to="/plan">
              Tell us what you'd like to see
            </Link>
            <Link className="btn btn--outline btn--lg" to="/become-a-buddy">
              Become a buddy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
