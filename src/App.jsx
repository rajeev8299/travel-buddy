import { useState, useEffect, useCallback } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./components/Logo";
import { BRAND, TAGLINE, NAV } from "./data";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { useAuth } from "./auth/authContext";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { KashiFooter } from "./components/KashiFooter";
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
  const { user, signOut } = useAuth();

  useScrollToTop(pathname);

  const isHome = pathname === "/" || pathname === "";

  /* sticky header state for non-home pages */
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

  const {
    canPrompt,
    platform,
    showManualModal,
    triggerInstall,
    dismissPrompt,
    openManualGuide,
    closeManualGuide,
  } = usePWAInstall();

  return (
    <div className="page">
      {/* On Home page, KashiThemeFullWidth renders its own full-width Kashi Navy Navbar.
          On other public routes, render the consistent top navigation bar */}
      {!isHome && (
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
              {user ? (
                <button
                  type="button"
                  className="btn btn--ghost nav__login"
                  title={`Signed in as ${user.email}`}
                  onClick={signOut}
                >
                  Log out
                </button>
              ) : (
                <Link className="btn btn--ghost nav__login" to="/login">
                  Log in
                </Link>
              )}
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
      )}

      {menuOpen && !isHome && (
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
            {user ? (
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  signOut();
                }}
              >
                Log out ({user.name})
              </button>
            ) : (
              <NavLink to="/login" onClick={closeMenu}>
                Log in / Sign up
              </NavLink>
            )}
          </nav>
          <Link className="btn btn--solid btn--wide" to="/plan" onClick={closeMenu}>
            Plan my trip
          </Link>
        </div>
      )}

      <main>
        <Outlet context={{ openManualGuide }} />
      </main>

      {/* When NOT on the Home page, render the single unified Dark Kashi Navy Footer.
          (On Home page, KashiThemeFullWidth renders the same Dark Kashi Navy Footer directly).
          The legacy brown footer has been completely eliminated! */}
      {!isHome && <KashiFooter openManualGuide={openManualGuide} />}

      {/* Progressive Web App Install Prompt & Manual Guide */}
      <PWAInstallPrompt
        canPrompt={canPrompt}
        platform={platform}
        showManualModal={showManualModal}
        onInstall={triggerInstall}
        onDismiss={dismissPrompt}
        onOpenManual={openManualGuide}
        onCloseManual={closeManualGuide}
      />
    </div>
  );
}
