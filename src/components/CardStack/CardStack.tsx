'use client';

import React, { useCallback, useRef, useState } from 'react';
import './CardStack.css';

/** Props owned by CardStack itself — everything else falls through to the root `<div>`. */
type CardStackOwnProps = {
  /** The cards, in order. The first child starts on top. */
  children?: React.ReactNode;
  /**
   * Controlled top card, as an index into `children`. Pair with
   * `onIndexChange`. Omit to let the stack own its position.
   */
  index?: number;
  /** Initial top card when uncontrolled. */
  defaultIndex?: number;
  /** Fires when the top card changes, with the new index. */
  onIndexChange?: (index: number) => void;
  /** How many card edges peek out behind the top card. */
  peek?: number;
  /** Wrap from the last card back to the first. Off, the stack stops at both ends. */
  loop?: boolean;
  /**
   * Clicking the top card flips to the next. Clicks that land on a link or
   * control inside the card are left alone, so a card can still carry its
   * own actions.
   */
  advanceOnClick?: boolean;
  /** Accessible name for the stack, e.g. "Open roles". */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface CardStackProps
  extends CardStackOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CardStackOwnProps> {}

/** Click targets inside a card that should keep their click, not flip the stack. */
const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, summary, [role="button"], [role="link"], [tabindex]';

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', ' ', 'Enter']);
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

/**
 * CardStack — a deck of cards showing one at a time, the rest peeking out
 * beneath it. Flipping forward lifts the top card up and away while the next
 * one rises into place; flipping back drops the previous card in from above.
 * The stack is the pattern, not the cards: any children work, Card and
 * EntityCard are the intended fillings, and every card should share one size
 * so the deck keeps its shape.
 *
 * Flip by clicking the top card, or with the arrow keys when the stack has
 * focus. Cards behind the top one are inert until their turn.
 */
export const CardStack = React.forwardRef<HTMLDivElement, CardStackProps>(
  (
    {
      children,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      peek = 2,
      loop = true,
      advanceOnClick = true,
      label,
      className = '',
      onClick,
      onKeyDown,
      style,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-card-stack';
    const items = React.Children.toArray(children);
    const count = items.length;

    const isControlled = indexProp !== undefined;
    const [innerIndex, setInnerIndex] = useState(defaultIndex);
    const index = Math.max(0, Math.min(isControlled ? indexProp : innerIndex, count - 1));

    /** The top card is animating out (forward flip, commit on animation end). */
    const [leaving, setLeaving] = useState(false);
    /** The top card is animating in (backward flip, already committed). */
    const [entering, setEntering] = useState(false);
    const pendingRef = useRef<number | null>(null);

    const commit = useCallback(
      (next: number) => {
        const normalized = ((next % count) + count) % count;
        if (!isControlled) setInnerIndex(normalized);
        onIndexChange?.(normalized);
      },
      [count, isControlled, onIndexChange],
    );

    const next = useCallback(() => {
      if (count < 2 || leaving || entering) return;
      if (!loop && index >= count - 1) return;
      pendingRef.current = index + 1;
      setLeaving(true);
    }, [count, leaving, entering, loop, index]);

    const prev = useCallback(() => {
      if (count < 2 || leaving || entering) return;
      if (!loop && index <= 0) return;
      commit(index - 1);
      setEntering(true);
    }, [count, leaving, entering, loop, index, commit]);

    const handleTopAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (leaving) {
        setLeaving(false);
        if (pendingRef.current !== null) commit(pendingRef.current);
        pendingRef.current = null;
      }
      if (entering) setEntering(false);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (!advanceOnClick || e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      const control = target.closest(INTERACTIVE_SELECTOR);
      // A click on the card's own link or button keeps its meaning.
      if (control && control !== e.currentTarget) return;
      next();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || e.target !== e.currentTarget) return;
      if (NEXT_KEYS.has(e.key)) {
        e.preventDefault();
        next();
      } else if (PREV_KEYS.has(e.key)) {
        e.preventDefault();
        prev();
      }
    };

    const visiblePeek = Math.max(0, Math.min(peek, count - 1));

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        role="group"
        aria-roledescription="card stack"
        aria-label={label}
        tabIndex={count > 1 ? 0 : undefined}
        style={{ ...style, '--ds-card-stack-depth': visiblePeek } as React.CSSProperties}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {items.map((child, k) => {
          // Position in the deck relative to the top card. With `loop` the
          // deck is circular; without it, flipped-away cards go negative.
          const raw = k - index;
          const pos = loop ? ((raw % count) + count) % count : raw;
          const gone = pos < 0;
          const buried = pos > visiblePeek;
          const isTop = pos === 0;

          const itemClasses = [
            `${baseClass}__item`,
            gone ? `${baseClass}__item--gone` : '',
            buried ? `${baseClass}__item--buried` : '',
            isTop && leaving ? `${baseClass}__item--leaving` : '',
            isTop && entering ? `${baseClass}__item--entering` : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={k}
              className={itemClasses}
              style={
                {
                  '--ds-card-stack-pos': gone ? 0 : Math.min(pos, visiblePeek),
                  zIndex: count - pos,
                } as React.CSSProperties
              }
              inert={!isTop || undefined}
              aria-hidden={!isTop || undefined}
              onAnimationEnd={isTop ? handleTopAnimationEnd : undefined}
            >
              {child}
            </div>
          );
        })}
        {count > 1 && (
          <div className={`${baseClass}__sr-only`} role="status">
            Card {index + 1} of {count}
          </div>
        )}
      </div>
    );
  },
);

CardStack.displayName = 'CardStack';
