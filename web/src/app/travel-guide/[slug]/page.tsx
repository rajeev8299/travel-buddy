import { notFound } from "next/navigation";
import TopicPage from "@/components/TopicPage";
import { GUIDES } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));
const get = (slug: string) => GUIDES.find((g) => g.slug === slug);

export async function generateMetadata({ params }: PageProps<"/travel-guide/[slug]">) {
  const g = get((await params).slug);
  if (!g) return {};
  return pageMeta({ title: g.seoTitle ?? `${g.title} — Varanasi travel guide`, description: g.seoDescription ?? g.summary, path: `/travel-guide/${g.slug}`, image: g.image?.src, noindex: g.status !== "published" });
}

export default async function GuidePage({ params }: PageProps<"/travel-guide/[slug]">) {
  const g = get((await params).slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.group === g.group && x.slug !== g.slug).slice(0, 3);
  return (
    <TopicPage
      entry={g}
      eyebrow="Travel guide"
      crumbs={[{ name: "Home", path: "/" }, { name: "Travel Guide", path: "/travel-guide" }, { name: g.title, path: `/travel-guide/${g.slug}` }]}
      sections={g.sections}
      body={g.slug === "emergency" ? (
        <div className="notice notice--warn" style={{ marginBottom: 24 }} role="note">
          <span aria-hidden="true">!</span>
          <div><strong>In an emergency, call 112</strong>India&apos;s single emergency number for police, fire and ambulance. Other numbers below are being verified — confirm them with your hotel.</div>
        </div>
      ) : undefined}
      cta={{ title: "Need help on the ground?", text: "Tell us what you need — transfers, a guide, or help planning around seniors and children.", href: `/enquiry?service=assistance&context=${encodeURIComponent(g.title)}`, label: "Get local help" }}
      related={others.map((x) => ({ href: `/travel-guide/${x.slug}`, title: x.title, text: x.summary, image: x.image }))}
      relatedTitle="More in the travel guide"
    />
  );
}
