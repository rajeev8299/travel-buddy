import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Varanasi Trip Companion",
    short_name: "Varanasi Trip",
    description: "Discover the Soul of Varanasi. Plan Smarter. Travel with Confidence.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffcf6",
    theme_color: "#33200f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
