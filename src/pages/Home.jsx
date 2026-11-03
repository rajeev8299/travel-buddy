import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Compass, ShieldCheck, Quote, Users } from "lucide-react";
import HeroBackdrop from "../components/HeroBackdrop";
import Finder from "../components/Finder";
import { BanarasCanvas3D } from "../components/BanarasCanvas3D";
import { BanarasEditorial } from "../components/BanarasEditorial";
import { DestinationShowcase } from "../components/DestinationShowcase";
import {
  TrustStrip,
  AboutSection,
  ServicesSection,
  HowWeWorkSection,
  FAQSection,
  ContactEnquirySection,
} from "../components/HomeSections";
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
            EXPLORE VARANASI (KASHI)
          </p>

          <h1 data-reveal style={{ "--delay": "60ms" }}>
            Discover the Soul of <em>Banaras</em>
          </h1>

          <p className="hero__sub" data-reveal style={{ "--delay": "120ms" }}>
            Where every Ghat tells a story, every street has a flavour, and every journey becomes a memory.
          </p>

          <div className="hero__actions" data-reveal style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap", margin: "1rem 0 1.8rem" }}>
            <a href="#explore-banaras" className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.6rem", fontSize: "1rem", fontWeight: "600", borderRadius: "999px", background: "linear-gradient(135deg, #F07824 0%, #E06010 100%)", color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(240, 120, 36, 0.4)" }}>
              Explore Banaras
            </a>
            <Link to="/plan" className="btn btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.6rem", fontSize: "1rem", fontWeight: "600", borderRadius: "999px", background: "rgba(255,255,255,0.92)", color: "#29251F", textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}>
              Plan Your Trip
            </Link>
          </div>
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

      <section className="section" id="explore-banaras">
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

      {/* Trust & Credibility Strip */}
      <TrustStrip />

      {/* 3D Banaras Twilight Ganga Experience */}
      <section className="section" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
        <div className="shell">
          <BanarasCanvas3D />
        </div>
      </section>

      {/* Deep Banaras Editorial: Ghats, Temples, Silk, Food & Itineraries */}
      <BanarasEditorial />

      {/* Other Curated India Destinations */}
      <DestinationShowcase />

      {/* About Company & Local Travel Philosophy */}
      <AboutSection />

      {/* Tailored Experience Categories */}
      <ServicesSection />

      {/* 4-Step Process & How We Work */}
      <HowWeWorkSection />

      {/* Genuine FAQ Accordion */}
      <FAQSection />

      {/* Direct Contact & Custom Trip Enquiry */}
      <ContactEnquirySection />
    </div>
  );
}
