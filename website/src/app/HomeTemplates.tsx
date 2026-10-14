"use client";

/**
 * The home page's template showcase under the collage: one template drawn
 * live behind a device toggle, with the templates page one click away. The
 * template's name comes from templatesSidebarLinks, so nothing here restates
 * a fact the nav config owns.
 */

import { useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { templatesSidebarLinks } from "@/config/navigation";
import {
  DEVICES,
  TemplateFrame,
  type DeviceKey,
} from "@/components/TemplateFrame/TemplateFrame";
import styles from "./HomeTemplates.module.css";

/** The template on show, looked up in the nav config so its name
    stays that list's. The rest are one click away on the
    templates page. */
const TEMPLATE_HREF = "/templates/chat-home";
const TEMPLATE = (() => {
  const entry = templatesSidebarLinks.find((t) => t.href === TEMPLATE_HREF);
  if (!entry) throw new Error(`No templates nav entry for ${TEMPLATE_HREF}`);
  return entry;
})();

export default function HomeTemplates() {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const frameDevice = TEMPLATE.mobileOnly ? "mobile" : device;

  return (
    <section className={styles.section} aria-labelledby="home-templates-title">
      <header className={styles.header}>
        <h2 id="home-templates-title" className={styles.title}>
          Whole screens, built from the system alone
        </h2>
        <p className={styles.lede}>
          A chat home, a marketing dashboard, a coding agent. Each one is a live
          page on the same components and tokens, so it changes with the theme
          you pick.
        </p>
        <Button
          label="Browse all templates"
          variant="primary"
          iconLeft="dashboard"
          href="/templates"
        />
      </header>

      <SegmentedControl
        segments={Object.entries(DEVICES).map(([value, d]) => ({
          value,
          label: d.label,
          icon: d.icon,
        }))}
        activeSegment={device}
        onSegmentChange={(value) => setDevice(value as DeviceKey)}
        size="compact"
        ariaLabel="Preview device size"
      />

      <TemplateFrame
        href={TEMPLATE.href}
        title={TEMPLATE.label}
        device={frameDevice}
        className={frameDevice === "mobile" ? styles.phoneShell : ""}
      />
    </section>
  );
}
