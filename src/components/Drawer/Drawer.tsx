'use client';

import React, { useRef, useId } from 'react';
import { IconButton } from '../IconButton/IconButton';
import ReactDOM from 'react-dom';
import './Drawer.css';
import '../../behaviors/direction.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import { useMounted } from '../../behaviors/useMounted';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';

/** Props owned by Drawer itself — everything else falls through to the panel. */
type DrawerOwnProps = {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when the drawer requests to close */
  onOpenChange: (open: boolean) => void;
  /**
   * Drawer title.
   * Note: this shadows the native `title` tooltip attribute, which Drawer does not expose.
   */
  title: string;
  /** Optional subtitle under the title */
  description?: string;
  /**
   * Content shown in place of the title text, such as a site's logo. The
   * `title` still names the dialog, read by assistive tech from a visually
   * hidden heading.
   */
  heading?: React.ReactNode;
  /** Drawer body content */
  children?: React.ReactNode;
  /** Optional footer slot — typically a row of Buttons */
  footer?: React.ReactNode;
  /**
   * Edge the panel slides in from. `left` and `right` are the screen's
   * edges in any reading direction; `start` and `end` follow it, so a
   * `start` drawer opens on the left in English and on the right in Arabic.
   */
  side?: 'left' | 'right' | 'start' | 'end' | 'top' | 'bottom';
  /** Panel size along the axis it slides on */
  size?: 'sm' | 'md' | 'lg';
  /** Whether ESC, scrim click, and the close button can dismiss */
  dismissible?: boolean;
  /**
   * Whether the drawer takes over the page. `true` (the default) draws the
   * scrim, traps focus, locks scroll and makes the page behind inert. `false`
   * leaves the page live beside the panel, for a detail view that follows a
   * list: no scrim, no trap, and a press outside never closes it. Focus still
   * moves into the panel on open; on close it returns to the opener only if
   * it is still inside the panel.
   */
  modal?: boolean;
  /**
   * How the panel meets the edge. `flush` (the default) runs to the edge with
   * a hairline on the side facing the page; `floating` holds the panel off
   * every edge as a raised, rounded card.
   */
  layout?: 'flush' | 'floating';
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** Additional CSS classes — applied to the portal container, not the panel */
  className?: string;
};

export interface DrawerProps
  extends DrawerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DrawerOwnProps> {}

/**
 * Drawer component — an edge-anchored panel that slides in over the page.
 * Shares Dialog's modal semantics (focus trap, focus restore, scroll lock,
 * ESC/scrim dismissal) but is anchored to a viewport edge, which suits
 * filter panels, detail views, and mobile navigation. With `modal={false}`
 * it rests beside a page that stays live.
 *
 * Renders through a portal into `document.body`. The forwarded ref and any
 * unrecognised props target the **panel** (the `role="dialog"` element), not the
 * portal container.
 */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      heading,
      children,
      footer,
      side = 'right',
      size = 'md',
      dismissible = true,
      modal = true,
      layout = 'flush',
      closeLabel = 'Close drawer',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const titleId = useId();
    const descId = useId();
    const baseClass = 'ds-drawer';

    /** Keep the internal ref (used by the focus trap) while honouring a forwarded one. */
    const setPanelRef = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    // SSR guard — only render the portal on the client
    const mounted = useMounted();

    // Shared overlay behaviors (src/behaviors/) — see Dialog for the
    // contract. Scrim dismissal stays below: it is this component's own DOM.
    // A non-modal drawer never owns a press, so it sits on the stack as a
    // passive layer: Escape still reaches it, and a press on the live page
    // beside it passes through to whatever is open beneath.
    const layer = useLayer({
      open,
      dismissOnEscape: dismissible,
      onDismiss: () => onOpenChange(false),
      passive: !modal,
      getElements: modal ? undefined : () => [panelRef.current],
    });
    useFocusScope(panelRef, {
      active: open,
      trap: modal,
      inertOutside: modal,
      // The page stays live beside a non-modal drawer, so by the time it
      // closes focus may already be where the reader put it. Only a focus
      // still inside the panel goes back to the opener.
      restoreFocus: modal
        ? true
        : () => {
            const active = document.activeElement;
            if (!(active instanceof HTMLElement) || active === document.body) return null;
            return panelRef.current?.contains(active) ? null : active;
          },
    });
    useScrollLock(open && modal);

    // A press that began while a menu or popover was open above this layer was
    // that layer's press: it closed the menu, and must not also close this.
    const handleScrimClick = () => {
      if (dismissible && layer.ownsPress()) onOpenChange(false);
    };

    const classes = [
      baseClass,
      `${baseClass}--${side}`,
      `${baseClass}--${size}`,
      layout === 'floating' ? `${baseClass}--floating` : '',
      modal ? '' : `${baseClass}--non-modal`,
      open ? `${baseClass}--open` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const drawer = (
      <div className={classes} data-state={open ? 'open' : 'closed'}>
        {modal && <div className={`${baseClass}__scrim`} onClick={handleScrimClick} />}

        {/* data-state is the open state as an attribute, for a consumer's
            styles and tests; the drawer stays mounted so it can slide shut,
            so its presence in the DOM never means it is open. */}
        <div
          {...rest}
          className={`${baseClass}__panel`}
          data-state={open ? 'open' : 'closed'}
          ref={setPanelRef}
          role="dialog"
          aria-modal={modal ? 'true' : undefined}
          aria-labelledby={titleId}
          aria-describedby={description ? descId : rest['aria-describedby']}
          tabIndex={-1}
        >
          <div className={`${baseClass}__header`}>
            <div className={`${baseClass}__heading`}>
              <h2
                className={heading ? 'ds-visually-hidden' : `${baseClass}__title`}
                id={titleId}
              >
                {title}
              </h2>
              {heading}
              {description && (
                <p className={`${baseClass}__description`} id={descId}>
                  {description}
                </p>
              )}
            </div>

            {dismissible && (
              <IconButton
                className={`${baseClass}__close`}
                icon="close"
                variant="tertiary"
                size="compact"
                tooltip={false}
                label={closeLabel}
                onClick={() => onOpenChange(false)}
              />
            )}
          </div>

          {children && (
            // Scrollable when content is long; without a tab stop a keyboard
            // user cannot reach that scroll. The initial-focus query below
            // still prefers a real control, so this does not steal focus.
            <div className={`${baseClass}__body`} tabIndex={0}>
              {children}
            </div>
          )}

          {footer && <div className={`${baseClass}__footer`}>{footer}</div>}
        </div>
      </div>
    );

    if (!mounted) return null;
    return ReactDOM.createPortal(drawer, document.body);
  },
);

Drawer.displayName = 'Drawer';
