'use client';

import React, { useRef, useState } from 'react';
import './ImageCompare.css';
import '../../fonts/material-symbols.css';

/** Props owned by ImageCompare itself — everything else falls through to the root node. */
type ImageCompareOwnProps = {
  /** Source of the image revealed on the left of the divider */
  beforeSrc: string;
  /** Source of the image revealed on the right of the divider */
  afterSrc: string;
  /** Alt text for the before image */
  beforeAlt: string;
  /** Alt text for the after image */
  afterAlt: string;
  /** Corner label over the before side */
  beforeLabel?: string;
  /** Corner label over the after side */
  afterLabel?: string;
  /** Whether the corner labels render */
  showLabels?: boolean;
  /** Divider position as a percentage from the left (controlled) */
  position?: number;
  /** Initial divider position for uncontrolled use */
  defaultPosition?: number;
  /** Convenience callback receiving the divider position on every change */
  onPositionChange?: (position: number) => void;
  /** CSS aspect-ratio of the frame (both images are sized to cover it) */
  aspectRatio?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface ImageCompareProps
  extends ImageCompareOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ImageCompareOwnProps> {}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Before-and-after comparison of two images sharing one frame. Dragging the
 * divider (or clicking anywhere in the frame) sweeps the split; the handle is
 * a `role="slider"` with arrow-key, Home/End and PageUp/PageDown control, so
 * the comparison works without a pointer.
 *
 * Forwards a ref to the root element and spreads unrecognised props onto it.
 */
export const ImageCompare = React.forwardRef<HTMLDivElement, ImageCompareProps>(
  (
    {
      beforeSrc,
      afterSrc,
      beforeAlt,
      afterAlt,
      beforeLabel = 'Before',
      afterLabel = 'After',
      showLabels = true,
      position,
      defaultPosition = 50,
      onPositionChange,
      aspectRatio = '16 / 10',
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const [internalPosition, setInternalPosition] = useState(clamp(defaultPosition));
    const [dragging, setDragging] = useState(false);
    const frameRef = useRef<HTMLDivElement | null>(null);

    const baseClass = 'ds-image-compare';
    const currentPosition = clamp(position ?? internalPosition);

    const classes = [baseClass, dragging ? `${baseClass}--dragging` : '', className]
      .filter(Boolean)
      .join(' ');

    const setRef = (node: HTMLDivElement | null) => {
      frameRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const setPosition = (next: number) => {
      const resolved = clamp(next);
      if (position === undefined) setInternalPosition(resolved);
      onPositionChange?.(resolved);
    };

    const positionFromPointer = (clientX: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      if (rect.width === 0) return;
      setPosition(((clientX - rect.left) / rect.width) * 100);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      // Primary button / touch only; let right-click and modifier menus be.
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      positionFromPointer(event.clientX);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      positionFromPointer(event.clientX);
    };

    const endDrag = () => setDragging(false);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      let next: number | null = null;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = currentPosition + 1;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = currentPosition - 1;
          break;
        case 'PageUp':
          next = currentPosition + 10;
          break;
        case 'PageDown':
          next = currentPosition - 10;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = 100;
          break;
      }
      if (next !== null) {
        event.preventDefault();
        setPosition(next);
      }
    };

    return (
      <div
        {...rest}
        ref={setRef}
        className={classes}
        style={{
          ...style,
          aspectRatio,
          ['--ds-image-compare-position' as string]: `${currentPosition}%`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img className={`${baseClass}__after`} src={afterSrc} alt={afterAlt} draggable={false} />
        <div className={`${baseClass}__before-clip`}>
          <img className={`${baseClass}__before`} src={beforeSrc} alt={beforeAlt} draggable={false} />
        </div>

        {showLabels && (
          <>
            <span className={`${baseClass}__label ${baseClass}__label--before`} aria-hidden="true">
              {beforeLabel}
            </span>
            <span className={`${baseClass}__label ${baseClass}__label--after`} aria-hidden="true">
              {afterLabel}
            </span>
          </>
        )}

        <div className={`${baseClass}__divider`} aria-hidden="true" />
        <div
          className={`${baseClass}__handle`}
          role="slider"
          tabIndex={0}
          aria-label={`${beforeLabel} and ${afterLabel} comparison`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(currentPosition)}
          aria-valuetext={`${Math.round(currentPosition)}% ${beforeLabel.toLowerCase()}`}
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            drag_indicator
          </span>
        </div>
      </div>
    );
  },
);

ImageCompare.displayName = 'ImageCompare';
