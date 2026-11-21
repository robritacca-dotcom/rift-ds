"use client";

import type { ComponentPropsWithoutRef } from "react";
import { DropdownMenu, type DropdownMenuEntry } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { Tooltip } from "rift-ds/components/Tooltip/Tooltip";
import styles from "./HeaderSwitcher.module.css";

/* The trigger as its own element, so the menu semantics DropdownMenu clones
   onto its trigger (the aria attributes, the click and the keys) land on
   the real button and not on the tooltip's wrapper. The tooltip names the
   bare icon; the sheet hides it while the menu is open, since the menu
   says it all. */
function Trigger({
  icon,
  tip,
  compact,
  onIntent,
  className,
  ...buttonProps
}: ComponentPropsWithoutRef<"button"> & { icon: string; tip: string; compact: boolean; onIntent?: () => void }) {
  return (
    <Tooltip content={tip} position="bottom" className={`${styles.tip} ${className ?? ""}`}>
      <button
        type="button"
        {...buttonProps}
        className={`${styles.trigger} ${compact ? styles.triggerCompact : ""}`}
        aria-label={tip}
        onPointerEnter={onIntent}
        onFocus={onIntent}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}

export interface HeaderSwitcherProps {
  /** The current choice's icon, worn by the trigger. Pass a string literal where it is chosen, so the site's icon cut sees it. */
  icon: string;
  /** The trigger's accessible name and tooltip, naming the control and the current choice ("Background: Prism"). */
  label: string;
  /** The menu's rows: each choice with its icon, its name, a line on it and `selected` on the current one. */
  items: DropdownMenuEntry[];
  /** The trigger's size: `compact` for a seat with less room, such as the header. */
  size?: "default" | "compact";
  /** Which trigger edge the menu hugs. */
  align?: "start" | "end";
  /** Called on hover or focus of the trigger, to start loading what a pick will need. */
  onIntent?: () => void;
  /** Additional classes on the tooltip wrapper, such as the header's bar-only or desktop-only seat. */
  className?: string;
}

/**
 * HeaderSwitcher: the one form every pick-one control in the site header
 * takes beside the theme switcher (the background, the layout, the colour
 * mode's condensed form). The package's DropdownMenu, with its layer stack,
 * placement and keys, behind a circular trigger on the theme switcher's
 * track recipe that wears the current choice's icon and a tooltip naming
 * it. A new header switcher composes this rather than drawing its own.
 */
export default function HeaderSwitcher({
  icon,
  label,
  items,
  size = "default",
  align = "end",
  onIntent,
  className,
}: HeaderSwitcherProps) {
  return (
    <DropdownMenu
      className={className}
      size={size}
      align={align}
      items={items}
      trigger={<Trigger icon={icon} tip={label} compact={size === "compact"} onIntent={onIntent} />}
    />
  );
}
