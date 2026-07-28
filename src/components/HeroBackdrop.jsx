import { useState, useEffect, useRef, memo } from "react";
import { GhatsPanorama } from "./Scene";
import { HERO_SLIDES as STATIC_SLIDES, SLIDE_MS, resolveSrc } from "../data";
import { api } from "../lib/api";

/**
 * Full-bleed hero backdrop: a slow crossfade between destination photos.
 * Decorative, so it is hidden from assistive tech — the headline carries the
 * meaning. Falls back to the drawn panorama if the files are missing.
 */
const HeroBackdrop = memo(function HeroBackdrop() {
  const [slides, setSlides] = useState(STATIC_SLIDES);
  const [shown, setShown] = useState(0);
  const [broken, setBroken] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    api
      .get("/hero-slides")
      .then((data) => {
        if (data?.slides?.length) {
          setSlides(data.slides.map((s) => ({ src: resolveSrc(s.src), pos: s.pos })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (broken) return;
    // A background that never sits still is exactly what this setting is for.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    timer.current = window.setInterval(() => {
      setShown((s) => (s + 1) % slides.length);
    }, SLIDE_MS);

    return () => window.clearInterval(timer.current);
  }, [broken, slides.length]);

  if (broken) {
    return (
      <div className="hero__bg" aria-hidden="true">
        <GhatsPanorama />
      </div>
    );
  }

  return (
    <div className="hero__bg" aria-hidden="true">
      {slides.map((slide, i) => (
        <img
          key={slide.src}
          className={`hero__slide ${i === shown ? "is-on" : ""}`}
          src={slide.src}
          alt=""
          style={{ objectPosition: slide.pos }}
          fetchPriority={i === 0 ? "high" : "low"}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          onError={() => i === 0 && setBroken(true)}
        />
      ))}
    </div>
  );
});

export default HeroBackdrop;
