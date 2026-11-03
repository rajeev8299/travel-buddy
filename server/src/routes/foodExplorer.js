import { Router } from "express";
import { db } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

function resolveImageSrc(path, req) {
  if (!path) return "/img/street_food.jpg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("upload:")) {
    const filename = path.replace("upload:", "");
    return `${req.protocol}://${req.get("host")}/uploads/food/${filename}`;
  }
  return path.startsWith("/") ? path : `/${path}`;
}

// 1. Get all food categories
router.get("/categories", (req, res) => {
  const rows = db.prepare("SELECT * FROM food_categories ORDER BY sort_order, name").all();
  res.json({ categories: rows });
});

// 2. Get all localities
router.get("/localities", (req, res) => {
  const rows = db.prepare("SELECT * FROM food_localities ORDER BY name").all();
  res.json({ localities: rows });
});

// 3. Search and list food shops with optional distance calculation & filtering
router.get(
  "/shops",
  asyncHandler(async (req, res) => {
    const { category, locality, q, vegOnly, openNow, lat, lng, sort } = req.query;

    let query = `
      SELECT s.*, 
             c.name AS category_name, c.slug AS category_slug,
             l.name AS locality_name
      FROM food_shops s
      LEFT JOIN food_categories c ON s.category_id = c.id
      LEFT JOIN food_localities l ON s.locality_id = l.id
      WHERE s.is_published = 1
    `;
    const params = [];

    if (category && category !== "all") {
      query += ` AND (c.slug = ? OR c.name = ?)`;
      params.push(category, category);
    }

    if (locality && locality !== "all") {
      query += ` AND (l.slug = ? OR l.name = ?)`;
      params.push(locality, locality);
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      query += ` AND (s.name LIKE ? OR s.description LIKE ? OR s.must_try LIKE ? OR s.address LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (vegOnly === "true" || vegOnly === "1") {
      query += ` AND s.is_pure_veg = 1`;
    }

    query += ` ORDER BY s.is_verified DESC, s.rating DESC, s.name ASC`;

    const rows = db.prepare(query).all(...params);

    // Format results with real directions links & dynamic distance if user coordinates provided
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const hasUserLocation = !isNaN(userLat) && !isNaN(userLng);

    const shops = rows.map((r) => {
      let distanceKm = null;
      if (hasUserLocation && r.latitude && r.longitude) {
        // Haversine formula
        const R = 6371; // km
        const dLat = ((r.latitude - userLat) * Math.PI) / 180;
        const dLon = ((r.longitude - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((r.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = Math.round(R * c * 10) / 10;
      }

      // Safe verified Google Maps destination link
      const directionsUrl =
        r.latitude && r.longitude
          ? `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`
          : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.name + ", " + r.address + ", Varanasi")}`;

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        category: r.category_name,
        categorySlug: r.category_slug,
        locality: r.locality_name,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        directionsUrl,
        rating: r.rating,
        reviewCount: r.review_count,
        priceForTwo: r.price_for_two,
        priceTier: r.price_tier,
        openTime: r.open_time,
        closeTime: r.close_time,
        openingDays: r.opening_days,
        isPureVeg: Boolean(r.is_pure_veg),
        isVerified: Boolean(r.is_verified),
        mustTry: r.must_try,
        coverImage: resolveImageSrc(r.cover_image, req),
        distanceKm,
      };
    });

    if (sort === "nearest" && hasUserLocation) {
      shops.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sort === "price-low") {
      shops.sort((a, b) => (a.priceForTwo || 0) - (b.priceForTwo || 0));
    } else if (sort === "price-high") {
      shops.sort((a, b) => (b.priceForTwo || 0) - (a.priceForTwo || 0));
    }

    res.json({ shops, total: shops.length });
  }),
);

// 4. Get single food shop details by slug + its menu items + nearby recommendations
router.get(
  "/shops/:slug",
  asyncHandler(async (req, res) => {
    const shop = db
      .prepare(
        `SELECT s.*, 
                c.name AS category_name, c.slug AS category_slug,
                l.name AS locality_name
         FROM food_shops s
         LEFT JOIN food_categories c ON s.category_id = c.id
         LEFT JOIN food_localities l ON s.locality_id = l.id
         WHERE s.slug = ?`,
      )
      .get(req.params.slug);

    if (!shop) return res.status(404).json({ message: "Food shop not found." });

    // Menu items
    const menuItems = db
      .prepare(
        `SELECT * FROM food_menu_items 
         WHERE shop_id = ? 
         ORDER BY is_popular DESC, price ASC`,
      )
      .all(shop.id)
      .map((item) => ({
        ...item,
        is_veg: Boolean(item.is_veg),
        is_popular: Boolean(item.is_popular),
        image: resolveImageSrc(item.image, req),
      }));

    // Nearby food shops (in same locality or nearest coordinates)
    const nearbyRows = db
      .prepare(
        `SELECT s.*, c.name as category_name, l.name as locality_name
         FROM food_shops s
         LEFT JOIN food_categories c ON s.category_id = c.id
         LEFT JOIN food_localities l ON s.locality_id = l.id
         WHERE s.id != ? AND s.is_published = 1
         ORDER BY (CASE WHEN s.locality_id = ? THEN 0 ELSE 1 END), s.rating DESC
         LIMIT 4`,
      )
      .all(shop.id, shop.locality_id);

    const nearby = nearbyRows.map((n) => {
      let distanceKm = null;
      if (shop.latitude && shop.longitude && n.latitude && n.longitude) {
        const R = 6371;
        const dLat = ((n.latitude - shop.latitude) * Math.PI) / 180;
        const dLon = ((n.longitude - shop.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((shop.latitude * Math.PI) / 180) *
            Math.cos((n.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = Math.round(R * c * 10) / 10;
      }

      return {
        id: n.id,
        name: n.name,
        slug: n.slug,
        category: n.category_name,
        locality: n.locality_name,
        address: n.address,
        rating: n.rating,
        priceForTwo: n.price_for_two,
        priceTier: n.price_tier,
        coverImage: resolveImageSrc(n.cover_image, req),
        distanceKm,
        directionsUrl:
          n.latitude && n.longitude
            ? `https://www.google.com/maps/dir/?api=1&destination=${n.latitude},${n.longitude}`
            : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(n.name + ", " + n.address + ", Varanasi")}`,
      };
    });

    const directionsUrl =
      shop.latitude && shop.longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.name + ", " + shop.address + ", Varanasi")}`;

    res.json({
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        category: shop.category_name,
        categorySlug: shop.category_slug,
        locality: shop.locality_name,
        address: shop.address,
        latitude: shop.latitude,
        longitude: shop.longitude,
        nearbyLandmark: shop.nearby_landmark,
        phone: shop.phone,
        directionsUrl,
        rating: shop.rating,
        reviewCount: shop.review_count,
        priceForTwo: shop.price_for_two,
        priceTier: shop.price_tier,
        openTime: shop.open_time,
        closeTime: shop.close_time,
        openingDays: shop.opening_days,
        isPureVeg: Boolean(shop.is_pure_veg),
        isVerified: Boolean(shop.is_verified),
        description: shop.description,
        mustTry: shop.must_try,
        coverImage: resolveImageSrc(shop.cover_image, req),
      },
      menu: menuItems,
      nearby,
    });
  }),
);

export default router;