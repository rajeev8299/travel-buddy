import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { NAV, asset } from "../data";

export default function NotFound() {
  return (
    <div>
      <PageHeader
        eyebrow="404"
        title="That page took a detour"
        intro="Which is on brand, but not much help. Here's everywhere else."
        image={asset("img/goa.jpg")}
        pos="center 60%"
      />

      <section className="section">
        <div className="shell promise">
          <h2>Try one of these</h2>
          <div className="cta__actions">
            <Link className="btn btn--solid btn--lg" to="/">
              Home
            </Link>
            {NAV.map((item) => (
              <Link key={item.to} className="btn btn--outline btn--lg" to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
