import { memo } from "react";
import { MapPin, Star } from "lucide-react";

export const FeatureCard = memo(function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <article className="feature" data-reveal style={{ "--delay": `${index * 90}ms` }}>
      <span className="feature__icon">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h3>{feature.title}</h3>
      <p>{feature.body}</p>
    </article>
  );
});

export const BuddyCard = memo(function BuddyCard({ buddy, index }) {
  const initials = buddy.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <article className="buddy" data-reveal style={{ "--delay": `${index * 70}ms` }}>
      <span className="buddy__avatar" style={{ background: buddy.hue }} aria-hidden="true">
        {initials}
      </span>
      <h3>{buddy.name}</h3>
      <p className="buddy__city">
        <MapPin size={13} strokeWidth={2.2} aria-hidden="true" /> {buddy.city}
      </p>
      <p className="buddy__tongue">{buddy.tongue}</p>
      <p className="buddy__meta">
        <span className="buddy__rating">
          <Star size={13} strokeWidth={0} fill="currentColor" aria-hidden="true" />
          {buddy.rating.toFixed(1)}
        </span>
        <span>{buddy.years} yrs guiding</span>
      </p>
    </article>
  );
});
