import { HubPage } from "@/components/TopicPage";
import { SHOPPING } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Shopping in Varanasi: Banarasi Silk & Crafts",
  description: "How to buy Banarasi silk, brocade, handicrafts and souvenirs in Varanasi — authenticity, bargaining etiquette and supporting real artisans.",
  path: "/shopping",
  image: "/img/banaras_silk.jpg",
});

export default function ShoppingHub() {
  return (
    <HubPage
      eyebrow="Shopping guide"
      title="Shopping in Varanasi"
      intro="Banarasi silk, brocade and crafts — how they're made, how to recognise the real thing, and how to buy fairly."
      image={{ src: "/img/banaras_silk.jpg", alt: "" }}
      crumbs={[{ name: "Home", path: "/" }, { name: "Food & Shopping", path: "/food-and-shopping" }, { name: "Shopping", path: "/shopping" }]}
      cards={SHOPPING.map((s) => ({ href: `/shopping/${s.slug}`, title: s.title, text: s.summary, image: s.image }))}
    >
      <p className="notice notice--info" style={{ marginBottom: 28 }}>We don&apos;t certify or endorse shops. Our guides help you judge quality and price for yourself.</p>
    </HubPage>
  );
}
