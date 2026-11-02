import { useRef, useState } from "react";
import { Bold, Italic, Heading2, Heading3, Link2, List, ListOrdered, Quote, ImagePlus, ShieldQuestion } from "lucide-react";
import { api } from "../../lib/api";

// Markdown editor with a formatting toolbar. Articles are stored as Markdown
// and the site renders it without raw HTML, so what's typed here is exactly
// what can appear. Toolbar buttons wrap the selection or insert a snippet.
const TOOLS = [
  { label: "Heading", icon: Heading2, line: "## " },
  { label: "Subheading", icon: Heading3, line: "### " },
  { label: "Bold", icon: Bold, wrap: ["**", "**"], placeholder: "bold text" },
  { label: "Italic", icon: Italic, wrap: ["_", "_"], placeholder: "italic text" },
  { label: "Link", icon: Link2, wrap: ["[", "](https://)"], placeholder: "link text" },
  { label: "Bulleted list", icon: List, line: "- " },
  { label: "Numbered list", icon: ListOrdered, line: "1. " },
  { label: "Quote", icon: Quote, line: "> " },
  { label: "Needs verifying", icon: ShieldQuestion, wrap: ["[VERIFY: ", "]"], placeholder: "what to check — where" },
];

export default function MarkdownField({ id, labelledBy, value, onChange, disabled, describedBy }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Edits go through onChange, then the caret is restored after React re-renders.
  const replace = (start, end, text, selectFrom, selectTo) => {
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selectFrom, selectTo);
    });
  };

  const apply = (tool) => {
    const el = ref.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (tool.line) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      replace(lineStart, lineStart, tool.line, start + tool.line.length, end + tool.line.length);
      return;
    }
    const selected = value.slice(start, end) || tool.placeholder;
    const [before, after] = tool.wrap;
    replace(start, end, `${before}${selected}${after}`, start + before.length, start + before.length + selected.length);
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
      const el = ref.current;
      const at = el.selectionStart;
      const snippet = `\n\n![${alt.replace(/[[\]]/g, "")}](${url}${credit ? ` "${credit.replace(/"/g, "'")}"` : ""})\n\n`;
      replace(at, at, snippet, at + snippet.length, at + snippet.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="admin-md">
      <div className="admin-md__toolbar" role="toolbar" aria-label="Formatting" aria-controls={id}>
        {TOOLS.map((t) => (
          <button key={t.label} type="button" onClick={() => apply(t)} disabled={disabled} aria-label={t.label} title={t.label}>
            <t.icon size={16} aria-hidden="true" />
          </button>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={disabled || uploading} aria-label="Insert image" title="Insert image">
          <ImagePlus size={16} aria-hidden="true" />
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
        {uploading && <span className="admin-hint" role="status">Uploading…</span>}
      </div>
      <textarea
        id={id}
        ref={ref}
        className="admin-textarea admin-md__text"
        rows={22}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        spellCheck
      />
      {error && <p className="admin__error" role="alert">{error}</p>}
    </div>
  );
}
