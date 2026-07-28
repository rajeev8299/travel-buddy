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
        intro="180+ buddies across 42 towns, all ID-verified and reference-checked. You meet yours on a video call before anything is booked."
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
          <h2>Not seeing your town?</h2>
          <p>
            This is a sample. We have buddies in 42 towns and cities, and we add people faster than
            we update this page. Tell us where you're headed and we'll check.
          </p>
          <div className="cta__actions">
            <Link className="btn btn--solid btn--lg" to="/plan">
              Ask about a town
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
