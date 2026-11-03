import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "uploads");
export const heroUploadsDir = path.join(uploadsDir, "hero");
export const foodUploadsDir = path.join(uploadsDir, "food");
fs.mkdirSync(heroUploadsDir, { recursive: true });
fs.mkdirSync(foodUploadsDir, { recursive: true });

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

const foodStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, foodUploadsDir),
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

export const uploadFoodImage = multer({
  storage: foodStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      cb(new Error("Only JPEG, PNG or WEBP images are allowed."));
      return;
    }
    cb(null, true);
  },
});
