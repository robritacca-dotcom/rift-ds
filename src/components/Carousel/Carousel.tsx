'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore, type ReactNode } from 'react';
import { MOTION_AUTOPLAY_INTERVAL_MS } from '../../tokens/motion';
import './Carousel.css';
import '../../fonts/material-symbols.css';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// matchMedia as an external store: auto-play reacts live when the OS
// reduced-motion setting flips, and the server snapshot keeps SSR safe.
const subscribeReducedMotion = (callback: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => false;

/** Props owned by Carousel itself — everything else falls through to the region. */
type CarouselOwnProps = {
  /** Carousel slides */
  children?: ReactNode;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show previous/next navigation arrows */
  showArrows?: boolean;
  /** Auto-play slides */
  autoPlay?: boolean;
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Whether navigation should loop */
  loop?: boolean;
  /**
   * Index of the active slide (zero-based), for a controlled carousel. Leave
   * it undefined to let the component keep its own position, seeded from
   * `defaultSlide`.
   */
  slide?: number;
  /** Index of the slide shown on first render when the carousel is uncontrolled (zero-based) */
  defaultSlide?: number;
  /** Called with the index of the slide being moved to */
  onSlideChange?: (index: number) => void;
  /** Accessible name of the previous-slide arrow */
  previousLabel?: string;
  /** Accessible name of the next-slide arrow */
  nextLabel?: string;
  /** Accessible name of each slide, given its 1-based position and the slide count */
  slideLabel?: (position: number, count: number) => string;
  /** Role description announced for each slide */
  slideRoleDescription?: string;
  /** Accessible name of the dot indicators' tab list */
  dotsLabel?: string;
  /** Accessible name of each dot indicator, given its slide's 1-based position */
  dotLabel?: (position: number) => string;
  /** Additional CSS classes */
  className?: string;
};

export interface CarouselProps
  extends CarouselOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CarouselOwnProps> {}

const defaultSlideLabel = (position: number, count: number) => `Slide ${position} of ${count}`;
const defaultDotLabel = (position: number) => `Go to slide ${position}`;

/**
 * Carousel component for sliding through content.
 * Supports navigation arrows, dot indicators, auto-play,
 * and keyboard navigation.
 *
 * Forwards a ref to the `role="region"` wrapper and spreads unrecognised
 * props onto it. The region is named "Carousel" and described as a
 * "carousel" unless a native `aria-label` (or `aria-labelledby`) and
 * `aria-roledescription` say otherwise. Pointer, focus and key handlers passed
 * to it run before the carousel's own.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      showDots = true,
      showArrows = true,
      autoPlay = false,
      autoPlayInterval = MOTION_AUTOPLAY_INTERVAL_MS,
      loop = false,
      slide,
      defaultSlide = 0,
      onSlideChange,
      previousLabel = 'Previous slide',
      nextLabel = 'Next slide',
      slideLabel = defaultSlideLabel,
      slideRoleDescription = 'slide',
      dotsLabel = 'Slide indicators',
      dotLabel = defaultDotLabel,
      className = '',
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const slides = React.Children.toArray(children);
    const slideCount = slides.length;

    const isControlled = slide !== undefined;
    const [internalIndex, setInternalIndex] = useState(defaultSlide);
    const activeIndex = isControlled ? slide : internalIndex;
    const [paused, setPaused] = useState(false);
    const reducedMotion = useSyncExternalStore(
      subscribeReducedMotion,
      getReducedMotion,
      getServerReducedMotion,
    );
    const containerRef = useRef<HTMLDivElement | null>(null);
    const setRef = (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const baseClass = 'ds-carousel';

    const goTo = useCallback(
      (index: number) => {
        let next = index;
        if (loop) {
          next = ((index % slideCount) + slideCount) % slideCount;
        } else {
          next = Math.max(0, Math.min(index, slideCount - 1));
        }
        if (!isControlled) setInternalIndex(next);
        onSlideChange?.(next);
      },
      [slideCount, loop, onSlideChange, isControlled]
    );

    const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
    const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

    // Auto-play — never starts under the OS reduced-motion setting
    useEffect(() => {
      if (!autoPlay || paused || reducedMotion || slideCount <= 1) return;

      const interval = setInterval(goNext, autoPlayInterval);
      return () => clearInterval(interval);
    }, [autoPlay, paused, reducedMotion, autoPlayInterval, goNext, slideCount]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };

    // Roving tabindex on the dots: arrows move focus and select, so the
    // tablist is a single tab stop. stopPropagation keeps the region-level
    // arrow handler from moving the slide a second time.
    const handleDotKeyDown = (e: React.KeyboardEvent, index: number) => {
      let target: number | undefined;
      if (e.key === 'ArrowRight') {
        target = loop ? (index + 1) % slideCount : Math.min(index + 1, slideCount - 1);
      } else if (e.key === 'ArrowLeft') {
        target = loop ? (index - 1 + slideCount) % slideCount : Math.max(index - 1, 0);
      }
      if (target === undefined) return;
      e.preventDefault();
      e.stopPropagation();
      goTo(target);
      // Focus the new dot button
      const dotList = (e.target as HTMLElement).parentElement;
      const dots = dotList?.querySelectorAll<HTMLButtonElement>(`.${baseClass}__dot`);
      dots?.[target]?.focus();
    };

    const canGoPrev = loop || activeIndex > 0;
    const canGoNext = loop || activeIndex < slideCount - 1;

    const containerClasses = [baseClass, className].filter(Boolean).join(' ');

    if (slideCount === 0) return null;

    return (
      <div
        aria-roledescription="carousel"
        aria-label="Carousel"
        {...rest}
        ref={setRef}
        className={containerClasses}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          setPaused(true);
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          setPaused(false);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          setPaused(true);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          setPaused(false);
        }}
        onKeyDown={handleKeyDown}
        role="region"
      >
        <div className={`${baseClass}__viewport`}>
          <div
            className={`${baseClass}__track`}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slideContent, index) => (
              <div
                key={index}
                className={`${baseClass}__slide`}
                role="group"
                aria-roledescription={slideRoleDescription}
                aria-label={slideLabel(index + 1, slideCount)}
              >
                {slideContent}
              </div>
            ))}
          </div>
        </div>

        {showArrows && slideCount > 1 && (
          <>
            <button
              className={`${baseClass}__arrow ${baseClass}__arrow--prev`}
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label={previousLabel}
              type="button"
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                chevron_left
              </span>
            </button>

            <button
              className={`${baseClass}__arrow ${baseClass}__arrow--next`}
              onClick={goNext}
              disabled={!canGoNext}
              aria-label={nextLabel}
              type="button"
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </>
        )}

        {showDots && slideCount > 1 && (
          <div className={`${baseClass}__dots`} role="tablist" aria-label={dotsLabel}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${baseClass}__dot${
                  index === activeIndex ? ` ${baseClass}__dot--active` : ''
                }`}
                onClick={() => goTo(index)}
                onKeyDown={(e) => handleDotKeyDown(e, index)}
                role="tab"
                aria-selected={index === activeIndex}
                tabIndex={index === activeIndex ? 0 : -1}
                aria-label={dotLabel(index + 1)}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

Carousel.displayName = 'Carousel';
