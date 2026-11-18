import React from "react";
import { DEFAULT_LOCALE } from "../../behaviors/locale";
import { ScrollRegion } from "../../behaviors/ScrollRegion";
import "../../behaviors/visually-hidden.css";
import "../../behaviors/direction.css";
import "./ResourceTimeline.css";

/** The accents a bar can take, the core accent roles the calendar's events use. */
export type ResourceTimelineColor =
  "neutral" | "coral" | "violet" | "cobalt" | "amber" | "gold" | "mint";

/** One stretch of time on a row: a booking, a meeting, a run. */
export interface ResourceTimelineBar {
  /** A stable id for the bar. */
  id: string;
  /** When it starts, as 24-hour `HH:MM`. */
  start: string;
  /** When it ends, as 24-hour `HH:MM`. */
  end: string;
  /** A short label on the bar ("Front desk", "Break"). */
  label?: string;
  /** The bar's accent. Defaults to `neutral`. */
  color?: ResourceTimelineColor;
}

/** One row of the timeline: a person, a room, a machine. */
export interface ResourceTimelineRow {
  /** A stable id for the row. */
  id: string;
  /** What the row is, shown in the label column. */
  label: string;
  /** The row's bars, in any order. */
  bars: ResourceTimelineBar[];
}

/** Props owned by ResourceTimeline itself; everything else falls through to the root `<div>`. */
type ResourceTimelineOwnProps = {
  /** The rows, top to bottom. */
  rows: ResourceTimelineRow[];
  /** The first hour the axis shows, 0 to 23. Defaults to 6. */
  startHour?: number;
  /** The hour the axis ends at, 1 to 24. Defaults to 22. */
  endHour?: number;
  /** A line at this time (`HH:MM`), such as the time now. */
  now?: string;
  /** The timeline's name, read before its rows ("Bookings, Tuesday 4 March"). */
  label: string;
  /** The header of the label column. Defaults to "Name". */
  rowHeaderLabel?: string;
  /** Called with the bar and its row when a bar is pressed; bars are buttons only when it is set. */
  onBarClick?: (bar: ResourceTimelineBar, row: ResourceTimelineRow) => void;
  /** The BCP 47 locale the times are written in, such as `de-DE`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface ResourceTimelineProps
  extends
    ResourceTimelineOwnProps,
    Omit<
      React.ComponentPropsWithRef<"div">,
      keyof ResourceTimelineOwnProps | "children"
    > {}

/** Minutes since midnight for `HH:MM`, or null when it is not a time. */
const minutesOf = (time: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

/**
 * Hours within one day: a row per person or resource, a bar from each
 * start to its end, on an axis of hours in the reader's locale. Room
 * bookings, a team's meetings, a machine's runs. Each bar is named with its row and its times,
 * and its label sits on the calendar's event fill, so it reads in every
 * theme whatever the accent. Server-renderable.
 */
export function ResourceTimeline({
  rows,
  startHour = 6,
  endHour = 22,
  now,
  label,
  rowHeaderLabel = "Name",
  onBarClick,
  locale = DEFAULT_LOCALE,
  className = "",
  style,
  ref,
  ...rest
}: ResourceTimelineProps) {
  const from = Math.max(0, Math.min(23, startHour)) * 60;
  const to = Math.max(from / 60 + 1, Math.min(24, endHour)) * 60;
  const span = to - from;
  const at = (minutes: number) =>
    ((Math.min(Math.max(minutes, from), to) - from) / span) * 100;

  const hourFormat = new Intl.DateTimeFormat(locale, { hour: "numeric" });
  const timeFormat = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  const asDate = (minutes: number) =>
    new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  const range = (start: number, end: number) =>
    timeFormat.formatRange(asDate(start), asDate(end));

  const hours: number[] = [];
  for (let h = from / 60; h <= to / 60; h++) hours.push(h);
  const nowMinutes = now ? minutesOf(now) : null;

  const classes = ["ds-resource-timeline", className].filter(Boolean).join(" ");
  return (
    <div
      role="group"
      aria-label={label}
      {...rest}
      ref={ref}
      className={classes}
      style={
        {
          ...style,
          "--ds-resource-timeline-hours": hours.length - 1,
        } as React.CSSProperties
      }
    >
      <ScrollRegion className="ds-resource-timeline__scroll">
        <div className="ds-resource-timeline__head" aria-hidden="true">
          <span className="ds-resource-timeline__row-header">{rowHeaderLabel}</span>
          <div className="ds-resource-timeline__axis">
            {hours.map((h) => (
              <span
                key={h}
                className="ds-resource-timeline__tick"
                style={{ insetInlineStart: `${at(h * 60)}%` }}
              >
                {h < 24 ? hourFormat.format(asDate(h * 60)) : ""}
              </span>
            ))}
          </div>
        </div>
        <ul className="ds-resource-timeline__rows">
          {rows.map((row) => (
            <li key={row.id} className="ds-resource-timeline__row">
              <span className="ds-resource-timeline__label">{row.label}</span>
              <div className="ds-resource-timeline__track">
                {hours.map((h) => (
                  <span
                    key={h}
                    className="ds-resource-timeline__gridline"
                    style={{ insetInlineStart: `${at(h * 60)}%` }}
                    aria-hidden="true"
                  />
                ))}
                {nowMinutes !== null &&
                  nowMinutes >= from &&
                  nowMinutes <= to && (
                    <span
                      className="ds-resource-timeline__now"
                      style={{ insetInlineStart: `${at(nowMinutes)}%` }}
                      aria-hidden="true"
                    />
                  )}
                {row.bars.map((bar) => {
                  const start = minutesOf(bar.start);
                  const end = minutesOf(bar.end);
                  if (start === null || end === null || end <= start)
                    return null;
                  const name = `${row.label}, ${bar.label ? `${bar.label}, ` : ""}${range(start, end)}`;
                  const barClass = `ds-resource-timeline__bar ds-resource-timeline__bar--${bar.color ?? "neutral"}`;
                  const barStyle = {
                    insetInlineStart: `${at(start)}%`,
                    inlineSize: `${at(end) - at(start)}%`,
                  };
                  const content = (
                    <>
                      <span
                        className="ds-resource-timeline__bar-label"
                        aria-hidden="true"
                      >
                        {bar.label ?? range(start, end)}
                      </span>
                      <span className="ds-visually-hidden">{name}</span>
                    </>
                  );
                  return onBarClick ? (
                    <button
                      key={bar.id}
                      type="button"
                      className={barClass}
                      style={barStyle}
                      onClick={() => onBarClick(bar, row)}
                    >
                      {content}
                    </button>
                  ) : (
                    <span key={bar.id} className={barClass} style={barStyle}>
                      {content}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </ScrollRegion>
    </div>
  );
}
