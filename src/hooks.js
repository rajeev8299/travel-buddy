import { useEffect, useRef } from "react";

/** Today as `yyyy-mm-dd` in local time, so <input min> blocks past dates. */
export function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

/** `2026-08-14` → `14 Aug` */
export function formatDay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function countNights(arrive, depart) {
  if (!arrive || !depart) return 0;
  const ms = new Date(depart).getTime() - new Date(arrive).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** Adds `.is-in` to every `[data-reveal]` node once it scrolls into view. */
export function useReveal(dep) {
  const scopeRef = useRef(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const nodes = scope.querySelectorAll("[data-reveal]:not(.is-in)");
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
    return () => io.disconnect();
  }, [dep]);

  return scopeRef;
}
