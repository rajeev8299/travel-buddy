import type { Metadata } from "next";

/** Public origin of this site (no trailing slash). Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100").replace(/\/$/, "");
export const SITE_NAME = "Varanasi Trip Companion";
export const TAGLINE = "Discover the Soul of Varanasi. Plan Smarter. Travel with Confidence.";

/** The Express API (enquiries, live alerts, analytics). */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/$/, "");

/** Support WhatsApp number, digits only with country code (e.g. 919876543210).
 *  Unset → WhatsApp buttons are hidden rather than pointing nowhere. */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
export const CONTACT_EMAIL = "hello@travelonbuddy.in";

interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Unverified ("review") content, utility pages, shared trips. */
  noindex?: boolean;
  canonical?: string;
}

export function pageMeta({ title, description, path, image = "/img/boats.jpg", noindex, canonical }: MetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: canonical ? `${SITE_URL}${canonical}` : url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      title,
      description,
      url,
      images: [{ url: `${SITE_URL}${image}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}${image}`] },
  };
}

/** JSON-LD helpers. */
export const organizationLd = {
  "@type": "TravelAgency",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  slogan: TAGLINE,
  areaServed: {
    "@type": "City",
    name: "Varanasi",
    alternateName: ["Banaras", "Kashi"],
    containedInPlace: { "@type": "State", name: "Uttar Pradesh" },
  },
};

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function formatDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
