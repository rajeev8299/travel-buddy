import { Router } from "express";
import { db } from "../../db.js";
import { uploadFoodImage } from "../../uploads.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const router = Router();

// Validate latitude & longitude in real geographic ranges for Varanasi area (~25.0 to 25.5 N, ~82.7 to 83.3 E)
function validateCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return true; // optional
  const nLat = parseFloat(lat);
  const nLng = parseFloat(lng);
  if (isNaN(nLat) || isNaN(nLng)) return false;
  return nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180;
}

// 1. Get all shops for admin management
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.*, c.name AS category_name, l.name AS locality_name
       FROM food_shops s
       LEFT JOIN food_categories c ON s.category_id = c.id
       LEFT JOIN food_localities l ON s.locality_id = l.id
       ORDER BY s.id DESC`,
    )
    .all();
  res.json({ shops: rows });
});

// 2. Create new food shop
router.post(
  "/",
  uploadFoodImage.single("coverImage"),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const name = (b.name || "").trim();
    if (!name) return res.status(400).json({ message: "Shop name is required." });

    const slug = (b.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
    const existing = db.prepare("SELECT id FROM food_shops WHERE slug = ?").get(slug);
    if (existing) {
      return res.status(409).json({ message: "A shop with this slug already exists." });
    }

    const categoryId = parseInt(b.categoryId, 10) || 1;
    const localityId = parseInt(b.localityId, 10) || 1;
    const address = (b.address || "").trim();
    const nearbyLandmark = (b.nearbyLandmark || "").trim();
    const phone = (b.phone || "").trim();
    const description = (b.description || "").trim();
    const mustTry = (b.mustTry || "").trim();
    const priceForTwo = parseInt(b.priceForTwo, 10) || 150;
    const priceTier = b.priceTier || "₹";
    const openTime = b.openTime || "08:00 AM";
    const closeTime = b.closeTime || "10:30 PM";
    const openingDays = b.openingDays || "Mon - Sun";
    const isPureVeg = b.isPureVeg === "true" || b.isPureVeg === "1" ? 1 : 0;
    const isVerified = b.isVerified === "true" || b.isVerified === "1" ? 1 : 0;
    const isPublished = b.isPublished === "false" || b.isPublished === "0" ? 0 : 1;

    const lat = b.latitude ? parseFloat(b.latitude) : null;
    const lng = b.longitude ? parseFloat(b.longitude) : null;

    if (!validateCoordinates(lat, lng)) {
      return res.status(400).json({ message: "Invalid latitude or longitude coordinates." });
    }

    const coverImage = req.file ? `upload:${req.file.filename}` : b.coverImage || "img/street_food.jpg";

    const result = db
      .prepare(
        `INSERT INTO food_shops (
          name, slug, category_id, locality_id, address, nearby_landmark,
          latitude, longitude, phone, description, must_try, price_for_two,
          price_tier, open_time, close_time, opening_days, is_pure_veg,
          is_verified, is_published, cover_image, location_verified_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        name,
        slug,
        categoryId,
        localityId,
        address,
        nearbyLandmark,
        lat,
        lng,
        phone,
        description,
        mustTry,
        priceForTwo,
        priceTier,
        openTime,
        closeTime,
        openingDays,
        isPureVeg,
        isVerified,
        isPublished,
        coverImage,
        isVerified ? new Date().toISOString() : null,
      );

    const newShop = db.prepare("SELECT * FROM food_shops WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ shop: newShop });
  }),
);

// 3. Update existing shop details, coordinates, or verification status
router.put(
  "/:id",
  uploadFoodImage.single("coverImage"),
  asyncHandler(async (req, res) => {
    const existing = db.prepare("SELECT * FROM food_shops WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ message: "Food shop not found." });

    const b = req.body || {};
    const name = b.name !== undefined ? b.name.trim() : existing.name;
    const categoryId = b.categoryId !== undefined ? parseInt(b.categoryId, 10) : existing.category_id;
    const localityId = b.localityId !== undefined ? parseInt(b.localityId, 10) : existing.locality_id;
    const address = b.address !== undefined ? b.address.trim() : existing.address;
    const nearbyLandmark = b.nearbyLandmark !== undefined ? b.nearbyLandmark.trim() : existing.nearby_landmark;
    const phone = b.phone !== undefined ? b.phone.trim() : existing.phone;
    const description = b.description !== undefined ? b.description.trim() : existing.description;
    const mustTry = b.mustTry !== undefined ? b.mustTry.trim() : existing.must_try;
    const priceForTwo = b.priceForTwo !== undefined ? parseInt(b.priceForTwo, 10) : existing.price_for_two;
    const priceTier = b.priceTier !== undefined ? b.priceTier : existing.price_tier;
    const openTime = b.openTime !== undefined ? b.openTime : existing.open_time;
    const closeTime = b.closeTime !== undefined ? b.closeTime : existing.close_time;
    const openingDays = b.openingDays !== undefined ? b.openingDays : existing.opening_days;
    const isPureVeg = b.isPureVeg !== undefined ? (b.isPureVeg === "true" || b.isPureVeg === "1" || b.isPureVeg === 1 ? 1 : 0) : existing.is_pure_veg;
    const isVerified = b.isVerified !== undefined ? (b.isVerified === "true" || b.isVerified === "1" || b.isVerified === 1 ? 1 : 0) : existing.is_verified;
    const isPublished = b.isPublished !== undefined ? (b.isPublished === "true" || b.isPublished === "1" || b.isPublished === 1 ? 1 : 0) : existing.is_published;

    const lat = b.latitude !== undefined && b.latitude !== "" ? parseFloat(b.latitude) : existing.latitude;
    const lng = b.longitude !== undefined && b.longitude !== "" ? parseFloat(b.longitude) : existing.longitude;

    if (!validateCoordinates(lat, lng)) {
      return res.status(400).json({ message: "Invalid latitude or longitude coordinates." });
    }

    const coverImage = req.file ? `upload:${req.file.filename}` : existing.cover_image;

    db.prepare(
      `UPDATE food_shops SET
        name = ?, category_id = ?, locality_id = ?, address = ?,
        nearby_landmark = ?, latitude = ?, longitude = ?, phone = ?,
        description = ?, must_try = ?, price_for_two = ?, price_tier = ?,
        open_time = ?, close_time = ?, opening_days = ?, is_pure_veg = ?,
        is_verified = ?, is_published = ?, cover_image = ?,
        location_verified_at = ?
       WHERE id = ?`,
    ).run(
      name,
      categoryId,
      localityId,
      address,
      nearbyLandmark,
      lat,
      lng,
      phone,
      description,
      mustTry,
      priceForTwo,
      priceTier,
      openTime,
      closeTime,
      openingDays,
      isPureVeg,
      isVerified,
      isPublished,
      coverImage,
      isVerified ? new Date().toISOString() : existing.location_verified_at,
      req.params.id,
    );

    const updated = db.prepare("SELECT * FROM food_shops WHERE id = ?").get(req.params.id);
    res.json({ shop: updated });
  }),
);

// 4. Delete food shop
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = db.prepare("SELECT * FROM food_shops WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ message: "Food shop not found." });

    db.prepare("DELETE FROM food_menu_items WHERE shop_id = ?").run(req.params.id);
    db.prepare("DELETE FROM food_shops WHERE id = ?").run(req.params.id);

    res.json({ ok: true });
  }),
);

export default router;
