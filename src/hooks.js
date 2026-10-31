import { useRef } from "react";

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

/** Instant render without scroll delay */
export function useReveal() {
  const scopeRef = useRef(null);
  return scopeRef;
}
