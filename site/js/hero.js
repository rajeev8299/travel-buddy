// Full-bleed rotating hero backdrop on the homepage. Fetches the live list
// from /api/hero-slides; falls back to the 12 photos shipped in img/ if the
// API isn't reachable (e.g. this page was opened straight off disk).

const STATIC_HERO_SLIDES = [
  { src: "img/boats.jpg", pos: "center 46%" },
  { src: "img/jaipur.jpg", pos: "center 52%" },
  { src: "img/market.jpg", pos: "center 55%" },
  { src: "img/ladakh.jpg", pos: "center 50%" },
  { src: "img/mural.jpg", pos: "center 55%" },
  { src: "img/meghalaya.jpg", pos: "center 50%" },
  { src: "img/harbour.jpg", pos: "center 55%" },
  { src: "img/alleppey.jpg", pos: "center 52%" },
  { src: "img/monks.jpg", pos: "center 60%" },
  { src: "img/goa.jpg", pos: "center 55%" },
  { src: "img/riverfront.jpg", pos: "center 48%" },
  { src: "img/stupa.jpg", pos: "center 45%" },
];

const SLIDE_MS = 6500;

function renderHeroSlides(slides) {
  const bg = document.getElementById("hero-bg");
  bg.innerHTML = slides
    .map(
      (s, i) =>
        `<img class="hero__slide${i === 0 ? " is-on" : ""}" src="${s.src}" alt="" style="object-position:${s.pos}"
          fetchpriority="${i === 0 ? "high" : "low"}" loading="${i === 0 ? "eager" : "lazy"}" decoding="async" data-index="${i}">`,
    )
    .join("");

  const imgs = Array.from(bg.querySelectorAll("img"));
  imgs[0]?.addEventListener(
    "error",
    () => {
      bg.innerHTML = GHATS_PANORAMA_SVG;
    },
    { once: true },
  );

  if (imgs.length <= 1) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  let shown = 0;
  setInterval(() => {
    imgs[shown].classList.remove("is-on");
    shown = (shown + 1) % imgs.length;
    imgs[shown].classList.add("is-on");
  }, SLIDE_MS);
}

async function initHero() {
  try {
    const data = await api.get("/hero-slides");
    if (data?.slides?.length) {
      renderHeroSlides(data.slides.map((s) => ({ src: s.src, pos: s.pos })));
      return;
    }
  } catch {
    // fall through to static slides
  }
  renderHeroSlides(STATIC_HERO_SLIDES);
}

document.addEventListener("DOMContentLoaded", initHero);
