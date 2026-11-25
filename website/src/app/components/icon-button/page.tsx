"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { IconButton } from "rift-ds/components/IconButton/IconButton";
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

export default function IconButtonPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Icon button</h1>
        <PageLinks
          storybookPath="/?path=/docs/components-iconbutton--docs"
        />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>
          An icon-only button in the theme’s button shape
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
                  <IconButton icon={icon} variant="primary" state={s.state} disabled={s.disabled} label={icon} />
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
                  <IconButton icon={icon} variant="secondary" state={s.state} disabled={s.disabled} label={icon} />
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
                  <IconButton icon={icon} variant="tertiary" state={s.state} disabled={s.disabled} label={icon} />
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
          transparent tertiary, with a button&apos;s full shape and no
          accent colour.
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
                  <IconButton icon={icon} variant="primary" tone="neutral" state={s.state} disabled={s.disabled} label={icon} />
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
          The outlined shape with a grey edge in place of the accent, for
          utility controls such as toolbar actions and a notification
          bell. Hover and press fill it with the neutral greys.
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
                  <IconButton icon={icon} variant="secondary" tone="neutral" state={s.state} disabled={s.disabled} label={icon} />
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
          The filled button in the danger colour, for the one
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
                  <IconButton icon={icon} variant="primary" tone="destructive" state={s.state} disabled={s.disabled} label={icon} />
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
                  <IconButton icon={icon} variant="secondary" tone="destructive" state={s.state} disabled={s.disabled} label={icon} />
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
          An icon-only control names itself: every icon button shows a
          tooltip with its accessible label on hover and focus. Pass{" "}
          <code>tooltip</code> a string for different wording,{" "}
          <code>false</code> to opt out when the host labels the control
          another way, and <code>tooltipPosition</code> to pick the side
          when an edge would clip the default placement above.
        </p>
        <div className={styles.variantRow}>
          <IconButton icon="download" variant="secondary" label="Download" tooltip="Download the report" />
          <IconButton icon="settings" variant="tertiary" label="Settings" tooltipPosition="bottom" />
          <IconButton icon="close" variant="tertiary" label="Close" tooltip={false} />
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
          <IconButton icon="add" variant="primary" loading label="Saving" />
          <IconButton icon="edit" variant="secondary" loading label="Saving" />
          <IconButton icon="refresh" variant="tertiary" loading label="Refreshing" />
          <IconButton icon="tune" variant="primary" tone="neutral" loading label="Applying filters" />
          <IconButton icon="add" variant="primary" size="compact" loading label="Saving" />
          <IconButton icon="edit" variant="secondary" size="compact" loading label="Saving" />
          <IconButton icon="refresh" variant="tertiary" size="compact" loading label="Refreshing" />
        </div>
      </section>

      {/* Glass: every cell over a busy ground */}
      <section className={styles.section}>
        <SectionTitle title="Glass" />
        <p className={styles.introBody}>
          Set <code>glass</code> when the button sits on a busy ground,
          such as a map, a chart or a shader scene, as a notification bell
          in a template’s top bar does. It is Button’s{" "}
          <code>glass</code> on the icon-only form: the ground behind it is
          blurred, an outlined or ghost button takes the glass fill at rest,
          and a filled one lets a little of the ground through its colour.
          Hover and press are each variant’s own.
        </p>
        <div className={styles.glassGround}>
          <IconButton icon="add" variant="primary" glass label="Add" />
          <IconButton icon="edit" variant="secondary" glass label="Edit" />
          <IconButton icon="more_vert" variant="tertiary" glass label="More" />
          <IconButton icon="tune" variant="primary" tone="neutral" glass label="Filters" />
          <IconButton icon="notifications" variant="secondary" tone="neutral" glass label="Notifications" />
          <IconButton icon="delete" variant="secondary" tone="destructive" glass label="Delete" />
        </div>
      </section>

      {/* Compact */}
      <section className={styles.section}>
        <SectionTitle title="Compact" />
        <div className={styles.variantRow}>
          <IconButton icon="add" variant="primary" size="compact" label="Add" />
          <IconButton icon="delete" variant="primary" size="compact" label="Delete" />
          <IconButton icon="add" variant="secondary" size="compact" label="Add" />
          <IconButton icon="close" variant="secondary" size="compact" label="Close" />
          <IconButton icon="edit" variant="tertiary" size="compact" label="Edit" />
          <IconButton icon="more_vert" variant="tertiary" size="compact" label="More" />
          <IconButton icon="search" variant="tertiary" size="compact" label="Search" />
          <IconButton icon="settings" variant="tertiary" size="compact" label="Settings" />
          <IconButton icon="tune" variant="primary" tone="neutral" size="compact" label="Filters" />
          <IconButton icon="sort" variant="primary" tone="neutral" size="compact" label="Sort" />
          <IconButton icon="filter_list" variant="secondary" tone="neutral" size="compact" label="Filter" />
        </div>
      </section>

      <ComponentInstallStrip slug="icon-button" />
    </div>
  );
}
