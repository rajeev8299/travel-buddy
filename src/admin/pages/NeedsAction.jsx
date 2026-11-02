import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ChevronRight } from "lucide-react";
import { api } from "../../lib/api";

// "Needs action": everything waiting on the team, each item phrased as the
// next step and linked to where it's done. The tone is written out as well as
// coloured, so it doesn't rely on colour alone.
const TONE = {
  urgent: { label: "Urgent", className: "is-urgent" },
  warn: { label: "Today", className: "is-warn" },
  normal: { label: "To do", className: "is-normal" },
  info: { label: "FYI", className: "is-info" },
};
const SHOWN = 6;

function Item({ item }) {
  const tone = TONE[item.tone] ?? TONE.normal;
  const body = (
    <>
      <span className={`admin-action__tone ${tone.className}`}>{tone.label}</span>
      <span className="admin-action__text">
        <strong>{item.title}</strong>
        <span>{item.detail}</span>
      </span>
      {item.href && <ChevronRight size={16} aria-hidden="true" className="admin-action__go" />}
    </>
  );
  return (
    <li className={`admin-action ${tone.className}`}>
      {item.href ? <Link to={item.href}>{body}</Link> : <div>{body}</div>}
    </li>
  );
}

function Group({ group }) {
  const [all, setAll] = useState(false);
  const urgent = group.items.filter((i) => i.tone === "urgent").length;
  const items = all ? group.items : group.items.slice(0, SHOWN);
  return (
    <section className="admin-actions-group" aria-labelledby={`na-${group.key}`} id={`needs-${group.key}`}>
      <h3 id={`na-${group.key}`}>
        {group.title} <span className="admin-count">{group.items.length}</span>
        {urgent > 0 && <span className="admin-count is-urgent">{urgent} urgent</span>}
      </h3>
      {group.items.length === 0 ? (
        <p className="admin-hint">{group.empty}</p>
      ) : (
        <>
          <ul className="admin-actions-list">{items.map((i) => <Item key={i.id} item={i} />)}</ul>
          {group.items.length > SHOWN && (
            <button type="button" className="btn btn--soft" onClick={() => setAll(!all)} aria-expanded={all}>
              {all ? "Show fewer" : `Show all ${group.items.length}`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default function NeedsAction() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/actions")
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const total = data?.groups.reduce((n, g) => n + g.items.filter((i) => i.tone !== "info").length, 0) ?? 0;
  const urgent = data?.groups.reduce((n, g) => n + g.items.filter((i) => i.tone === "urgent").length, 0) ?? 0;

  return (
    <section className="admin-card admin-needs" aria-labelledby="needs-title">
      <div className="admin-needs__head">
        <h2 id="needs-title">Needs action</h2>
        {data && (
          <p className="admin-hint" role="status">
            {total === 0 ? "You're all caught up." : `${total} to do${urgent ? `, ${urgent} urgent` : ""}.`} Updated{" "}
            {new Date(data.generatedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}.
          </p>
        )}
        <button type="button" className="btn btn--soft" onClick={load} disabled={loading} aria-label="Refresh the action list">
          <RefreshCw size={15} aria-hidden="true" /> Refresh
        </button>
      </div>
      {error && <div className="admin-toast admin-toast--error" role="alert">{error}</div>}
      {!data && !error && <p>Loading…</p>}
      {data && (
        <>
          <nav className="admin-filters" aria-label="Jump to a group">
            {data.groups.map((g) => (
              <a key={g.key} href={`#needs-${g.key}`} onClick={(e) => { e.preventDefault(); document.getElementById(`needs-${g.key}`)?.scrollIntoView({ block: "start" }); }}>
                {g.title} ({g.items.length})
              </a>
            ))}
          </nav>
          <div className="admin-actions-groups">
            {data.groups.map((g) => <Group key={g.key} group={g} />)}
          </div>
        </>
      )}
    </section>
  );
}
