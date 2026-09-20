import React from "react";
import "./SectionTitle.css";

export interface SectionTitleProps {
  /** Section heading text */
  title: string;
  /** Optional trailing content (count, badge, metadata) */
  trailing?: React.ReactNode;
  /** Whether to draw the bottom divider line. Set false above content that draws its own lines (bordered tables, calendars), so the section separates by whitespace alone. */
  divider?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function SectionTitle({
  title,
  trailing,
  divider = true,
  className,
}: SectionTitleProps) {
  const classes = [
    "ds-section-title",
    !divider && "ds-section-title--no-divider",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <h2 className="ds-section-title__heading">{title}</h2>
      {trailing !== undefined && trailing !== null && (
        <span className="ds-section-title__trailing">{trailing}</span>
      )}
    </div>
  );
}
