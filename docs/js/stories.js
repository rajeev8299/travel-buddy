const STATIC_STORIES = [
  {
    quote: "We had three days and no plan. Our buddy took one look at us, skipped the crowded evening boat and walked us down to Assi at dawn instead. Best decision of the trip.",
    name: "Devika & Arun M.",
    trip: "Varanasi, 3 days",
  },
  {
    quote: "I'm a solo woman traveller and I'd been nervous about Varanasi. Ananya met me at the station at 11pm and I never once felt unsafe. That is worth every rupee.",
    name: "Sara T.",
    trip: "Varanasi, 4 days",
  },
  {
    quote: "Vikas noticed I was wilting in the afternoon heat, swapped the temple queue for a shaded silk workshop in Madanpura, and still got us to Dashashwamedh in time for the Aarti.",
    name: "Rahul K.",
    trip: "Varanasi & Sarnath, 5 days",
  },
  {
    quote: "My parents are in their seventies. I expected to spend the week worrying about the ghat steps. Instead our buddy found the gentlest way down and a boat with a proper handrail.",
    name: "Priya N.",
    trip: "Varanasi, 5 days",
  },
];

const ICON_QUOTE_BIG = `<svg class="stories__mark" viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h4v6a4 4 0 0 1-4 4H6"/><path d="M15 7h4v6a4 4 0 0 1-4 4h-1"/></svg>`;
const ICON_QUOTE_SM = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h4v6a4 4 0 0 1-4 4H6"/><path d="M15 7h4v6a4 4 0 0 1-4 4h-1"/></svg>`;
const ICON_CHEVRON_LEFT = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
const ICON_CHEVRON_RIGHT = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

let stories = STATIC_STORIES;
let current = 0;
let timer = null;

function renderCarousel() {
  const wrap = document.getElementById("stories-carousel");
  const s = stories[current];
  wrap.innerHTML = `
    ${ICON_QUOTE_BIG}
    <blockquote class="stories__quote">
      <p>${escapeHtml(s.quote)}</p>
      <footer><strong>${escapeHtml(s.name)}</strong><span>${escapeHtml(s.trip)}</span></footer>
    </blockquote>
    <div class="stories__nav">
      <button type="button" id="story-prev" aria-label="Previous story">${ICON_CHEVRON_LEFT}</button>
      <span class="stories__dots" id="story-dots"></span>
      <button type="button" id="story-next" aria-label="Next story">${ICON_CHEVRON_RIGHT}</button>
    </div>`;

  const dots = document.getElementById("story-dots");
  dots.innerHTML = stories
    .map((s2, i) => `<button type="button" class="${i === current ? "on" : ""}" aria-label="Story ${i + 1}" aria-current="${i === current}" data-i="${i}"></button>`)
    .join("");

  dots.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearInterval(timer);
      current = Number(btn.dataset.i);
      renderCarousel();
    });
  });

  document.getElementById("story-prev").addEventListener("click", () => go(-1));
  document.getElementById("story-next").addEventListener("click", () => go(1));
}

function go(step) {
  clearInterval(timer);
  current = (current + step + stories.length) % stories.length;
  renderCarousel();
}

function renderAllStories() {
  const grid = document.getElementById("stories-grid");
  grid.innerHTML = stories
    .map(
      (s, i) => `
      <article class="feature" data-reveal style="--delay:${i * 70}ms">
        <span class="feature__icon">${ICON_QUOTE_SM}</span>
        <p>${escapeHtml(s.quote)}</p>
        <p class="story__by"><strong>${escapeHtml(s.name)}</strong> · ${escapeHtml(s.trip)}</p>
      </article>`,
    )
    .join("");
  initReveal(grid);
}

function startAutoplay() {
  clearInterval(timer);
  timer = setInterval(() => {
    current = (current + 1) % stories.length;
    renderCarousel();
  }, 7000);
}

function renderStories(list) {
  stories = list;
  current = 0;
  renderCarousel();
  renderAllStories();
  startAutoplay();

  const shell = document.getElementById("stories-shell");
  shell.addEventListener("mouseenter", () => clearInterval(timer));
  shell.addEventListener("mouseleave", startAutoplay);
}

async function initStories() {
  renderStories(STATIC_STORIES);
  try {
    const data = await api.get("/stories");
    if (data?.stories?.length) renderStories(data.stories);
  } catch {
    // static list already shown
  }
}

document.addEventListener("DOMContentLoaded", initStories);
