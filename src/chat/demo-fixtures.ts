/**
 * The demo's fixtures for the rails and the composer: mentions, a model
 * list, the seeded history, projects and thread names. Invented, like the
 * rest of the demo.
 */
import type { MentionSource } from '../components/Mention/Mention';
import type { ModelPickerModel } from '../components/ModelPicker/ModelPicker';
import type { ThreadPanelGroup, ThreadPanelProject } from '../components/ThreadPanel/ThreadPanel';
import type { ThreadsOptions } from './threads';

/** `@` reaches for a person or a file, `/` for a skill. */
export const DEMO_MENTIONS: MentionSource[] = [
  {
    trigger: '@',
    label: 'People and files',
    items: [
      { id: 'mira', label: 'Mira Castellan', description: 'Design lead', icon: 'person' },
      { id: 'tobias', label: 'Tobias Renner', description: 'Platform', icon: 'person' },
      { id: 'ines', label: 'Ines Okonjo', description: 'Research', icon: 'person' },
      { id: 'roadmap', label: 'roadmap.md', description: 'Docs', icon: 'description' },
      { id: 'pricing', label: 'pricing.csv', description: 'Finance', icon: 'description' },
      { id: 'onboarding', label: 'onboarding.pdf', description: 'Docs', icon: 'description' },
    ],
  },
  {
    trigger: '/',
    label: 'Skills',
    items: [
      { id: 'summarize', label: 'summarize', description: 'The thread so far, in brief' },
      { id: 'draft', label: 'draft', description: 'Write a first version' },
      { id: 'review', label: 'review', description: 'Read it for problems' },
      { id: 'translate', label: 'translate', description: 'Into another language' },
      { id: 'schedule', label: 'schedule', description: 'Run this later' },
      { id: 'invite', label: 'invite', description: 'Add a teammate to the workspace' },
      { id: 'export', label: 'export', description: 'Save the thread as a file' },
      { id: 'status', label: 'status', description: 'Where things stand' },
      { id: 'share', label: 'share', description: 'Send a link to this thread' },
      { id: 'search', label: 'search', description: 'Look across the workspace' },
    ],
  },
];

/** A mock model list for the picker: set dressing, nothing routes on it. */
export const DEMO_MODELS: ModelPickerModel[] = [
  { label: 'Sonnet 5', value: 'sonnet-5', description: 'Fast and capable, the everyday pick.', badge: 'New' },
  { label: 'Fable 5', value: 'fable-5', description: 'The deepest reasoning for hard questions.' },
  { label: 'Haiku 4.5', value: 'haiku-4-5', description: 'Instant answers for quick lookups.' },
];

export const DEMO_THREAD_GROUPS: ThreadPanelGroup[] = [
  {
    label: 'Pinned',
    threads: [
      {
        id: 'pricing',
        title: 'Compare the plan limits',
        description: 'Annual pricing options',
        status: 'idle',
        pinned: true,
        meta: '2d',
      },
    ],
  },
  {
    label: 'This week',
    threads: [
      {
        id: 'launch',
        title: 'Plan the launch week',
        description: 'Waiting on the beta invite list',
        status: 'waiting',
        icon: 'cloud',
        meta: '32m',
      },
      {
        id: 'onboarding',
        title: 'Rework the onboarding email',
        description: 'Drafting the welcome sequence',
        status: 'working',
        icon: 'cloud',
        meta: '2h',
      },
    ],
  },
  {
    label: 'Earlier',
    threads: [
      { id: 'import', title: "Import last year's invoices", meta: '4d' },
      { id: 'roles', title: 'Set up roles for the team', status: 'error', meta: '5d' },
      { id: 'notify', title: 'Quiet the mention notifications', status: 'unread', meta: '1w' },
    ],
  },
];

export const DEMO_PROJECTS: ThreadPanelProject[] = [
  { id: 'workspace-revamp', label: 'Workspace revamp', meta: '1m' },
  { id: 'billing-cleanup', label: 'Billing cleanup', meta: '3d' },
];

/** The names the demo's "title generation" hands out, in order. */
export const DEMO_THREAD_NAMES = [
  'Plan the beta invite list',
  'Summarize the weekly standup',
  'Draft the pricing FAQ',
  'Tidy up the workspace roles',
  'Sketch the renewal email',
];

/** Ready-made options for `ChatProvider`'s `threads`. */
export const DEMO_THREADS: ThreadsOptions = {
  groups: DEMO_THREAD_GROUPS,
  projects: DEMO_PROJECTS,
  pinnedGroup: 'Pinned',
  homeGroup: 'This week',
  nameThread: (index) => DEMO_THREAD_NAMES[index % DEMO_THREAD_NAMES.length],
};

/** What sits under the composer on the demo's welcome screen. */
export type DemoWelcomeVariant = 'starters' | 'links' | 'cards' | 'dashboard' | 'none';

export const DEMO_WELCOME_OPTIONS: { value: DemoWelcomeVariant; label: string }[] = [
  { value: 'starters', label: 'Starters' },
  { value: 'links', label: 'Links' },
  { value: 'cards', label: 'Cards' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'none', label: 'None' },
];
