"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import { ChatWidget, useChatWidget, type ChatWidgetContextValue, type ChatWidgetProps } from "rift-ds/chat";
import { type SimTiming } from "rift-ds/chat";
import { DEMO_RENDERERS, DEMO_STARTERS, DEMO_THREADS, createDemoTransport } from "rift-ds/chat/demo";
import s from "./page.module.css";

/**
 * One example on the AI chat page: the whole chat, on the scripted demo
 * transport, in a card of its own, configured for the section it sits in.
 * `widget` sets the props that section is about; `setup` runs once at mount
 * with the chat's context, to stage turns or send a message so the example
 * shows the state the words describe. Every example is the real widget,
 * never its parts drawn separately: the parts have pages of their own.
 */
export type ChatStageSetup = (chat: ChatWidgetContextValue) => void;
export type ChatStageWidget = Partial<ChatWidgetProps> | ((chat: ChatWidgetContextValue) => Partial<ChatWidgetProps>);

function Staged({
  height,
  phone,
  widget,
  setup,
  loopAfterMs,
}: {
  height: number;
  phone: boolean;
  widget?: ChatStageWidget;
  setup?: ChatStageSetup;
  loopAfterMs?: number;
}) {
  const chat = useChatWidget();
  const latest = useRef(chat);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [staged, setStaged] = useState(false);
  useEffect(() => {
    latest.current = chat;
  });
  // A looping example: once its reply has landed, it rests, clears and asks
  // again, so a reader arriving at any moment sees the status and the
  // reasoning live rather than finished.
  const settled = staged && !chat.streaming && chat.turns.length > 0;
  useEffect(() => {
    if (!loopAfterMs || !setup || !settled) return;
    const timer = setTimeout(() => {
      latest.current.reset();
      setup(latest.current);
    }, loopAfterMs);
    return () => clearTimeout(timer);
  }, [loopAfterMs, setup, settled]);
  useEffect(() => {
    // The panel opens at mount; the staging waits until the example first
    // scrolls into view, so a send is seen arriving rather than found
    // finished. Deferred and cancelled on cleanup, so React's development
    // double-mount stages the example once rather than starting a send the
    // first unmount then aborts. Neither is a subscription.
    const open = setTimeout(() => latest.current.setOpen(true), 0);
    if (!root || !setup) return () => clearTimeout(open);
    let seen = false;
    const observer = new IntersectionObserver((entries) => {
      if (seen || !entries.some((entry) => entry.isIntersecting)) return;
      seen = true;
      observer.disconnect();
      setup(latest.current);
      setStaged(true);
    }, { threshold: 0.4 });
    observer.observe(root);
    return () => {
      clearTimeout(open);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);
  const own = typeof widget === "function" ? widget(chat) : widget ?? {};
  return (
    <div ref={setRoot} className={s.stage} style={{ width: "100%", height }} data-stage={phone ? "phone" : "desktop"}>
      <ChatWidget
        title="Acme Assistant"
        tagline="How can we help you today?"
        starters={DEMO_STARTERS}
        fullscreenEnabled={false}
        closeEnabled={false}
        compact={phone}
        phone={phone}
        disclaimer="A written preview. Nothing you type or attach leaves your browser."
        {...own}
      />
    </div>
  );
}

export function ChatStage({
  height = 560,
  phone = false,
  timing,
  widget,
  setup,
  loopAfterMs,
}: {
  /** The card's height; the chat fills it. */
  height?: number;
  /** Stage the chat as a phone: a narrow card and the stacked welcome. */
  phone?: boolean;
  /** The demo transport's beats, for an example that should be seen thinking. */
  timing?: Partial<SimTiming>;
  widget?: ChatStageWidget;
  setup?: ChatStageSetup;
  /** Rest this long after the reply lands, then clear the chat and stage it again. */
  loopAfterMs?: number;
}) {
  const transport = useMemo(() => createDemoTransport(timing), [timing]);
  return (
    <div className={phone ? s.stagePhone : undefined}>
      <SiteChatProvider transport={transport} renderers={DEMO_RENDERERS} threads={DEMO_THREADS}>
        <Staged height={height} phone={phone} widget={widget} setup={setup} loopAfterMs={loopAfterMs} />
      </SiteChatProvider>
    </div>
  );
}
