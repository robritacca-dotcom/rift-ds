"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { AlertDialog } from "rift-ds/components/AlertDialog/AlertDialog";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import {
  CommandPalette,
  type CommandPaletteGroup,
} from "rift-ds/components/CommandPalette/CommandPalette";
import { ContextMenu } from "rift-ds/components/ContextMenu/ContextMenu";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { DropdownMenu } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { HoverCard } from "rift-ds/components/HoverCard/HoverCard";
import { Popover } from "rift-ds/components/Popover/Popover";
import { Tooltip } from "rift-ds/components/Tooltip/Tooltip";

const MENU_ITEMS = [
  { label: "Edit", icon: "edit" },
  { label: "Duplicate", icon: "content_copy" },
  { type: "separator" as const },
  { label: "Delete", icon: "delete", destructive: true },
];

const FILE_ITEMS = [
  { label: "Open", icon: "open_in_new" },
  { label: "Rename", icon: "edit" },
  { label: "Share", icon: "share" },
  { type: "separator" as const },
  { label: "Move to trash", icon: "delete", destructive: true },
];

const COMMAND_GROUPS: CommandPaletteGroup[] = [
  {
    label: "Theme",
    commands: [
      { id: "light", label: "Switch to light mode", icon: "light_mode" },
      { id: "dark", label: "Switch to dark mode", icon: "dark_mode" },
      { id: "copy", label: "Copy theme CSS", icon: "content_copy", shortcut: ["⌘", "C"] },
    ],
  },
  {
    label: "Go to",
    commands: [
      { id: "tokens", label: "Colour tokens", icon: "palette" },
      { id: "components", label: "Components", icon: "widgets" },
      { id: "templates", label: "Templates", icon: "dashboard" },
    ],
  },
];

export default function OverlaysSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <section className={styles.demoSection} aria-label="Overlays">
      <SectionTitle title="Overlays" />
      <p className={styles.sectionNote}>
        Panels, menus, and tips share the container surfaces and radius scale:
        open any of these while a tint or radius change is active and the overlay
        matches the page beneath it. Every panel here also wears the
        elevation lever, so Flat and Soft read most clearly in this section.
      </p>

      <div className={styles.demoRow}>
        <Button
          label="Open dialog"
          variant="secondary"
          iconLeft="open_in_full"
          onClick={() => setDialogOpen(true)}
        />
        <Button
          label="Delete project"
          variant="secondary"
          iconLeft="delete"
          onClick={() => setAlertOpen(true)}
        />
        <Button
          label="Command palette"
          variant="secondary"
          iconLeft="search"
          onClick={() => setPaletteOpen(true)}
        />
        <DropdownMenu
          trigger={<Button label="Actions" variant="secondary" iconRight="expand_more" />}
          items={MENU_ITEMS}
        />
      </div>

      <div className={styles.demoRow}>
        <Popover
          content="Popovers ride the floating-shadow token and the container surface."
          ariaLabel="About popovers"
        >
          <Button label="Popover" variant="tertiary" />
        </Popover>
        <HoverCard
          content={
            <div className={styles.hoverCardBody}>
              <Avatar name="Ada Okafor" size="md" />
              <div>
                <strong>Ada Okafor</strong>
                <p className={styles.sectionNote}>Design systems lead</p>
              </div>
            </div>
          }
        >
          <Button label="@ada" variant="tertiary" />
        </HoverCard>
        <Tooltip content="Tooltips follow the same surfaces">
          <CircularButton icon="help" variant="tertiary" ariaLabel="Tooltip demo" tooltip={false} />
        </Tooltip>
      </div>

      <ContextMenu items={FILE_ITEMS} ariaLabel="File actions">
        <div className={styles.contextTarget}>Right-click here for the context menu</div>
      </ContextMenu>

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

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title="Delete this project?"
        description="Its themes and saved presets go with it. This cannot be undone."
        confirmLabel="Delete project"
        variant="destructive"
      />

      {/* hotkey off: the site owns Cmd+K, and this demo must not fight it. */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        groups={COMMAND_GROUPS}
        hotkey={false}
      />
    </section>
  );
}
