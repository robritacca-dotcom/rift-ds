import Link from "next/link";
import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark/BrandMark";
import { BRAND_NAME } from "@/config/brand.generated";
import { getSectionItems, docsSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import { SOCIAL_PROFILES, PROJECT_LINKS } from "@/config/social";
import { InstagramIcon, LinkedInIcon, XIcon } from "../BrandIcons/BrandIcons";
import FadeDivider from "../FadeDivider/FadeDivider";
import styles from "./SiteFooter.module.css";

/**
 * SiteFooter — the sitemap footer: a brand block (mark, name, social
 * icons) beside four columns holding five link groups (Site hand-curated
 * below, three from the nav config, Elsewhere from social.ts), then a
 * quiet copyright row.
 * Server component; column data resolves once at module scope.
 */

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/privacy", label: "Privacy" },
];

// The top-level sections, one row each — derived from the nav config.
const designSystemLinks = getSectionItems().map(({ href, label, desktopOnly }) => ({
  href,
  label,
  desktopOnly,
}));

const docsLinks = docsSidebarLinks
  .filter((link) => link.label !== "Contents")
  .map(({ href, label }) => ({ href, label }));

// Skip the "Contents" entry; /foundations itself sits in the DS column.
const foundationLinks = foundationsSidebarLinks
  .slice(1)
  .map(({ href, label }) => ({ href, label }));

const SOCIAL_ICONS: Record<string, ReactNode> = {
  LinkedIn: <LinkedInIcon />,
  X: <XIcon />,
  Instagram: <InstagramIcon />,
};

/* The icon row skips GitHub (the Elsewhere column already links it) and
   Email (the site publishes no direct contact channel; the repository is
   the way to reach the project). */
const socialIconProfiles = SOCIAL_PROFILES.filter(
  (profile) => profile.label in SOCIAL_ICONS
);

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; desktopOnly?: boolean }[];
}) {
  return (
    <div className={styles.column}>
      <h2 className={styles.columnTitle}>{title}</h2>
      <ul className={styles.columnList}>
        {links.map((link) => (
          <li
            key={link.href}
            className={link.desktopOnly ? styles.desktopOnly : undefined}
          >
            <Link href={link.href} className={styles.link}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <FadeDivider />

      {/* Brand block + links. The brand block is exactly as wide as the
          docs shell's nav rail and its column gap, so the link grid starts
          on the same line the page's content does — on the pages that have
          a rail, and identically on the pages that don't. */}
      <div className={styles.body}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandMark} aria-label={`${BRAND_NAME}, home`}>
            <BrandMark />
            <span className={styles.brandName}>{BRAND_NAME}</span>
          </Link>
          <ul className={styles.socialRow}>
            {socialIconProfiles.map((profile) => (
              <li key={profile.label}>
                <a
                  href={profile.href}
                  className={styles.socialLink}
                  aria-label={profile.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  {SOCIAL_ICONS[profile.label]}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          {/* The two shortest groups share the first column, so four
              columns cover five groups — the same trick that keeps the
              column heights from running away from each other. */}
          <div className={styles.columnStack}>
            <LinkColumn title="Site" links={siteLinks} />
            <LinkColumn title="Design system" links={designSystemLinks} />
          </div>
          <LinkColumn title="Docs" links={docsLinks} />
          <LinkColumn title="Foundations" links={foundationLinks} />
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Elsewhere</h2>
            <ul className={styles.columnList}>
              {PROJECT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={styles.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                    <span
                      className={`material-symbols-rounded ${styles.externalIcon}`}
                      aria-hidden="true"
                    >
                      open_in_new
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.bottomText}>
          &copy; {new Date().getFullYear()} {BRAND_NAME} · MIT licensed
        </p>
      </div>
    </footer>
  );
}
