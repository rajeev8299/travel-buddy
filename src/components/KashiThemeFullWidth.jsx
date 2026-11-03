import { useState, useRef, useEffect, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Play,
  Landmark,
  Building2,
  Eye,
  ArrowRight,
  Heart,
  Star,
  Navigation,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Sunrise,
  Flame,
  Shirt,
  Footprints,
  CheckCircle2,
  Check,
  Camera,
  X,
  Users,
  Award,
  Sun,
  ShieldCheck,
  ShoppingBag,
  HelpCircle,
  Clock,
  Compass as CompassIcon,
} from "lucide-react";
import { asset } from "../data";
import { api } from "../lib/api";
import "./KashiThemeFullWidth.css";

export const KashiThemeFullWidth = memo(function KashiThemeFullWidth() {
  const navigate = useNavigate();

  // Navigation states
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Plan trip duration selector
  const [tripDuration, setTripDuration] = useState("1 Day Trip");

  // Map category filter states
  const [mapFilters, setMapFilters] = useState({
    tourist: true,
    food: true,
    hotels: false,
    temples: true,
    ghats: true,
    experiences: true,
  });

  // Food items carousel state
  const foodCarouselRef = useRef(null);
  const [likedShops, setLikedShops] = useState({});

  // Gallery Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Video modal simulation (opens real authentic photo/story showcase)
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Real food shops fetched from backend
  const [foodShops, setFoodShops] = useState([
    {
      id: "shree-kachori",
      name: "Shree Kachori Gali",
      locality: "Kachori Gali, Chowk",
      status: "Open Now",
      rating: 4.8,
      reviews: "2.8K",
      price: "₹30 – ₹80",
      image: asset("img/kachori.jpg"),
      lat: 25.3115,
      lng: 83.0112,
    },
    {
      id: "blue-lassi",
      name: "Blue Lassi Shop",
      locality: "Godowlia / Manikarnika",
      status: "Open Now",
      rating: 4.9,
      reviews: "5.1K",
      price: "₹40 – ₹120",
      image: asset("img/lassi.jpg"),
      lat: 25.3108,
      lng: 83.0135,
    },
    {
      id: "tamatar-chaat",
      name: "Tamatar Chaat Corner",
      locality: "Dashashwamedh",
      status: "Open Now",
      rating: 4.5,
      reviews: "4.2K",
      price: "₹40 – ₹90",
      image: asset("img/chaat.jpg"),
      lat: 25.3075,
      lng: 83.0102,
    },
    {
      id: "jalebi-bai",
      name: "Jalebi Bai Sweets",
      locality: "Thatheri Bazaar",
      status: "Open Now",
      rating: 4.4,
      reviews: "3.2K",
      price: "₹40 – ₹100",
      image: asset("img/jalebi.jpg"),
      lat: 25.3129,
      lng: 83.0118,
    },
  ]);

  useEffect(() => {
    api
      .get("/food-explorer/shops")
      .then((data) => {
        if (data?.shops?.length) {
          const fallbackImgs = [
            asset("img/kachori.jpg"),
            asset("img/lassi.jpg"),
            asset("img/chaat.jpg"),
            asset("img/jalebi.jpg"),
            asset("img/street_food.jpg"),
            asset("img/banaras_chai.jpg"),
          ];
          const mapped = data.shops.slice(0, 8).map((s, idx) => ({
            id: s.id || s.slug || `shop-${idx}`,
            name: s.name,
            locality: s.locality || "Varanasi",
            status: s.is_open ? "Open Now" : "Opens at " + (s.open_time || "8 AM"),
            rating: s.rating || 4.7,
            reviews: s.reviewCount ? `${(s.reviewCount / 1000).toFixed(1)}K` : "2.4K",
            price: s.priceRange || "₹50 - ₹120",
            image: s.image_url ? s.image_url : fallbackImgs[idx % fallbackImgs.length],
            lat: s.latitude || 25.3105,
            lng: s.longitude || 83.0085,
          }));
          setFoodShops(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const toggleLike = (id) => {
    setLikedShops((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollFood = (direction) => {
    if (!foodCarouselRef.current) return;
    const amount = direction === "left" ? -340 : 340;
    foodCarouselRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Gallery items for "Banaras in Frames"
  const galleryItems = [
    {
      src: asset("img/boats.jpg"),
      title: "Sunrise Boats along the Sacred Ganga",
      desc: "Traditional wooden rowing boats greeting the golden mist at dawn.",
    },
    {
      src: asset("img/kashi_vishwanath.jpg"),
      title: "Spiritual Spire of Kashi Vishwanath",
      desc: "Ancient gilded shikharas rising through the heart of the spiritual capital.",
    },
    {
      src: asset("img/dev_diwali.jpg"),
      title: "Ganga Maha Aarti & Evening Brass Lamps",
      desc: "Synchronized brass lamps glowing against the twilight waters of Dashashwamedh.",
    },
    {
      src: asset("img/market.jpg"),
      title: "Ancient Old-City Gallis & Heritage Alleys",
      desc: "Vibrant stone alleys alive with flowers, incense, silk weavers, and sweets.",
    },
    {
      src: asset("img/durga_idol.jpg"),
      title: "Venerated Traditional Clay Art & Deities",
      desc: "Generations of Banarasi artisans sculpting sacred forms along the riverbanks.",
    },
    {
      src: asset("img/ganga_sunrise.jpg"),
      title: "Ganga Horizon at Morning Calm",
      desc: "The unbroken expanse of holy water bathed in soft ochre and crimson hues.",
    },
  ];

  const faqs = [
    {
      q: "What is the best time of year to visit Kashi (Varanasi)?",
      a: "October through March offers the most pleasant weather for exploring the ghats and taking dawn boat rides. November is particularly special due to Dev Deepawali, when all 84 ghats are illuminated with millions of earthen diyas.",
    },
    {
      q: "How does travelling with a verified local buddy work?",
      a: "Your buddy is an ID-verified Varanasi native who guides you through authentic gallis, temple darshans, and hidden culinary spots based on your personal pace. You have a free video call before any booking.",
    },
    {
      q: "What are the essential temple darshan protocols at Kashi Vishwanath?",
      a: "Modest traditional attire is recommended. Mobile phones, electronic smartwatches, and leather accessories must be deposited in the official security lockers at the temple corridor gates before entry.",
    },
    {
      q: "Where can I find authentic handwoven Banarasi Silk sarees?",
      a: "Madanpura, Peeli Kothi, and Chowk are the historical epicenters where master weavers still operate traditional pit-looms. Visiting with a local buddy ensures authentic Zari verification without tourist surcharges.",
    },
    {
      q: "Is it safe to explore the narrow old-city alleys at night?",
      a: "The main market streets like Godowlia, Dashashwamedh, and Vishwanath Galli remain bustling and active until late evening. For quieter residential alleys, walking with a companion or local buddy provides the best experience.",
    },
  ];

  return (
    <div className="kashi-theme-page">
      {/* =========================================================================
          1. FULL-WIDTH DARK KASHI NAVY NAVBAR
          ========================================================================= */}
      <header className="kashi-nav">
        <div className="kashi-nav__row">
          {/* Left Brand with Trishul & Lord Shiva inspired emblem */}
          <Link to="/" className="kashi-nav__brand">
            <span className="kashi-nav__logo-seal">
              <span className="kashi-seal-icon">ॐ</span>
            </span>
            <div className="kashi-nav__brand-titles">
              <span className="kashi-nav__brand-main">TravelOnBuddy</span>
              <span className="kashi-nav__brand-sub">Kashi Heritage Tours</span>
            </div>
          </Link>

          {/* Full-width distributed Nav items */}
          <nav className="kashi-nav__links" aria-label="Main Navigation">
            <Link to="/" className="kashi-nav__link is-active">
              Home
            </Link>

            <div
              className="kashi-nav__dropdown"
              onMouseEnter={() => setDestDropdownOpen(true)}
              onMouseLeave={() => setDestDropdownOpen(false)}
            >
              <button
                type="button"
                className="kashi-nav__link kashi-nav__dropdown-btn"
                onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                aria-expanded={destDropdownOpen}
              >
                Destinations <ChevronDown size={14} />
              </button>

              {destDropdownOpen && (
                <div className="kashi-dropdown-menu">
                  <a href="#famous-places">
                    <Landmark size={15} /> Famous Places
                  </a>
                  <a href="#spiritual-places">
                    <Building2 size={15} /> Spiritual Experiences
                  </a>
                  <a href="#historical-places">
                    <Compass size={15} /> Historical Places
                  </a>
                  <a href="#hidden-gems">
                    <Eye size={15} /> Hidden Gems
                  </a>
                </div>
              )}
            </div>

            <Link to="/food-explorer" className="kashi-nav__link">
              Food Explorer
            </Link>
            <a href="#experiences" className="kashi-nav__link">
              Experiences
            </a>
            <a href="#spiritual-heritage" className="kashi-nav__link">
              Spiritual Kashi
            </a>
            <a href="#local-markets" className="kashi-nav__link">
              Handlooms &amp; Silk
            </a>
            <Link to="/plan" className="kashi-nav__link">
              Plan My Trip
            </Link>
            <a href="#frames-gallery" className="kashi-nav__link">
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

            <Link to="/login" className="kashi-nav__login-btn">
              Login
            </Link>

            <Link to="/signup" className="kashi-nav__signup-btn">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Full-width Search Bar */}
        {searchOpen && (
          <div className="kashi-search-drawer">
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
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. FULL-WIDTH HERO SECTION (Lord Shiva & Kashi Sacred Presence)
          ========================================================================= */}
      <section className="kashi-hero" aria-label="Discover the Soul of Banaras">
        <div className="kashi-hero__backdrop">
          <img
            src={asset("img/kashi_full_hero.jpg")}
            alt="Sunrise Ghats on the sacred Ganga, Varanasi"
            className="kashi-hero__img"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div className="kashi-hero__overlay" />
        </div>

        <div className="kashi-hero__content">
          <div className="kashi-hero__left">
            <div className="kashi-hero__badge">
              <span className="trishul-glyph">🔱</span>
              <span>Explore Varanasi (Kashi) • The Eternal City</span>
            </div>

            <h1 className="kashi-hero__title">
              Discover the <br />
              Soul of <span className="kashi-title-accent">Banaras</span>
            </h1>

            <p className="kashi-hero__subtitle">
              Experience the timeless spirit of Kashi — where the sacred Ganga, ancient temples,
              vibrant streets and unforgettable traditions come together.
            </p>

            <div className="kashi-hero__ctas">
              <a href="#explore-banaras" className="btn-kashi-saffron">
                Explore Banaras <ArrowRight size={17} />
              </a>
              <Link to="/plan" className="btn-kashi-ivory">
                <Calendar size={17} /> Plan Your Trip
              </Link>
            </div>

            <div className="kashi-hero__metrics-strip">
              <div className="kashi-metric-item">
                <Landmark size={18} className="kashi-metric-icon" />
                <div className="kashi-metric-text">
                  <strong>100+</strong>
                  <span>Tourist Places</span>
                </div>
              </div>

              <div className="kashi-metric-item">
                <UtensilsCrossed size={18} className="kashi-metric-icon" />
                <div className="kashi-metric-text">
                  <strong>250+</strong>
                  <span>Food Places</span>
                </div>
              </div>

              <div className="kashi-metric-item">
                <Sparkles size={18} className="kashi-metric-icon" />
                <div className="kashi-metric-text">
                  <strong>Curated</strong>
                  <span>Experiences</span>
                </div>
              </div>

              <div className="kashi-metric-item">
                <Calendar size={18} className="kashi-metric-icon" />
                <div className="kashi-metric-text">
                  <strong>Trip</strong>
                  <span>Itineraries</span>
                </div>
              </div>

              <div className="kashi-metric-item">
                <MapPin size={18} className="kashi-metric-icon" />
                <div className="kashi-metric-text">
                  <strong>Maps &amp;</strong>
                  <span>Directions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="kashi-hero__right">
            <button
              type="button"
              className="btn-kashi-watch"
              onClick={() => setVideoModalOpen(true)}
              aria-label="Discover Kashi in 1 Minute"
            >
              <div className="watch-disc">
                <Play size={20} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: "2px" }} />
              </div>
              <div className="watch-text">
                <span>Discover</span>
                <strong>Banaras in 1 Min</strong>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION A: EXPLORE BANARAS (4 Balanced Full-Width Cards)
          ========================================================================= */}
      <section className="kashi-full-section" id="explore-banaras">
        <div className="kashi-full-container">
          <div className="kashi-section-head">
            <div className="kashi-sub-kicker">
              <span className="kashi-gold-rule" />
              <span className="kashi-kicker-label">EXPLORE BANARAS</span>
              <span className="kashi-gold-rule" />
            </div>
            <h2 className="kashi-section-title">Discover Everything in Varanasi</h2>
            <p className="kashi-section-desc">
              From revered riverside shrines and morning classical rāgas to millennium-old heritage
              monuments and vibrant gallis.
            </p>
          </div>

          <div className="kashi-four-cards-grid">
            {/* Card 1: Famous Places */}
            <div className="kashi-explore-card" id="famous-places">
              <div className="kashi-explore-card__photo">
                <img
                  src={asset("img/boats.jpg")}
                  alt="Varanasi Riverfront Ghats"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="kashi-card-badge-seal">
                <Landmark size={20} />
              </div>
              <div className="kashi-explore-card__info">
                <div className="kashi-card-texts">
                  <h3>Famous Places</h3>
                  <p>Temples, Ghats &amp; Must-Visit Attractions</p>
                </div>
                <Link
                  to="/plan"
                  className="kashi-card-link-arrow"
                  title="Explore Famous Places"
                  aria-label="Famous Places"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* Card 2: Spiritual Experiences */}
            <div className="kashi-explore-card" id="spiritual-places">
              <div className="kashi-explore-card__photo">
                <img
                  src={asset("img/kashi_vishwanath.jpg")}
                  alt="Kashi Vishwanath Temple"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="kashi-card-badge-seal">
                <Building2 size={20} />
              </div>
              <div className="kashi-explore-card__info">
                <div className="kashi-card-texts">
                  <h3>Spiritual Experiences</h3>
                  <p>Aarti, Darshan, Rituals &amp; More</p>
                </div>
                <Link
                  to="/plan"
                  className="kashi-card-link-arrow"
                  title="Explore Spiritual Experiences"
                  aria-label="Spiritual Experiences"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* Card 3: Historical Places */}
            <div className="kashi-explore-card" id="historical-places">
              <div className="kashi-explore-card__photo">
                <img
                  src={asset("img/stupa.jpg")}
                  alt="Dhamek Stupa Sarnath"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="kashi-card-badge-seal">
                <Landmark size={20} />
              </div>
              <div className="kashi-explore-card__info">
                <div className="kashi-card-texts">
                  <h3>Historical Places</h3>
                  <p>Ancient Sites, Forts &amp; Heritage</p>
                </div>
                <Link
                  to="/plan"
                  className="kashi-card-link-arrow"
                  title="Explore Historical Places"
                  aria-label="Historical Places"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* Card 4: Hidden Gems */}
            <div className="kashi-explore-card" id="hidden-gems">
              <div className="kashi-explore-card__photo">
                <img
                  src={asset("img/market.jpg")}
                  alt="Old City Narrow Lanes"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="kashi-card-badge-seal om-seal">
                <span>ॐ</span>
              </div>
              <div className="kashi-explore-card__info">
                <div className="kashi-card-texts">
                  <h3>Hidden Gems</h3>
                  <p>Lesser-Known Spots &amp; Local Experiences</p>
                </div>
                <Link
                  to="/plan"
                  className="kashi-card-link-arrow"
                  title="Explore Hidden Gems"
                  aria-label="Hidden Gems"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: BANARAS FOOD EXPLORER (Full-Width Responsive Split)
          ========================================================================= */}
      <section
        className="kashi-full-section"
        id="food-explorer-showcase"
        style={{ background: "var(--kashi-bg-ivory)" }}
      >
        <div className="kashi-full-container">
          <div className="kashi-food-split">
            {/* Left Narrative Panel */}
            <div className="kashi-food-lead">
              <div className="kashi-food-seal">
                <div className="food-icon-urn">
                  <UtensilsCrossed size={28} />
                </div>
                <div className="food-seal-names">
                  <span className="seal-script">Banaras</span>
                  <strong className="seal-main">Food Explorer</strong>
                </div>
              </div>

              <h2 className="kashi-food-lead__title">Taste the Magic of Kashi</h2>
              <p className="kashi-food-lead__desc">
                From crispy piping-hot Kachori Sabzi to creamy saffron Malaiyo and authentic kulhad
                lassi, taste authentic Kashi through its centuries-old culinary secrets.
              </p>

              <Link to="/food-explorer" className="btn-kashi-saffron" style={{ alignSelf: "flex-start" }}>
                Explore All Food Places <ArrowRight size={17} />
              </Link>
            </div>

            {/* Right Horizontal Carousel */}
            <div className="kashi-food-carousel-wrap">
              <button
                type="button"
                className="carousel-paddle paddle-left"
                onClick={() => scrollFood("left")}
                aria-label="Previous food spots"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="carousel-paddle paddle-right"
                onClick={() => scrollFood("right")}
                aria-label="Next food spots"
              >
                <ChevronRight size={22} />
              </button>

              <div className="kashi-food-track" ref={foodCarouselRef}>
                {foodShops.map((shop) => (
                  <div key={shop.id} className="kashi-food-card">
                    <div className="kashi-food-card__img">
                      <img src={shop.image} alt={shop.name} loading="lazy" decoding="async" />
                      <button
                        type="button"
                        className={`kashi-heart-btn ${likedShops[shop.id] ? "is-active" : ""}`}
                        onClick={() => toggleLike(shop.id)}
                        aria-label="Save to favourites"
                      >
                        <Heart
                          size={16}
                          fill={likedShops[shop.id] ? "var(--kashi-saffron)" : "none"}
                          color={likedShops[shop.id] ? "var(--kashi-saffron)" : "#FFFFFF"}
                        />
                      </button>
                    </div>

                    <div className="kashi-food-card__details">
                      <h4 className="kashi-food-title">{shop.name}</h4>

                      <span className="kashi-status-tag">{shop.status}</span>

                      <div className="kashi-rating-row">
                        <Star size={14} fill="var(--kashi-gold)" color="var(--kashi-gold)" />
                        <span className="rating-bold">{shop.rating}</span>
                        <span className="rating-count">({shop.reviews})</span>
                      </div>

                      <div className="kashi-location-price">
                        <span className="kashi-loc-text">
                          <MapPin size={13} /> {shop.locality}
                        </span>
                        <span className="kashi-price-val">{shop.price}</span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-kashi-directions"
                      >
                        <Navigation size={14} style={{ transform: "rotate(45deg)" }} /> Get
                        Directions
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: UNFORGETTABLE EXPERIENCES (Full-Width Responsive 6-Grid)
          ========================================================================= */}
      <section className="kashi-full-section" id="experiences">
        <div className="kashi-full-container">
          <div className="kashi-section-head">
            <div className="kashi-sub-kicker">
              <span className="kashi-gold-rule" />
              <span className="kashi-kicker-label">TIMELESS TRADITIONS</span>
              <span className="kashi-gold-rule" />
            </div>
            <h2 className="kashi-section-title">Unforgettable Experiences in Banaras</h2>
            <p className="kashi-section-desc">
              Immerse yourself in authentic sacred rituals, morning rāgas, and traditional Banarasi
              artisan craftsmanship.
            </p>
          </div>

          <div className="kashi-experiences-grid">
            <div className="kashi-exp-card">
              <img src={asset("img/dev_diwali.jpg")} alt="Ganga Aarti" loading="lazy" />
              <div className="kashi-exp-card__veil">
                <div className="kashi-exp-card__title-row">
                  <Flame size={18} className="kashi-exp-gold-icon" />
                  <span>Ganga Aarti</span>
                </div>
              </div>
            </div>

            <div className="kashi-exp-card">
              <img src={asset("img/ganga_sunrise.jpg")} alt="Sunrise Boat Ride" loading="lazy" />
              <div className="kashi-exp-card__veil">
                <div className="kashi-exp-card__title-row">
                  <Sunrise size={18} className="kashi-exp-gold-icon" />
                  <span>Sunrise Boat Ride</span>
                </div>
              </div>
            </div>

            <div className="kashi-exp-card">
              <img src={asset("img/ghats_dawn.jpg")} alt="Dev Deepawali" loading="lazy" />
              <div className="kashi-exp-card__veil">
                <div className="kashi-exp-card__title-row">
                  <Sparkles size={18} className="kashi-exp-gold-icon" />
                  <span>Dev Deepawali</span>
                </div>
              </div>
            </div>

            <div className="kashi-exp-card">
              <img
                src={asset("img/banaras_silk.jpg")}
                alt="Banarasi Silk Shopping"
                loading="lazy"
              />
              <div className="kashi-exp-card__veil">
                <div className="kashi-exp-card__title-row">
                  <Shirt size={18} className="kashi-exp-gold-icon" />
                  <span>Banarasi Silk Shopping</span>
                </div>
              </div>
            </div>

            <div className="kashi-exp-card">
              <img src={asset("img/market.jpg")} alt="Heritage Walk" loading="lazy" />
              <div className="kashi-exp-card__veil">
                <div className="kashi-exp-card__title-row">
                  <Footprints size={18} className="kashi-exp-gold-icon" />
                  <span>Heritage Walk</span>
                </div>
              </div>
            </div>

            <div className="kashi-exp-card">
              <img src={asset("img/street_food.jpg")} alt="Local Food Tour" loading="lazy" />
              <div className="kashi-exp-card__veil">
                <div className="kashi-exp-card__title-row">
                  <UtensilsCrossed size={18} className="kashi-exp-gold-icon" />
                  <span>Local Food Tour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D & E: PLAN YOUR TRIP & MAP (Full-Width Balanced Duo)
          ========================================================================= */}
      <section
        className="kashi-full-section"
        id="trip-planner-and-map"
        style={{ background: "var(--kashi-bg-ivory)" }}
      >
        <div className="kashi-full-container">
          <div className="kashi-duo-grid">
            {/* Left: Plan Your Perfect Trip */}
            <div className="kashi-panel-box">
              <div className="kashi-panel-head">
                <div className="kashi-panel-icon">
                  <Layers size={26} />
                </div>
                <div className="kashi-panel-head-titles">
                  <h3>Plan Your Perfect Trip</h3>
                  <p>Ready to explore Banaras? Choose a curated itinerary or build your own.</p>
                </div>
              </div>

              <div className="kashi-duration-selector">
                {["1 Day Trip", "2 Days", "3 Days", "Custom"].map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    className={`kashi-duration-pill ${tripDuration === tab ? "is-active" : ""}`}
                    onClick={() => setTripDuration(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="kashi-checklist-grid">
                <div className="kashi-check-item">
                  <CheckCircle2 size={18} className="kashi-check-gold" />
                  <span>Top Attractions</span>
                </div>
                <div className="kashi-check-item">
                  <CheckCircle2 size={18} className="kashi-check-gold" />
                  <span>Food Stops</span>
                </div>
                <div className="kashi-check-item">
                  <CheckCircle2 size={18} className="kashi-check-gold" />
                  <span>Timings &amp; Route</span>
                </div>
                <div className="kashi-check-item">
                  <CheckCircle2 size={18} className="kashi-check-gold" />
                  <span>Map &amp; Directions</span>
                </div>
              </div>

              <div className="kashi-planner-foot">
                <Link to="/plan" className="btn-kashi-saffron">
                  Build My Itinerary <ArrowRight size={17} />
                </Link>
                <div className="planner-thumbnail-preview">
                  <img src={asset("img/boats.jpg")} alt="Trip boat preview" />
                </div>
              </div>
            </div>

            {/* Right: Explore Banaras on Map */}
            <div className="kashi-panel-box">
              <div className="kashi-panel-head">
                <div className="kashi-panel-icon">
                  <MapPin size={26} />
                </div>
                <div className="kashi-panel-head-titles">
                  <h3>Explore Banaras on Map</h3>
                  <p>
                    Find tourist places, food shops, hotels and more — all in one interactive map.
                  </p>
                </div>
              </div>

              <div className="kashi-map-body">
                <div className="kashi-map-canvas">
                  <iframe
                    title="Banaras Live Map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=82.9800,25.2800,83.0300,25.3400&layer=mapnik&marker=25.3105,83.0085"
                    loading="lazy"
                    className="kashi-osm-frame"
                  />
                  <div className="kashi-map-pin-overlay">
                    <strong>Varanasi</strong>
                    <span>(Banaras)</span>
                  </div>
                </div>

                <div className="kashi-filters-column">
                  {[
                    { key: "tourist", label: "Tourist Places", icon: Landmark, color: "#E05A12" },
                    { key: "food", label: "Food Places", icon: UtensilsCrossed, color: "#E84A0B" },
                    { key: "hotels", label: "Hotels & Stays", icon: Building2, color: "#8E44AD" },
                    { key: "temples", label: "Temples", icon: Sparkles, color: "#D35400" },
                    { key: "ghats", label: "Ghats", icon: Sunrise, color: "#2980B9" },
                    { key: "experiences", label: "Experiences", icon: Award, color: "#F39C12" },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <label key={filter.key} className="kashi-filter-option">
                        <input
                          type="checkbox"
                          checked={mapFilters[filter.key]}
                          onChange={(e) =>
                            setMapFilters((prev) => ({
                              ...prev,
                              [filter.key]: e.target.checked,
                            }))
                          }
                        />
                        <span className="kashi-custom-checkbox">
                          {mapFilters[filter.key] && <Check size={12} />}
                        </span>
                        <Icon size={14} style={{ color: filter.color }} />
                        <span>{filter.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: "auto" }}>
                <Link
                  to="/food-explorer"
                  className="btn-kashi-saffron"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Open Interactive Map <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RICH CONTENT SECTION 1: THE SPIRITUAL SIDE OF KASHI
          ========================================================================= */}
      <section className="kashi-full-section kashi-dark-feature" id="spiritual-heritage">
        <div className="kashi-full-container">
          <div className="kashi-section-head">
            <div className="kashi-sub-kicker">
              <span className="kashi-gold-rule" />
              <span className="kashi-kicker-label" style={{ color: "var(--kashi-gold)" }}>
                DIVINE SANCTUARY
              </span>
              <span className="kashi-gold-rule" />
            </div>
            <h2 className="kashi-section-title">The Spiritual Side of Kashi</h2>
            <p className="kashi-section-desc">
              Where Lord Shiva is said to dwell eternally, granting liberation (Moksha) to those
              who seek the eternal flow of the mother river.
            </p>
          </div>

          <div className="kashi-spiritual-trio">
            <div className="spiritual-feature-card">
              <div className="spiritual-feature-icon">
                <Sparkles size={24} />
              </div>
              <h4>Kashi Vishwanath Jyotirlinga</h4>
              <p>
                The radiant golden temple revered across millennia as the principal shrine of Lord
                Shiva. Now connected to the Ganga via the expansive cultural corridor.
              </p>
              <Link to="/plan" className="spiritual-link">
                Plan Darshan Guide <ArrowRight size={15} />
              </Link>
            </div>

            <div className="spiritual-feature-card">
              <div className="spiritual-feature-icon">
                <Flame size={24} />
              </div>
              <h4>Maha Aarti at Dashashwamedh</h4>
              <p>
                Every evening as dusk settles, synchronized chants, incense, conch shell calls and
                towering brass lamps create a transcendent riverfront symphony.
              </p>
              <Link to="/plan" className="spiritual-link">
                View Aarti Timings <ArrowRight size={15} />
              </Link>
            </div>

            <div className="spiritual-feature-card">
              <div className="spiritual-feature-icon">
                <Sun size={24} />
              </div>
              <h4>Subah-e-Banaras at Assi Ghat</h4>
              <p>
                Dawn meditation, Vedic chanting, morning yoga on ancient pavilions, and Indian
                classical rāgas welcoming the first rays of the rising sun.
              </p>
              <Link to="/plan" className="spiritual-link">
                Discover Assi Mornings <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RICH CONTENT SECTION 2: EXPLORE LOCAL MARKETS & SILK WEAVERS
          ========================================================================= */}
      <section className="kashi-full-section" id="local-markets">
        <div className="kashi-full-container">
          <div className="kashi-section-head">
            <div className="kashi-sub-kicker">
              <span className="kashi-gold-rule" />
              <span className="kashi-kicker-label">LIVING HERITAGE &amp; WEAVERS</span>
              <span className="kashi-gold-rule" />
            </div>
            <h2 className="kashi-section-title">Explore Ancient Markets &amp; Handlooms</h2>
            <p className="kashi-section-desc">
              From pure Zari Banarasi silk pit-looms to bronze craftsmanship and aromatic brass
              perfume alleys.
            </p>
          </div>

          <div className="kashi-markets-grid">
            <div className="market-card">
              <div className="market-card__image">
                <img
                  src={asset("img/banaras_handloom.jpg")}
                  alt="Banarasi Silk Weavers"
                  loading="lazy"
                />
              </div>
              <div className="market-card__body">
                <span className="market-tag">Madanpura &amp; Peeli Kothi</span>
                <h4>Banarasi Silk Saree Weavers</h4>
                <p>
                  Visit multi-generational master weavers working on manual wooden pit-looms
                  weaving intricate gold brocades and floral motifs.
                </p>
              </div>
            </div>

            <div className="market-card">
              <div className="market-card__image">
                <img
                  src={asset("img/market.jpg")}
                  alt="Thatheri Bazaar brass utensils"
                  loading="lazy"
                />
              </div>
              <div className="market-card__body">
                <span className="market-tag">Chowk Area</span>
                <h4>Thatheri Bazaar Brass Craft</h4>
                <p>
                  Centuries-old metalworking district famous for handcrafted brass puja lamps, copper
                  kalashes, and traditional Banarasi kitchenware.
                </p>
              </div>
            </div>

            <div className="market-card">
              <div className="market-card__image">
                <img src={asset("img/street_food.jpg")} alt="Godowlia Market" loading="lazy" />
              </div>
              <div className="market-card__body">
                <span className="market-tag">Godowlia Crossing</span>
                <h4>Godowlia &amp; Vishwanath Galli</h4>
                <p>
                  Vibrant shopping lane packed with handloom fabrics, sacred rudraksha rosaries,
                  traditional perfumes (attar), and handmade lac bangles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RICH CONTENT SECTION 3: BEST TIME TO VISIT & LOCAL TRAVEL TIPS
          ========================================================================= */}
      <section
        className="kashi-full-section"
        style={{ background: "var(--kashi-bg-ivory)" }}
        id="travel-tips"
      >
        <div className="kashi-full-container">
          <div className="kashi-tips-duo">
            <div className="tips-card">
              <h3>
                <Clock size={22} color="var(--kashi-saffron)" /> Best Seasons to Visit Kashi
              </h3>
              <div className="tips-list">
                <div className="tip-entry">
                  <div className="tip-bullet">1</div>
                  <div>
                    <strong>October – March (Winter Peak)</strong>
                    <p>
                      Misty mornings, pleasant afternoons (15°C–24°C), and perfect conditions for dawn
                      boat journeys and walking through old gallis.
                    </p>
                  </div>
                </div>

                <div className="tip-entry">
                  <div className="tip-bullet">2</div>
                  <div>
                    <strong>Dev Deepawali (Kartik Purnima / November)</strong>
                    <p>
                      The grandest visual spectacle on Earth. All 84 ghats glow with millions of clay
                      lamps celebrating the victory of Lord Shiva over Tripurasura.
                    </p>
                  </div>
                </div>

                <div className="tip-entry">
                  <div className="tip-bullet">3</div>
                  <div>
                    <strong>July – August (Sacred Shravan Month)</strong>
                    <p>
                      Devotees from across India carry sacred Ganga water to Kashi Vishwanath.
                      Enormous spiritual energy and vibrant cultural celebrations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="tips-card">
              <h3>
                <CompassIcon size={22} color="var(--kashi-saffron)" /> Essential Local Guidance
              </h3>
              <div className="tips-list">
                <div className="tip-entry">
                  <div className="tip-bullet">A</div>
                  <div>
                    <strong>Early Morning Ghat Walks</strong>
                    <p>
                      Start at Assi Ghat at 5:30 AM and walk north toward Dashashwamedh. The golden
                      reflection off ancient stone steps is completely serene.
                    </p>
                  </div>
                </div>

                <div className="tip-entry">
                  <div className="tip-bullet">B</div>
                  <div>
                    <strong>Respectful Temple Etiquette</strong>
                    <p>
                      Remove footwear at designated points. Avoid taking photographs where signage
                      prohibits it, especially around burning ghats like Manikarnika.
                    </p>
                  </div>
                </div>

                <div className="tip-entry">
                  <div className="tip-bullet">C</div>
                  <div>
                    <strong>Local Auto &amp; E-Rickshaw Transport</strong>
                    <p>
                      The old city alleys are completely pedestrian. Take an e-rickshaw to Godowlia or
                      Maidagin, and explore the inner corridors on foot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F: BANARAS IN FRAMES (Full-Width Responsive 6-Strip)
          ========================================================================= */}
      <section className="kashi-full-section" id="frames-gallery">
        <div className="kashi-full-container">
          <div className="kashi-gallery-top-bar">
            <div className="gallery-lead-title">
              <Camera size={26} className="kashi-gold-cam" />
              <h3>Banaras in Frames</h3>
            </div>
            <a
              href="#frames-gallery"
              onClick={(e) => {
                e.preventDefault();
                setLightboxIndex(0);
              }}
              className="gallery-view-all"
            >
              View Full Gallery <ArrowRight size={16} />
            </a>
          </div>

          <div className="kashi-gallery-strip">
            {galleryItems.map((item, index) => (
              <div
                key={item.title}
                className="kashi-frame-item"
                onClick={() => setLightboxIndex(index)}
              >
                <img src={item.src} alt={item.title} loading="lazy" decoding="async" />
                <div className="kashi-frame-curtain">
                  <span>View Frame</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          RICH CONTENT SECTION 4: FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section className="kashi-full-section" id="kashi-faqs">
        <div className="kashi-full-container">
          <div className="kashi-section-head">
            <div className="kashi-sub-kicker">
              <span className="kashi-gold-rule" />
              <span className="kashi-kicker-label">HELPFUL KNOWLEDGE</span>
              <span className="kashi-gold-rule" />
            </div>
            <h2 className="kashi-section-title">Frequently Asked Questions</h2>
            <p className="kashi-section-desc">
              Everything you need to know about planning your visit, local customs, and exploring
              with verified buddies.
            </p>
          </div>

          <div className="kashi-faq-wrapper">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className={`kashi-faq-item ${openFaq === idx ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="kashi-faq-btn"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaq === idx ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                {openFaq === idx && <div className="kashi-faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL TRAVEL CALL TO ACTION
          ========================================================================= */}
      <section className="kashi-final-cta">
        <div className="kashi-full-container">
          <span style={{ color: "var(--kashi-gold)", fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>
            🔱
          </span>
          <h2>Your Journey to Kashi Starts Here</h2>
          <p>
            Connect with an authentic, verified local buddy who knows every sacred ghat, hidden food
            stall, and timeless legend the guidebooks leave out.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/plan" className="btn-kashi-saffron">
              Plan My Custom Trip <ArrowRight size={17} />
            </Link>
            <Link to="/buddies" className="btn-kashi-ivory">
              Meet Local Buddies
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FULL-WIDTH DARK NAVY STATISTICS STRIP
          ========================================================================= */}
      <section className="kashi-stats-strip" aria-label="Banaras Platform Statistics">
        <div className="kashi-full-container">
          <div className="kashi-stats-grid">
            <div className="kashi-stat-col">
              <Landmark size={24} className="kashi-stat-icon" />
              <div className="kashi-stat-num">
                <strong>100+</strong>
                <span>Attractions</span>
              </div>
            </div>

            <div className="kashi-stat-col">
              <UtensilsCrossed size={24} className="kashi-stat-icon" />
              <div className="kashi-stat-num">
                <strong>250+</strong>
                <span>Food Places</span>
              </div>
            </div>

            <div className="kashi-stat-col">
              <Award size={24} className="kashi-stat-icon" />
              <div className="kashi-stat-num">
                <strong>50+</strong>
                <span>Unique Experiences</span>
              </div>
            </div>

            <div className="kashi-stat-col">
              <Calendar size={24} className="kashi-stat-icon" />
              <div className="kashi-stat-num">
                <strong>30+</strong>
                <span>Curated Itineraries</span>
              </div>
            </div>

            <div className="kashi-stat-col">
              <Users size={24} className="kashi-stat-icon" />
              <div className="kashi-stat-num">
                <strong>1M+</strong>
                <span>Happy Travelers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FULL-WIDTH DARK KASHI FOOTER
          ========================================================================= */}
      <footer className="kashi-footer">
        <div className="kashi-footer__top">
          <div className="kashi-footer__brand-col">
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", color: "#FFF" }}>
              <span className="kashi-nav__logo-seal" style={{ width: "36px", height: "36px" }}>
                <span style={{ fontSize: "0.9rem" }}>ॐ</span>
              </span>
              <strong style={{ fontSize: "1.25rem", fontFamily: "var(--kashi-font-serif)" }}>TravelOnBuddy</strong>
            </Link>
            <p>
              Authentic local-led Varanasi discovery. Handcrafted journeys guided by genuine local
              buddies who call the sacred city their home.
            </p>
            <span style={{ color: "var(--kashi-gold)", fontSize: "0.85rem", fontWeight: "600" }}>
              Har Har Mahadev • काशी विश्वनाथ
            </span>
          </div>

          <div className="kashi-footer__col">
            <h4>Destinations</h4>
            <a href="#famous-places">Famous Ghats</a>
            <a href="#spiritual-places">Kashi Vishwanath</a>
            <a href="#historical-places">Sarnath Stupa</a>
            <a href="#hidden-gems">Old City Gallis</a>
            <a href="#famous-places">Assi Ghat Mornings</a>
          </div>

          <div className="kashi-footer__col">
            <h4>Experiences</h4>
            <a href="#experiences">Ganga Maha Aarti</a>
            <a href="#experiences">Dawn Rowing Boats</a>
            <a href="#experiences">Dev Deepawali</a>
            <a href="#local-markets">Silk Weaver Studios</a>
            <Link to="/food-explorer">Banarasi Food Trail</Link>
          </div>

          <div className="kashi-footer__col">
            <h4>Plan &amp; Help</h4>
            <Link to="/plan">Itinerary Planner</Link>
            <Link to="/buddies">Find a Buddy</Link>
            <a href="#kashi-faqs">Visitor FAQs</a>
            <Link to="/why-buddy">Safety &amp; ID Verification</Link>
            <Link to="/become-a-buddy">Become a Buddy</Link>
          </div>

          <div className="kashi-footer__col kashi-footer__contact">
            <h4>Connect with Kashi</h4>
            <p>Email: hello@travelonbuddy.in</p>
            <p>Helpline: +91 11 4000 1234</p>
            <p>Mon–Sat, 8:00 AM – 8:00 PM IST</p>
            <div style={{ marginTop: "1rem" }}>
              <Link to="/plan" className="btn-kashi-saffron" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}>
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        <div className="kashi-footer__bottom">
          <p>© {new Date().getFullYear()} TravelOnBuddy. All rights reserved. Made in India 🇮🇳</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link to="/why-buddy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
            <Link to="/why-buddy" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
            <Link to="/why-buddy" style={{ color: "inherit", textDecoration: "none" }}>Safety Guarantee</Link>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          LIGHTBOX MODAL FOR BANARAS IN FRAMES
          ========================================================================= */}
      {lightboxIndex !== null && (
        <div
          className="ref-lightbox-backdrop"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ref-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={20} />
            </button>
            <img
              src={galleryItems[lightboxIndex].src}
              alt={galleryItems[lightboxIndex].title}
              className="lightbox-main-img"
            />
            <div className="lightbox-caption">
              <h4>{galleryItems[lightboxIndex].title}</h4>
              <p>{galleryItems[lightboxIndex].desc}</p>
            </div>
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + galleryItems.length) % galleryItems.length,
                )
              }
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={() => setLightboxIndex((lightboxIndex + 1) % galleryItems.length)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STORY / DISCOVER MODAL ("Discover Banaras in 1 Min")
          ========================================================================= */}
      {videoModalOpen && (
        <div
          className="ref-lightbox-backdrop"
          onClick={() => setVideoModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ref-lightbox-content video-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setVideoModalOpen(false)}
            >
              <X size={20} />
            </button>
            <img
              src={asset("img/hero_ghats.jpg")}
              alt="Banaras in 1 Minute Story"
              className="lightbox-main-img"
            />
            <div className="lightbox-caption">
              <h4>Subah-e-Banaras to Evening Ganga Aarti</h4>
              <p>
                From dawn rāgas at Assi Ghat, boat rides through golden mist, fragrant kachori in
                ancient alleys, to sacred evening chants at Dashashwamedh Ghat. Experience the
                eternal rhythm of Kashi with a verified local buddy.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <Link
                  to="/plan"
                  className="btn-kashi-saffron"
                  onClick={() => setVideoModalOpen(false)}
                >
                  Plan My Trip to Banaras <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default KashiThemeFullWidth;
