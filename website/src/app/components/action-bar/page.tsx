"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { ActionBar } from "rift-ds/components/ActionBar/ActionBar";
import { Button } from "rift-ds/components/Button/Button";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

/* A class register: long enough to scroll under the bar. */
const STUDENTS = [
  "Amara Okafor", "Ben Hughes", "Chen Wei", "Dara Byrne", "Elif Demir", "Finn Larsen",
  "Grace Mensah", "Hiro Tanaka", "Isla Murray", "Jonah Weiss", "Kavya Rao", "Leo Moreau",
  "Maya Cohen", "Nico Rossi", "Omar Haddad", "Priya Shah", "Quinn Doyle", "Rosa Lima",
];

function Register({ blur, sticky = true }: { blur: boolean; sticky?: boolean }) {
  const [marked, setMarked] = useState<string[]>(["Amara Okafor", "Ben Hughes"]);
  const left = STUDENTS.length - marked.length;
  return (
    <div className={styles.surface}>
      <ul className={styles.rows}>
        {STUDENTS.map((name) => (
          <li key={name} className={styles.row}>
            <Checkbox
              label={name}
              checked={marked.includes(name)}
              onCheckedChange={(checked) =>
                setMarked((m) => (checked ? [...m, name] : m.filter((n) => n !== name)))
              }
            />
          </li>
        ))}
      </ul>
      <ActionBar
        blur={blur}
        sticky={sticky}
        summary={left === 0 ? "Every student marked" : `${left} students still to mark`}
        actions={
          <>
            <Button label="Save draft" variant="secondary" />
            <Button label="Submit to office" variant="primary" disabled={left > 0} />
          </>
        }
      />
    </div>
  );
}

/* ============================================
   PAGE
   ============================================ */

export default function ActionBarPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Action bar</h1>
        <PageLinks storybookPath="/?path=/docs/components-actionbar--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>The way out of a long list</p>
        <p className={styles.introBody}>
          A class register, a long form, a queue of claims: the button that finishes the work belongs
          where the reader is, not at the end of the scroll. The action bar holds a summary line and the primary
          actions at the bottom of the scroll container. The rows dissolve into it under a progressive blur instead of
          stopping at a hard edge.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Docked with a blur" />
        <p className={styles.introBody}>
          By default the bar sticks to the bottom of its scroll container, with the blur reaching a little above it.
          Mark a student and the count changes. The summary is a polite live region, so a screen reader hears the new
          line once it settles.
        </p>
        <Register blur />
      </section>

      <section className={styles.section}>
        <SectionTitle title="Solid" />
        <p className={styles.introBody}>
          <code>blur={"{false}"}</code> draws the bar on the page surface with a hairline above it. Point{" "}
          <code>--ds-action-bar-surface</code> at another fill when the list sits on a container.
        </p>
        <Register blur={false} />
      </section>

      <section className={styles.section}>
        <SectionTitle title="In flow" />
        <p className={styles.introBody}>
          <code>sticky={"{false}"}</code> leaves the bar after the last row, where it scrolls with the list. Use it
          when the list is short enough that its end is always in view.
        </p>
        <Register blur sticky={false} />
      </section>

      <ComponentInstallStrip slug="action-bar" />
    </div>
  );
}
