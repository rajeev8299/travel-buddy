import { useState, useEffect, memo } from "react";
import { GhatsPanorama } from "./Scene";
import { HERO_SLIDES as STATIC_SLIDES, resolveSrc } from "../data";
import { api } from "../lib/api";

/**
 * High-performance static hero backdrop.
 * Loads a single, high-fidelity hero image with high fetch priority for instant LCP.
 * Zero background videos, zero video autoplay, and no heavy background timers.
 * Falls back gracefully to drawn panorama if file cannot be loaded.
 */
const HeroBackdrop = memo(function HeroBackdrop() {
  const [heroImage, setHeroImage] = useState(STATIC_SLIDES[0]);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/hero-slides")
      .then((data) => {
        if (isMounted && data?.slides?.length) {
          const first = data.slides[0];
          setHeroImage({ src: resolveSrc(first.src), pos: first.pos || "center 46%" });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (broken) {
    return (
      <div className="hero__bg" aria-hidden="true">
        <GhatsPanorama />
      </div>
    );
  }

  return (
    <div className="hero__bg" aria-hidden="true">
      <img
        className="hero__slide is-on"
        src={heroImage.src}
        alt=""
        style={{
          objectPosition: heroImage.pos,
          transform: "scale(1)",
          transition: "none",
        }}
        fetchPriority="high"
        loading="eager"
        decoding="async"
        onError={() => setBroken(true)}
      />
    </div>
  );
});

export default HeroBackdrop;
