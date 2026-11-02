import Image from "next/image";
import Link from "next/link";
import { CardGrid, Markdown, PageHero, SectionHead, Sources } from "@/components/content";
import ShareArticle from "@/components/ShareArticle";
import type { BlogAuthor, BlogCategory, BlogPage, BlogPost, BlogSummary, PreviewPost } from "@/lib/blog";
import { absoluteMedia, day, mediaSrc, tagPath } from "@/lib/blog";
import { SITE_NAME, SITE_URL, breadcrumbLd, formatDate, organizationLd } from "@/lib/site";

// Blog building blocks (FR-BLOG-01/05). The live article page and the editor
// preview render the same <PostArticle>, so a preview is exactly what will ship.

/** "/blog?q=x&page=2" — drops empty values and page 1. */
export function blogHref(base: string, params: { page?: number; q?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

type BylinePost = Pick<PreviewPost, "publishedAt" | "updatedAt" | "readingMinutes"> & { author: { slug: string; name: string } };

function Byline({ post }: { post: BylinePost }) {
  // Only a preview of a never-published draft has no dates.
  const updated = post.publishedAt && post.updatedAt && day(post.updatedAt) !== day(post.publishedAt);
  return (
    <>
      By <Link href={`/blog/author/${post.author.slug}`}>{post.author.name}</Link>
      {" · "}
      {post.publishedAt ? <time dateTime={post.publishedAt}>{formatDate(day(post.publishedAt))}</time> : "Not published yet"}
      {updated && <>{" · Updated "}<time dateTime={post.updatedAt!}>{formatDate(day(post.updatedAt!))}</time></>}
      {` · ${post.readingMinutes} min read`}
    </>
  );
}

/* --------------------------------------------------------------- listings */

export function BlogCards({ posts }: { posts: BlogSummary[] }) {
  return (
    <CardGrid
      cards={posts.map((p) => ({
        href: `/blog/${p.slug}`,
        title: p.title,
        text: p.excerpt,
        kicker: p.category?.name,
        image: p.cover ? { src: mediaSrc(p.cover.url), alt: p.cover.alt } : undefined,
        unoptimized: true,
        meta: (
          <span>
            {p.author.name} · <time dateTime={p.publishedAt}>{formatDate(day(p.publishedAt))}</time> · {p.readingMinutes} min read
          </span>
        ),
      }))}
    />
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      {page > 1 ? (
        <Link className="btn btn--outline" href={href(page - 1)} rel="prev" aria-label={`Previous page (page ${page - 1})`}>← Previous</Link>
      ) : <span />}
      <p>Page {page} of {pages}</p>
      {page < pages ? (
        <Link className="btn btn--outline" href={href(page + 1)} rel="next" aria-label={`Next page (page ${page + 1})`}>Next →</Link>
      ) : <span />}
    </nav>
  );
}

/** Cards + pagination, or an honest empty state. */
export function BlogList({ data, href, empty = "No articles yet — check back soon." }: { data: BlogPage; href: (page: number) => string; empty?: string }) {
  if (!data.posts.length) return <p className="empty">{empty}</p>;
  return (
    <>
      <BlogCards posts={data.posts} />
      <Pagination page={data.page} pages={data.pages} href={href} />
    </>
  );
}

/** Category chips with counts; empty categories are hidden. */
export function CategoryNav({ categories, current }: { categories: BlogCategory[]; current?: string }) {
  const live = categories.filter((c) => c.count > 0);
  if (!live.length) return null;
  return (
    <nav aria-label="Blog categories">
      <ul className="pill-nav">
        <li><Link href="/blog" aria-current={current ? undefined : "page"}>All articles</Link></li>
        {live.map((c) => (
          <li key={c.slug}>
            <Link href={`/blog/category/${c.slug}`} aria-current={current === c.slug ? "page" : undefined}>
              {c.name} <span className="pill-nav__count">({c.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Plain GET form so search works without JavaScript and results can be shared. */
export function BlogSearch({ q }: { q?: string }) {
  return (
    <form role="search" action="/blog" method="get" className="field blog-search">
      <label htmlFor="blog-search">Search the blog</label>
      <div>
        <input id="blog-search" type="search" name="q" defaultValue={q} placeholder="Try “aarti”, “boat”, “food”…" />
        <button type="submit" className="btn btn--primary">Search</button>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- article */

export function postCrumbs(post: Pick<BlogPost, "slug" | "title" | "category">) {
  return [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(post.category ? [{ name: post.category.name, path: `/blog/category/${post.category.slug}` }] : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ];
}

/** Languages and interests, as the author describes them (not verified by us). */
export function AuthorFacts({ author }: { author: Pick<BlogAuthor, "languages" | "expertise"> }) {
  if (!author.languages?.length && !author.expertise?.length) return null;
  return (
    <dl className="blog-author__facts">
      {author.languages?.length > 0 && <div><dt>Languages</dt><dd>{author.languages.join(", ")}</dd></div>}
      {author.expertise?.length > 0 && <div><dt>Writes about</dt><dd>{author.expertise.join(", ")}</dd></div>}
      <p className="blog-author__note">As described by the author.</p>
    </dl>
  );
}

/** `share` is off for previews: their link is private and expires. */
export function PostArticle({
  post,
  related = [],
  banner,
  share = true,
}: {
  post: BlogPost | PreviewPost;
  related?: BlogSummary[];
  banner?: React.ReactNode;
  share?: boolean;
}) {
  const author = post.author;
  return (
    <>
      <PageHero eyebrow={post.category?.name ?? "Blog"} title={post.title} intro={post.excerpt} crumbs={postCrumbs(post)}>
        <p className="blog-byline"><Byline post={post} /></p>
      </PageHero>
      {banner}
      <section className="section">
        <article className="shell blog-article">
          {post.cover && (
            <figure className="blog-cover">
              <div className="blog-cover__media">
                <Image src={mediaSrc(post.cover.url)} alt={post.cover.alt} fill priority unoptimized sizes="(max-width: 860px) 100vw, 820px" />
              </div>
              {post.cover.credit && <figcaption>Photo: {post.cover.credit}</figcaption>}
            </figure>
          )}
          {post.verifiedOn && (
            <p className="badge badge--verified" style={{ marginBottom: 24 }}>✓ Facts checked on {formatDate(post.verifiedOn)}</p>
          )}
          <Markdown imageSrc={mediaSrc}>{post.body}</Markdown>
          <Sources sources={post.sources} />
          {share && <ShareArticle url={`${SITE_URL}/blog/${post.slug}`} title={post.title} />}
          {post.tags.length > 0 && (
            <section aria-labelledby="tags-title" style={{ marginTop: 32 }}>
              <h2 id="tags-title" className="visually-hidden">Tags</h2>
              <ul className="pill-nav">
                {post.tags.map((t) => <li key={t}><Link href={tagPath(t)}>#{t}</Link></li>)}
              </ul>
            </section>
          )}
          <section className="factbox blog-author" aria-labelledby="author-title">
            {author.avatarUrl && (
              <Image src={mediaSrc(author.avatarUrl)} alt="" width={64} height={64} unoptimized className="blog-author__avatar" style={{ objectPosition: author.avatarPos ?? undefined }} />
            )}
            <div>
              <h2 id="author-title">About the author</h2>
              <p><Link href={`/blog/author/${author.slug}`}><strong>{author.name}</strong></Link></p>
              {author.bio && <p className="blog-author__bio">{author.bio}</p>}
              <AuthorFacts author={author} />
            </div>
          </section>
        </article>
      </section>
      {related.length > 0 && (
        <section className="section section--sand" aria-labelledby="related-title">
          <div className="shell">
            <SectionHead id="related-title" title="Related articles" />
            <BlogCards posts={related.slice(0, 3)} />
          </div>
        </section>
      )}
    </>
  );
}

/** BlogPosting + BreadcrumbList for the live article page. */
export function postLd(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        url,
        mainEntityOfPage: url,
        image: post.cover ? absoluteMedia(post.cover.url) : undefined,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        keywords: post.tags.length ? post.tags.join(", ") : undefined,
        articleSection: post.category?.name,
        author: { "@type": "Person", name: post.author.name, url: `${SITE_URL}/blog/author/${post.author.slug}` },
        publisher: { "@type": "Organization", "@id": organizationLd["@id"], name: SITE_NAME, logo: organizationLd.logo },
      },
      breadcrumbLd(postCrumbs(post)),
    ],
  };
}
