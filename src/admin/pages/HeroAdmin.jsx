import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, ImageUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";

function SlideCard({ slide, index, count, onMove, onSave, onDelete, disabled }) {
  const [pos, setPos] = useState(slide.pos);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  // Sync if parent updates slide.pos
  useEffect(() => {
    setPos(slide.pos);
  }, [slide.pos]);

  const savePos = async () => {
    const trimmed = (pos || "").trim();
    if (trimmed === slide.pos || !trimmed) return;
    setBusy(true);
    try {
      await onSave(slide.id, { pos: trimmed });
    } catch {
      // Revert to original if rejected
      setPos(slide.pos);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
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
      {/* 1. Image preview at the top with badge overlay */}
      <div className="admin-slide__thumb">
        <img
          src={slide.src}
          alt={`Hero slide #${index + 1}`}
          style={{ objectPosition: pos || "center 50%" }}
        />
        <span className={`admin-badge admin-badge--${slide.source}`}>
          {slide.source === "static" ? "Default Asset" : "Custom Upload"}
        </span>
      </div>

      {/* 2. Image focal-position input below the image */}
      <div className="admin-slide__field">
        <label htmlFor={`pos-${slide.id}`} className="admin-slide__label">
          Focal Position (CSS object-position)
        </label>
        <div className="admin-slide__input-wrap">
          <input
            id={`pos-${slide.id}`}
            value={pos}
            onChange={(e) => setPos(e.target.value)}
            onBlur={savePos}
            onKeyDown={handleKeyDown}
            placeholder="e.g. center 50%"
            disabled={busy || disabled}
            aria-label="Image focal position"
          />
          {busy && <Loader2 size={15} className="spin" aria-hidden="true" />}
        </div>
      </div>

      {/* 3. Action toolbar at the bottom: Move Left, Move Right, Replace, Delete */}
      <div className="admin-slide__toolbar">
        <div className="admin-slide__nav-group">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onMove(index, -1)}
            disabled={index === 0 || busy || disabled}
            title="Move Left"
            aria-label="Move slide left"
          >
            <ArrowLeft size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onMove(index, 1)}
            disabled={index === count - 1 || busy || disabled}
            title="Move Right"
            aria-label="Move slide right"
          >
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="admin-slide__action-group">
          <button
            type="button"
            className="btn btn--replace"
            onClick={() => fileRef.current?.click()}
            disabled={busy || disabled}
            title="Replace image file"
            aria-label="Replace this slide image"
          >
            <ImageUp size={14} aria-hidden="true" />
            <span>Replace</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={replaceImage}
            disabled={busy || disabled}
          />
          <button
            type="button"
            className="btn btn--delete"
            onClick={() => onDelete(slide.id)}
            disabled={busy || disabled}
            title="Delete slide"
            aria-label="Delete this slide"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroAdmin() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newPos, setNewPos] = useState("center 50%");
  const [adding, setAdding] = useState(false);
  const [globalBusy, setGlobalBusy] = useState(false);
  const newFileRef = useRef(null);

  const notifySuccess = (msg) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 4500);
  };

  const notifyError = (msg) => {
    setError(msg);
    setSuccess("");
  };

  const load = () => {
    setLoading(true);
    api
      .get("/admin/hero-slides")
      .then((data) => setSlides(data.slides || []))
      .catch((err) => notifyError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveSlide = async (id, { pos, file }) => {
    setError("");
    const form = new FormData();
    if (pos !== undefined) form.append("pos", pos);
    if (file) form.append("image", file);

    const data = await api.put(`/admin/hero-slides/${id}`, form);
    setSlides((list) => list.map((s) => (s.id === id ? data.slide : s)));
    notifySuccess(file ? "Image replaced successfully!" : "Focal position saved.");
    return data.slide;
  };

  const deleteSlide = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide from the homepage rotation?")) {
      return;
    }
    setError("");
    setGlobalBusy(true);
    try {
      await api.del(`/admin/hero-slides/${id}`);
      setSlides((list) => list.filter((s) => s.id !== id));
      notifySuccess("Image slide deleted successfully.");
    } catch (err) {
      notifyError(err.message);
    } finally {
      setGlobalBusy(false);
    }
  };

  const move = async (index, dir) => {
    const next = [...slides];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    setGlobalBusy(true);
    try {
      await api.put("/admin/hero-slides/reorder", { order: next.map((s) => s.id) });
      notifySuccess("Image order saved successfully.");
    } catch (err) {
      notifyError(err.message);
      load(); // rollback to canonical order from DB
    } finally {
      setGlobalBusy(false);
    }
  };

  const addSlide = async (e) => {
    e.preventDefault();
    const file = newFileRef.current?.files?.[0];
    if (!file) {
      notifyError("Please choose an image file (JPEG, PNG or WebP) first.");
      return;
    }
    setError("");
    setAdding(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("pos", newPos.trim() || "center 50%");
      const data = await api.post("/admin/hero-slides", form);
      setSlides((list) => [...list, data.slide]);
      setNewPos("center 50%");
      if (newFileRef.current) newFileRef.current.value = "";
      notifySuccess("New photo added to the hero rotation!");
    } catch (err) {
      notifyError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Homepage Hero Gallery & Media Manager</h1>
        <p className="admin-hint">
          Manage the rotating background photos on the homepage. Each card lets you position the photo's focal center (e.g. <code>center 48%</code>), reorder sequence, upload replacements, or remove slides.
        </p>
      </div>

      <form className="admin-inline-form" onSubmit={addSlide}>
        <input
          ref={newFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          aria-label="Upload new hero photo"
        />
        <input
          placeholder="Position (e.g. center 50%)"
          value={newPos}
          onChange={(e) => setNewPos(e.target.value)}
          aria-label="New slide position"
        />
        <button type="submit" className="btn btn--solid btn--sm" disabled={adding || globalBusy}>
          {adding ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
          Add photo
        </button>
      </form>

      {error && (
        <div className="admin-toast admin-toast--error" role="alert">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}>✕</button>
        </div>
      )}

      {success && (
        <div className="admin-toast admin-toast--success" role="status">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess("")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}>✕</button>
        </div>
      )}

      {loading && <p>Loading slides…</p>}

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
              disabled={globalBusy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
