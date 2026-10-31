"use client";

/**
 * The app-shell template family's one shell: the marketing dashboard, the
 * merchant sales, the relay console, the roadmap planner and the team
 * calendar all lay out through it. It owns the AppSidebar (with the footer
 * switchers), the main column, the room a docked assistant takes, and the
 * two layouts the footer's layout switch flips between. The rail always
 * runs in panel mode, purely to demonstrate the secondary nav: a row with
 * children opens them in the side panel, which starts closed.
 *
 * - `floating`: the rail floats as a glass card and the content column is
 *   centred at the template's own max width; the page scrolls.
 * - `inset`: the rail runs flush on the app shell colour and the content
 *   runs full width in a surface inset from the other edges, scrolling
 *   inside it; a docked assistant takes the same inset treatment.
 *
 * The layout comes from the visitor's stored choice (useTemplateLayout)
 * unless a `layout` is passed. The assistant reads it from this shell's
 * context, so it never has to be wired twice. In the app frame (a template
 * hosted as a phone screen) the rail gives way to the frame's tab bar.
 */

import React from "react";
import { AppSidebar, type AppSidebarProps } from "rift-ds/components/AppSidebar/AppSidebar";
import { MOTION_SCROLL_SETTLE_MS } from "rift-ds/tokens/motion";
import type { TemplateLayout } from "@/lib/templateLayout";
import SidebarSwitchers from "../SidebarSwitchers/SidebarSwitchers";
import { AppFrameScreen, useAppFrame } from "../AppFrame/AppFrame";
import { TemplateShellContext } from "./context";
import { useTemplateLayout } from "./useTemplateLayout";
import styles from "./TemplateShell.module.css";


export interface TemplateShellProps {
  /** The rail's own props; the shell sets its layout, sub-nav mode, expanded state and footer. */
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
  >;
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
  /** The template's content column class: its padding, gap and floating max width. */
  contentClassName?: string;
  /** The page content, laid out in the content column. */
  children: React.ReactNode;
}

export default function TemplateShell({
  sidebar,
  chatOpen,
  frame,
  tabBar,
  assistant,
  fill = "page",
  layout: layoutProp,
  contentClassName,
  children,
}: TemplateShellProps) {
  const storedLayout = useTemplateLayout();
  const appFrame = useAppFrame();
  // A phone screen has no rail and no room for an inset, so the app frame
  // always draws the floating layout's plain column.
  const layout: TemplateLayout = appFrame ? "floating" : (layoutProp ?? storedLayout);
  const inset = layout === "inset";
  const [expanded, setExpanded] = React.useState(true);

  // The inset surface's scrollbar shows only while it scrolls, flagged
  // straight on the DOM so a scroll never re-renders the page.
  const scrollTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(scrollTimer.current), []);
  const flagScrolling = (event: React.UIEvent<HTMLDivElement>) => {
    const scroller = event.currentTarget;
    scroller.dataset.scrolling = "";
    window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      delete scroller.dataset.scrolling;
    }, MOTION_SCROLL_SETTLE_MS);
  };

  const content = (
    <div
      className={[styles.content, contentClassName].filter(Boolean).join(" ")}
      onScroll={inset ? flagScrolling : undefined}
    >
      {children}
    </div>
  );

  return (
    <TemplateShellContext.Provider value={layout}>
      {/* data-bg-hidden: the layout's own switch for the ambient background;
          the family sits on the flat page colour, no gradient. */}
      <div
        className={[
          styles.shell,
          inset ? styles.inset : styles.floating,
          fill === "viewport" ? styles.fillViewport : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-bg-hidden=""
      >
        {!appFrame && (
          <div className={styles.sidebar}>
            <AppSidebar
              {...sidebar}
              layout={layout}
              subNav="panel"
              defaultPanelOpen={false}
              expanded={expanded}
              onExpandedChange={setExpanded}
              footerSlot={<SidebarSwitchers showLayout backLink />}
            />
          </div>
        )}

        <AppFrameScreen enabled={appFrame} title={frame.title} subtitle={frame.subtitle}>
          <main
            className={[
              styles.main,
              chatOpen ? styles.mainChatOpen : "",
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
