import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  ExternalLink,
  Navigation,
  Loader2,
  Save,
  Compass,
} from "lucide-react";
import { api } from "../../lib/api";

export default function FoodAdmin() {
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit / Modal state
  const [editingShop, setEditingShop] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("1");
  const [formLocalityId, setFormLocalityId] = useState("1");
  const [formAddress, setFormAddress] = useState("");
  const [formLandmark, setFormLandmark] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMustTry, setFormMustTry] = useState("");
  const [formPrice, setFormPrice] = useState("150");
  const [formOpenTime, setFormOpenTime] = useState("08:00 AM");
  const [formCloseTime, setFormCloseTime] = useState("10:30 PM");
  const [formDays, setFormDays] = useState("Mon - Sun");
  const [formVeg, setFormVeg] = useState(true);
  const [formVerified, setFormVerified] = useState(true);
  const [formPublished, setFormPublished] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/food-explorer"),
      api.get("/food-explorer/categories"),
      api.get("/food-explorer/localities"),
    ])
      .then(([shopsRes, catRes, locRes]) => {
        setShops(shopsRes.shops || []);
        setCategories(catRes.categories || []);
        setLocalities(locRes.localities || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const notifySuccess = (msg) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 4500);
  };

  const notifyError = (msg) => {
    setError(msg);
    setSuccess("");
  };

  const openNewModal = () => {
    setIsNew(true);
    setEditingShop({});
    setFormName("");
    setFormSlug("");
    setFormCategoryId(categories[0]?.id?.toString() || "1");
    setFormLocalityId(localities[0]?.id?.toString() || "1");
    setFormAddress("");
    setFormLandmark("");
    setFormLat("25.3105");
    setFormLng("83.0085");
    setFormPhone("");
    setFormDesc("");
    setFormMustTry("");
    setFormPrice("150");
    setFormOpenTime("08:00 AM");
    setFormCloseTime("10:30 PM");
    setFormDays("Mon - Sun");
    setFormVeg(true);
    setFormVerified(true);
    setFormPublished(true);
  };

  const openEditModal = (shop) => {
    setIsNew(false);
    setEditingShop(shop);
    setFormName(shop.name || "");
    setFormSlug(shop.slug || "");
    setFormCategoryId((shop.category_id || 1).toString());
    setFormLocalityId((shop.locality_id || 1).toString());
    setFormAddress(shop.address || "");
    setFormLandmark(shop.nearby_landmark || "");
    setFormLat(shop.latitude ? shop.latitude.toString() : "");
    setFormLng(shop.longitude ? shop.longitude.toString() : "");
    setFormPhone(shop.phone || "");
    setFormDesc(shop.description || "");
    setFormMustTry(shop.must_try || "");
    setFormPrice((shop.price_for_two || 150).toString());
    setFormOpenTime(shop.open_time || "08:00 AM");
    setFormCloseTime(shop.close_time || "10:30 PM");
    setFormDays(shop.opening_days || "Mon - Sun");
    setFormVeg(Boolean(shop.is_pure_veg));
    setFormVerified(Boolean(shop.is_verified));
    setFormPublished(Boolean(shop.is_published));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      notifyError("Shop name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", formName.trim());
      formData.append("slug", formSlug.trim());
      formData.append("categoryId", formCategoryId);
      formData.append("localityId", formLocalityId);
      formData.append("address", formAddress.trim());
      formData.append("nearbyLandmark", formLandmark.trim());
      formData.append("latitude", formLat);
      formData.append("longitude", formLng);
      formData.append("phone", formPhone.trim());
      formData.append("description", formDesc.trim());
      formData.append("mustTry", formMustTry.trim());
      formData.append("priceForTwo", formPrice);
      formData.append("openTime", formOpenTime);
      formData.append("closeTime", formCloseTime);
      formData.append("openingDays", formDays);
      formData.append("isPureVeg", formVeg ? "1" : "0");
      formData.append("isVerified", formVerified ? "1" : "0");
      formData.append("isPublished", formPublished ? "1" : "0");

      if (fileInputRef.current?.files?.[0]) {
        formData.append("coverImage", fileInputRef.current.files[0]);
      }

      if (isNew) {
        await api.post("/admin/food-explorer", formData);
        notifySuccess("New food place added successfully with verified coordinates!");
      } else {
        await api.put(`/admin/food-explorer/${editingShop.id}`, formData);
        notifySuccess(`Updated ${formName} coordinates and information successfully!`);
      }

      setEditingShop(null);
      loadData();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from the Food Explorer?`)) {
      return;
    }

    try {
      await api.del(`/admin/food-explorer/${id}`);
      setShops((prev) => prev.filter((s) => s.id !== id));
      notifySuccess(`Deleted ${name} successfully.`);
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h1>Banaras Food Explorer & Location Manager</h1>
            <p className="admin-hint">
              Manage food places across all Varanasi localities. Verify real latitude/longitude coordinates, update menus, prices, and test Google Maps navigation links.
            </p>
          </div>
          <button type="button" className="btn btn--solid btn--sm" onClick={openNewModal}>
            <Plus size={16} /> Add Food Place
          </button>
        </div>
      </div>

      {error && <div className="admin-toast admin-toast--error">{error}</div>}
      {success && <div className="admin-toast admin-toast--success">{success}</div>}

      {/* Food Places Directory Table */}
      {loading ? (
        <p>Loading food places directory…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Place & Category</th>
                <th>Locality & Address</th>
                <th>Verified Map Coordinates</th>
                <th>Price & Veg</th>
                <th>Google Maps Route</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => {
                const mapsUrl = s.latitude && s.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ", " + s.address)}`;

                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                        {s.name}
                        {s.is_verified ? (
                          <ShieldCheck size={14} color="#059669" title="Verified Location" />
                        ) : null}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {s.category_name || "Street Food"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.locality_name || "Varanasi"}</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--muted)", maxWidth: "240px" }}>
                        {s.address}
                      </div>
                    </td>
                    <td>
                      {s.latitude && s.longitude ? (
                        <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--orange-deeper)" }}>
                          {s.latitude.toFixed(4)}°, {s.longitude.toFixed(4)}°
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--warn)" }}>Coordinates Missing</span>
                      )}
                    </td>
                    <td>
                      <div>₹{s.price_for_two} for 2</div>
                      <span className={`admin-badge ${s.is_pure_veg ? "admin-badge--approved" : "admin-badge--static"}`}>
                        {s.is_pure_veg ? "Pure Veg" : "Non-Veg"}
                      </span>
                    </td>
                    <td>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.78rem",
                          color: "var(--orange-deep)",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        <Navigation size={13} /> Test Directions <ExternalLink size={11} />
                      </a>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => openEditModal(s)}
                          title="Edit Details & Location"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm admin-reject"
                          onClick={() => handleDelete(s.id, s.name)}
                          title="Delete Place"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingShop && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: "1.35rem" }}>
                {isNew ? "Add New Food Place" : `Edit ${formName}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingShop(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                    Shop Name *
                  </label>
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Kashi Chaat Bhandar"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                    Category
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "#fff" }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                    Locality
                  </label>
                  <select
                    value={formLocalityId}
                    onChange={(e) => setFormLocalityId(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "#fff" }}
                  >
                    {localities.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                    Nearby Landmark
                  </label>
                  <input
                    value={formLandmark}
                    onChange={(e) => setFormLandmark(e.target.value)}
                    placeholder="Near Godowlia Chauraha"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                  Full Physical Address *
                </label>
                <input
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="D.37/49, Godowlia Crossing, Varanasi"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)" }}
                />
              </div>

              {/* Verified Geolocation Coordinates Inputs */}
              <div style={{ background: "var(--sand)", padding: 14, borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.88rem", marginBottom: 8, color: "var(--orange-deeper)" }}>
                  <Compass size={16} /> GPS Map Coordinates for Google Maps Navigation
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)" }}>Latitude (e.g. 25.3093)</label>
                    <input
                      type="number"
                      step="any"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      placeholder="25.3093"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)" }}>Longitude (e.g. 83.0076)</label>
                    <input
                      type="number"
                      step="any"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      placeholder="83.0076"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                    Iconic Must Try Dishes
                  </label>
                  <input
                    value={formMustTry}
                    onChange={(e) => setFormMustTry(e.target.value)}
                    placeholder="Tamatar Chaat, Palak Chaat"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                    Approx. Price for Two (₹)
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                  Description & Heritage
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="History, cooking style, seating..."
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                  Replace / Upload Cover Photo
                </label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" />
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={formVeg} onChange={(e) => setFormVeg(e.target.checked)} />
                  <span>Pure Vegetarian</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={formVerified} onChange={(e) => setFormVerified(e.target.checked)} />
                  <span>Verified Coordinates</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={formPublished} onChange={(e) => setFormPublished(e.target.checked)} />
                  <span>Published on Website</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setEditingShop(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--solid" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  <span>{isNew ? "Create Place" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
