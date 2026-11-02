"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/content/navigation";
import styles from "./Header.module.css";

/** Sticky header: 5 dropdown menus on desktop, an accordion drawer on mobile.
 *  Dropdowns open on click or keyboard, close on Escape / outside click / navigation. */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [solid, setSolid] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Close menus whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setDrawer(false);
  }

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (drawer) {
        setDrawer(false);
        burgerRef.current?.focus();
      }
      setOpen(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [drawer]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
  }, [drawer]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const solidHeader = solid || drawer || pathname !== "/";

  return (
    <header className={`${styles.header} ${solidHeader ? styles.solid : ""}`}>
      <div className={`shell ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="Varanasi Trip Companion — home">
          <span className={styles.mark} aria-hidden="true">V</span>
          <span className={styles.word}>Varanasi <span>Trip Companion</span></span>
        </Link>

        <nav ref={navRef} className={styles.nav} aria-label="Main">
          <ul className={styles.menu}>
            {NAV.map((group) => {
              const id = `menu-${group.label.toLowerCase().replace(/\W+/g, "-")}`;
              const expanded = open === group.label;
              const active = group.links.some((l) => isActive(l.href));
              return (
                <li key={group.label} className={styles.item}>
                  <button
                    type="button"
                    className={`${styles.trigger} ${active ? styles.active : ""}`}
                    aria-expanded={expanded}
                    aria-controls={id}
                    onClick={() => setOpen(expanded ? null : group.label)}
                  >
                    {group.label}
                    <span aria-hidden="true" className={styles.caret}>▾</span>
                  </button>
                  <div id={id} className={styles.panel} hidden={!expanded}>
                    <ul>
                      {group.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
                            <strong>{l.label}</strong>
                            {l.description && <span>{l.description}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link href="/search" className={styles.search} aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </Link>
          <Link href="/plan/trip-planner" className={`btn btn--primary ${styles.cta}`}>Plan my trip</Link>
          <button
            ref={burgerRef}
            type="button"
            className={styles.burger}
            aria-expanded={drawer}
            aria-controls="mobile-drawer"
            aria-label={drawer ? "Close menu" : "Open menu"}
            onClick={() => setDrawer((d) => !d)}
          >
            {drawer ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div id="mobile-drawer" className={styles.drawer} hidden={!drawer}>
        <div className="shell">
          <Link href="/search" className={styles.drawerSearch}>Search places, guides, experiences…</Link>
          {NAV.map((group) => (
            <details key={group.label} className={styles.acc}>
              <summary>{group.label}</summary>
              <ul>
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <Link href="/plan/trip-planner" className="btn btn--primary btn--block" style={{ marginTop: 16 }}>Plan my trip</Link>
          <Link href="/travel-guide/emergency" className={styles.emergency}>Emergency contacts</Link>
        </div>
      </div>
    </header>
  );
}
