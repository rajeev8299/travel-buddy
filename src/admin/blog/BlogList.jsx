import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, UserRound } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../auth/authContext";
import { StateBadge, when } from "./shared";

// Blog articles (FR-BLOG-02…04). Authors see their own; editors and admins
// see everything, grouped by whose turn it is.
const GROUPS = {
  all: { label: "All", states: null },
  writing: { label: "Being written", states: ["draft", "changes_requested"] },
  review: { label: "In review", states: ["submitted", "in_review", "fact_check"] },
  approval: { label: "Awaiting approval", states: ["verified"] },
  ready: { label: "Approved / scheduled", states: ["approved", "scheduled"] },
  live: { label: "Live", live: true },
  archived: { label: "Archived", archived: true },
};

const inGroup = (p, g) => (g.live ? p.live : g.archived ? p.archived : !g.states || g.states.includes(p.latest.state));

export default function BlogList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [group, setGroup] = useState("all");
  const [mine, setMine] = useState(user.role === "author");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get(`/editorial/posts${mine ? "?mine=1" : ""}`)
      .then((d) => setPosts(d.posts))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mine]);

  const counts = useMemo(() => Object.fromEntries(Object.entries(GROUPS).map(([k, g]) => [k, posts.filter((p) => inGroup(p, g)).length])), [posts]);
  const shown = posts.filter((p) => inGroup(p, GROUPS[group]));

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const r = await api.post("/editorial/posts", { title });
      navigate(`/admin/blog/${r.postId}/${r.revisionId}`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h1>{user.role === "author" ? "My articles" : "Blog"}</h1>
          <p className="admin-hint">
            Draft → submitted → editorial review → fact check → admin approval → published. Nothing reaches the website until a second person has
            approved it.
          </p>
        </div>
        <Link to="/admin/blog/profile" className="btn btn--soft"><UserRound size={15} aria-hidden="true" /> My profile</Link>
      </div>

      <form className="admin-card admin-inline-form" onSubmit={create}>
        <label htmlFor="new-title">Start a new article</label>
        <input id="new-title" className="admin-input" maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Working title, e.g. Your first evening at the ghats" />
        <button type="submit" className="btn btn--solid" disabled={creating || title.trim().length < 5}>
          <Plus size={15} aria-hidden="true" /> {creating ? "Creating…" : "Create draft"}
        </button>
      </form>

      <div className="admin-toolbar" style={{ marginTop: 20 }}>
        <div className="admin-filters" role="group" aria-label="Filter articles">
          {Object.entries(GROUPS).map(([k, g]) => (
            <button key={k} type="button" className={group === k ? "is-active" : ""} aria-pressed={group === k} onClick={() => setGroup(k)}>
              {g.label}{counts[k] ? ` (${counts[k]})` : ""}
            </button>
          ))}
        </div>
        {user.role !== "author" && (
          <label className="admin-check">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Only mine
          </label>
        )}
      </div>

      {error && <div className="admin-toast admin-toast--error" role="alert">{error}</div>}
      {loading && <p>Loading articles…</p>}
      {!loading && shown.length === 0 && <p className="admin__empty">No articles here yet.</p>}

      {!loading && shown.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--blog">
            <caption className="visually-hidden">Blog articles</caption>
            <thead>
              <tr>
                <th scope="col">Article</th>
                <th scope="col">Author</th>
                <th scope="col">Status</th>
                <th scope="col">Last change</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/admin/blog/${p.id}/${p.latest.id}`}><strong>{p.latest.title || "Untitled"}</strong></Link>
                    <div className="admin-sub admin-mono">/blog/{p.slug}</div>
                  </td>
                  <td>{p.author}{p.mine ? " (you)" : ""}</td>
                  <td>
                    <StateBadge state={p.latest.state} />
                    {p.live && p.latest.state !== "published" && <span className="admin-badge admin-badge--state-good"> Live version online</span>}
                    {p.archived && <span className="admin-badge admin-badge--state-muted"> Archived</span>}
                    {p.latest.state === "scheduled" && <div className="admin-sub">Goes live {when(p.latest.scheduledFor)}</div>}
                  </td>
                  <td>{when(p.latest.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
