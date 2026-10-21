"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* `state` draws a static hover or active look for the docs; disabled is the
   real `disabled` prop, and the resting look takes neither. */
const states: { label: string; value: string; state?: "hover" | "active"; disabled?: boolean }[] = [
  { label: "Default", value: "default" },
  { label: "Hover", value: "hover", state: "hover" },
  { label: "Active", value: "active", state: "active" },
  { label: "Disabled", value: "disabled", disabled: true },
];

const icons = ["add", "close", "edit", "delete"];

export default function CircularButtonPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Circular button</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-circularbutton--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              An icon-only button in a circular shape
            </p>
            <p className={styles.introBody}>
              For actions where a label is not needed, like close, menu, or navigation arrows. Uses the same two props as Button: <code>variant</code> for the emphasis (primary, secondary, tertiary) and <code>tone</code> for the colour (default, neutral or destructive). Good for toolbars and compact UI where space is tight.
            </p>
          </div>

          {/* Primary states (Solid) */}
          <section className={styles.section}>
            <SectionTitle title="Primary" />
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              {states.map((s) => (
                <span key={s.value} className={styles.gridColHeader}>{s.label}</span>
              ))}
              {icons.map((icon) => (
                <React.Fragment key={icon}>
                  <span className={styles.gridRowHeader}>{icon}</span>
                  {states.map((s) => (
                    <div key={s.value} className={styles.gridCell}>
                      <CircularButton icon={icon} variant="primary" state={s.state} disabled={s.disabled} ariaLabel={icon} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Secondary states (Outlined) */}
          <section className={styles.section}>
            <SectionTitle title="Secondary" />
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              {states.map((s) => (
                <span key={s.value} className={styles.gridColHeader}>{s.label}</span>
              ))}
              {icons.map((icon) => (
                <React.Fragment key={icon}>
                  <span className={styles.gridRowHeader}>{icon}</span>
                  {states.map((s) => (
                    <div key={s.value} className={styles.gridCell}>
                      <CircularButton icon={icon} variant="secondary" state={s.state} disabled={s.disabled} ariaLabel={icon} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Tertiary states (Ghost / Passive) */}
          <section className={styles.section}>
            <SectionTitle title="Tertiary" />
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              {states.map((s) => (
                <span key={s.value} className={styles.gridColHeader}>{s.label}</span>
              ))}
              {icons.map((icon) => (
                <React.Fragment key={icon}>
                  <span className={styles.gridRowHeader}>{icon}</span>
                  {states.map((s) => (
                    <div key={s.value} className={styles.gridCell}>
                      <CircularButton icon={icon} variant="tertiary" state={s.state} disabled={s.disabled} ariaLabel={icon} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Neutral tone, primary emphasis (Solid Grey) */}
          <section className={styles.section}>
            <SectionTitle title="Primary, neutral" />
            <p className={styles.introBody}>
              A solid grey fill that stays visible at rest, unlike the
              transparent tertiary. For toolbar actions that deserve a
              button&apos;s full shape without the accent colour.
            </p>
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              {states.map((s) => (
                <span key={s.value} className={styles.gridColHeader}>{s.label}</span>
              ))}
              {icons.map((icon) => (
                <React.Fragment key={icon}>
                  <span className={styles.gridRowHeader}>{icon}</span>
                  {states.map((s) => (
                    <div key={s.value} className={styles.gridCell}>
                      <CircularButton icon={icon} variant="primary" tone="neutral" state={s.state} disabled={s.disabled} ariaLabel={icon} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Neutral tone, secondary emphasis (Outlined Grey) */}
          <section className={styles.section}>
            <SectionTitle title="Secondary, neutral" />
            <p className={styles.introBody}>
              The outlined shape with a grey edge in place of the accent.
              Hover and press fill it with the neutral greys.
            </p>
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              {states.map((s) => (
                <span key={s.value} className={styles.gridColHeader}>{s.label}</span>
              ))}
              {icons.map((icon) => (
                <React.Fragment key={icon}>
                  <span className={styles.gridRowHeader}>{icon}</span>
                  {states.map((s) => (
                    <div key={s.value} className={styles.gridCell}>
                      <CircularButton icon={icon} variant="secondary" tone="neutral" state={s.state} disabled={s.disabled} ariaLabel={icon} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Destructive tone, primary emphasis (Solid Danger) */}
          <section className={styles.section}>
            <SectionTitle title="Primary, destructive" />
            <p className={styles.introBody}>
              The filled circle in the danger colour, for the one
              irreversible action a surface leads with.
            </p>
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              {states.map((s) => (
                <span key={s.value} className={styles.gridColHeader}>{s.label}</span>
              ))}
              {icons.map((icon) => (
                <React.Fragment key={icon}>
                  <span className={styles.gridRowHeader}>{icon}</span>
                  {states.map((s) => (
                    <div key={s.value} className={styles.gridCell}>
                      <CircularButton icon={icon} variant="primary" tone="destructive" state={s.state} disabled={s.disabled} ariaLabel={icon} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Destructive tone (Outlined Danger) */}
          <section className={styles.section}>
            <SectionTitle title="Secondary, destructive" />
            <p className={styles.introBody}>
              For dangerous or irreversible actions like delete. The outline
              and icon take the danger colour, and hover and press fill with it.
            </p>
            <div className={styles.stateGrid}>
              <div className={styles.gridCorner} />
              {states.map((s) => (
                <span key={s.value} className={styles.gridColHeader}>{s.label}</span>
              ))}
              {icons.map((icon) => (
                <React.Fragment key={icon}>
                  <span className={styles.gridRowHeader}>{icon}</span>
                  {states.map((s) => (
                    <div key={s.value} className={styles.gridCell}>
                      <CircularButton icon={icon} variant="secondary" tone="destructive" state={s.state} disabled={s.disabled} ariaLabel={icon} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Tooltip */}
          <section className={styles.section}>
            <SectionTitle title="Tooltip" />
            <p className={styles.introBody}>
              An icon-only control names itself: every circular button shows a
              tooltip with its accessible label on hover and focus. Pass{" "}
              <code>tooltip</code> a string for different wording,{" "}
              <code>false</code> to opt out when the host labels the control
              another way, and <code>tooltipPosition</code> to pick the side
              when an edge would clip the default placement above.
            </p>
            <div className={styles.variantRow}>
              <CircularButton icon="download" variant="secondary" ariaLabel="Download" tooltip="Download the report" />
              <CircularButton icon="settings" variant="tertiary" ariaLabel="Settings" tooltipPosition="bottom" />
              <CircularButton icon="close" variant="tertiary" ariaLabel="Close" tooltip={false} />
            </div>
          </section>

          {/* Loading */}
          <section className={styles.section}>
            <SectionTitle title="Loading" />
            <p className={styles.introBody}>
              Set <code>loading</code> while an async action runs. The spinner
              replaces the icon in the variant’s own colour and interaction
              is blocked, without the dimmed disabled look.
            </p>
            <div className={styles.variantRow}>
              <CircularButton icon="add" variant="primary" loading ariaLabel="Saving" />
              <CircularButton icon="edit" variant="secondary" loading ariaLabel="Saving" />
              <CircularButton icon="refresh" variant="tertiary" loading ariaLabel="Refreshing" />
              <CircularButton icon="tune" variant="primary" tone="neutral" loading ariaLabel="Applying filters" />
              <CircularButton icon="add" variant="primary" size="compact" loading ariaLabel="Saving" />
              <CircularButton icon="edit" variant="secondary" size="compact" loading ariaLabel="Saving" />
              <CircularButton icon="refresh" variant="tertiary" size="compact" loading ariaLabel="Refreshing" />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.variantRow}>
              <CircularButton icon="add" variant="primary" size="compact" ariaLabel="Add" />
              <CircularButton icon="delete" variant="primary" size="compact" ariaLabel="Delete" />
              <CircularButton icon="add" variant="secondary" size="compact" ariaLabel="Add" />
              <CircularButton icon="close" variant="secondary" size="compact" ariaLabel="Close" />
              <CircularButton icon="edit" variant="tertiary" size="compact" ariaLabel="Edit" />
              <CircularButton icon="more_vert" variant="tertiary" size="compact" ariaLabel="More" />
              <CircularButton icon="search" variant="tertiary" size="compact" ariaLabel="Search" />
              <CircularButton icon="settings" variant="tertiary" size="compact" ariaLabel="Settings" />
              <CircularButton icon="tune" variant="primary" tone="neutral" size="compact" ariaLabel="Filters" />
              <CircularButton icon="sort" variant="primary" tone="neutral" size="compact" ariaLabel="Sort" />
              <CircularButton icon="filter_list" variant="secondary" tone="neutral" size="compact" ariaLabel="Filter" />
            </div>
          </section>

          <ComponentInstallStrip slug="circular-button" />
        </main>
      </div>

    </>
  );
}
