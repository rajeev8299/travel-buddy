import { Mail, Phone, Clock } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Finder from "../components/Finder";
import { useReveal } from "../hooks";
import { asset } from "../data";

export default function Plan() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef}>
      <PageHeader
        eyebrow="Plan my trip"
        title="Tell us what you're curious about"
        intro="No payment yet — just a conversation. Most travellers get a draft plan back within a day."
        image={asset("img/boats.jpg")}
        pos="center 55%"
      />

      <section className="section">
        <div className="shell plan__finder" data-reveal>
          <Finder />
        </div>
      </section>

      <section className="section section--tint">
        <div className="shell grid grid--reach">
          <div className="panel" data-reveal>
            <span className="feature__icon">
              <Mail size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h3>Email</h3>
            <p>Best for detail — dates, dietary needs, accessibility, who's coming.</p>
            <a className="panel__link" href="mailto:hello@travelonbuddy.in">
              hello@travelonbuddy.in
            </a>
          </div>

          <div className="panel" data-reveal style={{ "--delay": "80ms" }}>
            <span className="feature__icon">
              <Phone size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h3>Phone</h3>
            <p>A real person in Delhi, not a menu. Good for the awkward questions.</p>
            <a className="panel__link" href="tel:+911140001234">
              +91 11 4000 1234
            </a>
          </div>

          <div className="panel" data-reveal style={{ "--delay": "160ms" }}>
            <span className="feature__icon">
              <Clock size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h3>Hours</h3>
            <p>Mon–Sat, 9am–8pm IST. The 24-hour line is for travellers already on a trip.</p>
            <span className="panel__link">Reply within one working day</span>
          </div>
        </div>
      </section>
    </div>
  );
}
