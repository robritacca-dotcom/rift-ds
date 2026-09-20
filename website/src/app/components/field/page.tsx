"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Field } from "@robr0/design-system/components/Field/Field";
import { Input } from "@robr0/design-system/components/Input/Input";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function FieldPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Field</h1>
            <PageLinks storybookPath="/?path=/docs/components-field--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              One place that makes a form control announceable
            </p>
            <p className={styles.introBody}>
              Field owns the scaffolding every labelled form control shares: the
              label and its <code>htmlFor</code>, the required marker, the
              helper or error message, the ids that tie them together, and the{" "}
              <code>aria-describedby</code> and <code>aria-invalid</code>{" "}
              wiring. Controls compose inside it and read that wiring through{" "}
              <code>useField()</code>, so accessibility is correct systemically
              rather than one component at a time. Input, Textarea, DateInput,
              Dropdown, Combobox and FileInput all build on it.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoBox}>
              <Field
                label="Email address"
                helperText="We will only use this to contact you."
              >
                <Input placeholder="you@example.com" />
              </Field>
            </div>
            <p className={styles.demoText}>
              The label is associated with the control through a generated id,
              and the helper text is linked by <code>aria-describedby</code> so
              a screen reader announces it as part of the field.
            </p>
          </section>

          {/* Required */}
          <section className={styles.section}>
            <SectionTitle title="Required" />
            <div className={styles.demoBox}>
              <Field
                label="Full name"
                required
                helperText="As it appears on your ID."
              >
                <Input placeholder="Jane Doe" />
              </Field>
            </div>
            <p className={styles.demoText}>
              The asterisk is marked <code>aria-hidden</code>: it is a visual
              cue only. The control carries the real <code>required</code>{" "}
              attribute, which is what assistive technology announces.
            </p>
          </section>

          {/* Error */}
          <section className={styles.section}>
            <SectionTitle title="Error" />
            <div className={styles.demoBox}>
              <Field
                label="Email address"
                error
                helperText="That address is not valid."
              >
                <Input placeholder="you@example.com" error />
              </Field>
            </div>
            <p className={styles.demoText}>
              Error recolours the helper text to the error border colour and
              marks the control invalid. Because the message is already the
              described-by target, the reason for the error is announced with
              the field rather than being visual-only.
            </p>
          </section>

          {/* Disabled */}
          <section className={styles.section}>
            <SectionTitle title="Disabled" />
            <div className={styles.demoBox}>
              <Field
                label="Account ID"
                disabled
                helperText="Assigned automatically."
              >
                <Input placeholder="—" disabled />
              </Field>
            </div>
            <p className={styles.demoText}>
              Disabled dims the label to the disabled input text colour. The
              control is disabled independently: Field styles the scaffolding,
              it does not disable its children for you.
            </p>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.demoBox}>
              <Field
                label="Search term"
                size="compact"
                helperText="Matches titles and descriptions."
              >
                <Input placeholder="Search" size="compact" />
              </Field>
            </div>
            <p className={styles.demoText}>
              Compact drops the label to the small paragraph size. Pass the same
              size to the control so the two stay in step.
            </p>
          </section>

          {/* Composing */}
          <section className={styles.section}>
            <SectionTitle title="Composing your own control" />
            <p className={styles.demoText}>
              A custom control reads the wiring instead of deriving it.{" "}
              <code>useField()</code> returns <code>null</code> outside a Field,
              so the same control still renders standalone.
            </p>
            <CodeBlock
              language="tsx"
              code={`const field = useField();

<input
  id={field?.controlId}
  aria-describedby={field?.describedBy}
  aria-invalid={field?.invalid}
  required={field?.required}
  disabled={field?.disabled}
/>`}
            />
          </section>

        </main>
      </div>
    </>
  );
}
