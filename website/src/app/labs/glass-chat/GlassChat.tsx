"use client";

/**
 * Labs: the glass chat. The site's own chat as a sheet of frosted glass
 * over a piece of art, with a scanline raster across the whole stage: the
 * art is crisp where the window ends and a soft wash of its colours where
 * the window covers it.
 *
 * Three layers, back to front: the backdrop (a picture when the page
 * passes one, otherwise the procedural blossom tree in BlossomCanvas),
 * the window, and the scanlines. The window's glass is a progressive
 * blur: frosted at its edges and clearing toward a reveal over the art,
 * which closes once a conversation starts. The window holds the real SiteChat,
 * reading the root layout's SiteChatProvider, so it is the same
 * conversation, transport, model picker, starters, follow-ups and feedback
 * as the site panel. Nothing about the chat is rebuilt here: the page
 * passes it a threads rail through its own slot and restyles it from
 * GlassChat.module.css, and that is all.
 *
 * The route is chromeless, so the site's own panel (SiteChatMount) stands
 * down and this is the only chat on the page.
 */

import React from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { useSiteChat } from "@/components/SiteChat/ChatContext";
import { SiteChat } from "@/components/SiteChat/SiteChat";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import BlossomCanvas from "./BlossomCanvas";
import GlassRail from "./GlassRail";
import styles from "./GlassChat.module.css";

export default function GlassChat({ backdrop }: { backdrop?: string }) {
  const { open, setOpen, turns, live } = useSiteChat();
  /* A conversation on the pane closes the reveal (see .frostFull). */
  const active = turns.length > 0 || Boolean(live);

  /* The window is the chat's open state on this page: it opens with the
     page, and closes again on the way out so the site panel does not
     arrive already open on the next route. */
  React.useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, [setOpen]);

  return (
    // data-bg-hidden: the stage paints its own ground, so the site's
    // ambient background stands down (the switch the templates use).
    <div className={styles.stage} data-bg-hidden="">
      {backdrop ? (
        <div
          className={`${styles.art} ${styles.photo}`}
          style={{ backgroundImage: `url(${backdrop})` }}
          aria-hidden="true"
        />
      ) : (
        <BlossomCanvas className={styles.art} />
      )}

      {open ? (
        <div className={styles.window} data-active={active || undefined}>
          {/* The progressive blur: five blur steps and the tint, then the
              even coat that closes the reveal behind a conversation. */}
          <div className={styles.frost} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <div className={styles.frostFull} />
          </div>
          <SiteChat
            fullscreenEnabled={false}
            threads={({ overlay, close }) => (
              <GlassRail
                overlay={overlay}
                close={close}
                className={overlay ? undefined : styles.rail}
              />
            )}
          />
        </div>
      ) : (
        /* Closed, the art has the stage to itself and the launcher brings
           the window back. */
        <div className={styles.launcher}>
          <AiButton
            label={`Ask ${ASSISTANT_NAME}`}
            icon="forum"
            onClick={() => setOpen(true)}
          />
        </div>
      )}

      <div className={styles.scanlines} aria-hidden="true" />
    </div>
  );
}
