import type { PartnerStatus } from "@/content/types";

const TEXT: Record<PartnerStatus, string> = {
  verified: "✓ Verified partner",
  trial: "Partner on trial",
  pending: "Partner being onboarded",
};

/** Honest partner verification status (FR-PART). Never claims "verified" unless it is. */
export function PartnerBadge({ status }: { status: PartnerStatus }) {
  return <span className={`badge ${status === "verified" ? "badge--verified" : "badge--review"}`}>{TEXT[status]}</span>;
}
