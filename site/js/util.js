const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

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
