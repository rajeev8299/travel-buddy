// Line diff for comparing two revisions (FR-BLOG-05): longest common
// subsequence over lines. Articles are at most a few hundred lines, so the
// O(n·m) table is fine; very long inputs fall back to a whole-block replace.
const MAX_CELLS = 4_000_000;

/** → [{ type: "same" | "add" | "del", text }] turning `a` into `b`. */
export function diffLines(a, b) {
  const x = (a ?? "").split("\n");
  const y = (b ?? "").split("\n");
  if (x.length * y.length > MAX_CELLS) {
    return [...x.map((text) => ({ type: "del", text })), ...y.map((text) => ({ type: "add", text }))];
  }
  const n = x.length;
  const m = y.length;
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = x[i] === y[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      out.push({ type: "same", text: x[i++] });
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ type: "del", text: x[i++] });
    } else {
      out.push({ type: "add", text: y[j++] });
    }
  }
  while (i < n) out.push({ type: "del", text: x[i++] });
  while (j < m) out.push({ type: "add", text: y[j++] });
  return out;
}

/** The fields a reader sees, as text, so one diff covers them all. */
export function revisionText(r) {
  return [
    `Title: ${r.title}`,
    `Summary: ${r.excerpt}`,
    `Category: ${r.category ?? "—"}`,
    `Tags: ${(r.tags ?? []).join(", ") || "—"}`,
    `Cover: ${r.coverUrl ?? "—"}${r.coverAlt ? ` (alt: ${r.coverAlt})` : ""}${r.coverCredit ? ` (credit: ${r.coverCredit})` : ""}`,
    `Facts verified: ${r.verifiedOn ?? "—"}`,
    `SEO title: ${r.seoTitle ?? "—"}`,
    `SEO description: ${r.seoDescription ?? "—"}`,
    "",
    r.body ?? "",
    "",
    "Sources:",
    ...(r.sources ?? []).map((s) => `- ${s.title}${s.url ? ` <${s.url}>` : ""}`),
  ].join("\n");
}
