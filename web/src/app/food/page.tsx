import { HubPage } from "@/components/TopicPage";
import { FOOD } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Varanasi Food Guide: What to Eat",
  description: "Banarasi kachori-sabzi, tamatar chaat, malaiyo, lassi, thandai, paan and sweets — what each is, when it's available and dietary cautions.",
  path: "/food",
  image: "/img/street_food.jpg",
});

export default function FoodHub() {
  return (
    <HubPage
      eyebrow="Food guide"
      title="Banarasi food you cannot miss"
      intro="Banaras eats in its lanes. What to try, when it's in season, and practical tips for eating well and safely."
      image={{ src: "/img/street_food.jpg", alt: "" }}
      crumbs={[{ name: "Home", path: "/" }, { name: "Food & Shopping", path: "/food-and-shopping" }, { name: "Food", path: "/food" }]}
      cards={FOOD.map((f) => ({ href: `/food/${f.slug}`, title: f.title, text: f.summary, image: f.image, kicker: f.availability }))}
    >
      <p className="notice notice--info" style={{ marginBottom: 28 }}>We describe dishes and the areas known for them. We don&apos;t list or rate individual stalls or restaurants.</p>
    </HubPage>
  );
}
