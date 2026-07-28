// Builds the header (logo, nav, mobile drawer) and footer once, into the
// #site-header / #site-footer placeholders every page includes — so the
// markup lives in one file instead of being copy-pasted across nine pages.

const NAV_LINKS = [
  { href: "index.html", label: "Home" },
  { href: "why-buddy.html", label: "Why Buddy" },
  { href: "buddies.html", label: "Your Buddies" },
  { href: "stories.html", label: "Stories" },
];

const CREDITS = [
  { id: "boats", title: "Boats on the Ganga at Sankatha Ghat, Varanasi", creator: "Unsplash", license: "Unsplash License", source: "https://unsplash.com/photos/wloNuC7qKf8" },
  { id: "mural", title: "Steps and mural at Bundiparkota Ghat, Varanasi", creator: "Unsplash", license: "Unsplash License", source: "https://unsplash.com/photos/35nn8_KxZCQ" },
  { id: "market", title: "Boats at the market, Varanasi", creator: "Unsplash", license: "Unsplash License", source: "https://unsplash.com/photos/JIjCxenDxPY" },
  { id: "harbour", title: "The Ganga filled with boats, Varanasi", creator: "Unsplash", license: "Unsplash License", source: "https://unsplash.com/photos/9mlsS7ViHkE" },
  { id: "riverfront", title: "Ganges riverfront with buildings and boats", creator: "Unsplash", license: "Unsplash License", source: "https://unsplash.com/photos/i6mwttXNB8M" },
  { id: "stupa", title: "Ancient brick ruins and the Dhamek Stupa, Sarnath", creator: "Unsplash", license: "Unsplash License", source: "https://unsplash.com/photos/hBR4rerbBQs" },
  { id: "monks", title: "Two monks near the stupa at sunrise, Sarnath", creator: "Unsplash", license: "Unsplash License", source: "https://unsplash.com/photos/jeNWkvy8llE" },
  { id: "varanasi", title: "Varanasi, clear sunny day at the embankment of the Ganges", creator: "Vyacheslav Argenberg", license: "CC BY 4.0", source: "https://commons.wikimedia.org/w/index.php?curid=106201607" },
  { id: "jaipur", title: "City Palace interior, Jaipur", creator: "Richard Moross", license: "CC BY 2.0", source: "https://commons.wikimedia.org/w/index.php?curid=8720839" },
  { id: "alleppey", title: "Kerala backwaters, houseboats", creator: "Vyacheslav Argenberg", license: "CC BY 4.0", source: "https://commons.wikimedia.org/w/index.php?curid=123031037" },
  { id: "ladakh", title: "Reflection at Pangong Tso, Ladakh", creator: "kamaljith", license: "CC BY 2.0", source: "https://commons.wikimedia.org/w/index.php?curid=27393500" },
  { id: "meghalaya", title: "A double-decker living root bridge, Meghalaya", creator: "Vinayak Hegde", license: "CC BY 2.0", source: "https://commons.wikimedia.org/w/index.php?curid=18808200" },
  { id: "goa", title: "Palolem Beach coastline, South Goa", creator: "Meet Makadia", license: "CC0 1.0", source: "https://wordpress.org/photos/photo/695662884a/" },
];

const ICON_MENU = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>`;
const ICON_X = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const LOGO_MARK_SVG = `
  <svg class="logo__mark" viewBox="0 0 44 44" aria-hidden="true">
    <circle cx="22" cy="22" r="21" fill="var(--ink)" />
    <circle cx="22" cy="22" r="15.5" fill="none" stroke="var(--orange)" stroke-width="1.6" opacity=".55" />
    <path d="M29.5 14.5L25 25l-10.5 4.5L19 19z" fill="var(--orange)" />
    <circle cx="22" cy="22" r="2.1" fill="var(--ink)" />
  </svg>`;

function logoMarkup(size) {
  const style = size ? ` style="--logo-size:${size}px"` : "";
  return `
    <a class="logo" href="index.html" aria-label="TravelOnBuddy — home"${style}>
      <img class="logo__img" src="logo.png" alt=""
        onerror="this.onerror=null; if (this.src.endsWith('logo.png')) { this.src='logo.svg'; } else { this.outerHTML = window.LOGO_MARK_SVG; }">
      <span class="logo__word">Travel<span>On</span>Buddy</span>
    </a>`;
}
window.LOGO_MARK_SVG = LOGO_MARK_SVG;

function currentFile() {
  const file = location.pathname.split("/").pop();
  return file || "index.html";
}

function headerMarkup() {
  const file = currentFile();
  const links = NAV_LINKS.map(
    (l) => `<a href="${l.href}" class="${l.href === file ? "is-active" : ""}">${l.label}</a>`,
  ).join("");

  return `
    <header class="nav" id="site-nav">
      <div class="shell nav__inner">
        ${logoMarkup()}

        <nav class="nav__links" aria-label="Primary">${links}</nav>

        <div class="nav__actions">
          <a class="btn btn--ghost" href="become-a-buddy.html">Become a buddy</a>
          <a class="btn btn--ghost nav__login" href="login.html">Log in</a>
          <a class="btn btn--solid" href="plan.html">Plan my trip</a>
        </div>

        <button class="nav__burger" type="button" id="nav-burger" aria-expanded="false" aria-label="Open menu">
          ${ICON_MENU}
        </button>
      </div>
    </header>

    <div class="drawer" id="site-drawer" role="dialog" aria-modal="true" aria-label="Menu" hidden>
      <nav class="drawer__links">
        ${NAV_LINKS.map((l) => `<a href="${l.href}" class="${l.href === file ? "is-active" : ""}">${l.label}</a>`).join("")}
        <a href="become-a-buddy.html">Become a buddy</a>
        <a href="login.html">Log in / Sign up</a>
      </nav>
      <a class="btn btn--solid btn--wide" href="plan.html">Plan my trip</a>
    </div>`;
}

function footerMarkup() {
  const year = new Date().getFullYear();
  const navLinks = NAV_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join("");
  const credits = CREDITS.map(
    (c, i) =>
      `${i > 0 ? " · " : ""}<a href="${c.source}" target="_blank" rel="noreferrer noopener">${c.title}</a> by ${c.creator} (${c.license})`,
  ).join("");

  return `
    <footer class="foot">
      <div class="shell foot__inner">
        <div class="foot__brand">
          ${logoMarkup(72)}
          <p class="foot__tagline">Travel together, travel better</p>
          <p>Local-led travel across India, since 2019.</p>
        </div>

        <nav class="foot__col" aria-label="Explore">
          <h4>Explore</h4>
          ${navLinks}
        </nav>

        <nav class="foot__col" aria-label="Company">
          <h4>Company</h4>
          <a href="become-a-buddy.html">Become a buddy</a>
          <a href="why-buddy.html">Safety promise</a>
          <a href="plan.html">Contact</a>
        </nav>

        <div class="foot__col">
          <h4>Reach us</h4>
          <a href="mailto:hello@travelonbuddy.in">hello@travelonbuddy.in</a>
          <a href="tel:+911140001234">+91 11 4000 1234</a>
          <p class="foot__hours">Mon–Sat, 9am–8pm IST</p>
        </div>
      </div>

      <div class="shell foot__credits">
        <h4>Photography</h4>
        <p>${credits}</p>
      </div>

      <div class="shell foot__base">
        <p>© ${year} TravelOnBuddy. All rights reserved.</p>
        <p>Made in India 🇮🇳</p>
      </div>
    </footer>`;
}

function initChrome() {
  const headerSlot = document.getElementById("site-header");
  const footerSlot = document.getElementById("site-footer");
  if (headerSlot) headerSlot.outerHTML = headerMarkup();
  if (footerSlot) footerSlot.outerHTML = footerMarkup();

  const nav = document.getElementById("site-nav");
  const burger = document.getElementById("nav-burger");
  const drawer = document.getElementById("site-drawer");

  const onScroll = () => nav.classList.toggle("nav--solid", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    drawer.hidden = true;
    burger.innerHTML = ICON_MENU;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  };

  const openMenu = () => {
    drawer.hidden = false;
    burger.innerHTML = ICON_X;
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  };

  burger.addEventListener("click", () => (drawer.hidden ? openMenu() : closeMenu()));
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.hidden) closeMenu();
  });
}

document.addEventListener("DOMContentLoaded", initChrome);
