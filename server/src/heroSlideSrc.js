// Seeded slides point at a path inside the frontend's own public/ folder
// (e.g. "img/boats.jpg") — the frontend prefixes those with its BASE_URL
// itself. Admin-uploaded slides live on this server, so they need a full,
// absolute URL that works regardless of which origin renders the page.
export function heroSlideSrc(row, req) {
  if (row.source === "upload") {
    return `${req.protocol}://${req.get("host")}/uploads/${row.image_path}`;
  }
  return row.image_path;
}
