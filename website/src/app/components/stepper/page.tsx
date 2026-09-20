"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Stepper } from "@robr0/design-system/components/Stepper/Stepper";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/* ============================================
   DEMO DATA
   ============================================ */

const checkoutSteps = [
  { label: "Account" },
  { label: "Delivery" },
  { label: "Payment" },
  { label: "Review" },
];

const describedSteps = [
  { label: "Account", description: "Sign in or continue as a guest" },
  { label: "Delivery", description: "Address and shipping speed" },
  { label: "Payment", description: "Card or saved method" },
  { label: "Review", description: "Confirm and place the order" },
];

/* ============================================
   INTERACTIVE WIZARD DEMO
   ============================================ */

function WizardDemo() {
  const [active, setActive] = React.useState(1);
  const lastStep = checkoutSteps.length - 1;

  return (
    <div className={styles.wizardDemo}>
      <Stepper
        steps={checkoutSteps}
        activeStep={active}
        onStepClick={setActive}
      />
      <div className={styles.wizardControls}>
        <Button
          label="Back"
          variant="secondary"
          size="compact"
          disabled={active === 0}
          onClick={() => setActive((step) => Math.max(step - 1, 0))}
        />
        <Button
          label={active === lastStep ? "Finish" : "Continue"}
          variant="primary"
          size="compact"
          onClick={() => setActive((step) => Math.min(step + 1, lastStep + 1))}
        />
      </div>
    </div>
  );
}

export default function StepperPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Stepper</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-stepper--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Show where a multi-stage flow stands
            </p>
            <p className={styles.introBody}>
              An ordered list of steps for wizards and other staged flows.
              Steps before the active one render complete with a check, the
              active step takes the primary action fill and aria-current, and
              later steps stay muted until the flow reaches them. Pass an
              onStepClick handler and completed steps become buttons, so a
              reader can revisit an earlier stage without losing their place.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoStack}>
              <div className={styles.demo}>
                <Stepper steps={checkoutSteps} activeStep={1} />
              </div>
            </div>
          </section>

          {/* With descriptions */}
          <section className={styles.section}>
            <SectionTitle title="With descriptions" />
            <div className={styles.demoStack}>
              <div className={styles.demoWide}>
                <Stepper steps={describedSteps} activeStep={1} />
              </div>
            </div>
          </section>

          {/* Vertical */}
          <section className={styles.section}>
            <SectionTitle title="Vertical" />
            <div className={styles.demoStack}>
              <div className={styles.demoNarrow}>
                <Stepper
                  steps={describedSteps}
                  activeStep={2}
                  orientation="vertical"
                />
              </div>
            </div>
          </section>

          {/* Progress states */}
          <section className={styles.section}>
            <SectionTitle title="Progress states" />
            <div className={styles.demoStack}>
              <div className={styles.demo}>
                <Stepper steps={checkoutSteps} activeStep={0} />
              </div>
              <div className={styles.demo}>
                <Stepper steps={checkoutSteps} activeStep={checkoutSteps.length} />
              </div>
            </div>
          </section>

          {/* Clickable */}
          <section className={styles.section}>
            <SectionTitle title="In a wizard" />
            <WizardDemo />
          </section>
        </main>
      </div>

    </>
  );
}
