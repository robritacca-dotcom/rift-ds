'use client';

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './Lightbox.css';
import '../../fonts/material-symbols.css';
import { useMounted } from '../../behaviors/useMounted';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';

/** Props owned by Lightbox itself — everything else falls through to the panel. */
type LightboxOwnProps = {
  /** Whether the lightbox is open */
  open: boolean;
  /** Callback when the lightbox requests to close */
  onOpenChange: (open: boolean) => void;
  /** The image to show. Omit it when `children` supplies the media. */
  src?: string;
  /** Image alt text — also the panel's accessible name. Required whenever `src` is set. */
  alt?: string;
  /** Optional caption shown in a chip under the media */
  caption?: string;
  /**
   * Custom media instead of `src` — a framework image component, a video, a
   * live embed. Sized by the same viewport bounds the plain image gets.
   */
  children?: React.ReactNode;
  /** Whether ESC, backdrop click, and the close button can dismiss */
  dismissible?: boolean;
  /**
   * Steps to the previous item. Providing it renders the previous chevron and
   * arms the Left arrow key — the consumer owns the collection and the index.
   */
  onPrev?: () => void;
  /** Steps to the next item — the next chevron and the Right arrow key. */
  onNext?: () => void;
  /** Additional CSS classes — applied to the portal container, not the panel */
  className?: string;
};

export interface LightboxProps
  extends LightboxOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof LightboxOwnProps> {}

/**
 * Lightbox — the fullscreen media viewer: an image (or custom media) centred
 * over a deep frosted scrim, with a caption chip, a close control, and
 * optional previous/next stepping for galleries. Rides the shared overlay
 * behavior layer: Escape routes through the layer stack, focus is trapped
 * and restored with the page inert behind the panel, and the body scroll
 * lock is counted.
 *
 * Renders through a portal into `document.body`. The forwarded ref and any
 * unrecognised props target the **panel** (the `role="dialog"` element).
 */
export const Lightbox = React.forwardRef<HTMLDivElement, LightboxProps>(
  (
    {
      open,
      onOpenChange,
      src,
      alt,
      caption,
      children,
      dismissible = true,
      onPrev,
      onNext,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const baseClass = 'ds-lightbox';

    /** Keep the internal ref (used by the focus trap) while honouring a forwarded one. */
    const setPanelRef = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    // SSR guard — only render portal on the client
    const mounted = useMounted();

    // Shared overlay behaviors (src/behaviors/): Escape routes through the
    // layer stack, focus is trapped with the page inert behind the panel,
    // and the scroll lock is counted. Backdrop dismissal stays below — it
    // is this component's own DOM.
    useLayer({ open, dismissOnEscape: dismissible, onDismiss: () => onOpenChange(false) });
    useFocusScope(panelRef, { active: open });
    useScrollLock(open);

    // Gallery stepping is this component's own listener, gated on open state
    // like the non-modal overlays' — the layer stack owns dismissal keys
    // only. Handlers ride refs so the subscription doesn't churn per render.
    const stepRef = useRef({ onPrev, onNext });
    stepRef.current = { onPrev, onNext };
    useEffect(() => {
      if (!open || (!onPrev && !onNext)) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') stepRef.current.onPrev?.();
        if (e.key === 'ArrowRight') stepRef.current.onNext?.();
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [open, onPrev, onNext]);

    const handleBackdropClick = () => {
      if (dismissible) onOpenChange(false);
    };

    const containerClasses = [baseClass, open ? `${baseClass}--open` : '', className]
      .filter(Boolean)
      .join(' ');

    const lightbox = (
      <div className={containerClasses}>
        <div className={`${baseClass}__backdrop`} onClick={handleBackdropClick} />

        <div
          {...rest}
          ref={setPanelRef}
          className={`${baseClass}__panel`}
          role="dialog"
          aria-modal="true"
          aria-label={alt || caption || 'Media viewer'}
          tabIndex={-1}
        >
          {dismissible && (
            <button
              type="button"
              className={`${baseClass}__control ${baseClass}__close`}
              onClick={() => onOpenChange(false)}
              aria-label="Close viewer"
            >
              <span className={`${baseClass}__control-icon material-symbols-rounded`} aria-hidden="true">
                close
              </span>
            </button>
          )}

          {onPrev && (
            <button
              type="button"
              className={`${baseClass}__control ${baseClass}__nav ${baseClass}__nav--prev`}
              onClick={onPrev}
              aria-label="Previous"
            >
              <span className={`${baseClass}__control-icon material-symbols-rounded`} aria-hidden="true">
                chevron_left
              </span>
            </button>
          )}

          <figure className={`${baseClass}__figure`}>
            {children ?? (src ? <img className={`${baseClass}__img`} src={src} alt={alt ?? ''} /> : null)}
            {caption && <figcaption className={`${baseClass}__caption`}>{caption}</figcaption>}
          </figure>

          {onNext && (
            <button
              type="button"
              className={`${baseClass}__control ${baseClass}__nav ${baseClass}__nav--next`}
              onClick={onNext}
              aria-label="Next"
            >
              <span className={`${baseClass}__control-icon material-symbols-rounded`} aria-hidden="true">
                chevron_right
              </span>
            </button>
          )}
        </div>
      </div>
    );

    if (!mounted) return null;
    return ReactDOM.createPortal(lightbox, document.body);
  },
);

Lightbox.displayName = 'Lightbox';
