import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AlertStrip from "@/components/AlertStrip";
import RouteTracker from "@/components/RouteTracker";
import { JsonLd } from "@/components/content";
import { SITE_NAME, SITE_URL, TAGLINE, organizationLd } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fraunces", display: "swap" });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-work-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Plan Your Varanasi Trip`, template: `%s | ${SITE_NAME}` },
  description: TAGLINE,
  applicationName: SITE_NAME,
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#33200f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${workSans.variable}`}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <AlertStrip />
        <RouteTracker />
        <JsonLd
          data={{
            "@graph": [
              organizationLd,
              { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-IN",
                potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/search?q={query}`, "query-input": "required name=query" } },
            ],
          }}
        />
      </body>
    </html>
  );
}
