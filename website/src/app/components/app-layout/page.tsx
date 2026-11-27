"use client";

import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { AppLayout } from "rift-ds/components/AppLayout/AppLayout";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { AppToolbar } from "rift-ds/components/AppToolbar/AppToolbar";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import { openSitePalette } from "@/components/SitePalette/palette-bus";
import { useDemoNotifications } from "@/components/AppToolbarDemo/useDemoNotifications";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


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
    category: "Account",
    items: [{ key: "settings", icon: "settings", label: "Settings" }],
  },
];

const demoProfile = {
  name: "Avery",
  email: "avery@example.com",
};

function DemoContent({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h2 className={styles.demoHeading}>{heading}</h2>
      <p className={styles.demoBody}>{body}</p>
    </div>
  );
}

export default function AppLayoutPage() {
  const notifications = useDemoNotifications();
  return (
    <div className={styles.dsContent}>
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
          A page shell that pairs the App sidebar with a content area. The sidebar
          collapses to a labelled rail; the main region reflows automatically. The layout prop
          picks one of the three app shell modes the templates and the chat share: inset
          (the default), the content in a raised surface of its own; flush, the rail on the
          shell colour behind a hairline with the content crisp beside it; or floating, the
          rail as a glass card. The component
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
            logoText="Northlight"
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
            logoText="Northlight"
            defaultExpanded={false}
          >
            <DemoContent
              heading="Analytics"
              body="The sidebar starts as an 80px rail, each destination named under its icon, and expands on demand."
            />
          </AppLayout>
        </div>
      </section>

      {/* Floating */}
      <section className={styles.section}>
        <SectionTitle title="Floating layout" />
        <div className={styles.layoutDemo}>
          <AppLayout
            sections={demoSections}
            profile={demoProfile}
            activeKey="dashboard"
            logoText="Northlight"
            layout="floating"
          >
            <DemoContent
              heading="Dashboard"
              body="The rail floats off the edges as a glass card, and the content stays centred beside it."
            />
          </AppLayout>
        </div>
      </section>

      {/* Flush */}
      <section className={styles.section}>
        <SectionTitle title="Flush layout" />
        <div className={styles.layoutDemo}>
          <AppLayout
            sections={demoSections}
            profile={demoProfile}
            activeKey="dashboard"
            logoText="Northlight"
            layout="flush"
          >
            <DemoContent
              heading="Dashboard"
              body="The rail runs edge to edge on the shell colour behind a hairline, and the content sits crisp beside it, nothing raised."
            />
          </AppLayout>
        </div>
      </section>

      {/* Toolbar */}
      <section className={styles.section}>
        <SectionTitle title="Toolbar" />
        <p className={styles.introBody}>
          The toolbar slot seats a bar at the top of the content column, at
          the width the content runs, and holds it there while the page
          scrolls, on the content&apos;s own surface in every layout. Put an
          AppToolbar in it for the usual search, icon controls and AI chat, or any
          row of your own. Scroll the demo to see the bar hold its place.
        </p>
        <div className={styles.layoutDemo}>
          <AppLayout
            sections={demoSections}
            profile={demoProfile}
            activeKey="dashboard"
            logoText="Northlight"
            toolbar={
              <AppToolbar
                onSearch={openSitePalette}
                actions={[
                  notifications.action,
                  { id: "help", icon: "help", label: "Help" },
                  { id: "settings", icon: "settings", label: "Settings", href: "#settings" },
                ]}
                onChat={() => {}}
              />
            }
          >
            <DemoContent
              heading="Dashboard"
              body="The bar above stays pinned at the top of the surface while this content scrolls under it."
            />
            {["Balances", "Recent activity", "Scheduled payments", "Statements"].map((heading) => (
              <DemoContent
                key={heading}
                heading={heading}
                body="More of the page, so the surface scrolls and the toolbar holds its place above it."
              />
            ))}
          </AppLayout>
        </div>
      </section>

      <ComponentInstallStrip slug="app-layout" />
    </div>
  );
}
