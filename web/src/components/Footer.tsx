import Link from "next/link";
import { FOOTER } from "@/content/navigation";
import { CONTACT_EMAIL, SITE_NAME, TAGLINE } from "@/lib/site";
import styles from "./Footer.module.css";

function Col({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title} className={styles.col}>
      <h2>{title}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.name}>{SITE_NAME}</p>
          <p className={styles.tag}>{TAGLINE}</p>
          <p className={styles.contact}>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <Link href="/travel-guide/emergency" className={styles.emergency}>Emergency contacts →</Link>
        </div>
        <Col title="Explore" links={FOOTER.explore} />
        <Col title="Plan" links={FOOTER.plan} />
        <Col title="Services" links={FOOTER.services} />
        <Col title="About" links={FOOTER.about} />
      </div>
      <div className={`shell ${styles.base}`}>
        <p>© {year} {SITE_NAME}. Information is checked against official sources; always confirm timings on the day.</p>
        <ul>
          {FOOTER.legal.map((l) => (
            <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
          ))}
          <li><Link href="/about/photo-credits">Photo credits</Link></li>
        </ul>
      </div>
    </footer>
  );
}
