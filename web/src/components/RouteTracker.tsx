"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/** Records a page_view on every client-side navigation and remembers the
 *  previous page, so enquiries can say where they started (FR-ANL-01, FR-SVC-02).
 *  In-app navigation doesn't update document.referrer, hence this. */
export default function RouteTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current === pathname) return;
    try {
      if (last.current) sessionStorage.setItem("vtc-prev-path", last.current);
    } catch {
      /* storage blocked */
    }
    last.current = pathname;
    track("page_view");
    if (pathname === "/travel-guide/emergency") track("emergency_viewed");
  }, [pathname]);
  return null;
}
