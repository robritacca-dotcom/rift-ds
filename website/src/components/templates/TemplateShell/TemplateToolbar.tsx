"use client";

/**
 * The app-shell templates' top bar: the library's AppToolbar inside the
 * templates' StickyTopBar, which keeps it pinned with its fill and blur.
 * One component, so every template's bar is the same bar, in the order
 * AppToolbar sets: the search, space, the icon controls and the AI button.
 *
 * The search opens the site's command palette; the bell opens a
 * notification panel whose See all goes to the notifications block, and
 * the gear goes to the settings block, so a template shows where those
 * pages land. A template passes how its AI button opens its chat, and
 * `searchGlass` when its stage runs under the bar (the analytics map).
 */

import type { MouseEventHandler } from "react";
import { AppToolbar } from "rift-ds/components/AppToolbar/AppToolbar";
import type { AgentStatusState } from "rift-ds/components/AgentStatus/AgentStatusPatterns";
import { openSitePalette } from "@/components/SitePalette/palette-bus";
import { useDemoNotifications } from "@/components/AppToolbarDemo/useDemoNotifications";
import StickyTopBar from "./StickyTopBar";
import styles from "./TemplateShell.module.css";

export default function TemplateToolbar({
  onChat,
  chatState,
  chatExpanded,
  searchGlass,
}: {
  /** Opens the template's chat. */
  onChat: MouseEventHandler<HTMLButtonElement>;
  /** What the template's agent is doing, shown on the AI button. */
  chatState?: AgentStatusState;
  /** Whether the template's chat is open. */
  chatExpanded?: boolean;
  /** Frosts the search, for a template whose stage runs under the bar. */
  searchGlass?: boolean;
}) {
  const notifications = useDemoNotifications({ seeAllHref: "/docs/blocks/notifications" });
  return (
    <StickyTopBar>
      <div className={styles.templateToolbar}>
        <AppToolbar
          onSearch={openSitePalette}
          searchGlass={searchGlass}
          actions={[
            notifications.action,
            { id: "help", icon: "help", label: "Help" },
            { id: "settings", icon: "settings", label: "Settings", href: "/docs/blocks/settings" },
          ]}
          onChat={onChat}
          chatState={chatState}
          chatExpanded={chatExpanded}
        />
      </div>
    </StickyTopBar>
  );
}
