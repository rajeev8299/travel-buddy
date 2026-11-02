import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle, postLd } from "@/components/blog";
import { JsonLd } from "@/components/content";
import { absoluteMedia, getPost, withFeed } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// No generateStaticParams: posts come from the API, which isn't reachable
// during the build, so articles render on demand (data cached for 60s).

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const res = await getPost((await params).slug);
  if (!res) notFound();
  const { post } = res;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = absoluteMedia(post.cover?.url ?? "/img/boats.jpg");
  return withFeed({
    title,
    description,
    alternates: { canonical: url },
    authors: [{ name: post.author.name, url: `${SITE_URL}/blog/author/${post.author.slug}` }],
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_IN",
      title,
      description,
      url,
      images: [{ url: image, alt: post.cover?.alt || undefined }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [`${SITE_URL}/blog/author/${post.author.slug}`],
      section: post.category?.name,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const res = await getPost((await params).slug);
  if (!res) notFound();
  return (
    <>
      <PostArticle post={res.post} related={res.related} />
      <JsonLd data={postLd(res.post)} />
    </>
  );
}
