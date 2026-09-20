"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Drawer } from "@robr0/design-system/components/Drawer/Drawer";
import { Button } from "@robr0/design-system/components/Button/Button";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Checkbox } from "@robr0/design-system/components/Checkbox/Checkbox";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


type OpenKey =
  | "default"
  | "left"
  | "top"
  | "bottom"
  | "filters"
  | "small"
  | "large"
  | "long"
  | "locked"
  | null;

export default function DrawerPage() {
  const [open, setOpen] = useState<OpenKey>(null);
  const close = () => setOpen(null);
  const isOpen = (key: OpenKey) => open === key;

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Drawer</h1>
            <PageLinks storybookPath="/?path=/docs/components-drawer--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A panel anchored to an edge</p>
            <p className={styles.introBody}>
              Drawer shares Dialog’s modal contract (focus trap, focus restore,
              scroll lock, ESC and scrim dismissal) but slides in from a
              viewport edge instead of scaling from the centre. That makes it
              the right home for filter panels, detail views, and mobile
              navigation, where keeping the page visible behind the panel is
              part of the point.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoCaption}>
              Right-anchored, 420px wide. The body scrolls on its own so the
              header stays pinned.
            </p>
            <div className={styles.demoRow}>
              <Button
                label="Open drawer"
                variant="secondary"
                onClick={() => setOpen("default")}
              />
            </div>
            <Drawer
              open={isOpen("default")}
              onOpenChange={close}
              title="Order details"
              description="Everything about order #10482."
            >
              <p style={{ margin: 0 }}>
                Any content can live in the drawer body: forms, lists, or other
                components.
              </p>
            </Drawer>
          </section>

          {/* Sides */}
          <section className={styles.section}>
            <SectionTitle title="Sides" />
            <p className={styles.demoCaption}>
              Side drawers are sized in pixels; top and bottom drawers are sized
              as a fraction of viewport height.
            </p>
            <div className={styles.demoRow}>
              <Button label="From left" variant="secondary" onClick={() => setOpen("left")} />
              <Button label="From top" variant="secondary" onClick={() => setOpen("top")} />
              <Button
                label="From bottom"
                variant="secondary"
                onClick={() => setOpen("bottom")}
              />
            </div>

            <Drawer open={isOpen("left")} onOpenChange={close} side="left" title="Navigation">
              <p style={{ margin: 0 }}>
                A left-anchored drawer is the familiar mobile navigation pattern.
              </p>
            </Drawer>
            <Drawer open={isOpen("top")} onOpenChange={close} side="top" title="Announcement">
              <p style={{ margin: 0 }}>Top drawers suit banners and global notices.</p>
            </Drawer>
            <Drawer
              open={isOpen("bottom")}
              onOpenChange={close}
              side="bottom"
              title="Quick actions"
            >
              <p style={{ margin: 0 }}>A bottom sheet keeps actions within thumb reach.</p>
            </Drawer>
          </section>

          {/* With a footer */}
          <section className={styles.section}>
            <SectionTitle title="With a footer" />
            <p className={styles.demoCaption}>
              The footer right-aligns your Buttons and stays pinned while the
              body scrolls, the standard shape for a filter panel.
            </p>
            <div className={styles.demoRow}>
              <Button
                label="Open filters"
                variant="secondary"
                onClick={() => setOpen("filters")}
              />
            </div>
            <Drawer
              open={isOpen("filters")}
              onOpenChange={close}
              title="Filters"
              description="Narrow the results list."
              footer={
                <>
                  <Button label="Reset" variant="secondary" onClick={close} />
                  <Button label="Apply" variant="primary" onClick={close} />
                </>
              }
            >
              <div className={styles.demoFormStack}>
                <Input label="Search" placeholder="Keyword…" />
                <Checkbox label="In stock only" />
                <Checkbox label="On sale" />
                <Checkbox label="Free shipping" />
              </div>
            </Drawer>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.demoCaption}>
              sm 320px · md 420px (default) · lg 560px. Side drawers go
              full-width below 480px.
            </p>
            <div className={styles.demoRow}>
              <Button label="Small" variant="secondary" onClick={() => setOpen("small")} />
              <Button label="Large" variant="secondary" onClick={() => setOpen("large")} />
            </div>
            <Drawer open={isOpen("small")} onOpenChange={close} size="sm" title="Small drawer">
              <p style={{ margin: 0 }}>320px: enough for a compact detail panel.</p>
            </Drawer>
            <Drawer open={isOpen("large")} onOpenChange={close} size="lg" title="Large drawer">
              <p style={{ margin: 0 }}>560px: room for forms or side-by-side content.</p>
            </Drawer>
          </section>

          {/* Scrolling body */}
          <section className={styles.section}>
            <SectionTitle title="Scrolling body" />
            <div className={styles.demoRow}>
              <Button
                label="Open activity log"
                variant="secondary"
                onClick={() => setOpen("long")}
              />
            </div>
            <Drawer
              open={isOpen("long")}
              onOpenChange={close}
              title="Activity log"
              footer={<Button label="Close" variant="secondary" onClick={close} />}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Array.from({ length: 30 }, (_, i) => (
                  <p key={i} style={{ margin: 0 }}>
                    Event {i + 1}: the body scrolls while the header and footer stay put.
                  </p>
                ))}
              </div>
            </Drawer>
          </section>

          {/* Non-dismissible */}
          <section className={styles.section}>
            <SectionTitle title="Non-dismissible" />
            <p className={styles.demoCaption}>
              With <code>dismissible=&#123;false&#125;</code>, ESC and the scrim
              stop working and the close button is hidden: a footer action
              becomes the only way out. Use it sparingly.
            </p>
            <div className={styles.demoRow}>
              <Button
                label="Open locked drawer"
                variant="secondary"
                onClick={() => setOpen("locked")}
              />
            </div>
            <Drawer
              open={isOpen("locked")}
              onOpenChange={close}
              title="Finish setup"
              description="Complete these steps before continuing."
              dismissible={false}
              footer={<Button label="Done" variant="primary" onClick={close} />}
            >
              <p style={{ margin: 0 }}>
                The footer action is the only way to close this drawer.
              </p>
            </Drawer>
          </section>
        </main>
      </div>

    </>
  );
}
