import { Router } from "express";
import { db } from "../db.js";
import { revisionOut, readingMinutes } from "../blog/content.js";
import { getPost, getRevision } from "../blog/workflow.js";
import { verifyPreview } from "../blog/preview.js";

// Public blog API for the Next.js site (FR-BLOG-01). Only live articles: the
// post's current published revision, not archived. Drafts, reviews, scheduled
// and archived posts never appear here — the one exception is a signed preview
// link, which returns a single revision and is marked uncacheable.
const router = Router();

const LIVE = `FROM blog_posts p JOIN blog_revisions r ON r.id = p.live_revision_id
  LEFT JOIN author_profiles ap ON ap.user_id = p.author_id
  LEFT JOIN users u ON u.id = p.author_id
  LEFT JOIN blog_categories c ON c.slug = r.category
  WHERE p.archived_at IS NULL AND r.state = 'published'`;
const COLS = `p.slug, p.first_published_at, r.*, c.name AS category_name, ap.slug AS author_slug,
  COALESCE(ap.display_name, u.full_name) AS author_name, ap.bio AS author_bio, ap.avatar_url AS author_avatar,
  ap.avatar_pos AS author_avatar_pos, ap.languages AS author_languages, ap.expertise AS author_expertise`;

const iso = (s) => (s ? `${s.replace(" ", "T")}${s.includes("Z") ? "" : "Z"}` : null);

function summary(row) {
  const r = revisionOut(row);
  return {
    slug: row.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category ? { slug: r.category, name: row.category_name } : null,
    tags: r.tags,
    cover: r.coverUrl ? { url: r.coverUrl, alt: r.coverAlt, credit: r.coverCredit } : null,
    author: { slug: row.author_slug, name: row.author_name },
    publishedAt: iso(row.first_published_at ?? row.published_at),
    updatedAt: iso(row.published_at),
    readingMinutes: readingMinutes(r.body),
  };
}

function full(row) {
  const r = revisionOut(row);
  return {
    ...summary(row),
    body: r.body,
    sources: r.sources,
    verifiedOn: r.verifiedOn,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    author: authorOut(row),
  };
}

const list = (s) => {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
/** Public author fields only — never the account email, role or anything internal. */
function authorOut(row) {
  return {
    slug: row.author_slug,
    name: row.author_name,
    bio: row.author_bio,
    avatarUrl: row.author_avatar,
    avatarPos: row.author_avatar_pos ?? null,
    languages: list(row.author_languages),
    expertise: list(row.author_expertise),
  };
}

// LIKE treats % and _ as wildcards; a search for "50%" should mean the text.
const likeTerm = (q) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

router.get("/posts", (req, res) => {
  const per = Math.min(Math.max(Number(req.query.per) || 12, 1), 50);
  const page = Math.max(Math.floor(Number(req.query.page)) || 1, 1);
  const where = [];
  const args = [];
  if (typeof req.query.category === "string" && req.query.category) {
    where.push("r.category = ?");
    args.push(req.query.category);
  }
  if (typeof req.query.tag === "string" && req.query.tag) {
    where.push("EXISTS (SELECT 1 FROM json_each(r.tags) WHERE value = ?)");
    args.push(req.query.tag);
  }
  if (typeof req.query.author === "string" && req.query.author) {
    where.push("ap.slug = ?");
    args.push(req.query.author);
  }
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
  if (q) {
    where.push("(r.title LIKE ? ESCAPE '\\' OR r.excerpt LIKE ? ESCAPE '\\' OR r.body LIKE ? ESCAPE '\\')");
    args.push(likeTerm(q), likeTerm(q), likeTerm(q));
  }
  const extra = where.length ? ` AND ${where.join(" AND ")}` : "";
  const total = db.prepare(`SELECT COUNT(*) AS n ${LIVE}${extra}`).get(...args).n;
  const rows = db
    .prepare(`SELECT ${COLS} ${LIVE}${extra} ORDER BY p.first_published_at DESC, p.id DESC LIMIT ? OFFSET ?`)
    .all(...args, per, (page - 1) * per);
  res.json({ posts: rows.map(summary), page, pages: Math.max(1, Math.ceil(total / per)), total });
});

// "Not live" is a 200 with post: null, not a 404. The site caches these
// responses, and its cache only stores 200s: after an article was archived, a
// 404 would leave the last good copy cached and the article online for good.
router.get("/posts/:slug", (req, res) => {
  const row = db.prepare(`SELECT ${COLS} ${LIVE} AND p.slug = ?`).get(req.params.slug);
  if (!row) return res.json({ post: null, related: [] });
  // Related: same category or a shared tag, newest first.
  const related = db
    .prepare(
      `SELECT ${COLS} ${LIVE} AND p.slug != ?
         AND (r.category = ? OR EXISTS (SELECT 1 FROM json_each(r.tags) t WHERE t.value IN (SELECT value FROM json_each(?))))
       ORDER BY (r.category = ?) DESC, p.first_published_at DESC LIMIT 3`,
    )
    .all(row.slug, row.category, row.tags, row.category);
  res.json({ post: full(row), related: related.map(summary) });
});

router.get("/categories", (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.slug, c.name, c.description,
              (SELECT COUNT(*) FROM blog_posts p JOIN blog_revisions r ON r.id = p.live_revision_id
               WHERE p.archived_at IS NULL AND r.state = 'published' AND r.category = c.slug) AS count
       FROM blog_categories c ORDER BY c.sort_order`,
    )
    .all();
  res.json({ categories: rows });
});

router.get("/tags", (req, res) => {
  const rows = db
    .prepare(
      `SELECT t.value AS tag, COUNT(*) AS count FROM blog_posts p JOIN blog_revisions r ON r.id = p.live_revision_id, json_each(r.tags) t
       WHERE p.archived_at IS NULL AND r.state = 'published' GROUP BY t.value ORDER BY count DESC, tag`,
    )
    .all();
  res.json({ tags: rows });
});

// Author pages exist only for people with at least one live article, so the
// list of staff accounts isn't exposed. author: null (200) for the same
// caching reason as /posts/:slug.
router.get("/authors/:slug", (req, res) => {
  const posts = db.prepare(`SELECT ${COLS} ${LIVE} AND ap.slug = ? ORDER BY p.first_published_at DESC LIMIT 50`).all(req.params.slug);
  if (!posts.length) {
    // An address an admin has since changed: point to the current one.
    const moved = db
      .prepare("SELECT ap.slug FROM author_slug_redirects r JOIN author_profiles ap ON ap.user_id = r.user_id WHERE r.old_slug = ?")
      .get(req.params.slug);
    return res.json({ author: null, posts: [], redirectTo: moved?.slug ?? null });
  }
  res.json({ author: authorOut(posts[0]), posts: posts.map(summary) });
});

/** Every live article, minimal fields: for the sitemap, RSS feed and site search. */
router.get("/index", (req, res) => {
  const rows = db.prepare(`SELECT ${COLS} ${LIVE} ORDER BY p.first_published_at DESC`).all();
  res.json({ posts: rows.map(summary) });
});

router.get("/preview", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("X-Robots-Tag", "noindex");
  const id = verifyPreview(typeof req.query.token === "string" ? req.query.token : "");
  if (!id) return res.status(403).json({ message: "This preview link is invalid or has expired." });
  const rev = getRevision(id);
  const post = rev && getPost(rev.post_id);
  if (!rev || !post || rev.state === "discarded") return res.status(404).json({ message: "Revision not found." });
  const row = db
    .prepare(
      `SELECT p.slug, p.first_published_at, r.*, c.name AS category_name, ap.slug AS author_slug,
              COALESCE(ap.display_name, u.full_name) AS author_name, ap.bio AS author_bio, ap.avatar_url AS author_avatar,
              ap.avatar_pos AS author_avatar_pos, ap.languages AS author_languages, ap.expertise AS author_expertise
       FROM blog_revisions r JOIN blog_posts p ON p.id = r.post_id
       LEFT JOIN author_profiles ap ON ap.user_id = p.author_id LEFT JOIN users u ON u.id = p.author_id
       LEFT JOIN blog_categories c ON c.slug = r.category WHERE r.id = ?`,
    )
    .get(id);
  res.json({ post: full(row), preview: { state: rev.state, number: rev.number } });
});

export default router;
