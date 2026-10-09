"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Composer } from "rift-ds/components/Composer/Composer";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { useAttachments } from "rift-ds/components/Attachment/useAttachments";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


/** Send flips into a short fake stream, with stop cutting it off early. */
function StreamingDemo() {
  const [value, setValue] = useState("");
  const [streaming, setStreaming] = useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setValue("");
    setStreaming(true);
    timer.current = setTimeout(() => setStreaming(false), 4000);
  };

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    setStreaming(false);
  };

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className={styles.demoColumn}>
      <Composer
        placeholder="Send something to start a fake stream"
        value={value}
        onValueChange={setValue}
        onSubmit={start}
        streaming={streaming}
        onStop={stop}
        aiGlow
      />
      <p className={styles.demoNote} aria-live="polite">
        {streaming
          ? "Streaming. Press the stop button, or wait a few seconds."
          : "Idle. Type a message and send it."}
      </p>
    </div>
  );
}

/** Real files: pick, paste or drop them. `useAttachments` owns the list. */
function AttachmentsDemo() {
  const [value, setValue] = useState("");
  const queue = useAttachments({ maxCount: 10 });

  return (
    <div className={styles.demoColumn}>
      <Composer
        placeholder="Attach a file, or paste one"
        value={value}
        onValueChange={setValue}
        files={queue.items}
        onFilesSelected={queue.add}
        onFileRemove={queue.remove}
        pasteThreshold={1200}
        onPasteAsAttachment={(text) => queue.addText(text)}
        onSubmit={() => {
          queue.clear();
          setValue("");
        }}
      />
    </div>
  );
}

/** The intended stack: suggestions feed the composer, submit clears it. */
function FullFooterDemo() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const suggestions = [
    { id: "summarise", label: "Summarise this thread" },
    { id: "draft", label: "Draft a reply" },
    { id: "actions", label: "List action items" },
  ];

  return (
    <div className={styles.demoColumn}>
      <PromptSuggestions
        suggestions={suggestions}
        onValueChange={(id) =>
          setValue(suggestions.find((s) => s.id === id)?.label ?? "")
        }
      />
      <Composer
        placeholder="Message the agent"
        value={value}
        onValueChange={setValue}
        onSubmit={(submitted) => {
          setSent(submitted);
          setValue("");
        }}
        actions={
          <CircularButton icon="tune" variant="tertiary" ariaLabel="Options" />
        }
      />
      <p className={styles.demoNote} aria-live="polite">
        {sent ? `Sent: "${sent}"` : "Nothing sent yet."}
      </p>
    </div>
  );
}

export default function ComposerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Composer</h1>
            <PageLinks storybookPath="/?path=/docs/components-composer--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Where the person talks back
            </p>
            <p className={styles.introBody}>
              The chat input shell: a context note, an attachments row, an
              auto-growing textarea, a leading actions slot, and a send
              button in the action colour. Send
              is the one primary CTA in the chat set, so it is the one place
              the action colour appears. While a response streams, send
              becomes stop and Enter goes inert.
            </p>
          </div>

          {/* The shell */}
          <section className={styles.section}>
            <SectionTitle title="The shell" />
            <p className={styles.demoText}>
              The shell is the control. The textarea inside is borderless, so
              the border carries hover and focus for the whole surface. Enter
              sends, Shift and Enter breaks the line, and whitespace alone
              never sends. Submitting reports the value but does not clear
              it; the consumer owns the value and empties it after a
              successful send.
            </p>
            <div className={styles.stack}>
              <Composer placeholder="Message the agent" />
            </div>
          </section>

          {/* Send and stop */}
          <section className={styles.section}>
            <SectionTitle title="Send and stop" />
            <p className={styles.demoText}>
              While a response streams, the send button becomes a stop button
              and submitting is blocked, so a person can never fire a message
              into a running answer. On a glowing composer the gradient ring
              also stays lit and keeps turning while the agent works, focus or
              not. Try it: send something and the demo streams for a few
              seconds.
            </p>
            <StreamingDemo />
          </section>

          {/* AI glow */}
          <section className={styles.section}>
            <SectionTitle title="AI glow" />
            <p className={styles.demoText}>
              With aiGlow, focusing the composer replaces the plain selected
              border with AiButton&apos;s signature: the glow blooms out of
              the send corner and the ring fades up a beat behind it, the
              system&apos;s signal that a model answers here. Blur collapses
              it back. Off by default; the site chat turns it on. Click into
              the field to see it.
            </p>
            <div className={styles.stack}>
              <Composer placeholder="Ask the model something" aiGlow />
            </div>
          </section>

          {/* Context */}
          <section className={styles.section}>
            <SectionTitle title="Context" />
            <p className={styles.demoText}>
              The context prop pins a quiet, non-interactive note to the top
              of the shell, telling the person what the model can see. The
              site chat uses it to name the page you are reading. An optional
              contextIcon puts a Material Symbol at its left. The note is one
              line: a long one clips with an ellipsis, a short one carries no
              trailing dots.
            </p>
            <p className={styles.demoText}>
              Set contextPlacement to above and the note leaves the shell for
              its own bar, a small gap above it, so it reads as what the model
              can see rather than part of the message. The icon, the typed
              text and the model picker&apos;s label then start on one line.
              The site chat uses this placement.
            </p>
            <div className={styles.stack}>
              <Composer
                placeholder="Ask about this page"
                context={<>Looking at &ldquo;Release notes&rdquo;</>}
                contextIcon="description"
              />
              <Composer
                placeholder="Ask about this page"
                context={
                  <>
                    Looking at &ldquo;A quarterly planning document with a
                    title long enough to run out of room&rdquo;
                  </>
                }
                contextIcon="description"
              />
              <Composer
                placeholder="Ask about this page"
                context={<>Looking at &ldquo;Release notes&rdquo;</>}
                contextIcon="description"
                contextPlacement="above"
              />
            </div>
          </section>

          {/* Attachments */}
          <section className={styles.section}>
            <SectionTitle title="Attachments" />
            <p className={styles.demoText}>
              Give the composer a way to hear about files and it grows an
              attach button, accepts files pasted into the field, and takes
              files dropped on it. The queue is a row of square tiles that
              scrolls sideways. The list stays the caller’s, the same
              philosophy as FileInput: the composer shows the files and
              reports what changed. Try it with files of your own. They are
              read in your browser and go nowhere.
            </p>
            <AttachmentsDemo />
          </section>

          {/* Growth */}
          <section className={styles.section}>
            <SectionTitle title="Growth" />
            <p className={styles.demoText}>
              The textarea starts at one row and grows with its content up to
              maxRows, eight by default, then scrolls internally. This one is
              capped at four rows; add lines to feel the cap.
            </p>
            <div className={styles.stack}>
              <Composer
                placeholder="Add a few lines"
                maxRows={4}
                defaultValue={
                  "Draft the release notes for 2.4.\nCover the new alignment options,\nthe keyboard shortcuts,\nand the fixed focus trap.\nKeep it under 200 words."
                }
              />
            </div>
          </section>

          {/* The full footer */}
          <section className={styles.section}>
            <SectionTitle title="The full footer" />
            <p className={styles.demoText}>
              The intended stack: a PromptSuggestions row above the composer,
              with a leading action for attachments. Tapping a suggestion
              fills the input; sending clears it.
            </p>
            <FullFooterDemo />
          </section>

          <ComponentInstallStrip slug="composer" />
        </main>
      </div>

    </>
  );
}
