"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import {
  EventCalendar,
  type EventCalendarEvent,
} from "rift-ds/components/EventCalendar/EventCalendar";
import { Button } from "rift-ds/components/Button/Button";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


const events: EventCalendarEvent[] = [
  { id: "e1", date: "2026-08-01", title: "Brunch", start: "11:00", color: "amber" },
  { id: "e2", date: "2026-08-03", title: "Stand-up", start: "11:30", color: "cobalt" },
  { id: "e3", date: "2026-08-03", title: "1:1 sync", start: "16:30", color: "cobalt" },
  { id: "e4", date: "2026-08-05", title: "Gym", start: "07:00", color: "mint" },
  { id: "e5", date: "2026-08-08", title: "Game night", start: "19:00", color: "violet" },
  { id: "e6", date: "2026-08-11", title: "Holidays", color: "gold" },
  { id: "e7", date: "2026-08-11", title: "Birthday dinner", start: "20:30", color: "coral" },
  { id: "e8", date: "2026-08-14", title: "Retro", start: "15:00", color: "cobalt" },
  { id: "e9", date: "2026-08-17", title: "Planning", start: "10:00", color: "cobalt" },
  { id: "e10", date: "2026-08-17", title: "Haircut", start: "16:00" },
  { id: "e11", date: "2026-08-20", title: "Stand-up", start: "11:30", color: "cobalt" },
  { id: "e12", date: "2026-08-20", title: "Team lunch", start: "13:00", color: "amber" },
  { id: "e13", date: "2026-08-20", title: "Portfolio review", start: "14:30", color: "violet" },
  { id: "e14", date: "2026-08-20", title: "1:1 sync", start: "16:30", color: "cobalt" },
  { id: "e15", date: "2026-08-24", title: "Dinner with friends", start: "19:15", color: "coral" },
  { id: "e16", date: "2026-08-27", title: "Yoga", start: "07:30", color: "mint" },
  { id: "e17", date: "2026-08-29", title: "Brunch", start: "11:00", color: "amber" },
  { id: "e18", date: "2026-08-31", title: "Payday", color: "gold" },
];

function ScheduleDemo() {
  const [selected, setSelected] = React.useState<string | null>("2026-08-20");
  const [selectedDate, setSelectedDate] = React.useState("2026-08-20");

  return (
    <div className={styles.demoStack}>
      <EventCalendar
        events={events}
        defaultMonth="2026-08"
        selectedDate={selectedDate}
        onEventClick={(event) => {
          setSelectedDate(event.date);
          setSelected(`${event.title}${event.start ? ` at ${event.start}` : ""}`);
        }}
        onDateClick={(date) => {
          setSelectedDate(date);
          setSelected(date);
        }}
        actions={
          <Button variant="secondary" size="compact" label="New event" iconLeft="add" />
        }
      />
      <p className={styles.demoReadout} aria-live="polite">
        {selected ? `Selected: ${selected}` : "Click an event, a day, or an overflow row."}
      </p>
    </div>
  );
}

export default function EventCalendarPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Event calendar</h1>
        <PageLinks storybookPath="/?path=/docs/components-eventcalendar--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>
          A month at a glance
        </p>
        <p className={styles.introBody}>
          Date picker selects a date, this one shows a schedule: a full
          month grid with event pills on their days, an overflow row once
          a day is full, and month navigation, or one week or one day at
          a time. A legend can toggle the colours, and a panel can list
          the selected day. On a phone the month draws each event as its
          dot. It places what it is given, so fetching, filtering, and
          what a click means stay with you.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="A month with plans" />
        <p className={styles.demoText}>
          Events carry a date, a title, an optional start and end time, and an accent
          from the core accent roles, never the action colour. Untimed
          events sort first within a day, and rows share the height of
          the fullest day in their week. Clicking a day, or anywhere on
          its cell, moves the selection chip to its number.
        </p>
        <ScheduleDemo />
      </section>

      <section className={styles.section}>
        <SectionTitle title="Overflow" />
        <p className={styles.demoText}>
          Past maxEventsPerDay, here two, the rest collapse into an
          overflow row. With onDateClick set it becomes a button, as in
          the demo above, so a click can open the day, in the day view or
          a panel of your own.
        </p>
        <EventCalendar
          events={events}
          defaultMonth="2026-08"
          maxEventsPerDay={2}
        />
      </section>

      <section className={styles.section}>
        <SectionTitle title="Read only" />
        <p className={styles.demoText}>
          With no click handlers, pills and day numbers render as inert
          text rather than buttons, so a display calendar contains no
          fake affordances. Month navigation still works.
        </p>
        <EventCalendar events={events.slice(0, 8)} defaultMonth="2026-08" />
      </section>

      <ComponentInstallStrip slug="event-calendar" />
    </div>
  );
}
