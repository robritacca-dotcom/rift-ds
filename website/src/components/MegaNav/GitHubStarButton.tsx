"use client";

import { useEffect, useState } from "react";
import { GitHubIcon } from "../BrandIcons/BrandIcons";
import styles from "./GitHubStarButton.module.css";

/**
 * The repo link as a GitHub-style star button: the mark, then the live star
 * count. The count is read from the public GitHub API in the visitor's browser
 * at view time, so it never goes stale and never sits in the source as a
 * number. Without a count (offline, rate-limited) the button still links to the
 * repo, with the mark alone.
 */
export default function GitHubStarButton({ href }: { href: string }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Same-origin: the server route caches the GitHub response (see app/api/github-stars).
    fetch("/api/github-stars")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { stars?: number } | null) => {
        if (!cancelled && typeof data?.stars === "number") setStars(data.stars);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // A plain link, so the accessible name is the star count, not a bare number.
  const label = stars === null ? "GitHub repository" : `${stars.toLocaleString("en-US")} stars on GitHub`;
  return (
    <a className={styles.starLink} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <span className={styles.starMark} aria-hidden="true">
        <GitHubIcon />
      </span>
      {stars !== null && (
        <span className={styles.starCount} aria-hidden="true">
          {stars.toLocaleString("en-US")}
        </span>
      )}
    </a>
  );
}
