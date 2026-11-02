import Link from "next/link";

/** The site's two standard next steps: plan it yourself, or ask a local.
 *  "Get local help" carries the page title, so the enquiry says what it's about. */
export function NextStep({ context, title = "Ready to plan?" }: { context?: string; title?: string }) {
  const help = `/enquiry?service=assistance${context ? `&context=${encodeURIComponent(context)}` : ""}`;
  return (
    <section className="next-step" aria-labelledby="next-step-title">
      <div className="shell next-step__inner">
        <div>
          <h2 id="next-step-title">{title}</h2>
          <p>Build a day-by-day plan in a few minutes, or tell a local what you need. Free to ask — nothing is booked until you accept a quote.</p>
        </div>
        <div className="btn-row">
          <Link className="btn btn--primary" href="/plan/trip-planner">Plan my trip</Link>
          <Link className="btn btn--outline" href={help}>Get local help</Link>
        </div>
      </div>
    </section>
  );
}
