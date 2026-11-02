import LegalPage from "@/components/LegalPage";
import { readLegal } from "@/lib/legal";
import { pageMeta } from "@/lib/site";

const doc = readLegal("refund-policy");
export const metadata = pageMeta({ title: doc.title, description: doc.description, path: "/cancellation-policy", noindex: doc.draft });

export default function Page() {
  return <LegalPage file="refund-policy" path="/cancellation-policy" />;
}
