import { useEffect, useRef, useState } from "react";
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, useEditorState } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import {
  Bold, Italic, Heading2, Heading3, Pilcrow, List, ListOrdered, Quote, Link2, Unlink, ImagePlus, ShieldQuestion, Undo2, Redo2,
} from "lucide-react";
import { api } from "../../lib/api";
import { mediaUrl } from "./shared";

// Visual editor for blog articles. Articles are still stored as Markdown — the
// server's checks, revision diffs and the site's renderer all work on it — so
// this reads Markdown in and writes Markdown out. Only formatting the site can
// display is offered: no underline, strikethrough, code or raw HTML.

// Same rules as the server (server/src/blog/content.js).
const isAllowedImage = (src) => /^\/uploads\/blog\/[\w-]+\.(jpe?g|png|webp)$/i.test(src) || /^\/img\/[\w./-]+$/.test(src);
const isAllowedLink = (href) => /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href);
const API_ORIGIN = mediaUrl("/uploads/").replace(/\/uploads\/$/, "");
/** Pasted or dragged copies of our own images arrive absolute; store them relative again. */
const toRelative = (src) => (src && src.startsWith(`${API_ORIGIN}/uploads/`) ? src.slice(API_ORIGIN.length) : src);

/** `[VERIFY: note]` — a claim still being checked. The site shows it as a
 *  "being verified" chip. Its own node, because as plain text the Markdown
 *  writer would escape the brackets and the site would no longer see it. */
const VerifyMarker = Node.create({
  name: "verifyMarker",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return { note: { default: "", parseHTML: (el) => el.getAttribute("data-note") || "", renderHTML: (a) => ({ "data-note": a.note }) } };
  },
  parseHTML() {
    return [{ tag: "span[data-verify]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-verify": "", class: "admin-rt-verify", title: node.attrs.note || "Needs verifying" }),
      `Verify${node.attrs.note ? `: ${node.attrs.note}` : ""}`,
    ];
  },
  markdownTokenName: "verify",
  markdownTokenizer: {
    name: "verify",
    level: "inline",
    start: (src) => src.indexOf("[VERIFY"),
    tokenize(src) {
      const m = /^\[VERIFY(?::\s*([^\]]*))?\]/.exec(src);
      if (!m) return undefined;
      return { type: "verify", raw: m[0], note: (m[1] || "").trim() };
    },
  },
  parseMarkdown: (token, helpers) => helpers.createNode("verifyMarker", { note: token.note }),
  renderMarkdown: (node) => {
    const note = (node.attrs?.note || "").replace(/[\]\n]/g, " ").trim();
    return note ? `[VERIFY: ${note}]` : "[VERIFY]";
  },
});

/** Image with its alt text and credit visible while writing, and a warning when
 *  either is missing or the file isn't one of ours. */
function ImageView({ node, updateAttributes, editor, selected }) {
  const { src, alt, title } = node.attrs;
  const edit = () => {
    const nextAlt = window.prompt("Describe the image for people who can't see it (alt text):", alt || "");
    if (nextAlt === null) return;
    const nextCredit = window.prompt("Photo credit (photographer or source):", title || "");
    updateAttributes({ alt: nextAlt.replace(/[[\]]/g, "").trim(), title: (nextCredit ?? title ?? "").replace(/"/g, "'").trim() || null });
  };
  return (
    <NodeViewWrapper as="span" className={`admin-rt-image${selected ? " is-selected" : ""}`}>
      <img src={mediaUrl(src)} alt={alt || ""} draggable={false} />
      <span className="admin-rt-image__meta" contentEditable={false}>
        {alt ? <span>Alt: {alt}</span> : <strong className="admin-overdue">No alt text</strong>}
        {title ? <span> · Photo: {title}</span> : <strong className="admin-overdue"> · No credit</strong>}
        {!isAllowedImage(src) && <strong className="admin-overdue"> · Upload this image here instead</strong>}
        {editor.isEditable && (
          <button type="button" className="btn btn--soft" onClick={edit}>Edit alt &amp; credit</button>
        )}
      </span>
    </NodeViewWrapper>
  );
}

const BlogImage = Image.extend({
  addAttributes() {
    const parent = this.parent?.() ?? {};
    return { ...parent, src: { ...parent.src, parseHTML: (el) => toRelative(el.getAttribute("src")) } };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
}).configure({ inline: true, allowBase64: false });

const EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] }, // the article title is the page's h1
    code: false,
    codeBlock: false,
    strike: false,
    underline: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      // Autolink makes links "sticky": text typed after one would join it.
      autolink: false,
      defaultProtocol: "https",
      isAllowedUri: (url) => isAllowedLink(url),
    },
  }),
  BlogImage,
  VerifyMarker,
  Markdown,
];

function ToolButton({ label, icon: Icon, onClick, active, disabled }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep the editor's selection
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      title={label}
      className={active ? "is-active" : undefined}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}

export default function RichTextEditor({ id, labelledBy, describedBy, value, onChange, disabled }) {
  // `synced`: the Markdown string last loaded from or reported to the form.
  // `baseline`: what the editor itself writes for that content. Loading can
  // normalise Markdown slightly (escaping, list markers) without anyone typing,
  // so edits are measured against the baseline, never against the stored text.
  const synced = useRef(value);
  const baseline = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: value,
    contentType: "markdown",
    editable: !disabled,
    immediatelyRender: true,
    editorProps: {
      attributes: {
        id,
        class: "admin-rt__content",
        role: "textbox",
        "aria-multiline": "true",
        ...(labelledBy ? { "aria-labelledby": labelledBy } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
    },
    // Automatic fix-ups (e.g. the editor adding an empty last paragraph) also
    // fire updates, the first one before the editor has finished starting; only
    // a change from the baseline counts as an edit.
    onUpdate: ({ editor: e }) => {
      baseline.current ??= e.markdown.serialize(e.markdown.parse(synced.current));
      const md = e.getMarkdown();
      if (md === baseline.current) return;
      baseline.current = md;
      synced.current = md;
      onChange(md);
    },
  });

  // A new revision loaded, or the Markdown view changed the text: load it
  // without reporting it as an edit (that would mark the form dirty).
  useEffect(() => {
    if (!editor || value === synced.current) return;
    editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
    synced.current = value;
    baseline.current = editor.getMarkdown();
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            paragraph: e.isActive("paragraph"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            verify: e.isActive("verifyMarker"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : {},
  });

  if (!editor) return null;
  const chain = () => editor.chain().focus();
  const off = disabled || !editor.isEditable;

  const setLink = () => {
    const current = editor.getAttributes("link").href || "";
    const href = window.prompt("Link address — https://…, mailto:… or a site page like /places", current);
    if (href === null) return;
    if (!href.trim()) {
      chain().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!isAllowedLink(href.trim())) {
      setError("Links must start with https://, mailto: or / (a page on the site).");
      return;
    }
    setError("");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      const text = window.prompt("Link text", href.trim());
      if (!text) return;
      chain().insertContent({ type: "text", text, marks: [{ type: "link", attrs: { href: href.trim() } }] }).run();
    } else {
      chain().extendMarkRange("link").setLink({ href: href.trim() }).run();
    }
  };

  const verify = () => {
    const selected = editor.state.selection.node;
    const current = selected?.type.name === "verifyMarker" ? selected.attrs.note : "";
    const note = window.prompt("What needs checking, and where? e.g. current opening hours — temple trust", current);
    if (note === null) return;
    if (selected?.type.name === "verifyMarker") chain().updateAttributes("verifyMarker", { note: note.trim() }).run();
    else chain().insertContent([{ type: "text", text: " " }, { type: "verifyMarker", attrs: { note: note.trim() } }]).run();
  };

  const upload = async (file) => {
    if (!file) return;
    const alt = window.prompt("Describe the image for people who can't see it (alt text):", "");
    if (alt === null) return;
    const credit = window.prompt("Photo credit (photographer or source):", "") ?? "";
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const { url } = await api.post("/editorial/media", form);
      // Its own paragraph, so it doesn't land mid-sentence.
      chain()
        .insertContent({
          type: "paragraph",
          content: [{ type: "image", attrs: { src: url, alt: alt.replace(/[[\]]/g, "").trim(), title: credit.replace(/"/g, "'").trim() || null } }],
        })
        .run();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className={`admin-rt${off ? " is-disabled" : ""}`}>
      <div className="admin-md__toolbar" role="toolbar" aria-label="Formatting" aria-controls={id}>
        <ToolButton label="Paragraph" icon={Pilcrow} active={s.paragraph} disabled={off} onClick={() => chain().setParagraph().run()} />
        <ToolButton label="Heading" icon={Heading2} active={s.h2} disabled={off} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="Subheading" icon={Heading3} active={s.h3} disabled={off} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
        <span className="admin-rt__sep" aria-hidden="true" />
        <ToolButton label="Bold" icon={Bold} active={s.bold} disabled={off} onClick={() => chain().toggleBold().run()} />
        <ToolButton label="Italic" icon={Italic} active={s.italic} disabled={off} onClick={() => chain().toggleItalic().run()} />
        <ToolButton label={s.link ? "Edit link" : "Add link"} icon={Link2} active={s.link} disabled={off} onClick={setLink} />
        {s.link && <ToolButton label="Remove link" icon={Unlink} disabled={off} onClick={() => chain().extendMarkRange("link").unsetLink().run()} />}
        <span className="admin-rt__sep" aria-hidden="true" />
        <ToolButton label="Bulleted list" icon={List} active={s.bullet} disabled={off} onClick={() => chain().toggleBulletList().run()} />
        <ToolButton label="Numbered list" icon={ListOrdered} active={s.ordered} disabled={off} onClick={() => chain().toggleOrderedList().run()} />
        <ToolButton label="Quote" icon={Quote} active={s.quote} disabled={off} onClick={() => chain().toggleBlockquote().run()} />
        <span className="admin-rt__sep" aria-hidden="true" />
        <ToolButton label="Insert image" icon={ImagePlus} disabled={off || uploading} onClick={() => fileRef.current?.click()} />
        <ToolButton label={s.verify ? "Edit what needs verifying" : "Mark as needs verifying"} icon={ShieldQuestion} active={s.verify} disabled={off} onClick={verify} />
        <span className="admin-rt__sep" aria-hidden="true" />
        <ToolButton label="Undo" icon={Undo2} disabled={off || !s.canUndo} onClick={() => chain().undo().run()} />
        <ToolButton label="Redo" icon={Redo2} disabled={off || !s.canRedo} onClick={() => chain().redo().run()} />
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
        {uploading && <span className="admin-hint" role="status">Uploading…</span>}
      </div>
      <EditorContent editor={editor} />
      {error && <p className="admin__error" role="alert">{error}</p>}
    </div>
  );
}
