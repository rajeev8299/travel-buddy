import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../auth/authContext";
import { ROLE_LABEL } from "../roles";

// Roles are granted here, never through public signup (FR-BLOG-02): authors
// write blog articles, editors review them, admins run everything.
const ROLES = ["user", "client", "author", "editor", "admin"];

/** Admin only: change an author's public address; the old one keeps redirecting. */
function ProfileAddress({ user, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState(user.profileSlug ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!user.profileSlug) return <span className="admin-hint">—</span>;
  if (!editing) {
    return (
      <span>
        <span className="admin-mono">/blog/author/{user.profileSlug}</span>{" "}
        <button type="button" className="btn btn--soft" onClick={() => setEditing(true)} aria-label={`Change profile address for ${user.fullName}`}>Change…</button>
      </span>
    );
  }
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api.put(`/editorial/authors/${user.id}/slug`, { slug });
      onChanged(user, r);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="admin-inline-form">
      <label htmlFor={`slug-${user.id}`} className="visually-hidden">New profile address for {user.fullName}</label>
      <input id={`slug-${user.id}`} className="admin-input admin-mono" value={slug} maxLength={60} onChange={(e) => setSlug(e.target.value)} />
      <button type="submit" className="btn btn--solid" disabled={busy || !slug.trim()}>Save</button>
      <button type="button" className="btn btn--soft" onClick={() => setEditing(false)}>Cancel</button>
      <span className="admin-hint">The old address will redirect to the new one.</span>
      {error && <span className="admin__error" role="alert">{error}</span>}
    </form>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api
      .get("/admin/users")
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (u, role) => {
    if (role === "admin" && !window.confirm(`Make ${u.fullName} an admin? Admins can approve and publish articles and see all leads.`)) return;
    setBusy(u.id);
    setError("");
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
      setToast(`${u.fullName} is now ${ROLE_LABEL[role].toLowerCase()}.`);
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Users</h1>
        <p className="admin-hint">
          Give blog writers the <strong>Author</strong> role and reviewers the <strong>Editor</strong> role. Both can sign in here but only see the Blog.
        </p>
      </div>

      {error && <p className="admin__error" role="alert">{error}</p>}
      {toast && <div className="admin-toast admin-toast--success" role="status">{toast}</div>}
      {loading && <p>Loading…</p>}

      {!loading && users.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Profile address</th>
                <th>City / Company</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    {u.id === me?.id ? (
                      <span className={`admin-badge admin-badge--${u.role}`} title="You can't change your own role">{ROLE_LABEL[u.role]} (you)</span>
                    ) : (
                      <select
                        className="admin-select"
                        value={u.role}
                        disabled={busy === u.id}
                        onChange={(e) => changeRole(u, e.target.value)}
                        aria-label={`Role for ${u.fullName}`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                    )}
                  </td>
                  <td>
                    <ProfileAddress
                      user={u}
                      onChanged={(user, r) => {
                        setUsers((prev) => prev.map((x) => (x.id === user.id ? { ...x, profileSlug: r.slug } : x)));
                        setToast(r.redirectFrom ? `Address changed. /blog/author/${r.redirectFrom} now redirects to /blog/author/${r.slug}.` : "Address unchanged.");
                        setTimeout(() => setToast(""), 5000);
                      }}
                    />
                  </td>
                  <td>{u.city || u.company || "—"}</td>
                  <td>{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
