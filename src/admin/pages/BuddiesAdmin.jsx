import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

const EMPTY = { name: "", city: "", years: "", rating: "", tongue: "", hue: "#8E5AA8" };

export default function BuddiesAdmin() {
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/buddies")
      .then((data) => setBuddies(data.buddies))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({ name: b.name, city: b.city, years: b.years, rating: b.rating, tongue: b.tongue, hue: b.hue });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        const data = await api.put(`/admin/buddies/${editingId}`, form);
        setBuddies((list) => list.map((b) => (b.id === editingId ? data.buddy : b)));
      } else {
        const data = await api.post("/admin/buddies", form);
        setBuddies((list) => [...list, data.buddy]);
      }
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.del(`/admin/buddies/${id}`);
      setBuddies((list) => list.filter((b) => b.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Buddies</h1>

      <form className="admin-inline-form" onSubmit={onSubmit}>
        <input placeholder="Name" value={form.name} onChange={set("name")} required />
        <input placeholder="City" value={form.city} onChange={set("city")} required />
        <input placeholder="Years" type="number" min="0" value={form.years} onChange={set("years")} required />
        <input
          placeholder="Rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={form.rating}
          onChange={set("rating")}
          required
        />
        <input placeholder="Languages spoken" value={form.tongue} onChange={set("tongue")} required />
        <input type="color" value={form.hue} onChange={set("hue")} title="Avatar colour" />

        <button type="submit" className="btn btn--solid btn--sm" disabled={saving}>
          {saving ? <Loader2 size={15} className="spin" /> : editingId ? <Pencil size={15} /> : <Plus size={15} />}
          {editingId ? "Save" : "Add"}
        </button>
        {editingId && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={cancelEdit}>
            <X size={15} /> Cancel
          </button>
        )}
      </form>

      {error && <p className="admin__error">{error}</p>}
      {loading && <p>Loading…</p>}

      {!loading && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>City</th>
                <th>Years</th>
                <th>Rating</th>
                <th>Languages</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {buddies.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span className="admin-swatch" style={{ background: b.hue }} aria-hidden="true" />
                  </td>
                  <td>{b.name}</td>
                  <td>{b.city}</td>
                  <td>{b.years}</td>
                  <td>{b.rating}</td>
                  <td>{b.tongue}</td>
                  <td className="admin-table__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(b)} aria-label="Edit">
                      <Pencil size={15} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm admin-reject"
                      onClick={() => remove(b.id)}
                      aria-label="Delete"
                    >
                      <Trash2 size={15} strokeWidth={2.2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
