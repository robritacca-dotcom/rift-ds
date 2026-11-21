import React from "react";
import { headingSlug } from "../../behaviors/headingSlug";
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
  /**
   * Give the heading an id and a "#" link to itself, shown on hover and
   * focus, as Heading's `anchor` does. `true` makes the id from the title;
   * a string sets it. The id lands on the heading, not the root, so an
   * `id` passed through goes to the root and the link targets the anchor.
   */
  anchor?: boolean | string;
  /** Accessible name of the anchor link, given the title. Defaults to "Link to <title>". */
  anchorLabel?: (title: string) => string;
  /** Additional CSS classes */
  className?: string;
};

export interface SectionTitleProps
  extends SectionTitleOwnProps,
    Omit<React.ComponentPropsWithoutRef<"div">, keyof SectionTitleOwnProps | "children"> {}

/**
 * SectionTitle — an `<h2>` section heading with optional trailing content
 * and a bottom divider, and with `anchor` a link to itself. Forwards a ref to the root div and spreads native
 * attributes onto it.
 */
export const SectionTitle = React.forwardRef<HTMLDivElement, SectionTitleProps>(
  ({ title, trailing, divider = true, anchor, anchorLabel = (text) => `Link to ${text}`, className, ...rest }, ref) => {
    const id = typeof anchor === "string" ? anchor : anchor ? headingSlug(title) || undefined : undefined;
    const classes = [
      "ds-section-title",
      !divider && "ds-section-title--no-divider",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div {...rest} ref={ref} className={classes}>
        <h2 className={`ds-section-title__heading${id ? " ds-section-title__heading--anchored" : ""}`} id={id}>
          {title}
          {id && (
            <a className="ds-section-title__anchor" href={`#${id}`} aria-label={anchorLabel(title)}>
              #
            </a>
          )}
        </h2>
        {trailing !== undefined && trailing !== null && (
          <span className="ds-section-title__trailing">{trailing}</span>
        )}
      </div>
    );
  },
);

SectionTitle.displayName = "SectionTitle";
