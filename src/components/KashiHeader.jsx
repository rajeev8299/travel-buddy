import { useState, useRef, useEffect, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Landmark,
  Building2,
  Compass,
  Eye,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../auth/authContext";
import "./KashiThemeFullWidth.css";

export const KashiHeader = memo(function KashiHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const destDropdownRef = useRef(null);

  // Close dropdown and drawer on path change, Escape key, or outside click
  useEffect(() => {
    setDestDropdownOpen(false);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setDestDropdownOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    }
    function handleClickOutside(e) {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setDestDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  // Prevent background scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/food-explorer?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isHome = location.pathname === "/" || location.pathname === "";

  return (
    <header className="kashi-nav" role="banner">
      <div className="kashi-nav__row">
        {/* Left Brand with Trishul & Lord Shiva inspired emblem */}
        <Link to="/" className="kashi-nav__brand" aria-label="TravelOnBuddy Home">
          <span className="kashi-nav__logo-seal">
            <span className="kashi-seal-icon">ॐ</span>
          </span>
          <div className="kashi-nav__brand-titles">
            <span className="kashi-nav__brand-main">TravelOnBuddy</span>
            <span className="kashi-nav__brand-sub">Kashi Heritage Tours</span>
          </div>
        </Link>

        {/* Center Full-width distributed Nav items */}
        <nav className="kashi-nav__links" aria-label="Main Navigation">
          <Link to="/" className={`kashi-nav__link ${isHome ? "is-active" : ""}`}>
            Home
          </Link>

          <div className="kashi-nav__dropdown" ref={destDropdownRef}>
            <button
              type="button"
              className="kashi-nav__link kashi-nav__dropdown-btn"
              onClick={() => setDestDropdownOpen(!destDropdownOpen)}
              aria-expanded={destDropdownOpen}
              aria-haspopup="true"
            >
              Destinations <ChevronDown size={14} className={destDropdownOpen ? "rotate-caret" : ""} />
            </button>

            {destDropdownOpen && (
              <div className="kashi-dropdown-menu" role="menu">
                <a href="/#famous-places" role="menuitem" onClick={() => setDestDropdownOpen(false)}>
                  <Landmark size={15} /> Famous Places
                </a>
                <a href="/#spiritual-places" role="menuitem" onClick={() => setDestDropdownOpen(false)}>
                  <Building2 size={15} /> Spiritual Experiences
                </a>
                <a href="/#historical-places" role="menuitem" onClick={() => setDestDropdownOpen(false)}>
                  <Compass size={15} /> Historical Places
                </a>
                <a href="/#hidden-gems" role="menuitem" onClick={() => setDestDropdownOpen(false)}>
                  <Eye size={15} /> Hidden Gems
                </a>
              </div>
            )}
          </div>

          <Link
            to="/food-explorer"
            className={`kashi-nav__link ${location.pathname.startsWith("/food-explorer") ? "is-active" : ""}`}
          >
            Food Explorer
          </Link>
          <a href="/#experiences" className="kashi-nav__link">
            Experiences
          </a>
          <a href="/#spiritual-heritage" className="kashi-nav__link">
            Spiritual Kashi
          </a>
          <a href="/#local-markets" className="kashi-nav__link">
            Handlooms &amp; Silk
          </a>
          <Link
            to="/plan"
            className={`kashi-nav__link ${location.pathname === "/plan" ? "is-active" : ""}`}
          >
            Plan My Trip
          </Link>
          <a href="/#frames-gallery" className="kashi-nav__link">
            Gallery
          </a>
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="kashi-nav__actions">
          <button
            type="button"
            className="kashi-nav__search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search Kashi"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            className="kashi-nav__bell-btn"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="kashi-bell-dot" />
          </button>

          {user ? (
            <button
              type="button"
              className="kashi-nav__login-btn"
              title={`Signed in as ${user.email}`}
              onClick={signOut}
            >
              Log out
            </button>
          ) : (
            <Link to="/login" className="kashi-nav__login-btn">
              Login
            </Link>
          )}

          <Link to="/signup" className="kashi-nav__signup-btn">
            Sign Up
          </Link>

          {/* Mobile hamburger menu toggle button */}
          <button
            type="button"
            className="kashi-nav__burger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="kashi-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <nav className="kashi-mobile-drawer__links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Home
            </Link>
            <a href="/#famous-places" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Famous Places
            </a>
            <a href="/#spiritual-places" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Spiritual Experiences
            </a>
            <Link to="/food-explorer" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Food Explorer
            </Link>
            <a href="/#experiences" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Experiences
            </a>
            <a href="/#spiritual-heritage" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Spiritual Kashi
            </a>
            <a href="/#local-markets" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Handlooms &amp; Silk
            </a>
            <Link to="/plan" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Plan My Trip
            </Link>
            <a href="/#frames-gallery" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Gallery
            </a>
            <Link to="/buddies" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Your Buddies
            </Link>
            <Link to="/why-buddy" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Why Buddy (Safety)
            </Link>
            <Link to="/become-a-buddy" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Become a Buddy
            </Link>
          </nav>

          <div className="kashi-mobile-drawer__actions">
            {user ? (
              <button
                type="button"
                className="kashi-nav__login-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                style={{ width: "100%", textAlign: "center" }}
              >
                Log out ({user.name || user.email})
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.8rem", width: "100%" }}>
                <Link
                  to="/login"
                  className="kashi-nav__login-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="kashi-nav__signup-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Sign Up
                </Link>
              </div>
            )}
            <Link
              to="/plan"
              className="btn-kashi-saffron"
              onClick={() => setMobileMenuOpen(false)}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              Plan My Trip
            </Link>
          </div>
        </div>
      )}

      {/* Full-width Search Drawer */}
      {searchOpen && (
        <form className="kashi-search-drawer" onSubmit={handleSearchSubmit}>
          <div className="kashi-search-drawer__inner">
            <Search size={18} color="var(--kashi-gold)" />
            <input
              type="text"
              placeholder="Search sacred ghats, temple darshans, street chaat, banarasi silk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer" }}
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>
        </form>
      )}
    </header>
  );
});

export default KashiHeader;
