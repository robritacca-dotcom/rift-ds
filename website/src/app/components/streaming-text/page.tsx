"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { StreamingText } from "@robr0/design-system/components/StreamingText/StreamingText";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Button } from "@robr0/design-system/components/Button/Button";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const RESPONSE =
  "The component owns the reveal, not the transport. Feed it the accumulated " +
  "text on every render, from a fetch stream, a websocket, or a mock like this " +
  "one, and it animates through whatever was appended. When a large chunk lands " +
  "at once it steps faster the further behind it falls, so a dumped paragraph " +
  "catches up in a beat instead of typing for seconds.";

/** Feeds the response a few words at a time, like a chunked LLM stream. */
function useSimulatedStream(chunkMs: number) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [run, setRun] = useState(0);
  const cursor = useRef(0);

  useEffect(() => {
    const words = RESPONSE.split(" ");
    const interval = setInterval(() => {
      cursor.current += 3 + Math.floor(Math.random() * 4);
      setText(words.slice(0, cursor.current).join(" "));
      if (cursor.current >= words.length) {
        setStreaming(false);
        clearInterval(interval);
      }
    }, chunkMs);
    return () => clearInterval(interval);
  }, [chunkMs, run]);

  const replay = useCallback(() => {
    cursor.current = 0;
    setText("");
    setStreaming(true);
    setRun((r) => r + 1);
  }, []);
  return { text, streaming, replay };
}

export default function StreamingTextPage() {
  const stream = useSimulatedStream(400);
  const fast = useSimulatedStream(120);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Streaming text</h1>
            <PageLinks storybookPath="/?path=/docs/components-streamingtext--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The reveal for text that arrives in pieces
            </p>
            <p className={styles.introBody}>
              An LLM response typing itself out, extracted into a primitive.
              It inherits the surrounding typography, animates only through
              appended text, and keeps a cursor blinking while more is coming.
              Under reduced motion the typing is skipped and each chunk
              appears whole. The pacing itself ships headless as
              useStreamReveal, and this site&apos;s own chat runs on it: the
              same engine, rendering markdown instead of a span.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="A simulated stream" />
            <p className={styles.sectionBody}>
              Chunks of a few words land every 400ms; the reveal types through
              each one and the cursor holds between them.
            </p>
            <div className={styles.demoCard} aria-live="polite">
              <StreamingText text={stream.text} streaming={stream.streaming} />
            </div>
            <div className={styles.demoControls}>
              <Button
                variant="secondary"
                size="compact"
                label="Replay"
                iconLeft="replay"
                onClick={stream.replay}
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Catching up" />
            <p className={styles.sectionBody}>
              The same response delivered three times faster. The reveal widens
              its steps as the backlog grows, so it stays close behind the
              stream instead of falling seconds behind it.
            </p>
            <div className={styles.demoCard} aria-live="polite">
              <StreamingText text={fast.text} streaming={fast.streaming} />
            </div>
            <div className={styles.demoControls}>
              <Button
                variant="secondary"
                size="compact"
                label="Replay"
                iconLeft="replay"
                onClick={fast.replay}
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Finished text" />
            <p className={styles.sectionBody}>
              Text present on mount renders whole, and with streaming off there
              is no cursor: a settled message costs nothing. Announcement stays
              the container&apos;s job, so pair the component with an aria-live
              region when the surrounding UI does not already announce the
              message.
            </p>
            <div className={styles.demoCard}>
              <StreamingText text="A finished message renders whole, with no cursor and no timers running." />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
