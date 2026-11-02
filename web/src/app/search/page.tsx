import { Suspense } from "react";
import { PageHero } from "@/components/content";
import SearchClient from "@/components/SearchClient";
import { blogSearchDocs, getBlogIndex } from "@/lib/blog";
import { searchIndex } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Search Varanasi Trip Companion",
  description: "Search places, guides, experiences, services, festivals, itineraries and blog articles for Varanasi.",
  path: "/search",
  noindex: true,
});

export default async function SearchPage() {
  // Live blog posts join the static index; if the API is down (or this is the
  // build), search still covers everything else.
  const posts = await getBlogIndex().catch(() => []);
  const docs = [...searchIndex(), ...blogSearchDocs(posts)];
  return (
    <>
      <PageHero eyebrow="Search" title="Search Varanasi" intro="Places, things to do, itineraries, festivals, food, services, travel guides and blog articles." crumbs={[{ name: "Home", path: "/" }, { name: "Search", path: "/search" }]} />
      <section className="section">
        <div className="shell" style={{ maxWidth: 900 }}>
          <Suspense fallback={null}>
            <SearchClient docs={docs} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
