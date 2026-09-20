import { useState } from 'react';
import './MotionSwatch.css';

export type MotionSwatchKind = 'duration' | 'easing';
export type MotionSwatchDemo = 'slide' | 'spin' | 'shimmer';

export interface MotionSwatchProps {
  /** Token name label (e.g. "Fast", "Standard") */
  label: string;
  /** CSS custom property being demonstrated (e.g. "--motion-duration-fast") */
  token: string;
  /** Resolved value to display (e.g. "150ms", "ease") */
  value: string;
  /** Whether the token is a duration or an easing curve */
  kind: MotionSwatchKind;
  /** Which preview animation to render (default "slide") */
  demo?: MotionSwatchDemo;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MotionSwatch component.
 * Displays a motion token card with a live animation preview,
 * token name, and value. Duration swatches animate at the
 * token's speed; easing swatches trace the token's curve at a
 * fixed readable duration. Click the preview to replay.
 * Loop demos (spin, shimmer) run continuously.
 */
export const MotionSwatch = ({
  label,
  token,
  value,
  kind,
  demo = 'slide',
  className = '',
}: MotionSwatchProps) => {
  const [playCount, setPlayCount] = useState(0);

  const baseClass = 'ds-motion-swatch';
  const classes = [baseClass, className].filter(Boolean).join(' ');
  const isLoop = demo === 'spin' || demo === 'shimmer';

  const animationStyle: React.CSSProperties =
    kind === 'duration'
      ? {
          animationDuration: `var(${token})`,
          animationTimingFunction: isLoop
            ? 'var(--motion-ease-linear)'
            : 'var(--motion-ease-emphasized)',
        }
      : {
          animationDuration: 'var(--motion-duration-slower)',
          animationTimingFunction: `var(${token})`,
        };

  return (
    <div className={classes}>
      <button
        type="button"
        className={`${baseClass}__preview`}
        onClick={() => setPlayCount((count) => count + 1)}
        aria-label={`Replay ${label} animation`}
      >
        {demo === 'slide' && (
          <span className={`${baseClass}__track`}>
            <span
              key={playCount}
              className={`${baseClass}__dot`}
              style={animationStyle}
            />
          </span>
        )}
        {demo === 'spin' && (
          <span
            key={playCount}
            className={`${baseClass}__spinner`}
            style={animationStyle}
          />
        )}
        {demo === 'shimmer' && (
          <span
            key={playCount}
            className={`${baseClass}__shimmer`}
            style={animationStyle}
          />
        )}
        {!isLoop && (
          <span
            className={`material-symbols-rounded ${baseClass}__replay-icon`}
            aria-hidden="true"
          >
            replay
          </span>
        )}
      </button>
      <span className={`${baseClass}__label`}>{label}</span>
      <span className={`${baseClass}__value`}>
        <code>{token}</code>
      </span>
      <span className={`${baseClass}__value`}>{value}</span>
    </div>
  );
};
