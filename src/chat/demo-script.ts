/**
 * The demo's story: a fictional workspace product's chat, every chip leading
 * to another scripted prompt so no path dead-ends. Written through
 * `scriptChat()`, the same API a consumer uses for their own preview.
 */
import type { AgentPlanStep } from '../components/AgentPlan/AgentPlan';
import type {
  DemoChartCard,
  DemoDiffCard,
  DemoPlanCard,
  DemoProductCard,
  DemoSourcesCard,
  DemoStackCard,
  DemoToolCallCard,
} from './demo-cards';
import { artifactCard } from './artifacts';
import { DEMO_DASHBOARD_ARTIFACT, DEMO_PAGE_ARTIFACT } from './demo-artifacts';
import { scriptChat, type ChatScript, type ScriptedReply } from './sim';
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

const KICKOFF_STEPS: AgentPlanStep[] = [
  { label: 'Hold the slot on every calendar', status: 'completed' },
  { label: 'Draft the agenda from the launch plan', status: 'active' },
  { label: 'Send the invites', status: 'pending' },
];

const card = <T,>(kind: string, data: T): ChatCard => ({ kind, data });

/* The plan a team size points to, for the one-question branch. Matches the
   answer as it is sent: an option's label, or what was typed instead. */
function planFor(answer: string): ScriptedReply {
  const size = answer.toLowerCase();
  const plan = size.includes('just me')
    ? 'the Starter plan covers you: unlimited projects, no seats to manage'
    : size.includes('more than 50')
      ? 'the Business plan fits: single sign-on, audit logs and pooled seats'
      : 'the Team plan fits: shared workspaces for everyone, and guest seats stay free';
  return {
    steps: [{ status: 'Matching the plan', point: 'Team size decides the plan; nothing else differs.' }],
    text: `For ${answer.trim().replace(/[.!?]$/, '')}, ${plan}.`,
    followups: ['What do the plans include?', 'Invite my team to a workspace', 'Set up notifications for me'],
  };
}

/* Replies more than one path leads to: a scripted prompt and the answer to
   a question can arrive at the same place. */
const INVITES_SENT: ScriptedReply = {
  steps: [
    { status: 'Sending the invites', point: 'Three teammates to invite, all editors.' },
    { status: 'Confirming delivery', point: 'One call covers the batch.' },
  ],
  text: 'All three invites are out. Everyone lands in the workspace with editor access.',
  card: card<DemoToolCallCard>('tool-call', {
    name: 'invite_teammates',
    summary: '3 editors to acme-design',
    status: 'success',
    duration: '0.6s',
    args: '{\n  "workspace": "acme-design",\n  "role": "editor",\n  "emails": 3\n}',
  }),
  followups: ['Set up notifications for me', 'Take us up to twelve seats', 'Plan our launch kickoff'],
};

const PLANS_COMPARED: ScriptedReply = {
  steps: [
    { status: 'Comparing the plans', point: 'Three plans differ on collaboration, not on limits.' },
    { status: 'Drafting the answer', point: 'Name what the Team plan adds over the base.' },
  ],
  text: 'Every plan includes unlimited projects. The Team plan adds shared workspaces, guest seats, and a 90 day version history.',
  followups: ['Which plan fits a team of five?', 'Help me pick a plan', 'Where is that written down?'],
};

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
  .assistant(PLANS_COMPARED.text, PLANS_COMPARED)
  .user('Which plan fits a team of five?')
  .assistant('The Team plan fits what you described: shared workspaces for the whole team, and guest seats stay free. Shall we go with it?', {
    steps: [
      { status: 'Matching plans to the team', point: 'The visitor needs shared workspaces and guest seats.' },
      { status: 'Drafting the answer', point: 'The Team plan covers both; lead with the card.' },
    ],
    card: card<DemoProductCard>('product-card', {
      title: 'Team plan',
      description: 'Shared workspaces, guest seats, and version history for the whole team.',
      meta: 'Billed monthly, cancel any time',
    }),
    question: {
      id: 'team-plan',
      questions: [
        {
          id: 'plan',
          prompt: 'Go with the Team plan?',
          options: [
            { value: 'choose', label: 'Choose the Team plan' },
            { value: 'compare', label: 'Compare the plans first' },
          ],
        },
      ],
    },
    answered: (answer) =>
      answer.toLowerCase().includes('compare')
        ? PLANS_COMPARED
        : {
            steps: [{ status: 'Switching the plan', point: 'Move the workspace to Team from today.' }],
            text: 'Done. The workspace is on the Team plan from today, billed monthly, and you can step back down any time.',
            followups: ['Invite my team to a workspace', 'Where is that written down?', 'How is the trial going?'],
          },
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
  .assistant('Happy to. Shall I send invites to the three teammates on your account, all as editors?', {
    steps: [
      { status: 'Checking the account', point: 'Three teammates sit on the account, none invited yet.' },
      { status: 'Drafting the answer', point: 'Confirm before sending anything.' },
    ],
    question: {
      id: 'invites',
      questions: [
        {
          id: 'send',
          prompt: 'Send the invites?',
          options: [
            { value: 'send', label: 'Invite all three' },
            { value: 'wait', label: 'Not yet' },
          ],
        },
      ],
    },
    answered: (answer) =>
      answer.toLowerCase().startsWith('not yet')
        ? {
            steps: [{ status: 'Holding the invites', point: 'Nothing sent; keep the list ready.' }],
            text: 'Nothing sent. The three are ready to go whenever you are.',
            followups: ['Take us up to twelve seats', 'Find a time we can all meet', 'How is the trial going?'],
          }
        : INVITES_SENT,
  })
  .user('Go ahead and invite the other three')
  .assistant(INVITES_SENT.text, INVITES_SENT)
  .user('Take us up to twelve seats')
  .assistant('Only the seat count moves, from five to twelve. Everything else in the config stays as it was. Apply it?', {
    steps: [
      { status: 'Locating the seat limit', point: 'The seat limit lives in workspace.config.ts.' },
      { status: 'Preparing the change', point: 'One line changes; show the diff.' },
    ],
    card: card<DemoDiffCard>('diff', {
      filename: 'workspace.config.ts',
      diff:
        '@@ -12,7 +12,7 @@\n export const workspace = {\n   name: "acme-design",\n-  seats: 5,\n+  seats: 12,\n   region: "eu-west",\n };',
    }),
    question: {
      id: 'seats',
      questions: [
        {
          id: 'apply',
          prompt: 'Apply the change?',
          options: [
            { value: 'apply', label: 'Apply it' },
            { value: 'wait', label: 'Not yet' },
          ],
        },
      ],
    },
    answered: (answer) =>
      answer.toLowerCase().startsWith('not yet')
        ? {
            steps: [{ status: 'Leaving the config', point: 'The diff stays a proposal.' }],
            text: 'Left as it is. The workspace stays at five seats until you say otherwise.',
            followups: ['What do the plans include?', 'Invite my team to a workspace', 'How is the trial going?'],
          }
        : {
            steps: [{ status: 'Applying the change', point: 'One line in workspace.config.ts.' }],
            text: 'Applied. The workspace takes twelve seats from now, and the next invoice picks up the difference.',
            card: card<DemoToolCallCard>('tool-call', {
              name: 'update_config',
              summary: 'workspace.config.ts, seats 5 to 12',
              status: 'success',
              duration: '0.4s',
            }),
            followups: ['Invite my team to a workspace', 'Find a time we can all meet', 'How is the trial going?'],
          },
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
  .assistant("The sync timed out on the provider's side. It usually lands on a second try. Run it again?", {
    steps: [{ status: 'Starting the calendar sync', point: 'The calendar sync runs after the invites.' }],
    card: card<DemoToolCallCard>('tool-call', {
      name: 'sync_calendar',
      summary: 'the shared team calendar',
      status: 'error',
      duration: '2.1s',
    }),
    question: {
      id: 'sync-retry',
      questions: [
        {
          id: 'retry',
          prompt: 'Try the sync again?',
          options: [
            { value: 'retry', label: 'Retry the sync' },
            { value: 'leave', label: 'Leave it for now' },
          ],
        },
      ],
    },
    answered: (answer) =>
      answer.toLowerCase().startsWith('leave')
        ? {
            steps: [{ status: 'Leaving the sync', point: 'Nothing to retry until asked.' }],
            text: 'Left for now. Nothing else depends on it, and it can run again whenever you like.',
            followups: ['Find a time we can all meet', 'Invite my team to a workspace', 'How is the trial going?'],
          }
        : {
            steps: [{ status: 'Retrying the sync', point: 'Second attempt against the provider.' }],
            text: 'Second time lucky. The shared calendar is in sync.',
            card: card<DemoToolCallCard>('tool-call', {
              name: 'sync_calendar',
              summary: 'the shared team calendar',
              status: 'success',
              duration: '1.2s',
            }),
            followups: ['Find a time we can all meet', 'Plan our launch kickoff', 'How is the trial going?'],
          },
  })
  .user('Find a time we can all meet')
  /* Permission asked in the conversation's own flow: a question with the
     answers as options, each sent as the visitor's reply, rather than an
     approval card that stops the thread to decide. */
  .assistant("I can check everyone's calendar for a slot. Can I read the shared team calendar?", {
    steps: [
      { status: 'Checking what this needs', point: 'Suggesting times needs calendar access.' },
      { status: 'Preparing the request', point: 'Ask before connecting anything.' },
    ],
    question: {
      id: 'calendar-access',
      questions: [
        {
          id: 'access',
          prompt: 'Read the shared calendar?',
          options: [
            { value: 'once', label: 'Yes, just this once' },
            { value: 'always', label: 'Yes, always' },
            { value: 'no', label: 'Not now' },
          ],
        },
      ],
    },
    answered: (answer) =>
      answer.toLowerCase().startsWith('not now')
        ? {
            steps: [{ status: 'Leaving the calendar alone', point: 'No access; offer the manual route.' }],
            text: 'No problem, nothing is connected. You can share a few times that suit you and I will send them round.',
            followups: ['Go ahead and invite the other three', 'How is the trial going?', 'How do I get started?'],
          }
        : {
            steps: [
              { status: 'Reading the shared calendar', point: 'Four calendars, the next ten working days.' },
              { status: 'Finding a free slot', point: 'Thursday afternoon is clear for everyone.' },
            ],
            text: answer.toLowerCase().includes('always')
              ? 'Connected for good. Thursday at 2pm is the first slot everyone has free, and I will keep an eye out when plans change.'
              : 'Read once and disconnected. Thursday at 2pm is the first slot everyone has free.',
            followups: ['Plan our launch kickoff', 'Go ahead and invite the other three', 'How is the trial going?'],
          },
  })
  .user('Build me a launch dashboard')
  .assistant(
    'Here is the launch on one board: what is running now, the trial signups, the projects and what is waiting on you. The rows that ask a question will ask it here.',
    {
      steps: [
        { status: 'Gathering the launch numbers', point: 'Signups, seats and open work all belong on one board.' },
        { status: 'Laying out the dashboard', point: 'Too much for a card; build it as an artifact.' },
      ],
      card: artifactCard(DEMO_DASHBOARD_ARTIFACT),
      followups: ['Draft the launch page', 'How is the trial going?', 'Which plan fits a team of five?'],
    }
  )
  .user('Draft the launch page')
  .assistant(
    'A first draft of the launch page is up beside the chat: the headline, the three things the Team plan adds, and one call to action. The source is behind the Code view.',
    {
      steps: [
        { status: 'Reading the launch plan', point: 'The page should lead with the workspace, then the plan.' },
        { status: 'Writing the page', point: 'One document, its own styles, no scripts.' },
      ],
      card: artifactCard(DEMO_PAGE_ARTIFACT),
      followups: ['Build me a launch dashboard', 'What do the plans include?', 'How is the trial going?'],
    }
  )
  /* The quick replies beyond the chips: the agent asking, with answers to
     pick. One question with one answer, one with several, and a set that
     holds the composer until it is answered or skipped. */
  .user('Help me pick a plan')
  .assistant('Happy to. How big is the team that will use the workspace?', {
    steps: [{ status: 'Reading the plans', point: 'Plans differ by team size; ask before recommending.' }],
    question: {
      id: 'team-size',
      questions: [
        {
          id: 'size',
          prompt: 'How big is the team?',
          options: [
            { value: 'solo', label: 'Just me' },
            { value: 'small', label: '2 to 10 people' },
            { value: 'medium', label: '11 to 50 people' },
            { value: 'large', label: 'More than 50' },
          ],
          other: true,
        },
      ],
    },
    answered: planFor,
  })
  .user('Set up notifications for me')
  .assistant('Sure. Which of these should reach you? Pick as many as you like.', {
    steps: [{ status: 'Reading your settings', point: 'Four kinds of notification; ask which matter.' }],
    question: {
      id: 'notifications',
      questions: [
        {
          id: 'kinds',
          prompt: 'Notify me about',
          mode: 'multi',
          options: [
            { value: 'mentions', label: 'Mentions', description: 'When someone writes your name' },
            { value: 'comments', label: 'Comments on my files' },
            { value: 'invites', label: 'Invites accepted' },
            { value: 'summary', label: 'A weekly summary', description: 'Mondays, one email' },
          ],
          other: true,
        },
      ],
    },
    answered: (answer) => ({
      steps: [{ status: 'Saving your settings', point: 'Turn on what was picked, everything else off.' }],
      text: `Done. You will hear about ${answer.trim().toLowerCase()}, and nothing else. Change it any time in Settings.`,
      followups: ['Plan our launch kickoff', 'Help me pick a plan', 'How is the trial going?'],
    }),
  })
  .user('Plan our launch kickoff')
  .assistant('Three quick questions first, so the kickoff fits the team.', {
    steps: [
      { status: 'Reading the launch plan', point: 'The kickoff needs a date, a guest list and a format.' },
      { status: 'Preparing the questions', point: 'Ask all three before booking anything.' },
    ],
    question: {
      id: 'kickoff',
      questions: [
        {
          id: 'when',
          prompt: 'When should it happen?',
          options: [
            { value: 'this-week', label: 'This week' },
            { value: 'next-week', label: 'Next week' },
            { value: 'after-beta', label: 'After the beta' },
          ],
        },
        {
          id: 'who',
          prompt: 'Who should be there?',
          mode: 'multi',
          options: [
            { value: 'design', label: 'Design' },
            { value: 'engineering', label: 'Engineering' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
          ],
        },
        {
          id: 'format',
          prompt: 'What format?',
          options: [
            { value: 'room', label: 'In person' },
            { value: 'video', label: 'A video call' },
            { value: 'async', label: 'An async update' },
          ],
          other: true,
        },
      ],
    },
    answered: {
      steps: [
        { status: 'Booking the kickoff', point: 'Find the first slot everyone named is free.' },
        { status: 'Drafting the agenda', point: 'Lead with the launch dates, then owners.' },
      ],
      text: 'Kickoff is on the calendar. The slot is held for everyone you named, and the agenda is being drafted from the launch plan.',
      card: card<DemoPlanCard>('plan', { steps: KICKOFF_STEPS }),
      followups: ['Find a time we can all meet', 'Build me a launch dashboard', 'Set up notifications for me'],
    },
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
      'a plan, a chart, a diff, a tool call, an artifact and questions to answer.',
    {
      steps: [{ status: 'Reading the question', point: 'Nothing scripted matches this one.' }],
      followups: ['How do I get started?', 'Help me pick a plan', 'Plan our launch kickoff'],
    }
  )
  .build();
