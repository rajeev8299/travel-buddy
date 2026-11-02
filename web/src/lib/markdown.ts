import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content");

/** Long-form body for an entry: content/<collection>/<slug>.md. Read at build time only.
 *  Front matter is editorial metadata (not always strict YAML) and the structured
 *  fields live in the TypeScript content files, so it is stripped, not parsed. */
export function readBody(collection: string, slug: string): string | null {
  const file = path.join(ROOT, collection, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const content = fs.readFileSync(file, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  // The page renders its own H1 and summary; drop a leading H1 from the file.
  return content.replace(/^\s*#\s+.+\n/, "").trim();
}
