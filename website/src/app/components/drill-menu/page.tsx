"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { DrillMenu, type DrillMenuEntry } from "rift-ds/components/DrillMenu/DrillMenu";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

/* A fictional shop's menu: large sections, a category level, links that
   leave the site, and a setting that drills into its choices. */
function shopMenu(units: string, setUnits: (value: string) => void): DrillMenuEntry[] {
  return [
    {
      type: "section",
      items: [
        {
          label: "Shop",
          href: "#shop",
          id: "shop",
          items: [
            {
              label: "Kitchen",
              href: "#kitchen",
              id: "kitchen",
              icon: "skillet",
              items: [
                { label: "Knives", href: "#knives" },
                { label: "Pans", href: "#pans" },
                { label: "Storage", href: "#storage" },
              ],
            },
            { label: "Garden", href: "#garden", icon: "yard" },
            { label: "Lighting", href: "#lighting", icon: "lightbulb" },
          ],
        },
        { label: "Journal", href: "#journal" },
        { label: "Stores", href: "#stores" },
      ],
    },
    {
      type: "section",
      items: [
        {
          label: "Help",
          id: "help",
          items: [
            { label: "Delivery", description: "Times and costs", href: "#delivery", icon: "local_shipping" },
            { label: "Returns", description: "Thirty days, free", href: "#returns", icon: "undo" },
            { label: "Community", description: "Ask other owners", href: "https://example.com", icon: "forum", external: true },
          ],
        },
      ],
    },
    {
      type: "section",
      label: "Settings",
      items: [
        {
          label: "Units",
          id: "units",
          icon: "straighten",
          value: units,
          items: [
            { label: "Metric", description: "Centimetres and kilograms", selected: units === "Metric", onClick: () => setUnits("Metric") },
            { label: "Imperial", description: "Inches and pounds", selected: units === "Imperial", onClick: () => setUnits("Imperial") },
          ],
        },
      ],
    },
  ];
}

function Demo({ defaultPath, currentHref }: { defaultPath?: string[]; currentHref?: string }) {
  const [units, setUnits] = useState("Metric");
  return (
    <div className={styles.frame}>
      <DrillMenu
        items={shopMenu(units, setUnits)}
        defaultPath={defaultPath}
        currentHref={currentHref}
        navLabel="Shop menu"
        onNavigate={(_item, event) => event.preventDefault()}
      />
    </div>
  );
}

export default function DrillMenuPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Drill menu</h1>
        <PageLinks storybookPath="/?path=/docs/components-drillmenu--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>A menu that drills in, one level at a time</p>
        <p className={styles.introBody}>
          Drill menu is the menu a phone needs. Each level fills the space it is given, a row with children opens the next level in its place, and a back row names where it returns to. Rows are a thumb tall and every label starts on one line, so a deep site reads as a few short lists rather than one long one. The site header puts it in its drawer, which fills the screen on a phone.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="A site menu" />
        <div className={styles.demo}>
          <Demo currentHref="#pans" defaultPath={[]} />
          <p className={styles.note}>
            The top sections take the default rows, the size the site header’s and the app sidebar’s drawers use; <code>variant="prominent"</code> sets a section in the heading face on a taller row where a menu wants its top level louder. Shop drills into its categories and Kitchen into its pages, each level opening with an overview row to the page its row links. The rows on the way to the current page carry the current fill. <code>defaultPath={"{[]}"}</code> opens this one on its first level.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Opening where the reader is" />
        <div className={styles.demo}>
          <Demo currentHref="#pans" />
          <p className={styles.note}>
            Given no <code>defaultPath</code>, the stack opens on the deepest level that holds the current page, with that page marked: a reader on Pans reopens the menu on Kitchen, and the back rows lead out from there. A host that shows something only on the first level, as the site header’s drawer does with its footer, reads the same path to know where the stack will open.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Descriptions and links off-site" />
        <div className={styles.demo}>
          <Demo defaultPath={["help"]} />
          <p className={styles.note}>
            A <code>description</code> sets a second line under the label. An <code>external</code> link opens in a new tab and carries an outward arrow.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Settings that drill into choices" />
        <div className={styles.demo}>
          <Demo defaultPath={["units"]} />
          <p className={styles.note}>
            A row with <code>onClick</code> is an action, not a link. In a list of choices each one sets <code>selected</code>, the chosen one carries the chosen mark, and the row above shows it as its <code>value</code>.
          </p>
        </div>
      </section>

      <ComponentInstallStrip slug="drill-menu" />
    </div>
  );
}
