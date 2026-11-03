import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  ShieldCheck,
  Flame,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { api } from "../lib/api";
import InteractiveFoodMap from "../components/InteractiveFoodMap";
import FoodCard from "../components/FoodCard";
import "./FoodShopDetail.css";

export default function FoodShopDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);
    api
      .get(`/food-explorer/shops/${slug}`)
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const copyAddress = () => {
    if (!data?.shop) return;
    navigator.clipboard.writeText(`${data.shop.name}, ${data.shop.address}, Varanasi`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="shell shop-detail-loading">
        <p>Loading authentic food place details…</p>
      </div>
    );
  }

  if (error || !data?.shop) {
    return (
      <div className="shell shop-detail-error">
        <h2>Place Not Found</h2>
        <p>{error || "This food shop could not be located in our directory."}</p>
        <Link to="/food-explorer" className="btn-back">
          <ArrowLeft size={16} /> Back to Food Explorer
        </Link>
      </div>
    );
  }

  const { shop, menu = [], nearby = [] } = data;

  return (
    <div className="shop-detail-page">
      {/* Top Breadcrumb Header */}
      <div className="shop-breadcrumb-bar">
        <div className="shell shop-breadcrumb__inner">
          <Link to="/food-explorer" className="shop-breadcrumb-back">
            <ArrowLeft size={16} /> Food Explorer
          </Link>
          <span className="crumb-sep">/</span>
          <span>{shop.category}</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-active">{shop.name}</span>
        </div>
      </div>

      {/* Main Hero Overview */}
      <section className="shop-hero-section">
        <div className="shell shop-hero-grid">
          {/* Cover & Gallery visual */}
          <div className="shop-hero-media">
            <img src={shop.coverImage} alt={shop.name} className="shop-hero-cover" />
            <div className="shop-media-overlay">
              <span className="shop-category-tag">{shop.category}</span>
              {shop.isPureVeg && <span className="shop-veg-tag">100% Pure Vegetarian</span>}
            </div>
          </div>

          {/* Core Info & Primary Get Directions Call-to-Action */}
          <div className="shop-hero-info">
            <div className="shop-title-row">
              <h1 className="shop-name">{shop.name}</h1>
              {shop.isVerified && (
                <span className="shop-verified-badge" title="Verified by TravelOnBuddy team">
                  <ShieldCheck size={16} /> Verified
                </span>
              )}
            </div>

            <div className="shop-rating-strip">
              <span className="stars">⭐ {shop.rating ? shop.rating.toFixed(1) : "4.8"}</span>
              <span className="reviews">({shop.reviewCount || 150}+ authentic reviews)</span>
              <span>•</span>
              <span className="price-tag">₹{shop.priceForTwo} for two people</span>
            </div>

            <p className="shop-description">{shop.description}</p>

            {shop.mustTry && (
              <div className="shop-must-try-banner">
                <Flame size={16} className="flame-icon" />
                <div>
                  <strong>Iconic Speciality:</strong> {shop.mustTry}
                </div>
              </div>
            )}

            {/* Quick Metadata Grid */}
            <div className="shop-specs-grid">
              <div className="spec-item">
                <Clock size={16} className="spec-icon" />
                <div>
                  <div className="spec-label">Timings</div>
                  <div className="spec-val">
                    {shop.openTime} – {shop.closeTime}
                  </div>
                </div>
              </div>

              <div className="spec-item">
                <MapPin size={16} className="spec-icon" />
                <div>
                  <div className="spec-label">Locality</div>
                  <div className="spec-val">{shop.locality}</div>
                </div>
              </div>

              {shop.phone && (
                <div className="spec-item">
                  <Phone size={16} className="spec-icon" />
                  <div>
                    <div className="spec-label">Contact</div>
                    <div className="spec-val">{shop.phone}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar with Primary Standout Direction Button */}
            <div className="shop-cta-row">
              <a
                href={shop.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-directions"
                title="Navigate directly in Google Maps"
              >
                <Navigation size={18} strokeWidth={2.4} />
                <span>Get Directions in Google Maps</span>
              </a>

              <button type="button" className="btn-secondary-action" onClick={copyAddress}>
                {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                <span>{copied ? "Address Copied!" : "Copy Address"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu & Prices Section */}
      <section className="shop-menu-section">
        <div className="shell">
          <header className="section-head">
            <div>
              <p className="eyebrow eyebrow--dark">Authentic Flavours</p>
              <h2>Available Menu & Prices</h2>
            </div>
            <p className="section-sub">Verified real prices and portion details straight from the kitchen.</p>
          </header>

          {menu.length === 0 ? (
            <p className="empty-menu">Special daily menu available in-person at the counter.</p>
          ) : (
            <div className="menu-grid">
              {menu.map((item) => (
                <div className="menu-card" key={item.id}>
                  <div className="menu-card-header">
                    <div className="item-title-group">
                      <span className={`veg-indicator ${item.is_veg ? "is-veg" : "is-nonveg"}`} />
                      <h4 className="item-name">{item.name}</h4>
                      {item.is_popular && <span className="popular-badge">Must Try</span>}
                    </div>
                    <div className="item-price">₹{item.price}</div>
                  </div>
                  {item.description && <p className="item-desc">{item.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Prominent Location & Directions Section */}
      <section className="shop-location-section">
        <div className="shell">
          <header className="section-head">
            <div>
              <p className="eyebrow eyebrow--dark">Exact Geolocation</p>
              <h2>Location & Directions</h2>
            </div>
            <p className="section-sub">Find your way easily across the gallis and main roads of Kashi.</p>
          </header>

          <div className="location-card">
            <div className="location-info-side">
              <div className="loc-detail-group">
                <span className="loc-label">Full Address</span>
                <p className="loc-value">{shop.address}</p>
              </div>

              {shop.nearbyLandmark && (
                <div className="loc-detail-group">
                  <span className="loc-label">Prominent Landmark</span>
                  <p className="loc-value">{shop.nearbyLandmark}</p>
                </div>
              )}

              <div className="loc-detail-group">
                <span className="loc-label">Exact Coordinates</span>
                <p className="loc-coords">
                  {shop.latitude ? `${shop.latitude.toFixed(4)}° N, ${shop.longitude.toFixed(4)}° E` : "Verified Locality Center"}
                </p>
              </div>

              <div className="loc-buttons-vertical">
                <a
                  href={shop.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-full-directions"
                >
                  <Navigation size={17} /> Start Navigation Now
                </a>
                <button type="button" className="btn-copy-full" onClick={copyAddress}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Address Copied to Clipboard!" : "Copy Full Address"}</span>
                </button>
              </div>
            </div>

            {/* Embedded Interactive Map for This Place */}
            <div className="location-map-side">
              <InteractiveFoodMap shops={[shop]} selectedShop={shop} compact={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Food Discovery Section */}
      {nearby.length > 0 && (
        <section className="shop-nearby-section">
          <div className="shell">
            <header className="section-head">
              <div>
                <p className="eyebrow eyebrow--dark">Explore More in {shop.locality}</p>
                <h2>Nearby Food You Can Also Try</h2>
              </div>
            </header>

            <div className="food-grid">
              {nearby.map((n) => (
                <FoodCard key={n.id} shop={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
