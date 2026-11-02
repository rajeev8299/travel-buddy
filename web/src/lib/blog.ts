import "server-only";
import type { Metadata } from "next";
import type { SearchDoc } from "@/lib/content";
import { API_URL, SITE_URL } from "@/lib/site";

// Blog content lives in the Express API (FR-BLOG-01), not in files. Pages
// fetch it on the server: in Docker the site reaches the API on the internal
// network (INTERNAL_API_URL=http://api:4000/api), elsewhere the public URL.
// The Docker build runs without the API, so nothing here may be required at
// build time — callers that run during the build catch and fall back.
const BASE = (process.env.INTERNAL_API_URL || API_URL).replace(/\/$/, "");

/** Published/archived changes show within a minute — or at once when the API calls /api/revalidate. */
const REVALIDATE = 60;
const BLOG_TAGS = ["blog"];

/* ------------------------------------------------------------------ types */

export interface BlogCategoryRef {
  slug: string;
  name: string;
}

export interface BlogCover {
  url: string;
  alt: string;
  credit: string | null;
}

export interface BlogSummary {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategoryRef | null;
  tags: string[];
  cover: BlogCover | null;
  author: { slug: string; name: string };
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
}

export interface BlogAuthor {
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  /** CSS object-position for the photo crop, e.g. "50% 30%". */
  avatarPos: string | null;
  /** Self-described by the author; not verified. */
  languages: string[];
  expertise: string[];
}

export interface BlogPost extends Omit<BlogSummary, "author"> {
  body: string;
  sources: { title: string; url?: string }[];
  verifiedOn: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  author: BlogAuthor;
}

export interface BlogCategory extends BlogCategoryRef {
  description: string | null;
  count: number;
}

export interface BlogPage {
  posts: BlogSummary[];
  page: number;
  pages: number;
  total: number;
}

/* ------------------------------------------------------------------ fetch */

/** GET from the API. Resolves null on 404 (and on 400/403 — a bad preview
 *  token), throws on anything else so an outage isn't shown as "no content". */
async function get<T>(path: string, init: RequestInit = { next: { revalidate: REVALIDATE, tags: BLOG_TAGS } }): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { Accept: "application/json" } });
  if ([400, 403, 404].includes(res.status)) return null;
  if (!res.ok) throw new Error(`Blog API ${path} → ${res.status}`);
  return (await res.json()) as T;
}

async function must<T>(path: string, init?: RequestInit): Promise<T> {
  const data = await get<T>(path, init);
  if (!data) throw new Error(`Blog API ${path} → not found`);
  return data;
}

export const PER_PAGE = 12;

export function listPosts(filter: { page?: number; category?: string; tag?: string; author?: string; q?: string }) {
  const qs = new URLSearchParams({ page: String(filter.page ?? 1), per: String(PER_PAGE) });
  for (const k of ["category", "tag", "author", "q"] as const) if (filter[k]) qs.set(k, filter[k]!);
  return must<BlogPage>(`/blog/posts?${qs}`);
}

// The API answers "not live" with post/author: null (a 200), because this
// cache only stores 200s — a 404 would keep an archived article online.
export const getPost = async (slug: string) => {
  const d = await get<{ post: BlogPost | null; related: BlogSummary[] }>(`/blog/posts/${encodeURIComponent(slug)}`);
  return d?.post ? { post: d.post, related: d.related } : null;
};

export const getCategories = async (revalidate = REVALIDATE) =>
  (await must<{ categories: BlogCategory[] }>("/blog/categories", { next: { revalidate, tags: BLOG_TAGS } })).categories;

/** An author's page data, `{ redirectTo }` when an admin has moved the address, or null. */
export const getAuthor = async (
  slug: string,
): Promise<{ author: BlogAuthor; posts: BlogSummary[] } | { redirectTo: string } | null> => {
  const d = await get<{ author: BlogAuthor | null; posts: BlogSummary[]; redirectTo?: string | null }>(`/blog/authors/${encodeURIComponent(slug)}`);
  if (d?.author) return { author: d.author, posts: d.posts };
  if (d?.redirectTo) return { redirectTo: d.redirectTo };
  return null;
};

/** Every live post (sitemap, RSS, site search). */
export const getBlogIndex = async (revalidate = REVALIDATE) =>
  (await must<{ posts: BlogSummary[] }>("/blog/index", { next: { revalidate, tags: BLOG_TAGS } })).posts;

/** A previewed revision: a draft that was never published has no dates yet. */
export type PreviewPost = Omit<BlogPost, "publishedAt" | "updatedAt"> & { publishedAt: string | null; updatedAt: string | null };

/** Draft preview by editor token — never cached. */
export const getPreview = (token: string) =>
  get<{ post: PreviewPost; preview: { state: string; number: number } }>(
    `/blog/preview?token=${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );

/* ---------------------------------------------------------------- helpers */

/** Public origin of the API (uploads are served there), e.g. http://localhost:4000. */
const API_ORIGIN = API_URL.replace(/\/api$/, "");

/** Image src for the browser: "/uploads/…" lives on the API origin, "/img/…" on this site. */
export function mediaSrc(src: string) {
  return src.startsWith("/uploads/") ? `${API_ORIGIN}${src}` : src;
}

/** Absolute image URL for Open Graph and JSON-LD. */
export function absoluteMedia(src: string) {
  const s = mediaSrc(src);
  return s.startsWith("/") ? `${SITE_URL}${s}` : s;
}

/** API timestamps are ISO; formatDate takes the YYYY-MM-DD part. */
export const day = (iso: string) => iso.slice(0, 10);

/** Positive integer page number from ?page=, default 1. */
export function pageParam(v: string | string[] | undefined) {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Params can arrive percent-encoded (tags may contain spaces). */
export function decodeParam(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export const FEED_PATH = "/blog/feed.xml";

/** Adds the RSS alternate link to a page's metadata. */
export function withFeed(meta: Metadata): Metadata {
  return { ...meta, alternates: { ...meta.alternates, types: { "application/rss+xml": `${SITE_URL}${FEED_PATH}` } } };
}

export const tagPath = (tag: string) => `/blog/tag/${encodeURIComponent(tag)}`;

export function blogSearchDocs(posts: BlogSummary[]): SearchDoc[] {
  return posts.map((p) => ({
    type: "Blog",
    title: p.title,
    summary: p.excerpt,
    href: `/blog/${p.slug}`,
    keywords: `${p.title} ${p.excerpt} ${p.category?.name ?? ""} ${p.tags.join(" ")} ${p.author.name}`.toLowerCase(),
  }));
}
