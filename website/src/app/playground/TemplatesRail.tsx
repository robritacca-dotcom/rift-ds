"use client";

import Image from "next/image";
import { MessageCard } from "rift-ds/components/MessageCard/MessageCard";
import { templatesSidebarLinks } from "@/config/navigation";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { FloatingRail } from "./FloatingRail";
import styles from "./TemplatesRail.module.css";
import layout from "./page.module.css";

/* ============================================
   The templates rail: the Templates view's own panel, a picture of every
   template to pick the one the stage runs.

   The pictures are stills, not live previews, on purpose. A live preview
   is the whole template running in a frame of its own (its document, React,
   its charts and data), so a rail of them would run every template at once
   to show a strip of thumbnails. A still costs one small image, lazy-loaded
   and resized by next/image, and only the picked template runs, in the
   stage's one frame, where the levers reach it. The cost is that the
   stills show the served theme in the current mode, not the levers' look.
   scripts/capture-template-thumbnails.mjs shoots them, and
   validate-template-thumbnails.mjs holds the folder to this list.
   ============================================ */

/** The templates the stage can run: the nav's list, less its contents link,
    the phone-only screens, which ride the Mobile stage as a desktop
    template's phone version rather than standing alone, and the screens
    flagged hideFromPlayground (one another view already stages). */
export const STAGE_TEMPLATES = templatesSidebarLinks
  .slice(1)
  .filter((template) => !template.mobileOnly && !template.hideFromPlayground);

/** The template the view opens on: the list's first, the dashboard. */
export const DEFAULT_TEMPLATE_HREF = STAGE_TEMPLATES[0].href;

const thumbnail = (href: string, mode: string) =>
  `/images/templates/${href.split("/").pop()}-${mode === "light" ? "light" : "dark"}.jpg`;

export default function TemplatesRail({
  variant,
  value,
  onValueChange,
  collapsed = false,
  onCollapsedChange,
}: {
  /** The right rail on desktop, or bare content inside the compact Drawer. */
  variant: "panel" | "drawer";
  /** The staged template's href. */
  value: string;
  /** Called with the href of the template picked. */
  onValueChange: (href: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const mode = useSiteTheme();

  const list = (
    /* One list and nothing beside it, so no section header: a heading
       over the panel's only section would restate the panel's title. */
    <ul className={styles.list}>
        {STAGE_TEMPLATES.map((template) => {
          const current = template.href === value;
          return (
            <li key={template.href}>
              {/* The chat's rich-content card (MessageCard: the picture
                  inset, the name beneath), wrapped in the button that
                  picks it, since the card itself is not a control. */}
              <button
                type="button"
                className={styles.tile}
                aria-current={current || undefined}
                aria-label={template.label}
                onClick={() => onValueChange(template.href)}
              >
                <MessageCard
                  className={styles.card}
                  media={
                    <Image
                      src={thumbnail(template.href, mode)}
                      alt=""
                      width={720}
                      height={450}
                      sizes="244px"
                      className={styles.image}
                    />
                  }
                  title={template.label}
                  meta={template.description}
                />
              </button>
            </li>
          );
        })}
    </ul>
  );

  if (variant === "drawer") {
    return <div className={layout.drawerControls}>{list}</div>;
  }

  return (
    <FloatingRail
      side="right"
      label="Template picker"
      title="Templates"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange ?? (() => {})}
      onReset={() => onValueChange(DEFAULT_TEMPLATE_HREF)}
      resetLabel="Back to the first template"
      resetDisabled={value === DEFAULT_TEMPLATE_HREF}
    >
      {list}
    </FloatingRail>
  );
}
