import React from 'react';
import './ProgressiveBlur.css';

/** Props owned by ProgressiveBlur itself — everything else falls through to the root `<div>`. */
type ProgressiveBlurOwnProps = {
  /**
   * The side the blur is anchored to, as Drawer names its edge: fully
   * frosted there, dissolving to clear toward the opposite side. `top` sits
   * behind a header, `bottom` behind a toolbar or a footer bar.
   */
  side?: 'top' | 'bottom';
  /**
   * Whether the page-surface tint shows over the blur. It fades on change,
   * so a header can bring it in once the page has scrolled; the blur
   * itself never fades.
   */
  tinted?: boolean;
  /** Additional CSS classes on the root. */
  className?: string;
};

export interface ProgressiveBlurProps
  extends ProgressiveBlurOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof ProgressiveBlurOwnProps> {}

/**
 * A backdrop blur that dissolves along one edge instead of ending in a hard
 * line: four masked blur layers of rising strength, with an optional tint of
 * the page surface on its own layer above them. It fills its positioned
 * parent and is decorative, so it is hidden from assistive tech and lets the
 * pointer through. The forwarded ref and any unrecognised props target the
 * root `<div>`.
 */
export function ProgressiveBlur({
  side = 'top',
  tinted = false,
  className = '',
  ref,
  ...rest
}: ProgressiveBlurProps) {
  const baseClass = 'ds-progressive-blur';
  const classes = [
    baseClass,
    `${baseClass}--${side}`,
    tinted && `${baseClass}--tinted`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-hidden="true" {...rest} ref={ref} className={classes}>
      <span className={`${baseClass}__layer`} />
      <span className={`${baseClass}__layer`} />
      <span className={`${baseClass}__layer`} />
      <span className={`${baseClass}__layer`} />
    </div>
  );
}
