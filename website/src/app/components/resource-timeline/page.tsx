import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { ResourceTimeline } from "rift-ds/components/ResourceTimeline/ResourceTimeline";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function ResourceTimelinePage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Resource timeline</h1>
        <PageLinks storybookPath="/?path=/docs/components-resourcetimeline--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Hours within one day</p>
        <p className={styles.introBody}>
          Resource timeline gives each person, room or machine a row and draws a bar from each start to its end on an axis of hours, written the reader’s way. Every bar is named with its row and its times, and its label sits on the calendar’s event fill, so it reads in every theme whatever its accent.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Bookings" />
        <div className={styles.demoSurface}>
          <ResourceTimeline
            label="Bookings, Tuesday"
            startHour={7}
            endHour={20}
            now="13:20"
            rows={[
              { id: "a", label: "Room A", bars: [{ id: "a1", start: "08:00", end: "12:00", label: "Workshop", color: "violet" }, { id: "a2", start: "13:00", end: "17:30", label: "Training", color: "violet" }] },
              { id: "b", label: "Room B", bars: [{ id: "b1", start: "09:30", end: "10:30", label: "Stand-up", color: "cobalt" }] },
              { id: "c", label: "Studio", bars: [{ id: "c1", start: "10:00", end: "18:00", label: "Recording", color: "mint" }] },
            ]}
          />
        </div>
      </section>

      <ComponentInstallStrip slug="resource-timeline" />
    </div>
  );
}
