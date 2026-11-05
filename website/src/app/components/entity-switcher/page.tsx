"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  EntitySwitcher,
  type EntitySwitcherItem,
} from "rift-ds/components/EntitySwitcher/EntitySwitcher";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/** One level: every entity a leaf. */
const accounts: EntitySwitcherItem[] = [
  { id: "north", name: "North region", description: "Ad account", icon: "north" },
  { id: "south", name: "South region", description: "Ad account", icon: "south" },
  { id: "online", name: "Online store", description: "Ad account", icon: "storefront" },
];

/** Company, business unit, department, advertiser. */
const organisation: EntitySwitcherItem[] = [
  {
    id: "northwind",
    name: "Northwind Group",
    description: "Holding company",
    children: [
      {
        id: "consumer",
        name: "Consumer",
        description: "Business unit",
        children: [
          {
            id: "growth",
            name: "Growth marketing",
            description: "Department",
            children: [
              { id: "larkspur", name: "Larkspur Coffee", description: "Advertiser" },
              { id: "tidewater", name: "Tidewater Cycles", description: "Advertiser" },
              { id: "harbor", name: "Harbor Books", description: "Advertiser" },
            ],
          },
          { id: "brand", name: "Brand", description: "Department" },
          { id: "lifecycle", name: "Lifecycle", description: "Department" },
        ],
      },
      { id: "enterprise", name: "Enterprise", description: "Business unit" },
      { id: "labs", name: "Labs", description: "Business unit", disabled: true },
    ],
  },
  { id: "halcyon", name: "Halcyon Studio", description: "Agency client" },
];

const InlineMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2 22 20H2Z" />
  </svg>
);

/** One entity per kind of mark. */
const marks: EntitySwitcherItem[] = [
  { id: "logo", name: "Design team", description: "A logo image", logo: "/logos/Figma.svg" },
  { id: "symbol", name: "Support desk", description: "A Material Symbol", icon: "support_agent" },
  { id: "element", name: "Peak Analytics", description: "An inline SVG", icon: <InlineMark /> },
  { id: "initials", name: "Quill and Co", description: "Initials" },
];

export default function EntitySwitcherPage() {
  const [entity, setEntity] = React.useState("growth");
  const picked = React.useMemo(() => {
    const find = (items: EntitySwitcherItem[]): EntitySwitcherItem | undefined =>
      items.reduce<EntitySwitcherItem | undefined>(
        (hit, item) => hit ?? (item.id === entity ? item : find(item.children ?? [])),
        undefined,
      );
    return find(organisation);
  }, [entity]);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Entity switcher</h1>
            <PageLinks storybookPath="/?path=/docs/components-entityswitcher--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Which one you are looking at, and a way to change it</p>
            <p className={styles.introBody}>
              A mark, a name and a description over a panel of the companies, teams or
              accounts a screen can be scoped to. The data decides the panel: a list of
              entities is one list, and nesting makes it step through levels.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="One level" />
            <p className={styles.demoText}>
              When no entity has children, the panel is a single list. Picking one closes
              it, and the selected entity carries a check.
            </p>
            <div className={styles.demoStage}>
              <EntitySwitcher items={accounts} defaultValue="north" switcherLabel="Switch account" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Many levels" />
            <p className={styles.demoText}>
              Any children make the list step in. A row with children opens its level,
              which starts with the parent itself so a whole branch can be picked, and a
              back row climbs out. The panel opens on the level that holds the selection,
              and past eight entities a search covers every level, each result showing
              its path.
            </p>
            <div className={styles.demoRow}>
              <div className={styles.demoStage}>
                <EntitySwitcher
                  items={organisation}
                  value={entity}
                  onValueChange={setEntity}
                  switcherLabel="Switch workspace"
                />
              </div>
              <span className={styles.demoReadout}>{picked?.name}</span>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Marks" />
            <p className={styles.demoText}>
              Each entity draws whatever it carries: a logo image fills the tile, an icon
              or any element sits inside it, and two initials stand in when there is
              neither.
            </p>
            <div className={styles.demoStage}>
              <EntitySwitcher items={marks} defaultValue="logo" switcherLabel="Switch team" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Collapsed" />
            <p className={styles.demoText}>
              For a collapsed rail, the mark stands alone and the panel opens beside it.
              Inside the app sidebar&apos;s top slot it follows the rail on its own, the
              mark holding still while the rest fades.
            </p>
            <div className={styles.demoRow}>
              <EntitySwitcher
                items={organisation}
                defaultValue="growth"
                switcherLabel="Switch workspace"
                collapsed
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Long names" />
            <p className={styles.demoText}>
              Names and descriptions hold one line each and truncate, so the switcher keeps
              its height whatever the data says.
            </p>
            <div className={styles.demoStage}>
              <EntitySwitcher
                items={[
                  {
                    id: "long",
                    name: "International Consumer Growth Marketing and Partnerships",
                    description: "Department of Revenue Operations, Europe, Middle East and Africa",
                  },
                ]}
                defaultValue="long"
                switcherLabel="Switch workspace"
              />
            </div>
          </section>

          <ComponentInstallStrip slug="entity-switcher" />
        </main>
      </div>
    </>
  );
}
