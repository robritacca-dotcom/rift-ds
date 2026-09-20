import './Stat.css';
import '../../fonts/material-symbols.css';

export interface StatProps {
  /** The headline number, e.g. "~900%" or "3.8M" */
  value: string;
  /** What the number measures */
  label: string;
  /** Optional change annotation, e.g. "+42% vs last quarter" */
  delta?: string;
  /** Direction of the delta — colours it and adds an arrow */
  trend?: 'up' | 'down' | 'neutral';
  /** Where the delta sits: stacked below the label, or inline to the right of the value, bottom-aligned */
  deltaPlacement?: 'stacked' | 'inline';
  /** Stat size */
  size?: 'default' | 'large';
  /** Additional CSS classes */
  className?: string;
}

const TREND_ICONS: Record<NonNullable<StatProps['trend']>, string> = {
  up: 'arrow_upward',
  down: 'arrow_downward',
  neutral: 'remove',
};

/**
 * Stat component — a single headline metric with a label and an
 * optional trend delta. Compose several in a row for a metrics band.
 */
export const Stat = ({
  value,
  label,
  delta,
  trend = 'neutral',
  deltaPlacement = 'stacked',
  size = 'default',
  className = '',
}: StatProps) => {
  const baseClass = 'ds-stat';

  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    deltaPlacement === 'inline' ? `${baseClass}--delta-inline` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <span className={`${baseClass}__value`}>{value}</span>
      <span className={`${baseClass}__label`}>{label}</span>
      {delta && (
        <span className={`${baseClass}__delta ${baseClass}__delta--${trend}`}>
          <span className="material-symbols-rounded" aria-hidden="true">
            {TREND_ICONS[trend]}
          </span>
          {delta}
        </span>
      )}
    </div>
  );
};
