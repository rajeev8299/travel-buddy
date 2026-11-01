const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

/** Makes a value safe to drop into HTML markup or a quoted attribute. Use it
 *  on anything that came from the API before it goes into innerHTML. */
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Gives every form control the screen-reader wiring its visual state
 *  implies: its hint/error line (`<id>-msg`) as its description, and
 *  aria-required when its label is marked with "*". Call once after a form
 *  is rendered. */
function linkFieldMessages(root) {
  root.querySelectorAll('.field__msg[id$="-msg"]').forEach((msg) => {
    const id = msg.id.slice(0, -4);
    const control = document.getElementById(id) || document.getElementById(`${id}-fieldset`);
    if (!control) return;
    control.setAttribute("aria-describedby", msg.id);
    const label = document.querySelector(`label[for="${id}"]`) || control.querySelector?.("legend");
    if (label && label.textContent.trim().endsWith("*")) control.setAttribute("aria-required", "true");
  });
}

/** Marks the control behind a field id as invalid (or valid again). */
function setFieldInvalid(id, invalid) {
  const control = document.getElementById(id) || document.getElementById(`${id}-fieldset`);
  if (!control) return;
  if (invalid) control.setAttribute("aria-invalid", "true");
  else control.removeAttribute("aria-invalid");
}

// Photos in img/ have WebP copies at 640/1280px (and 1920px when the original
// is that wide) — see scripts/optimize-images.sh. Full-bleed photos pick a
// size from these instead of downloading the original JPEG.
const PHOTOS_1920 = new Set(["boats", "harbour", "market", "monks", "mural", "riverfront", "stupa", "varanasi"]);

/** src/srcset attributes for a full-width photo. Anything that isn't one of
 *  our img/*.jpg files (e.g. an admin upload served by the API) is used as-is. */
function photoAttrs(src) {
  const m = /^img\/([a-z_]+)\.jpg$/.exec(src || "");
  if (!m) return `src="${escapeHtml(src)}"`;
  const name = m[1];
  const widths = PHOTOS_1920.has(name) ? [640, 1280, 1920] : [640, 1280];
  const srcset = widths.map((w) => `img/${name}-${w}.webp ${w}w`).join(", ");
  return `src="img/${name}-1280.webp" srcset="${srcset}" sizes="100vw"`;
}

function isValidEmail(v) {
  return EMAIL_RE.test(v.trim());
}

function isValidPhone(v) {
  return PHONE_RE.test(v.replace(/[\s-]/g, ""));
}

/** Today as yyyy-mm-dd in local time, so <input min> blocks past dates. */
function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

/** 2026-08-14 -> 14 Aug */
function formatDay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function countNights(arrive, depart) {
  if (!arrive || !depart) return 0;
  const ms = new Date(depart).getTime() - new Date(arrive).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** Adds .is-in to every [data-reveal] node once it scrolls into view. */
function initReveal(root = document) {
  const nodes = root.querySelectorAll("[data-reveal]:not(.is-in)");
  if (!nodes.length) return;

  if (typeof IntersectionObserver === "undefined") {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
  );

  nodes.forEach((n) => io.observe(n));
}
