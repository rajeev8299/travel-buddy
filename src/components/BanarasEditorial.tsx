import { memo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  ArrowRight,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { asset } from "../data";
import "./BanarasEditorial.css";

/* Authentic, respectfully curated Banaras landmark experiences */
export interface BanarasSpot {
  id: string;
  title: string;
  hindiName?: string;
  category: "ghats" | "spiritual" | "heritage" | "crafts" | "food" | "sarnath";
  tag: string;
  image: string;
  location: string;
  bestTime: string;
  description: string;
  culturalNote: string;
  isSelfGuided?: boolean;
}

export const BANARAS_SPOTS: BanarasSpot[] = [
  {
    id: "dashashwamedh",
    title: "Dashashwamedh Ghat & Evening Ganga Aarti",
    hindiName: "दशाश्वमेध घाट",
    category: "ghats",
    tag: "Spiritual Twilight",
    image: asset("img/dev_diwali.jpg"),
    location: "Central Ghats, Old Varanasi",
    bestTime: "5:30 PM - 7:30 PM",
    description:
      "Varanasi’s most active waterfront where seven priests perform the synchronized Maha Aarti with brass lamps and conch shells as bells echo across the river.",
    culturalNote:
      "Public ceremony open to all; arrive by wooden rowboat 30 minutes early for an uncrowded vantage from the water.",
  },
  {
    id: "assi-ghat",
    title: "Assi Ghat & Subah-e-Banaras",
    hindiName: "अस्सी घाट",
    category: "ghats",
    tag: "Morning Awakening",
    image: asset("img/ganga_sunrise.jpg"),
    location: "Southernmost Ghat, near BHU",
    bestTime: "5:00 AM - 7:00 AM",
    description:
      "Where the river Assi meets the Ganga. Host to dawn classical rāgas, Vedic chanting, morning yoga on the stone pavilions, and student debates over chai.",
    culturalNote:
      "The ideal starting point for a quiet dawn walk north along the ghats before city traffic awakens.",
  },
  {
    id: "manikarnika-ghat",
    title: "Manikarnika & Harishchandra Ghats",
    hindiName: "मणिकर्णिका घाट",
    category: "spiritual",
    tag: "Sacred Cremation Rites",
    image: asset("img/mural.jpg"),
    location: "Middle Ghats",
    bestTime: "Continuous / Passing quietly by boat",
    description:
      "The eternal cremation grounds revered for millennia as the site of ultimate liberation (Moksha) from the cycle of rebirth.",
    culturalNote:
      "Strictly sacred and respectful. Photography and filming are prohibited. Travellers observe silently from passing boats or the upper terraces.",
  },
  {
    id: "kashi-vishwanath",
    title: "Kashi Vishwanath Temple & Corridor",
    hindiName: "श्री काशी विश्वनाथ",
    category: "spiritual",
    tag: "Jyotirlinga Shrine",
    image: asset("img/kashi_vishwanath.jpg"),
    location: "Vishwanath Galli, Godowlia",
    bestTime: "Early Morning (6:00 AM) or Post-Aarti",
    description:
      "One of the twelve sacred Jyotirlingas, reconstructed through centuries and connected to the Ganga via the expansive temple corridor.",
    culturalNote:
      "Official government security applies. Mobile phones and electronics are deposited in authorized lockers at the entry gate. Dress modestly.",
  },
  {
    id: "sarnath",
    title: "Sarnath & Dhamek Stupa",
    hindiName: "सारनाथ",
    category: "sarnath",
    tag: "First Buddhist Sermon",
    image: asset("img/stupa.jpg"),
    location: "10 km Northeast of Varanasi",
    bestTime: "8:00 AM - 11:30 AM",
    description:
      "Where Gautama Buddha taught the Four Noble Truths and set the Wheel of Dharma in motion. Home to the Ashoka Pillar and peaceful deer park.",
    culturalNote:
      "Calm, green, and spacious archaeological sanctuary. Archaeological Survey of India (ASI) tickets required at entry.",
  },
  {
    id: "silk-weaving",
    title: "Madanpura & Peeli Kothi Silk Weaving",
    hindiName: "बनारसी ज़री और रेशम",
    category: "crafts",
    tag: "Living Artisan Tradition",
    image: asset("img/banaras_silk.jpg"),
    location: "Old City Artisan Quarters",
    bestTime: "11:00 AM - 4:00 PM",
    description:
      "Centuries-old pit loom weavers handcrafting pure Banarasi silk sarees with real gold and silver Zari brocade patterns taking months per piece.",
    culturalNote:
      "Travel with a local who knows multi-generational artisan households directly — bypass commercial commission showrooms.",
  },
  {
    id: "kachori-galli",
    title: "Thatheri Bazaar & Kachori Galli",
    hindiName: "कचौड़ी और मलइयो",
    category: "food",
    tag: "Heritage Street Gastronomy",
    image: asset("img/street_food.jpg"),
    location: "Thatheri Bazaar / Chowk",
    bestTime: "7:00 AM - 10:30 AM (Breakfast)",
    description:
      "Crisp wood-fired kachoris served with spiced pumpkin subzi, clay cup rabri-lassi, and winter Malaiyo foam prepared beneath dawn mist.",
    culturalNote:
      "Ancient narrow alleys best explored on foot. All foods are pure vegetarian in accordance with sacred precinct customs.",
  },
];

/* Curated Realistic Itineraries */
export const BANARAS_ITINERARIES = [
  {
    title: "One-Day Essential Banaras",
    duration: "1 Full Day (Dawn to Night)",
    badge: "Most Popular",
    stops: [
      "5:30 AM: Dawn wooden rowboat from Assi to Dashashwamedh Ghat",
      "8:00 AM: Steaming breakfast at Kachori Galli & Thatheri Bazaar",
      "10:30 AM: Kashi Vishwanath temple corridor visit",
      "3:00 PM: Hidden alleys & brass metalworkers of Chowk",
      "6:30 PM: Reserved riverside seating for evening Ganga Aarti",
    ],
    recommendedFor: "First-time visitors with limited time",
  },
  {
    title: "Two-Day Heritage, Silk & Sarnath",
    duration: "2 Days / 1 Night",
    badge: "In-Depth Culture",
    stops: [
      "Day 1: Full ghats exploration, boat journey, and evening music session",
      "Day 2 AM: Excursion to Sarnath archaeological park & Dhamek Stupa",
      "Day 2 PM: Master weaver visit in Peeli Kothi to see handloom brocade",
      "Day 2 Evening: Sunset chai by Manikarnika upper terrace & street food tour",
    ],
    recommendedFor: "History buffs, photographers, and textile lovers",
  },
  {
    title: "Three-Day Immersive Soul of Kashi",
    duration: "3 Days / 2 Nights",
    badge: "Slow & Transformative",
    stops: [
      "Day 1: The Sacred River — Dawn Aarti, private boat, classical rāga morning",
      "Day 2: Philosophy & Craft — Sarnath, BHU Bharat Kala Bhavan, master artisans",
      "Day 3: Sacred Lanes & Living Traditions — Hidden shrines, wrestling Akharas, culinary trail",
    ],
    recommendedFor: "Travellers seeking deep immersion away from tourist rush",
  },
];

export const BanarasEditorial = memo(function BanarasEditorial() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredSpots =
    activeTab === "all"
      ? BANARAS_SPOTS
      : BANARAS_SPOTS.filter((s) => s.category === activeTab);

  return (
    <section className="banaras-editorial" id="banaras-guide">
      <div className="shell">
        <header className="section__head" data-reveal>
          <div>
            <p className="eyebrow eyebrow--dark">
              <Sparkles size={14} className="sparkle-icon" />
              Living Heritage • Kashi
            </p>
            <h2>The Soul of Banaras: Curated Experiences & Sacred Lanes</h2>
          </div>
          <p className="section__note">
            Over 3,000 years of living philosophy. Experience the ghats, shrines, weaver gallis, and dawn rāgas with verified locals who hold genuine generational ties to the city.
          </p>
        </header>

        {/* Category Tabs */}
        <div className="banaras-tabs" role="tablist" aria-label="Banaras Experience Categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            className={`banaras-tab ${activeTab === "all" ? "banaras-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Experiences
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ghats"}
            className={`banaras-tab ${activeTab === "ghats" ? "banaras-tab--active" : ""}`}
            onClick={() => setActiveTab("ghats")}
          >
            Ghats & River Rites
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "spiritual"}
            className={`banaras-tab ${activeTab === "spiritual" ? "banaras-tab--active" : ""}`}
            onClick={() => setActiveTab("spiritual")}
          >
            Temples & Sacred Sites
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "crafts"}
            className={`banaras-tab ${activeTab === "crafts" ? "banaras-tab--active" : ""}`}
            onClick={() => setActiveTab("crafts")}
          >
            Silk & Artisans
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "food"}
            className={`banaras-tab ${activeTab === "food" ? "banaras-tab--active" : ""}`}
            onClick={() => setActiveTab("food")}
          >
            Street Food & Gallis
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sarnath"}
            className={`banaras-tab ${activeTab === "sarnath" ? "banaras-tab--active" : ""}`}
            onClick={() => setActiveTab("sarnath")}
          >
            Sarnath Excursion
          </button>
        </div>

        {/* Featured Cards Grid */}
        <div className="banaras-cards-grid">
          {filteredSpots.map((spot, idx) => (
            <article
              key={spot.id}
              className="banaras-card"
              data-reveal
              style={{ ["--delay" as string]: `${idx * 60}ms` }}
            >
              <div className="banaras-card__img-wrap">
                <img
                  src={spot.image}
                  alt={spot.title}
                  className="banaras-card__img"
                  loading="lazy"
                  width="400"
                  height="260"
                />
                <span className="banaras-card__badge">{spot.tag}</span>
                {spot.hindiName && <span className="banaras-card__hindi">{spot.hindiName}</span>}
              </div>

              <div className="banaras-card__body">
                <div className="banaras-card__meta">
                  <span>
                    <MapPin size={13} aria-hidden="true" />
                    {spot.location}
                  </span>
                  <span>
                    <Clock size={13} aria-hidden="true" />
                    {spot.bestTime}
                  </span>
                </div>

                <h3>{spot.title}</h3>
                <p className="banaras-card__desc">{spot.description}</p>

                <div className="banaras-card__note">
                  <Info size={14} className="note-icon" aria-hidden="true" />
                  <p>
                    <strong>Local Custom:</strong> {spot.culturalNote}
                  </p>
                </div>

                <div className="banaras-card__footer">
                  <Link
                    to={`/book-trip?where=Varanasi&pref=${encodeURIComponent(spot.tag)}`}
                    className="btn btn--subtle btn--sm"
                  >
                    <span>Plan with a Varanasi Buddy</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Suggested Realistic Itineraries */}
        <div className="banaras-itineraries-wrap">
          <div className="itineraries-head">
            <div>
              <p className="eyebrow eyebrow--dark">Curated Itinerary Blueprints</p>
              <h3>Practical, Stress-Free Varanasi Route Plans</h3>
            </div>
            <p className="itineraries-sub">
              Realistic pacing that accounts for boat timings, old alley foot-traffic, temple security, and afternoon heat.
            </p>
          </div>

          <div className="itineraries-grid">
            {BANARAS_ITINERARIES.map((it, i) => (
              <div key={it.title} className="itinerary-card" data-reveal style={{ ["--delay" as string]: `${i * 100}ms` }}>
                <div className="itinerary-card__header">
                  <span className="itinerary-badge">{it.badge}</span>
                  <h4>{it.title}</h4>
                  <span className="itinerary-duration">
                    <Calendar size={14} aria-hidden="true" />
                    {it.duration}
                  </span>
                </div>

                <ul className="itinerary-steps">
                  {it.stops.map((step, sIdx) => (
                    <li key={sIdx}>
                      <span className="step-num">{sIdx + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                <div className="itinerary-footer">
                  <p className="itinerary-fit">
                    <strong>Ideal for:</strong> {it.recommendedFor}
                  </p>
                  <Link
                    to={`/book-trip?where=Varanasi&itinerary=${encodeURIComponent(it.title)}`}
                    className="itinerary-cta"
                  >
                    Customize this Route <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
