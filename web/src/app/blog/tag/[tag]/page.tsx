import { notFound } from "next/navigation";
import { BlogList, blogHref } from "@/components/blog";
import { JsonLd, PageHero } from "@/components/content";
import { decodeParam, listPosts, pageParam, tagPath, withFeed } from "@/lib/blog";
import { breadcrumbLd, pageMeta } from "@/lib/site";

export async function generateMetadata({ params, searchParams }: PageProps<"/blog/tag/[tag]">) {
  const tag = decodeParam((await params).tag);
  const page = pageParam((await searchParams).page);
  return withFeed(pageMeta({
    title: `Articles tagged “${tag}” — Varanasi Travel Blog${page > 1 ? ` (page ${page})` : ""}`,
    description: `Varanasi travel articles tagged “${tag}”.`,
    path: blogHref(tagPath(tag), { page }),
  }));
}

export default async function BlogTagPage({ params, searchParams }: PageProps<"/blog/tag/[tag]">) {
  const tag = decodeParam((await params).tag);
  const page = pageParam((await searchParams).page);
  const data = await listPosts({ page, tag });
  // Tags only exist through live posts: none → no page.
  if (!data.total || page > data.pages) notFound();
  const crumbs = [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: `#${tag}`, path: tagPath(tag) }];

  return (
    <>
      <PageHero eyebrow="Blog tag" title={`Articles tagged “${tag}”`} intro={`${data.total} article${data.total === 1 ? "" : "s"}`} crumbs={crumbs} />
      <section className="section">
        <div className="shell">
          <BlogList data={data} href={(p) => blogHref(tagPath(tag), { page: p })} />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
    </>
  );
}
