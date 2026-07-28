import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

const EMPTY = { quote: "", name: "", trip: "" };

export default function StoriesAdmin() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/stories")
      .then((data) => setStories(data.stories))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({ quote: s.quote, name: s.name, trip: s.trip });
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
        const data = await api.put(`/admin/stories/${editingId}`, form);
        setStories((list) => list.map((s) => (s.id === editingId ? data.story : s)));
      } else {
        const data = await api.post("/admin/stories", form);
        setStories((list) => [...list, data.story]);
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
      await api.del(`/admin/stories/${id}`);
      setStories((list) => list.filter((s) => s.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Stories</h1>

      <form className="admin-inline-form admin-inline-form--stack" onSubmit={onSubmit}>
        <input placeholder="Traveller name" value={form.name} onChange={set("name")} required />
        <input placeholder="Trip (e.g. Jaipur, 3 days)" value={form.trip} onChange={set("trip")} required />
        <textarea placeholder="Quote" rows={3} value={form.quote} onChange={set("quote")} required />

        <div>
          <button type="submit" className="btn btn--solid btn--sm" disabled={saving}>
            {saving ? <Loader2 size={15} className="spin" /> : editingId ? <Pencil size={15} /> : <Plus size={15} />}
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={cancelEdit}>
              <X size={15} /> Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="admin__error">{error}</p>}
      {loading && <p>Loading…</p>}

      {!loading && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quote</th>
                <th>Name</th>
                <th>Trip</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id}>
                  <td className="admin-table__quote">{s.quote}</td>
                  <td>{s.name}</td>
                  <td>{s.trip}</td>
                  <td className="admin-table__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(s)} aria-label="Edit">
                      <Pencil size={15} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm admin-reject"
                      onClick={() => remove(s.id)}
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
