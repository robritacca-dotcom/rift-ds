"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { EmptyState } from "@robr0/design-system/components/EmptyState/EmptyState";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function EmptyStatePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Empty state</h1>
            <PageLinks storybookPath="/?path=/docs/components-emptystate--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Blank space that still says something</p>
            <p className={styles.introBody}>
              Every list, table, and search eventually has nothing to show.
              EmptyState fills that space with an icon, a headline, and (most
              importantly) the next action. Write the description as guidance,
              not as a statement of absence: “Create your first project” beats
              “No projects found”.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoBox}>
              <EmptyState
                icon="inbox"
                title="No messages yet"
                description="When someone sends you a message, it will show up here."
              />
            </div>
          </section>

          {/* With an action */}
          <section className={styles.section}>
            <SectionTitle title="With an action" />
            <div className={styles.demoBox}>
              <EmptyState
                icon="folder_open"
                title="No projects"
                description="Create your first project to start organising work."
                action={<Button label="New project" variant="primary" iconLeft="add" />}
              />
            </div>
          </section>

          {/* Bordered, in context */}
          <section className={styles.section}>
            <SectionTitle title="Bordered" />
            <p className={styles.demoCaption}>
              The dashed container reads better inside a card, panel, or table
              body, where the empty region needs its own edge.
            </p>
            <div className={styles.demoSurface}>
              <div className={styles.demoTableHead}>
                <span>Name</span>
                <span>Owner</span>
                <span>Updated</span>
              </div>
              <div style={{ padding: "16px" }}>
                <EmptyState
                  variant="bordered"
                  icon="table_rows"
                  title="This table is empty"
                  description="Rows you add will appear here."
                  action={<Button label="Add row" variant="primary" iconLeft="add" />}
                />
              </div>
            </div>
          </section>

          {/* Common patterns */}
          <section className={styles.section}>
            <SectionTitle title="Common patterns" />
            <div className={styles.demoStack}>
              <div className={styles.demoBox}>
                <p className={styles.demoCaption}>No search results</p>
                <EmptyState
                  variant="bordered"
                  icon="search_off"
                  title="No results for “quarterly”"
                  description="Check the spelling, or try a broader search term."
                  action={<Button label="Clear search" variant="secondary" />}
                />
              </div>

              <div className={styles.demoBox}>
                <p className={styles.demoCaption}>Error recovery</p>
                <EmptyState
                  variant="bordered"
                  icon="cloud_off"
                  title="Could not load your data"
                  description="Something went wrong on our end. Try again in a moment."
                  action={<Button label="Retry" variant="primary" iconLeft="refresh" />}
                />
              </div>

              <div className={styles.demoBox}>
                <p className={styles.demoCaption}>First run, two paths forward</p>
                <EmptyState
                  variant="bordered"
                  icon="group_add"
                  title="No teammates yet"
                  description="Invite people to collaborate, or import them from your directory."
                  action={
                    <>
                      <Button label="Invite people" variant="primary" />
                      <Button label="Import" variant="secondary" />
                    </>
                  }
                />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <p className={styles.demoCaption}>
              A smaller icon and tighter padding, for sidebars and dense panels.
            </p>
            <div className={styles.demoBox}>
              <EmptyState
                size="compact"
                variant="bordered"
                icon="notifications_off"
                title="Nothing to catch up on"
                description="New notifications will land here."
              />
            </div>
          </section>

          {/* Without an icon */}
          <section className={styles.section}>
            <SectionTitle title="Without an icon" />
            <p className={styles.demoCaption}>
              The icon is optional. Text alone suits dense layouts.
            </p>
            <div className={styles.demoBox}>
              <EmptyState
                variant="bordered"
                title="Nothing here yet"
                description="Items you add will appear in this list."
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
