import { useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Video,
  Clock,
  ChevronDown,
  CheckCircle2,
  Send,
  Loader2,
  ArrowRight,
  HeartHandshake,
  Footprints,
  Camera,
  Coffee,
} from "lucide-react";
import { CITIES, asset } from "../data";
import { api } from "../lib/api";
import "./HomeSections.css";

/* ------------------------------------------------------------- Trust Strip */
export const TrustStrip = memo(function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Our Commitments">
      <div className="shell">
        <div className="trust-strip__grid">
          <div className="trust-item" data-reveal>
            <div className="trust-item__icon">
              <ShieldCheck size={22} strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <strong>100% ID Verified</strong>
              <span>Government ID & reference checked</span>
            </div>
          </div>

          <div className="trust-item" data-reveal style={{ "--delay": "70ms" }}>
            <div className="trust-item__icon">
              <Video size={22} strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <strong>Video Call First</strong>
              <span>Meet your buddy before paying</span>
            </div>
          </div>

          <div className="trust-item" data-reveal style={{ "--delay": "140ms" }}>
            <div className="trust-item__icon">
              <Clock size={22} strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <strong>24-Hour Drafts</strong>
              <span>Custom day plan returned quickly</span>
            </div>
          </div>

          <div className="trust-item" data-reveal style={{ "--delay": "210ms" }}>
            <div className="trust-item__icon">
              <HeartHandshake size={22} strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <strong>Safety Promise</strong>
              <span>Support team ready if plans derail</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

/* ----------------------------------------------------------- About Section */
export const AboutSection = memo(function AboutSection() {
  return (
    <section className="section" id="about">
      <div className="shell">
        <div className="about-grid">
          <div className="about-content" data-reveal>
            <p className="eyebrow eyebrow--dark">Who we are</p>
            <h2>See Varanasi with locals who call it home</h2>
            <p className="lead">
              Founded in 2019, TravelOnBuddy connects travellers with verified locals who grew up on the ghats and in the gallis of Varanasi.
            </p>
            <p>
              We believe authentic travel happens when you leave the scripted bus tours behind. Whether you want the temple alleys of the old city, a silent sunrise on the river, or a slow day among the stupas of Sarnath, our buddies craft each hour around your pace, preferences, and comfort.
            </p>

            <div className="about-pillars">
              <div className="about-pillar">
                <h4>No Commission Kickbacks</h4>
                <p>Buddies show you their actual favourites, never tourist traps that pay behind the scenes.</p>
              </div>
              <div className="about-pillar">
                <h4>Flexible Pace</h4>
                <p>Change your mind midday? Skip a monument to sit by the river? Your buddy adapts immediately.</p>
              </div>
            </div>
          </div>

          <div className="about-visual" data-reveal style={{ "--delay": "120ms" }}>
            <div className="about-card-banner">
              <img
                src={asset("img/varanasi.jpg")}
                alt="Embankment of Varanasi along the Ganga"
                loading="lazy"
                width="600"
                height="420"
              />
            </div>
            <div className="about-card-floating">
              <p>
                <strong>“The best trips aren't rigid checklists.”</strong>
                <br />
                We pair you with someone who knows every shortcut, morning chai spot, and quiet hour.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

/* -------------------------------------------------------- Services Section */
const SERVICES = [
  {
    icon: Footprints,
    title: "Heritage & Secret Gallis",
    desc: "Uncover living history through tucked-away courtyards, ancient stepwells, and neighborhood folklore missing from travel blogs.",
    deliverables: ["Custom walking route", "Crowd-avoidance timing", "Archival stories & legends"],
    link: "/plan",
  },
  {
    icon: Coffee,
    title: "Street Food & Local Markets",
    desc: "Taste multi-generational recipes safely. Your buddy navigates busy bazaars, ensures hygienic picks, and handles translation seamlessly.",
    deliverables: ["Curated dietary safety", "Historic food stalls", "Bargaining assistance"],
    link: "/plan",
  },
  {
    icon: Camera,
    title: "Photography & Sunrise Walks",
    desc: "Catch evocative morning light at ghats, mountain ridge lines, or bustling ports guided by locals who understand prime angles and seasons.",
    deliverables: ["Golden hour vantage points", "Port / boat coordination", "Cultural etiquette guidance"],
    link: "/plan",
  },
];

export const ServicesSection = memo(function ServicesSection() {
  return (
    <section className="section section--tint" id="services">
      <div className="shell">
        <header className="section__head" data-reveal>
          <div>
            <p className="eyebrow eyebrow--dark">What we offer</p>
            <h2>Tailored travel experiences</h2>
          </div>
          <p className="section__note">
            Built from scratch for individuals, couples, and private families. Never crowded group tours.
          </p>
        </header>

        <div className="grid grid--services">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <article key={s.title} className="service-card" data-reveal style={{ "--delay": `${i * 90}ms` }}>
                <div className="service-card__icon">
                  <Icon size={24} strokeWidth={2} aria-hidden="true" />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="service-card__deliverables">
                  {s.deliverables.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={15} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to={s.link} className="btn btn--soft">
                  Plan This Trip <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
});

/* ------------------------------------------------------ How We Work Section */
const STEPS = [
  {
    n: "01",
    title: "Tell us where and how you like to travel",
    body: "Submit your dates, destination, and interests. Whether you crave quiet temples or street food marathons, tell us your mood.",
  },
  {
    n: "02",
    title: "Review your buddy match",
    body: "We match you within 24 hours with an ID-verified local who lives where you're going and speaks your preferred languages.",
  },
  {
    n: "03",
    title: "Meet over a video call",
    body: "Hop on an introductory video call before paying anything. Ask questions, clarify vibes, and verify the personal fit.",
  },
  {
    n: "04",
    title: "Travel together with complete peace of mind",
    body: "Your buddy meets you on arrival. You get a flexible day guided by a friend, backed by our central safety desk.",
  },
];

export const HowWeWorkSection = memo(function HowWeWorkSection() {
  return (
    <section className="section" id="how-it-works">
      <div className="shell">
        <header className="section__head" data-reveal>
          <div>
            <p className="eyebrow eyebrow--dark">Process</p>
            <h2>How TravelOnBuddy works</h2>
          </div>
          <p className="section__note">
            Four simple steps from your first curiosity to wandering with a trusted friend.
          </p>
        </header>

        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.n} data-reveal style={{ "--delay": `${i * 80}ms` }}>
              <span className="steps__n" aria-hidden="true">
                {step.n}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
});

/* ------------------------------------------------------------- FAQ Section */
const FAQS = [
  {
    q: "How are local buddies vetted and verified?",
    a: "Every buddy undergoes mandatory government-issued ID checks (Aadhaar/Passport/Driving License), multi-party personal and professional reference calls, and an extensive scenario interview regarding safety, emergency response, and local cultural norms.",
  },
  {
    q: "Do I have to pay before speaking to my buddy?",
    a: "No. You receive a free initial match and a 15-minute video call to ensure mutual comfort and align on trip expectations before any payment or booking commitment is made.",
  },
  {
    q: "Can my buddy help with transportation or tickets?",
    a: "Yes. Buddies help organize pre-negotiated auto-rickshaws, private taxis, local ferry tickets, and monument admissions at official local rates without tourist markups.",
  },
  {
    q: "What happens if our plans change while travelling?",
    a: "That is the greatest benefit of a private buddy over an inflexible group tour. If you wake up tired, get caught in rain, or want to spend two hours relaxing at a ghat, your buddy rewrites the itinerary on the spot.",
  },
  {
    q: "How does payment work?",
    a: "Pricing is transparently based on destination and duration with zero hidden charges. Payments are processed securely with receipts provided directly through the platform.",
  },
];

export const FAQSection = memo(function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = useCallback((idx) => {
    setOpenIdx((cur) => (cur === idx ? -1 : idx));
  }, []);

  return (
    <section className="section section--tint" id="faq">
      <div className="shell">
        <header className="section__head" data-reveal>
          <div>
            <p className="eyebrow eyebrow--dark">Questions &amp; Answers</p>
            <h2>Frequently asked questions</h2>
          </div>
          <p className="section__note">Everything you need to know about safety, pairing, and payments.</p>
        </header>

        <div className="faq-list">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={faq.q}
                className={`faq-item is-in ${isOpen ? "faq-item--open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="faq-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

/* ----------------------------------------------------- Contact Enquiry Form */
export const ContactEnquirySection = memo(function ContactEnquirySection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Varanasi",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || (!form.email && !form.phone)) {
      setStatus({ type: "error", msg: "Please provide your name and an email or phone number." });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await api.post("/plan-requests", {
        city: form.city,
        notes: `Enquiry from homepage: ${form.name} | Phone: ${form.phone || "N/A"} | Email: ${form.email || "N/A"}\n\nMessage: ${form.message}`,
        party: "1",
        interests: "Homepage General Enquiry",
      });
      setStatus({
        type: "success",
        msg: "Thank you! Your enquiry has been received. Our team will contact you within 24 hours.",
      });
      setForm({ name: "", email: "", phone: "", city: "Varanasi", message: "" });
    } catch {
      setStatus({
        type: "error",
        msg: "Could not send enquiry right now. Please email us directly at hello@travelonbuddy.in.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="shell">
        <div className="enquiry-panel" data-reveal>
          <div className="enquiry-panel__head">
            <p className="eyebrow eyebrow--dark">Get in touch</p>
            <h3>Have questions or a custom journey in mind?</h3>
            <p>
              Send an enquiry below or write to{" "}
              <a href="mailto:hello@travelonbuddy.in">hello@travelonbuddy.in</a>. Our Delhi team responds within one business day.
            </p>
          </div>

          {status && (
            <div
              className={`enquiry-alert ${
                status.type === "success" ? "enquiry-alert--success" : "enquiry-alert--error"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 size={18} aria-hidden="true" />
              ) : (
                <ShieldCheck size={18} aria-hidden="true" />
              )}
              <span>{status.msg}</span>
            </div>
          )}

          <form className="enquiry-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="enquiry-name">Your Full Name *</label>
              <input
                id="enquiry-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Radhika Sharma"
              />
            </div>

            <div>
              <label htmlFor="enquiry-email">Email Address</label>
              <input
                id="enquiry-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="radhika@example.com"
              />
            </div>

            <div>
              <label htmlFor="enquiry-phone">Phone / WhatsApp</label>
              <input
                id="enquiry-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label htmlFor="enquiry-city">Destination of Interest</label>
              <select id="enquiry-city" name="city" value={form.city} onChange={handleChange}>
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group--full">
              <label htmlFor="enquiry-message">What are you curious about?</label>
              <textarea
                id="enquiry-message"
                name="message"
                rows="3"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about dates, who is travelling, or special requests..."
              />
            </div>

            <div className="form-group--full" style={{ textAlign: "right", marginTop: "8px" }}>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin" aria-hidden="true" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} aria-hidden="true" />
                    <span>Send Enquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
});
