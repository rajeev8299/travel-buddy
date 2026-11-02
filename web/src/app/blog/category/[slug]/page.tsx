import { notFound } from "next/navigation";
import { BlogList, CategoryNav, blogHref } from "@/components/blog";
import { JsonLd, PageHero } from "@/components/content";
import { getCategories, listPosts, pageParam, withFeed } from "@/lib/blog";
import { breadcrumbLd, pageMeta } from "@/lib/site";

const find = async (slug: string) => (await getCategories()).find((c) => c.slug === slug);

export async function generateMetadata({ params, searchParams }: PageProps<"/blog/category/[slug]">) {
  const c = await find((await params).slug);
  if (!c) notFound();
  const page = pageParam((await searchParams).page);
  return withFeed(pageMeta({
    title: `${c.name} — Varanasi Travel Blog${page > 1 ? ` (page ${page})` : ""}`,
    description: c.description || `Articles about ${c.name.toLowerCase()} in Varanasi.`,
    path: blogHref(`/blog/category/${c.slug}`, { page }),
    // A category with nothing published yet is an empty page.
    noindex: c.count === 0,
  }));
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps<"/blog/category/[slug]">) {
  const { slug } = await params;
  const page = pageParam((await searchParams).page);
  const [categories, data] = await Promise.all([getCategories(), listPosts({ page, category: slug })]);
  const c = categories.find((x) => x.slug === slug);
  if (!c || (data.total > 0 && page > data.pages)) notFound();
  const base = `/blog/category/${c.slug}`;
  const crumbs = [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: c.name, path: base }];

  return (
    <>
      <PageHero eyebrow="Blog category" title={c.name} intro={c.description ?? undefined} crumbs={crumbs} />
      <section className="section">
        <div className="shell">
          <CategoryNav categories={categories} current={c.slug} />
          <BlogList data={data} href={(p) => blogHref(base, { page: p })} empty="No articles in this category yet — check back soon." />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
