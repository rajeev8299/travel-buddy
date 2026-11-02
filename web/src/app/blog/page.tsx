import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogList, BlogSearch, CategoryNav, blogHref } from "@/components/blog";
import { JsonLd, PageHero } from "@/components/content";
import { getCategories, listPosts, pageParam, withFeed } from "@/lib/blog";
import { breadcrumbLd, pageMeta } from "@/lib/site";

const crumbs = [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }];

export async function generateMetadata({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const page = pageParam(sp.page);
  return withFeed(pageMeta({
    title: page > 1 ? `Varanasi Travel Blog — page ${page}` : "Varanasi Travel Blog: Tips, Guides & Stories",
    description: "Practical articles for visiting Varanasi — the ghats and temples, food, festivals, etiquette and planning — written by our local team.",
    path: blogHref("/blog", { page }),
    // Search results are thin, duplicate pages.
    noindex: Boolean(sp.q),
  }));
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) || undefined;
  const [data, categories] = await Promise.all([listPosts({ page, q }), getCategories()]);
  if (data.total > 0 && page > data.pages) notFound();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes from Varanasi"
        intro="Practical, local articles on the ghats, temples, food, festivals and planning your days — with sources, and clearly marked where a detail is still being checked."
        image={{ src: "/img/boats.jpg", alt: "" }}
        crumbs={crumbs}
      />
      <section className="section">
        <div className="shell">
          <CategoryNav categories={categories} />
          <BlogSearch q={q} />
          {q && (
            <p aria-live="polite" style={{ margin: "0 0 20px", color: "var(--muted)" }}>
              {data.total ? `${data.total} article${data.total === 1 ? "" : "s"}` : "No articles"} for “{q}” · <Link href="/blog">Clear search</Link>
            </p>
          )}
          <BlogList
            data={data}
            href={(p) => blogHref("/blog", { page: p, q })}
            empty={q ? "No articles match that search — try a shorter word." : "No articles yet — check back soon."}
          />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
