'use client';

import React, { useRef, useId } from 'react';
import ReactDOM from 'react-dom';
import './Drawer.css';
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
  /** Drawer body content */
  children?: React.ReactNode;
  /** Optional footer slot — typically a row of Buttons */
  footer?: React.ReactNode;
  /** Edge the panel slides in from */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Panel size along the axis it slides on */
  size?: 'sm' | 'md' | 'lg';
  /** Whether ESC, scrim click, and the close button can dismiss */
  dismissible?: boolean;
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
 * filter panels, detail views, and mobile navigation.
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
      children,
      footer,
      side = 'right',
      size = 'md',
      dismissible = true,
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
    useLayer({ open, dismissOnEscape: dismissible, onDismiss: () => onOpenChange(false) });
    useFocusScope(panelRef, { active: open });
    useScrollLock(open);

    const handleScrimClick = () => {
      if (dismissible) onOpenChange(false);
    };

    const classes = [
      baseClass,
      `${baseClass}--${side}`,
      `${baseClass}--${size}`,
      open ? `${baseClass}--open` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const drawer = (
      <div className={classes}>
        <div className={`${baseClass}__scrim`} onClick={handleScrimClick} />

        <div
          {...rest}
          className={`${baseClass}__panel`}
          ref={setPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : rest['aria-describedby']}
          tabIndex={-1}
        >
          <div className={`${baseClass}__header`}>
            <div className={`${baseClass}__heading`}>
              <h2 className={`${baseClass}__title`} id={titleId}>
                {title}
              </h2>
              {description && (
                <p className={`${baseClass}__description`} id={descId}>
                  {description}
                </p>
              )}
            </div>

            {dismissible && (
              <button
                type="button"
                className={`${baseClass}__close`}
                onClick={() => onOpenChange(false)}
                aria-label="Close drawer"
              >
                <span
                  className={`${baseClass}__close-icon material-symbols-rounded`}
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
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
