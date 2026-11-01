const STATIC_BUDDIES = [
  { name: "Ananya R.", city: "Assi Ghat", years: 6, rating: 4.9, tongue: "Hindi, English, Bhojpuri", hue: "#8E5AA8" },
  { name: "Vikas M.", city: "Dashashwamedh", years: 9, rating: 5.0, tongue: "Hindi, Bhojpuri, English", hue: "#3A6BB0" },
  { name: "Shabana K.", city: "Madanpura", years: 5, rating: 4.9, tongue: "Urdu, Hindi, English", hue: "#D2734A" },
  { name: "Tenzin L.", city: "Sarnath", years: 7, rating: 4.9, tongue: "Tibetan, Hindi, English", hue: "#2A8478" },
  { name: "Rohit P.", city: "Godowlia", years: 4, rating: 4.8, tongue: "Hindi, Bengali, English", hue: "#C25E3A" },
  { name: "Meera S.", city: "Shivala Ghat", years: 5, rating: 4.8, tongue: "Hindi, English, French", hue: "#2F8FA8" },
  { name: "Ajay N.", city: "Manikarnika", years: 8, rating: 5.0, tongue: "Hindi, Bhojpuri, English", hue: "#5B6BB0" },
  { name: "Lakshmi V.", city: "Kedar Ghat", years: 6, rating: 4.9, tongue: "Tamil, Hindi, English", hue: "#7A5AA8" },
];

const ICON_MAPPIN_SM = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const ICON_STAR = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

function buddyCardMarkup(b, i) {
  const initials = b.name.split(" ").map((w) => w[0]).join("");
  return `
    <article class="buddy" data-reveal style="--delay:${i * 70}ms">
      <span class="buddy__avatar" style="background:${escapeHtml(b.hue)}" aria-hidden="true">${escapeHtml(initials)}</span>
      <h3>${escapeHtml(b.name)}</h3>
      <p class="buddy__city">${ICON_MAPPIN_SM} ${escapeHtml(b.city)}</p>
      <p class="buddy__tongue">${escapeHtml(b.tongue)}</p>
      <p class="buddy__meta">
        <span class="buddy__rating">${ICON_STAR}${Number(b.rating).toFixed(1)}</span>
        <span>${escapeHtml(b.years)} yrs guiding</span>
      </p>
    </article>`;
}

function renderBuddies(buddies) {
  const grid = document.getElementById("buddies-grid");
  grid.innerHTML = buddies.map(buddyCardMarkup).join("");
  initReveal(grid);
}

async function initBuddies() {
  renderBuddies(STATIC_BUDDIES);
  try {
    const data = await api.get("/buddies");
    if (data?.buddies?.length) renderBuddies(data.buddies);
  } catch {
    // static list already shown
  }
}

document.addEventListener("DOMContentLoaded", initBuddies);
