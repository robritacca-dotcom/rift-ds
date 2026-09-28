"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { TopAppBar } from "rift-ds/components/TopAppBar/TopAppBar";
import type { TopAppBarProps } from "rift-ds/components/TopAppBar/TopAppBar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const overflowActions: TopAppBarProps["overflowActions"] = [
  { key: "mark-read", icon: "done_all", label: "Mark all as read" },
  { key: "archive", icon: "archive", label: "Archive" },
  { key: "settings", icon: "settings", label: "Settings" },
];

type StageProps = Omit<TopAppBarProps, "scrollTarget" | "headingLevel"> & {
  caption: string;
};

/** A phone-sized stage that is itself the scroll container: the bar sticks to
    its top and watches its scroll, so scrolling the stage collapses a large
    title. The content cards scroll under it. */
function PhoneStage({ caption, ...barProps }: StageProps) {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  return (
    <figure className={styles.stageFigure}>
      <div ref={setScroller} className={styles.stage} tabIndex={0}>
        <TopAppBar scrollTarget={scroller} headingLevel={3} {...barProps} />
        <div className={styles.stageContent}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.tile}>
              <div className={styles.tileMedia} />
              <div className={styles.tileLine} />
              <div className={styles.tileLineShort} />
            </div>
          ))}
        </div>
      </div>
      <figcaption className={styles.stageCaption}>{caption}</figcaption>
    </figure>
  );
}

export default function TopAppBarPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Top app bar</h1>
            <PageLinks storybookPath="/?path=/docs/components-topappbar--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The header of a mobile screen</p>
            <p className={styles.introBody}>
              A leading menu, back or close button, the screen title with an optional subtitle, and up to three trailing icon actions, with any more listed behind a More button. The bar sticks to the top of its scroll container and watches the window’s scroll, or the element passed as scrollTarget, or takes a scrolled prop from the host, so it can switch to its scrolled surface as content passes under it.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Platforms" />
            <p className={styles.sectionBody}>
              The platform prop draws the same bar three ways. Default is the Rift bar, built from the system’s tokens. The ios variant matches the iOS 26 navigation bar, with a glass circle for the leading control and one glass capsule for the trailing actions; the android variant matches the Material 3 Expressive top app bar. The platform variants are for mocks and prototypes that should read as the real system chrome, and a shipped native app should use the native component. Scroll a stage to see each bar’s scrolled state.
            </p>
            <div className={styles.stageRow}>
              <PhoneStage
                caption="Default"
                title="Messages"
                navigation="back"
                actions={[{ key: "search", icon: "search", label: "Search" }]}
                overflowActions={overflowActions}
              />
              <PhoneStage
                caption="iOS"
                platform="ios"
                title="Messages"
                navigation="back"
                actions={[{ key: "search", icon: "search", label: "Search" }]}
                overflowActions={overflowActions}
              />
              <PhoneStage
                caption="Android"
                platform="android"
                title="Messages"
                navigation="back"
                actions={[{ key: "search", icon: "search", label: "Search" }]}
                overflowActions={overflowActions}
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Collapsing titles" />
            <p className={styles.sectionBody}>
              Medium and large sizes add an expanded title under the bar that folds away as content scrolls under it, while the bar’s own title fades in. Only one of the two copies is the heading at any moment. On iOS both sizes are the large title, which collapses to the centred inline title. Scroll inside each stage to collapse it, and back to the top to open it again. The iOS scroll edge blurs on the web rather than refracting: Apple’s lensing needs shader access to the content behind it, which no browser gives a stylesheet.
            </p>
            <div className={styles.stageRow}>
              <PhoneStage
                caption="Default, large with a subtitle"
                size="large"
                title="Inbox"
                subtitle="12 unread"
                navigation="menu"
                actions={[{ key: "search", icon: "search", label: "Search" }]}
              />
              <PhoneStage
                caption="iOS, large title"
                platform="ios"
                size="large"
                title="Library"
                actions={[{ key: "add", icon: "add", label: "Add" }]}
              />
              <PhoneStage
                caption="Android, medium"
                platform="android"
                size="medium"
                title="Photos"
                navigation="back"
                actions={[{ key: "share", icon: "share", label: "Share" }]}
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Actions and overflow" />
            <p className={styles.sectionBody}>
              The bar shows up to three trailing actions and lists the rest in a menu behind a More button. An action’s badge is a dot, announced to screen readers as new. The close control suits a screen that dismisses rather than going back, such as a compose sheet.
            </p>
            <div className={styles.stageRow}>
              <PhoneStage
                caption="Badge and overflow menu"
                platform="android"
                title="Home"
                navigation="menu"
                actions={[
                  { key: "notifications", icon: "notifications", label: "Notifications", badge: true },
                  { key: "search", icon: "search", label: "Search" },
                ]}
                overflowActions={overflowActions}
              />
              <PhoneStage
                caption="Close with a centred title"
                title="New message"
                navigation="close"
                align="center"
                actions={[{ key: "send", icon: "send", label: "Send" }]}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="top-app-bar" />
        </main>
      </div>
    </>
  );
}
