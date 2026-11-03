import { useState, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  ChevronRight,
  Maximize2,
  Minimize2,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./InteractiveFoodMap.css";

// Approximate Varanasi geographic center
const VARANASI_CENTER = { lat: 25.3105, lng: 83.0085 };

export default function InteractiveFoodMap({
  shops = [],
  selectedShop = null,
  onSelectShop = () => {},
  userLocation = null,
  compact = false,
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeShop, setActiveShop] = useState(selectedShop || shops[0] || null);

  // Compute map bounds or view center
  const currentCenter = useMemo(() => {
    if (activeShop && activeShop.latitude && activeShop.longitude) {
      return { lat: activeShop.latitude, lng: activeShop.longitude };
    }
    if (shops.length > 0 && shops[0].latitude) {
      return { lat: shops[0].latitude, lng: shops[0].longitude };
    }
    return VARANASI_CENTER;
  }, [activeShop, shops]);

  // OpenStreetMap embed URL with pin markers
  const embedUrl = useMemo(() => {
    const lat = currentCenter.lat;
    const lng = currentCenter.lng;
    const delta = 0.015;
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  }, [currentCenter]);

  const handleMarkerClick = (shop) => {
    setActiveShop(shop);
    onSelectShop(shop);
  };

  return (
    <div className={`food-map-container ${fullscreen ? "food-map-container--fullscreen" : ""} ${compact ? "food-map-container--compact" : ""}`}>
      {/* Map Header / Control Bar */}
      <div className="food-map-toolbar">
        <div className="food-map-toolbar__title">
          <Compass size={18} className="food-map-toolbar__icon" />
          <span>Interactive Food Map of Varanasi</span>
          <span className="food-map-toolbar__badge">{shops.length} verified places</span>
        </div>

        <div className="food-map-toolbar__actions">
          {userLocation && (
            <span className="food-map-toolbar__gps">
              <span className="gps-dot"></span> Live Location Active
            </span>
          )}
          <button
            type="button"
            className="food-map-toolbar__btn"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
            aria-label="Toggle Fullscreen"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Map View */}
      <div className="food-map-viewport">
        <iframe
          title="Varanasi Food Map"
          className="food-map-iframe"
          src={embedUrl}
          loading="lazy"
        />

        {/* Floating Marker Selector Rail */}
        <div className="food-map-rail" role="region" aria-label="Food place quick selector">
          {shops.map((shop) => {
            const isSelected = activeShop?.id === shop.id;
            return (
              <button
                type="button"
                key={shop.id}
                className={`food-map-rail__pill ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleMarkerClick(shop)}
              >
                <Store size={14} />
                <span className="rail-pill-name">{shop.name}</span>
                {shop.distanceKm !== null && shop.distanceKm !== undefined && (
                  <span className="rail-pill-dist">{shop.distanceKm} km</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Shop Floating Info Card Overlay */}
        {activeShop && (
          <div className="food-map-infocard">
            <div className="food-map-infocard__img">
              <img src={activeShop.coverImage} alt={activeShop.name} />
              <span className="food-map-infocard__tag">{activeShop.category}</span>
            </div>
            <div className="food-map-infocard__content">
              <h4>{activeShop.name}</h4>
              <p className="food-map-infocard__loc">
                <MapPin size={13} /> {activeShop.locality} • {activeShop.address}
              </p>
              <div className="food-map-infocard__meta">
                <span>⭐ {activeShop.rating} ({activeShop.reviewCount || 100}+)</span>
                <span>• ₹{activeShop.priceForTwo} for two</span>
                {activeShop.distanceKm !== null && activeShop.distanceKm !== undefined && (
                  <span className="dist-highlight">• {activeShop.distanceKm} km away</span>
                )}
              </div>

              <div className="food-map-infocard__actions">
                <a
                  href={activeShop.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="food-map-dir-btn"
                >
                  <Navigation size={14} /> Get Directions
                </a>
                <Link to={`/food-explorer/${activeShop.slug}`} className="food-map-view-btn">
                  View Menu & Details <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
