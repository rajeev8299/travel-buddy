"use client";

import { useState, useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";
import { ShareIcon } from "@/components/shareIcons";

// Share a blog article. Plain share links — no third-party scripts, so no
// social network tracks readers here. Each shared link carries
// utm_source/utm_medium, which the site's own page_view events already record,
// so the analytics show which channel brought readers back.
type Channel = "native" | "whatsapp" | "facebook" | "x" | "linkedin" | "email" | "copy";

const noSubscribe = () => () => {};
const hasNativeShare = () => typeof navigator.share === "function";

const tagged = (url: string, source: string) => {
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "share");
  return u.toString();
};

export default function ShareArticle({ url, title }: { url: string; title: string }) {
  // navigator.share exists only in some browsers (mostly phones). The server
  // snapshot is false, so the server and first client render match.
  const canNativeShare = useSyncExternalStore(noSubscribe, hasNativeShare, () => false);
  const [status, setStatus] = useState("");

  const shared = (via: Channel) => track("article_shared", { via });

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url: tagged(url, "native") });
      shared("native");
    } catch {
      /* the reader closed the share sheet */
    }
  };

  const copy = async () => {
    const link = tagged(url, "copy");
    try {
      await navigator.clipboard.writeText(link);
      setStatus("Link copied.");
    } catch {
      // Clipboard blocked (older browsers, some in-app browsers): show the link to copy by hand.
      setStatus(`Copy this link: ${link}`);
    }
    shared("copy");
  };

  const text = `${title} — Varanasi Trip Companion`;
  const links: { via: "whatsapp" | "facebook" | "x" | "linkedin"; label: string; href: string }[] = [
    { via: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${tagged(url, "whatsapp")}`)}` },
    { via: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tagged(url, "facebook"))}` },
    { via: "x", label: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(tagged(url, "x"))}` },
    { via: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(tagged(url, "linkedin"))}` },
  ];

  return (
    <section className="share" aria-labelledby="share-title">
      <h2 id="share-title" className="share__title">Share this article</h2>
      <ul className="share__list">
        {canNativeShare && (
          <li>
            <button type="button" className="btn btn--primary share__btn" onClick={nativeShare}>
              <ShareIcon name="native" /> Share…
            </button>
          </li>
        )}
        {links.map((l) => (
          <li key={l.via}>
            <a
              className={`btn btn--outline share__btn share__btn--${l.via}`}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => shared(l.via)}
            >
              <ShareIcon name={l.via} /> {l.label}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
        <li>
          <a
            className="btn btn--outline share__btn"
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${tagged(url, "email")}`)}`}
            onClick={() => shared("email")}
          >
            <ShareIcon name="email" /> Email
          </a>
        </li>
        <li>
          <button type="button" className="btn btn--outline share__btn" onClick={copy}>
            <ShareIcon name="copy" /> Copy link
          </button>
        </li>
      </ul>
      <p className="share__status" role="status" aria-live="polite">{status}</p>
    </section>
  );
}
