// Trip planner engine (Requirements.md FR-PLAN-03…08).
//
// Builds a day-by-day plan from a curated catalogue of blocks, respecting
// interests, walking tolerance, seniors/children, pace and budget. It is a
// planning aid: durations are suggestions, and it never claims to know live
// crowds or closures (FR-PLAN-07) — the UI points to Today in Varanasi.

import type { Interest } from "@/content/types";

export type Slot = "dawn" | "morning" | "midday" | "afternoon" | "evening";
export type Walking = "low" | "moderate" | "high";
export type Pace = "relaxed" | "balanced" | "full";
export type Budget = "low" | "mid" | "high";

export interface Block {
  id: string;
  title: string;
  href: string;
  slot: Slot;
  durationMin: number;
  walking: Walking;
  interests: Interest[];
  area: string;
  seniorOk: boolean;
  kidsOk: boolean;
  budget: Budget; // the lowest budget it suits
  priority: number; // must-see weight
  note?: string;
  /** Only one block from each group per trip (e.g. one sunrise boat ride). */
  group?: string;
}

export const SLOT_LABEL: Record<Slot, string> = {
  dawn: "Early morning",
  morning: "Morning",
  midday: "Midday",
  afternoon: "Afternoon",
  evening: "Evening",
};

export const CATALOGUE: Block[] = [
  { id: "sunrise-boat", title: "Sunrise boat ride along the ghats", href: "/things-to-do/sunrise-boat-ride", slot: "dawn", durationMin: 120, walking: "low", interests: ["river", "spiritual", "photography"], area: "Assi / Dashashwamedh", seniorOk: true, kidsOk: true, budget: "low", priority: 10, group: "boat-dawn", note: "Boats are suspended when the river is in flood — check Today in Varanasi." },
  { id: "ghat-walk", title: "Morning walk along the ghats", href: "/things-to-do/morning-ghat-walk", slot: "dawn", durationMin: 90, walking: "moderate", interests: ["river", "spiritual", "photography", "culture"], area: "Assi → Dashashwamedh", seniorOk: false, kidsOk: true, budget: "low", priority: 7, group: "ghat-walk", note: "Many steps and uneven stone; wear good shoes." },
  { id: "yoga-assi", title: "Morning yoga or meditation by the river", href: "/things-to-do/yoga-and-meditation", slot: "dawn", durationMin: 75, walking: "low", interests: ["wellness", "spiritual"], area: "Assi Ghat", seniorOk: true, kidsOk: false, budget: "low", priority: 4, group: "yoga" },
  { id: "kachori-breakfast", title: "Banarasi breakfast: kachori-sabzi and jalebi", href: "/food/kachori-sabzi", slot: "morning", durationMin: 45, walking: "low", interests: ["food"], area: "Godowlia / old city", seniorOk: true, kidsOk: true, budget: "low", priority: 6, group: "breakfast" },
  { id: "kashi-vishwanath", title: "Shri Kashi Vishwanath Temple", href: "/places/temples/kashi-vishwanath", slot: "morning", durationMin: 150, walking: "moderate", interests: ["spiritual", "heritage"], area: "Old city", seniorOk: true, kidsOk: true, budget: "low", priority: 9, group: "kv", note: "The last stretch is on foot; phone and bag rules apply — check the temple page before you go." },
  { id: "heritage-walk", title: "Heritage walk through the old-city lanes", href: "/things-to-do/heritage-walks", slot: "morning", durationMin: 150, walking: "high", interests: ["heritage", "culture", "photography"], area: "Old city", seniorOk: false, kidsOk: true, budget: "low", priority: 6, group: "heritage-walk" },
  { id: "sarnath", title: "Half-day at Sarnath: Dhamek Stupa and the museum", href: "/places/heritage/sarnath", slot: "morning", durationMin: 240, walking: "moderate", interests: ["buddhist", "heritage", "family"], area: "Sarnath (by road)", seniorOk: true, kidsOk: true, budget: "low", priority: 8, group: "sarnath", note: "Travel by road; check the museum's closing day before you go." },
  { id: "sankat-mochan", title: "Sankat Mochan and Durga Kund temples", href: "/places/temples/sankat-mochan", slot: "afternoon", durationMin: 120, walking: "low", interests: ["spiritual"], area: "South Varanasi", seniorOk: true, kidsOk: true, budget: "low", priority: 6, group: "south-temples" },
  { id: "bhu", title: "BHU campus: New Vishwanath Temple and Bharat Kala Bhavan", href: "/places/temples/new-vishwanath-bhu", slot: "afternoon", durationMin: 150, walking: "low", interests: ["heritage", "spiritual", "family"], area: "BHU (by road)", seniorOk: true, kidsOk: true, budget: "low", priority: 5, group: "bhu", note: "Check museum opening days before you go." },
  { id: "ramnagar", title: "Ramnagar Fort and museum", href: "/places/heritage/ramnagar-fort", slot: "afternoon", durationMin: 150, walking: "moderate", interests: ["heritage", "family"], area: "Ramnagar (across the river)", seniorOk: false, kidsOk: true, budget: "low", priority: 4, group: "ramnagar" },
  { id: "silk", title: "Visit Banarasi silk weavers", href: "/things-to-do/silk-weaving-visits", slot: "afternoon", durationMin: 120, walking: "moderate", interests: ["shopping", "culture", "heritage"], area: "Madanpura", seniorOk: true, kidsOk: true, budget: "low", priority: 5, group: "silk", note: "No obligation to buy — and no shopping commissions with our partners." },
  { id: "markets", title: "Explore the old-city markets", href: "/things-to-do/market-exploration", slot: "afternoon", durationMin: 120, walking: "moderate", interests: ["shopping", "food", "culture"], area: "Godowlia / Vishwanath Gali", seniorOk: false, kidsOk: true, budget: "low", priority: 4, group: "markets" },
  { id: "food-walk", title: "Old-city food walk", href: "/things-to-do/food-walks", slot: "afternoon", durationMin: 150, walking: "moderate", interests: ["food", "culture"], area: "Godowlia / Chowk", seniorOk: false, kidsOk: true, budget: "low", priority: 6, group: "food-walk" },
  { id: "music", title: "Classical music evening", href: "/things-to-do/classical-music", slot: "evening", durationMin: 90, walking: "low", interests: ["culture"], area: "Varies", seniorOk: true, kidsOk: false, budget: "mid", priority: 3, group: "music", note: "Programmes vary — ask us what's on for your dates." },
  { id: "aarti-ghat", title: "Evening Ganga Aarti at Dashashwamedh", href: "/things-to-do/ganga-aarti", slot: "evening", durationMin: 90, walking: "low", interests: ["spiritual", "river", "culture", "photography"], area: "Dashashwamedh Ghat", seniorOk: false, kidsOk: true, budget: "low", priority: 10, group: "aarti", note: "Arrive early for a place on the steps; very crowded on festival days." },
  { id: "aarti-boat", title: "Watch the Ganga Aarti from a boat", href: "/things-to-do/sunset-boat-ride", slot: "evening", durationMin: 120, walking: "low", interests: ["spiritual", "river", "photography"], area: "Dashashwamedh (from the river)", seniorOk: true, kidsOk: true, budget: "mid", priority: 9, group: "aarti", note: "Easier than the crowded steps for seniors and children. Not possible when boating is suspended." },
  { id: "sunset-boat", title: "Sunset boat ride", href: "/things-to-do/sunset-boat-ride", slot: "evening", durationMin: 75, walking: "low", interests: ["river", "photography"], area: "Assi / Dashashwamedh", seniorOk: true, kidsOk: true, budget: "low", priority: 5, group: "boat-evening" },
  { id: "assi-evening", title: "Evening at Assi Ghat", href: "/places/ghats/assi", slot: "evening", durationMin: 90, walking: "low", interests: ["river", "culture", "family"], area: "Assi Ghat", seniorOk: true, kidsOk: true, budget: "low", priority: 4, group: "assi-evening" },
];

export interface PlannerInput {
  startDate?: string;
  days: number;
  interests: Interest[];
  travellers: number;
  seniors: boolean;
  children: boolean;
  walking: Walking;
  budget: Budget;
  pace: Pace;
}

export interface PlanItem {
  key: string; // unique within the plan
  blockId?: string;
  title: string;
  href?: string;
  slot: Slot | "break";
  durationMin: number;
  walking: Walking;
  area?: string;
  note?: string;
}

export interface Plan {
  input: PlannerInput;
  days: { day: number; date?: string; items: PlanItem[] }[];
}

const WALK_RANK: Record<Walking, number> = { low: 0, moderate: 1, high: 2 };
const BUDGET_RANK: Record<Budget, number> = { low: 0, mid: 1, high: 2 };
const SLOTS_BY_PACE: Record<Pace, Slot[]> = {
  relaxed: ["morning", "afternoon", "evening"],
  balanced: ["dawn", "morning", "afternoon", "evening"],
  full: ["dawn", "morning", "afternoon", "evening"],
};

export const DEFAULT_INPUT: PlannerInput = {
  days: 2,
  interests: ["spiritual", "river", "food"],
  travellers: 2,
  seniors: false,
  children: false,
  walking: "moderate",
  budget: "mid",
  pace: "balanced",
};

let counter = 0;
const key = () => `i${Date.now().toString(36)}${(counter++).toString(36)}`;

export function blockToItem(b: Block): PlanItem {
  return { key: key(), blockId: b.id, title: b.title, href: b.href, slot: b.slot, durationMin: b.durationMin, walking: b.walking, area: b.area, note: b.note };
}

function breakItem(text: string, minutes: number): PlanItem {
  return { key: key(), title: text, slot: "break", durationMin: minutes, walking: "low" };
}

export function eligible(b: Block, input: PlannerInput) {
  if (WALK_RANK[b.walking] > WALK_RANK[input.walking]) return false;
  // `seniorOk` is curated per block (step-free or short, with places to sit).
  if (input.seniors && !b.seniorOk) return false;
  if (input.children && !b.kidsOk) return false;
  if (BUDGET_RANK[b.budget] > BUDGET_RANK[input.budget]) return false;
  return true;
}

function score(b: Block, input: PlannerInput) {
  const matches = b.interests.filter((i) => input.interests.includes(i)).length;
  return matches * 4 + b.priority;
}

export function generatePlan(input: PlannerInput): Plan {
  const used = new Set<string>();
  const days: Plan["days"] = [];
  const pool = CATALOGUE.filter((b) => eligible(b, input));

  for (let d = 1; d <= input.days; d++) {
    const items: PlanItem[] = [];
    const slots = SLOTS_BY_PACE[input.pace].filter((s) => !(input.seniors && s === "dawn" && input.pace !== "full"));
    for (const slot of slots) {
      // A half-day block (Sarnath) fills the morning; skip the afternoon after it on relaxed pace.
      const pick = pool
        .filter((b) => b.slot === slot && !used.has(b.group ?? b.id))
        .sort((a, b) => score(b, input) - score(a, input))[0];
      if (!pick) continue;
      used.add(pick.group ?? pick.id);
      items.push(blockToItem(pick));
      if (slot === "morning") {
        items.push(breakItem(input.pace === "full" ? "Lunch break" : "Lunch and rest at your hotel", input.pace === "full" ? 60 : 120));
      }
      if (input.pace === "full" && slot === "afternoon") {
        const extra = pool
          .filter((b) => b.slot === "afternoon" && !used.has(b.group ?? b.id) && b.durationMin <= 120)
          .sort((a, b) => score(b, input) - score(a, input))[0];
        if (extra) {
          used.add(extra.group ?? extra.id);
          items.push(blockToItem(extra));
        }
      }
    }
    days.push({ day: d, date: input.startDate ? addDays(input.startDate, d - 1) : undefined, items });
  }
  return { input, days };
}

/** Calendar arithmetic on YYYY-MM-DD without going through UTC (which would
 *  shift the date by a day in IST, +5:30). */
export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/** General season guidance from the travel month — never specific dates. */
export function seasonNote(iso?: string) {
  if (!iso) return null;
  const m = new Date(`${iso}T00:00:00`).getMonth() + 1;
  if (m >= 7 && m <= 9) return "Monsoon months: the Ganga can rise enough for boating to be suspended and the Aarti to move up the steps. Keep each day flexible.";
  if (m >= 4 && m <= 6) return "Summer is very hot in Varanasi. Plan outdoor time for early morning and evening, and rest in the middle of the day.";
  if (m >= 10 || m <= 3) return "Cooler months are the most comfortable for walking — and the busiest. Festival days (e.g. Dev Deepawali, Mahashivratri, Holi) bring very large crowds.";
  return null;
}

export function walkingSummary(items: PlanItem[]) {
  const max = items.reduce((m, i) => Math.max(m, WALK_RANK[i.walking]), 0);
  return (["Mostly low walking", "Some walking on steps and lanes", "Lots of walking on steps and lanes"] as const)[max];
}

export const minutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);

/* ------------------------------------------------ share / save (no server) */

export function encodePlan(plan: Plan) {
  const json = JSON.stringify(plan);
  const b64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Shared links and saved trips are untrusted input: anyone can hand-edit a
// ?d= link, and localStorage can hold data from an older version. Rebuild a
// clean Plan from scratch — the same limits as the planner form, enums checked,
// links kept to this site — instead of trusting the shape.
const MAX_SHARED_LENGTH = 20_000;
const INTEREST_SET: Record<Interest, true> = {
  spiritual: true, heritage: true, river: true, food: true, shopping: true,
  culture: true, buddhist: true, photography: true, family: true, wellness: true,
};
const SLOTS: Slot[] = ["dawn", "morning", "midday", "afternoon", "evening"];
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;
const int = (v: unknown, min: number, max: number, fallback: number) =>
  Number.isInteger(v) && (v as number) >= min && (v as number) <= max ? (v as number) : fallback;
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
const isoDate = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v) ? v : undefined;
/** Only paths on this site — never javascript:, data: or another host. */
const sitePath = (v: unknown) => (typeof v === "string" && /^\/(?!\/)[\w\-/]*$/.test(v) && v.length <= 200 ? v : undefined);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function sanitizeItem(raw: unknown): PlanItem | null {
  if (!isObject(raw)) return null;
  const title = text(raw.title, 140);
  if (!title) return null;
  return {
    key: text(raw.key, 40) ?? key(),
    blockId: text(raw.blockId, 60),
    title,
    href: sitePath(raw.href),
    slot: oneOf(raw.slot, [...SLOTS, "break"] as const, "morning"),
    durationMin: int(raw.durationMin, 0, 720, 60),
    walking: oneOf(raw.walking, ["low", "moderate", "high"] as const, "moderate"),
    area: text(raw.area, 120),
    note: text(raw.note, 300),
  };
}

/** A clean Plan from untrusted data, or null if there's no usable day in it. */
export function sanitizePlan(raw: unknown): Plan | null {
  if (!isObject(raw) || !Array.isArray(raw.days)) return null;
  const inp = isObject(raw.input) ? raw.input : {};
  const days = raw.days
    .slice(0, 5)
    .map((d, i): Plan["days"][number] | null => {
      if (!isObject(d) || !Array.isArray(d.items)) return null;
      const items = d.items.slice(0, 30).map(sanitizeItem).filter((x): x is PlanItem => x !== null);
      return items.length ? { day: i + 1, date: isoDate(d.date), items } : null;
    })
    .filter((d): d is Plan["days"][number] => d !== null);
  if (!days.length) return null;
  return {
    input: {
      startDate: isoDate(inp.startDate),
      days: days.length,
      interests: Array.isArray(inp.interests) ? [...new Set(inp.interests.filter((x): x is Interest => typeof x === "string" && x in INTEREST_SET))] : [],
      travellers: int(inp.travellers, 1, 30, DEFAULT_INPUT.travellers),
      seniors: inp.seniors === true,
      children: inp.children === true,
      walking: oneOf(inp.walking, ["low", "moderate", "high"] as const, DEFAULT_INPUT.walking),
      budget: oneOf(inp.budget, ["low", "mid", "high"] as const, DEFAULT_INPUT.budget),
      pace: oneOf(inp.pace, ["relaxed", "balanced", "full"] as const, DEFAULT_INPUT.pace),
    },
    days,
  };
}

export function decodePlan(s: string): Plan | null {
  if (!s || s.length > MAX_SHARED_LENGTH) return null;
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return sanitizePlan(JSON.parse(json));
  } catch {
    return null;
  }
}

export interface SavedTrip {
  id: string;
  name: string;
  savedAt: string;
  plan: Plan;
}

const STORE = "vtc-trips";

export function loadTrips(): SavedTrip[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORE) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((t) => {
      const plan = isObject(t) ? sanitizePlan(t.plan) : null;
      if (!plan || !isObject(t) || typeof t.id !== "string") return [];
      return [{ id: t.id.slice(0, 60), name: text(t.name, 80) ?? "My Varanasi trip", savedAt: typeof t.savedAt === "string" ? t.savedAt : "", plan }];
    });
  } catch {
    return [];
  }
}

export function saveTrip(trip: SavedTrip) {
  try {
    const trips = loadTrips().filter((t) => t.id !== trip.id);
    localStorage.setItem(STORE, JSON.stringify([trip, ...trips].slice(0, 20)));
    return true;
  } catch {
    return false;
  }
}

export function deleteTrip(id: string) {
  try {
    localStorage.setItem(STORE, JSON.stringify(loadTrips().filter((t) => t.id !== id)));
  } catch {
    /* storage unavailable — nothing to delete */
  }
}

export function planAsText(plan: Plan) {
  const lines = [`My Varanasi plan (${plan.days.length} day${plan.days.length > 1 ? "s" : ""})`];
  for (const d of plan.days) {
    lines.push("", `Day ${d.day}${d.date ? ` — ${d.date}` : ""}`);
    for (const i of d.items) lines.push(`• ${i.slot === "break" ? i.title : `${SLOT_LABEL[i.slot]}: ${i.title}`}`);
  }
  return lines.join("\n");
}

/** Ready-made itinerary → editable plan (so "Customise this plan" opens it in the planner). */
export function itineraryToPlan(it: {
  days: number;
  pace: Pace;
  walking: Walking;
  plan: { day: number; stops: { time: string; title: string; place?: string; thing?: string; durationMin: number; walking: Walking; note?: string }[] }[];
}, hrefFor: (stop: { place?: string; thing?: string }) => string | undefined): Plan {
  const slotFor = (time: string): Slot | "break" => {
    const t = time.toLowerCase();
    if (/sunrise|dawn|early/.test(t)) return "dawn";
    if (/lunch|rest|break/.test(t)) return "break";
    if (/midday|noon/.test(t)) return "midday";
    if (/afternoon/.test(t)) return "afternoon";
    if (/evening|sunset|night|dusk/.test(t)) return "evening";
    return "morning";
  };
  return {
    input: { ...DEFAULT_INPUT, days: it.days, pace: it.pace, walking: it.walking },
    days: it.plan.map((d) => ({
      day: d.day,
      items: d.stops.map((s, i) => {
        const slot = /rest|lunch|break/i.test(s.title) ? "break" : slotFor(s.time);
        return {
          key: `d${d.day}s${i}`,
          title: s.title,
          href: hrefFor(s),
          slot,
          durationMin: s.durationMin,
          walking: s.walking,
          note: s.note?.replace(/\s*\[VERIFY[^\]]*\]/g, " (being verified)"),
        };
      }),
    })),
  };
}
