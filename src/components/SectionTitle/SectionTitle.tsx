import React from "react";
import "./SectionTitle.css";

/** Props owned by SectionTitle itself — everything else falls through to the root div. */
type SectionTitleOwnProps = {
  /**
   * Section heading text.
   * Note: this shadows the native `title` tooltip attribute, which SectionTitle does not expose.
   */
  title: string;
  /** Optional trailing content (count, badge, metadata) */
  trailing?: React.ReactNode;
  /** Whether to draw the bottom divider line. Set false above content that draws its own lines (bordered tables, calendars), so the section separates by whitespace alone. */
  divider?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface SectionTitleProps
  extends SectionTitleOwnProps,
    Omit<React.ComponentPropsWithoutRef<"div">, keyof SectionTitleOwnProps | "children"> {}

/**
 * SectionTitle — an `<h2>` section heading with optional trailing content
 * and a bottom divider. Forwards a ref to the root div and spreads native
 * attributes onto it.
 */
export const SectionTitle = React.forwardRef<HTMLDivElement, SectionTitleProps>(
  ({ title, trailing, divider = true, className, ...rest }, ref) => {
    const classes = [
      "ds-section-title",
      !divider && "ds-section-title--no-divider",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div {...rest} ref={ref} className={classes}>
        <h2 className="ds-section-title__heading">{title}</h2>
        {trailing !== undefined && trailing !== null && (
          <span className="ds-section-title__trailing">{trailing}</span>
        )}
      </div>
    );
  },
);

SectionTitle.displayName = "SectionTitle";
