"use client";

/**
 * The agent workbench template: the session screen for Tandem, a fictional
 * coding agent, built from the design system alone. Three panels run the
 * full viewport, no top bar and no content max-width: a session-history
 * threads panel on the left (grouped by repo, with the new-session row and
 * the profile footer), the conversation in the middle — the ask, the
 * agent's reasoning, its tool calls, the plan, and a checkpoint waiting on
 * a decision — and the workspace on the right, where the stacked diffs
 * take the whole window and a details rail — the changed-files tree, the
 * patch stats, the sandbox checks, the spec's duration trend and the
 * session budgets — folds in on the diffs' right behind the header's
 * toggle, closed by default so the code leads. Clicking a file in the
 * tree scrolls the diff pane to it; answering the checkpoint moves the
 * plan, the status line, the suite's check row, and the pull-request
 * button, so the panes stay one screen. Every colour, radius, space, and type style is a
 * semantic token; every control is a library component — the threads panel
 * is the published ThreadPanel, which graduated out of this template.
 *
 * The patch stats derive from the diff strings, so the numbers can never
 * disagree with the patch. This template carries no docked
 * TemplateAssistant: the conversation pane IS the assistant surface, so its
 * Composer answers typed messages with the mock fallback inline. All data
 * is fictional, so the route is excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React from "react";
import Image from "next/image";
import {
  AgentPlan,
  type AgentPlanStep,
} from "@robr0/design-system/components/AgentPlan/AgentPlan";
import {
  AgentStatus,
  type AgentStatusProps,
} from "@robr0/design-system/components/AgentStatus/AgentStatus";
import { Badge, type BadgeProps } from "@robr0/design-system/components/Badge/Badge";
import { Button } from "@robr0/design-system/components/Button/Button";
import { ChatHeader } from "@robr0/design-system/components/ChatHeader/ChatHeader";
import { ChatMessage } from "@robr0/design-system/components/ChatMessage/ChatMessage";
import { ChatThread } from "@robr0/design-system/components/ChatThread/ChatThread";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { CodeDiff } from "@robr0/design-system/components/CodeDiff/CodeDiff";
import { Composer } from "@robr0/design-system/components/Composer/Composer";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import { InterruptCard } from "@robr0/design-system/components/InterruptCard/InterruptCard";
import { ModelPicker } from "@robr0/design-system/components/ModelPicker/ModelPicker";
import { Reasoning } from "@robr0/design-system/components/Reasoning/Reasoning";
import { Sparkline } from "@robr0/design-system/components/Sparkline/Sparkline";
import { Stat } from "@robr0/design-system/components/Stat/Stat";
import {
  ThreadPanel,
  type ThreadPanelGroup,
} from "@robr0/design-system/components/ThreadPanel/ThreadPanel";
import { ToolCall } from "@robr0/design-system/components/ToolCall/ToolCall";
import {
  TreeView,
  type TreeViewNode,
} from "@robr0/design-system/components/TreeView/TreeView";
import { UsageCard } from "@robr0/design-system/components/UsageCard/UsageCard";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import styles from "./AgentWorkbench.module.css";

/* ---------------------------------------------------------------- data */

/* The session history, grouped by repo the way a threads panel groups by
   project. The active thread is the session on stage; the rest are set
   dressing, so their rows render but lead nowhere. */
const THREAD_GROUPS: ThreadPanelGroup[] = [
  {
    label: "parcel-api",
    threads: [
      { id: "flaky", title: "Fix the flaky upload spec" },
      { id: "metrics", title: "Add retry metrics to the dashboard" },
      { id: "previews", title: "Wire up the deploy previews" },
      { id: "chunks", title: "Tune the chunk size for slow links" },
      { id: "audit", title: "Chase the npm audit warnings" },
      { id: "resume", title: "Resume interrupted multipart uploads" },
      { id: "limits", title: "Raise the rate limit for partners" },
    ],
  },
  {
    label: "parcel-web",
    threads: [
      { id: "leak", title: "Chase the memory leak in the worker" },
      { id: "node", title: "Upgrade the runtime to Node 22" },
      { id: "theme", title: "Ship the dark theme toggle" },
      { id: "fonts", title: "Self-host the display face" },
      { id: "empty", title: "Design the empty states" },
      { id: "a11y", title: "Sweep the focus order on checkout" },
    ],
  },
  {
    label: "parcel-infra",
    threads: [
      { id: "cache", title: "Warm the edge cache on deploy" },
      { id: "alerts", title: "Quiet the noisy disk alerts" },
      { id: "backups", title: "Verify the nightly backups restore" },
    ],
  },
];

const THREAD_CONTROLS = [
  { id: "runs", icon: "terminal", label: "Runs" },
  { id: "repos", icon: "account_tree", label: "Repos" },
  { id: "automations", icon: "schedule", label: "Automations" },
];

/* The staged change, one unified diff per file. The tree selects between
   them, and CodeDiff derives each header's addition and deletion counts
   from the lines, so the numbers can never disagree with the patch. */
const RETRY_DIFF = `@@ -12,6 +12,7 @@ export class RetryQueue {
   private inFlight = new Set<string>();
+  private timers = new Map<string, ReturnType<typeof setTimeout>>();
   private listeners = new Set<QueueListener>();

@@ -41,9 +42,12 @@ export class RetryQueue {
   scheduleRetry(upload: Upload) {
     const delay = backoff(upload.attempt);
-    setTimeout(() => {
+    const timer = setTimeout(() => {
+      this.timers.delete(upload.id);
       this.enqueue(upload);
     }, delay);
+    this.timers.set(upload.id, timer);
   }

   abort(upload: Upload) {
+    const timer = this.timers.get(upload.id);
+    if (timer !== undefined) clearTimeout(timer);
+    this.timers.delete(upload.id);
     this.inFlight.delete(upload.id);
     upload.settle("aborted");
   }`;

const TEST_DIFF = `@@ -8,13 +8,14 @@ describe("RetryQueue", () => {
   it("retries a failed chunk", async () => {
+    vi.useFakeTimers();
     const queue = new RetryQueue();
     const upload = makeUpload({ attempt: 1 });

     queue.scheduleRetry(upload);
-    await sleep(BACKOFF_BASE_MS + 50);
+    await vi.advanceTimersByTimeAsync(backoff(1));

     expect(queue.pending()).toContain(upload.id);
+    vi.useRealTimers();
   });

+  it("drops the retry when the upload aborts", async () => {
+    vi.useFakeTimers();
+    const queue = new RetryQueue();
+    const upload = makeUpload({ attempt: 1 });
+
+    queue.scheduleRetry(upload);
+    queue.abort(upload);
+    await vi.advanceTimersByTimeAsync(backoff(1));
+
+    expect(queue.pending()).not.toContain(upload.id);
+    vi.useRealTimers();
+  });`;

const WORKER_DIFF = `@@ -76,7 +76,9 @@ export function createUploadWorker(queue: RetryQueue) {
   const stop = () => {
-    queue.clear();
+    for (const upload of queue.pending()) {
+      queue.abort(upload);
+    }
     socket.close();
   };

@@ -101,6 +103,7 @@ export function createUploadWorker(queue: RetryQueue) {
   socket.on("close", () => {
+    metrics.count("uploads.worker.closed");
     stop();
   });`;

const ROUTE_DIFF = `@@ -22,10 +22,15 @@ export async function POST(request: Request) {
   const upload = queue.register(await request.blob(), meta);

+  request.signal.addEventListener("abort", () => {
+    queue.abort(upload);
+  });
+
   try {
     await queue.send(upload);
   } catch (error) {
-    if (upload.attempt < MAX_ATTEMPTS) queue.scheduleRetry(upload);
+    if (!request.signal.aborted && upload.attempt < MAX_ATTEMPTS) {
+      queue.scheduleRetry(upload);
+    }
     throw error;
   }`;

const BACKOFF_DIFF = `@@ -4,9 +4,13 @@ const BASE_MS = 400;
 const MAX_MS = 30_000;

-export function backoff(attempt: number) {
-  const delay = BASE_MS * 2 ** attempt;
-  return Math.min(delay, MAX_MS) + Math.random() * 250;
+export function backoff(attempt: number, jitter = Math.random) {
+  const delay = Math.min(BASE_MS * 2 ** attempt, MAX_MS);
+  /* Injectable jitter, so tests can pin the clock. */
+  return delay + jitter() * 250;
 }`;

const DOCS_DIFF = `@@ -31,6 +31,10 @@ The queue retries failed chunks with exponential backoff.
 Aborting an upload settles it immediately.

+Aborting also clears any armed retry timer, so a settled upload can
+never re-enter the queue. Worker shutdown and client disconnects drain
+through the same abort path.
+
 See the worker guide for deployment notes.`;

type ChangedFile = { path: string; diff: string };

const FILES: ChangedFile[] = [
  { path: "src/uploads/retry.ts", diff: RETRY_DIFF },
  { path: "src/uploads/retry.test.ts", diff: TEST_DIFF },
  { path: "src/uploads/worker.ts", diff: WORKER_DIFF },
  { path: "src/api/uploads/route.ts", diff: ROUTE_DIFF },
  { path: "src/lib/backoff.ts", diff: BACKOFF_DIFF },
  { path: "docs/uploads.md", diff: DOCS_DIFF },
];

/* The patch stats read the diffs themselves, the same way CodeDiff's
   headers do, so the rail's numbers move with the patch. */
const countLines = (prefix: string) =>
  FILES.reduce(
    (sum, file) =>
      sum + file.diff.split("\n").filter((line) => line.startsWith(prefix)).length,
    0
  );
const ADDED = countLines("+");
const REMOVED = countLines("-");

/* The tree derives from the diff list's paths, folders included, so every
   leaf the rail shows is a row the diff pane can answer. Folder ids are
   their path prefixes; leaf ids are the file paths themselves. */
function buildTree(files: ChangedFile[]): TreeViewNode[] {
  const root: TreeViewNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/");
    let level = root;
    let prefix = "";
    for (const part of parts.slice(0, -1)) {
      prefix = prefix ? `${prefix}/${part}` : part;
      let node = level.find((n) => n.id === prefix);
      if (!node) {
        node = { id: prefix, label: part, children: [] };
        level.push(node);
      }
      level = node.children!;
    }
    level.push({ id: file.path, label: parts[parts.length - 1] });
  }
  return root;
}

const TREE_NODES = buildTree(FILES);

/* Every folder prefix, so the whole patch is visible without clicking. */
const FOLDER_IDS = [
  ...new Set(
    FILES.flatMap((file) => {
      const parts = file.path.split("/").slice(0, -1);
      return parts.map((_, i) => parts.slice(0, i + 1).join("/"));
    })
  ),
];

/* The pre-flight checks the sandbox already ran; the suite row derives its
   state from the checkpoint's answer. */
const SETTLED_CHECKS = [
  { id: "types", label: "Type check", duration: "3.8s" },
  { id: "lint", label: "Lint", duration: "6.1s" },
  { id: "build", label: "Build", duration: "12.4s" },
];

/* Wall-clock seconds per run of the upload spec, oldest first: the noisy
   shape is the flake the session exists to fix. */
const SPEC_DURATIONS = [38, 52, 41, 47, 39, 64, 43, 58, 40, 61, 42, 41];

const SEARCH_RESULT = `src/uploads/retry.ts:43       scheduleRetry(upload: Upload) {
src/uploads/retry.ts:51       abort(upload: Upload) {
src/uploads/worker.ts:88      queue.scheduleRetry(upload);
src/api/uploads/route.ts:29   if (upload.attempt < MAX_ATTEMPTS) queue.scheduleRetry(upload);`;

const REASONING_TRACE =
  "The spec only fails on runs where the abort lands inside the backoff " +
  "window, which points at the queue rather than the network mock. " +
  "scheduleRetry arms a timer that holds the last reference to the upload, " +
  "and nothing on the abort path clears it, so a settled upload can " +
  "re-enter the queue and trip the pending assertion.";

const DIAGNOSIS =
  "Found the race. scheduleRetry arms a backoff timer that abort never " +
  "clears, so an aborted upload can re-enter the queue after it has " +
  "settled. Roughly one run in five lands the abort inside the backoff " +
  "window, which matches the failure rate you are seeing.";

const PATCH_NOTE =
  "The patch tracks each upload's timer and clears it on abort, points " +
  "worker shutdown and client disconnects at the same abort path, makes " +
  "the backoff jitter injectable so the spec can pin the clock, and notes " +
  "the new contract in the upload guide. The full diff is staged in the " +
  "workspace.";

const APPLY_REPLY =
  "The suite is green: 218 passed, 0 failed, in 41 seconds. Twelve repeat " +
  "runs of the upload spec all passed, so the flake is gone. Ready to open " +
  "a pull request whenever you are.";

const HOLD_REPLY =
  "Holding the patch. The diff stays staged in the workspace and nothing " +
  "has run. Send a message when you want the suite re-run.";

const TYPED_FALLBACK =
  "This workbench is a mock, so the session is scripted up to the " +
  "checkpoint above. In the live product this reply would come from the " +
  "agent working in the repository.";

const MODELS = [
  {
    label: "Tandem Deep",
    value: "deep",
    description: "Thorough runs for long refactors",
  },
  {
    label: "Tandem Swift",
    value: "swift",
    description: "Quick loops for small fixes",
    badge: "New",
  },
];

/* ---------------------------------------------------------------- page */

export default function AgentWorkbench() {
  const [selectedFile, setSelectedFile] = React.useState<string>(
    FILES[0].path
  );
  /* The coding panel folds away behind the header's code button; with it
     closed, the conversation takes the whole stage and its content column
     centres itself the way a chat app's does. */
  const [workspaceOpen, setWorkspaceOpen] = React.useState(true);
  /* The workspace's details rail folds in on the diffs' right, closed by
     default so the code leads. */
  const [railOpen, setRailOpen] = React.useState(false);
  /* ThreadPanel is controlled, so the host owns the collapse state; the
     panel animates its own width and the board's auto track follows. */
  const [threadsExpanded, setThreadsExpanded] = React.useState(true);
  const [decision, setDecision] = React.useState<string | undefined>();
  const [value, setValue] = React.useState("");
  const [typedTurns, setTypedTurns] = React.useState<
    { id: number; role: "user" | "assistant"; text: string }[]
  >([]);

  /* The text field is ready to type into after every send (the site chat's
     focus contract, restated over mock state). */
  const composerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const ask = (text: string) => {
    setTypedTurns((current) => [
      ...current,
      { id: current.length, role: "user", text },
      { id: current.length + 1, role: "assistant", text: TYPED_FALLBACK },
    ]);
    composerRef.current?.focus();
  };

  const applied = decision === "apply";
  const held = decision === "hold";

  /* The checkpoint's answer moves the whole screen: the plan's last step,
     the status line, the suite's check row, and the pull-request button
     all derive from it. */
  const planSteps: AgentPlanStep[] = [
    {
      label: "Reproduce the failure",
      status: "completed",
      detail: "3 failures in 12 runs of the spec",
    },
    {
      label: "Find the race",
      status: "completed",
      detail: "retry.ts: the backoff timer outlives abort",
    },
    {
      label: "Patch the queue and its callers",
      status: "completed",
      detail: `${FILES.length} files: the queue, its callers, and the docs`,
    },
    {
      label: "Re-run the suite",
      status: applied ? "completed" : held ? "pending" : "active",
    },
  ];

  const status: { state: AgentStatusProps["state"]; label: string } = applied
    ? { state: "done", label: "Suite green in 41 seconds" }
    : held
      ? { state: "idle", label: "Standing by" }
      : { state: "waiting", label: "Waiting at the checkpoint" };

  const suiteCheck: { badge: BadgeProps["variant"]; text: string; duration?: string } =
    applied
      ? { badge: "positive", text: "Passed", duration: "41.2s" }
      : held
        ? { badge: "neutral", text: "Held" }
        : { badge: "info", text: "Queued" };

  /* The diff pane stacks every file, the pull-request files view; picking
     a file in the tree scrolls the pane to its diff. Instant on purpose,
     so there is no animation for the reduced-motion guard to catch. */
  const diffPaneRef = React.useRef<HTMLDivElement | null>(null);
  const fileRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const selectFile = (id: string) => {
    if (!FILES.some((f) => f.path === id)) return;
    setSelectedFile(id);
    const pane = diffPaneRef.current;
    const target = fileRefs.current[id];
    if (pane && target) pane.scrollTo({ top: target.offsetTop });
  };

  return (
    // data-bg-hidden: the workbench sits on the flat page colour, the same
    // switch the other templates use.
    <div className={styles.shell} data-bg-hidden="">
      <div
        className={`${styles.board} ${workspaceOpen ? "" : styles.boardSolo}`}
      >
        {/* -------------------------------------------- session history */}
        <aside className={styles.threads} aria-label="Sessions">
          <ThreadPanel
            logo={<Image src="/logos/rr.svg" alt="" width={24} height={24} />}
            logoText="Tandem"
            newThreadLabel="New session"
            newThreadShortcut={["Ctrl", "N"]}
            controls={THREAD_CONTROLS}
            groups={THREAD_GROUPS}
            activeThreadId="flaky"
            expanded={threadsExpanded}
            onExpandedChange={setThreadsExpanded}
            moreLabel="Show 20 more"
            historyLabel="Session history"
            profile={{ name: "Ada Okafor", meta: "Team" }}
            footerSlot={<ThemeToggle />}
          />
        </aside>

        {/* ------------------------------------------ the conversation */}
        <section className={styles.conversation} aria-label="Agent session">
          <div className={styles.conversationHeader}>
            <ChatHeader
              title={
                <h1 className={styles.sessionTitle}>
                  Fix the flaky upload spec
                </h1>
              }
              actions={
                <CircularButton
                  icon="code"
                  variant={workspaceOpen ? "secondary" : "tertiary"}
                  ariaLabel={
                    workspaceOpen
                      ? "Hide the coding panel"
                      : "Show the coding panel"
                  }
                  tooltipPosition="bottom"
                  onClick={() => setWorkspaceOpen((open) => !open)}
                />
              }
            />
          </div>

          {/* The scripted turns land whole rather than streaming in, so
              the send anchoring's reserved room below the newest turn
              would read as dead space; the thread scrolls plainly. */}
          <ChatThread className={styles.thread} anchor={false}>
            <ChatMessage role="user">
              The upload retry spec fails about one CI run in five. Find the
              race and fix it.
            </ChatMessage>

            <ChatMessage role="assistant">
              <div className={styles.turnStack}>
                <Reasoning duration={12} defaultOpen={false} size="compact">
                  {REASONING_TRACE}
                </Reasoning>
                <ToolCall
                  name="search"
                  summary="scheduleRetry in src/uploads"
                  status="success"
                  duration="0.3s"
                >
                  <CodeBlock
                    code={SEARCH_RESULT}
                    language="text"
                    showCopy={false}
                  />
                </ToolCall>
                <ToolCall
                  name="read_file"
                  summary="src/uploads/retry.ts"
                  status="success"
                  duration="0.2s"
                />
                <p className={styles.turnText}>{DIAGNOSIS}</p>
              </div>
            </ChatMessage>

            <ChatMessage role="assistant" grouped>
              <div className={styles.turnStack}>
                <AgentPlan steps={planSteps} />
                <p className={styles.turnText}>{PATCH_NOTE}</p>
                <InterruptCard
                  title="Apply the patch and re-run the suite?"
                  description="vitest run uploads, in the session sandbox. Review the staged diff first if you like."
                  options={[
                    {
                      value: "apply",
                      label: "Apply and re-run",
                      variant: "primary",
                    },
                    {
                      value: "hold",
                      label: "Hold the patch",
                      variant: "secondary",
                    },
                  ]}
                  value={decision}
                  onValueChange={setDecision}
                />
              </div>
            </ChatMessage>

            {decision && (
              <ChatMessage role="assistant">
                <div className={styles.turnStack}>
                  {applied && (
                    <ToolCall
                      name="run_tests"
                      summary="vitest run uploads"
                      status="success"
                      duration="41.2s"
                    />
                  )}
                  <p className={styles.turnText}>
                    {applied ? APPLY_REPLY : HOLD_REPLY}
                  </p>
                </div>
              </ChatMessage>
            )}

            {typedTurns.map((turn) => (
              <ChatMessage key={turn.id} role={turn.role}>
                {turn.text}
              </ChatMessage>
            ))}

            <div className={styles.statusRow}>
              <AgentStatus
                state={status.state}
                label={status.label}
                size="compact"
              />
            </div>
          </ChatThread>

          <div className={styles.composerBox}>
            <Composer
              ref={composerRef}
              aiGlow
              sendLabel="Send"
              placeholder="Steer the session"
              context="Working in parcel-api on fix/upload-retry"
              contextIcon="fork_right"
              actions={<ModelPicker models={MODELS} placement="top" />}
              value={value}
              onValueChange={setValue}
              onSubmit={(submitted) => {
                ask(submitted);
                setValue("");
              }}
            />
            <p className={styles.disclaimer}>
              A mock workbench: the session is scripted, and typed messages
              get a canned reply.
            </p>
          </div>
        </section>

        {/* --------------------------------------------- the workspace */}
        <div
          className={`${styles.workspaceRegion} ${
            workspaceOpen ? "" : styles.workspaceRegionClosed
          }`}
        >
          <section className={styles.workspace} aria-label="Workspace">
          <div className={styles.workspaceHeader}>
            <h2 className={styles.workspaceTitle}>Staged changes</h2>
            <Badge
              label={`${FILES.length} files`}
              variant={applied ? "positive" : "neutral"}
            />
            <div className={styles.workspaceSpacer} />
            <Button
              variant="secondary"
              size="compact"
              label="Open pull request"
              disabled={!applied}
            />
            <CircularButton
              icon={railOpen ? "right_panel_close" : "right_panel_open"}
              variant={railOpen ? "secondary" : "tertiary"}
              ariaLabel={
                railOpen ? "Hide the change details" : "Show the change details"
              }
              tooltipPosition="bottom"
              aria-expanded={railOpen}
              onClick={() => setRailOpen((open) => !open)}
            />
          </div>

          <div
            className={`${styles.workspaceBody} ${
              railOpen ? styles.workspaceBodyWithRail : ""
            }`}
          >
            <div className={styles.diffPane} ref={diffPaneRef}>
              {FILES.map((f) => (
                <div
                  key={f.path}
                  ref={(node) => {
                    fileRefs.current[f.path] = node;
                  }}
                  className={styles.diffFile}
                >
                  <CodeDiff diff={f.diff} filename={f.path} />
                </div>
              ))}
            </div>

            {railOpen && (
            <div className={styles.filesRail}>
              <span className={styles.railLabel}>Changed files</span>
              <TreeView
                nodes={TREE_NODES}
                defaultExpandedIds={FOLDER_IDS}
                selectedId={selectedFile}
                onSelect={selectFile}
              />
              <Divider />
              <span className={styles.railLabel}>Patch</span>
              <div className={styles.patchStats}>
                <Stat value={`+${ADDED}`} label="Lines added" trend="up" />
                <Stat
                  value={`-${REMOVED}`}
                  label="Lines removed"
                  trend="neutral"
                />
              </div>
              <Divider />
              <span className={styles.railLabel}>Checks</span>
              <ul className={styles.checkList}>
                {SETTLED_CHECKS.map((check) => (
                  <li key={check.id} className={styles.checkRow}>
                    <span className={styles.checkLabel}>{check.label}</span>
                    <span className={styles.checkDuration}>
                      {check.duration}
                    </span>
                    <Badge label="Passed" variant="positive" />
                  </li>
                ))}
                <li className={styles.checkRow}>
                  <span className={styles.checkLabel}>
                    Upload spec, 12 repeats
                  </span>
                  <span className={styles.checkDuration}>
                    {suiteCheck.duration ?? ""}
                  </span>
                  <Badge label={suiteCheck.text} variant={suiteCheck.badge} />
                </li>
              </ul>
              <Divider />
              <span className={styles.railLabel}>Spec duration</span>
              <Sparkline
                data={SPEC_DURATIONS}
                variant="area"
                showDot
                label="Upload spec duration over the last twelve runs, noisy"
                className={styles.sparkline}
              />
              <span className={styles.checkCaption}>
                Last 12 runs, seconds of wall clock
              </span>
              <Divider />
              <span className={styles.railLabel}>Session budget</span>
              <UsageCard
                bare
                items={[
                  {
                    label: "Context window",
                    value: 82,
                    max: 200,
                    valueText: "82k of 200k tokens",
                  },
                  {
                    label: "Daily runs",
                    value: 7,
                    max: 25,
                    valueText: "7 of 25",
                    resetLabel: "Resets at midnight",
                  },
                ]}
              />
            </div>
            )}
          </div>
          </section>
        </div>
      </div>
    </div>
  );
}
