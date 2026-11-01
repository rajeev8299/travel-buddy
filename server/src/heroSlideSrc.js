// Seeded slides point at a path inside the frontend's own public/ folder
// (e.g. "img/boats.jpg") — the frontend prefixes those with its BASE_URL
// itself. Admin-uploaded slides live on this server, so they need a full,
// absolute URL that works regardless of which origin renders the page.
export function heroSlideSrc(row, req) {
  if (row.source === "upload") {
    // Prefer the configured public URL: the Host header is client-controlled,
    // and anything cached in front of the API would otherwise serve whatever
    // host the first requester sent.
    const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;
    return `${base.replace(/\/$/, "")}/uploads/${row.image_path}`;
  }
  return row.image_path;
}
