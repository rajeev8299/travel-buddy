"use client";

import { useMemo, useState } from "react";
import { Card, type CardData } from "./content";

export interface FilterItem extends CardData {
  facets: Record<string, string[]>;
  search: string;
}

export interface Facet {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

/** Text search + single-choice facets over a server-rendered list. Everything
 *  is in the initial HTML, so it works (unfiltered) without JavaScript too. */
export default function FilterableCards({ items, facets, placeholder = "Search…" }: { items: FilterItem[]; facets: Facet[]; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter(
      (it) =>
        words.every((w) => it.search.includes(w)) &&
        Object.entries(selected).every(([k, v]) => !v || it.facets[k]?.includes(v)),
    );
  }, [items, q, selected]);

  return (
    <div>
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <div className="field">
          <label htmlFor="filter-q">Search</label>
          <input id="filter-q" type="search" value={q} placeholder={placeholder} onChange={(e) => setQ(e.target.value)} />
        </div>
        {facets.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={`filter-${f.key}`}>{f.label}</label>
            <select
              id={`filter-${f.key}`}
              value={selected[f.key] ?? ""}
              onChange={(e) => setSelected((s) => ({ ...s, [f.key]: e.target.value }))}
            >
              <option value="">All</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>
      <p aria-live="polite" style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 14 }}>
        Showing {shown.length} of {items.length}
      </p>
      {shown.length ? (
        <div className="grid grid--3">{shown.map((it) => <Card key={it.href} href={it.href} title={it.title} text={it.text} kicker={it.kicker} image={it.image} meta={it.meta} />)}</div>
      ) : (
        <p className="empty">Nothing matches — try fewer filters.</p>
      )}
    </div>
  );
}
