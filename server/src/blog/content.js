import crypto from "node:crypto";
import { db } from "../db.js";

// Blog content rules: field limits, what an article needs before review, and
// what may appear in the Markdown body. The site renders Markdown without raw
// HTML, so the checks here are about clean, accessible content and keeping
// media on our own hosts — not the only line of defence.

export const LIMITS = {
  title: 140,
  excerpt: 300,
  body: 60_000,
  tag: 30,
  tags: 10,
  sources: 20,
  sourceTitle: 200,
  url: 500,
  seoTitle: 70,
  seoDescription: 170,
  coverAlt: 200,
  coverCredit: 200,
};
const MIN_BODY = 300;

/** Images may come from blog uploads or the site's own /img folder only:
 *  no hotlinking, no third-party tracking pixels. */
export const isAllowedImage = (src) => /^\/uploads\/blog\/[\w-]+\.(jpe?g|png|webp)$/i.test(src) || /^\/img\/[\w./-]+$/.test(src);
const isAllowedLink = (href) => /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href);
const isHttpUrl = (u) => /^https?:\/\/[^\s]+$/i.test(u);

export function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "article"
  );
}

/** A slug not used by any other post (`-2`, `-3`… appended as needed). */
export function uniquePostSlug(base, exceptPostId = null) {
  const taken = db.prepare("SELECT 1 FROM blog_posts WHERE slug = ? AND id IS NOT ?");
  let slug = base;
  for (let n = 2; taken.get(slug, exceptPostId); n++) slug = `${base}-${n}`;
  return slug;
}

const json = (s, fallback) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

/** blog_revisions row → API shape. */
export function revisionOut(r) {
  return {
    id: r.id,
    postId: r.post_id,
    number: r.number,
    state: r.state,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    category: r.category,
    tags: json(r.tags, []),
    coverUrl: r.cover_url,
    coverAlt: r.cover_alt,
    coverCredit: r.cover_credit,
    sources: json(r.sources, []),
    verifiedOn: r.verified_on,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    createdBy: r.created_by,
    approvedBy: r.approved_by,
    approvedAt: r.approved_at,
    scheduledFor: r.scheduled_for,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Fingerprint of everything a reader would see. Approval records it;
 *  publishing refuses if it no longer matches (FR-BLOG-04). */
export function contentHash(r, slug) {
  const fields = [slug, r.title, r.excerpt, r.body, r.category, r.tags, r.cover_url, r.cover_alt, r.cover_credit, r.sources, r.verified_on, r.seo_title, r.seo_description];
  return crypto.createHash("sha256").update(JSON.stringify(fields)).digest("hex");
}

/**
 * Normalises an edit from the editor. Returns { fields } (column → value) or
 * { error }. Only shape and length are checked here; completeness is checked
 * when the article is submitted, so drafts can be saved half-written.
 */
// Expected JSON type of every editable field, checked before anything is
// normalised (QA-06): a wrong type is the client's mistake — a 400, not a 500.
const FIELD_TYPES = {
  title: "text", excerpt: "text", body: "text", category: "text", coverUrl: "text", coverAlt: "text",
  coverCredit: "text", verifiedOn: "text", seoTitle: "text", seoDescription: "text", tags: "list", sources: "list",
};

export function cleanEdit(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { error: "Send the changes as a JSON object." };
  for (const [key, kind] of Object.entries(FIELD_TYPES)) {
    const v = body[key];
    if (v === undefined || v === null) continue;
    if (kind === "text" && typeof v !== "string") return { error: `${key} must be text.` };
    if (kind === "list" && !Array.isArray(v)) return { error: `${key} must be a list.` };
  }
  const f = {};
  const str = (key, col, max) => {
    if (body[key] === undefined) return null;
    if (body[key] !== null && typeof body[key] !== "string") return `${key} must be text.`;
    const v = (body[key] ?? "").trim();
    if (v.length > max) return `${key} is too long (max ${max} characters).`;
    f[col] = v || null;
    return null;
  };
  const errors = [
    str("title", "title", LIMITS.title),
    str("excerpt", "excerpt", LIMITS.excerpt),
    str("coverAlt", "cover_alt", LIMITS.coverAlt),
    str("coverCredit", "cover_credit", LIMITS.coverCredit),
    str("seoTitle", "seo_title", LIMITS.seoTitle),
    str("seoDescription", "seo_description", LIMITS.seoDescription),
  ].filter(Boolean);
  if (errors.length) return { error: errors[0] };
  // title/excerpt/body are NOT NULL columns.
  if ("title" in f) f.title ??= "";
  if ("excerpt" in f) f.excerpt ??= "";

  if (body.body !== undefined) {
    if (typeof body.body !== "string") return { error: "body must be text." };
    if (body.body.length > LIMITS.body) return { error: `The article is too long (max ${LIMITS.body.toLocaleString("en-IN")} characters).` };
    f.body = body.body.replace(/\r\n/g, "\n");
  }
  if (body.category !== undefined) {
    if (body.category && !db.prepare("SELECT 1 FROM blog_categories WHERE slug = ?").get(body.category)) return { error: "Unknown category." };
    f.category = body.category || null;
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || body.tags.length > LIMITS.tags) return { error: `Up to ${LIMITS.tags} tags.` };
    const tags = [...new Set(body.tags.map((t) => (typeof t === "string" ? slugify(t).slice(0, LIMITS.tag) : "")).filter((t) => t && t !== "article"))];
    f.tags = JSON.stringify(tags);
  }
  if (body.coverUrl !== undefined) {
    const u = (body.coverUrl ?? "").trim();
    if (u && !isAllowedImage(u)) return { error: "Upload the cover image here, or use an image from the site's /img folder." };
    f.cover_url = u || null;
  }
  if (body.sources !== undefined) {
    if (!Array.isArray(body.sources) || body.sources.length > LIMITS.sources) return { error: `Up to ${LIMITS.sources} sources.` };
    const sources = [];
    for (const s of body.sources) {
      const title = typeof s?.title === "string" ? s.title.trim() : "";
      const url = typeof s?.url === "string" ? s.url.trim() : "";
      if (!title && !url) continue;
      if (!title || title.length > LIMITS.sourceTitle) return { error: "Each source needs a title (max 200 characters)." };
      if (url && (url.length > LIMITS.url || !isHttpUrl(url))) return { error: `Source "${title}" needs a full web address (https://…).` };
      sources.push(url ? { title, url } : { title });
    }
    f.sources = JSON.stringify(sources);
  }
  if (body.verifiedOn !== undefined) {
    const v = body.verifiedOn || null;
    if (v && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v)))) return { error: "Verified date must be a date." };
    if (v && v > new Date().toISOString().slice(0, 10)) return { error: "Verified date can't be in the future." };
    f.verified_on = v;
  }
  return { fields: f };
}

/** Problems that stop an article being submitted for review. */
export function submitProblems(r) {
  const p = [];
  if ((r.title || "").length < 5) p.push("Add a title.");
  if ((r.excerpt || "").length < 20) p.push("Add a summary of at least 20 characters — it's shown on the blog listing and in search results.");
  if ((r.body || "").length < MIN_BODY) p.push(`The article needs at least ${MIN_BODY} characters.`);
  if (!r.category) p.push("Choose a category.");
  if (r.cover_url && !r.cover_alt) p.push("Describe the cover image (alt text) for people who can't see it.");
  if (r.cover_url && !r.cover_credit) p.push("Credit the cover image (photographer or source).");
  p.push(...bodyProblems(r.body || ""));
  return p;
}

/** Markdown checks: image alt text and sources, link schemes, no raw HTML embeds. */
export function bodyProblems(md) {
  const p = [];
  for (const m of md.matchAll(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    if (!m[1].trim()) p.push(`Image ${m[2]} needs alt text: ![describe the image](${m[2]}).`);
    if (!isAllowedImage(m[2])) p.push(`Image ${m[2]} must be uploaded here (or come from the site's /img folder).`);
  }
  for (const m of md.matchAll(/(?<!!)\[[^\]]*\]\(\s*<?([^)\s>]+)/g)) {
    if (!isAllowedLink(m[1])) p.push(`Link ${m[1].slice(0, 60)} isn't allowed — use https://, mailto: or a site path like /places.`);
  }
  if (/<\/?(script|iframe|object|embed|style|form|input|svg)\b/i.test(md)) p.push("Remove the HTML embed — articles are plain Markdown.");
  // The visual editor falls back to HTML tags when bold and italic overlap in a
  // way Markdown can't express; the site doesn't render HTML, so they'd show as text.
  if (/<\/?(em|strong|b|i|u|s|del|ins|mark|span|sup|sub)\b[^>]*>/i.test(md)) {
    p.push("Some formatting couldn't be saved as plain text (overlapping bold and italic?). Simplify it or check the Markdown view.");
  }
  return [...new Set(p)];
}

/** What fact verification requires (FR-BLOG-03): a date and at least one source. */
export function verifyProblems(r) {
  const p = [];
  if (!r.verified_on) p.push("Set the date the facts were checked.");
  if (!json(r.sources, []).length) p.push("List at least one source the facts were checked against.");
  return p;
}

export const readingMinutes = (md) => Math.max(1, Math.round((md || "").split(/\s+/).filter(Boolean).length / 200));
