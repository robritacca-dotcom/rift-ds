import React from "react";
import styles from "./ProductMark.module.css";

/**
 * The generic product mark every template screen wears beside its product
 * name: a filled disc, the same on every screen, so a fictional product
 * never needs a logo drawn for it and the site's own brand mark never
 * stands in for one. design.md's Template screens section owns the
 * convention. Decorative: the name beside it is the accessible text.
 */
export function ProductMark({ className }: { className?: string }) {
  return (
    <span
      className={className ? `${styles.mark} ${className}` : styles.mark}
      aria-hidden="true"
    />
  );
}
