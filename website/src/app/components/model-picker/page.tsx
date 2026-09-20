"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ModelPicker } from "@robr0/design-system/components/ModelPicker/ModelPicker";
import { Composer } from "@robr0/design-system/components/Composer/Composer";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const models = [
  {
    label: "Fable 5",
    value: "fable-5",
    description: "Deepest reasoning for hard problems",
    badge: "New",
  },
  {
    label: "Opus 5",
    value: "opus-5",
    description: "Strong reasoning, faster output",
  },
  {
    label: "Sonnet 5",
    value: "sonnet-5",
    description: "Everyday balance of speed and skill",
  },
  {
    label: "Haiku 4.5",
    value: "haiku-4-5",
    description: "Fastest for light work",
  },
];

export default function ModelPickerPage() {
  const [model, setModel] = React.useState("sonnet-5");
  const [effort, setEffort] = React.useState("medium");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Model picker</h1>
            <PageLinks storybookPath="/?path=/docs/components-modelpicker--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The model behind the conversation, chosen in place
            </p>
            <p className={styles.introBody}>
              A quiet pill trigger shows the current model. The panel lists
              every model with a one line description, and an optional effort
              row trades speed for depth. Built for the Composer&apos;s
              actions slot, but it stands anywhere.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Trigger and panel" />
            <p className={styles.demoText}>
              The trigger reads as chrome, not as a call to action, so the
              send button keeps the only teal in a composer. Open it to see
              the model list, with the selected model checked.
            </p>
            <div className={styles.demoRow}>
              <ModelPicker
                models={models}
                value={model}
                onValueChange={setModel}
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Effort" />
            <p className={styles.demoText}>
              Provide an effort value and a Low, Medium, High row appears
              below the models. Both selections follow the same controlled or
              uncontrolled convention as every other input in the system.
            </p>
            <div className={styles.demoRow}>
              <ModelPicker
                models={models}
                value={model}
                onValueChange={setModel}
                effort={effort}
                onEffortChange={setEffort}
              />
              <span className={styles.demoReadout}>
                {models.find((m) => m.value === model)?.label}, {effort} effort
              </span>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="In the Composer" />
            <p className={styles.demoText}>
              The Composer&apos;s actions slot was reserved for exactly this.
              With the composer pinned to the bottom of a chat, set placement
              to top so the panel opens upward.
            </p>
            <div className={styles.demoColumn}>
              <Composer
                placeholder="Ask anything"
                actions={
                  <ModelPicker
                    models={models}
                    value={model}
                    onValueChange={setModel}
                    effort={effort}
                    onEffortChange={setEffort}
                    placement="top"
                  />
                }
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Unavailable models" />
            <p className={styles.demoText}>
              A disabled model stays visible in the list, so the lineup reads
              the same for everyone, but it cannot be chosen.
            </p>
            <div className={styles.demoRow}>
              <ModelPicker
                models={[
                  ...models.slice(0, 3),
                  {
                    label: "Haiku 4.5",
                    value: "haiku-4-5",
                    description: "Fastest for light work",
                    disabled: true,
                  },
                ]}
                defaultValue="sonnet-5"
              />
              <ModelPicker models={models} defaultValue="sonnet-5" disabled />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
