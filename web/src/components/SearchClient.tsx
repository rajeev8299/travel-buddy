"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { SearchDoc } from "@/lib/content";

const SUGGESTIONS = ["Ganga Aarti", "boat ride", "Kashi Vishwanath", "Sarnath", "food", "silk", "2 days", "senior", "airport", "emergency"];

/** Universal search (FR-SRCH). Ranks title matches above summary matches;
 *  the query lives in the URL (?q=) so results can be shared. */
export default function SearchClient({ docs }: { docs: SearchDoc[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get("q") ?? "");

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    if (!words.length) return [];
    return docs
      .map((d) => {
        if (!words.every((w) => d.keywords.includes(w))) return null;
        const title = d.title.toLowerCase();
        const score = words.reduce((s, w) => s + (title.includes(w) ? 3 : 1), 0) + (title.startsWith(words[0]) ? 2 : 0);
        return { d, score };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 40)
      .map((r) => r!.d);
  }, [docs, q]);

  const update = (value: string) => {
    setQ(value);
    router.replace(value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname, { scroll: false });
  };

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="field">
        <label htmlFor="site-search">Search</label>
        <input id="site-search" type="search" autoFocus value={q} onChange={(e) => update(e.target.value)} placeholder="Try “Ganga Aarti”, “Sarnath”, “food”…" />
      </form>
      {!q && (
        <div className="chips" style={{ marginTop: 16 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="btn btn--outline" style={{ minHeight: 38, padding: "6px 14px" }} onClick={() => update(s)}>{s}</button>
          ))}
        </div>
      )}
      {q && (
        <p aria-live="polite" style={{ margin: "18px 0 10px", color: "var(--muted)" }}>
          {results.length ? `${results.length} result${results.length === 1 ? "" : "s"}` : "No results"} for “{q}”
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {results.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="tile">
              <span className="card__kicker">{r.type}</span>
              <strong>{r.title}</strong>
              <span>{r.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      {q && !results.length && (
        <p style={{ marginTop: 12 }}>Can&apos;t find it? <Link href={`/enquiry?context=${encodeURIComponent(q)}`}>Ask our local team</Link>.</p>
      )}
    </div>
  );
}
