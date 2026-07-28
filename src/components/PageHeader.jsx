import { useState, memo } from "react";
import { GhatsPanorama } from "./Scene";

/**
 * The banner every inner page opens with. It also gives the transparent header
 * something dark to sit on, which is what keeps the nav legible site-wide.
 */
const PageHeader = memo(function PageHeader({ eyebrow, title, intro, image, pos = "center 45%" }) {
  const [broken, setBroken] = useState(false);

  return (
    <header className="pagehead">
      <div className="pagehead__bg" aria-hidden="true">
        {broken ? (
          <GhatsPanorama />
        ) : (
          <img
            src={image}
            alt=""
            style={{ objectPosition: pos }}
            fetchPriority="high"
            onError={() => setBroken(true)}
          />
        )}
      </div>
      <div className="pagehead__scrim" aria-hidden="true" />

      <div className="shell pagehead__inner">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p className="pagehead__intro">{intro}</p>}
      </div>
    </header>
  );
});

export default PageHeader;
