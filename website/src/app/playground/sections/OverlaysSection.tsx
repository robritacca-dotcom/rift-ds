"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { Dialog } from "@robr0/design-system/components/Dialog/Dialog";
import { DropdownMenu } from "@robr0/design-system/components/DropdownMenu/DropdownMenu";
import { Popover } from "@robr0/design-system/components/Popover/Popover";
import { Tooltip } from "@robr0/design-system/components/Tooltip/Tooltip";

const MENU_ITEMS = [
  { label: "Edit", icon: "edit" },
  { label: "Duplicate", icon: "content_copy" },
  { type: "separator" as const },
  { label: "Delete", icon: "delete", destructive: true },
];

export default function OverlaysSection() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className={styles.demoSection} aria-label="Overlays">
      <SectionTitle title="Overlays" />
      <p className={styles.sectionNote}>
        Panels, menus, and tips share the container surfaces and radius scale:
        open any of these while a tint or radius change is active and the overlay
        matches the page beneath it.
      </p>

      <div className={styles.demoRow}>
        <Button
          label="Open dialog"
          variant="secondary"
          iconLeft="open_in_full"
          onClick={() => setDialogOpen(true)}
        />
        <DropdownMenu
          trigger={<Button label="Actions" variant="secondary" iconRight="expand_more" />}
          items={MENU_ITEMS}
        />
        <Popover
          content="Popovers ride the floating-shadow token and the container surface."
          ariaLabel="About popovers"
        >
          <Button label="Popover" variant="tertiary" />
        </Popover>
        <Tooltip content="Tooltips follow the same surfaces">
          <CircularButton icon="help" variant="tertiary" ariaLabel="Tooltip demo" tooltip={false} />
        </Tooltip>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Re-themed dialog"
        description="The panel, scrim, and buttons all follow your levers."
        footer={
          <>
            <Button label="Cancel" variant="secondary" onClick={() => setDialogOpen(false)} />
            <Button label="Confirm" variant="primary" onClick={() => setDialogOpen(false)} />
          </>
        }
      >
        <p className={styles.sectionNote}>
          Dialogs portal to the document body, and still re-theme, because the
          overrides land on the root element.
        </p>
      </Dialog>
    </section>
  );
}
