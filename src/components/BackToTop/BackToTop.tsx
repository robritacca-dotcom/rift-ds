'use client';

import React, { useEffect, useState } from 'react';
import { IconButton } from '../IconButton/IconButton';
import './BackToTop.css';

/** Props owned by BackToTop itself. */
type BackToTopOwnProps = {
  /** How far, in px, the page scrolls before the button appears. `0` shows it at once. */
  threshold?: number;
  /** Accessible name and tooltip of the button. */
  label?: string;
  /**
   * The id of the element to move focus to after the jump (the page's main
   * region, say), so a keyboard reader continues from the top too. Leave it
   * out to keep focus on the button.
   */
  focusTarget?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface BackToTopProps
  extends BackToTopOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof BackToTopOwnProps | 'children'> {}

/**
 * BackToTop: a round button pinned to the page's bottom end corner that
 * appears once the reader has scrolled a long way down, and takes them
 * back to the top. Smooth, unless the reader asks for reduced motion.
 * The ref and native attributes go to the pinned wrapper, the node that
 * appears and hides; the button inside is an IconButton named by `label`.
 * While hidden it is inert, so it is never a tab stop that does nothing.
 */
export function BackToTop({
  threshold = 640,
  label = 'Back to top',
  focusTarget,
  className = '',
  ref,
  ...rest
}: BackToTopProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setShown(threshold === 0 || window.scrollY > threshold);
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (focusTarget) {
      const target = document.getElementById(focusTarget);
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  };

  const classes = ['ds-back-to-top', shown ? 'ds-back-to-top--shown' : '', className].filter(Boolean).join(' ');
  return (
    <div {...rest} ref={ref} className={classes} inert={!shown}>
      <IconButton icon="arrow_upward" label={label} variant="primary" tone="neutral" tooltipPosition="start" onClick={toTop} />
    </div>
  );
}
