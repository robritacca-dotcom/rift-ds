"use client";

/**
 * Labs: quick replies. The five ways an agent's reply can end, from an open
 * question to a short interview, played live: each level on the left sends
 * the visitor's opening message into the chat on the right, and the agent's
 * reply ends the way that level describes. The chat is the package's own
 * ChatWidget on a scripted transport (./script.ts), so every option and
 * every typed answer gets a reply written for it.
 *
 * The page carries its own theme controls (it is chromeless): the theme,
 * the colour mode, and a desktop or phone frame for the chat.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ChatWidget, useChatWidget, useTakeoverViewport } from "rift-ds/chat";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import BrandSwitcher from "@/components/BrandSwitcher/BrandSwitcher";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import {
  LEVELS,
  OPEN_ASK,
  OPEN_SUGGESTED_ANSWER,
  createQuickRepliesTransport,
} from "./script";
import styles from "./QuickReplies.module.css";

type Device = "desktop" | "mobile";

export default function QuickReplies() {
  const transport = useMemo(() => createQuickRepliesTransport(), []);
  return (
    <SiteChatProvider transport={transport}>
      <Lab />
    </SiteChatProvider>
  );
}

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

function Lab() {
  const { turns, streaming, send, reset, setDraft, setOpen } = useChatWidget();
  const [device, setDevice] = useState<Device>("desktop");
  const phoneViewport = useTakeoverViewport();

  /* The chat is the stage, so it is open for as long as the page is. */
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);

  /* The level playing now: the newest visitor message that opened one. A
     chip that leads into another level (Help me pick a plan) moves it on. */
  const active = useMemo(() => {
    for (let i = turns.length - 1; i >= 0; i -= 1) {
      const turn = turns[i];
      if (turn.role !== "user") continue;
      const level = LEVELS.find((entry) => normalize(entry.prompt) === normalize(turn.text));
      if (level) return level.id;
    }
    return null;
  }, [turns]);

  /* Level one ends in nothing to tap, so the composer shows an answer
     already typed: send it, or rewrite it in your own words. Once per ask. */
  const prefilled = useRef<string | null>(null);
  useEffect(() => {
    const last = turns[turns.length - 1];
    if (streaming || !last || last.role !== "assistant" || prefilled.current === last.id) return;
    if (normalize(last.text) === normalize(OPEN_ASK)) {
      prefilled.current = last.id;
      setDraft(OPEN_SUGGESTED_ANSWER);
    }
  }, [turns, streaming, setDraft]);

  const framed = device === "mobile" && !phoneViewport;
  const chat = (
    <ChatWidget
      fullscreenEnabled={false}
      closeEnabled={false}
      compact={framed || phoneViewport}
      phone={framed || phoneViewport}
      title="Acme"
      tagline="Pick a quick reply to try it."
      showStarters={false}
    />
  );

  return (
    <>
      <HiddenBackground />
      <DotBackground />

      <main className={styles.page} data-device={framed ? "mobile" : "desktop"}>
        <aside className={styles.rail} aria-label="Quick reply levels">
          <div className={styles.controls} role="group" aria-label="Theme and frame">
            <BrandSwitcher />
            <ThemeToggle />
            <span className={styles.deviceSwitch}>
              <SegmentedControl
                segments={[
                  { value: "desktop", label: "Desktop" },
                  { value: "mobile", label: "Mobile" },
                ]}
                activeSegment={device}
                onSegmentChange={(value) => setDevice(value as Device)}
                size="compact"
                ariaLabel="Chat frame"
              />
            </span>
          </div>

          <header className={styles.intro}>
            <p className={styles.eyebrow}>Quick replies</p>
            <h1 className={styles.title}>Keep the conversation moving</h1>
            <p className={styles.lede}>
              An agent often needs something from you before it can go on. Quick replies get it with
              the least effort, from a question you answer in your own words to a few you tap
              through. Pick one to try it.
            </p>
          </header>

          <ol className={styles.levels}>
            {LEVELS.map((level, index) => {
              const isActive = active === level.id;
              return (
                <li key={level.id}>
                  <button
                    type="button"
                    className={styles.level}
                    data-active={isActive || undefined}
                    aria-pressed={isActive}
                    disabled={streaming}
                    onClick={() => send(level.prompt)}
                  >
                    <span className={styles.levelHead}>
                      <span className={styles.levelNumber} aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className={styles.levelAction}>{level.action}</span>
                      <span className={`material-symbols-rounded ${styles.levelIcon}`} aria-hidden="true">
                        {isActive ? "graphic_eq" : "play_arrow"}
                      </span>
                    </span>
                    <span className={styles.levelTitle}>{level.title}</span>
                    <span className={styles.levelWhen}>{level.when}</span>
                    {isActive && (
                      <span className={styles.tryIt}>
                        <span className={`material-symbols-rounded ${styles.tryIcon}`} aria-hidden="true">
                          touch_app
                        </span>
                        <span>{level.tryIt}</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className={styles.railFoot}>
            <Button
              label="Start over"
              variant="secondary"
              size="compact"
              iconLeft="restart_alt"
              disabled={turns.length === 0}
              onClick={() => {
                reset();
                setDraft("");
              }}
            />
          </div>
        </aside>

        <section className={styles.stage} aria-label="Chat">
          {framed ? (
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>{chat}</div>
            </div>
          ) : (
            <div className={styles.card}>{chat}</div>
          )}
        </section>
      </main>
    </>
  );
}
