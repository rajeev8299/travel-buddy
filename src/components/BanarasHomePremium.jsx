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
  Map as MapIcon,
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
  BookOpen,
} from "lucide-react";
import { asset } from "../data";
import { api } from "../lib/api";
import "./BanarasHomePremium.css";

export const BanarasHomePremium = memo(function BanarasHomePremium() {
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
          // Merge real backend data with fallback images
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
    const amount = direction === "left" ? -320 : 320;
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

  return (
    <div className="premium-home-page">
      {/* =========================================================================
          1. DARK NAVY NAVBAR (Matches Exact Reference)
          ========================================================================= */}
      <header className="ref-nav">
        <div className="ref-nav__container">
          {/* Left Brand Logo */}
          <Link to="/" className="ref-nav__brand">
            <span className="ref-nav__logo-circle">
              <span className="ref-nav__logo-inner">TB</span>
            </span>
            <span className="ref-nav__brand-text">TravelOnBuddy</span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="ref-nav__links" aria-label="Main Navigation">
            <Link to="/" className="ref-nav__link is-active">
              Home
            </Link>

            <div
              className="ref-nav__dropdown-wrap"
              onMouseEnter={() => setDestDropdownOpen(true)}
              onMouseLeave={() => setDestDropdownOpen(false)}
            >
              <button
                type="button"
                className="ref-nav__link ref-nav__dropdown-btn"
                onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                aria-expanded={destDropdownOpen}
              >
                Destinations <ChevronDown size={14} className="dropdown-caret" />
              </button>

              {destDropdownOpen && (
                <div className="ref-nav__dropdown-menu">
                  <a href="#famous-places" className="dropdown-item">
                    <Landmark size={15} /> Famous Places
                  </a>
                  <a href="#spiritual-places" className="dropdown-item">
                    <Building2 size={15} /> Spiritual Experiences
                  </a>
                  <a href="#historical-places" className="dropdown-item">
                    <Compass size={15} /> Historical Places
                  </a>
                  <a href="#hidden-gems" className="dropdown-item">
                    <Eye size={15} /> Hidden Gems
                  </a>
                </div>
              )}
            </div>

            <Link to="/food-explorer" className="ref-nav__link">
              Food Explorer
            </Link>
            <a href="#experiences" className="ref-nav__link">
              Experiences
            </a>
            <Link to="/plan" className="ref-nav__link">
              Plan My Trip
            </Link>
            <a href="#frames-gallery" className="ref-nav__link">
              Gallery
            </a>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="ref-nav__actions">
            <button
              type="button"
              className="ref-nav__icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search Varanasi"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className="ref-nav__icon-btn"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="ref-nav__bell-dot" />
            </button>

            <Link to="/login" className="ref-nav__login-btn">
              Login
            </Link>

            <Link to="/signup" className="ref-nav__signup-btn">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Expandable search bar */}
        {searchOpen && (
          <div className="ref-nav__search-bar">
            <div className="search-bar__inner">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search ghats, food spots, silk shops, temple darshan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setSearchOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION — CINEMATIC BANARAS PHOTO (Exact Copy & Proportions)
          ========================================================================= */}
      <section className="ref-hero" aria-label="Discover the Soul of Banaras">
        {/* Full-bleed background photo */}
        <div className="ref-hero__backdrop">
          <img
            src={asset("img/hero_ghats.jpg")}
            alt="Varanasi Ghats at Golden Hour"
            className="ref-hero__img"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div className="ref-hero__gradient" />
        </div>

        <div className="ref-hero__content">
          <div className="ref-hero__left">
            {/* Gold Badge */}
            <div className="ref-hero__badge">
              <Sparkles size={14} className="gold-sparkle" />
              <span>Explore Varanasi (Kashi)</span>
            </div>

            {/* Serif Heading */}
            <h1 className="ref-hero__title">
              Discover the <br />
              Soul of <span className="ref-hero__title-accent">Banaras</span>
            </h1>

            {/* Subtitle */}
            <p className="ref-hero__subtitle">
              Where every Ghat tells a story, every street has a flavour, <br />
              and every journey becomes a memory.
            </p>

            {/* Hero CTAs */}
            <div className="ref-hero__ctas">
              <a href="#explore-banaras" className="btn-ref-primary">
                Explore Banaras <ArrowRight size={16} />
              </a>
              <Link to="/plan" className="btn-ref-outline">
                <Calendar size={16} /> Plan Your Trip
              </Link>
            </div>

            {/* Quick Metrics Strip on Bottom Left */}
            <div className="ref-hero__metrics">
              <div className="metric-pill">
                <Landmark size={15} className="metric-icon" />
                <div className="metric-texts">
                  <strong>100+</strong>
                  <span>Tourist Places</span>
                </div>
              </div>

              <div className="metric-pill">
                <UtensilsCrossed size={15} className="metric-icon" />
                <div className="metric-texts">
                  <strong>250+</strong>
                  <span>Food Places</span>
                </div>
              </div>

              <div className="metric-pill">
                <Sparkles size={15} className="metric-icon" />
                <div className="metric-texts">
                  <strong>Curated</strong>
                  <span>Experiences</span>
                </div>
              </div>

              <div className="metric-pill">
                <Calendar size={15} className="metric-icon" />
                <div className="metric-texts">
                  <strong>Trip</strong>
                  <span>Itineraries</span>
                </div>
              </div>

              <div className="metric-pill">
                <MapPin size={15} className="metric-icon" />
                <div className="metric-texts">
                  <strong>Maps &amp;</strong>
                  <span>Directions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Discovery Action (Reference "Watch Banaras in 1 Min") */}
          <div className="ref-hero__right">
            <button
              type="button"
              className="ref-hero__play-btn"
              onClick={() => setVideoModalOpen(true)}
              aria-label="Discover Banaras in 1 Minute"
            >
              <div className="play-icon-circle">
                <Play size={20} fill="#E84A0B" color="#E84A0B" className="play-tri" />
              </div>
              <div className="play-label">
                <span>Watch</span>
                <strong>Banaras in 1 Min</strong>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. EXPLORE BANARAS — 4 CARDS SECTION (Exact Match)
          ========================================================================= */}
      <section className="ref-section" id="explore-banaras">
        <div className="ref-container">
          <div className="ref-section-heading">
            <div className="section-label-row">
              <span className="heading-line" />
              <span className="section-sublabel">EXPLORE BANARAS</span>
              <span className="heading-line" />
            </div>
            <h2 className="section-maintitle">Discover Everything in Varanasi</h2>
          </div>

          <div className="ref-four-cards-grid">
            {/* Card 1: Famous Places */}
            <div className="explore-card" id="famous-places">
              <div className="explore-card__img-wrap">
                <img
                  src={asset("img/boats.jpg")}
                  alt="Varanasi Riverfront Ghats"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="explore-card__badge-icon">
                <Landmark size={18} />
              </div>
              <div className="explore-card__content">
                <div className="explore-card__info">
                  <h3>Famous Places</h3>
                  <p>Temples, Ghats &amp; Must-Visit Attractions</p>
                </div>
                <Link
                  to="/plan"
                  className="explore-card__arrow-btn"
                  title="Explore Famous Places"
                  aria-label="Famous Places"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Card 2: Spiritual Experiences */}
            <div className="explore-card" id="spiritual-places">
              <div className="explore-card__img-wrap">
                <img
                  src={asset("img/kashi_vishwanath.jpg")}
                  alt="Kashi Vishwanath Temple"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="explore-card__badge-icon">
                <Building2 size={18} />
              </div>
              <div className="explore-card__content">
                <div className="explore-card__info">
                  <h3>Spiritual Experiences</h3>
                  <p>Aarti, Darshan, Rituals &amp; More</p>
                </div>
                <Link
                  to="/plan"
                  className="explore-card__arrow-btn"
                  title="Explore Spiritual Experiences"
                  aria-label="Spiritual Experiences"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Card 3: Historical Places */}
            <div className="explore-card" id="historical-places">
              <div className="explore-card__img-wrap">
                <img
                  src={asset("img/stupa.jpg")}
                  alt="Dhamek Stupa Sarnath"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="explore-card__badge-icon">
                <Landmark size={18} />
              </div>
              <div className="explore-card__content">
                <div className="explore-card__info">
                  <h3>Historical Places</h3>
                  <p>Ancient Sites, Forts &amp; Heritage</p>
                </div>
                <Link
                  to="/plan"
                  className="explore-card__arrow-btn"
                  title="Explore Historical Places"
                  aria-label="Historical Places"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Card 4: Hidden Gems */}
            <div className="explore-card" id="hidden-gems">
              <div className="explore-card__img-wrap">
                <img
                  src={asset("img/market.jpg")}
                  alt="Old City Narrow Lanes"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="explore-card__badge-icon om-icon">
                <span>ॐ</span>
              </div>
              <div className="explore-card__content">
                <div className="explore-card__info">
                  <h3>Hidden Gems</h3>
                  <p>Lesser-Known Spots &amp; Local Experiences</p>
                </div>
                <Link
                  to="/plan"
                  className="explore-card__arrow-btn"
                  title="Explore Hidden Gems"
                  aria-label="Hidden Gems"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. BANARAS FOOD EXPLORER — SPLIT SECTION & CAROUSEL (Exact Match)
          ========================================================================= */}
      <section className="ref-section food-split-section" id="food-explorer-showcase">
        <div className="ref-container">
          <div className="food-split-layout">
            {/* Left Narrative Panel */}
            <div className="food-split__left">
              <div className="food-icon-brand">
                <div className="food-pot-icon">
                  <UtensilsCrossed size={28} />
                </div>
                <div className="food-brand-names">
                  <span className="brand-sup">Banaras</span>
                  <strong className="brand-main">Food Explorer</strong>
                </div>
              </div>

              <h2 className="food-split__heading">Taste the Magic of Kashi</h2>
              <p className="food-split__desc">
                From crispy Kachori Sabzi to creamy Malaiyo, explore Banaras through its iconic
                flavours.
              </p>

              <Link to="/food-explorer" className="btn-explore-food">
                Explore All Food Places <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Food Carousel */}
            <div className="food-split__right">
              {/* Carousel Controls */}
              <button
                type="button"
                className="carousel-nav-btn prev"
                onClick={() => scrollFood("left")}
                aria-label="Previous food places"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="carousel-nav-btn next"
                onClick={() => scrollFood("right")}
                aria-label="Next food places"
              >
                <ChevronRight size={20} />
              </button>

              <div className="food-cards-scroll-track" ref={foodCarouselRef}>
                {foodShops.map((shop) => (
                  <div key={shop.id} className="food-preview-card">
                    <div className="food-card__img-container">
                      <img src={shop.image} alt={shop.name} loading="lazy" decoding="async" />
                      <button
                        type="button"
                        className={`food-card__heart-btn ${likedShops[shop.id] ? "is-liked" : ""}`}
                        onClick={() => toggleLike(shop.id)}
                        aria-label="Save to favourites"
                      >
                        <Heart
                          size={15}
                          fill={likedShops[shop.id] ? "#E84A0B" : "none"}
                          color={likedShops[shop.id] ? "#E84A0B" : "#FFFFFF"}
                        />
                      </button>
                    </div>

                    <div className="food-card__body">
                      <h4 className="food-card__name">{shop.name}</h4>

                      <div className="food-card__status-line">
                        <span className="status-badge-green">{shop.status}</span>
                      </div>

                      <div className="food-card__rating-line">
                        <Star size={13} fill="#F4B82F" color="#F4B82F" />
                        <span className="rating-val">{shop.rating}</span>
                        <span className="review-cnt">({shop.reviews})</span>
                      </div>

                      <div className="food-card__loc-price">
                        <span className="food-loc">
                          <MapPin size={12} /> {shop.locality}
                        </span>
                        <span className="food-price">{shop.price}</span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-card-directions"
                      >
                        <Navigation size={14} className="nav-icon-slant" /> Get Directions
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
          5. UNFORGETTABLE EXPERIENCES — 6 HORIZONTAL CARDS (Exact Match)
          ========================================================================= */}
      <section className="ref-section" id="experiences">
        <div className="ref-container">
          <div className="ref-section-heading">
            <div className="section-label-row">
              <span className="heading-line" />
              <h2 className="section-maintitle" style={{ margin: 0 }}>
                Unforgettable Experiences in Banaras
              </h2>
              <span className="heading-line" />
            </div>
          </div>

          <div className="experiences-six-grid">
            {/* 1. Ganga Aarti */}
            <div className="exp-card">
              <img src={asset("img/dev_diwali.jpg")} alt="Ganga Aarti" loading="lazy" />
              <div className="exp-card__overlay">
                <div className="exp-card__footer">
                  <Flame size={16} className="exp-gold-icon" />
                  <span>Ganga Aarti</span>
                </div>
              </div>
            </div>

            {/* 2. Sunrise Boat Ride */}
            <div className="exp-card">
              <img src={asset("img/ganga_sunrise.jpg")} alt="Sunrise Boat Ride" loading="lazy" />
              <div className="exp-card__overlay">
                <div className="exp-card__footer">
                  <Sunrise size={16} className="exp-gold-icon" />
                  <span>Sunrise Boat Ride</span>
                </div>
              </div>
            </div>

            {/* 3. Dev Deepawali */}
            <div className="exp-card">
              <img src={asset("img/ghats_dawn.jpg")} alt="Dev Deepawali" loading="lazy" />
              <div className="exp-card__overlay">
                <div className="exp-card__footer">
                  <Sparkles size={16} className="exp-gold-icon" />
                  <span>Dev Deepawali</span>
                </div>
              </div>
            </div>

            {/* 4. Banarasi Silk Shopping */}
            <div className="exp-card">
              <img
                src={asset("img/banaras_silk.jpg")}
                alt="Banarasi Silk Shopping"
                loading="lazy"
              />
              <div className="exp-card__overlay">
                <div className="exp-card__footer">
                  <Shirt size={16} className="exp-gold-icon" />
                  <span>Banarasi Silk Shopping</span>
                </div>
              </div>
            </div>

            {/* 5. Heritage Walk */}
            <div className="exp-card">
              <img src={asset("img/market.jpg")} alt="Heritage Walk" loading="lazy" />
              <div className="exp-card__overlay">
                <div className="exp-card__footer">
                  <Footprints size={16} className="exp-gold-icon" />
                  <span>Heritage Walk</span>
                </div>
              </div>
            </div>

            {/* 6. Local Food Tour */}
            <div className="exp-card">
              <img src={asset("img/street_food.jpg")} alt="Local Food Tour" loading="lazy" />
              <div className="exp-card__overlay">
                <div className="exp-card__footer">
                  <UtensilsCrossed size={16} className="exp-gold-icon" />
                  <span>Local Food Tour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. PLAN TRIP + MAP SECTION — TWO EQUAL PANELS (Exact Match)
          ========================================================================= */}
      <section className="ref-section" id="trip-planner-and-map">
        <div className="ref-container">
          <div className="planner-map-duo">
            {/* Left: Plan Your Perfect Trip */}
            <div className="planner-box">
              <div className="planner-box__header">
                <div className="planner-luggage-icon">
                  <Layers size={24} />
                </div>
                <div className="planner-header-text">
                  <h3>Plan Your Perfect Trip</h3>
                  <p>Ready to explore Banaras? Choose a curated itinerary or build your own.</p>
                </div>
              </div>

              {/* Day selection tabs */}
              <div className="planner-duration-tabs">
                {["1 Day Trip", "2 Days", "3 Days", "Custom"].map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    className={`duration-pill ${tripDuration === tab ? "is-active" : ""}`}
                    onClick={() => setTripDuration(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Check features */}
              <div className="planner-checklist">
                <div className="checklist-row">
                  <CheckCircle2 size={16} className="check-gold" />
                  <span>Top Attractions</span>
                </div>
                <div className="checklist-row">
                  <CheckCircle2 size={16} className="check-gold" />
                  <span>Food Stops</span>
                </div>
                <div className="checklist-row">
                  <CheckCircle2 size={16} className="check-gold" />
                  <span>Timings &amp; Route</span>
                </div>
                <div className="checklist-row">
                  <CheckCircle2 size={16} className="check-gold" />
                  <span>Map &amp; Directions</span>
                </div>
              </div>

              <div className="planner-bottom-row">
                <Link to="/plan" className="btn-build-itinerary">
                  Build My Itinerary <ArrowRight size={16} />
                </Link>
                <div className="planner-small-preview">
                  <img src={asset("img/boats.jpg")} alt="Trip boat preview" />
                </div>
              </div>
            </div>

            {/* Right: Explore Banaras on Map */}
            <div className="map-box">
              <div className="map-box__header">
                <div className="map-pin-badge">
                  <MapPin size={22} />
                </div>
                <div className="map-header-text">
                  <h3>Explore Banaras on Map</h3>
                  <p>
                    Find tourist places, food shops, hotels and more — all in one interactive map.
                  </p>
                </div>
              </div>

              <div className="map-box__main">
                {/* Visual Map Area */}
                <div className="map-preview-canvas">
                  <iframe
                    title="Banaras Live Map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=82.9800,25.2800,83.0300,25.3400&layer=mapnik&marker=25.3105,83.0085"
                    loading="lazy"
                    className="embedded-osm-map"
                  />
                  <div className="map-center-overlay-badge">
                    <strong>Varanasi</strong>
                    <span>(Banaras)</span>
                  </div>
                </div>

                {/* Filter Checkbox Checklist on the Right */}
                <div className="map-filter-panel">
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
                      <label key={filter.key} className="map-filter-item">
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
                        <span className="checkbox-visual">
                          {mapFilters[filter.key] && <Check size={12} />}
                        </span>
                        <Icon size={14} style={{ color: filter.color }} />
                        <span className="filter-label-txt">{filter.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="map-box__cta">
                <Link to="/food-explorer" className="btn-open-interactive-map">
                  Open Interactive Map <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. BANARAS IN FRAMES — PHOTO GALLERY (Exact Match)
          ========================================================================= */}
      <section className="ref-section" id="frames-gallery">
        <div className="ref-container">
          <div className="gallery-header-row">
            <div className="gallery-header-left">
              <Camera size={24} className="camera-gold-icon" />
              <h3>Banaras in Frames</h3>
            </div>
            <a
              href="#frames-gallery"
              onClick={(e) => {
                e.preventDefault();
                setLightboxIndex(0);
              }}
              className="view-full-gallery-link"
            >
              View Full Gallery <ArrowRight size={15} />
            </a>
          </div>

          <div className="gallery-six-strip">
            {galleryItems.map((item, index) => (
              <div
                key={item.title}
                className="gallery-frame-item"
                onClick={() => setLightboxIndex(index)}
              >
                <img src={item.src} alt={item.title} loading="lazy" decoding="async" />
                <div className="gallery-hover-overlay">
                  <span>View Frame</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. DARK NAVY STATISTICS STRIP (Exact Match)
          ========================================================================= */}
      <section className="ref-stats-strip" aria-label="Banaras Platform Statistics">
        <div className="ref-container">
          <div className="stats-five-grid">
            <div className="stat-box">
              <Landmark size={22} className="stat-gold-icon" />
              <div className="stat-content">
                <strong>100+</strong>
                <span>Attractions</span>
              </div>
            </div>

            <div className="stat-box">
              <UtensilsCrossed size={22} className="stat-gold-icon" />
              <div className="stat-content">
                <strong>250+</strong>
                <span>Food Places</span>
              </div>
            </div>

            <div className="stat-box">
              <Award size={22} className="stat-gold-icon" />
              <div className="stat-content">
                <strong>50+</strong>
                <span>Unique Experiences</span>
              </div>
            </div>

            <div className="stat-box">
              <Calendar size={22} className="stat-gold-icon" />
              <div className="stat-content">
                <strong>30+</strong>
                <span>Curated Itineraries</span>
              </div>
            </div>

            <div className="stat-box">
              <Users size={22} className="stat-gold-icon" />
              <div className="stat-content">
                <strong>1M+</strong>
                <span>Happy Travelers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          VIDEO / STORY MODAL ("Watch Banaras in 1 Min")
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
                  className="btn-ref-primary"
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

export default BanarasHomePremium;

