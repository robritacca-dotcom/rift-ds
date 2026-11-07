"use client";

/**
 * Labs: the horizon chat. The site's own chat over a dithered planet
 * horizon (HorizonCanvas), the way a product home puts its prompt box over
 * a hero shader. The main pane paints no ground, so the horizon shows
 * through it; the threads rail is a near-solid band; the composer is glass.
 * Once a conversation starts an even coat of frost fades in over the pane,
 * since a transcript cannot be read over a halftone.
 *
 * The stage is forced to the dark theme: a horizon from orbit is a night
 * scene. The chat is the real SiteChat on the root provider, with nothing
 * rebuilt; the threads rail is borrowed from the glass chat lab.
 */

import React from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { ChatWidget, useChatWidget } from "rift-ds/chat";
import { useSiteWidgetProps } from "@/components/SiteChat/useSiteWidgetProps";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import GlassRail from "../glass-chat/GlassRail";
import HorizonCanvas from "./HorizonCanvas";
import styles from "./HorizonStage.module.css";

export default function HorizonStage() {
  const { open, setOpen, turns, live } = useChatWidget();
  const widget = useSiteWidgetProps();
  const active = turns.length > 0 || Boolean(live);

  React.useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, [setOpen]);

  return (
    <div className={styles.stage} data-theme="dark" data-bg-hidden="">
      <div className={styles.window} data-active={active || undefined}>
        <HorizonCanvas className={styles.art} />
        <div className={styles.frost} aria-hidden="true" />
        {open ? (
          <ChatWidget
            {...widget}
            fullscreenEnabled={false}
            threads={({ overlay, close }) => (
              <GlassRail
                overlay={overlay}
                close={close}
                className={overlay ? undefined : styles.rail}
              />
            )}
          />
        ) : (
          <div className={styles.launcher}>
            <AiButton
              label={`Ask ${ASSISTANT_NAME}`}
              icon="forum"
              onClick={() => setOpen(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
