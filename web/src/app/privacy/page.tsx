import LegalPage from "@/components/LegalPage";
import { readLegal } from "@/lib/legal";
import { pageMeta } from "@/lib/site";

const doc = readLegal("privacy");
export const metadata = pageMeta({ title: doc.title, description: doc.description, path: "/privacy", noindex: doc.draft });

export default function Page() {
  return <LegalPage file="privacy" path="/privacy" />;
}
