import React from 'react';
import '../Chart/Chart.css';
import './GanttChart.css';

/** Accent roles a Gantt bar or milestone can take — the core accent vocabulary shared with EventCalendar. */
export type GanttChartColor =
  | 'neutral'
  | 'coral'
  | 'violet'
  | 'cobalt'
  | 'amber'
  | 'gold'
  | 'mint';

/** One task bar on the timeline. */
export interface GanttChartItem {
  /** Unique item identifier. Selection and the click callback key on it. */
  id: string;
  /** Task name, shown in the sticky label column. */
  label: string;
  /** First day of the bar (YYYY-MM-DD). */
  start: string;
  /** Last day of the bar, inclusive (YYYY-MM-DD). */
  end: string;
  /** Accent for the bar, from the core accent roles. Defaults to `neutral`. */
  color?: GanttChartColor;
  /** Completion from 0 to 100. When set, the bar shows a quiet track with the accent filling this share; without it the whole bar takes the accent. */
  progress?: number;
  /** Draws the bar as a dashed outline, for planned or tentative work whose dates are targets rather than commitments. */
  projected?: boolean;
  /** Group heading this item sits under. Items sharing a group render under one heading row; omit for a flat chart. */
  group?: string;
  /** Extra line appended to the bar's tooltip and accessible text, e.g. "Target: Q4 2026". */
  detail?: string;
}

/** A point-in-time marker on the timeline, drawn as a diamond on its own row. */
export interface GanttChartMilestone {
  /** Unique milestone identifier. */
  id: string;
  /** Milestone name, shown in the sticky label column. */
  label: string;
  /** The day the diamond sits on (YYYY-MM-DD). */
  date: string;
  /** Accent for the diamond, from the core accent roles. Defaults to `neutral`. */
  color?: GanttChartColor;
  /** Group heading this milestone sits under, matching the items' group labels. */
  group?: string;
}

/** Props owned by GanttChart itself — everything else falls through to the root div. */
type GanttChartOwnProps = {
  /** Task bars, in display order. */
  items: GanttChartItem[];
  /** Point-in-time markers, each rendered as its own diamond row at the end of its group. */
  milestones?: GanttChartMilestone[];
  /** Explicit timeline window (YYYY-MM-DD both ends). Without it the range fits the data, snapped outward to whole months. */
  range?: { start: string; end: string };
  /** Draws the vertical today rule when today falls inside the range. */
  showToday?: boolean;
  /** Pins the today rule to a given day (YYYY-MM-DD) instead of the render-time clock, so a statically built page and its hydrating client can never disagree about where the rule sits. */
  today?: string;
  /** Draws the faint vertical gridline at each month boundary behind the bars. */
  showGrid?: boolean;
  /** Id of the highlighted item. Selection is controlled; pair it with `onItemClick`. */
  selectedId?: string;
  /** Called with the item when a bar is clicked. Bars render as buttons only when this is set; without it the chart is inert and renders from a Server Component. */
  onItemClick?: (item: GanttChartItem) => void;
  /** Chart title, in the shared chart header. */
  title?: string;
  /** Description text below the title. */
  subtitle?: string;
  /** Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface */
  bare?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface GanttChartProps
  extends GanttChartOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof GanttChartOwnProps | 'children'> {}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO date string in local time (avoids UTC day-shift). */
const parseDay = (date: string) => new Date(`${date}T00:00:00`);

const isValidDay = (date: Date) => !Number.isNaN(date.getTime());

/** Whole days from `from` to `to` — local-midnight dates, so DST cannot skew the count by a full day. */
const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);

const formatDay = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** One row block per group label, in first-appearance order; ungrouped rows form an unlabelled block. */
const buildBlocks = (items: GanttChartItem[], milestones: GanttChartMilestone[]) => {
  const blocks: { group?: string; items: GanttChartItem[]; milestones: GanttChartMilestone[] }[] = [];
  const byGroup = new Map<string | undefined, (typeof blocks)[number]>();
  const blockFor = (group?: string) => {
    let block = byGroup.get(group);
    if (!block) {
      block = { group, items: [], milestones: [] };
      byGroup.set(group, block);
      blocks.push(block);
    }
    return block;
  };
  items.forEach((item) => blockFor(item.group).items.push(item));
  milestones.forEach((milestone) => blockFor(milestone.group).milestones.push(milestone));
  return blocks;
};

/**
 * GanttChart — phases and tasks as bars on a shared timeline, with milestone
 * diamonds, optional per-bar progress, month gridlines, and a today rule.
 * Read-only by design: it draws a schedule, it does not edit one. Pure
 * computed markup with no charting library and no hooks, so it renders from
 * a Server Component; pass `onItemClick` (from a client boundary) and the
 * bars become buttons with `selectedId` as the controlled highlight. It wears
 * the chart family's card chrome (title, subtitle, padding) and takes `bare`
 * to drop it inside a panel that supplies the surface. The label column stays
 * sticky while the timeline scrolls horizontally on narrow screens.
 */
export const GanttChart = React.forwardRef<HTMLDivElement, GanttChartProps>(
  (
    {
      items,
      milestones = [],
      range,
      showToday = true,
      today,
      showGrid = true,
      selectedId,
      onItemClick,
      title,
      subtitle,
      bare = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-gantt';
    const chartClass = 'ds-chart';

    const classes = [chartClass, bare && `${chartClass}--bare`, baseClass, className]
      .filter(Boolean)
      .join(' ');

    // Resolve the window: explicit range, or fit the data. Either way the
    // window snaps outward to whole months so the axis starts and ends clean.
    const dates = range
      ? [parseDay(range.start), parseDay(range.end)]
      : [
          ...items.flatMap((item) => [parseDay(item.start), parseDay(item.end)]),
          ...milestones.map((milestone) => parseDay(milestone.date)),
        ];
    const validDates = dates.filter(isValidDay);

    let rangeStart: Date | null = null;
    let totalDays = 0;
    if (validDates.length > 0) {
      const min = new Date(Math.min(...validDates.map((d) => d.getTime())));
      const max = new Date(Math.max(...validDates.map((d) => d.getTime())));
      if (max.getTime() >= min.getTime()) {
        rangeStart = new Date(min.getFullYear(), min.getMonth(), 1);
        // Last day of the end month, plus one: percentages are computed over
        // the exclusive end so the final day still gets non-zero width.
        const rangeEnd = new Date(max.getFullYear(), max.getMonth() + 1, 1);
        totalDays = daysBetween(rangeStart, rangeEnd);
      }
    }

    // A degenerate window (no rows, unparseable or inverted dates) draws an
    // empty body rather than NaN positions.
    const drawable = rangeStart !== null && totalDays > 0;

    const percentOf = (date: Date) =>
      rangeStart ? (daysBetween(rangeStart, date) / totalDays) * 100 : 0;
    const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

    // Month segments for the axis labels and gridlines.
    const months: { label: string; left: number }[] = [];
    if (drawable && rangeStart) {
      const cursor = new Date(rangeStart.getTime());
      const end = new Date(rangeStart.getTime());
      end.setDate(end.getDate() + totalDays);
      while (cursor.getTime() < end.getTime()) {
        const monthName = cursor.toLocaleDateString('en-US', { month: 'short' });
        const label =
          cursor.getMonth() === 0 || months.length === 0
            ? `${monthName} ${cursor.getFullYear()}`
            : monthName;
        months.push({ label, left: percentOf(cursor) });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    const now = today ? parseDay(today) : new Date();
    const todayStart = isValidDay(now)
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : null;
    const todayPercent = drawable && todayStart ? percentOf(todayStart) : -1;
    const todayVisible = showToday && drawable && todayPercent >= 0 && todayPercent <= 100;

    const blocks = buildBlocks(items, milestones);

    const itemText = (item: GanttChartItem) => {
      const startDate = parseDay(item.start);
      const endDate = parseDay(item.end);
      const span =
        isValidDay(startDate) && isValidDay(endDate)
          ? `${formatDay(startDate)} to ${formatDay(endDate)}`
          : '';
      const parts = [item.label, span];
      if (typeof item.progress === 'number') parts.push(`${Math.round(item.progress)}% complete`);
      if (item.projected) parts.push('projected');
      if (item.detail) parts.push(item.detail);
      return parts.filter(Boolean).join(', ');
    };

    const milestoneText = (milestone: GanttChartMilestone) => {
      const date = parseDay(milestone.date);
      return isValidDay(date) ? `${milestone.label}, ${formatDay(date)}` : milestone.label;
    };

    const renderBar = (item: GanttChartItem) => {
      const startDate = parseDay(item.start);
      const endDate = parseDay(item.end);
      if (!isValidDay(startDate) || !isValidDay(endDate) || endDate.getTime() < startDate.getTime()) {
        return null;
      }
      const left = clampPercent(percentOf(startDate));
      // The end day is inclusive, so the bar runs to the start of the next day.
      const right = clampPercent(
        ((daysBetween(rangeStart as Date, endDate) + 1) / totalDays) * 100,
      );
      const width = Math.max(right - left, 0);
      if (width === 0) return null;

      const progress =
        typeof item.progress === 'number' ? Math.min(Math.max(item.progress, 0), 100) : undefined;

      const barClasses = [
        `${baseClass}__bar`,
        `${baseClass}__bar--${item.color ?? 'neutral'}`,
        progress !== undefined && `${baseClass}__bar--tracked`,
        item.projected && `${baseClass}__bar--projected`,
        selectedId === item.id && `${baseClass}__bar--selected`,
      ]
        .filter(Boolean)
        .join(' ');

      const barStyle: React.CSSProperties = { left: `${left}%`, width: `${width}%` };
      const text = itemText(item);
      const fill =
        progress !== undefined ? (
          <span className={`${baseClass}__bar-fill`} style={{ width: `${progress}%` }} />
        ) : null;

      // The bar is a button only when a click callback exists — an inert
      // drawing never advertises interactivity it does not have.
      if (onItemClick) {
        return (
          <button
            type="button"
            className={barClasses}
            style={barStyle}
            title={text}
            aria-label={text}
            aria-pressed={selectedId === item.id}
            onClick={() => onItemClick(item)}
          >
            {fill}
          </button>
        );
      }
      return (
        <div className={barClasses} style={barStyle} title={text}>
          {fill}
          <span className={`${baseClass}__sr`}>{text}</span>
        </div>
      );
    };

    const renderMilestone = (milestone: GanttChartMilestone) => {
      const date = parseDay(milestone.date);
      if (!isValidDay(date)) return null;
      const left = percentOf(date) + 100 / totalDays / 2;
      if (left < 0 || left > 100) return null;
      const text = milestoneText(milestone);
      return (
        <div
          className={`${baseClass}__milestone ${baseClass}__milestone--${milestone.color ?? 'neutral'}`}
          style={{ left: `${left}%` }}
          title={text}
        >
          <span className={`${baseClass}__sr`}>{text}</span>
        </div>
      );
    };

    // The drawing overlay (gridlines + today rule) spans every row once,
    // offset past the label column so its percentages line up with the bars.
    const overlay = (
      <div className={`${baseClass}__overlay`} aria-hidden="true">
        {showGrid &&
          months.slice(1).map((month) => (
            <span key={month.label + month.left} className={`${baseClass}__gridline`} style={{ left: `${month.left}%` }} />
          ))}
        {todayVisible && (
          <span className={`${baseClass}__today`} style={{ left: `${todayPercent}%` }}>
            <span className={`${baseClass}__today-label`}>Today</span>
          </span>
        )}
      </div>
    );

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
        <div className={`${chartClass}__body ${baseClass}__body`}>
          {drawable && (
            <div className={`${baseClass}__scroll`}>
              <div className={`${baseClass}__canvas`}>
                <div className={`${baseClass}__axis`} aria-hidden="true">
                  <div className={`${baseClass}__corner`} />
                  <div className={`${baseClass}__months`}>
                    {months.map((month) => (
                      <span
                        key={month.label + month.left}
                        className={`${baseClass}__month-label`}
                        style={{ left: `${month.left}%` }}
                      >
                        {month.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`${baseClass}__rows`}>
                  {overlay}
                  {blocks.map((block, blockIndex) => (
                    <React.Fragment key={block.group ?? `block-${blockIndex}`}>
                      {block.group && (
                        <div className={`${baseClass}__group-row`}>
                          <div className={`${baseClass}__group-label`}>{block.group}</div>
                          <div className={`${baseClass}__track`} />
                        </div>
                      )}
                      <ul className={`${baseClass}__list`} aria-label={block.group}>
                        {block.items.map((item) => (
                          <li key={item.id} className={`${baseClass}__row`}>
                            <div className={`${baseClass}__label`}>{item.label}</div>
                            <div className={`${baseClass}__track`}>{renderBar(item)}</div>
                          </li>
                        ))}
                        {block.milestones.map((milestone) => (
                          <li key={milestone.id} className={`${baseClass}__row`}>
                            <div className={`${baseClass}__label ${baseClass}__label--milestone`}>
                              {milestone.label}
                            </div>
                            <div className={`${baseClass}__track`}>{renderMilestone(milestone)}</div>
                          </li>
                        ))}
                      </ul>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

GanttChart.displayName = 'GanttChart';
