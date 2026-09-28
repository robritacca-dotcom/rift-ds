"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { BottomNav } from "rift-ds/components/BottomNav/BottomNav";
import type { BottomNavProps } from "rift-ds/components/BottomNav/BottomNav";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const items: BottomNavProps["items"] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "explore", label: "Explore", icon: "explore" },
  { key: "messages", label: "Messages", icon: "chat_bubble", badge: 3 },
  { key: "activity", label: "Activity", icon: "favorite", badge: true },
  { key: "profile", label: "Profile", icon: "account_circle" },
];

const fourItems = items.slice(0, 4);

type StageProps = {
  caption: string;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  children: React.ReactNode;
};

/** A phone-sized stage with plain content cards scrolling under the bar. */
function PhoneStage({ caption, onScroll, children }: StageProps) {
  return (
    <figure className={styles.stageFigure}>
      <div className={styles.stage}>
        <div className={styles.stageScroll} onScroll={onScroll} tabIndex={0}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={styles.tile}>
              <div className={styles.tileMedia} />
              <div className={styles.tileLine} />
              <div className={styles.tileLineShort} />
            </div>
          ))}
        </div>
        <div className={styles.stageBar}>{children}</div>
      </div>
      <figcaption className={styles.stageCaption}>{caption}</figcaption>
    </figure>
  );
}

/** BottomNav with its selection wired, so the demos respond to presses. */
function InteractiveNav(props: BottomNavProps) {
  const [active, setActive] = useState(props.activeKey);
  return <BottomNav {...props} activeKey={active} onValueChange={setActive} />;
}

/** The iOS bar minimising while the stage scrolls down and returning when it
    scrolls back up, the way the system bar behaves. */
function MinimizingDemo() {
  const [minimized, setMinimized] = useState(false);
  const [lastTop, setLastTop] = useState(0);
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const top = event.currentTarget.scrollTop;
    if (top < 24) setMinimized(false);
    else if (top > lastTop + 4) setMinimized(true);
    else if (top < lastTop - 4) setMinimized(false);
    setLastTop(top);
  };
  return (
    <PhoneStage caption="Scroll down to minimise, up to restore" onScroll={handleScroll}>
      <InteractiveNav
        platform="ios"
        items={fourItems}
        activeKey="explore"
        search={{ label: "Search" }}
        minimized={minimized}
        aria-label="Minimising demo"
      />
    </PhoneStage>
  );
}

export default function BottomNavPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Bottom nav</h1>
            <PageLinks storybookPath="/?path=/docs/components-bottomnav--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The tab bar of a mobile app</p>
            <p className={styles.introBody}>
              Three to five top-level destinations along the bottom of the screen, each an icon over a label, with the selected icon drawn filled. Pressing a destination reports its key through onValueChange, and the host marks the current page with activeKey; a destination with an href renders as a real link. Inside these demos the bar sits in its stage; in an app, the fixed prop pins it to the bottom of the viewport above the home-indicator area.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Platforms" />
            <p className={styles.sectionBody}>
              The platform prop draws the same markup three ways. Default is the Rift bar, built entirely from the system’s tokens. The ios and android variants are close matches for the iOS 26 Liquid Glass tab bar and the Material 3 Expressive navigation bar, for mocks and prototypes that should read as the real system chrome. A shipped native app should use the native component instead. Every bar here is live: press a destination to move the selection.
            </p>
            <div className={styles.stageRow}>
              <PhoneStage caption="Default">
                <InteractiveNav items={items} activeKey="home" aria-label="Default demo" />
              </PhoneStage>
              <PhoneStage caption="iOS">
                <InteractiveNav platform="ios" items={fourItems} activeKey="home" aria-label="iOS demo" />
              </PhoneStage>
              <PhoneStage caption="Android">
                <InteractiveNav platform="android" items={items} activeKey="home" aria-label="Android demo" />
              </PhoneStage>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="iOS search and minimising" />
            <p className={styles.sectionBody}>
              On iOS a search destination gets its own glass circle beside the capsule; on the other platforms it joins the bar as the last tab. The minimized prop folds the capsule down to the selected destination alone, which is what the system bar does while a page scrolls down. The component leaves the scroll logic to the host, so the second demo sets the prop from the stage’s scroll direction. The glass on the web is frosted rather than refracted: Apple’s lensing needs shader access to the content behind it, which no browser gives a stylesheet.
            </p>
            <div className={styles.stageRow}>
              <PhoneStage caption="Search as its own circle">
                <InteractiveNav
                  platform="ios"
                  items={fourItems}
                  activeKey="home"
                  search={{ label: "Search" }}
                  aria-label="iOS search demo"
                />
              </PhoneStage>
              <MinimizingDemo />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Badges" />
            <p className={styles.sectionBody}>
              A badge is a count on the icon’s top corner, or a plain dot when set to true. Screen readers hear the count as part of the destination’s name. The smallest set a tab bar should carry is three destinations, shown here with a search tab joining the bar.
            </p>
            <div className={styles.stageRow}>
              <PhoneStage caption="Count and dot badges">
                <InteractiveNav items={items} activeKey="messages" aria-label="Badges demo" />
              </PhoneStage>
              <PhoneStage caption="Three destinations with search">
                <InteractiveNav
                  platform="android"
                  items={items.slice(0, 3)}
                  activeKey="home"
                  search={{ label: "Search" }}
                  aria-label="Three destinations demo"
                />
              </PhoneStage>
            </div>
          </section>

          <ComponentInstallStrip slug="bottom-nav" />
        </main>
      </div>
    </>
  );
}
