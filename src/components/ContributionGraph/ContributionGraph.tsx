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

export interface ContributionGraphProps {
  /** One entry per day, ordered oldest to newest */
  days: ContributionDay[];
  /** Chart title, in the shared chart header. */
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
  /** Additional CSS classes */
  className?: string;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Parse an ISO date string in local time (avoids UTC day-shift) */
const parseDay = (date: string) => new Date(`${date}T00:00:00`);

const formatTooltip = (day: ContributionDay) => {
  const formatted = parseDay(day.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (day.count === 0) return `No contributions on ${formatted}`;
  if (day.count === 1) return `1 contribution on ${formatted}`;
  return `${day.count} contributions on ${formatted}`;
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
const buildMonthLabels = (weeks: (ContributionDay | null)[][]) => {
  const labels: { weekIndex: number; label: string }[] = [];
  let previousMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((day) => day !== null);
    if (!firstDay) return;
    const month = parseDay(firstDay.date).getMonth();
    if (month !== previousMonth) {
      // Skip a label in the last column — it would render clipped
      if (weekIndex < weeks.length - 2 || labels.length === 0) {
        labels.push({ weekIndex, label: MONTH_LABELS[month] });
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
export const ContributionGraph = ({
  days,
  title,
  subtitle,
  bare = false,
  caption,
  showMonthLabels = true,
  showLegend = true,
  className = '',
}: ContributionGraphProps) => {
  const weeks = buildWeeks(days);
  const monthLabels = buildMonthLabels(weeks);

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
    <div className={classes}>
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
          aria-label={caption ?? 'Contribution activity'}
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
                    title={formatTooltip(day)}
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
              <span className="ds-contribution-graph__legend-label">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`ds-contribution-graph__cell ds-contribution-graph__cell--level-${level}`} />
              ))}
              <span className="ds-contribution-graph__legend-label">More</span>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
