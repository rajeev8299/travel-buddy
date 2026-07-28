import { useState, useEffect, useCallback } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./components/Logo";
import CREDITS from "./credits.json";
import { BRAND, TAGLINE, NAV } from "./data";
import "./App.css";

/** Every navigation should land at the top of the new page, not mid-scroll. */
function useScrollToTop(pathname) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useScrollToTop(pathname);

  /* sticky header state */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* a drawer left open across a route change would cover the new page */
  useEffect(() => setMenuOpen(false), [pathname]);

  /* mobile drawer: lock scroll + close on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="page">
      <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
        <div className="shell nav__inner">
          <Logo />

          <nav className="nav__links" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "is-active" : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav__actions">
            <Link className="btn btn--ghost" to="/become-a-buddy">
              Become a buddy
            </Link>
            <Link className="btn btn--ghost nav__login" to="/login">
              Log in
            </Link>
            <Link className="btn btn--solid" to="/plan">
              Plan my trip
            </Link>
          </div>

          <button
            className="nav__burger"
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <nav className="drawer__links">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "is-active" : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/become-a-buddy" onClick={closeMenu}>
              Become a buddy
            </NavLink>
            <NavLink to="/login" onClick={closeMenu}>
              Log in / Sign up
            </NavLink>
          </nav>
          <Link className="btn btn--solid btn--wide" to="/plan" onClick={closeMenu}>
            Plan my trip
          </Link>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="foot">
        <div className="shell foot__inner">
          <div className="foot__brand">
            <Logo size={72} />
            <p className="foot__tagline">{TAGLINE}</p>
            <p>Local-led travel across India, since 2019.</p>
          </div>

          <nav className="foot__col" aria-label="Explore">
            <h4>Explore</h4>
            {NAV.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="foot__col" aria-label="Company">
            <h4>Company</h4>
            <Link to="/become-a-buddy">Become a buddy</Link>
            <Link to="/why-buddy">Safety promise</Link>
            <Link to="/plan">Contact</Link>
          </nav>

          <div className="foot__col">
            <h4>Reach us</h4>
            <a href="mailto:hello@travelonbuddy.in">hello@travelonbuddy.in</a>
            <a href="tel:+911140001234">+91 11 4000 1234</a>
            <p className="foot__hours">Mon–Sat, 9am–8pm IST</p>
          </div>
        </div>

        <div className="shell foot__credits">
          <h4>Photography</h4>
          <p>
            {CREDITS.map((c, i) => (
              <span key={c.id}>
                {i > 0 && " · "}
                <a href={c.source} target="_blank" rel="noreferrer noopener">
                  {c.title}
                </a>{" "}
                by {c.creator} ({c.license})
              </span>
            ))}
          </p>
        </div>

        <div className="shell foot__base">
          <p>
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
          <p>Made in India 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
