import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Grid } from "rift-ds/components/Grid/Grid";
import { Panel } from "rift-ds/components/Panel/Panel";
import { Stat } from "rift-ds/components/Stat/Stat";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function GridPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Grid</h1>
            <PageLinks storybookPath="/?path=/docs/components-grid--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Equal columns that fold by their own width</p>
            <p className={styles.introBody}>
              Grid runs its cells in equal columns, up to the number you set, and drops a column whenever one would get narrower than its floor. It measures itself rather than the window, so it folds the same beside an open sidebar as on a phone, and the cards in a row share its height.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Stat cards" />
            <div className={styles.demoSurface}>
              <Grid columns={4}>
                <Panel bordered><Stat icon="group" caption="This month" value="1,284" label="Active members" trend="up" delta="+8%" /></Panel>
                <Panel bordered><Stat icon="shopping_cart" caption="This month" value="342" label="Orders" trend="up" delta="+3%" /></Panel>
                <Panel bordered><Stat icon="schedule" caption="This month" value="2.4 days" label="Average lead time" /></Panel>
                <Panel bordered><Stat icon="star" caption="This month" value="4.7" label="Average rating" trend="down" delta="-0.1" /></Panel>
              </Grid>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="In a narrow column" />
            <div className={styles.demoSurface}>
              <div className={styles.narrow}>
                <Grid columns={4}>
                  <Panel bordered padding="compact"><p className={styles.cellText}>One</p></Panel>
                  <Panel bordered padding="compact"><p className={styles.cellText}>Two</p></Panel>
                  <Panel bordered padding="compact"><p className={styles.cellText}>Three</p></Panel>
                  <Panel bordered padding="compact"><p className={styles.cellText}>Four</p></Panel>
                </Grid>
              </div>
            </div>
          </section>

          <ComponentInstallStrip slug="grid" />
        </main>
      </div>
    </>
  );
}
