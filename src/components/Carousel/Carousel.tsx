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

export interface CarouselProps {
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
  /** Callback when active slide changes */
  onSlideChange?: (index: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Carousel component for sliding through content.
 * Supports navigation arrows, dot indicators, auto-play,
 * and keyboard navigation.
 */
export const Carousel = ({
  children,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = MOTION_AUTOPLAY_INTERVAL_MS,
  loop = false,
  onSlideChange,
  className = '',
}: CarouselProps) => {
  const slides = React.Children.toArray(children);
  const slideCount = slides.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const baseClass = 'ds-carousel';

  const goTo = useCallback(
    (index: number) => {
      let next = index;
      if (loop) {
        next = ((index % slideCount) + slideCount) % slideCount;
      } else {
        next = Math.max(0, Math.min(index, slideCount - 1));
      }
      setActiveIndex(next);
      onSlideChange?.(next);
    },
    [slideCount, loop, onSlideChange]
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      className={containerClasses}
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carousel"
    >
      <div className={`${baseClass}__viewport`}>
        <div
          className={`${baseClass}__track`}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`${baseClass}__slide`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slideCount}`}
            >
              {slide}
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
            aria-label="Previous slide"
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
            aria-label="Next slide"
            type="button"
          >
            <span className="material-symbols-rounded" aria-hidden="true">
              chevron_right
            </span>
          </button>
        </>
      )}

      {showDots && slideCount > 1 && (
        <div className={`${baseClass}__dots`} role="tablist" aria-label="Slide indicators">
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
              aria-label={`Go to slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};
