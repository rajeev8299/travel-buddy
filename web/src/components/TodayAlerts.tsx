"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/site";
import type { Alert } from "./AlertStrip";

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Live alerts list. Never claims "all clear" when the API is unreachable. */
export default function TodayAlerts() {
  const [state, setState] = useState<{ status: "loading" | "ok" | "error"; alerts: Alert[] }>({ status: "loading", alerts: [] });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API_URL}/public/alerts`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setState({ status: "ok", alerts: d.alerts ?? [] }))
      .catch(() => { if (!ctrl.signal.aborted) setState({ status: "error", alerts: [] }); });
    return () => ctrl.abort();
  }, []);

  if (state.status === "loading") return <p aria-live="polite">Loading today&apos;s alerts…</p>;
  if (state.status === "error") {
    return (
      <div className="notice notice--warn" role="alert">
        <span aria-hidden="true">!</span>
        <div><strong>Live alerts are unavailable right now</strong>Check official sources (district administration, temple trust) or ask your hotel before heading out.</div>
      </div>
    );
  }
  if (!state.alerts.length) {
    return (
      <div className="notice notice--info">
        <span aria-hidden="true">ⓘ</span>
        <div><strong>No active alerts</strong>Our team hasn&apos;t posted anything for today. That doesn&apos;t guarantee normal conditions — on festival days and in the monsoon, always check before you go.</div>
      </div>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 14 }}>
      {state.alerts.map((a) => (
        <li key={a.id} className={`notice ${a.severity === "warning" ? "notice--warn" : "notice--info"}`}>
          <span aria-hidden="true">{a.severity === "warning" ? "!" : "ⓘ"}</span>
          <div>
            <strong>{a.title}</strong>
            {a.body && <p style={{ margin: "4px 0" }}>{a.body}</p>}
            <small style={{ color: "var(--muted)" }}>Posted {time(a.postedAt)} · valid until {time(a.endsAt)}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}
