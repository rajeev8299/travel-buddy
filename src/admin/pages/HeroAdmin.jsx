import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, ImageUp, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

function SlideCard({ slide, index, count, onMove, onSave, onDelete }) {
  const [pos, setPos] = useState(slide.pos);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const savePos = async () => {
    if (pos === slide.pos) return;
    setBusy(true);
    try {
      await onSave(slide.id, { pos });
    } finally {
      setBusy(false);
    }
  };

  const replaceImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await onSave(slide.id, { pos, file });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="admin-slide">
      <div className="admin-slide__thumb">
        <img src={slide.src} alt="" />
        <span className={`admin-badge admin-badge--${slide.source}`}>{slide.source}</span>
      </div>

      <div className="admin-slide__row">
        <input value={pos} onChange={(e) => setPos(e.target.value)} onBlur={savePos} placeholder="center 50%" />
        {busy && <Loader2 size={15} className="spin" />}
      </div>

      <div className="admin-slide__row">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onMove(index, -1)} disabled={index === 0}>
          <ArrowLeft size={14} />
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onMove(index, 1)}
          disabled={index === count - 1}
        >
          <ArrowRight size={14} />
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
          <ImageUp size={14} /> Replace
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={replaceImage} />
        <button type="button" className="btn btn--ghost btn--sm admin-reject" onClick={() => onDelete(slide.id)}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function HeroAdmin() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPos, setNewPos] = useState("center 50%");
  const [adding, setAdding] = useState(false);
  const newFileRef = useRef(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/hero-slides")
      .then((data) => setSlides(data.slides))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveSlide = async (id, { pos, file }) => {
    setError("");
    try {
      const form = new FormData();
      form.append("pos", pos);
      if (file) form.append("image", file);
      const data = await api.put(`/admin/hero-slides/${id}`, form);
      setSlides((list) => list.map((s) => (s.id === id ? data.slide : s)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSlide = async (id) => {
    setError("");
    try {
      await api.del(`/admin/hero-slides/${id}`);
      setSlides((list) => list.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const move = async (index, dir) => {
    const next = [...slides];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    try {
      await api.put("/admin/hero-slides/reorder", { order: next.map((s) => s.id) });
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const addSlide = async (e) => {
    e.preventDefault();
    const file = newFileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image file first.");
      return;
    }
    setError("");
    setAdding(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("pos", newPos);
      const data = await api.post("/admin/hero-slides", form);
      setSlides((list) => [...list, data.slide]);
      setNewPos("center 50%");
      if (newFileRef.current) newFileRef.current.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <h1>Homepage Hero Photos</h1>
      <p className="admin-hint">
        These are the rotating background photos on the homepage. "Position" is a CSS
        object-position value (e.g. <code>center 50%</code>) — it controls which part of the
        photo stays in frame on a wide screen.
      </p>

      <form className="admin-inline-form" onSubmit={addSlide}>
        <input ref={newFileRef} type="file" accept="image/jpeg,image/png,image/webp" required />
        <input placeholder="Position (e.g. center 50%)" value={newPos} onChange={(e) => setNewPos(e.target.value)} />
        <button type="submit" className="btn btn--solid btn--sm" disabled={adding}>
          {adding ? <Loader2 size={15} className="spin" /> : <Plus size={15} />}
          Add photo
        </button>
      </form>

      {error && <p className="admin__error">{error}</p>}
      {loading && <p>Loading…</p>}

      {!loading && (
        <div className="admin-slides">
          {slides.map((slide, i) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              index={i}
              count={slides.length}
              onMove={move}
              onSave={saveSlide}
              onDelete={deleteSlide}
            />
          ))}
        </div>
      )}
    </div>
  );
}
