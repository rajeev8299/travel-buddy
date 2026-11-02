"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { decodePlan } from "@/lib/planner";
import PlanView from "./PlanView";

export default function SharedTrip() {
  const d = useSearchParams().get("d");
  const plan = d ? decodePlan(d) : null;
  if (!plan) {
    return (
      <div className="empty">
        <p>This link doesn&apos;t contain a valid plan.</p>
        <p style={{ marginTop: 12 }}><Link className="btn btn--primary" href="/plan/trip-planner">Plan a trip</Link></p>
      </div>
    );
  }
  return (
    <>
      <PlanView plan={plan} />
      <div className="btn-row" style={{ marginTop: 24 }}>
        <Link className="btn btn--primary" href={`/plan/trip-planner?d=${d}`}>Open in the planner</Link>
      </div>
    </>
  );
}
