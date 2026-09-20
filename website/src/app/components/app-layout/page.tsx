"use client";

import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AppLayout } from "@robr0/design-system/components/AppLayout/AppLayout";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const demoSections = [
  {
    category: "Main",
    items: [
      { key: "dashboard", icon: "dashboard", label: "Dashboard" },
      { key: "analytics", icon: "analytics", label: "Analytics" },
      { key: "projects", icon: "folder", label: "Projects" },
    ],
  },
  {
    category: "Design",
    items: [
      {
        key: "components",
        icon: "widgets",
        label: "Components",
        children: [
          { key: "buttons", label: "Buttons" },
          { key: "inputs", label: "Inputs" },
        ],
      },
      { key: "icons", icon: "emoji_symbols", label: "Icons" },
    ],
  },
  {
    items: [{ key: "settings", icon: "settings", label: "Settings" }],
  },
];

const demoProfile = {
  name: "robr0",
  email: "robr0@example.com",
};

function DemoContent({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h1 className={styles.demoHeading}>{heading}</h1>
      <p className={styles.demoBody}>{body}</p>
    </div>
  );
}

export default function AppLayoutPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>App layout</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-applayout--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Full-page template with a collapsible sidebar
            </p>
            <p className={styles.introBody}>
              A page shell that pairs the App sidebar with a centred content area. The sidebar
              collapses to an icon rail; the main region reflows automatically. The component
              pins itself to the dark theme by default, which is why the demos below appear
              dark; pass theme=&quot;inherit&quot; to drop the pin and let the layout follow the
              surrounding data-theme like any other component.
            </p>
          </div>

          {/* Expanded */}
          <section className={styles.section}>
            <SectionTitle title="Expanded sidebar" />
            <div className={styles.layoutDemo}>
              <AppLayout
                sections={demoSections}
                profile={demoProfile}
                activeKey="dashboard"
                logoText="robr0"
                defaultExpanded={true}
              >
                <DemoContent
                  heading="Dashboard"
                  body="Content is centred in the main area. Collapse the sidebar with the toggle to see the layout reflow."
                />
              </AppLayout>
            </div>
          </section>

          {/* Collapsed */}
          <section className={styles.section}>
            <SectionTitle title="Collapsed by default" />
            <div className={styles.layoutDemo}>
              <AppLayout
                sections={demoSections}
                profile={demoProfile}
                activeKey="analytics"
                logoText="robr0"
                defaultExpanded={false}
              >
                <DemoContent
                  heading="Analytics"
                  body="The sidebar starts as a 64px icon rail and expands on demand."
                />
              </AppLayout>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
