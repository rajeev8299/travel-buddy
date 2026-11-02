import { ITINERARIES, findActivity, findPlace, placePath } from "./content";
import { itineraryToPlan, type Plan } from "./planner";

export function hrefForStop(s: { place?: string; thing?: string }) {
  const p = s.place ? findPlace(s.place) : undefined;
  if (p) return placePath(p);
  const a = s.thing ? findActivity(s.thing) : undefined;
  return a ? `/things-to-do/${a.slug}` : undefined;
}

/** All ready-made itineraries as editable planner templates, keyed by slug. */
export function itineraryTemplates(): Record<string, Plan> {
  return Object.fromEntries(ITINERARIES.map((it) => [it.slug, itineraryToPlan(it, hrefForStop)]));
}
