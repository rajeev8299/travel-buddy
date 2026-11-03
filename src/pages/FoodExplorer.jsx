import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Search,
  MapPin,
  Sparkles,
  Map as MapIcon,
  List as ListIcon,
  LocateFixed,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import FoodCard from "../components/FoodCard";
import InteractiveFoodMap from "../components/InteractiveFoodMap";
import "./FoodExplorer.css";

export default function FoodExplorer() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocality, setSelectedLocality] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'

  // Geolocation state
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  // 1. Fetch Categories & Localities on mount
  useEffect(() => {
    api
      .get("/food-explorer/categories")
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    api
      .get("/food-explorer/localities")
      .then((data) => setLocalities(data.localities || []))
      .catch(() => {});
  }, []);

  // 2. Fetch Shops with active filters & user coordinates
  const fetchShops = () => {
    setLoading(true);
    let url = `/food-explorer/shops?category=${encodeURIComponent(selectedCategory)}&locality=${encodeURIComponent(selectedLocality)}&vegOnly=${vegOnly}&sort=${sortBy}`;
    if (searchQuery.trim()) {
      url += `&q=${encodeURIComponent(searchQuery.trim())}`;
    }
    if (userCoords) {
      url += `&lat=${userCoords.lat}&lng=${userCoords.lng}`;
    }

    api
      .get(url)
      .then((data) => {
        setShops(data.shops || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShops();
  }, [selectedCategory, selectedLocality, vegOnly, sortBy, userCoords]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShops();
  };

  // 3. User Geolocation Request
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationStatus("Locating your position in Varanasi…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setSortBy("nearest");
        setLocating(false);
        setLocationStatus("Location found! Sorting food places by distance.");
        setTimeout(() => setLocationStatus(""), 4500);
      },
      (err) => {
        setLocating(false);
        setLocationStatus("Location access denied or unavailable. You can filter by locality manually.");
        setTimeout(() => setLocationStatus(""), 4500);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="food-explorer-page">
      {/* 1. HERO SECTION */}
      <section className="food-hero">
        <div className="food-hero__scrim" aria-hidden="true" />
        <div className="shell food-hero__inner">
          <p className="eyebrow food-hero__eyebrow" data-reveal>
            <Sparkles size={15} strokeWidth={2.4} /> Authentic Culinary Heritage of Kashi
          </p>

          <h1 className="food-hero__title" data-reveal>
            Taste the <em>Real Banaras</em>
          </h1>

          <p className="food-hero__subtitle" data-reveal>
            Discover the legendary flavours of Varanasi — from century-old morning kachoris and hand-churned lassis to sizzling tamatar chaat, saffron malaiyo, and royal Banarasi paan.
          </p>

          {/* Search Bar with Locality & Food Search */}
          <form className="food-search-bar" onSubmit={handleSearchSubmit} data-reveal>
            <div className="search-field">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food item (e.g. Tamatar Chaat, Lassi) or shop name…"
                aria-label="Search food item or shop"
              />
            </div>

            <div className="search-divider" />

            <div className="search-select">
              <MapPin size={18} className="search-icon" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                aria-label="Filter by Locality"
              >
                <option value="all">All Localities (Godowlia, Chowk, Assi…)</option>
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.slug}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="food-search-submit">
              Search Food
            </button>
          </form>

          {/* Hero Quick Statistics */}
          <div className="food-hero-stats" data-reveal>
            <div className="food-stat-item">
              <strong>{shops.length || 8}+</strong>
              <span>Curated Food Shops</span>
            </div>
            <div className="food-stat-divider" />
            <div className="food-stat-item">
              <strong>100%</strong>
              <span>Verified Exact Locations</span>
            </div>
            <div className="food-stat-divider" />
            <div className="food-stat-item">
              <strong>Real-Time</strong>
              <span>Directions & Menus</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CAROUSEL / NAVIGATION */}
      <section className="food-cat-strip">
        <div className="shell">
          <div className="food-cat-scroll" role="tablist">
            <button
              type="button"
              className={`cat-pill ${selectedCategory === "all" ? "is-active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              <UtensilsCrossed size={15} /> All Foods
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className={`cat-pill ${selectedCategory === cat.slug ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MAIN DIRECTORY & CONTROLS */}
      <div className="shell food-main-content">
        <div className="food-control-bar">
          <div className="food-control-bar__left">
            <span className="results-count">
              Showing <strong>{shops.length}</strong> authentic food places in Varanasi
            </span>

            {/* Locate Me / Nearest Button */}
            <button
              type="button"
              className={`btn-locate-me ${userCoords ? "has-coords" : ""}`}
              onClick={requestUserLocation}
              disabled={locating}
              title="Find food shops nearest to your current location"
            >
              {locating ? <Loader2 size={14} className="spin" /> : <LocateFixed size={14} />}
              <span>{userCoords ? "Nearest to You" : "Find Food Near Me"}</span>
            </button>
          </div>

          <div className="food-control-bar__right">
            {/* Pure Veg Toggle */}
            <label className="veg-toggle-label">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
              />
              <span className="veg-switch" />
              <span>Pure Veg Only</span>
            </label>

            {/* Sort Dropdown */}
            <select
              className="food-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort food places"
            >
              <option value="popular">Top Rated & Popular</option>
              {userCoords && <option value="nearest">Nearest to Me</option>}
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* View Mode Toggle: List vs Map */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "list" ? "is-active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
                aria-label="Switch to List View"
              >
                <ListIcon size={16} />
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "map" ? "is-active" : ""}`}
                onClick={() => setViewMode("map")}
                title="Map View"
                aria-label="Switch to Map View"
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Location Notification Banner if any */}
        {locationStatus && (
          <div className="food-location-toast" role="status">
            <MapPin size={15} /> <span>{locationStatus}</span>
          </div>
        )}

        {/* Interactive Map (Rendered when in map view or alongside directory) */}
        {viewMode === "map" ? (
          <InteractiveFoodMap shops={shops} userLocation={userCoords} />
        ) : (
          <>
            {/* Loading State */}
            {loading && (
              <div className="food-loading-skeleton">
                <Loader2 size={32} className="spin" />
                <p>Curating authentic Banaras food shops…</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="food-error-box">
                <p>{error}</p>
                <button type="button" onClick={fetchShops}>
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && shops.length === 0 && (
              <div className="food-empty-box">
                <UtensilsCrossed size={48} className="empty-icon" />
                <h3>No food places matched your filters</h3>
                <p>Try resetting the category, locality, or pure-veg filter to explore more shops.</p>
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedLocality("all");
                    setVegOnly(false);
                    setSearchQuery("");
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Grid of Food Cards with Visible Direction Icons */}
            {!loading && shops.length > 0 && (
              <div className="food-grid">
                {shops.map((shop) => (
                  <FoodCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
