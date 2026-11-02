import { CardGrid, JsonLd, PageHero } from "@/components/content";
import { FESTIVALS } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/site";
import { NextStep } from "@/components/NextStep";

export const metadata = pageMeta({
  title: "Festivals in Varanasi",
  description: "Dev Deepawali, Mahashivratri, Holi, the Ramnagar Ramlila and more — what happens, where, crowd levels and how to plan. Dates shown only when confirmed.",
  path: "/festivals",
  image: "/img/dev_diwali.jpg",
});

export default function FestivalsPage() {
  const crumbs = [{ name: "Home", path: "/" }, { name: "Festivals & Culture", path: "/festivals" }];
  return (
    <>
      <PageHero
        eyebrow="Festivals & culture"
        title="Festivals and celebrations in Varanasi"
        intro="When the whole city celebrates — what each festival means, where to experience it, and how to plan around the crowds."
        image={{ src: "/img/dev_diwali.jpg", alt: "" }}
        crumbs={crumbs}
      />
      <section className="section">
        <div className="shell">
          <p className="notice notice--info" style={{ marginBottom: 28 }}>
            Festival dates follow the Hindu lunar calendar and change every year. We show a date only once it is officially confirmed — until then you&apos;ll see the typical season.
          </p>
          <CardGrid
            cards={FESTIVALS.map((f) => ({
              href: `/festivals/${f.slug}`, title: f.title, text: f.summary, image: f.image, kicker: f.season,
              meta: <span>Crowds: {f.crowd}</span>,
            }))}
          />
        </div>
      </section>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <NextStep />
    </>
  );
}
