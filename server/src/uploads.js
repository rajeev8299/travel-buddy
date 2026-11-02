import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "uploads");
export const heroUploadsDir = path.join(uploadsDir, "hero");
fs.mkdirSync(heroUploadsDir, { recursive: true });
export const blogUploadsDir = path.join(uploadsDir, "blog");
fs.mkdirSync(blogUploadsDir, { recursive: true });

const ALLOWED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, heroUploadsDir),
  filename: (req, file, cb) => {
    const ext = ALLOWED[file.mimetype] || path.extname(file.originalname) || "";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadHeroImage = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      // `expose` marks the message as safe to show the caller (see app.js).
      cb(Object.assign(new Error("Only JPEG, PNG or WEBP images are allowed."), { status: 400, expose: true }));
      return;
    }
    cb(null, true);
  },
});

// Blog images (covers, inline images, author photos). Same types and limit as
// hero photos; the route also checks the file's real signature.
export const uploadBlogImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, blogUploadsDir),
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED[file.mimetype] || ""}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      cb(Object.assign(new Error("Only JPEG, PNG or WEBP images are allowed."), { status: 400, expose: true }));
      return;
    }
    cb(null, true);
  },
});

/** True if the saved file really starts with a JPEG, PNG or WEBP signature.
 *  The browser-declared type is just a claim — a text file named photo.png
 *  passes multer's filter — so every image route checks this and deletes
 *  anything that fails. */
export function isRealImage(filePath) {
  const fd = fs.openSync(filePath, "r");
  const b = Buffer.alloc(12);
  try {
    fs.readSync(fd, b, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  return (
    (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP")
  );
}
