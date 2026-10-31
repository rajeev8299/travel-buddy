import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { asset } from "../data";
import "./DestinationShowcase.css";

const FEATURED_DESTS = [
  {
    city: "Dashashwamedh Ghat",
    state: "Varanasi",
    tag: "Ganga Aarti & Ghats",
    desc: "Maha Aarti at dusk, brass multi-tiered lamps, evening chants, and the bustling central riverfront.",
    image: asset("img/dev_diwali.jpg"),
    pos: "center 50%",
  },
  {
    city: "Assi Ghat & Southern River",
    state: "Varanasi",
    tag: "Sunrise & Subah-e-Banaras",
    desc: "Dawn classical rāgas, morning yoga pavilions, wooden rowboats, and conversations over hot chai.",
    image: asset("img/ganga_sunrise.jpg"),
    pos: "center 48%",
  },
  {
    city: "Kashi Vishwanath Corridor",
    state: "Varanasi",
    tag: "Sacred Jyotirlinga",
    desc: "The sacred heart of Kashi, connecting the ancient Golden Temple to the flowing waters of the Ganga.",
    image: asset("img/kashi_vishwanath.jpg"),
    pos: "center 52%",
  },
  {
    city: "Madanpura & Peeli Kothi",
    state: "Varanasi",
    tag: "Banarasi Silk Handlooms",
    desc: "Centuries-old pit-loom master weavers creating pure silk sarees with gold and silver Zari brocade.",
    image: asset("img/banaras_silk.jpg"),
    pos: "center 50%",
  },
  {
    city: "Sarnath & Dhamek Stupa",
    state: "Nearby Excursion (10 km)",
    tag: "Buddhist Heritage",
    desc: "Where Gautama Buddha delivered his first sermon. Peaceful deer park and ancient Ashokan monuments.",
    image: asset("img/stupa.jpg"),
    pos: "center 45%",
  },
  {
    city: "Thatheri Bazaar & Chowk",
    state: "Old Varanasi",
    tag: "Heritage Street Gastronomy",
    desc: "Wood-fired kachoris, clay-cup rabri, authentic Banarasi paan, and maze-like ancient alleyways.",
    image: asset("img/street_food.jpg"),
    pos: "center 52%",
  },
];

export const DestinationShowcase = memo(function DestinationShowcase() {
  return (
    <section className="dest-showcase" id="destinations">
      <div className="shell">
        <header className="section__head" data-reveal>
          <div>
            <p className="eyebrow eyebrow--dark">Varanasi Highlights</p>
            <h2>Discover Authentic Banaras with a Verified Local</h2>
          </div>
          <p className="section__note">
            Every ghat, shrine, weaver quarter, and alleyway has a local buddy ready to guide you. Click any experience to start planning.
          </p>
        </header>

        <div className="dest-grid">
          {FEATURED_DESTS.map((d, i) => (
            <Link
              key={d.city}
              to={`/book-trip?where=${encodeURIComponent(d.city)}`}
              className="dest-card"
              data-reveal
              style={{ "--delay": `${i * 80}ms` }}
            >
              <img
                src={d.image}
                alt={`${d.city}, ${d.state}`}
                className="dest-card__bg"
                style={{ objectPosition: d.pos }}
                loading="lazy"
                width="400"
                height="380"
              />
              <div className="dest-card__scrim" aria-hidden="true" />
              <div className="dest-card__content">
                <span className="dest-card__tag">{d.tag}</span>
                <h3>{d.city}</h3>
                <p>{d.desc}</p>
                <span className="dest-card__action">
                  <span>Explore with a Buddy</span>
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});
