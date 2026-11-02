// Tells the Next.js site to drop its cached blog data (articles, author pages)
// so a change shows on the next visit instead of within a minute. Optional:
// without SITE_INTERNAL_URL and REVALIDATE_SECRET the site just refreshes on
// its usual one-minute cycle. Never blocks or fails the caller.
export function refreshSite(reason) {
  const base = (process.env.SITE_INTERNAL_URL || "").replace(/\/$/, "");
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;
  fetch(`${base}/api/revalidate`, {
    method: "POST",
    headers: { "x-revalidate-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
    signal: AbortSignal.timeout(5000),
  })
    .then((r) => {
      if (!r.ok) console.error(`[site] refresh after ${reason} returned ${r.status}`);
    })
    .catch((err) => console.error(`[site] refresh after ${reason} failed: ${err.message}`));
}
