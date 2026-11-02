import { FEED_PATH, getBlogIndex } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// RSS 2.0 of the latest live posts. Built without the API during `next build`
// (empty feed), then regenerated every minute, so a deploy doesn't leave an
// empty feed cached for long.
export const revalidate = 60;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const posts = (await getBlogIndex(60).catch(() => []))
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 20);

  const lastUpdated = posts.map((p) => p.updatedAt).sort().at(-1);
  const items = posts.map((p) => {
    const url = `${SITE_URL}/blog/${p.slug}`;
    return [
      "    <item>",
      `      <title>${esc(p.title)}</title>`,
      `      <link>${esc(url)}</link>`,
      `      <guid isPermaLink="true">${esc(url)}</guid>`,
      `      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>`,
      `      <dc:creator>${esc(p.author.name)}</dc:creator>`,
      p.category ? `      <category>${esc(p.category.name)}</category>` : "",
      `      <description>${esc(p.excerpt)}</description>`,
      "    </item>",
    ].filter(Boolean).join("\n");
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(`${SITE_NAME} — Blog`)}</title>
    <link>${esc(`${SITE_URL}/blog`)}</link>
    <description>Practical articles for visiting Varanasi.</description>
    <language>en-IN</language>
    <atom:link href="${esc(`${SITE_URL}${FEED_PATH}`)}" rel="self" type="application/rss+xml" />
    ${lastUpdated ? `<lastBuildDate>${new Date(lastUpdated).toUTCString()}</lastBuildDate>` : ""}
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
