import { Router } from "express";
import fs from "node:fs";
import { db } from "../db.js";
import { requireRole } from "../middleware/auth.js";
import { validateBody, validateParam, text, NUMERIC_ID, UUID } from "../middleware/validate.js";
import { audit } from "../audit.js";
import { refreshSite } from "../siteRefresh.js";
import { uploadBlogImage, isRealImage } from "../uploads.js";
import { cleanEdit, revisionOut, slugify, uniquePostSlug, submitProblems } from "../blog/content.js";
import {
  OPEN_STATES, act, allowedActions, applyEdit, canEdit, canView, contributorsOf, getPost, getRevision, log, addContributor,
} from "../blog/workflow.js";
import { signPreview } from "../blog/preview.js";

// Editorial API for the admin panel's Blog section (FR-BLOG-02…05). Authors,
// editors and admins only; every handler re-checks ownership and role — the
// UI hiding a button is never the protection.
const router = Router();
router.use(requireRole("author", "editor", "admin"));
router.param("id", validateParam("id", NUMERIC_ID));

const SITE_URL = (process.env.SITE_URL || "http://localhost:3100").replace(/\/$/, "");

// Display names: author profile name, else the account name. Never emails.
const nameStmt = db.prepare(
  "SELECT COALESCE(ap.display_name, u.full_name) AS name FROM users u LEFT JOIN author_profiles ap ON ap.user_id = u.id WHERE u.id = ?",
);
const nameOf = (id) => (id === "system" ? "Scheduler" : nameStmt.get(id)?.name ?? "Former staff member");

/** Every writer gets a public author profile the first time they create a post. */
function ensureProfile(user) {
  if (db.prepare("SELECT 1 FROM author_profiles WHERE user_id = ?").get(user.id)) return;
  let slug = slugify(user.full_name);
  for (let n = 2; db.prepare("SELECT 1 FROM author_profiles WHERE slug = ?").get(slug); n++) slug = `${slugify(user.full_name)}-${n}`;
  db.prepare("INSERT INTO author_profiles (user_id, slug, display_name) VALUES (?, ?, ?)").run(user.id, slug, user.full_name);
}

const profileOut = (p) =>
  p && {
    slug: p.slug,
    displayName: p.display_name,
    bio: p.bio,
    avatarUrl: p.avatar_url,
    avatarPos: p.avatar_pos,
    languages: parseList(p.languages),
    expertise: parseList(p.expertise),
  };

function tx(fn) {
  db.exec("BEGIN");
  try {
    const out = fn();
    db.exec("COMMIT");
    return out;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

const openRevision = (postId) =>
  db
    .prepare(`SELECT * FROM blog_revisions WHERE post_id = ? AND state IN (${OPEN_STATES.map(() => "?").join(",")}) ORDER BY number DESC LIMIT 1`)
    .get(postId, ...OPEN_STATES);

// ------------------------------------------------------------------ profile
// Each person edits only their own profile (the routes never take a user id);
// an admin changes another author's address through /authors/:userId/slug.
// Languages and expertise are the author's own description — nothing here
// grants a badge, a role or any publishing permission.

const PHOTO_RE = /^\/uploads\/blog\/[\w-]+\.(jpe?g|png|webp)$/i;
const POS_RE = /^(100|\d{1,2})% (100|\d{1,2})%$/;
const LIST = (n, max) => ({ type: "strings", maxItems: n, max });
const parseList = (s) => {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const hasLivePost = (userId) =>
  Boolean(
    db
      .prepare("SELECT 1 FROM blog_posts p JOIN blog_revisions r ON r.id = p.live_revision_id WHERE p.author_id = ? AND p.archived_at IS NULL AND r.state = 'published'")
      .get(userId),
  );
const everPublished = (userId) => Boolean(db.prepare("SELECT 1 FROM blog_posts WHERE author_id = ? AND first_published_at IS NOT NULL").get(userId));
/** Taken by someone else — as a current address or as someone's old, redirecting one. */
const slugTaken = (slug, userId) =>
  Boolean(db.prepare("SELECT 1 FROM author_profiles WHERE slug = ? AND user_id != ?").get(slug, userId)) ||
  Boolean(db.prepare("SELECT 1 FROM author_slug_redirects WHERE old_slug = ? AND user_id != ?").get(slug, userId));

function meOut(user) {
  const p = db.prepare("SELECT * FROM author_profiles WHERE user_id = ?").get(user.id);
  const live = hasLivePost(user.id);
  return {
    profile: profileOut(p),
    // Shown in the "private account" section only; never in any public response.
    account: { email: user.email, role: user.role, name: user.full_name },
    slugLocked: everPublished(user.id),
    publicUrl: live && p ? `${SITE_URL}/blog/author/${p.slug}` : null,
  };
}

router.get("/me", (req, res) => {
  ensureProfile(req.user);
  res.json({ user: { id: req.user.id, role: req.user.role, name: req.user.full_name }, ...meOut(req.user) });
});

router.put(
  "/me/profile",
  validateBody({
    displayName: text(80, "Name"),
    slug: text(60, "Profile address"),
    bio: text(600, "Bio"),
    avatarUrl: text(200, "Photo"),
    avatarPos: text(9, "Photo position"),
    languages: LIST(8, 30),
    expertise: LIST(10, 40),
  }),
  (req, res) => {
    ensureProfile(req.user);
    const before = db.prepare("SELECT * FROM author_profiles WHERE user_id = ?").get(req.user.id);
    const b = req.body;
    const next = {
      display_name: b.displayName !== undefined ? b.displayName.trim() : before.display_name,
      slug: b.slug !== undefined ? slugify(b.slug) : before.slug,
      bio: b.bio !== undefined ? b.bio.trim() || null : before.bio,
      avatar_url: b.avatarUrl !== undefined ? b.avatarUrl || null : before.avatar_url,
      avatar_pos: b.avatarPos !== undefined ? b.avatarPos || null : before.avatar_pos,
      languages: b.languages !== undefined ? JSON.stringify([...new Set(b.languages.map((x) => x.trim()).filter(Boolean))]) : before.languages,
      expertise: b.expertise !== undefined ? JSON.stringify([...new Set(b.expertise.map((x) => x.trim()).filter(Boolean))]) : before.expertise,
    };
    if (next.display_name.length < 2) return res.status(400).json({ message: "Add the name readers will see (at least 2 characters)." });
    if (next.avatar_url && !PHOTO_RE.test(next.avatar_url)) return res.status(400).json({ message: "Upload the photo here — photos from other websites can't be used." });
    if (next.avatar_pos && !POS_RE.test(next.avatar_pos)) return res.status(400).json({ message: "Photo position must look like '50% 30%'." });
    if (next.slug !== before.slug) {
      if (everPublished(req.user.id)) {
        return res.status(409).json({ message: "Your profile address is fixed now that you have a published article, so links to it keep working. An admin can change it if needed." });
      }
      if (next.slug.length < 3) return res.status(400).json({ message: "The profile address needs at least 3 letters or numbers." });
      if (slugTaken(next.slug, req.user.id)) return res.status(409).json({ message: `The address /blog/author/${next.slug} is already taken. Try adding your surname or a word.` });
    }

    const changed = Object.keys(next).filter((k) => (next[k] ?? null) !== (before[k] ?? null));
    if (changed.length) {
      tx(() => {
        db.prepare(
          `UPDATE author_profiles SET display_name = ?, slug = ?, bio = ?, avatar_url = ?, avatar_pos = ?, languages = ?, expertise = ?,
             updated_at = datetime('now') WHERE user_id = ?`,
        ).run(next.display_name, next.slug, next.bio, next.avatar_url, next.avatar_pos, next.languages, next.expertise, req.user.id);
        audit(req.user.id, "profile.update", req.user.id, `Changed: ${changed.join(", ")}`);
      });
      refreshSite("profile update");
    }
    res.json({ ...meOut(req.user), changed });
  },
);

// Admin only: change an author's public address after they've published,
// keeping the old address as a permanent redirect.
router.put("/authors/:userId/slug", validateBody({ slug: text(60, "Profile address") }), (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can change another author's address." });
  if (!UUID.test(req.params.userId)) return res.status(400).json({ message: "Unknown author." });
  const profile = db.prepare("SELECT * FROM author_profiles WHERE user_id = ?").get(req.params.userId);
  if (!profile) return res.status(404).json({ message: "That person has no author profile yet." });
  const slug = slugify(req.body.slug || "");
  if (slug.length < 3) return res.status(400).json({ message: "The profile address needs at least 3 letters or numbers." });
  if (slug === profile.slug) return res.json({ slug });
  if (slugTaken(slug, profile.user_id)) return res.status(409).json({ message: `The address /blog/author/${slug} is already taken.` });
  tx(() => {
    db.prepare("INSERT OR REPLACE INTO author_slug_redirects (old_slug, user_id) VALUES (?, ?)").run(profile.slug, profile.user_id);
    db.prepare("DELETE FROM author_slug_redirects WHERE old_slug = ?").run(slug); // reclaiming one of their own old addresses
    db.prepare("UPDATE author_profiles SET slug = ?, updated_at = datetime('now') WHERE user_id = ?").run(slug, profile.user_id);
    audit(req.user.id, "profile.slug_change", profile.user_id, `${profile.slug} → ${slug} (old address redirects)`);
  });
  refreshSite("author address change");
  res.json({ slug, redirectFrom: profile.slug });
});

router.get("/categories", (req, res) => {
  res.json({ categories: db.prepare("SELECT slug, name, description FROM blog_categories ORDER BY sort_order").all() });
});

// -------------------------------------------------------------------- posts

router.get("/posts", (req, res) => {
  const staff = req.user.role !== "author";
  const mine = !staff || req.query.mine === "1";
  const rows = db
    .prepare(
      `SELECT p.id, p.slug, p.author_id, p.live_revision_id, p.archived_at, p.last_published_at,
              r.id AS rev_id, r.number, r.state, r.title, r.updated_at, r.scheduled_for
       FROM blog_posts p
       JOIN blog_revisions r ON r.id = (SELECT id FROM blog_revisions WHERE post_id = p.id AND state != 'discarded' ORDER BY number DESC LIMIT 1)
       ${mine ? "WHERE p.author_id = ?" : ""}
       ORDER BY r.updated_at DESC LIMIT 500`,
    )
    .all(...(mine ? [req.user.id] : []));
  res.json({
    posts: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      author: nameOf(r.author_id),
      mine: r.author_id === req.user.id,
      live: Boolean(r.live_revision_id) && !r.archived_at,
      archived: Boolean(r.archived_at),
      lastPublishedAt: r.last_published_at,
      latest: { id: r.rev_id, number: r.number, state: r.state, title: r.title, updatedAt: r.updated_at, scheduledFor: r.scheduled_for },
    })),
  });
});

router.post("/posts", validateBody({ title: text(140, "Title") }), (req, res) => {
  const title = (req.body.title || "").trim();
  if (title.length < 5) return res.status(400).json({ message: "Give the article a working title (at least 5 characters)." });
  const ids = tx(() => {
    ensureProfile(req.user);
    const post = db.prepare("INSERT INTO blog_posts (slug, author_id) VALUES (?, ?)").run(uniquePostSlug(slugify(title)), req.user.id);
    const postId = Number(post.lastInsertRowid);
    const rev = db.prepare("INSERT INTO blog_revisions (post_id, number, title, created_by) VALUES (?, 1, ?, ?)").run(postId, title, req.user.id);
    const revId = Number(rev.lastInsertRowid);
    addContributor(revId, req.user.id);
    log(revId, req.user.id, "create");
    return { postId, revisionId: revId };
  });
  res.status(201).json(ids);
});

router.get("/posts/:id", (req, res) => {
  const post = getPost(req.params.id);
  if (!post || !canView(req.user, post)) return res.status(404).json({ message: "Article not found." });
  const revisions = db
    .prepare("SELECT id, number, state, title, created_by, updated_at, published_at FROM blog_revisions WHERE post_id = ? ORDER BY number DESC")
    .all(post.id)
    .map((r) => ({ id: r.id, number: r.number, state: r.state, title: r.title, createdBy: nameOf(r.created_by), updatedAt: r.updated_at, publishedAt: r.published_at }));
  const open = openRevision(post.id);
  const own = post.author_id === req.user.id;
  const staff = req.user.role !== "author";
  res.json({
    post: {
      id: post.id,
      slug: post.slug,
      author: nameOf(post.author_id),
      mine: own,
      liveRevisionId: post.archived_at ? null : post.live_revision_id,
      everPublished: Boolean(post.first_published_at),
      archived: Boolean(post.archived_at),
      url: post.live_revision_id && !post.archived_at ? `${SITE_URL}/blog/${post.slug}` : null,
    },
    revisions,
    openRevisionId: open?.id ?? null,
    can: {
      newRevision: !open && (own || staff),
      editSlug: !post.first_published_at && (own || staff),
      archive: req.user.role === "admin" && !post.archived_at && Boolean(post.live_revision_id),
      unarchive: req.user.role === "admin" && Boolean(post.archived_at),
    },
  });
});

// The address is fixed once published: changing it would break links and search results.
router.patch("/posts/:id", validateBody({ slug: text(80, "Address") }), (req, res) => {
  const post = getPost(req.params.id);
  if (!post || !canView(req.user, post)) return res.status(404).json({ message: "Article not found." });
  if (post.first_published_at) return res.status(409).json({ message: "The address can't change after the article has been published." });
  if (post.author_id !== req.user.id && req.user.role === "author") return res.status(403).json({ message: "Not your article." });
  const slug = slugify(req.body.slug || "");
  if (slug !== post.slug && db.prepare("SELECT 1 FROM blog_posts WHERE slug = ?").get(slug)) {
    return res.status(409).json({ message: "Another article already uses that address." });
  }
  db.prepare("UPDATE blog_posts SET slug = ? WHERE id = ?").run(slug, post.id);
  res.json({ slug });
});

// New revision of a post: a copy of the live version (to update a published
// article) or of an older revision (restore, FR-BLOG-05). Either way it starts
// as a draft and goes through the full review again.
router.post("/posts/:id/revisions", validateBody({ fromRevisionId: { type: "numeric", label: "Revision" } }), (req, res) => {
  const post = getPost(req.params.id);
  if (!post || !canView(req.user, post)) return res.status(404).json({ message: "Article not found." });
  if (post.author_id !== req.user.id && req.user.role === "author") return res.status(403).json({ message: "Not your article." });
  if (openRevision(post.id)) return res.status(409).json({ message: "This article already has a revision in progress. Finish or discard it first." });
  const fromId = req.body.fromRevisionId ? Number(req.body.fromRevisionId) : post.live_revision_id;
  const from = fromId ? getRevision(fromId) : null;
  if (!from || from.post_id !== post.id) return res.status(400).json({ message: "Choose a revision of this article to start from." });

  const revId = tx(() => {
    const number = db.prepare("SELECT MAX(number) AS n FROM blog_revisions WHERE post_id = ?").get(post.id).n + 1;
    const r = db
      .prepare(
        `INSERT INTO blog_revisions (post_id, number, title, excerpt, body, category, tags, cover_url, cover_alt, cover_credit,
           sources, verified_on, seo_title, seo_description, created_by)
         SELECT post_id, ?, title, excerpt, body, category, tags, cover_url, cover_alt, cover_credit,
           sources, verified_on, seo_title, seo_description, ? FROM blog_revisions WHERE id = ?`,
      )
      .run(number, req.user.id, from.id);
    const id = Number(r.lastInsertRowid);
    addContributor(id, req.user.id);
    log(id, req.user.id, req.body.fromRevisionId ? "restore" : "new_revision", `From revision ${from.number}`);
    return id;
  });
  res.status(201).json({ revisionId: revId });
});

for (const [path, archive] of [["archive", true], ["unarchive", false]]) {
  router.post(`/posts/:id/${path}`, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can archive articles." });
    const post = getPost(req.params.id);
    if (!post) return res.status(404).json({ message: "Article not found." });
    tx(() => {
      db.prepare("UPDATE blog_posts SET archived_at = ? WHERE id = ?").run(archive ? new Date().toISOString() : null, post.id);
      // An archived post must not come back through a pending schedule.
      if (archive) db.prepare("UPDATE blog_revisions SET state = 'approved', scheduled_for = NULL WHERE post_id = ? AND state = 'scheduled'").run(post.id);
      const target = post.live_revision_id || openRevision(post.id)?.id;
      if (target) log(target, req.user.id, path);
    });
    refreshSite(path);
    res.json({ ok: true });
  });
}

// ---------------------------------------------------------------- revisions

function loadRevision(req, res) {
  const rev = getRevision(req.params.id);
  const post = rev && getPost(rev.post_id);
  if (!rev || !post || !canView(req.user, post)) {
    res.status(404).json({ message: "Revision not found." });
    return {};
  }
  return { rev, post };
}

router.get("/revisions/:id", (req, res) => {
  const { rev, post } = loadRevision(req, res);
  if (!rev) return;
  const reviews = db
    .prepare("SELECT id, user_id, action, body, created_at FROM blog_reviews WHERE revision_id = ? ORDER BY id")
    .all(rev.id)
    .map((r) => ({ id: r.id, by: nameOf(r.user_id), action: r.action, body: r.body, at: r.created_at }));
  res.json({
    revision: revisionOut(rev),
    post: { id: post.id, slug: post.slug, author: nameOf(post.author_id), liveRevisionId: post.live_revision_id, archived: Boolean(post.archived_at) },
    reviews,
    contributors: contributorsOf(rev.id).map(nameOf),
    approvedBy: rev.approved_by ? nameOf(rev.approved_by) : null,
    canEdit: canEdit(req.user, post, rev),
    actions: allowedActions(req.user, post, rev),
    // Shown while writing, so problems are fixed before submitting rather than after.
    problems: ["draft", "changes_requested"].includes(rev.state) ? submitProblems(rev) : [],
  });
});

router.put("/revisions/:id", (req, res) => {
  const { rev, post } = loadRevision(req, res);
  if (!rev) return;
  if (!canEdit(req.user, post, rev)) {
    return res.status(409).json({ message: `This revision is ${rev.state.replace(/_/g, " ")} and can't be edited by you now.` });
  }
  const { fields, error } = cleanEdit(req.body ?? {});
  if (error) return res.status(400).json({ message: error });
  tx(() => applyEdit(req.user, rev, fields));
  const updated = getRevision(rev.id);
  res.json({ revision: revisionOut(updated), problems: submitProblems(updated) });
});

router.post(
  "/revisions/:id/actions",
  validateBody({ action: text(30, "Action"), comment: text(2000, "Comment"), scheduledFor: text(40, "Publish time") }),
  (req, res) => {
    const { rev } = loadRevision(req, res);
    if (!rev) return;
    const out = tx(() => act(req.user, rev, req.body.action, req.body));
    if (out.error) return res.status(out.status).json({ message: out.error, problems: out.problems });
    res.json({ ok: true, state: getRevision(rev.id).state });
  },
);

// Private preview on the real site (FR-BLOG-05): a signed link to this exact
// revision that expires in 30 minutes. The preview page is noindex and uncached.
router.post("/revisions/:id/preview", (req, res) => {
  const { rev } = loadRevision(req, res);
  if (!rev) return;
  const { token, expiresAt } = signPreview(rev.id);
  res.json({ url: `${SITE_URL}/blog/preview?token=${encodeURIComponent(token)}`, expiresAt });
});

// -------------------------------------------------------------------- media

router.post("/media", uploadBlogImage.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Choose an image to upload." });
  if (!isRealImage(req.file.path)) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(400).json({ message: "That file isn't a JPEG, PNG or WEBP image." });
  }
  console.log(`[blog] image uploaded by ${req.user.id}: ${req.file.filename} (${req.file.size} bytes)`);
  res.status(201).json({ url: `/uploads/blog/${req.file.filename}` });
});

export default router;
