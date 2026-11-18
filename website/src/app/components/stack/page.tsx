import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Stack } from "rift-ds/components/Stack/Stack";
import { Panel } from "rift-ds/components/Panel/Panel";
import { Button } from "rift-ds/components/Button/Button";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function StackPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Stack</h1>
            <PageLinks storybookPath="/?path=/docs/components-stack--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>One direction, one gap</p>
            <p className={styles.introBody}>
              Stack lays its children out in a column or a row with a gap from the scale between them, so the space in a page, a panel or a form comes from the system rather than from a margin on each piece. It adds no semantics of its own: render it as a list, a section or a form when it is one.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Column" />
            <div className={styles.demoSurface}>
              <Stack>
                <Panel bordered padding="compact"><p className={styles.cellText}>Account details</p></Panel>
                <Panel bordered padding="compact"><p className={styles.cellText}>Notifications</p></Panel>
                <Panel bordered padding="compact"><p className={styles.cellText}>Billing</p></Panel>
              </Stack>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Row, spread to the ends" />
            <div className={styles.demoSurface}>
              <Stack direction="row" justify="between">
                <Button label="Back" variant="secondary" />
                <Stack direction="row" gap="200">
                  <Button label="Save draft" variant="tertiary" />
                  <Button label="Continue" />
                </Stack>
              </Stack>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Equal heights" />
            <div className={styles.demoSurface}>
              <Stack direction="row" align="stretch" gap="500" wrap>
                <Panel bordered className={styles.card}><p className={styles.cellText}>A short card.</p></Panel>
                <Panel bordered className={styles.card}><p className={styles.cellText}>A card with more to say, running over several lines, sets the height for the cards beside it.</p></Panel>
                <Panel bordered className={styles.card}><p className={styles.cellText}>Another short one.</p></Panel>
              </Stack>
            </div>
          </section>

          <ComponentInstallStrip slug="stack" />
        </main>
      </div>
    </>
  );
}
