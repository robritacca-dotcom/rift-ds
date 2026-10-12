'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ThreadPanelGroup,
  ThreadPanelProject,
  ThreadPanelThread,
  ThreadPanelThreadAction,
} from '../components/ThreadPanel/ThreadPanel';
import type { ThreadTab } from '../components/ThreadTabs/ThreadTabs';
import type { ChatState } from './useChat';

/* ============================================
   The thread lifecycle.

   The widget's history rail and tab strip are visual staging over this
   state machine: a thread is born from the first utterance (not from the
   New chat button), lands at the top of the home group already shimmering,
   and gets its name a beat later; the overflow menu renames inline, deletes,
   and pins (which moves the row into the leading Pinned group); tabs hold
   thread ids, a fresh thread arrives with one, and closing the last tab
   returns to the greeting. One rule keeps every entry point honest: no
   utterance means no active thread.

   Switching a thread or a tab moves the selection, never the transcript:
   the widget shows one conversation, and the rail says which the visitor
   is "in". A host that keeps real conversations per thread wires the
   callbacks below to its own store.
   ============================================ */

/**
 * How long the shimmer runs after the first utterance before the name
 * "arrives". Paced like a fast title-generation call, not a UI transition,
 * so it is a schedule rather than a motion token.
 */
export const THREAD_NAMING_DELAY_MS = 1600;

export interface ThreadsOptions {
  /** The history to start from. The groups' labels are the host's. */
  groups?: ThreadPanelGroup[];
  /** The projects section, when the rail shows one. */
  projects?: ThreadPanelProject[];
  /** The group pinned threads move into. Created on first pin when absent. */
  pinnedGroup?: string;
  /** The group a new thread is born into. Defaults to the first non-pinned group. */
  homeGroup?: string;
  /**
   * The name a new thread gets once its shimmer resolves. Called with the
   * thread's ordinal; a host with a real title generator returns a promise.
   */
  nameThread?: (index: number) => string | Promise<string>;
  /** How long the naming shimmer runs. */
  namingDelayMs?: number;
  /** Offer pin and unpin in each row's menu, and keep the pinned group. */
  pins?: boolean;
  /** Keep each row's detail anatomy (description, status, icon, meta). Off strips rows to bare titles. */
  details?: boolean;
  /** The label of the New chat row and tab. */
  newThreadLabel?: string;
  /** Called when a thread is selected, so a host can load its conversation. */
  onSelect?: (threadId: string) => void;
  onRename?: (threadId: string, title: string) => void;
  onDelete?: (threadId: string) => void;
  onPin?: (threadId: string, pinned: boolean) => void;
}

/** The thread lifecycle, shaped for ThreadPanel and ThreadTabs. */
export interface ThreadsState {
  /** The groups to hand ThreadPanel, shaped by the pins and details options. */
  groups: ThreadPanelGroup[];
  /** The selected thread, or '' on the greeting screen. */
  activeThreadId: string;
  /** Select a thread (and open its tab). */
  select: (threadId: string) => void;
  /** Back to the greeting: resets the conversation and deselects. */
  startNew: () => void;
  remove: (threadId: string) => void;
  rename: (threadId: string, title: string) => void;
  togglePin: (threadId: string) => void;
  /** The thread whose row is showing the inline rename editor. */
  renamingId: string | null;
  setRenamingId: (threadId: string | null) => void;
  /** Each row's overflow menu: pin or unpin (when pins are on), rename, delete. */
  actionsFor: (thread: ThreadPanelThread) => ThreadPanelThreadAction[];
  /** Run a row action by id: 'pin', 'rename' or 'delete'. */
  runAction: (threadId: string, actionId: string) => void;
  projects: ThreadPanelProject[];
  activeProjectId: string | undefined;
  selectProject: (projectId: string) => void;
  createProject: () => void;
  /** The open sessions, for ThreadTabs. Resolved live from the groups. */
  tabs: ThreadTab[];
  closeTab: (threadId: string) => void;
  newThreadLabel: string;
}

const RENAME_ACTION: ThreadPanelThreadAction = { id: 'rename', label: 'Rename', icon: 'edit' };
const DELETE_ACTION: ThreadPanelThreadAction = {
  id: 'delete',
  label: 'Delete',
  icon: 'delete',
  destructive: true,
};

const DEFAULT_NAMES = ['New conversation'];

/**
 * The thread lifecycle over a conversation. `chat` is the state from
 * `useChat` (the provider passes its own); the hook watches whether the
 * conversation has an utterance to decide when a thread is born and when
 * the selection clears.
 */
export function useThreads(
  chat: Pick<ChatState, 'turns' | 'live' | 'reset'>,
  options: ThreadsOptions = {}
): ThreadsState {
  const {
    pins = true,
    details = true,
    namingDelayMs = THREAD_NAMING_DELAY_MS,
    newThreadLabel = 'New chat',
    pinnedGroup = 'Pinned',
    onSelect,
    onRename,
    onDelete,
    onPin,
  } = options;
  const nameThreadOption = options.nameThread;
  const nameThread = useMemo(
    () => nameThreadOption ?? ((index: number) => DEFAULT_NAMES[index % DEFAULT_NAMES.length]),
    [nameThreadOption]
  );
  const initialGroups = options.groups ?? [];
  const homeGroup =
    options.homeGroup ??
    initialGroups.find((group) => group.label !== pinnedGroup)?.label ??
    'Recent';

  const [groups, setGroups] = useState<ThreadPanelGroup[]>(initialGroups);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ThreadPanelProject[]>(options.projects ?? []);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(
    options.projects?.[0]?.id
  );
  const [openTabs, setOpenTabs] = useState<string[]>([]);

  /* The naming simulation's clockwork: a sequence for fresh ids, a cursor
     into the name source, and the pending timers so deleting a still-naming
     thread (or unmounting) cancels its reveal. */
  const threadSeq = useRef(0);
  const nameCursor = useRef(0);
  const projectSeq = useRef(0);
  const namingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const timers = namingTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const updateThread = useCallback(
    (id: string, patch: (thread: ThreadPanelThread) => ThreadPanelThread) => {
      setGroups((current) =>
        current.map((group) => ({
          ...group,
          threads: group.threads.map((thread) => (thread.id === id ? patch(thread) : thread)),
        }))
      );
    },
    []
  );

  /* A thread is born from the first utterance: the row lands at the top of
     the home group already shimmering, and its title arrives a beat later. */
  const beginThread = useCallback(() => {
    threadSeq.current += 1;
    const id = `thread-${threadSeq.current}`;
    setGroups((current) => {
      const hasHome = current.some((group) => group.label === homeGroup);
      const withHome = hasHome ? current : [...current, { label: homeGroup, threads: [] }];
      return withHome.map((group) =>
        group.label === homeGroup
          ? { ...group, threads: [{ id, title: newThreadLabel, pending: true }, ...group.threads] }
          : group
      );
    });
    setActiveThreadId(id);
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
    const ordinal = nameCursor.current;
    nameCursor.current += 1;
    const timer = setTimeout(async () => {
      namingTimers.current.delete(id);
      const title = await nameThread(ordinal);
      updateThread(id, () => ({ id, title }));
    }, namingDelayMs);
    namingTimers.current.set(id, timer);
  }, [homeGroup, nameThread, namingDelayMs, newThreadLabel, updateThread]);

  /* No utterance means no active thread. The greeting screen deselects the
     rail whether it arrived via New chat, a reset, or a deleted thread, and
     the first utterance sent with nothing selected is what creates the
     pending row. Transition-guarded so merely selecting a thread while the
     greeting shows keeps its pill. */
  const hasUtterance = chat.turns.length > 0 || chat.live !== null;
  const hadUtteranceRef = useRef(hasUtterance);
  const birthingRef = useRef(false);
  useEffect(() => {
    const had = hadUtteranceRef.current;
    hadUtteranceRef.current = hasUtterance;
    if (hasUtterance && activeThreadId === '') {
      if (!birthingRef.current) {
        birthingRef.current = true;
        beginThread();
      }
    } else {
      birthingRef.current = false;
      if (!hasUtterance && had && activeThreadId !== '') {
        setActiveThreadId('');
        setRenamingId(null);
      }
    }
  }, [hasUtterance, activeThreadId, beginThread]);

  const { reset } = chat;
  const startNew = useCallback(() => {
    reset();
    setActiveThreadId('');
    setRenamingId(null);
  }, [reset]);

  /* Selecting a thread, from the rail or its tab, moves the pill, opens (or
     revisits) the session's tab, and settles an unread row to idle. */
  const select = useCallback(
    (id: string) => {
      setActiveThreadId(id);
      setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
      updateThread(id, (thread) =>
        thread.status === 'unread' ? { ...thread, status: 'idle' } : thread
      );
      onSelect?.(id);
    },
    [onSelect, updateThread]
  );

  const remove = useCallback(
    (id: string) => {
      const timer = namingTimers.current.get(id);
      if (timer != null) {
        clearTimeout(timer);
        namingTimers.current.delete(id);
      }
      setGroups((current) =>
        current.map((group) => ({
          ...group,
          threads: group.threads.filter((thread) => thread.id !== id),
        }))
      );
      setOpenTabs((tabs) => tabs.filter((tab) => tab !== id));
      setRenamingId((renaming) => (renaming === id ? null : renaming));
      if (activeThreadId === id) {
        /* The open conversation went with its thread: back to the greeting. */
        setActiveThreadId('');
        reset();
      }
      onDelete?.(id);
    },
    [activeThreadId, onDelete, reset]
  );

  const rename = useCallback(
    (id: string, title: string) => {
      updateThread(id, (thread) => ({ ...thread, title }));
      setRenamingId(null);
      onRename?.(id, title);
    },
    [onRename, updateThread]
  );

  /* Pinning moves the thread into the leading Pinned group; unpinning
     returns it to the top of the home group. */
  const togglePin = useCallback(
    (id: string) => {
      let nowPinned = false;
      setGroups((current) => {
        let moved: ThreadPanelThread | undefined;
        let wasPinned = false;
        const stripped = current.map((group) => ({
          ...group,
          threads: group.threads.filter((thread) => {
            if (thread.id !== id) return true;
            moved = thread;
            wasPinned = Boolean(thread.pinned);
            return false;
          }),
        }));
        const taken = moved as ThreadPanelThread | undefined;
        if (!taken) return current;
        nowPinned = !wasPinned;
        const hasPinned = stripped.some((group) => group.label === pinnedGroup);
        const withPinned =
          hasPinned || wasPinned ? stripped : [{ label: pinnedGroup, threads: [] }, ...stripped];
        return withPinned.map((group) => {
          if (!wasPinned && group.label === pinnedGroup) {
            return { ...group, threads: [...group.threads, { ...taken, pinned: true }] };
          }
          if (wasPinned && group.label === homeGroup) {
            return { ...group, threads: [{ ...taken, pinned: undefined }, ...group.threads] };
          }
          return group;
        });
      });
      onPin?.(id, nowPinned);
    },
    [homeGroup, onPin, pinnedGroup]
  );

  /* Closing a tab closes the session view, never the thread: the history
     keeps the row. Closing the active tab moves to a neighbour; closing the
     last one returns to the greeting. */
  const closeTab = useCallback(
    (id: string) => {
      const index = openTabs.indexOf(id);
      setOpenTabs((tabs) => tabs.filter((tab) => tab !== id));
      if (activeThreadId === id) {
        const neighbour = openTabs[index + 1] ?? openTabs[index - 1];
        if (neighbour) select(neighbour);
        else startNew();
      }
    },
    [activeThreadId, openTabs, select, startNew]
  );

  const selectProject = useCallback((id: string) => setActiveProjectId(id), []);
  const createProject = useCallback(() => {
    projectSeq.current += 1;
    const id = `project-${projectSeq.current}`;
    setProjects((list) => [...list, { id, label: `New project ${projectSeq.current}`, meta: 'now' }]);
    setActiveProjectId(id);
  }, []);

  const actionsFor = useCallback(
    (thread: ThreadPanelThread): ThreadPanelThreadAction[] =>
      pins
        ? [
            { id: 'pin', label: thread.pinned ? 'Unpin' : 'Pin', icon: 'keep' },
            RENAME_ACTION,
            DELETE_ACTION,
          ]
        : [RENAME_ACTION, DELETE_ACTION],
    [pins]
  );

  const runAction = useCallback(
    (threadId: string, actionId: string) => {
      if (actionId === 'rename') setRenamingId(threadId);
      else if (actionId === 'delete') remove(threadId);
      else if (actionId === 'pin') togglePin(threadId);
    },
    [remove, togglePin]
  );

  /* The rail's render shape follows the options: pins off folds the pinned
     group back into the home group, details off strips the rows to bare
     titles, and each row carries its menu. */
  const shapedGroups = useMemo(() => {
    let shaped = groups;
    if (!pins) {
      const pinned = shaped.find((group) => group.label === pinnedGroup)?.threads ?? [];
      shaped = shaped
        .filter((group) => group.label !== pinnedGroup)
        .map((group) =>
          group.label === homeGroup
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
    return shaped.map((group) => ({
      ...group,
      threads: group.threads.map((thread) => {
        const row = details
          ? thread
          : { ...thread, description: undefined, status: undefined, icon: undefined, meta: undefined };
        return { ...row, actions: actionsFor(thread) };
      }),
    }));
  }, [groups, pins, pinnedGroup, homeGroup, details, actionsFor]);

  /* The strip's tabs resolve live from the history, so a rename or the
     naming shimmer's reveal flows straight into the label. */
  const tabs = useMemo<ThreadTab[]>(() => {
    const byId = new Map<string, ThreadPanelThread>();
    for (const group of groups) for (const thread of group.threads) byId.set(thread.id, thread);
    return openTabs.flatMap((id) => {
      const thread = byId.get(id);
      return thread
        ? [{ id, label: thread.title, icon: 'chat_bubble', status: details ? thread.status : undefined }]
        : [];
    });
  }, [openTabs, groups, details]);

  return {
    groups: shapedGroups,
    activeThreadId,
    select,
    startNew,
    remove,
    rename,
    togglePin,
    renamingId,
    setRenamingId,
    actionsFor,
    runAction,
    projects,
    activeProjectId,
    selectProject,
    createProject,
    tabs,
    closeTab,
    newThreadLabel,
  };
}
