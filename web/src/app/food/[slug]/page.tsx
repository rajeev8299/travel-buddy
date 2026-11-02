import { notFound } from "next/navigation";
import TopicPage from "@/components/TopicPage";
import { FOOD } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => FOOD.map((f) => ({ slug: f.slug }));
const get = (slug: string) => FOOD.find((f) => f.slug === slug);

export async function generateMetadata({ params }: PageProps<"/food/[slug]">) {
  const f = get((await params).slug);
  if (!f) return {};
  return pageMeta({ title: `${f.title} — Varanasi food guide`, description: f.summary, path: `/food/${f.slug}`, image: f.image?.src, noindex: f.status !== "published" });
}

export default async function FoodPage({ params }: PageProps<"/food/[slug]">) {
  const f = get((await params).slug);
  if (!f) notFound();
  return (
    <TopicPage
      entry={f}
      eyebrow="Food guide"
      crumbs={[{ name: "Home", path: "/" }, { name: "Food", path: "/food" }, { name: f.title, path: `/food/${f.slug}` }]}
      sections={f.sections}
      lists={[{ title: "Tips", items: f.tips }]}
      factTitle="At a glance"
      facts={[
        { label: "When", value: f.availability },
        { label: "Dietary notes", value: f.dietary },
        { label: "Where to look", value: f.whereToFind },
      ]}
      cta={{ title: "Eat with a local", text: "A food walk with a local host takes you to busy, trusted stalls.", href: "/things-to-do/food-walks", label: "Food walks" }}
      related={FOOD.filter((x) => x.slug !== f.slug).slice(0, 3).map((x) => ({ href: `/food/${x.slug}`, title: x.title, text: x.summary, image: x.image }))}
      relatedTitle="More to try"
    />
  );
}
