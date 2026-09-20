"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { PinInput } from "@robr0/design-system/components/PinInput/PinInput";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function PinInputPage() {
  const [completed, setCompleted] = React.useState("");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Pin input</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-pininput--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              One cell per character of a one-time code
            </p>
            <p className={styles.introBody}>
              Typing fills a cell and moves focus to the next one. Backspace clears and retreats, the arrow keys move between cells, and pasting a full code distributes it across the cells from the start. When every cell is filled, onComplete fires once with the whole code.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <PinInput
                  label="Verification code"
                  helperText={completed ? `Code entered: ${completed}` : "Enter the 6-digit code we sent you"}
                  onComplete={setCompleted}
                />
              </div>
            </div>
          </section>

          {/* Lengths */}
          <section className={styles.section}>
            <SectionTitle title="Length" />
            <p className={styles.introBody}>
              The length prop sets the cell count. Six is the default; four suits short PINs.
            </p>
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <PinInput label="Four digits" length={4} />
              </div>
              <div className={styles.variantItem}>
                <PinInput label="Six digits" />
              </div>
            </div>
          </section>

          {/* Masked */}
          <section className={styles.section}>
            <SectionTitle title="Masked" />
            <p className={styles.introBody}>
              With mask set, each cell renders as a password field, so entered characters stay hidden.
            </p>
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <PinInput label="PIN" length={4} mask defaultValue="1234" />
              </div>
            </div>
          </section>

          {/* Formats */}
          <section className={styles.section}>
            <SectionTitle title="Formats" />
            <p className={styles.introBody}>
              The numeric format rejects anything that is not a digit and raises the numeric keyboard on touch devices. The alphanumeric format accepts letters and digits, for invite and recovery codes.
            </p>
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <PinInput label="Numeric" defaultValue="42" />
              </div>
              <div className={styles.variantItem}>
                <PinInput label="Alphanumeric" format="alphanumeric" defaultValue="A7" />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantRow}>
              <div className={styles.variantItem}>
                <PinInput
                  label="Error"
                  error
                  defaultValue="135791"
                  helperText="That code has expired. Request a new one."
                />
              </div>
              <div className={styles.variantItem}>
                <PinInput label="Disabled" disabled defaultValue="80" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
