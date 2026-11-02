"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { API_URL } from "@/lib/site";

export interface Alert {
  id: number;
  title: string;
  body: string | null;
  severity: "info" | "advisory" | "warning";
  startsAt: string;
  endsAt: string;
  postedAt: string;
}

/** "Today in Varanasi" strip. Alerts are live API data (never baked into the
 *  static pages), and expired alerts are filtered server-side. If the API
 *  can't be reached the strip simply doesn't render. */
export default function AlertStrip() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API_URL}/public/alerts`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setAlerts(d?.alerts ?? null);
        if (d?.alerts?.length) track("alert_viewed", { count: d.alerts.length });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  if (!alerts?.length || dismissed) return null;
  const top = alerts[0];
  const updated = new Date(top.postedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return (
    <div className={`alertstrip alertstrip--${top.severity}`} role="status">
      <div className="shell alertstrip__inner">
        <span className="alertstrip__label">Today in Varanasi</span>
        <span className="alertstrip__text">{top.title}</span>
        <span className="alertstrip__time">Updated {updated}</span>
        <Link href="/travel-guide/today">
          {alerts.length > 1 ? `All ${alerts.length} alerts` : "Details"} <span aria-hidden="true">→</span>
        </Link>
        <button type="button" className="alertstrip__close" aria-label="Hide alert" onClick={() => setDismissed(true)}>✕</button>
      </div>
    </div>
  );
}
