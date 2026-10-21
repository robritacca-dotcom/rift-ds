import React from 'react';
import '../Chart/Chart.css';
import './ContributionGraph.css';

export interface ContributionDay {
  /** ISO date string, e.g. "2026-07-08" */
  date: string;
  /** Number of contributions on this day */
  count: number;
  /** Intensity level 0 (none) to 4 (most) — drives the cell colour */
  level: 0 | 1 | 2 | 3 | 4;
}

/** Props owned by ContributionGraph itself; everything else falls through to the root div. */
type ContributionGraphOwnProps = {
  /** One entry per day, ordered oldest to newest */
  days: ContributionDay[];
  /**
   * Chart title, in the shared chart header.
   * Note: this replaces the native `title` tooltip attribute, which the graph does not expose.
   */
  title?: string;
  /** Description text below the title. */
  subtitle?: string;
  /** Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface */
  bare?: boolean;
  /** Summary line shown under the grid, e.g. "496 contributions in the last year" */
  caption?: string;
  /** Show month labels above the grid */
  showMonthLabels?: boolean;
  /** Show the Less → More legend under the grid */
  showLegend?: boolean;
  /**
   * Accessible name for the grid of day cells, which renders as one image. Falls back to `caption`, then to "Contribution activity".
   */
  gridLabel?: string;
  /** The legend's low-end word. Defaults to "Less". */
  lessLabel?: string;
  /** The legend's high-end word. Defaults to "More". */
  moreLabel?: string;
  /**
   * The BCP 47 locale the dates are written in: the default month labels
   * above the grid ("Jan" to "Dec" in `en-US`) and the date in each cell's
   * default tooltip ("Jul 8, 2026"). Defaults to `en-US`.
   */
  locale?: string;
  /**
   * The month labels above the grid: twelve entries, January first.
   * Defaults to the short month names in `locale` ("Jan" to "Dec" in
   * `en-US`); a list of any other length falls back to the default.
   */
  monthLabels?: string[];
  /**
   * A day cell's tooltip, given its count and date. Defaults to "No
   * contributions", "1 contribution" or "N contributions", then "on" and the
   * date in `locale`'s short form (e.g. "Jul 8, 2026").
   */
  cellLabel?: (count: number, date: Date) => string;
  /** Additional CSS classes */
  className?: string;
};

export interface ContributionGraphProps
  extends ContributionGraphOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ContributionGraphOwnProps | 'children'> {}

/** The twelve short month names in `locale`, January first ("Jan" to "Dec" in en-US). */
const localeMonths = (locale: string): string[] => {
  const format = new Intl.DateTimeFormat(locale, { month: 'short' });
  return Array.from({ length: 12 }, (_, month) => format.format(new Date(2000, month, 1)));
};
/** A consumer's month list when it has all twelve entries, else the locale's. */
const monthsOr = (labels: string[] | undefined, locale: string): string[] =>
  labels && labels.length === 12 ? labels : localeMonths(locale);

/** Parse an ISO date string in local time (avoids UTC day-shift) */
const parseDay = (date: string) => new Date(`${date}T00:00:00`);

const cellLabelFor = (locale: string) => (count: number, date: Date) => {
  const formatted = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (count === 0) return `No contributions on ${formatted}`;
  if (count === 1) return `1 contribution on ${formatted}`;
  return `${count} contributions on ${formatted}`;
};

/** Group days into calendar weeks (Sunday-first columns, like GitHub) */
const buildWeeks = (days: ContributionDay[]) => {
  const weeks: (ContributionDay | null)[][] = [];
  let week: (ContributionDay | null)[] = [];

  days.forEach((day, index) => {
    if (index === 0) {
      // Pad the first week so the first day lands on its weekday row
      week = Array<ContributionDay | null>(parseDay(day.date).getDay()).fill(null);
    }
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length > 0) weeks.push(week);

  return weeks;
};

/** Month label positions: [weekIndex, monthName] where a new month begins */
const buildMonthLabels = (weeks: (ContributionDay | null)[][], monthNames: string[]) => {
  const labels: { weekIndex: number; label: string }[] = [];
  let previousMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((day) => day !== null);
    if (!firstDay) return;
    const month = parseDay(firstDay.date).getMonth();
    if (month !== previousMonth) {
      // Skip a label in the last column — it would render clipped
      if (weekIndex < weeks.length - 2 || labels.length === 0) {
        labels.push({ weekIndex, label: monthNames[month] });
      }
      previousMonth = month;
    }
  });

  // Drop the first label if the second is crowding it
  if (labels.length > 1 && labels[1].weekIndex - labels[0].weekIndex < 3) {
    labels.shift();
  }

  return labels;
};

/**
 * ContributionGraph renders a GitHub-style contribution heatmap:
 * one cell per day, arranged in weekday rows and week columns,
 * coloured by activity level via the --color-chart-contribution-* ramp.
 * It wears the chart family's card chrome (title, subtitle, padding) and
 * takes `bare` to drop it inside a panel that supplies the surface.
 */
export const ContributionGraph = React.forwardRef<HTMLDivElement, ContributionGraphProps>(({
  days,
  title,
  subtitle,
  bare = false,
  caption,
  showMonthLabels = true,
  showLegend = true,
  gridLabel,
  lessLabel = 'Less',
  moreLabel = 'More',
  locale = 'en-US',
  monthLabels: monthLabelsProp,
  cellLabel: cellLabelProp,
  className = '',
  ...rest
}, ref) => {
  const weeks = buildWeeks(days);
  const monthLabels = buildMonthLabels(weeks, monthsOr(monthLabelsProp, locale));
  const cellLabel = cellLabelProp ?? cellLabelFor(locale);

  const chartClass = 'ds-chart';
  const classes = [
    chartClass,
    bare && `${chartClass}--bare`,
    'ds-contribution-graph',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Columns stretch to fill the container but never shrink below the base
  // cell size — past that, the scroll wrapper takes over
  const columnTemplate = `repeat(${weeks.length}, minmax(var(--ds-contribution-cell), 1fr))`;

  return (
    <div {...rest} ref={ref} className={classes}>
      {(title || subtitle) && (
        <div className={`${chartClass}__header`}>
          <div className={`${chartClass}__header-text`}>
            {title && <h3 className={`${chartClass}__title`}>{title}</h3>}
            {subtitle && <p className={`${chartClass}__subtitle`}>{subtitle}</p>}
          </div>
        </div>
      )}
      <div className={`${chartClass}__body ds-contribution-graph__content`}>
      <div className="ds-contribution-graph__scroll">
        {showMonthLabels && (
          <div
            className="ds-contribution-graph__months"
            style={{ gridTemplateColumns: columnTemplate }}
            aria-hidden="true"
          >
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${label}-${weekIndex}`}
                className="ds-contribution-graph__month-label"
                style={{ gridColumnStart: weekIndex + 1 }}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div
          className="ds-contribution-graph__grid"
          style={{ gridTemplateColumns: columnTemplate }}
          role="img"
          aria-label={gridLabel ?? caption ?? 'Contribution activity'}
        >
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="ds-contribution-graph__week"
              // Drives the mount animation's left-to-right column sweep.
              style={{ '--ds-contribution-week': weekIndex } as React.CSSProperties}
            >
              {week.map((day, dayIndex) =>
                day ? (
                  <div
                    key={day.date}
                    className={`ds-contribution-graph__cell ds-contribution-graph__cell--level-${day.level}`}
                    title={cellLabel(day.count, parseDay(day.date))}
                  />
                ) : (
                  <div key={`pad-${dayIndex}`} className="ds-contribution-graph__cell ds-contribution-graph__cell--empty" />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {(caption || showLegend) && (
        <div className="ds-contribution-graph__footer">
          {caption && <span className="ds-contribution-graph__caption">{caption}</span>}
          {showLegend && (
            <div className="ds-contribution-graph__legend" aria-hidden="true">
              <span className="ds-contribution-graph__legend-label">{lessLabel}</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`ds-contribution-graph__cell ds-contribution-graph__cell--level-${level}`} />
              ))}
              <span className="ds-contribution-graph__legend-label">{moreLabel}</span>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
});

ContributionGraph.displayName = 'ContributionGraph';
