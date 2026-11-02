"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { deleteTrip, loadTrips, type SavedTrip } from "@/lib/planner";

// Saved trips live in localStorage. useSyncExternalStore keeps the server
// render (no storage → null) and the browser render consistent, and picks up
// changes made in other tabs.
const listeners = new Set<() => void>();
let cache: { raw: string | null; trips: SavedTrip[] } = { raw: null, trips: [] };

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function snapshot(): SavedTrip[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("vtc-trips");
  } catch {
    /* storage blocked */
  }
  if (raw !== cache.raw) cache = { raw, trips: loadTrips() };
  return cache.trips;
}

export default function MyTrips() {
  const trips = useSyncExternalStore(subscribe, snapshot, () => null);

  if (trips === null) return <p>Loading…</p>;
  if (!trips.length) {
    return (
      <div className="empty">
        <p>You haven&apos;t saved a trip on this device yet.</p>
        <p style={{ marginTop: 12 }}><Link className="btn btn--primary" href="/plan/trip-planner">Plan a trip</Link></p>
      </div>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
      {trips.map((t) => (
        <li key={t.id} className="tile" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <strong>{t.name}</strong>
            <span style={{ display: "block" }}>Saved {new Date(t.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <div className="btn-row">
            <Link className="btn btn--primary" href={`/plan/trip-planner?trip=${t.id}`}>Open</Link>
            <button
              type="button"
              className="btn btn--outline"
              aria-label={`Delete ${t.name}`}
              onClick={() => {
                deleteTrip(t.id);
                listeners.forEach((l) => l());
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
