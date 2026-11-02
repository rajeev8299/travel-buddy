import type { NextConfig } from "next";

// The public site is almost entirely content read from files at build time,
// so it uses plain static generation (generateStaticParams) rather than
// Cache Components. Live data — today's alerts, enquiries — is fetched from
// the Express API in the browser.
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Addresses from the retired static site (docs/), so old links and search
  // results land on the matching page instead of a 404.
  async redirects() {
    const old: Record<string, string> = {
      "/index.html": "/",
      "/become-a-buddy.html": "/become-a-buddy",
      "/privacy.html": "/privacy",
      "/terms.html": "/terms",
      "/refund-policy.html": "/cancellation-policy",
      "/experiences.html": "/experiences",
      "/plan.html": "/plan",
      "/why-buddy.html": "/about/how-we-verify",
      "/buddies.html": "/about",
      "/stories.html": "/about",
      "/sunrise-boat-ride.html": "/experiences/sunrise-rowing-boat-assi",
      "/ganga-aarti.html": "/experiences/evening-aarti-from-a-boat",
      "/old-city-food-walk.html": "/experiences/old-city-food-walk",
      "/kashi-vishwanath-visit.html": "/experiences/kashi-vishwanath-with-local-guide",
      "/sarnath-half-day.html": "/experiences/sarnath-half-day-with-transport",
      "/silk-weavers-madanpura.html": "/experiences/madanpura-weavers-visit",
      "/login.html": "/",
      "/signup.html": "/",
      "/offline.html": "/",
    };
    return Object.entries(old).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
