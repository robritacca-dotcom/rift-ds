"use client";

/**
 * The app-shell template family's one shell: merchant sales, the analytics
 * screen, the relay console, the roadmap planner and the team calendar all
 * lay out through it (and the marketing dashboard, now a lab at
 * /labs/marketing). It owns the AppSidebar (with its Appearance
 * section and the All templates action), the main column, the room a docked
 * assistant takes, and the three layouts the rail's Layout row picks between. The rail always
 * runs in panel mode, purely to demonstrate the secondary nav: a row with
 * children opens them in the side panel, which starts closed.
 *
 * The three app shell modes, from rift-ds's shell recipe (the root carries
 * its data-ds-shell markers):
 *
 * - `flush`: the rail runs edge to edge on the shell colour behind a
 *   hairline and the content column is centred on the crisp app surface;
 *   the page scrolls. A template is always the floor of its page, so it
 *   takes no backdrop: the blur is a chat's alone.
 * - `floating`: the rail floats as a glass card and the content column is
 *   centred at the template's own max width; the page scrolls.
 * - `inset`: the rail runs flush on the app shell colour and the content
 *   sits in a surface inset from the other edges, scrolling
 *   inside it; a docked assistant takes the same inset treatment.
 *
 * An `entitySwitcher` puts an EntitySwitcher under the brand row, in the
 * rail's persistent top slot, so its mark holds still as the rail collapses.
 *
 * The layout comes from the visitor's stored choice (useTemplateLayout)
 * unless a `layout` is passed. The assistant reads it from this shell's
 * context, so it never has to be wired twice. In the app frame (a template
 * hosted as a phone screen) the rail gives way to the frame's tab bar.
 */

import React from "react";
import { AppSidebar, type AppSidebarProps } from "rift-ds/components/AppSidebar/AppSidebar";
import { Button } from "rift-ds/components/Button/Button";
import { useDockViewport } from "rift-ds/chat";
import type { TemplateLayout, TemplateWidth } from "@/lib/templateLayout";
import { AppFrameScreen, useAppFrame } from "../AppFrame/AppFrame";
import { EntitySwitcher, type EntitySwitcherProps } from "rift-ds/components/EntitySwitcher/EntitySwitcher";
import { useAppearanceRailSection } from "./appearance-section";
import { entitySwitcherEntries } from "./drawer-entries";
import { useIsStaged } from "../useStagedProductName";
import { TemplateShellContext } from "./context";
import { useTemplateLayout, useTemplateWidth } from "./useTemplateLayout";
import styles from "./TemplateShell.module.css";


export interface TemplateShellProps {
  /** The rail's own props; the shell sets its layout, sub-nav mode, expanded state and both footer forms. */
  sidebar: Omit<
    AppSidebarProps,
    | "layout"
    | "floating"
    | "subNav"
    | "defaultPanelOpen"
    | "expanded"
    | "defaultExpanded"
    | "onExpandedChange"
    | "footerSlot"
    | "collapsedFooterSlot"
    | "topSlot"
    | "persistentTopSlot"
  >;
  /** The entity switcher under the brand row, following the rail as it collapses; left out, the rail has none. */
  entitySwitcher?: EntitySwitcherProps;
  /** Whether the docked assistant is open, so the content makes room for it. */
  chatOpen: boolean;
  /** The app frame's header, shown when the template is hosted as a phone screen. */
  frame: { title: string; subtitle?: string };
  /** The app frame's tab bar, rendered only in the app frame. */
  tabBar?: React.ReactNode;
  /** The assistant panel, rendered after the main column. */
  assistant?: React.ReactNode;
  /**
   * `page` (the default) lets a floating screen grow and the page scroll;
   * `viewport` holds a floating screen to the viewport (an instrument or a
   * board with panes that scroll themselves) down to the tablet width. The
   * inset layout always holds the viewport.
   */
  fill?: "page" | "viewport";
  /** Forces a layout, over the visitor's stored choice. */
  layout?: TemplateLayout;
  /** Forces the page width, over the visitor's stored choice: narrow, contained or full, in any layout. */
  width?: TemplateWidth;
  /** The template's content column class: its padding, gap and contained width (`--ds-shell-contained-width`), read in every layout. */
  contentClassName?: string;
  /** The page content, laid out in the content column. */
  children: React.ReactNode;
}

export default function TemplateShell({
  sidebar,
  entitySwitcher,
  chatOpen,
  frame,
  tabBar,
  assistant,
  fill = "page",
  layout: layoutProp,
  width: widthProp,
  contentClassName,
  children,
}: TemplateShellProps) {
  const storedLayout = useTemplateLayout();
  const storedWidth = useTemplateWidth();
  const width: TemplateWidth = widthProp ?? storedWidth;
  const appFrame = useAppFrame();
  // A phone screen has no rail and no room for an inset, so the app frame
  // always draws the floating layout's plain column.
  const layout: TemplateLayout = appFrame ? "floating" : (layoutProp ?? storedLayout);
  const inset = layout === "inset";
  const chatDocks = useDockViewport();
  const [expanded, setExpanded] = React.useState(true);

  /* The look controls are the rail's last section, Appearance: each a row
     with its current value whose choices open in the side panel, the
     rail's secondary menu, and in the phone drawer drill in like every
     other row. The phone drawer also drills into the switcher as its first
     row, and the way back to every template is the rail's footer action.
     The switcher's choice is held here so the rail's menu and the
     drawer's rows show the same one. */
  const [entity, setEntity] = React.useState(entitySwitcher?.value ?? entitySwitcher?.defaultValue);
  const pickEntity = (id: string, item: Parameters<NonNullable<EntitySwitcherProps["onValueChange"]>>[1]) => {
    setEntity(id);
    entitySwitcher?.onValueChange?.(id, item);
  };
  const appearance = useAppearanceRailSection();
  // A screen staged in the playground is a preview, not a visit: it draws
  // no way back to the templates index.
  const staged = useIsStaged();
  const drawerTopEntries =
    entitySwitcher &&
    entitySwitcherEntries({
      items: entitySwitcher.items,
      value: entity,
      onPick: pickEntity,
      label: entitySwitcher.switcherLabel ?? "Switch",
    });

  const content = (
    <div
      className={[styles.content, contentClassName].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );

  return (
    <TemplateShellContext.Provider value={layout}>
      {/* The layout's own switch for the ambient background: the family
          sits on the flat page colour, no gradient. */}
      <div data-bg-hidden hidden />
      <div
        className={[
          styles.shell,
          styles[layout],
          fill === "viewport" ? styles.fillViewport : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-ds-shell={layout}
        /* Narrow is the recipe's contained width at the shell's narrow
           step (the module's data-template-width rule). */
        data-ds-width={width === "full" ? "full" : "contained"}
        data-template-width={width}
      >
        {!appFrame && (
          <div className={styles.sidebar}>
            <AppSidebar
              {...sidebar}
              sections={[...sidebar.sections, appearance]}
              layout={layout}
              subNav="panel"
              defaultPanelOpen={false}
              expanded={expanded}
              onExpandedChange={setExpanded}
              topSlot={
                entitySwitcher && (
                  <EntitySwitcher {...entitySwitcher} value={entity} onValueChange={pickEntity} />
                )
              }
              persistentTopSlot={!!entitySwitcher}
              drawerTopEntries={drawerTopEntries}
              // The way back to every template belongs to the prototype,
              // not the app, so it is the rail's one action at its foot
              // (and the phone drawer's) rather than one of the app's rows.
              footerAction={staged ? undefined : <Button label="All templates" variant="primary" iconLeft="arrow_back" href="/templates" />}

            />
          </div>
        )}

        <AppFrameScreen
          enabled={appFrame}
          title={frame.title}
          subtitle={frame.subtitle}
          menu={{
            title: sidebar.logoText ?? frame.title,
            sections: [...sidebar.sections, appearance],
            activeKey: sidebar.activeKey ?? "",
            profile: sidebar.profile,
            topEntries: drawerTopEntries,
          }}
        >
          <main
            className={[
              styles.main,
              /* Room for the panel only while it docks: widened past the
                 page room the dock threshold promises, it overlays. */
              chatOpen && chatDocks ? styles.mainChatOpen : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* The surface clips to its rounded corners and the content
                column inside it scrolls, so the scrollbar never squares a
                corner. */}
            {inset ? <div className={styles.surface}>{content}</div> : content}
          </main>
        </AppFrameScreen>

        {appFrame && tabBar}
        {assistant}
      </div>
    </TemplateShellContext.Provider>
  );
}
