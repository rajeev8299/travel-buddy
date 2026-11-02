import Link from "next/link";
import { PageHero } from "@/components/content";
import { BuddyApplicationClient } from "@/components/ClientOnly";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Become a Varanasi buddy",
  description: "Know Varanasi well and enjoy showing people around? Apply to be a verified local buddy — honest prices, flexible hours, travellers who value local knowledge.",
  path: "/become-a-buddy",
});

export default function BecomeABuddyPage() {
  return (
    <>
      <PageHero
        eyebrow="Join us"
        title="Become a Varanasi buddy"
        intro="Show travellers the city you know — on your own schedule. Every buddy is verified, so travellers can trust you from the first hello."
        crumbs={[{ name: "Home", path: "/" }, { name: "Become a buddy", path: "/become-a-buddy" }]}
      />
      <section className="section">
        <div className="shell" style={{ maxWidth: 820 }}>
          <div className="factbox" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.2rem", marginTop: 0 }}>How it works</h2>
            <ol style={{ paddingLeft: "1.2em", margin: 0 }}>
              <li><strong>Apply</strong> with this form — about ten minutes.</li>
              <li><strong>We call your references</strong> and, if you&apos;re shortlisted, interview you.</li>
              <li><strong>Upload your documents</strong> through a private link: photo ID, a recent photo and a police verification certificate. They&apos;re encrypted and deleted once checked.</li>
              <li><strong>Start guiding.</strong> You agree to our code of conduct: honest prices and no commission-driven shopping stops.</li>
            </ol>
            <p style={{ marginBottom: 0, marginTop: 12 }}>
              Run a boat, a car or a homestay instead? <Link href="/about/partner-with-us">Partner with us</Link>.
            </p>
          </div>
          <BuddyApplicationClient />
        </div>
      </section>
    </>
  );
}
