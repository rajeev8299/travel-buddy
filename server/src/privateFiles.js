import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Encrypted storage for verification documents (ID scans and the like).
// Files are encrypted in memory with AES-256-GCM before anything touches disk
// and live in the private data folder — never the public /uploads folder.
// Without BUDDY_DOCS_KEY (64 hex characters) uploads are refused rather than
// stored unencrypted. Each file's random name is bound into the encryption, so
// a file can't be swapped for another and still decrypt.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "..", "data", "private-docs");
fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });

const key = () => {
  const hex = process.env.BUDDY_DOCS_KEY || "";
  return /^[0-9a-f]{64}$/i.test(hex) ? Buffer.from(hex, "hex") : null;
};
export const privateFilesConfigured = () => Boolean(key());
const fileFor = (storageKey) => {
  if (!/^[0-9a-f]{32}$/.test(storageKey)) throw new Error("Bad storage key");
  return path.join(DIR, `${storageKey}.bin`);
};

/** Encrypts and stores a buffer; returns its storage key. */
export function saveEncrypted(buffer) {
  const k = key();
  if (!k) throw Object.assign(new Error("Document storage isn't set up."), { status: 503, expose: true });
  const storageKey = crypto.randomBytes(16).toString("hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  cipher.setAAD(Buffer.from(storageKey));
  const body = Buffer.concat([cipher.update(buffer), cipher.final()]);
  fs.writeFileSync(fileFor(storageKey), Buffer.concat([iv, cipher.getAuthTag(), body]), { mode: 0o600 });
  return storageKey;
}

export function readDecrypted(storageKey) {
  const k = key();
  if (!k) throw Object.assign(new Error("Document storage isn't set up."), { status: 503, expose: true });
  const raw = fs.readFileSync(fileFor(storageKey));
  const decipher = crypto.createDecipheriv("aes-256-gcm", k, raw.subarray(0, 12));
  decipher.setAAD(Buffer.from(storageKey));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
}

export function deleteEncrypted(storageKey) {
  if (storageKey) fs.rmSync(fileFor(storageKey), { force: true });
}

/** Real type from the file's first bytes (the browser's claim isn't trusted). */
export function sniffDocument(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  return null;
}
