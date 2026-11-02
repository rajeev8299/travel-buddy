import { HubPage } from "@/components/TopicPage";
import { MARKETS } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Markets in Varanasi",
  description: "Godowlia, Vishwanath Gali, Chowk, Thatheri Bazaar, Madanpura and Lahurabir — what each market is known for, and tips for shopping there.",
  path: "/markets",
  image: "/img/market.jpg",
});

export default function MarketsHub() {
  return (
    <HubPage
      eyebrow="Markets"
      title="Markets of Varanasi"
      intro="Where the city has traded for centuries — what each market is known for and how to shop there comfortably."
      image={{ src: "/img/market.jpg", alt: "" }}
      crumbs={[{ name: "Home", path: "/" }, { name: "Food & Shopping", path: "/food-and-shopping" }, { name: "Markets", path: "/markets" }]}
      cards={MARKETS.map((m) => ({ href: `/markets/${m.slug}`, title: m.title, text: m.summary, image: m.image }))}
    />
  );
}
