/**
 * The demo's story: a fictional workspace product's chat, every chip leading
 * to another scripted prompt so no path dead-ends. Written through
 * `scriptChat()`, the same API a consumer uses for their own preview.
 */
import type { AgentPlanStep } from '../components/AgentPlan/AgentPlan';
import type {
  DemoChartCard,
  DemoDiffCard,
  DemoInterruptCard,
  DemoPlanCard,
  DemoProductCard,
  DemoSourcesCard,
  DemoStackCard,
  DemoToolCallCard,
} from './demo-cards';
import { scriptChat, type ChatScript } from './sim';
import type { ChatCard, Starter } from './types';

const TRIAL_SIGNUPS = [
  { week: 'W1', signups: 320 },
  { week: 'W2', signups: 410 },
  { week: 'W3', signups: 380 },
  { week: 'W4', signups: 520 },
  { week: 'W5', signups: 610 },
  { week: 'W6', signups: 720 },
];

const LAUNCH_BUDGET = [
  { phase: 'Beta', spend: 12 },
  { phase: 'Launch week', spend: 34 },
  { phase: 'Follow-up', spend: 18 },
];

const PLAN_STEPS: AgentPlanStep[] = [
  { label: 'Check the workspace quota', status: 'completed' },
  { label: 'Create the shared project', status: 'completed', detail: 'acme-design / launch' },
  { label: 'Invite the three teammates', status: 'active' },
  { label: 'Post the welcome note', status: 'pending' },
];

const card = <T,>(kind: string, data: T): ChatCard => ({ kind, data });

/** The three starters the demo welcome screen offers. */
export const DEMO_STARTERS: Starter[] = [
  { id: 'start', label: 'How do I get started?' },
  { id: 'plans', label: 'What do the plans include?' },
  { id: 'invite', label: 'Invite my team to a workspace' },
];

/** The scripted conversation, for `createSimTransport` or inspection. */
export const DEMO_SCRIPT: ChatScript = scriptChat()
  .user('How do I get started?')
  .assistant(
    'Create a workspace from the dashboard, then invite your team from Settings. ' +
      'Everyone you add sees the shared projects the moment they join. If you would ' +
      'rather not click through it, I can set the whole thing up for you.',
    {
      steps: [
        { status: 'Reading the first-run flow', point: 'The question maps to the first-run flow.' },
        { status: 'Drafting the answer', point: 'Lead with the workspace, then the invite step.' },
      ],
      followups: ['Set it all up for me', 'What do the plans include?', 'How is the trial going?'],
    }
  )
  .user('Set it all up for me')
  .assistant('On it. Two steps are done already, and the invites are going out now.', {
    steps: [
      { status: 'Planning the setup', point: 'Four steps, from quota check to welcome note.' },
      { status: 'Creating the workspace', point: 'The shared project comes first.' },
    ],
    card: card<DemoPlanCard>('plan', { steps: PLAN_STEPS }),
    followups: ['Find a time we can all meet', 'Take us up to twelve seats', 'How is the trial going?'],
  })
  .user('What do the plans include?')
  .assistant(
    'Every plan includes unlimited projects. The Team plan adds shared workspaces, guest seats, and a 90 day version history.',
    {
      steps: [
        { status: 'Comparing the plans', point: 'Three plans differ on collaboration, not on limits.' },
        { status: 'Drafting the answer', point: 'Name what the Team plan adds over the base.' },
      ],
      followups: ['Which plan fits a team of five?', 'Where is that written down?', 'How is the trial going?'],
    }
  )
  .user('Which plan fits a team of five?')
  .assistant('The Team plan fits what you described: shared workspaces for the whole team, and guest seats stay free.', {
    steps: [
      { status: 'Matching plans to the team', point: 'The visitor needs shared workspaces and guest seats.' },
      { status: 'Drafting the answer', point: 'The Team plan covers both; lead with the card.' },
    ],
    card: card<DemoProductCard>('product-card', {
      title: 'Team plan',
      description: 'Shared workspaces, guest seats, and version history for the whole team.',
      meta: 'Billed monthly, cancel any time',
      actions: [
        { label: 'Choose plan', variant: 'secondary' },
        { label: 'Compare plans', variant: 'tertiary' },
      ],
    }),
    followups: ['Where is that written down?', 'Invite my team to a workspace', 'How is the trial going?'],
  })
  .user('Where is that written down?')
  .assistant('Each chip opens the page the answer came from, so nothing here needs taking on trust.', {
    steps: [
      { status: 'Collecting the sources', point: 'Three product pages back the answer.' },
      { status: 'Drafting the answer', point: 'Cite them so the visitor can check.' },
    ],
    card: card<DemoSourcesCard>('sources', {
      items: [
        {
          title: 'Pricing guide',
          index: 1,
          letter: 'A',
          source: 'acme.design/pricing',
          meta: 'Updated 3 days ago',
          excerpt:
            'Team is billed per editor, monthly or yearly. Viewers are free on every plan, and a seat you remove mid-cycle comes back as credit on the next invoice.',
        },
        {
          title: 'Workspace docs',
          index: 2,
          letter: 'D',
          source: 'docs.acme.design',
          excerpt:
            'An editor can create and change files in any project they are invited to. Seats belong to the workspace, not to a project, so moving someone between teams costs nothing.',
        },
        {
          title: 'Fair use policy',
          source: 'acme.design/legal',
          meta: '4 min read',
          excerpt:
            'Unlimited means no hard cap on files or version history. Automated bulk uploads above the published rate are queued, never dropped.',
        },
      ],
    }),
    followups: ['Which plan fits a team of five?', 'How do I get started?', 'How is the trial going?'],
  })
  .user('How is the trial going?')
  .assistant('Signups have climbed for five of the six weeks since the trial opened, and last week was the strongest yet.', {
    steps: [
      { status: 'Pulling the signup numbers', point: 'Six weeks of signup data since the trial opened.' },
      { status: 'Charting the trend', point: 'One series tells it; chart it in the card.' },
    ],
    card: card<DemoChartCard>('chart', {
      type: 'area',
      title: 'Trial signups',
      meta: 'Last six weeks',
      data: TRIAL_SIGNUPS,
      xKey: 'week',
      yKey: 'signups',
      label: 'Signups',
    }),
    followups: ['Which plan fits a team of five?', 'Invite my team to a workspace', 'Where is that written down?'],
  })
  .user('Invite my team to a workspace')
  .assistant('Happy to. Give me the word and I will send invites to the three teammates on your account, all as editors.', {
    steps: [
      { status: 'Checking the account', point: 'Three teammates sit on the account, none invited yet.' },
      { status: 'Drafting the answer', point: 'Confirm before sending anything.' },
    ],
    followups: ['Go ahead and invite the other three', 'Take us up to twelve seats', 'Find a time we can all meet'],
  })
  .user('Go ahead and invite the other three')
  .assistant('All three invites are out. Everyone lands in the workspace with editor access.', {
    steps: [
      { status: 'Sending the invites', point: 'Three teammates to invite, all editors.' },
      { status: 'Confirming delivery', point: 'One call covers the batch.' },
    ],
    card: card<DemoToolCallCard>('tool-call', {
      name: 'invite_teammates',
      summary: '3 editors to acme-design',
      status: 'success',
      duration: '0.6s',
      args: '{\n  "workspace": "acme-design",\n  "role": "editor",\n  "emails": 3\n}',
    }),
    followups: ['Find a time we can all meet', 'Take us up to twelve seats', 'How is the trial going?'],
  })
  .user('Take us up to twelve seats')
  .assistant('Only the seat count moves, from five to twelve. Everything else in the config stays as it was.', {
    steps: [
      { status: 'Locating the seat limit', point: 'The seat limit lives in workspace.config.ts.' },
      { status: 'Preparing the change', point: 'One line changes; show the diff.' },
    ],
    card: card<DemoDiffCard>('diff', {
      filename: 'workspace.config.ts',
      diff:
        '@@ -12,7 +12,7 @@\n export const workspace = {\n   name: "acme-design",\n-  seats: 5,\n+  seats: 12,\n   region: "eu-west",\n };',
    }),
    followups: ['Go ahead and invite the other three', 'What do the plans include?', 'Find a time we can all meet'],
  })
  .user('Here is the launch plan we are working from.')
  .assistant(
    'Three phases, and most of the budget sits behind launch week itself. The dates line up with the workspace you already set up, so nothing needs to move.',
    {
      steps: [
        { status: 'Reading the document', point: 'Fourteen pages; read it before answering.' },
        { status: 'Charting the budget', point: 'Budget is the decision in the doc; chart it.' },
      ],
      card: card<DemoStackCard>('stack', {
        items: [
          card<DemoToolCallCard>('tool-call', {
            name: 'read_document',
            summary: 'Q3 launch plan.pdf',
            status: 'success',
            duration: '1.8s',
          }),
          card<DemoChartCard>('chart', {
            type: 'bar',
            title: 'Budget by phase',
            meta: 'From Q3 launch plan.pdf',
            data: LAUNCH_BUDGET,
            xKey: 'phase',
            yKey: 'spend',
            label: 'Spend ($k)',
          }),
        ],
      }),
      followups: ['Set it all up for me', 'Take us up to twelve seats', 'Find a time we can all meet'],
    }
  )
  .user('Sync the shared calendar')
  .assistant("The sync timed out on the provider's side. Retry below and it should land.", {
    steps: [{ status: 'Starting the calendar sync', point: 'The calendar sync runs after the invites.' }],
    card: card<DemoToolCallCard>('tool-call', {
      name: 'sync_calendar',
      summary: 'team@acme.example',
      status: 'error',
      duration: '2.1s',
      retryable: true,
    }),
    followups: ['Find a time we can all meet', 'Go ahead and invite the other three', 'How is the trial going?'],
  })
  .user('Find a time we can all meet')
  .assistant("I can check everyone's calendar for a slot, once you allow it below.", {
    steps: [
      { status: 'Checking what this needs', point: 'Suggesting times needs calendar access.' },
      { status: 'Preparing the request', point: 'Ask before connecting anything.' },
    ],
    card: card<DemoInterruptCard>('interrupt', {
      title: 'Connect the shared calendar?',
      description: 'The assistant wants read access to the team calendar to suggest meeting times.',
      options: [
        { value: 'allow', label: 'Allow once', variant: 'primary' },
        { value: 'always', label: 'Always allow', variant: 'secondary' },
        { value: 'deny', label: 'Not now', variant: 'secondary' },
      ],
    }),
    followups: ['Go ahead and invite the other three', 'How is the trial going?', 'How do I get started?'],
  })
  /* Free text that matches no prompt lands here, rotating. */
  .fallback(
    'The launch is on track overall. Three of the four readiness tracks are green, and the one item I would watch is the **legal review**, since it gates the pricing rollout.',
    {
      steps: [
        { status: 'Reading the readiness tracks', point: 'Pull the four readiness tracks and their owners.' },
        { status: 'Reviewing the legal blocker', point: 'Pricing copy is still sitting in legal review.' },
        { status: 'Drafting the answer', point: 'Lead with the overall status, then flag the one real risk.' },
      ],
      followups: ['Which track is behind?', 'Who owns the legal review?', 'What happens if pricing slips?'],
    }
  )
  .fallback(
    'This chat is a scripted preview of the widget, so free text gets one of a few written replies. ' +
      'The suggestion chips lead through the parts of the story that show off the rich content: ' +
      'a plan, a chart, a diff, a tool call and an approval.',
    {
      steps: [{ status: 'Reading the question', point: 'Nothing scripted matches this one.' }],
      followups: ['How do I get started?', 'What do the plans include?', 'How is the trial going?'],
    }
  )
  .build();
