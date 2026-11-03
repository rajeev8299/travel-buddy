import { memo } from "react";
import { Link } from "react-router-dom";
import "./KashiThemeFullWidth.css";

export const KashiFooter = memo(function KashiFooter({ openManualGuide }) {
  return (
    <footer className="kashi-footer">
      <div className="kashi-footer__top">
        {/* COLUMN 1 — BRAND */}
        <div className="kashi-footer__brand-col">
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
              color: "#FFF",
            }}
          >
            <span className="kashi-nav__logo-seal" style={{ width: "38px", height: "38px" }}>
              <span style={{ fontSize: "0.95rem" }}>ॐ</span>
            </span>
            <strong style={{ fontSize: "1.3rem", fontFamily: "var(--kashi-font-serif)" }}>
              TravelOnBuddy
            </strong>
          </Link>
          <p>
            Discover the timeless spirit of Kashi with authentic local experiences, trusted travel
            guidance and unforgettable journeys.
          </p>
          <span style={{ color: "var(--kashi-gold)", fontSize: "0.85rem", fontWeight: "600" }}>
            Har Har Mahadev · काशी विश्वनाथ
          </span>
        </div>

        {/* COLUMN 2 — DESTINATIONS */}
        <div className="kashi-footer__col">
          <h4>Destinations</h4>
          <a href="/#famous-places">Famous Ghats</a>
          <a href="/#spiritual-places">Kashi Vishwanath</a>
          <a href="/#historical-places">Sarnath Stupa</a>
          <a href="/#hidden-gems">Old City Gallis</a>
          <a href="/#famous-places">Assi Ghat</a>
        </div>

        {/* COLUMN 3 — EXPERIENCES */}
        <div className="kashi-footer__col">
          <h4>Experiences</h4>
          <a href="/#experiences">Ganga Maha Aarti</a>
          <a href="/#experiences">Dawn Rowing Boats</a>
          <a href="/#experiences">Dev Deepawali</a>
          <a href="/#local-markets">Silk Weaver Studios</a>
          <Link to="/food-explorer">Banarasi Food Trail</Link>
        </div>

        {/* COLUMN 4 — PLAN & HELP */}
        <div className="kashi-footer__col">
          <h4>Plan &amp; Help</h4>
          <Link to="/plan">Itinerary Planner</Link>
          <Link to="/buddies">Find a Buddy</Link>
          <a href="/#kashi-faqs">Visitor FAQs</a>
          <Link to="/why-buddy">Safety &amp; ID Verification</Link>
          <Link to="/become-a-buddy">Become a Buddy</Link>
          {openManualGuide && (
            <button
              type="button"
              onClick={openManualGuide}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "rgba(255, 255, 255, 0.8)",
                font: "inherit",
                fontSize: "0.88rem",
                textAlign: "left",
                cursor: "pointer",
                marginTop: "0.4rem",
                display: "block",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--kashi-gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)")}
            >
              Install App 📲
            </button>
          )}
        </div>

        {/* COLUMN 5 — CONNECT WITH KASHI */}
        <div className="kashi-footer__col kashi-footer__contact">
          <h4>Connect with Kashi</h4>
          <p>
            Email:{" "}
            <a href="mailto:hello@travelonbuddy.in" style={{ display: "inline", color: "inherit" }}>
              hello@travelonbuddy.in
            </a>
          </p>
          <p>
            Helpline:{" "}
            <a href="tel:+911140001234" style={{ display: "inline", color: "inherit" }}>
              +91 11 4000 1234
            </a>
          </p>
          <p>Mon–Sat, 9:00 AM – 8:00 PM IST</p>
          <div style={{ marginTop: "1rem" }}>
            <Link
              to="/plan"
              className="btn-kashi-saffron"
              style={{ padding: "0.55rem 1.15rem", fontSize: "0.86rem", display: "inline-flex" }}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Popular in Varanasi SEO links */}
      <div className="kashi-footer__popular-links">
        <h4>Popular in Varanasi</h4>
        <p>
          <span><Link to="/plan">Sunrise boat ride on the Ganga</Link></span> ·{" "}
          <span><Link to="/plan">Ganga Aarti at Dashashwamedh Ghat</Link></span> ·{" "}
          <span><Link to="/plan">Kashi Vishwanath Temple</Link></span> ·{" "}
          <span><Link to="/plan">Sarnath &amp; the Dhamek Stupa</Link></span> ·{" "}
          <span><Link to="/plan">Banarasi silk weavers&apos; lanes</Link></span> ·{" "}
          <span><Link to="/plan">Old-city galli food walk</Link></span> ·{" "}
          <span><Link to="/plan">Assi Ghat mornings</Link></span> ·{" "}
          <span><Link to="/plan">Ramnagar Fort</Link></span>
        </p>
      </div>

      {/* BOTTOM FOOTER BAR (Single Copyright across entire page) */}
      <div className="kashi-footer__bottom">
        <p>© 2026 TravelOnBuddy. All rights reserved.</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link to="/why-buddy" style={{ color: "inherit", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <Link to="/why-buddy" style={{ color: "inherit", textDecoration: "none" }}>
            Terms of Service
          </Link>
          <Link to="/why-buddy" style={{ color: "inherit", textDecoration: "none" }}>
            Safety Guarantee
          </Link>
        </div>
      </div>
    </footer>
  );
});

export default KashiFooter;

