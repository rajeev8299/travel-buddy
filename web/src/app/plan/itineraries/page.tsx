import { HubPage } from "@/components/TopicPage";
import { ITINERARIES } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Varanasi Itineraries: 1, 2 and 3 Days",
  description: "Ready-made Varanasi itineraries — one, two and three days, spiritual, with Sarnath, for families, seniors, solo travellers and food lovers.",
  path: "/plan/itineraries",
  image: "/img/boats.jpg",
});

export default function ItinerariesHub() {
  return (
    <HubPage
      eyebrow="Itineraries"
      title="Ready-made Varanasi itineraries"
      intro="Realistic plans with walking, rest and travel time in mind. Open one and customise it in the planner."
      image={{ src: "/img/boats.jpg", alt: "" }}
      crumbs={[{ name: "Home", path: "/" }, { name: "Plan", path: "/plan" }, { name: "Itineraries", path: "/plan/itineraries" }]}
      cards={ITINERARIES.map((i) => ({ href: `/plan/itineraries/${i.slug}`, title: i.title, text: i.summary, image: i.image, kicker: `${i.days} ${i.days === 1 ? "day" : "days"} · ${i.pace} pace` }))}
    />
  );
}
