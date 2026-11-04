"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Composer, type ComposerProps } from "rift-ds/components/Composer/Composer";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import type { MentionSource } from "rift-ds/components/Mention/Mention";
import { useAttachments } from "rift-ds/components/Attachment/useAttachments";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const MENTION_SOURCES: MentionSource[] = [
  {
    trigger: "@",
    label: "People and files",
    items: [
      { id: "mira", label: "Mira Castellan", description: "Design lead", icon: "person" },
      { id: "tobias", label: "Tobias Renner", description: "Platform", icon: "person" },
      { id: "roadmap", label: "roadmap.md", description: "Docs", icon: "description" },
    ],
  },
  {
    trigger: "/",
    label: "Skills",
    items: [
      { id: "summarize", label: "summarize", description: "The thread so far, in brief" },
      { id: "draft", label: "draft", description: "Write a first version" },
      { id: "review", label: "review", description: "Read it for problems" },
    ],
  },
];


const MODELS = [
  { value: "quick", label: "Quick", description: "Fast answers" },
  { value: "deep", label: "Deep", description: "More thought on harder questions" },
];

/**
 * The two-row composer as it really appears: its footer exists to hold these, so
 * every example of it holds them. A composer with neither is the one-row
 * `inline="chat"` instead, shown in its own section.
 */
function ChatComposer({ onSubmit, ...props }: ComposerProps) {
  const [model, setModel] = useState(MODELS[0].value);
  const queue = useAttachments({ maxCount: 10 });
  return (
    <Composer
      {...props}
      files={queue.items}
      onFilesSelected={queue.add}
      onFileRemove={queue.remove}
      pasteThreshold={1200}
      onPasteAsAttachment={(text) => queue.addText(text)}
      actions={<ModelPicker models={MODELS} value={model} onValueChange={setModel} />}
      onSubmit={(submitted) => {
        queue.clear();
        onSubmit?.(submitted);
      }}
    />
  );
}

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
      <ChatComposer
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
  return (
    <div className={styles.demoColumn}>
      <ChatComposer
        placeholder="Attach a file, or paste one"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
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
      <ChatComposer
        placeholder="Message the agent"
        value={value}
        onValueChange={setValue}
        onSubmit={(submitted) => {
          setSent(submitted);
          setValue("");
        }}
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
              <ChatComposer placeholder="Message the agent" />
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

          {/* One row in a chat */}
          <section className={styles.section}>
            <SectionTitle title="One row in a chat" />
            <p className={styles.sectionBody}>
              A composer with nothing to hold in its footer drops the footer:{" "}
              <code>inline=&quot;chat&quot;</code> puts a full-size send button on the
              text&apos;s line, with room around it. ChatWidget chooses for you. It takes
              this row when there is no model picker, attachments or composer actions,
              and the two-row composer when there is any of them. A context note is not
              footer content: on its own, it takes a line over the row.
            </p>
            <div className={styles.stack}>
              <Composer inline="chat" placeholder="Ask anything" />
            </div>
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
              <ChatComposer placeholder="Ask the model something" aiGlow />
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
            </p>
            <div className={styles.stack}>
              <ChatComposer
                placeholder="Ask about this page"
                context={<>Looking at &ldquo;Release notes&rdquo;</>}
                contextIcon="description"
              />
              <ChatComposer
                placeholder="Ask about this page"
                context={
                  <>
                    Looking at &ldquo;A quarterly planning document with a
                    title long enough to run out of room&rdquo;
                  </>
                }
                contextIcon="description"
              />
              <ChatComposer
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
              twelve rows, on the two-row composer and the one-row chat composer
              alike, then scrolls internally. <code>maxRows</code> sets a different
              cap. Add lines to feel it.
            </p>
            <div className={styles.stack}>
              <ChatComposer
                placeholder="Add a few lines"
                defaultValue={
                  "Draft the release notes for 2.4.\nCover the new alignment options,\nthe keyboard shortcuts,\nand the fixed focus trap.\nKeep it under 200 words."
                }
              />
            </div>
          </section>

          {/* Mentions */}
          <section className={styles.section}>
            <SectionTitle title="Mentions" />
            <p className={styles.demoText}>
              Pass mentions, one source per trigger character, and typing @
              or / at the start of a word opens a menu of that source from
              the line it was typed on. Arrows move, Enter or Tab writes the
              choice, Escape closes. The Mention page covers the tag, the
              menu and the sent message.
            </p>
            <div className={styles.stack}>
              <ChatComposer
                placeholder="Type @ to mention, / for skills"
                mentions={MENTION_SOURCES}
                mentionPlacement="bottom"
              />
            </div>
          </section>

          {/* The full footer */}
          <section className={styles.section}>
            <SectionTitle title="The full footer" />
            <p className={styles.demoText}>
              The intended stack: a PromptSuggestions row above the composer,
              with attachments and a model picker in its footer. Tapping a
              suggestion fills the input; sending clears it.
            </p>
            <FullFooterDemo />
          </section>

          {/* The mini composer */}
          <section className={styles.section}>
            <SectionTitle title="The mini composer" />
            <p className={styles.sectionBody}>
              Everything above is for a chat. The mini composer is for AI input inside
              other content, such as TableToolbar&apos;s AI command, and is never a
              chat&apos;s composer. <code>inline</code> sets it at exactly the control
              height of an Input or toolbar beside it, and <code>size</code> matches the
              table&apos;s default or compact density. It grows to three rows as a long
              request wraps, with send held in the bottom corner.
            </p>
            <div className={styles.stack}>
              <Composer inline placeholder="Mini, default" />
              <Composer inline size="compact" placeholder="Mini, compact" />
            </div>
          </section>

          <ComponentInstallStrip slug="composer" />
        </main>
      </div>

    </>
  );
}
