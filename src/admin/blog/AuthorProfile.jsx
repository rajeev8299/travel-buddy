import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Eye, ExternalLink, ImagePlus, Lock, RotateCcw, X } from "lucide-react";
import { api } from "../../lib/api";
import AdminDialog from "../AdminDialog";
import { ROLE_LABEL } from "../roles";
import { mediaUrl } from "./shared";

// "My profile": the public author identity shown on articles and the author
// page, plus the private account details. Each person edits only their own
// profile — the API never takes a user id here. Nothing on this screen changes
// roles, article ownership or the approval workflow.

const SITE_URL = (import.meta.env.VITE_SITE_URL || "http://localhost:3100").replace(/\/$/, "");
const MAX_PHOTO_MB = 8;
const EMPTY = { displayName: "", slug: "", bio: "", avatarUrl: "", avatarPos: "", languages: [], expertise: [] };
const fromProfile = (p) => ({
  displayName: p?.displayName ?? "",
  slug: p?.slug ?? "",
  bio: p?.bio ?? "",
  avatarUrl: p?.avatarUrl ?? "",
  avatarPos: p?.avatarPos ?? "",
  languages: p?.languages ?? [],
  expertise: p?.expertise ?? [],
});
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Tag-style input: Enter or comma adds, × removes. */
function TagInput({ id, label, hint, values, onChange, max, maxLength, disabled, placeholder }) {
  const [draft, setDraft] = useState("");
  const add = (raw = draft) => {
    const v = raw.replace(/,$/, "").trim();
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase()) && values.length < max) onChange([...values, v.slice(0, maxLength)]);
    setDraft("");
  };
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      {values.length > 0 && (
        <ul className="admin-tags" aria-label={`${label} added`}>
          {values.map((v) => (
            <li key={v}>
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} disabled={disabled} aria-label={`Remove ${v}`}>
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        className="admin-input"
        value={draft}
        maxLength={maxLength}
        disabled={disabled || values.length >= max}
        placeholder={values.length >= max ? `Up to ${max}` : placeholder}
        aria-describedby={`${id}-hint`}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => add()}
      />
      <p id={`${id}-hint`} className="admin-hint">{hint} Press Enter to add. Up to {max}.</p>
    </div>
  );
}

/** How the profile will look publicly — available before anything is published. */
function ProfilePreview({ form, onClose }) {
  return (
    <AdminDialog labelledBy="preview-title" onClose={onClose}>
      <p className="admin-hint" id="preview-note">Preview — this is how readers will see your profile.</p>
      <div className="admin-profile-preview">
        {form.avatarUrl ? (
          <img src={mediaUrl(form.avatarUrl)} alt="" style={{ objectPosition: form.avatarPos || "50% 50%" }} />
        ) : (
          <span className="admin-profile-preview__initials" aria-hidden="true">{form.displayName.slice(0, 1).toUpperCase() || "?"}</span>
        )}
        <div>
          <p className="admin-hint">Author</p>
          <h2 id="preview-title">{form.displayName || "Your name"}</h2>
          {form.bio ? <p>{form.bio}</p> : <p className="admin-hint">No biography yet.</p>}
          {(form.languages.length > 0 || form.expertise.length > 0) && (
            <dl className="admin-profile-preview__facts">
              {form.languages.length > 0 && <><dt>Languages</dt><dd>{form.languages.join(", ")}</dd></>}
              {form.expertise.length > 0 && <><dt>Writes about</dt><dd>{form.expertise.join(", ")}</dd></>}
            </dl>
          )}
          {(form.languages.length > 0 || form.expertise.length > 0) && <p className="admin-hint">Shown as “as described by the author”.</p>}
          <p className="admin-hint admin-mono">{SITE_URL}/blog/author/{form.slug || "…"}</p>
        </div>
      </div>
    </AdminDialog>
  );
}

export default function AuthorProfile() {
  const [load, setLoad] = useState({ state: "loading" });
  const [saved, setSaved] = useState(EMPTY);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(""); // "saving" | "uploading" | "saved" | ""
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [preview, setPreview] = useState(false);
  const [leaveTo, setLeaveTo] = useState(null);
  const fileRef = useRef(null);
  const dirty = !same(form, saved);
  const busy = status === "saving" || status === "uploading";

  const fetchMe = useCallback(() => {
    setLoad({ state: "loading" });
    api
      .get("/editorial/me")
      .then((d) => {
        setLoad({ state: "ok", me: d });
        setSaved(fromProfile(d.profile));
        setForm(fromProfile(d.profile));
      })
      .catch((err) => setLoad({ state: "error", message: err.message }));
  }, []);
  useEffect(fetchMe, [fetchMe]);

  // Unsaved changes: warn on closing the tab, and intercept in-app links.
  useEffect(() => {
    if (!dirty) return undefined;
    const beforeUnload = (e) => e.preventDefault();
    const onClick = (e) => {
      const a = e.target.closest?.("a[href^='#/']");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(a.getAttribute("href"));
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: typeof v === "object" && v?.target ? v.target.value : v }));
    setStatus("");
  };

  const upload = async (file) => {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Choose a JPEG, PNG or WEBP photo.");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setError(`That photo is over ${MAX_PHOTO_MB} MB — choose a smaller one.`);
    setStatus("uploading");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { url } = await api.post("/editorial/media", fd);
      setForm((f) => ({ ...f, avatarUrl: url, avatarPos: "50% 50%" }));
      setStatus("");
    } catch (err) {
      setError(err.message);
      setStatus("");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (e) => {
    e?.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const d = await api.put("/editorial/me/profile", { ...form, slug: form.slug });
      setLoad({ state: "ok", me: d });
      setSaved(fromProfile(d.profile));
      setForm(fromProfile(d.profile));
      setStatus("saved");
      window.dispatchEvent(new Event("profile:updated")); // the sidebar menu shows the new name/photo
    } catch (err) {
      setError(err.message); // what was typed stays on screen
      setStatus("");
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("Link copied.");
    } catch {
      setCopied("Copy blocked — select the address and copy it.");
    }
  };

  const pickFocus = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    set("avatarPos")(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  };
  const [posX, posY] = (form.avatarPos || "50% 50%").split(" ").map((v) => parseInt(v, 10));

  if (load.state === "loading") return <p>Loading your profile…</p>;
  if (load.state === "error") {
    return (
      <div style={{ maxWidth: 640 }}>
        <h1>My profile</h1>
        <div className="admin-toast admin-toast--error" role="alert">We couldn&apos;t load your profile: {load.message}</div>
        <button type="button" className="btn btn--solid" onClick={fetchMe}><RotateCcw size={15} aria-hidden="true" /> Retry</button>
      </div>
    );
  }

  const { me } = load;
  const publicUrl = me.publicUrl;
  const addressUrl = `${SITE_URL}/blog/author/${form.slug || "…"}`;

  return (
    <div className="admin-profile">
      <Link to="/admin/blog" className="admin-back"><ArrowLeft size={15} aria-hidden="true" /> My articles</Link>
      <h1>My profile</h1>
      <p className="admin-hint">Your public profile appears under your articles and on your author page.</p>

      <form onSubmit={save} className="admin-profile__form" aria-describedby="profile-status">
        <fieldset className="admin-card admin-form" disabled={busy}>
          <legend className="admin-subhead">Public identity</legend>
          <div className="admin-field">
            <label htmlFor="p-name">Name readers see</label>
            <input id="p-name" className="admin-input" maxLength={80} required value={form.displayName} onChange={set("displayName")} autoComplete="name" />
          </div>
          <div className="admin-field">
            <span className="admin-field__label" id="p-photo-label">Profile photo</span>
            <div className="admin-photo">
              {form.avatarUrl ? (
                <>
                  <button type="button" className="admin-photo__full" onClick={pickFocus} aria-label="Click the part of the photo to keep in the centre" title="Click to set the centre of the crop">
                    <img src={mediaUrl(form.avatarUrl)} alt="" />
                    <span className="admin-photo__dot" style={{ left: `${posX}%`, top: `${posY}%` }} aria-hidden="true" />
                  </button>
                  <img className="admin-photo__round" src={mediaUrl(form.avatarUrl)} alt="Preview of your round profile photo" style={{ objectPosition: form.avatarPos || "50% 50%" }} />
                </>
              ) : (
                <span className="admin-photo__empty" aria-hidden="true">{form.displayName.slice(0, 1).toUpperCase() || "?"}</span>
              )}
              <div className="admin-photo__controls">
                <label className="btn btn--soft admin-upload">
                  <ImagePlus size={15} aria-hidden="true" /> {status === "uploading" ? "Uploading…" : form.avatarUrl ? "Replace photo" : "Upload photo"}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" aria-describedby="p-photo-req" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
                {form.avatarUrl && <button type="button" className="btn btn--soft" onClick={() => setForm((f) => ({ ...f, avatarUrl: "", avatarPos: "" }))}>Remove photo</button>}
                <p id="p-photo-req" className="admin-hint">JPEG, PNG or WEBP, up to {MAX_PHOTO_MB} MB. A clear photo of your face works best. <strong>Uploading doesn&apos;t publish it — press Save changes.</strong></p>
              </div>
            </div>
            {form.avatarUrl && (
              <div className="admin-form__row">
                <label className="admin-field">
                  <span>Crop: left ↔ right ({posX}%)</span>
                  <input type="range" min={0} max={100} value={posX} onChange={(e) => set("avatarPos")(`${e.target.value}% ${posY}%`)} />
                </label>
                <label className="admin-field">
                  <span>Crop: top ↕ bottom ({posY}%)</span>
                  <input type="range" min={0} max={100} value={posY} onChange={(e) => set("avatarPos")(`${posX}% ${e.target.value}%`)} />
                </label>
              </div>
            )}
          </div>
        </fieldset>

        <fieldset className="admin-card admin-form" disabled={busy}>
          <legend className="admin-subhead">About the author</legend>
          <div className="admin-field">
            <label htmlFor="p-bio">Short biography <span className="admin-hint">({form.bio.length}/600)</span></label>
            <textarea id="p-bio" className="admin-textarea" rows={4} maxLength={600} value={form.bio} onChange={set("bio")} placeholder="Who you are and how you know Varanasi." />
          </div>
          <TagInput id="p-langs" label="Languages" values={form.languages} onChange={set("languages")} max={8} maxLength={30} disabled={busy} placeholder="e.g. Hindi" hint="Languages you speak or write in." />
          <TagInput id="p-exp" label="Areas of interest" values={form.expertise} onChange={set("expertise")} max={10} maxLength={40} disabled={busy} placeholder="e.g. Ghats and rituals" hint="What you write about. Readers see these as described by you — they aren't a verification." />
        </fieldset>

        <fieldset className="admin-card admin-form" disabled={busy}>
          <legend className="admin-subhead">Public address</legend>
          <div className="admin-field">
            <label htmlFor="p-slug">Profile address</label>
            <div className="admin-slug">
              <span className="admin-hint admin-mono">/blog/author/</span>
              <input
                id="p-slug"
                className="admin-input admin-mono"
                maxLength={60}
                value={form.slug}
                onChange={(e) => set("slug")(slugify(e.target.value))}
                disabled={me.slugLocked}
                aria-describedby="p-slug-hint"
              />
            </div>
            <p id="p-slug-hint" className="admin-hint">
              {me.slugLocked ? (
                <><Lock size={12} aria-hidden="true" /> Fixed now that you&apos;ve published, so links to your page keep working. An admin can change it, with a redirect from the old address.</>
              ) : (
                "Letters, numbers and hyphens. It's fixed once your first article is published."
              )}
            </p>
          </div>
          <div className="admin-form__actions">
            <button type="button" className="btn btn--soft" onClick={() => setPreview(true)}><Eye size={15} aria-hidden="true" /> Preview profile</button>
            {publicUrl ? (
              <>
                <a className="btn btn--soft" href={publicUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" /> View public page</a>
                <button type="button" className="btn btn--soft" onClick={() => copy(publicUrl)}><Copy size={15} aria-hidden="true" /> Copy link</button>
              </>
            ) : (
              <span className="admin-hint">Your public page goes live with your first published article: <span className="admin-mono">{addressUrl}</span></span>
            )}
            {copied && <span className="admin-hint" role="status">{copied}</span>}
          </div>
        </fieldset>

        <section className="admin-card admin-profile__private" aria-labelledby="p-private">
          <h2 id="p-private" className="admin-subhead"><Lock size={15} aria-hidden="true" /> Private account <span className="admin-badge admin-badge--state-muted">Only you and admins</span></h2>
          <dl className="admin-detail">
            <dt>Sign-in email</dt><dd>{me.account.email}</dd>
            <dt>Role</dt><dd>{ROLE_LABEL[me.account.role] ?? me.account.role} <span className="admin-hint">— ask an admin to change it</span></dd>
          </dl>
          <p className="admin-hint">Never shown on the website.</p>
        </section>

        <div className="admin-profile__bar">
          <span id="profile-status" role="status" className={dirty ? "admin-overdue" : "admin-hint"}>
            {status === "saving" ? "Saving…" : status === "uploading" ? "Uploading photo…" : dirty ? "Unsaved changes" : status === "saved" ? "All changes saved" : "No changes"}
          </span>
          {error && <span className="admin__error" role="alert">{error}</span>}
          <button type="button" className="btn btn--soft" disabled={!dirty || busy} onClick={() => { setForm(saved); setError(""); }}>Discard changes</button>
          <button type="submit" className="btn btn--solid" disabled={!dirty || busy}>{status === "saving" ? "Saving…" : "Save changes"}</button>
        </div>
      </form>

      {preview && <ProfilePreview form={form} onClose={() => setPreview(false)} />}
      {leaveTo && (
        <AdminDialog labelledBy="leave-title" onClose={() => setLeaveTo(null)}>
          <h2 id="leave-title">Leave without saving?</h2>
          <p>Your profile has unsaved changes.</p>
          <div className="admin-form__actions">
            <button type="button" className="btn btn--solid" onClick={async () => { await save(); setLeaveTo(null); }}>Save and stay</button>
            <button type="button" className="btn btn--soft" onClick={() => { const to = leaveTo; setForm(saved); setLeaveTo(null); window.location.hash = to.slice(1); }}>Leave without saving</button>
          </div>
        </AdminDialog>
      )}
    </div>
  );
}
