import { PageHero } from "@/components/content";
import { BuddyVerificationClient } from "@/components/ClientOnly";
import { pageMeta } from "@/lib/site";

// Private: reached only through the link we send a shortlisted buddy. Not
// indexed, and no Referer leaves the page.
export const metadata = {
  ...pageMeta({ title: "Complete your buddy application", description: "Upload your documents and complete your details.", path: "/buddy-verification", noindex: true }),
  referrer: "no-referrer" as const,
};

export default function BuddyVerificationPage() {
  return (
    <>
      <PageHero eyebrow="Buddy application" title="Complete your application" intro="Upload your documents and finish your details — it takes about ten minutes." />
      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <BuddyVerificationClient />
        </div>
      </section>
    </>
  );
}
