"use client";

import type { ShowcaseExample } from "./examples";
import styles from "./ThemeShowcase.module.css";

export { EXAMPLES, type ShowcaseExample } from "./examples";

/**
 * One example screen of the theme showcase as a mosaic: its wide panel on
 * top, the rest in balanced columns below. It paints nothing of its own
 * beyond token-drawn panels, so whatever theme surrounds it (the page's, or
 * a theme scope on a parent) is the theme it shows. The /foundations/themes
 * page leads with it, and the /labs/themes lab stages it full screen.
 *
 * The examples live here rather than in a route folder on purpose: their
 * names and figures are fictional demo data, and the chat corpus reads page
 * prose from route folders only, so none of it reaches the site chat.
 */
export function ShowcaseMosaic({
  example,
  id,
  className,
}: {
  example: ShowcaseExample;
  /** For a tab list's `aria-controls`. */
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={example.label}
      className={className ? `${styles.mosaic} ${className}` : styles.mosaic}
    >
      <div className={styles.wide}>{example.wide}</div>
      <div className={styles.columns}>
        {example.panels.map((panel, index) => (
          <div key={index} className={styles.cell}>
            {panel}
          </div>
        ))}
      </div>
    </section>
  );
}
