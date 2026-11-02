import type { Metadata } from "next";
import Link from "next/link";
import { PostArticle } from "@/components/blog";
import { PageHero } from "@/components/content";
import { getPreview } from "@/lib/blog";

// Editor preview of an unpublished revision (FR-BLOG-05). The only place a
// draft is ever rendered: by token, never cached, never indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Article preview",
  robots: { index: false, follow: false },
  // Keep the token out of Referer headers.
  referrer: "no-referrer",
};

export default async function BlogPreviewPage({ searchParams }: PageProps<"/blog/preview">) {
  const raw = (await searchParams).token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  const res = token ? await getPreview(token) : null;

  if (!res) {
    return (
      <>
        <PageHero eyebrow="Preview" title="This preview link isn't valid" crumbs={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
        <section className="section">
          <div className="shell stack" style={{ maxWidth: 720 }}>
            <p className="lead">The link may have expired, or a newer preview link has replaced it. Ask the editor for a fresh link from the admin panel.</p>
            <p><Link className="btn btn--outline" href="/blog">Go to the blog</Link></p>
          </div>
        </section>
      </>
    );
  }

  return (
    <PostArticle
      post={res.post}
      share={false}
      banner={
        <div className="preview-banner" role="note">
          <div className="shell">
            <strong>Preview — not published</strong> (state: {res.preview.state}, revision {res.preview.number}). This link expires.
          </div>
        </div>
      }
    />
  );
}
