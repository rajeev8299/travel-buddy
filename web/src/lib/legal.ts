import fs from "node:fs";
import path from "node:path";

/** Legal pages come from the same sources as the static site (content/legal/*.html):
 *  a comment header with title/description, then an HTML body. While any
 *  [[placeholder]] remains the page is a draft: banner shown, noindex. */
export function readLegal(file: "privacy" | "terms" | "refund-policy") {
  const src = fs.readFileSync(path.join(process.cwd(), "content/legal", `${file}.html`), "utf8");
  const meta = Object.fromEntries([...src.matchAll(/^\s*(title|description):\s*(.+)$/gm)].map((m) => [m[1], m[2].trim()]));
  const body = src.replace(/<!--[\s\S]*?-->\s*/, "");
  const draft = body.includes("[[");
  const html = body.replace(/\[\[([^\]]+)\]\]/g, "<mark>$1</mark>").replace(/href="refund-policy\.html"/g, 'href="/cancellation-policy"');
  return { title: meta.title as string, description: meta.description as string, html, draft };
}
