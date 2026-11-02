import { notFound } from "next/navigation";
import TopicPage from "@/components/TopicPage";
import { MARKETS } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => MARKETS.map((m) => ({ slug: m.slug }));
const get = (slug: string) => MARKETS.find((m) => m.slug === slug);

export async function generateMetadata({ params }: PageProps<"/markets/[slug]">) {
  const m = get((await params).slug);
  if (!m) return {};
  return pageMeta({ title: `${m.title} market, Varanasi`, description: m.summary, path: `/markets/${m.slug}`, image: m.image?.src, noindex: m.status !== "published" });
}

export default async function MarketPage({ params }: PageProps<"/markets/[slug]">) {
  const m = get((await params).slug);
  if (!m) notFound();
  return (
    <TopicPage
      entry={m}
      eyebrow="Market"
      crumbs={[{ name: "Home", path: "/" }, { name: "Markets", path: "/markets" }, { name: m.title, path: `/markets/${m.slug}` }]}
      sections={m.sections}
      lists={[{ title: "Known for", items: m.knownFor }, { title: "Tips", items: m.tips }]}
      cta={{ title: "Explore with a local", text: "A market walk with a local guide helps you find genuine workshops and fair prices.", href: "/things-to-do/market-exploration", label: "Market exploration" }}
      related={MARKETS.filter((x) => x.slug !== m.slug).slice(0, 3).map((x) => ({ href: `/markets/${x.slug}`, title: x.title, text: x.summary, image: x.image }))}
      relatedTitle="Other markets"
    />
  );
}
