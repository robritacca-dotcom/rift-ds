"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Chip } from "@robr0/design-system/components/Chip/Chip";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { Stat } from "@robr0/design-system/components/Stat/Stat";
import { Table } from "@robr0/design-system/components/Table/Table";
import { Accordion } from "@robr0/design-system/components/Accordion/Accordion";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { COMPONENT_COUNT } from "@robr0/design-system/components/registry";
import { TOKEN_COUNT } from "@robr0/design-system/tokens/registry";

const TABLE_COLUMNS = [
  { key: "component", header: "Component" },
  { key: "category", header: "Category" },
  { key: "status", header: "Status", align: "right" as const },
];

const TABLE_ROWS = [
  {
    id: "button",
    cells: {
      component: "Button",
      category: "Actions",
      status: <Badge label="Stable" variant="positive" />,
    },
  },
  {
    id: "combobox",
    cells: {
      component: "Combobox",
      category: "Forms",
      status: <Badge label="Stable" variant="positive" />,
    },
  },
  {
    id: "carousel",
    cells: {
      component: "Carousel",
      category: "Data display",
      status: <Badge label="Beta" variant="info" />,
    },
  },
];

const ACCORDION_ITEMS = [
  {
    id: "tokens",
    title: "How the tint reaches this text",
    content:
      "The neutral scale drives page backgrounds, container surfaces, borders, and every text colour, so the tint lever washes all of them toward the seed at once.",
  },
  {
    id: "radius",
    title: "And how the radius lever reshapes it",
    content:
      "Containers use the same primitive radius scale as the inputs, so scaling it reshapes cards, tables, and accordions together.",
  },
];

export default function DataDisplaySection() {
  const [selectedChip, setSelectedChip] = useState("tokens");

  return (
    <section className={styles.demoSection} aria-label="Data display">
      <SectionTitle title="Data display" />
      <p className={styles.sectionNote}>
        Surfaces, borders, and text all sit on the neutral scale: switch on the
        neutral tint to watch every container in this section wash toward your seed
        colour.
      </p>

      <div className={styles.demoRow}>
        <Chip
          label="Design tokens"
          icon="palette"
          selected={selectedChip === "tokens"}
          onClick={() => setSelectedChip("tokens")}
        />
        <Chip
          label="Components"
          icon="widgets"
          selected={selectedChip === "components"}
          onClick={() => setSelectedChip("components")}
        />
        <Avatar name="Robert Ritacca" status="online" />
        <Avatar name="Design System" size="sm" />
      </div>

      <div className={styles.demoRow}>
        <Stat value={String(COMPONENT_COUNT)} label="Components" delta="In this system" trend="up" />
        <Stat value={String(TOKEN_COUNT)} label="Semantic tokens" delta="Light and dark" trend="neutral" />
      </div>

      <Table
        columns={TABLE_COLUMNS}
        rows={TABLE_ROWS}
        bordered
        caption="Component status"
        captionHidden
      />

      <Accordion items={ACCORDION_ITEMS} defaultExpanded={["tokens"]} />
    </section>
  );
}
