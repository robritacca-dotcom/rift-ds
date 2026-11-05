import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ActionReadout } from "rift-ds/components/ActionReadout/ActionReadout";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* Demo data: Fernway Trails is a fictional walking club, and every walk and
   figure named below is invented set dressing. */

export default function ActionReadoutPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Action readout</h1>
            <PageLinks storybookPath="/?path=/docs/components-actionreadout--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>What a change did</p>
            <p className={styles.introBody}>
              Action readout opens the reply a confirmed change gets: what
              was done, then what it did, a line each. The host works the
              facts out from the records as they were just before the change,
              so the readout is exact and needs no model. The assistant&apos;s
              words follow it, about what it means or what to do next.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="A headline over its facts" />
            <p className={styles.demoText}>
              The facts are a description list, so a screen reader reads each
              label with its value. A long value wraps inside its column and
              the card keeps its width.
            </p>
            <div className={styles.cardStage}>
              <ActionReadout
                headline="8 walks closed to bookings"
                icon="event_busy"
                facts={[
                  { label: "Status", value: "Open 6 · Waitlist 2 → Closed 8" },
                  { label: "Bookings kept", value: "143" },
                  { label: "Walks", value: "Heron Loop, Quarry Rise, Saltmarsh Way and 5 more" },
                  { label: "Left alone", value: "2 already full" },
                ]}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="action-readout" />
        </main>
      </div>
    </>
  );
}
