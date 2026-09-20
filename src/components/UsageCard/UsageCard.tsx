import React from 'react';
import { Meter } from '../Meter/Meter';
import '../Chart/Chart.css';
import './UsageCard.css';

/** One budgeted quantity in the card — a meter row with an optional reset caption. */
export interface UsageItem {
  /** What is being budgeted, e.g. the context window or a weekly limit */
  label: string;
  /** Current level */
  value: number;
  /** Upper bound of the budget; defaults to 100 */
  max?: number;
  /** Readout override replacing the default percentage, e.g. a token count */
  valueText?: string;
  /** Caption under the bar's trailing edge, e.g. when the limit resets */
  resetLabel?: string;
  /** Status override; left unset, the fill recolours through the card's thresholds */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
}

/** Props owned by UsageCard itself — everything else falls through to the root node. */
type UsageCardOwnProps = {
  /** The budgets to show, one meter row each */
  items: UsageItem[];
  /** Card title in the shared chart-chrome header */
  title?: string;
  /** Supporting line under the title */
  subtitle?: string;
  /** Fractions of an item's max where its fill recolours to warning and then error */
  thresholds?: { warning?: number; error?: number };
  /** Chrome off (no border, padding, or fill) for use inside a panel that supplies the surface */
  bare?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface UsageCardProps
  extends UsageCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof UsageCardOwnProps> {}

const DEFAULT_THRESHOLDS = { warning: 0.8, error: 0.95 };

/**
 * An agent's budgets at a glance — the context window plus any number of
 * plan or rate limits, one Meter row each, with reset captions. Wears the
 * chart family's card chrome and takes `bare` for use inside a panel.
 *
 * Each fill recolours as its level crosses the card's thresholds (info
 * until warning, then warning, then error), mirroring Gauge's threshold
 * idea; an item's own `variant` overrides the derivation. Purely
 * presentational (no 'use client'), so it renders from a Server Component.
 */
export const UsageCard = React.forwardRef<HTMLDivElement, UsageCardProps>(
  (
    {
      items,
      title,
      subtitle,
      thresholds,
      bare = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-usage-card';
    const limits = { ...DEFAULT_THRESHOLDS, ...thresholds };

    const variantFor = (item: UsageItem) => {
      if (item.variant) return item.variant;
      const max = item.max ?? 100;
      const fraction = max > 0 ? Math.max(0, Math.min(1, item.value / max)) : 0;
      if (fraction >= limits.error) return 'error';
      if (fraction >= limits.warning) return 'warning';
      return 'info';
    };

    const classes = [baseClass, 'ds-chart', bare && 'ds-chart--bare', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {(title || subtitle) && (
          <div className="ds-chart__header">
            <div className="ds-chart__header-text">
              {title && <span className="ds-chart__title">{title}</span>}
              {subtitle && <span className="ds-chart__subtitle">{subtitle}</span>}
            </div>
          </div>
        )}
        <div className={`${baseClass}__items`}>
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className={`${baseClass}__item`}>
              <Meter
                label={item.label}
                value={item.value}
                max={item.max ?? 100}
                valueText={item.valueText}
                showValue
                variant={variantFor(item)}
                size="compact"
              />
              {item.resetLabel && (
                <span className={`${baseClass}__reset`}>{item.resetLabel}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

UsageCard.displayName = 'UsageCard';
