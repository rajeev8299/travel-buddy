import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, ExternalLink, GitCompare, History, ImagePlus, Plus, RotateCcw, Trash2, Archive } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../auth/authContext";
import AdminDialog from "../AdminDialog";
import MarkdownField from "./MarkdownField";
import RichTextEditor from "./RichTextEditor";
import { diffLines, revisionText } from "./diff";
import { ACTION, HISTORY, STATE, StateBadge, mediaUrl, when } from "./shared";

// One article revision: the writing form and the workflow around it
// (FR-BLOG-02…05). The API decides what this user may do — `canEdit` and
// `actions` come from it — and re-checks everything on submit.
const EDITABLE = ["title", "excerpt", "body", "category", "tags", "coverUrl", "coverAlt", "coverCredit", "sources", "verifiedOn", "seoTitle", "seoDescription"];

// Visual (rich text) or Markdown, remembered per browser. Both edit the same Markdown.
const MODE_KEY = "blogEditorMode";
const savedMode = () => {
  try {
    return localStorage.getItem(MODE_KEY) === "markdown" ? "markdown" : "visual";
  } catch {
    return "visual";
  }
};

const toForm = (r) => ({
  ...Object.fromEntries(EDITABLE.map((k) => [k, r[k] ?? ""])),
  tags: (r.tags ?? []).join(", "),
  sources: r.sources?.length ? r.sources.map((s) => ({ title: s.title, url: s.url ?? "" })) : [{ title: "", url: "" }],
});
const fromForm = (f) => ({
  ...f,
  tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
  sources: f.sources.filter((s) => s.title.trim() || s.url.trim()),
  category: f.category || null,
  verifiedOn: f.verifiedOn || null,
});

function Counter({ value, max }) {
  return <span className={`admin-hint ${value.length > max ? "admin-overdue" : ""}`}>{value.length}/{max}</span>;
}

function CompareDialog({ revisions, current, onClose }) {
  const others = revisions.filter((r) => r.id !== current.id);
  const [otherId, setOtherId] = useState(others.find((r) => r.state === "published")?.id ?? others[0]?.id);
  const [other, setOther] = useState(null);
  useEffect(() => {
    if (otherId) api.get(`/editorial/revisions/${otherId}`).then((d) => setOther(d.revision)).catch(() => setOther(null));
  }, [otherId]);
  const lines = other ? diffLines(revisionText(other), revisionText(current)) : [];
  const changes = lines.filter((l) => l.type !== "same").length;
  return (
    <AdminDialog labelledBy="compare-title" onClose={onClose}>
      <h2 id="compare-title">Compare revisions</h2>
      <label className="admin-field">
        <span>Compare revision {current.number} with</span>
        <select className="admin-select" value={otherId ?? ""} onChange={(e) => setOtherId(Number(e.target.value))}>
          {others.map((r) => <option key={r.id} value={r.id}>Revision {r.number} — {STATE[r.state]?.label}</option>)}
        </select>
      </label>
      {other && (
        <>
          <p className="admin-hint" role="status">{changes ? `${changes} changed lines. Removed lines are struck through, added lines are underlined.` : "No differences."}</p>
          <pre className="admin-diff">
            {lines.map((l, i) =>
              l.type === "same" ? <span key={i}>{`  ${l.text}\n`}</span> : l.type === "add" ? <ins key={i}>{`+ ${l.text}\n`}</ins> : <del key={i}>{`- ${l.text}\n`}</del>,
            )}
          </pre>
        </>
      )}
    </AdminDialog>
  );
}

export default function BlogEditor() {
  const { postId, revisionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postData, setPostData] = useState(null);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [slug, setSlug] = useState("");
  const [comment, setComment] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [comparing, setComparing] = useState(false);
  const [mode, setMode] = useState(savedMode);
  const chooseMode = (m) => {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* storage blocked: the choice just isn't remembered */
    }
  };

  const load = useCallback(async () => {
    try {
      const [p, r] = await Promise.all([api.get(`/editorial/posts/${postId}`), api.get(`/editorial/revisions/${revisionId}`)]);
      setPostData(p);
      setData(r);
      setForm(toForm(r.revision));
      setSlug(p.post.slug);
      setDirty(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [postId, revisionId]);

  useEffect(() => {
    load();
    api.get("/editorial/categories").then((d) => setCategories(d.categories)).catch(() => {});
  }, [load]);

  // Don't lose unsaved writing to a closed tab.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const flash = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 4000);
  };
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));
    setDirty(true);
  };

  const save = async () => {
    const r = await api.put(`/editorial/revisions/${revisionId}`, fromForm(form));
    setData((d) => ({ ...d, revision: r.revision, problems: r.problems }));
    setDirty(false);
    return r;
  };

  const run = async (fn, ok) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      if (ok) flash(ok);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doAction = (action) =>
    run(async () => {
      const meta = ACTION[action] ?? {};
      if (meta.needsComment && !comment.trim()) throw new Error("Write in the comment box what needs to change, then press the button again.");
      if (action === "schedule" && !scheduleAt) throw new Error("Choose when to publish.");
      if (meta.confirm && !window.confirm(meta.confirm)) return;
      if (dirty && data.canEdit) await save(); // the action applies to what's on screen
      await api.post(`/editorial/revisions/${revisionId}/actions`, {
        action,
        comment: comment.trim() || undefined,
        scheduledFor: action === "schedule" ? new Date(scheduleAt).toISOString() : undefined,
      });
      setComment("");
      await load();
      flash(`${meta.label ?? action} — done.`);
    });

  const newRevision = (fromRevisionId) =>
    run(async () => {
      const r = await api.post(`/editorial/posts/${postId}/revisions`, fromRevisionId ? { fromRevisionId } : {});
      navigate(`/admin/blog/${postId}/${r.revisionId}`);
    });

  const uploadCover = (file) =>
    run(async () => {
      if (!file) return;
      const fd = new FormData();
      fd.append("image", file);
      const { url } = await api.post("/editorial/media", fd);
      setForm((f) => ({ ...f, coverUrl: url }));
      setDirty(true);
    }, "Cover uploaded — add alt text and a credit, then save.");

  if (error && !data) return <div className="admin-toast admin-toast--error" role="alert">{error}</div>;
  if (!data || !postData || !form) return <p>Loading…</p>;

  const { revision: rev, reviews, actions, canEdit, problems, contributors, approvedBy } = data;
  const { post, revisions, can } = postData;
  const locked = !canEdit;
  const workflowActions = actions.filter((a) => a !== "comment");
  const minSchedule = new Date(Date.now() + 5 * 60_000 - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

  return (
    <div className="admin-blog-editor">
      <div className="admin-blog-editor__head">
        <Link to="/admin/blog" className="admin-back"><ArrowLeft size={15} aria-hidden="true" /> All articles</Link>
        <h1>{rev.title || "Untitled"}</h1>
        <p className="admin-hint">
          Revision {rev.number} · by {post.author} · <StateBadge state={rev.state} />
          {post.url && (
            <>
              {" · "}
              <a href={post.url} target="_blank" rel="noopener noreferrer">View live article <ExternalLink size={12} aria-hidden="true" /></a>
            </>
          )}
          {post.archived && " · Archived"}
        </p>
      </div>

      {error && <div className="admin-toast admin-toast--error" role="alert">{error}</div>}
      {toast && <div className="admin-toast admin-toast--success" role="status">{toast}</div>}

      <div className="admin-blog-editor__grid">
        {/* ---------------------------------------------------------- form */}
        <form
          className="admin-card admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(save, "Saved.");
          }}
          aria-labelledby="article-form-title"
        >
          <h2 id="article-form-title" className="visually-hidden">Article</h2>
          {locked && (
            <p className="admin-note" role="note">
              {rev.state === "published" || rev.state === "superseded" || rev.state === "discarded"
                ? "This revision can't be changed. To update the article, start a new revision."
                : `Read-only for you while it's ${STATE[rev.state]?.label.toLowerCase()}.`}
            </p>
          )}
          <fieldset disabled={locked || busy} className="admin-form">
            <div className="admin-field">
              <label htmlFor="f-title">Title <Counter value={form.title} max={140} /></label>
              <input id="f-title" className="admin-input" maxLength={140} value={form.title} onChange={set("title")} />
            </div>
            <div className="admin-field">
              <label htmlFor="f-excerpt">Summary <Counter value={form.excerpt} max={300} /></label>
              <textarea id="f-excerpt" className="admin-textarea" rows={2} maxLength={300} value={form.excerpt} onChange={set("excerpt")} aria-describedby="f-excerpt-hint" />
              <p id="f-excerpt-hint" className="admin-hint">One or two sentences. Shown on the blog listing, in search results and when shared.</p>
            </div>
            <div className="admin-form__row">
              <div className="admin-field">
                <label htmlFor="f-category">Category</label>
                <select id="f-category" className="admin-select" value={form.category} onChange={set("category")}>
                  <option value="">Choose…</option>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="f-tags">Tags</label>
                <input id="f-tags" className="admin-input" value={form.tags} onChange={set("tags")} placeholder="ghats, first visit, evening" aria-describedby="f-tags-hint" />
                <p id="f-tags-hint" className="admin-hint">Separate with commas. Up to 10.</p>
              </div>
            </div>

            <fieldset className="admin-field">
              <legend>Cover image</legend>
              {form.coverUrl ? (
                <div className="admin-cover">
                  <img src={mediaUrl(form.coverUrl)} alt="" />
                  <button type="button" className="btn btn--soft" onClick={() => { setForm((f) => ({ ...f, coverUrl: "" })); setDirty(true); }}>Remove</button>
                </div>
              ) : (
                <label className="btn btn--soft admin-upload">
                  <ImagePlus size={15} aria-hidden="true" /> Upload cover image
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" onChange={(e) => uploadCover(e.target.files?.[0])} />
                </label>
              )}
              <div className="admin-form__row">
                <div className="admin-field">
                  <label htmlFor="f-alt">Alt text</label>
                  <input id="f-alt" className="admin-input" maxLength={200} value={form.coverAlt} onChange={set("coverAlt")} placeholder="What the photo shows" />
                </div>
                <div className="admin-field">
                  <label htmlFor="f-credit">Credit</label>
                  <input id="f-credit" className="admin-input" maxLength={200} value={form.coverCredit} onChange={set("coverCredit")} placeholder="Photographer or source" />
                </div>
              </div>
            </fieldset>

            <div className="admin-field">
              <div className="admin-rt-head">
                <span id="f-body-label" className="admin-field__label">Article</span>
                <div className="admin-filters" role="group" aria-label="Editor view">
                  {[["visual", "Visual"], ["markdown", "Markdown"]].map(([m, label]) => (
                    <button key={m} type="button" className={mode === m ? "is-active" : ""} aria-pressed={mode === m} onClick={() => chooseMode(m)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {mode === "visual" ? (
                <RichTextEditor id="f-body" labelledBy="f-body-label" describedBy="f-body-hint" value={form.body} onChange={set("body")} disabled={locked || busy} />
              ) : (
                <MarkdownField id="f-body" labelledBy="f-body-label" value={form.body} onChange={set("body")} disabled={locked || busy} describedBy="f-body-hint" />
              )}
              <p id="f-body-hint" className="admin-hint">
                Mark anything not yet confirmed with the shield button — it shows as &ldquo;being verified&rdquo; on the site.{" "}
                {form.body.split(/\s+/).filter(Boolean).length} words.
              </p>
            </div>

            <fieldset className="admin-field">
              <legend>Sources</legend>
              {form.sources.map((s, i) => (
                <div key={i} className="admin-source">
                  <input className="admin-input" aria-label={`Source ${i + 1} title`} placeholder="Source title, e.g. Kashi Vishwanath Temple Trust" value={s.title}
                    onChange={(e) => { const sources = [...form.sources]; sources[i] = { ...s, title: e.target.value }; setForm({ ...form, sources }); setDirty(true); }} />
                  <input className="admin-input" aria-label={`Source ${i + 1} web address`} placeholder="https://… (optional)" value={s.url}
                    onChange={(e) => { const sources = [...form.sources]; sources[i] = { ...s, url: e.target.value }; setForm({ ...form, sources }); setDirty(true); }} />
                  <button type="button" className="btn btn--soft" aria-label={`Remove source ${i + 1}`}
                    onClick={() => { setForm({ ...form, sources: form.sources.filter((_, j) => j !== i) }); setDirty(true); }}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn--soft" onClick={() => setForm({ ...form, sources: [...form.sources, { title: "", url: "" }] })}>
                <Plus size={14} aria-hidden="true" /> Add source
              </button>
            </fieldset>

            <div className="admin-form__row">
              <div className="admin-field">
                <label htmlFor="f-verified">Facts checked on</label>
                <input id="f-verified" type="date" className="admin-input" value={form.verifiedOn} max={new Date().toISOString().slice(0, 10)} onChange={set("verifiedOn")} aria-describedby="f-verified-hint" />
                <p id="f-verified-hint" className="admin-hint">Set during fact check. Shown on the article.</p>
              </div>
            </div>

            <details className="admin-details">
              <summary>Search and sharing (optional)</summary>
              <div className="admin-field">
                <label htmlFor="f-seo-title">Search title <Counter value={form.seoTitle} max={70} /></label>
                <input id="f-seo-title" className="admin-input" maxLength={70} value={form.seoTitle} onChange={set("seoTitle")} placeholder={form.title} />
              </div>
              <div className="admin-field">
                <label htmlFor="f-seo-desc">Search description <Counter value={form.seoDescription} max={170} /></label>
                <textarea id="f-seo-desc" className="admin-textarea" rows={2} maxLength={170} value={form.seoDescription} onChange={set("seoDescription")} placeholder={form.excerpt} />
              </div>
            </details>
          </fieldset>

          {!locked && (
            <div className="admin-form__actions admin-sticky-save">
              <button type="submit" className="btn btn--solid" disabled={busy || !dirty}>{busy ? "Saving…" : dirty ? "Save changes" : "Saved"}</button>
              {dirty && <span className="admin-hint">Unsaved changes</span>}
            </div>
          )}
        </form>

        {/* ------------------------------------------------------ workflow */}
        <aside className="admin-blog-editor__side" aria-label="Workflow">
          <section className="admin-card">
            <h2 className="admin-subhead">Status: {STATE[rev.state]?.label}</h2>
            <p>{STATE[rev.state]?.next}</p>
            {rev.state === "scheduled" && <p><strong>Goes live {when(rev.scheduledFor)}</strong></p>}
            {approvedBy && <p className="admin-hint">Approved by {approvedBy} · {when(rev.approvedAt)}</p>}
            {contributors.length > 0 && <p className="admin-hint">Worked on by {contributors.join(", ")}</p>}

            {problems?.length > 0 && (
              <div className="admin-note" role="note">
                <strong>Before it can be submitted:</strong>
                <ul>{problems.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            )}

            {workflowActions.includes("schedule") && (
              <label className="admin-field">
                <span>Publish at</span>
                <input type="datetime-local" className="admin-input" min={minSchedule} value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
              </label>
            )}
            <div className="admin-actions">
              {workflowActions.map((a) => (
                <button key={a} type="button" disabled={busy}
                  className={`btn ${ACTION[a]?.primary ? "btn--solid" : "btn--soft"} ${ACTION[a]?.danger ? "btn--danger" : ""}`}
                  onClick={() => doAction(a)}>
                  {ACTION[a]?.label ?? a}
                </button>
              ))}
              <button type="button" className="btn btn--soft" disabled={busy}
                onClick={() => run(async () => {
                  if (dirty && canEdit) await save();
                  const { url } = await api.post(`/editorial/revisions/${revisionId}/preview`);
                  window.open(url, "_blank", "noopener");
                })}>
                <Eye size={15} aria-hidden="true" /> Preview on site
              </button>
            </div>
            {user.role === "admin" && rev.state === "verified" && !actions.includes("approve") && (
              <p className="admin-hint">You worked on this revision, so a different admin has to approve it.</p>
            )}
          </section>

          <section className="admin-card" aria-labelledby="comments-title">
            <h2 id="comments-title" className="admin-subhead">Comments &amp; history</h2>
            <ol className="admin-timeline admin-timeline--reviews">
              {reviews.map((r) => (
                <li key={r.id}>
                  <strong>{HISTORY[r.action] ?? r.action}</strong> · {r.by} · {when(r.at)}
                  {r.body && <p className="admin-pre">{r.body}</p>}
                </li>
              ))}
            </ol>
            {actions.includes("comment") && (
              <div className="admin-field">
                <label htmlFor="review-comment">Comment</label>
                <textarea id="review-comment" className="admin-textarea" rows={3} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)}
                  aria-describedby="review-comment-hint" />
                <p id="review-comment-hint" className="admin-hint">Also used as the reason when requesting changes.</p>
                <div>
                  <button type="button" className="btn btn--soft" disabled={busy || !comment.trim()} onClick={() => doAction("comment")}>Add comment</button>
                </div>
              </div>
            )}
          </section>

          <section className="admin-card" aria-labelledby="revisions-title">
            <h2 id="revisions-title" className="admin-subhead"><History size={16} aria-hidden="true" /> Revisions</h2>
            <ul className="admin-revisions">
              {revisions.map((r) => (
                <li key={r.id} className={r.id === rev.id ? "is-current" : undefined}>
                  <Link to={`/admin/blog/${post.id}/${r.id}`} aria-current={r.id === rev.id ? "page" : undefined}>Revision {r.number}</Link>{" "}
                  <StateBadge state={r.state} />
                  <div className="admin-sub">{r.createdBy} · {when(r.updatedAt)}</div>
                </li>
              ))}
            </ul>
            <div className="admin-actions">
              {revisions.length > 1 && (
                <button type="button" className="btn btn--soft" onClick={() => setComparing(true)}><GitCompare size={15} aria-hidden="true" /> Compare</button>
              )}
              {can.newRevision && post.liveRevisionId && rev.state === "published" && (
                <button type="button" className="btn btn--solid" disabled={busy} onClick={() => newRevision()}>Update this article</button>
              )}
              {can.newRevision && ["superseded", "discarded"].includes(rev.state) && (
                <button type="button" className="btn btn--soft" disabled={busy} onClick={() => newRevision(rev.id)}>
                  <RotateCcw size={15} aria-hidden="true" /> Restore as new draft
                </button>
              )}
            </div>
            {!can.newRevision && postData.openRevisionId && postData.openRevisionId !== rev.id && (
              <p className="admin-hint">
                Revision {revisions.find((r) => r.id === postData.openRevisionId)?.number} is in progress —{" "}
                <Link to={`/admin/blog/${post.id}/${postData.openRevisionId}`}>open it</Link>.
              </p>
            )}
          </section>

          {can.editSlug && (
            <section className="admin-card">
              <label className="admin-field">
                <span className="admin-subhead">Web address</span>
                <span className="admin-hint">/blog/</span>
                <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </label>
              <p className="admin-hint">Fixed once the article is first published.</p>
              <button type="button" className="btn btn--soft" disabled={busy || slug === post.slug}
                onClick={() => run(async () => { const r = await api.patch(`/editorial/posts/${post.id}`, { slug }); setSlug(r.slug); await load(); }, "Address changed.")}>
                Change address
              </button>
            </section>
          )}

          {(can.archive || can.unarchive) && (
            <section className="admin-card">
              <button type="button" className="btn btn--soft btn--danger" disabled={busy}
                onClick={() => run(async () => {
                  if (can.archive && !window.confirm("Archive this article? It disappears from the website within a minute.")) return;
                  await api.post(`/editorial/posts/${post.id}/${can.archive ? "archive" : "unarchive"}`);
                  await load();
                }, can.archive ? "Archived." : "Back on the website.")}>
                <Archive size={15} aria-hidden="true" /> {can.archive ? "Archive article" : "Unarchive article"}
              </button>
            </section>
          )}
        </aside>
      </div>

      {comparing && <CompareDialog revisions={revisions} current={{ ...rev, ...(dirty ? fromForm(form) : {}) }} onClose={() => setComparing(false)} />}
    </div>
  );
}
