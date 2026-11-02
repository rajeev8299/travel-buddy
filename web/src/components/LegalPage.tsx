import { PageHero } from "./content";
import { readLegal } from "@/lib/legal";

export default function LegalPage({ file, path }: { file: "privacy" | "terms" | "refund-policy"; path: string }) {
  const doc = readLegal(file);
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} crumbs={[{ name: "Home", path: "/" }, { name: doc.title, path }]} />
      <section className="section">
        <div className="shell">
          {doc.draft && (
            <div className="notice notice--review" style={{ marginBottom: 24, maxWidth: "72ch" }} role="note">
              <span aria-hidden="true">ⓘ</span>
              <div><strong>Draft</strong>The highlighted details still need filling in before this page goes live.</div>
            </div>
          )}
          {/* Trusted, repo-authored HTML (content/legal). */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </div>
      </section>
    </>
  );
}
