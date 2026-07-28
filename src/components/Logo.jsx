import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { BRAND, asset } from "../data";

/**
 * Badge artwork, best first — only ever list files that actually exist. Vite's
 * SPA fallback answers a missing file with 200 text/html, so a speculative
 * entry costs a wasted index.html fetch and only recovers on a decode failure.
 */
const LOGO_SOURCES = [asset("logo.png"), asset("logo.svg")];

/**
 * Badge + wordmark lockup. `alt` is blank on purpose — the wordmark sitting
 * right beside the badge already announces the name.
 */
const Logo = memo(function Logo({ size = 48 }) {
  const [attempt, setAttempt] = useState(0);
  const src = LOGO_SOURCES[attempt];

  // Size travels as a custom property, not inline width/height, so the
  // responsive rules in App.css can shrink the lockup on small screens.
  return (
    <Link
      className="logo"
      to="/"
      aria-label={`${BRAND} — home`}
      style={{ "--logo-size": `${size}px` }}
    >
      {src ? (
        <img
          className="logo__img"
          src={src}
          alt=""
          onError={() => setAttempt((a) => a + 1)}
        />
      ) : (
        <svg className="logo__mark" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="21" fill="var(--ink)" />
          <circle cx="22" cy="22" r="15.5" fill="none" stroke="var(--orange)" strokeWidth="1.6" opacity=".55" />
          <path d="M29.5 14.5L25 25l-10.5 4.5L19 19z" fill="var(--orange)" />
          <circle cx="22" cy="22" r="2.1" fill="var(--ink)" />
        </svg>
      )}

      {/* "On" carries the accent, matching the badge artwork. */}
      <span className="logo__word">
        Travel<span>On</span>Buddy
      </span>
    </Link>
  );
});

export default Logo;
