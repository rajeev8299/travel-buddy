import { notFound } from "next/navigation";
import TopicPage from "@/components/TopicPage";
import { MARKETS, SHOPPING } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => SHOPPING.map((s) => ({ slug: s.slug }));
const get = (slug: string) => SHOPPING.find((s) => s.slug === slug);

export async function generateMetadata({ params }: PageProps<"/shopping/[slug]">) {
  const s = get((await params).slug);
  if (!s) return {};
  return pageMeta({ title: s.seoTitle ?? `${s.title} — Varanasi`, description: s.summary, path: `/shopping/${s.slug}`, image: s.image?.src, noindex: s.status !== "published" });
}

export default async function ShoppingPage({ params }: PageProps<"/shopping/[slug]">) {
  const s = get((await params).slug);
  if (!s) notFound();
  return (
    <TopicPage
      entry={s}
      eyebrow="Shopping guide"
      crumbs={[{ name: "Home", path: "/" }, { name: "Shopping", path: "/shopping" }, { name: s.title, path: `/shopping/${s.slug}` }]}
      sections={s.sections}
      related={MARKETS.slice(0, 3).map((m) => ({ href: `/markets/${m.slug}`, title: m.title, text: m.summary, image: m.image, kicker: "Market" }))}
      relatedTitle="Where to shop"
    />
  );
}
