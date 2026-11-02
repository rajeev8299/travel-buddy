import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { AuthorFacts, BlogList, blogHref } from "@/components/blog";
import { JsonLd, PageHero } from "@/components/content";
import { getAuthor, listPosts, mediaSrc, pageParam, withFeed } from "@/lib/blog";
import { SITE_URL, breadcrumbLd, pageMeta } from "@/lib/site";

export async function generateMetadata({ params, searchParams }: PageProps<"/blog/author/[slug]">) {
  const res = await getAuthor((await params).slug);
  if (!res || "redirectTo" in res) notFound(); // the page itself redirects
  const page = pageParam((await searchParams).page);
  return withFeed(pageMeta({
    title: `${res.author.name} — Varanasi Travel Blog${page > 1 ? ` (page ${page})` : ""}`,
    description: res.author.bio || `Varanasi travel articles by ${res.author.name}.`,
    path: blogHref(`/blog/author/${res.author.slug}`, { page }),
  }));
}

export default async function BlogAuthorPage({ params, searchParams }: PageProps<"/blog/author/[slug]">) {
  const { slug } = await params;
  const page = pageParam((await searchParams).page);
  // The API 404s an author with no live posts.
  const [res, data] = await Promise.all([getAuthor(slug), listPosts({ page, author: slug })]);
  // An admin changed this author's address: old links keep working.
  if (res && "redirectTo" in res) permanentRedirect(`/blog/author/${encodeURIComponent(res.redirectTo)}`);
  if (!res || (data.total > 0 && page > data.pages)) notFound();
  const { author } = res;
  const base = `/blog/author/${author.slug}`;
  const crumbs = [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: author.name, path: base }];

  return (
    <>
      <PageHero eyebrow="Author" title={author.name} intro={author.bio ?? undefined} crumbs={crumbs}>
        {author.avatarUrl && (
          <Image src={mediaSrc(author.avatarUrl)} alt="" width={72} height={72} unoptimized className="blog-author__avatar" style={{ marginTop: 16, objectPosition: author.avatarPos ?? undefined }} />
        )}
        <div className="blog-author__hero-facts"><AuthorFacts author={author} /></div>
      </PageHero>
      <section className="section">
        <div className="shell">
          <h2 style={{ marginBottom: 20 }}>Articles by {author.name}</h2>
          <BlogList data={data} href={(p) => blogHref(base, { page: p })} />
        </div>
      </section>
      <JsonLd
        data={{
          "@graph": [
            { "@type": "ProfilePage", url: `${SITE_URL}${base}`, mainEntity: { "@type": "Person", name: author.name, description: author.bio ?? undefined } },
            breadcrumbLd(crumbs),
          ],
        }}
      />
    </>
  );
}
