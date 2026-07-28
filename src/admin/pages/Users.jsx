import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/users")
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Users</h1>

      {error && <p className="admin__error">{error}</p>}
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
                    <span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span>
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
