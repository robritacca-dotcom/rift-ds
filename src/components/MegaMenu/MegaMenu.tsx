import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { mirrorClass } from '../../behaviors/direction';
import './MegaMenu.css';
import '../../fonts/material-symbols.css';
import '../../behaviors/direction.css';

/** One link row in a mega menu: a page and the line that says what is on it. */
export interface MegaMenuItem {
  /** Where the row links. */
  href: string;
  /** The page's name. */
  label: string;
  /** One line on what the page holds, clamped to two lines in the panel. */
  description?: string;
  /** A Material Symbols name drawn in the row's icon tile. */
  icon?: string;
  /** An image path drawn in the icon tile instead of `icon`, for a brand or product mark. */
  logo?: string;
}

/** The featured card beside a mega menu's link grid: one link that is the whole card. */
export interface MegaMenuShowcase {
  /** Where the card links. */
  href: string;
  /** A short kicker above the title, set in the overline face. */
  overline?: string;
  /** The card's title, followed by a forward arrow. */
  label: string;
  /** One or two lines under the title. */
  description?: string;
  /**
   * A drawing that fills the card behind the copy. Decorative: the title and
   * description carry the meaning, so mark it `aria-hidden`.
   */
  cover?: React.ReactNode;
}

/** Props owned by MegaMenu itself — everything else falls through to the panel `<div>`. */
type MegaMenuOwnProps = {
  /**
   * Whether the panel shows. Controlled by design: the host owns the
   * triggers that open it, so it owns this state too. A closed panel fades
   * out and is `inert`, so its links leave the tab order.
   */
  open: boolean;
  /** The link rows, laid out four to a column and wrapping into further columns. */
  items: MegaMenuItem[];
  /** A featured card in its own column beside the link grid. */
  showcase?: MegaMenuShowcase;
  /**
   * The path of the page being viewed. A row whose `href` is this path, or a
   * parent of it, is marked as the current page.
   */
  currentHref?: string;
  /** Called when any link in the panel is followed, so a host can close it. */
  onNavigate?: () => void;
  /**
   * The component every link renders through, so a router's link (Next.js
   * `Link`) navigates without a reload. The panel is server-renderable, so it
   * cannot read a `LinkProvider`; a client host resolves one and passes it
   * here. Defaults to `<a>`.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes on the panel. */
  className?: string;
};

export interface MegaMenuProps
  extends MegaMenuOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof MegaMenuOwnProps> {}

const isCurrent = (href: string, currentHref?: string) =>
  currentHref != null && (currentHref === href || currentHref.startsWith(`${href}/`));

/**
 * A wide navigation panel: a grid of icon rows, each a page with a line of
 * description, and an optional featured card in a column of its own. It is
 * the panel only. The host places it (under a header bar, usually) and owns
 * the triggers, the hover delay and the dismissal; SiteHeader is the
 * reference host. The forwarded ref and any unrecognised props target the
 * panel `<div>`.
 */
export function MegaMenu({
  open,
  items,
  showcase,
  currentHref,
  onNavigate,
  linkComponent,
  className = '',
  ref,
  ...rest
}: MegaMenuProps) {
  const Link = linkComponent ?? 'a';
  const baseClass = 'ds-mega-menu';
  const classes = [baseClass, open && `${baseClass}--open`, className].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={ref} className={classes} inert={!open}>
      <div
        className={[`${baseClass}__layout`, showcase && `${baseClass}__layout--showcase`]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={`${baseClass}__grid`}>
          {items.map((item) => {
            const current = isCurrent(item.href, currentHref);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[`${baseClass}__item`, current && `${baseClass}__item--current`]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={current ? 'page' : undefined}
                onClick={onNavigate}
              >
                {(item.logo || item.icon) && (
                  <span className={`${baseClass}__icon`} aria-hidden="true">
                    {item.logo ? (
                      <img className={`${baseClass}__logo`} src={item.logo} alt="" />
                    ) : (
                      <span className={`material-symbols-rounded ${mirrorClass(item.icon)}`}>{item.icon}</span>
                    )}
                  </span>
                )}
                <span className={`${baseClass}__text`}>
                  <span className={`${baseClass}__label`}>{item.label}</span>
                  {item.description && (
                    <span className={`${baseClass}__description`}>{item.description}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {showcase && (
          <div className={`${baseClass}__showcase-column`}>
            <Link href={showcase.href} className={`${baseClass}__showcase`} onClick={onNavigate}>
              {showcase.cover && <span className={`${baseClass}__cover`}>{showcase.cover}</span>}
              <span className={`${baseClass}__showcase-text`}>
                {showcase.overline && (
                  <span className={`${baseClass}__overline`}>{showcase.overline}</span>
                )}
                <span className={`${baseClass}__label ${baseClass}__showcase-title`}>
                  {showcase.label}
                  <span
                    className={`material-symbols-rounded ds-mirror-rtl ${baseClass}__arrow`}
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </span>
                {showcase.description && (
                  <span className={`${baseClass}__description`}>{showcase.description}</span>
                )}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
