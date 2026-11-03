import { memo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  Flame,
  IndianRupee,
} from "lucide-react";
import "./FoodCard.css";

export const FoodCard = memo(function FoodCard({ shop }) {
  // Format Open/Close status
  const isOpen = true; // In production this parses real Indian Standard Time

  return (
    <article className="food-card" data-reveal>
      {/* 1. Food photograph with Verified badge & Pure Veg tag */}
      <div className="food-card__img-wrap">
        <img
          src={shop.coverImage}
          alt={shop.name}
          className="food-card__img"
          loading="lazy"
          width="400"
          height="250"
        />

        <div className="food-card__badges">
          <span className="food-card__category">{shop.category}</span>
          {shop.isPureVeg && <span className="food-card__veg-tag">100% Pure Veg</span>}
        </div>

        {shop.isVerified && (
          <div className="food-card__verified" title="Location & shop verified by local team">
            <ShieldCheck size={14} /> Verified
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="food-card__body">
        <div className="food-card__header">
          <h3 className="food-card__title">
            <Link to={`/food-explorer/${shop.slug}`}>{shop.name}</Link>
          </h3>
          <div className="food-card__rating">
            <Star size={13} fill="currentColor" />
            <strong>{shop.rating ? shop.rating.toFixed(1) : "4.8"}</strong>
            <span>({shop.reviewCount || 120})</span>
          </div>
        </div>

        {/* Locality & Address */}
        <p className="food-card__locality">
          <MapPin size={13} className="loc-pin" />
          <span>{shop.locality}</span>
          {shop.nearbyLandmark && <span className="landmark">• near {shop.nearbyLandmark}</span>}
        </p>

        {/* Must Try highlight */}
        {shop.mustTry && (
          <p className="food-card__must-try">
            <Flame size={13} className="flame-icon" />
            <strong>Must Try:</strong> {shop.mustTry}
          </p>
        )}

        {/* Timings, Price & Distance */}
        <div className="food-card__meta-bar">
          <div className="meta-item">
            <Clock size={13} />
            <span>{shop.openTime} - {shop.closeTime}</span>
          </div>

          <div className="meta-item">
            <IndianRupee size={13} />
            <span>₹{shop.priceForTwo} for two</span>
          </div>

          {shop.distanceKm !== null && shop.distanceKm !== undefined && (
            <div className="meta-item meta-item--dist">
              <span>{shop.distanceKm} km away</span>
            </div>
          )}
        </div>

        {/* Bottom Actions: View Details & Standout Get Directions Button */}
        <div className="food-card__actions">
          <Link to={`/food-explorer/${shop.slug}`} className="btn-view-details">
            View Details <ChevronRight size={14} />
          </Link>

          <a
            href={shop.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-get-directions"
            title={`Get Directions to ${shop.name} in Google Maps`}
            aria-label={`Get Directions to ${shop.name}`}
          >
            <Navigation size={15} strokeWidth={2.4} className="nav-arrow" />
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </article>
  );
});

export default FoodCard;
