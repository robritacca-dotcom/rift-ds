import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { FormSection } from "rift-ds/components/FormSection/FormSection";
import { Input } from "rift-ds/components/Input/Input";
import { Button } from "rift-ds/components/Button/Button";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function FormSectionPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Form section</h1>
        <PageLinks storybookPath="/?path=/docs/components-formsection--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>One part of a form, with its own save</p>
        <p className={styles.introBody}>
          Form section gives a part of a form its heading and a sentence on what it is for, lays its fields in a grid that folds by the room it has, and ends with its own actions. Set the heading beside the fields and stack a few of them, each under a rule, and you have a settings page.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Two columns of fields" />
        <div className={styles.demoSurface}>
          <FormSection
            title="Profile"
            description="How you appear to the people you work with."
            columns={2}
            actions={<><Button label="Cancel" variant="tertiary" /><Button label="Save" /></>}
          >
            <Input label="First name" defaultValue="Ada" />
            <Input label="Last name" defaultValue="Lovelace" />
          </FormSection>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Settings layout" />
        <div className={styles.demoSurface}>
          <FormSection
            layout="aside"
            title="Notifications"
            description="What we email you about."
            actions={<Button label="Save" />}
          >
            <ToggleSwitch label="A weekly summary" defaultChecked />
            <ToggleSwitch label="When someone mentions you" defaultChecked />
          </FormSection>
        </div>
      </section>

      <ComponentInstallStrip slug="form-section" />
    </div>
  );
}
