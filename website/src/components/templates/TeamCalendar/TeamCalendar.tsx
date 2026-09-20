"use client";

/**
 * The team calendar template: the planning screen for Cadence, a fictional
 * team planner, built from the design system alone. The shell is the
 * marketing dashboard's (floating AppSidebar, slim top bar, docked mock
 * assistant); the page is a two-pane spread. The EventCalendar holds the
 * stage, and a rail beside it carries the sprint's to-dos and the selected
 * day's schedule — clicking a day or an event pill on the grid moves the
 * rail's day view, so the two panes stay one screen rather than two widgets.
 * Every colour, radius, space, and type style is a semantic token; every
 * control is a library component.
 *
 * The month is pinned (the event-calendar showcase's pattern), so the data
 * and the prerendered HTML can never disagree. All of it is fictional, so
 * the route is excluded from the chat corpus (see EXCLUDED_ROUTES in
 * generate-site-corpus.mjs). The assistant is the shared TemplateAssistant
 * mock, answering over this month's schedule.
 */

import React from "react";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import {
  AppSidebar,
  type AppSidebarSection,
} from "@robr0/design-system/components/AppSidebar/AppSidebar";
import { Button } from "@robr0/design-system/components/Button/Button";
import { Checkbox } from "@robr0/design-system/components/Checkbox/Checkbox";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import {
  EventCalendar,
  type EventCalendarColor,
  type EventCalendarEvent,
} from "@robr0/design-system/components/EventCalendar/EventCalendar";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import { Panel } from "@robr0/design-system/components/Panel/Panel";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import styles from "./TeamCalendar.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "home", icon: "home", label: "Home" },
      { key: "tasks", icon: "task_alt", label: "Tasks" },
      { key: "calendar", icon: "calendar_month", label: "Calendar" },
      { key: "team", icon: "group", label: "Team" },
      { key: "reports", icon: "monitoring", label: "Reports" },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

/* The month is pinned so the grid, the canned answers, and the prerendered
   HTML all describe the same September. */
const MONTH = "2026-09";

const EVENTS: EventCalendarEvent[] = [
  { id: "e1", date: "2026-09-01", title: "Sprint planning", time: "10:00", color: "cobalt" },
  { id: "e2", date: "2026-09-03", title: "Design review", time: "14:00", color: "violet" },
  { id: "e3", date: "2026-09-04", title: "Team lunch", time: "12:30", color: "amber" },
  { id: "e4", date: "2026-09-07", title: "Release 1.4", color: "gold" },
  { id: "e5", date: "2026-09-08", title: "Stand-up", time: "09:30", color: "cobalt" },
  { id: "e6", date: "2026-09-09", title: "User interviews", time: "11:00", color: "violet" },
  { id: "e7", date: "2026-09-10", title: "1:1 with Sam", time: "15:30", color: "cobalt" },
  { id: "e8", date: "2026-09-11", title: "Yoga", time: "07:30", color: "mint" },
  { id: "e9", date: "2026-09-14", title: "Sprint planning", time: "10:00", color: "cobalt" },
  { id: "e10", date: "2026-09-15", title: "Roadmap review", time: "13:00", color: "violet" },
  { id: "e11", date: "2026-09-15", title: "Portfolio crit", time: "15:00", color: "violet" },
  { id: "e12", date: "2026-09-17", title: "Copy review", time: "11:00", color: "coral" },
  { id: "e13", date: "2026-09-18", title: "Demo day", time: "16:00", color: "amber" },
  { id: "e14", date: "2026-09-21", title: "Offsite", color: "gold" },
  { id: "e15", date: "2026-09-22", title: "Offsite", color: "gold" },
  { id: "e16", date: "2026-09-23", title: "Stand-up", time: "09:30", color: "cobalt" },
  { id: "e17", date: "2026-09-24", title: "Retro", time: "15:00", color: "cobalt" },
  { id: "e18", date: "2026-09-25", title: "Game night", time: "19:00", color: "amber" },
  { id: "e19", date: "2026-09-28", title: "Sprint planning", time: "10:00", color: "cobalt" },
  { id: "e20", date: "2026-09-29", title: "Beta cut-off", color: "coral" },
  { id: "e21", date: "2026-09-30", title: "Monthly report due", time: "17:00", color: "coral" },
];

type Todo = { id: string; label: string };
type TodoGroup = { label: string; items: Todo[] };

const TODO_GROUPS: TodoGroup[] = [
  {
    label: "This week",
    items: [
      { id: "t1", label: "Send the offsite agenda" },
      { id: "t2", label: "Book user interviews" },
      { id: "t3", label: "Draft the release notes" },
      { id: "t4", label: "Review onboarding copy" },
    ],
  },
  {
    label: "This month",
    items: [
      { id: "t5", label: "Plan the October sprint themes" },
      { id: "t6", label: "Close out the beta feedback" },
      { id: "t7", label: "Archive shipped projects" },
    ],
  },
];

const TODO_COUNT = TODO_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
const INITIAL_DONE: Record<string, boolean> = { t2: true, t7: true };

/* The rail's schedule dots reuse the calendar pills' accent roles, mapped to
   module classes so the colour stays a token. */
const DOT_CLASS: Record<EventCalendarColor, string> = {
  neutral: styles.dotNeutral,
  coral: styles.dotCoral,
  violet: styles.dotViolet,
  cobalt: styles.dotCobalt,
  amber: styles.dotAmber,
  gold: styles.dotGold,
  mint: styles.dotMint,
};

const CHAT_SUGGESTIONS = [
  { id: "week", label: "What's on this week?" },
  { id: "offsite", label: "When is the offsite?" },
  { id: "month", label: "How full is September?" },
];

const CHAT_REPLIES: Record<string, string> = {
  week: "The week of the 14th holds sprint planning on Monday at 10:00, the roadmap review and portfolio crit back to back on Tuesday, a copy review on Thursday, and demo day on Friday at 16:00. Wednesday is clear. Five of the seven to-dos are still open; the offsite agenda is the oldest.",
  offsite: "The offsite takes the 21st and 22nd, both held as all-day blocks with nothing booked around them. The agenda still needs sending: it sits at the top of this week's to-dos.",
  month: `September carries ${EVENTS.length} events. The sprint rituals anchor it: planning on the 1st, 14th and 28th, the retro on the 24th, and a stand-up either side of the offsite, which takes the 21st and 22nd. The month closes hard: beta cut-off on the 29th, and the monthly report due on the 30th.`,
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the calendar behind this screen.";

/* ------------------------------------------------------------- helpers */

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-09-15" → its display parts, formatted by hand so the server and
 *  the client can never disagree over a locale. */
function dayParts(date: string): {
  day: number;
  weekday: string;
  month: string;
} {
  const [y, m, d] = date.split("-").map(Number);
  return {
    day: d,
    weekday: WEEKDAYS[new Date(y, m - 1, d).getDay()],
    month: `${MONTH_NAMES[m - 1]} ${y}`,
  };
}

/** The day's events in the calendar's own order: untimed first, then by time. */
function eventsOn(date: string): EventCalendarEvent[] {
  return EVENTS.filter((e) => e.date === date).sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return -1;
    if (!b.time) return 1;
    return a.time.localeCompare(b.time);
  });
}

/* ---------------------------------------------------------------- page */

export default function TeamCalendar() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [done, setDone] = React.useState<Record<string, boolean>>(INITIAL_DONE);
  const [selectedDay, setSelectedDay] = React.useState("2026-09-15");

  const doneCount = Object.values(done).filter(Boolean).length;
  const dayEvents = eventsOn(selectedDay);
  const day = dayParts(selectedDay);

  return (
    // data-bg-hidden: the planner sits on the flat page colour, the same
    // switch the other templates use.
    <div className={styles.shell} data-bg-hidden="">
      <div className={styles.sidebar}>
        <AppSidebar
          sections={NAV_SECTIONS}
          profile={{ name: "Priya Chandra", email: "priya@cadence.app" }}
          activeKey="calendar"
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          logoText="Cadence"
          floating
          footerSlot={<ThemeToggle />}
        />
      </div>

      <main
        className={`${styles.main} ${
          sidebarExpanded ? styles.mainExpanded : ""
        } ${chatOpen ? styles.mainChatOpen : ""}`}
      >
        <div className={styles.content}>
          <div className={styles.topBar}>
            <div className={styles.search}>
              <Input
                placeholder="Search events"
                iconLeft="search"
                aria-label="Search events"
              />
              <span className={styles.searchKbd} aria-hidden="true">
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <div className={styles.topBarActions}>
              <AiButton
                label="Ask AI"
                size="compact"
                onClick={() => setChatOpen(true)}
              />
              <CircularButton
                icon="notifications"
                variant="secondary"
                size="compact"
                ariaLabel="Notifications"
              />
            </div>
          </div>

          <div className={styles.board}>
            {/* ------------------------------------------------ the rail */}
            <Panel className={styles.rail} aria-label="To-dos and day view">
              <div className={styles.railHeader}>
                <h1 className={styles.railTitle}>To-dos</h1>
                <span className={styles.railCount}>
                  {doneCount} of {TODO_COUNT} done
                </span>
              </div>

              {TODO_GROUPS.map((group) => (
                <div key={group.label} className={styles.group}>
                  <span className={styles.groupLabel}>{group.label}</span>
                  <div className={styles.todoList}>
                    {group.items.map((todo) => (
                      <Checkbox
                        key={todo.id}
                        label={todo.label}
                        checked={Boolean(done[todo.id])}
                        onCheckedChange={(checked) =>
                          setDone((current) => ({
                            ...current,
                            [todo.id]: checked,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}

              <Divider />

              {/* The selected day's schedule; clicking a day or a pill on
                  the grid moves it. */}
              <div className={styles.group}>
                <span className={styles.groupLabel}>On the day</span>
                <h2
                  className={styles.dayHeading}
                  aria-label={`${day.weekday} ${day.day} ${day.month}`}
                >
                  <span className={styles.dayNumber} aria-hidden="true">
                    {day.day}
                  </span>
                  <span className={styles.dayMeta} aria-hidden="true">
                    <span className={styles.dayWeekday}>{day.weekday}</span>
                    <span className={styles.dayMonth}>{day.month}</span>
                  </span>
                </h2>
                {dayEvents.length > 0 ? (
                  <ul className={styles.schedule}>
                    {dayEvents.map((event) => (
                      <li key={event.id} className={styles.scheduleRow}>
                        <span
                          className={`${styles.scheduleDot} ${
                            DOT_CLASS[event.color ?? "neutral"]
                          }`}
                          aria-hidden="true"
                        />
                        <span className={styles.scheduleTitle}>
                          {event.title}
                        </span>
                        <span className={styles.scheduleTime}>
                          {event.time ?? "All day"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.scheduleEmpty}>
                    Nothing booked. The day is free.
                  </p>
                )}
              </div>
            </Panel>

            {/* --------------------------------------------- the calendar */}
            <section className={styles.calendar} aria-label="Month calendar">
              <EventCalendar
                events={EVENTS}
                defaultMonth={MONTH}
                selectedDate={selectedDay}
                onDateClick={setSelectedDay}
                onEventClick={(event) => setSelectedDay(event.date)}
                actions={
                  <Button
                    variant="primary"
                    size="compact"
                    label="New event"
                    iconLeft="add"
                  />
                }
              />
            </section>
          </div>
        </div>
      </main>

      <TemplateAssistant
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Cadence AI"
        askLine="Ask about the schedule, the sprint, or the open to-dos"
        suggestions={CHAT_SUGGESTIONS}
        replies={CHAT_REPLIES}
        fallback={CHAT_FALLBACK}
        disclaimer="A mock assistant with canned answers over this month's schedule."
      />
    </div>
  );
}
