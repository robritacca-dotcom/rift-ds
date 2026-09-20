"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { DocumentChip } from "@robr0/design-system/components/DocumentChip/DocumentChip";
import {
  ModelPicker,
  type ModelPickerModel,
} from "@robr0/design-system/components/ModelPicker/ModelPicker";
import {
  ThreadPanel,
  type ThreadPanelGroup,
  type ThreadPanelProject,
  type ThreadPanelThread,
} from "@robr0/design-system/components/ThreadPanel/ThreadPanel";
import { ThreadTabs } from "@robr0/design-system/components/ThreadTabs/ThreadTabs";
import { useSiteChat, useTakeoverViewport } from "@/components/SiteChat/ChatContext";
import { SiteChat } from "@/components/SiteChat/SiteChat";
import styles from "./ChatView.module.css";

/* The simulated composer's model list — set dressing for a generic product,
   so choosing one changes nothing but the pill. The default matches the
   label the live composer shows, so switching transports doesn't jump. */
const MOCK_MODELS: ModelPickerModel[] = [
  {
    label: "Sonnet 5",
    value: "sonnet-5",
    description: "Fast and capable, the everyday pick.",
    badge: "New",
  },
  {
    label: "Fable 5",
    value: "fable-5",
    description: "The deepest reasoning for hard questions.",
  },
  {
    label: "Haiku 4.5",
    value: "haiku-4-5",
    description: "Instant answers for quick lookups.",
  },
];

export type TransportMode = "live" | "sim";
type ResizeAxis = "x" | "y" | "both";

/* The staged product's chat history — the seed the simulation starts
   from. Unlike the mock models it is live state: New chat prepends an
   unnamed thread, the first utterance sent in it starts the naming
   shimmer (a title is generated from the conversation, so there is
   nothing to name before one exists), and the overflow menu renames and
   deletes. All of it lives in this component's state, so it dies with
   the playground session — nothing persists. */
/* Pinned threads live in their own leading group; a fresh thread is born
   into the home group, and unpinning returns a thread to its top. The
   panel only marks the rows — the grouping is this component's job. */
const PINNED_GROUP = "Pinned";
const HOME_GROUP = "This week";

const INITIAL_THREAD_GROUPS: ThreadPanelGroup[] = [
  {
    label: PINNED_GROUP,
    threads: [
      {
        id: "pricing",
        title: "Compare the plan limits",
        description: "Annual pricing options",
        pinned: true,
        meta: "2d",
      },
    ],
  },
  {
    label: HOME_GROUP,
    threads: [
      {
        id: "launch",
        title: "Plan the launch week",
        description: "Waiting on the beta invite list",
        unread: true,
        icon: "cloud",
        meta: "32m",
      },
      {
        id: "onboarding",
        title: "Rework the onboarding email",
        description: "Draft shared with the team",
        icon: "cloud",
        meta: "2h",
      },
    ],
  },
  {
    label: "Earlier",
    threads: [
      { id: "import", title: "Import last year's invoices", meta: "4d" },
      { id: "roles", title: "Set up roles for the team", meta: "5d" },
      {
        id: "notify",
        title: "Quiet the mention notifications",
        unread: true,
        meta: "1w",
      },
    ],
  },
];

/* The staged product's projects, seeded like the history and just as
   mortal: selecting moves the pill, the header's plus mints a new row. */
const INITIAL_PROJECTS: ThreadPanelProject[] = [
  { id: "workspace-revamp", label: "Workspace revamp", meta: "1m" },
  { id: "billing-cleanup", label: "Billing cleanup", meta: "3d" },
];

/* The names the simulated "title generation" hands out, in order, when a
   new chat's shimmer resolves; the pool cycles past the end. */
const SIM_THREAD_NAMES = [
  "Plan the beta invite list",
  "Summarize the weekly standup",
  "Draft the pricing FAQ",
  "Tidy up the workspace roles",
  "Sketch the renewal email",
];

/* How long the shimmer runs after the first utterance before the name
   "arrives" — paced like a fast title-generation call, not a UI
   transition, so it is a simulation schedule rather than a motion token. */
const THREAD_NAMING_DELAY_MS = 1600;

/* Every thread's overflow menu: rename swaps the row to the panel's
   inline editor, delete removes it. Pin/unpin is prepended per thread at
   render time, since its label flips with the row's pinned flag. */
const THREAD_ACTIONS = [
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "delete", label: "Delete", icon: "delete", destructive: true },
];

/* Review targets, not layout tokens. Two footprints are enough: the
   desktop card, which rests filling the stage's safe zone (its size
   derives from the available space; w/h here are only the drag baseline
   the type shares), and the mobile preset — a real phone viewport
   rendered edge-to-edge in a bezel, the presentation a phone visitor
   actually gets (the site panel drops its card chrome below 720px). */
export const STAGE_SIZES = {
  desktop: { label: "Desktop", w: 880, h: 956, device: false, notch: false },
  mobile: { label: "Mobile (390px)", w: 390, h: 844, device: true, notch: true },
} as const;
export type StageSize = keyof typeof STAGE_SIZES;

export interface ChatViewProps {
  /** The widget's header brand — follows the Product name lever. */
  title: string;
  /** The review footprint: desktop as a resizable card, mobile in a bezel. */
  size: StageSize;
  /** The composer's placeholder copy; empty falls back to "Ask anything". */
  placeholder: string;
  /** Show the conversation starters on the welcome screen. */
  showStarters: boolean;
  /** The dragged size, held by the page so it survives a switch to the
      Components view and back — and dies with the playground, like every
      other lever. */
  manual: { w?: number; h?: number };
  /** Reports a drag's partial size; the page merges it functionally. */
  onManual: (next: { w?: number; h?: number }) => void;
  /** The takeover is a desktop affordance — compact screens are already
      edge-to-edge, so the page withholds it there. */
  allowFullscreen: boolean;
  /** The Simulated transport is active: the composer swaps the site's live
      model picker for the mock picker and the attach button. */
  simControls: boolean;
  /** Stage the projects section in the threads rail. */
  railProjects: boolean;
  /** Stage the pinned-threads group and the pin/unpin row action; off, the
      pinned threads fold back into the home group. */
  railPins: boolean;
  /** Stage the rows' detail anatomy (description, unread dot, session
      glyph, meta); off, the rows are bare titles like the live site's. */
  railDetails: boolean;
  /** Stage the open-sessions tab strip across the conversation's top. */
  railTabs: boolean;
}

/**
 * The Chat view: the site's chat widget on a stage, re-themed by the same
 * levers as everything else. The provider lives up in the page now, wrapped
 * around the whole layout, so the event rail and the compact Drawer can
 * direct the same conversation the stage renders — and the transcript
 * survives a switch to the Components view and back. The widget's title
 * follows the Product name lever and its copy is deliberately generic —
 * the stage shows a consumer's product, not the site's own assistant.
 */
export default function ChatView({
  title,
  size,
  placeholder,
  showStarters,
  manual,
  onManual,
  allowFullscreen,
  simControls,
  railProjects,
  railPins,
  railDetails,
  railTabs,
}: ChatViewProps) {
  const {
    open,
    setOpen,
    view,
    returnFocusRef,
    send,
    streaming,
    reset,
    turns,
    live,
  } = useSiteChat();

  /* The simulated history's own state: the threads themselves, which one
     wears the pill, which one is mid-rename, and whether the wide-mode
     rail is expanded. All of it dies with the playground — the session is
     the only cache. Nothing starts selected: the stage opens on the
     greeting screen, and a greeting has no thread to stand for. */
  const [threadGroups, setThreadGroups] = useState(INITIAL_THREAD_GROUPS);
  const [activeThread, setActiveThread] = useState("");
  const [renamingThread, setRenamingThread] = useState<string | null>(null);
  const [railExpanded, setRailExpanded] = useState(true);

  /* The staged projects and the strip of open sessions. Tabs hold thread
     ids: selecting a thread opens (or revisits) its tab, a fresh thread
     arrives with one, and closing the last tab returns to the greeting.
     Purely visual staging — switching tabs moves the selection, never the
     transcript, the same contract as selecting a thread in the rail. */
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState(INITIAL_PROJECTS[0].id);
  const projectSeq = useRef(0);
  const [openTabs, setOpenTabs] = useState<string[]>([]);

  /* The naming simulation's clockwork: a sequence for fresh ids, a cursor
     into the name pool, and the pending timers so deleting a still-naming
     thread (or leaving the view) cancels its reveal. */
  const threadSeq = useRef(0);
  const nameCursor = useRef(0);
  const namingTimers = useRef(new Map<string, number>());
  useEffect(() => {
    const timers = namingTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  /* A thread is born from the first utterance, not from the New chat
     button: the row lands at the top already shimmering, and its "AI
     title" arrives a beat later. */
  const beginThread = useCallback(() => {
    threadSeq.current += 1;
    const id = `new-${threadSeq.current}`;
    setThreadGroups((groups) =>
      groups.map((group) =>
        group.label === HOME_GROUP
          ? {
              ...group,
              threads: [
                { id, title: "New chat", pending: true },
                ...group.threads,
              ],
            }
          : group
      )
    );
    setActiveThread(id);
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
    const timer = window.setTimeout(() => {
      namingTimers.current.delete(id);
      const title =
        SIM_THREAD_NAMES[nameCursor.current % SIM_THREAD_NAMES.length];
      nameCursor.current += 1;
      setThreadGroups((groups) =>
        groups.map((group) => ({
          ...group,
          threads: group.threads.map((thread) =>
            thread.id === id ? { id, title } : thread
          ),
        }))
      );
    }, THREAD_NAMING_DELAY_MS);
    namingTimers.current.set(id, timer);
  }, []);

  /* One rule keeps every entry point honest: no utterance means no active
     thread. The greeting screen deselects the rail whether it arrived via
     the panel's New chat, the header's pen, the director's reset, or a
     deleted thread — and the first utterance sent with nothing selected
     is what creates the pending row above. Transition-guarded so merely
     selecting a thread while the greeting shows keeps its pill. */
  const hasUtterance = turns.length > 0 || live !== null;
  const hadUtteranceRef = useRef(hasUtterance);
  const birthingRef = useRef(false);
  useEffect(() => {
    const had = hadUtteranceRef.current;
    hadUtteranceRef.current = hasUtterance;
    if (hasUtterance && activeThread === "") {
      if (!birthingRef.current) {
        birthingRef.current = true;
        beginThread();
      }
    } else {
      birthingRef.current = false;
      if (!hasUtterance && had && activeThread !== "") {
        setActiveThread("");
        setRenamingThread(null);
      }
    }
  }, [hasUtterance, activeThread, beginThread]);

  const startNewChat = () => {
    reset();
    setActiveThread("");
    setRenamingThread(null);
  };

  const deleteThread = (id: string) => {
    const timer = namingTimers.current.get(id);
    if (timer != null) {
      clearTimeout(timer);
      namingTimers.current.delete(id);
    }
    setThreadGroups((groups) =>
      groups.map((group) => ({
        ...group,
        threads: group.threads.filter((thread) => thread.id !== id),
      }))
    );
    setOpenTabs((tabs) => tabs.filter((tab) => tab !== id));
    if (renamingThread === id) setRenamingThread(null);
    if (activeThread === id) {
      /* The open conversation went with its thread: back to the greeting,
         nothing selected. */
      setActiveThread("");
      reset();
    }
  };

  /* Selecting a thread — from the rail or its tab — moves the pill, opens
     (or revisits) the session's tab, and clears the row's unread dot. */
  const selectThread = useCallback((id: string) => {
    setActiveThread(id);
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
    setThreadGroups((groups) =>
      groups.map((group) => ({
        ...group,
        threads: group.threads.map((thread) =>
          thread.id === id && thread.unread
            ? { ...thread, unread: undefined }
            : thread
        ),
      }))
    );
  }, []);

  /* Closing a tab closes the session view, never the thread: the history
     keeps the row. Closing the active tab moves to a neighbour; closing
     the last one returns to the greeting. */
  const closeTab = (id: string) => {
    const index = openTabs.indexOf(id);
    setOpenTabs((tabs) => tabs.filter((tab) => tab !== id));
    if (activeThread === id) {
      const neighbour = openTabs[index + 1] ?? openTabs[index - 1];
      if (neighbour) setActiveThread(neighbour);
      else startNewChat();
    }
  };

  /* Pinning moves the thread into the leading Pinned group; unpinning
     returns it to the top of the home group. */
  const togglePin = (id: string) => {
    setThreadGroups((groups) => {
      let moved: ThreadPanelThread | undefined;
      let wasPinned = false;
      const stripped = groups.map((group) => ({
        ...group,
        threads: group.threads.filter((thread) => {
          if (thread.id !== id) return true;
          moved = thread;
          wasPinned = Boolean(thread.pinned);
          return false;
        }),
      }));
      const taken = moved as ThreadPanelThread | undefined;
      if (!taken) return groups;
      return stripped.map((group) => {
        if (!wasPinned && group.label === PINNED_GROUP) {
          return {
            ...group,
            threads: [...group.threads, { ...taken, pinned: true }],
          };
        }
        if (wasPinned && group.label === HOME_GROUP) {
          return {
            ...group,
            threads: [{ ...taken, pinned: undefined }, ...group.threads],
          };
        }
        return group;
      });
    });
  };

  const createProject = () => {
    projectSeq.current += 1;
    const id = `project-${projectSeq.current}`;
    setProjects((list) => [
      ...list,
      { id, label: `New project ${projectSeq.current}`, meta: "now" },
    ]);
    setActiveProject(id);
  };

  /* The rail's render shape follows the feature levers: pins off folds the
     Pinned group back into the home group, details off strips the rows to
     bare titles (the live site's look), and each row's menu leads with pin
     or unpin — the label following the flag — only while pins are staged. */
  const groupsForPanel = useMemo(() => {
    let groups = threadGroups;
    if (!railPins) {
      const pinned =
        groups.find((group) => group.label === PINNED_GROUP)?.threads ?? [];
      groups = groups
        .filter((group) => group.label !== PINNED_GROUP)
        .map((group) =>
          group.label === HOME_GROUP
            ? {
                ...group,
                threads: [
                  ...pinned.map((thread) => ({ ...thread, pinned: undefined })),
                  ...group.threads,
                ],
              }
            : group
        );
    }
    return groups.map((group) => ({
      ...group,
      threads: group.threads.map((thread) => {
        const shaped = railDetails
          ? thread
          : {
              ...thread,
              description: undefined,
              unread: undefined,
              icon: undefined,
              meta: undefined,
            };
        return {
          ...shaped,
          actions: railPins
            ? [
                {
                  id: "pin",
                  label: thread.pinned ? "Unpin" : "Pin",
                  icon: "keep",
                },
                ...THREAD_ACTIONS,
              ]
            : THREAD_ACTIONS,
        };
      }),
    }));
  }, [threadGroups, railPins, railDetails]);

  /* The strip's tabs resolve live from the history, so a rename or the
     naming shimmer's reveal flows straight into the label. */
  const threadById = useMemo(() => {
    const map = new Map<string, ThreadPanelThread>();
    for (const group of threadGroups) {
      for (const thread of group.threads) map.set(thread.id, thread);
    }
    return map;
  }, [threadGroups]);

  const tabItems = useMemo(
    () =>
      openTabs.flatMap((id) => {
        const thread = threadById.get(id);
        return thread
          ? [
              {
                id,
                label: thread.title,
                icon: "chat_bubble",
                unread: railDetails ? thread.unread : undefined,
              },
            ]
          : [];
      }),
    [openTabs, threadById, railDetails]
  );

  const renameThread = (id: string, title: string) => {
    setThreadGroups((groups) =>
      groups.map((group) => ({
        ...group,
        threads: group.threads.map((thread) =>
          thread.id === id ? { ...thread, title } : thread
        ),
      }))
    );
    setRenamingThread(null);
  };
  /* A real phone viewport: the stage-size lever is hidden there and the
     widget goes fluid, so the preset alone cannot say it is a phone. */
  const phoneViewport = useTakeoverViewport();

  /* The provider defaults to closed (the site's resting state); the view
     exists to look at the widget, so it opens on arrival. */
  useEffect(() => {
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Closing hands focus to the launcher so the keyboard never lands on
     <body>. Opening is handled inside SiteChat (composer focus). */
  const launcherRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  useEffect(() => {
    if (!open) launcherRef.current?.focus();
  }, [open]);

  /* ---------- manual resize via the edge handles ----------
     The stage centres the widget, so a drag moves both opposing edges —
     deltas are doubled to keep the grabbed edge under the cursor. Sizes
     are clamped by the CSS min/max. */
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    axis: ResizeAxis;
    xSign: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);
  const [resizing, setResizing] = useState(false);

  const beginResize = (e: React.PointerEvent<HTMLDivElement>) => {
    // Primary button only, one drag at a time — a second concurrent
    // pointer must not hijack an in-flight drag's baseline.
    if ((e.pointerType === "mouse" && e.button !== 0) || dragRef.current) return;
    const axis = e.currentTarget.dataset.axis as ResizeAxis;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!axis || !rect) return;
    dragRef.current = {
      axis,
      // Dragging the left edge outward means a negative pointer delta.
      xSign: e.currentTarget.dataset.edge === "left" ? -1 : 1,
      startX: e.clientX,
      startY: e.clientY,
      width: rect.width,
      height: rect.height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  };

  /* The stage centres the widget, so a drag moves both opposing edges;
     doubling the delta keeps the grabbed edge under the cursor. */
  const CENTERED_DRAG_FACTOR = 2;

  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const next: { w?: number; h?: number } = {};
    if (drag.axis !== "y")
      next.w = Math.round(
        drag.width + (e.clientX - drag.startX) * CENTERED_DRAG_FACTOR * drag.xSign
      );
    if (drag.axis !== "x")
      next.h = Math.round(drag.height + (e.clientY - drag.startY) * CENTERED_DRAG_FACTOR);
    onManual(next);
  };

  const endResize = () => {
    dragRef.current = null;
    setResizing(false);
  };

  /* The devtools-style readout: the widget's actual rendered size while a
     grip is being dragged — the rect, not the requested size, so the CSS
     clamps are visible the moment a drag hits one. */
  const [readout, setReadout] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!resizing) return;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) setReadout({ w: Math.round(rect.width), h: Math.round(rect.height) });
  }, [manual, resizing]);

  const preset = STAGE_SIZES[size];
  const isDevice = preset.device;
  const isCompact = preset.w < 500;
  /* The takeover: SiteChat's own expand button drives the view; the stage
     just dresses the widget as a full-viewport surface while it lasts. */
  const isFull = allowFullscreen && !isDevice && view === "full";

  /* ---------- the takeover glide (the live panel's animation) ----------
     The site panel glides because it is always fixed — only animatable
     properties change. The stage widget is in-flow, so the same feel
     needs a FLIP: pin the card as fixed at its current rect, let the
     transition carry it to the viewport, and reverse on the way out. A
     spacer holds the card's slot meanwhile, and is also the measured
     return target, so a scroll during fullscreen can't strand the card. */
  type FullPhase = "closed" | "pinned" | "open" | "closing";
  const [fullPhase, setFullPhase] = useState<FullPhase>("closed");
  /* State, not a ref: the rect is read during render (the pinned style,
     the spacer's footprint), and it only changes at phase transitions. */
  const [flipRect, setFlipRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);

  /* The phase machine reacts to the context's view flipping, and each
     step must measure the DOM the previous step produced. */
  useLayoutEffect(() => {
    if (isFull && fullPhase === "closed") {
      const r = widgetRef.current?.getBoundingClientRect();
      if (r) setFlipRect({ x: r.x, y: r.y, w: r.width, h: r.height });
      setFullPhase("pinned");
    } else if (!isFull && (fullPhase === "open" || fullPhase === "pinned")) {
      const r = spacerRef.current?.getBoundingClientRect();
      if (r) setFlipRect({ x: r.x, y: r.y, w: r.width, h: r.height });
      setFullPhase("closing");
    }
  }, [isFull, fullPhase]);

  /* Two frames between pin and release, so the transition has a starting
     geometry to leave from. */
  useEffect(() => {
    if (fullPhase !== "pinned") return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setFullPhase("open"))
    );
    return () => cancelAnimationFrame(raf);
  }, [fullPhase]);

  /* The glide home ends on transitionend; the timeout is the reduced-motion
     fallback (zeroed durations fire no event). */
  useEffect(() => {
    if (fullPhase !== "closing") return;
    const el = widgetRef.current;
    const done = () => setFullPhase("closed");
    el?.addEventListener("transitionend", done, { once: true });
    const fallback = setTimeout(done, 600);
    return () => {
      el?.removeEventListener("transitionend", done);
      clearTimeout(fallback);
    };
  }, [fullPhase]);

  const takeover = fullPhase !== "closed";
  const pinnedStyle =
    (fullPhase === "pinned" || fullPhase === "closing") && flipRect
      ? {
          top: flipRect.y,
          left: flipRect.x,
          width: flipRect.w,
          height: flipRect.h,
        }
      : undefined;

  const widgetEl = (
    <div
      ref={widgetRef}
      className={[
        styles.widget,
        isDevice ? styles.widgetDevice : "",
        /* Resting sizes stay fitted to the column and viewport; a manual
           drag drops the matching clamp so the card can grow past both —
           the workspace edge is the one wall that remains. The takeover
           carries no fit clamps at all, or they would cap it. */
        !takeover && !isDevice && manual.w == null ? styles.widgetFitW : "",
        !takeover && !isDevice && manual.h == null ? styles.widgetFitH : "",
        takeover ? styles.widgetFull : "",
      ]
        .filter(Boolean)
        .join(" ")}
      /* Pinned phases hold the card's rect so the glide has somewhere to
         start and land; open lets the class's viewport geometry rule; in
         device mode the screen wrapper owns the size. Otherwise only a
         manual drag sizes the card inline — at rest the fit classes derive
         its size from the stage's available space, with the CSS clamps
         over both. */
      style={
        takeover
          ? pinnedStyle
          : isDevice
            ? undefined
            : { width: manual.w, height: manual.h }
      }
    >
      <SiteChat
        fullscreenEnabled={allowFullscreen && !isDevice}
        compact={isCompact}
        /* The bezel previews a phone, and a phone is one: both get the
           stacked welcome the site's takeover shows. */
        phone={isDevice || phoneViewport}
        title={title}
        placeholder={placeholder.trim() === "" ? "Ask anything" : placeholder}
        showStarters={showStarters}
        /* No site mark on a generic product's chat. */
        logo={null}
        tagline="How can we help you today?"
        /* The staged product's chat history: ThreadPanel shaped per context
           by the render prop — the slide-over sheet names the product and
           skips the collapse (the scrim is its dismissal), while the wide
           inline rail skips the brand (the chat header already says it)
           and offers AppSidebar's collapse instead. The history itself is
           the simulated lifecycle above: New chat shimmers until its name
           arrives, and the overflow menu renames inline and deletes.
           Simulated-transport set dressing like the mock picker: on Live
           the threads stand down and the widget reverts to the site's
           classic look. */
        threads={simControls ? ({ overlay, close }) => (
          <ThreadPanel
            groups={groupsForPanel}
            activeThreadId={activeThread}
            onThreadSelect={(id) => {
              selectThread(id);
              close();
            }}
            threadActions={THREAD_ACTIONS}
            onThreadAction={(threadId, actionId) => {
              if (actionId === "rename") setRenamingThread(threadId);
              else if (actionId === "delete") deleteThread(threadId);
              else if (actionId === "pin") togglePin(threadId);
            }}
            renamingThreadId={renamingThread ?? undefined}
            onThreadRename={renameThread}
            onRenameCancel={() => setRenamingThread(null)}
            newThreadLabel="New chat"
            onNewThread={() => {
              startNewChat();
              close();
            }}
            historyLabel="Chat history"
            projects={railProjects ? projects : undefined}
            activeProjectId={activeProject}
            onProjectSelect={(id) => {
              setActiveProject(id);
              close();
            }}
            onProjectCreate={railProjects ? createProject : undefined}
            /* The brand row's logo mark, in both modes; the staged
               product's is a neutral disc (a real host would put its own
               mark here, the way the workbench template seats the R
               logo). Collapsed, it doubles as the expand button. */
            logo={<span className={styles.threadsLogoDot} />}
            logoText={overlay ? title : undefined}
            expanded={overlay ? true : railExpanded}
            onExpandedChange={overlay ? undefined : setRailExpanded}
            profile={
              overlay ? undefined : { name: "Jordan Reyes", meta: "Pro" }
            }
          />
        ) : undefined}
        tabs={
          /* The strip of open sessions, staged like the rail: desktop card
             only (the bezel and a real phone keep the plain header), and
             tabs hold thread ids — selecting a thread opens its tab, the
             trailing plus is the same New chat as everywhere else, and
             closing the last tab lands back on the greeting. The strip
             stands down while nothing is open: a bare plus over the
             greeting would be the header's pen restated. */
          simControls &&
          railTabs &&
          !isDevice &&
          !phoneViewport &&
          tabItems.length > 0 ? (
            <ThreadTabs
              tabs={tabItems}
              activeId={activeThread || undefined}
              onTabSelect={selectThread}
              onTabClose={closeTab}
              onAdd={startNewChat}
              addLabel="New chat"
              closeLabel="Close chat"
              ariaLabel="Open chats"
            />
          ) : undefined
        }
        starters={[
          { id: "start", label: "How do I get started?" },
          { id: "pricing", label: "What do the plans include?" },
          { id: "invite", label: "Invite my team to a workspace" },
        ]}
        composerActions={
          simControls ? (
            <>
              {/* The attach button stages a file exactly the way the
                  director's doc-drop event does — everything on this stage
                  is simulated, so the click skips the picker and sends the
                  attachment through the sim story: the chip rides the
                  visitor's bubble, and the agent answers by reading the
                  doc and charting its budget. */}
              <CircularButton
                icon="add"
                variant="tertiary"
                ariaLabel="Attach a file"
                disabled={streaming}
                onClick={() =>
                  send("Here is the launch plan we are working from.", {
                    content: (
                      <DocumentChip
                        name="Q3 launch plan.pdf"
                        fileType="pdf"
                        meta="1.2 MB"
                      />
                    ),
                  })
                }
              />
              {/* Working mock: the panel opens and the pill follows the
                  choice, but nothing routes anywhere — the sim script is
                  the sim script whatever the pill says. */}
              <ModelPicker models={MOCK_MODELS} placement="top" />
            </>
          ) : undefined
        }
      />
    </div>
  );

  return (
    <div className={styles.stage}>
      {open ? (
        <div className={`${styles.widgetFrame} ${resizing ? styles.resizing : ""}`}>
          {/* Holds the card's slot while the widget is off being the
              takeover — the stage doesn't collapse, and coming back has a
              measurable target. */}
          {takeover && (
            <div
              ref={spacerRef}
              className={styles.spacer}
              style={{ width: flipRect?.w, height: flipRect?.h }}
              aria-hidden="true"
            />
          )}
          {isDevice ? (
            <div className={styles.deviceShell}>
              {/* The screen: OS chrome above and below the widget, one
                  glass surface behind all three. The strips are set
                  dressing — hidden from the tree like the grips. */}
              <div
                className={styles.deviceScreen}
                style={{ width: preset.w, height: preset.h }}
              >
                <div className={styles.statusBar} aria-hidden="true">
                  <span className={styles.statusTime}>9:41</span>
                  {preset.notch && <span className={styles.dynamicIsland} />}
                  <span className={styles.statusIcons}>
                    <span className="material-symbols-rounded">
                      signal_cellular_alt
                    </span>
                    <span className="material-symbols-rounded">wifi</span>
                    <span className="material-symbols-rounded">battery_full</span>
                  </span>
                </div>
                {widgetEl}
                <div className={styles.homeBar} aria-hidden="true">
                  <span className={styles.homeIndicator} />
                </div>
              </div>
            </div>
          ) : (
            widgetEl
          )}

          {/* Resize grips — review tooling, straddling the widget edges so
              they stay clear of the thread's scrollbar. Mouse-driven only;
              the device presets are fixed hardware sizes, so the grips
              disappear there. pointercancel ends a drag too, or an
              interrupted drag would leave transitions and text selection
              disabled. */}
          {!isDevice &&
            fullPhase === "closed" &&
            (
              [
                { cls: styles.handleLeft, axis: "x", edge: "left" },
                { cls: styles.handleRight, axis: "x", edge: undefined },
                { cls: styles.handleBottom, axis: "y", edge: undefined },
                { cls: styles.handleCorner, axis: "both", edge: undefined },
              ] as const
            ).map(({ cls, axis, edge }) => (
              <div
                key={axis + (edge ?? "")}
                className={`${styles.handle} ${cls}`}
                aria-hidden="true"
                data-axis={axis}
                data-edge={edge}
                onPointerDown={beginResize}
                onPointerMove={moveResize}
                onPointerUp={endResize}
                onPointerCancel={endResize}
              />
            ))}

          {resizing && readout && (
            <div className={styles.sizeReadout} aria-hidden="true">
              {readout.w} &times; {readout.h}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.launcher}>
          <AiButton
            ref={launcherRef}
            label={`Ask ${title}`}
            icon="forum"
            aria-expanded={false}
            onClick={() => {
              returnFocusRef.current = null;
              setOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
