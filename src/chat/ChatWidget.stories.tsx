import { useEffect, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { ChatProvider } from './ChatProvider';
import { ChatWidget, type ChatWidgetProps } from './ChatWidget';
import { ChatLauncher } from './ChatLauncher';
import { useChatWidget } from './context';
import { ARTIFACT_CARD_KIND, type ChatCard } from './types';
import {
  DEMO_ARTIFACT_RENDERERS,
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_RENDERERS,
  DEMO_SCRIPT,
  DEMO_STARTERS,
  DEMO_THREADS,
  DemoWelcome,
  createDemoTransport,
  demoAgentTabs,
} from './demo';
import { ModelPicker } from '../components/ModelPicker/ModelPicker';

/* The stories run the widget on the demo script, at fast beats, so a play
   function sees a reply within the test runner's patience. Each story gets
   its own provider, so the conversations never share state. */
const FAST = { statusMs: 60, handoffMs: 20, streamMs: 2 };

/** Opens the provider's panel on mount: the widget renders nothing useful closed. */
function OpenOnMount({ children }: { children: ReactNode }) {
  const { setOpen } = useChatWidget();
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);
  return <>{children}</>;
}

/** A sized card for the widget to fill, the way a host's panel or stage would. */
function Stage({ width = 420, height = 720, children }: { width?: number; height?: number; children: ReactNode }) {
  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        border: 'var(--border-025) solid var(--color-bg-container-border)',
        borderRadius: 'var(--radius-600)',
        background: 'var(--color-bg-container)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'Chat/ChatWidget',
  component: ChatWidget,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    title: 'Acme Assistant',
    starters: DEMO_STARTERS,
    tagline: 'How can we help you today?',
    closeEnabled: false,
    fullscreenEnabled: false,
  },
  argTypes: {
    widgetsLayout: { control: 'select', options: ['fit', 'scroll'] },
    widgetsWidth: { control: 'select', options: ['column', 'wide'] },
  },
  render: (args) => (
    <ChatProvider
      transport={createDemoTransport(FAST)}
      renderers={DEMO_RENDERERS}
      followups={false}
      feedback={false}
      threads={DEMO_THREADS}
    >
      <OpenOnMount>
        <Stage>
          <ChatWidget {...args} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
} satisfies Meta<typeof ChatWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The widget in a panel-sized card on the scripted transport: greeting, starters, composer, disclaimer. */
export const Default: Story = {};

/** A starter sends its label; the user bubble lands and a reply streams in. */
export const Conversation: Story = {
  render: (args) => (
    <ChatProvider
      transport={createDemoTransport(FAST)}
      renderers={DEMO_RENDERERS}
      followups={false}
      feedback={false}
    >
      <OpenOnMount>
        <Stage>
          <ChatWidget {...args} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const starter = await canvas.findByRole('button', { name: 'How do I get started?' }, { timeout: 4000 });
    await userEvent.click(starter);
    await waitFor(
      () => expect(canvas.getByText('How do I get started?')).toBeInTheDocument(),
      { timeout: 4000 }
    );
    // The scripted reply arrives after the status beats and the word reveal.
    await waitFor(
      () => expect(canvas.getByText(/Create a workspace from the dashboard/)).toBeInTheDocument(),
      { timeout: 15000 }
    );
    // Follow-ups come with the reply on a scripted transport.
    await waitFor(
      () => expect(canvas.getByRole('button', { name: 'Set it all up for me' })).toBeInTheDocument(),
      { timeout: 4000 }
    );
    // Sending one keeps the row as the record: no chip in it is a button any
    // more, and the sent one is named as chosen.
    await userEvent.click(canvas.getByRole('button', { name: 'What do the plans include?' }));
    await waitFor(
      () => {
        const row = canvasElement.querySelector('.ds-prompt-suggestions--kept');
        expect(row).not.toBeNull();
        expect(within(row as HTMLElement).queryAllByRole('button')).toHaveLength(0);
        expect(row?.querySelector('.ds-prompt-suggestions__item--kept')?.textContent).toContain(
          'What do the plans include?'
        );
      },
      { timeout: 4000 }
    );
  },
};

/** The agent asks: one tap answers, the card keeps the record, and the answer is sent as the next message. */
export const Questions: Story = {
  render: (args) => (
    <ChatProvider transport={createDemoTransport(FAST)} renderers={DEMO_RENDERERS} followups={false} feedback={false}>
      <OpenOnMount>
        <Stage>
          <ChatWidget {...args} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ask = async (prompt: string) => {
      await userEvent.type(canvas.getByRole('textbox'), `${prompt}{Enter}`);
    };
    await ask('Plan our launch kickoff');
    // A set holds the composer until it is answered.
    await waitFor(() => expect(canvas.getByText('1 of 3')).toBeInTheDocument(), { timeout: 15000 });
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(canvas.getAllByText('Skipped')).toHaveLength(3);
    await expect(canvas.getByRole('textbox')).not.toBeDisabled();
    // Focus comes back to the composer, rather than falling to the page.
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveFocus());

    await ask('Help me pick a plan');
    const option = await canvas.findByRole('button', { name: 'Just me' }, { timeout: 15000 });
    await userEvent.click(option);
    await waitFor(
      () => expect(canvas.getByText(/the Starter plan covers you/)).toBeInTheDocument(),
      { timeout: 15000 }
    );
    // The card stays as the record, no longer a set of buttons.
    await expect(canvas.queryByRole('button', { name: 'Just me' })).toBeNull();
  },
};

/** A reply carrying a card: the plan renders inside the turn through the provider's renderers. */
export const RichContent: Story = {
  render: (args) => (
    <ChatProvider
      transport={createDemoTransport(FAST)}
      renderers={DEMO_RENDERERS}
      followups={false}
      feedback={false}
    >
      <OpenOnMount>
        <Stage>
          <ChatWidget {...args} starters={[{ id: 'plan', label: 'Set it all up for me' }]} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Set it all up for me' }, { timeout: 4000 }));
    await waitFor(
      () => expect(canvas.getByText('Invite the three teammates')).toBeInTheDocument(),
      { timeout: 15000 }
    );
  },
};

/* One card of every kind the demo renders, lifted from the script itself so
   a renderer added to the demo without a reply that carries it fails here,
   and every kind is rendered and axe-checked on every change. */
const EVERY_CARD = (() => {
  const seen = new Map<string, ChatCard>();
  for (const reply of [...DEMO_SCRIPT.nodes, ...DEMO_SCRIPT.fallbacks]) {
    if (reply.card && !seen.has(reply.card.kind)) seen.set(reply.card.kind, reply.card);
  }
  /* A renderer the demo still exports but the story no longer plays: the
     calendar permission is asked as a question now, in the conversation's
     own flow. Its card stays here, so the renderer is still drawn and
     axe-checked. */
  const unscripted: ChatCard[] = [
    {
      kind: 'interrupt',
      data: {
        title: 'Connect the shared calendar?',
        description: 'The assistant wants read access to the team calendar to suggest meeting times.',
        options: [
          { value: 'allow', label: 'Allow once', variant: 'primary' },
          { value: 'deny', label: 'Not now', variant: 'secondary' },
        ],
      },
    },
  ];
  for (const card of unscripted) if (!seen.has(card.kind)) seen.set(card.kind, card);
  return [...seen.values()];
})();

function InjectEveryCard({ children }: { children: ReactNode }) {
  const { injectTurn, turns } = useChatWidget();
  useEffect(() => {
    if (turns.length > 0) return;
    for (const card of EVERY_CARD) {
      injectTurn({ role: 'assistant', text: `A ${card.kind} card.`, card });
    }
  }, [injectTurn, turns.length]);
  return <>{children}</>;
}

/** Every card kind the demo ships, one turn each, rendered through the provider's renderers. */
export const EveryCard: Story = {
  render: (args) => (
    <ChatProvider transport={createDemoTransport(FAST)} renderers={DEMO_RENDERERS} followups={false} feedback={false}>
      <OpenOnMount>
        <InjectEveryCard>
          <Stage height={900}>
            <ChatWidget {...args} />
          </Stage>
        </InjectEveryCard>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The script (or the unscripted fixtures above) must carry a card for
    // every renderer the demo exports, plus the one kind the widget draws
    // itself: the artifact's tile.
    const kinds = EVERY_CARD.map((card) => card.kind).sort();
    expect(kinds).toEqual([...Object.keys(DEMO_RENDERERS), ARTIFACT_CARD_KIND].sort());
    for (const kind of kinds) {
      await waitFor(() => expect(canvas.getByText(`A ${kind} card.`)).toBeInTheDocument(), { timeout: 4000 });
    }
  },
};

/** The phone layout: greeting centred in the thread, starters over a bottom-pinned composer. */
export const Phone: Story = {
  args: { phone: true, compact: true },
  render: (args) => (
    <ChatProvider transport={createDemoTransport(FAST)} renderers={DEMO_RENDERERS} followups={false} feedback={false}>
      <OpenOnMount>
        <Stage width={390} height={760}>
          <ChatWidget {...args} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
};

/** Every slot staged at once on a wide card: the built-in threads rail, the tab strip, the agent pane, attachments, mentions and a model picker. */
export const Rails: Story = {
  args: {
    threads: true,
    threadsProps: { defaultExpanded: true, profile: { name: 'Jordan Reyes', meta: 'Pro' } },
    tabs: true,
    fileAttachments: true,
    mentions: DEMO_MENTIONS,
    placeholder: 'Ask anything, @ for entities or / for commands',
  },
  render: (args) => (
    <ChatProvider
      transport={createDemoTransport(FAST)}
      renderers={DEMO_RENDERERS}
      followups={false}
      feedback={false}
      threads={DEMO_THREADS}
    >
      <OpenOnMount>
        <Stage width={1100} height={760}>
          <ChatWidget
            {...args}
            agent={{ tabs: demoAgentTabs(args.title ?? 'Assistant') }}
            composerActions={<ModelPicker models={DEMO_MODELS} placement="top" />}
          />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The history rail is inline at this width; the agent pane opens from the header.
    await canvas.findByText('Compare the plan limits', undefined, { timeout: 4000 });
    await userEvent.click(canvas.getByRole('button', { name: 'Show the agent panel' }));
    await waitFor(() => expect(canvas.getByText('Watch the Q3 invoices')).toBeInTheDocument(), { timeout: 4000 });
    await userEvent.click(canvas.getByRole('button', { name: 'Hide the agent panel' }));
    // A conversation births a thread into the rail and a tab into the strip.
    // The starters stage a short shimmer before the chips arrive.
    await userEvent.click(
      await canvas.findByRole('button', { name: 'How do I get started?' }, { timeout: 4000 })
    );
    await waitFor(() => expect(canvas.getAllByText('New chat').length).toBeGreaterThan(0), { timeout: 4000 });
  },
};

/** The artifact panel: a reply that makes something opens it beside the conversation, and the header toggle closes and reopens it. */
export const Artifacts: Story = {
  args: { artifacts: true },
  render: (args) => (
    <ChatProvider
      transport={createDemoTransport(FAST)}
      renderers={DEMO_RENDERERS}
      artifactRenderers={DEMO_ARTIFACT_RENDERERS}
      followups={false}
      feedback={false}
    >
      <OpenOnMount>
        <Stage width={1100} height={760}>
          <ChatWidget {...args} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Before the conversation has made anything, the toggle opens an empty state.
    await userEvent.click(await canvas.findByRole('button', { name: 'Show the artifact panel' }));
    await waitFor(() => expect(canvas.getByText('Nothing here yet')).toBeInTheDocument(), { timeout: 4000 });
    await userEvent.click(canvas.getByRole('button', { name: 'Hide the artifact panel' }));
    // An artifact that arrives at this width opens itself beside the chat.
    await userEvent.type(canvas.getByRole('textbox'), 'Draft the launch page{Enter}');
    const tile = await canvas.findByRole('button', { name: /Launch page/, pressed: true }, { timeout: 15000 });
    await waitFor(() => expect(canvas.getByTitle('Launch page')).toBeVisible(), { timeout: 4000 });
    // The tile is the one control both ways.
    await userEvent.click(tile);
    await waitFor(() => expect(tile).toHaveAttribute('aria-pressed', 'false'), { timeout: 4000 });
    await userEvent.click(canvas.getByRole('button', { name: 'Show the artifact panel' }));
    await waitFor(() => expect(tile).toHaveAttribute('aria-pressed', 'true'), { timeout: 4000 });
  },
};

/** A thread's lifecycle: pin it, rename it, and the row follows. */
export const ThreadLifecycle: Story = {
  args: { threads: true, threadsProps: { defaultExpanded: true } },
  render: (args) => (
    <ChatProvider
      transport={createDemoTransport(FAST)}
      renderers={DEMO_RENDERERS}
      followups={false}
      feedback={false}
      threads={DEMO_THREADS}
    >
      <OpenOnMount>
        <Stage width={960} height={720}>
          <ChatWidget {...args} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Plan the launch week', undefined, { timeout: 4000 });
    // Pin from the row's menu. The trigger is hover-revealed (pointer-events
    // off until the row is hovered), so the test reaches it the way a mouse
    // would not have to: by skipping the pointer check.
    const menu = canvas.getByRole('button', { name: /: Plan the launch week$/ });
    await userEvent.click(menu, { pointerEventsCheck: 0 });
    const pin = await screen.findByRole('menuitem', { name: 'Pin' }, { timeout: 2000 });
    await userEvent.click(pin);
    await waitFor(() => expect(canvas.getByText('Plan the launch week')).toBeInTheDocument());
    // Rename inline: the editor takes the new title on Enter.
    await userEvent.click(canvas.getByRole('button', { name: /: Plan the launch week$/ }), {
      pointerEventsCheck: 0,
    });
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }, { timeout: 2000 }));
    // The rename editor carries the current title; the composer is the other textbox.
    const editor = await canvas.findByDisplayValue('Plan the launch week', undefined, { timeout: 2000 });
    await userEvent.clear(editor);
    await userEvent.type(editor, 'Plan launch week two{Enter}');
    await waitFor(() => expect(canvas.getByText('Plan launch week two')).toBeInTheDocument(), { timeout: 2000 });
  },
};

/** A welcome screen with a dashboard under the composer, the chat as a home page. */
export const WelcomeDashboard: Story = {
  args: { showStarters: false, widgetsLayout: 'scroll', widgetsWidth: 'wide' },
  render: (args) => (
    <ChatProvider transport={createDemoTransport(FAST)} renderers={DEMO_RENDERERS} followups={false} feedback={false}>
      <OpenOnMount>
        <Stage width={1100} height={760}>
          <DashboardWidget {...args} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
};

function DashboardWidget(args: ChatWidgetProps) {
  const { send } = useChatWidget();
  return <ChatWidget {...args} widgets={<DemoWelcome variant="dashboard" onAsk={(prompt) => send(prompt)} />} />;
}

/** The launcher: a floating button that opens the panel, docked beside the page on a wide viewport and over it on a narrow one. */
export const Launcher: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <ChatProvider transport={createDemoTransport(FAST)} renderers={DEMO_RENDERERS} followups={false} feedback={false}>
      <div style={{ minHeight: '100dvh', padding: 'var(--padding-800)' }}>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          The page. The launcher sits in the corner; the panel docks beside this text on a wide
          viewport and covers it on a narrow one.
        </p>
      </div>
      <ChatLauncher label="Ask Acme" widget={{ ...args, closeEnabled: true }} />
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Ask Acme' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Close chat' })).toBeInTheDocument(), {
      timeout: 4000,
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Ask Acme' })).toBeInTheDocument(), {
      timeout: 4000,
    });
  },
};

