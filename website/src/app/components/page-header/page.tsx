import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { PageHeader } from "rift-ds/components/PageHeader/PageHeader";
import { Button } from "rift-ds/components/Button/Button";
import Link from "next/link";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function PageHeaderPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Page header</h1>
            <PageLinks storybookPath="/?path=/docs/components-pageheader--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Where you are, what this is, what you can do</p>
            <p className={styles.introBody}>
              Page header puts the breadcrumb, the page’s title and a sentence on what it is for at the top of a page, with the page’s own actions at the end of the title row. When the header is narrow the actions take the row under the text and share it, so a phone gets full-width buttons without a media query.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.demoSurface}>
              <PageHeader
                level={2}
                title="Projects"
                description="Everything your team is working on, with who owns it and when it is due."
                breadcrumb={[{ label: "Workspace", href: "/components" }, { label: "Projects" }]}
                linkComponent={Link}
                actions={
                  <>
                    <Button label="Export" variant="secondary" />
                    <Button label="New project" iconLeft="add" />
                  </>
                }
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Narrow" />
            <div className={styles.demoSurface}>
              <div className={styles.narrow}>
                <PageHeader
                  level={2}
                  title="Members"
                  description="People with access to this project."
                  actions={
                    <>
                      <Button label="Export" variant="secondary" />
                      <Button label="Invite" iconLeft="person_add" />
                    </>
                  }
                />
              </div>
            </div>
          </section>

          <ComponentInstallStrip slug="page-header" />
        </main>
      </div>
    </>
  );
}
