import { useEffect, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { ChatProvider } from './ChatProvider';
import { ChatWidget, type ChatWidgetProps } from './ChatWidget';
import { ChatLauncher } from './ChatLauncher';
import { useChatWidget } from './context';
import { scriptChat } from './sim';
import { ARTIFACT_CARD_KIND, type ChatCard, type ChatModelOption, type ChatTransport } from './types';
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

/* A transport that sends rich content, then holds the reply open until the
   play function lets it go, so the story can check the content is already
   drawn while the reply is still streaming. */
let releaseLiveReply: (() => void) | undefined;
const heldTransport: ChatTransport = async function* () {
  yield { type: 'status', label: 'Looking up your tasks' };
  yield { type: 'content', node: <div data-testid="live-tool-result">Three open tasks</div> };
  await new Promise<void>((resolve) => {
    releaseLiveReply = resolve;
  });
  yield { type: 'delta', text: 'You have three open tasks this week.' };
  yield { type: 'done' };
};

/** Rich content draws on the live reply as it arrives, before the prose, not only when the turn ends. */
export const LiveContent: Story = {
  render: (args) => (
    <ChatProvider transport={heldTransport} followups={false} feedback={false}>
      <OpenOnMount>
        <Stage>
          <ChatWidget {...args} starters={[{ id: 'tasks', label: 'What is open this week?' }]} />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'What is open this week?' }, { timeout: 4000 }));
    // The tool's result is on screen while the reply is still held open.
    await expect(await canvas.findByTestId('live-tool-result', {}, { timeout: 4000 })).toBeInTheDocument();
    await expect(canvas.queryByText(/three open tasks this week/)).toBeNull();
    releaseLiveReply?.();
    await waitFor(() => expect(canvas.getByText(/three open tasks this week/)).toBeInTheDocument(), { timeout: 8000 });
    // And it stays with the committed turn, drawn once.
    await expect(canvas.getAllByTestId('live-tool-result')).toHaveLength(1);
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

/* The stage both copy stories share: every slot that writes visible English
   switched on, so each string can be found on screen. */
function CopyStage(args: ChatWidgetProps) {
  return (
    <ChatProvider transport={createDemoTransport(FAST)} renderers={DEMO_RENDERERS} followups={false} feedback={false}>
      <OpenOnMount>
        <Stage width={1100} height={760}>
          <ChatWidget
            {...args}
            artifacts
            fileAttachments
            placementEnabled
            contextLabel="Pricing"
            agent={{ tabs: demoAgentTabs(args.title ?? 'Assistant') }}
          />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  );
}

/** Opens each surface that writes copy and checks what it says, in the order the visitor meets it. */
async function expectCopy(
  canvasElement: HTMLElement,
  copy: {
    greetings: string[];
    context: string;
    hint: string;
    agentStatus: string;
    placements: string[];
    panelTitle: string;
    emptyTitle: string;
    emptyDescription: string;
  },
  names: { showAgent: string; hideAgent: string; placement: string; showArtifact: string }
) {
  const canvas = within(canvasElement);
  await waitFor(() =>
    expect(copy.greetings).toContain(canvasElement.querySelector('.ds-chat-widget__hello')?.textContent)
  );
  await expect(canvas.getByText(copy.context)).toBeInTheDocument();
  await expect(canvasElement.querySelector('.ds-attachment-drop-zone__hint')?.textContent).toBe(copy.hint);
  await userEvent.click(canvas.getByRole('button', { name: names.showAgent }));
  await waitFor(() => expect(canvas.getByText(copy.agentStatus)).toBeInTheDocument(), { timeout: 4000 });
  await userEvent.click(canvas.getByRole('button', { name: names.hideAgent }));
  await userEvent.click(canvas.getByRole('button', { name: names.placement }));
  for (const placement of copy.placements) {
    await expect(await screen.findByText(placement, undefined, { timeout: 2000 })).toBeInTheDocument();
  }
  await userEvent.keyboard('{Escape}');
  await userEvent.click(canvas.getByRole('button', { name: names.showArtifact }));
  await waitFor(() => expect(canvas.getByText(copy.emptyTitle)).toBeInTheDocument(), { timeout: 4000 });
  await expect(canvas.getByText(copy.panelTitle)).toBeInTheDocument();
  await expect(canvas.getByText(copy.emptyDescription)).toBeInTheDocument();
}

/** The widget's visible English at its defaults: the context note, the drop hint, the agent's status, the placement rows and the artifact panel's empty state. */
export const DefaultCopy: Story = {
  render: (args) => <CopyStage {...args} />,
  play: async ({ canvasElement }) => {
    await expectCopy(
      canvasElement,
      {
        greetings: ['Good morning', 'Good afternoon', 'Good evening'],
        context: 'Looking at “Pricing”',
        hint: 'Up to 50 MB each · 10 files max',
        agentStatus: 'Connected',
        placements: ['Dock right', 'Dock left', 'Floating'],
        panelTitle: 'Artifacts',
        emptyTitle: 'Nothing here yet',
        emptyDescription: 'What the chat makes for you, like a dashboard or a page, opens in this panel.',
      },
      {
        showAgent: 'Show the agent panel',
        hideAgent: 'Hide the agent panel',
        placement: 'Chat position',
        showArtifact: 'Show the artifact panel',
      }
    );
  },
};

/** Every string the widget writes, localised through its props: here in Spanish. */
export const LocalisedCopy: Story = {
  args: {
    title: 'Asistente Acme',
    tagline: '¿En qué podemos ayudarte hoy?',
    placeholder: 'Pregunta lo que quieras',
    disclaimer: 'Las respuestas pueden contener errores.',
    greetings: { morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches' },
    contextNote: (title: string) => `Viendo «${title}»`,
    attachHint: (maxSize: string, maxFiles: number) => `Hasta ${maxSize} cada uno · ${maxFiles} archivos como máximo`,
    agentStatus: 'Conectado',
    placementLabels: { right: 'Acoplar a la derecha', left: 'Acoplar a la izquierda', floating: 'Flotante' },
    artifactPanelTitle: 'Artefactos',
    artifactEmptyTitle: 'Aún no hay nada',
    artifactEmptyDescription: 'Lo que el chat crea para ti, como un panel o una página, se abre aquí.',
    showAgentLabel: 'Mostrar el panel del agente',
    hideAgentLabel: 'Ocultar el panel del agente',
    placementLabel: 'Posición del chat',
    showArtifactLabel: 'Mostrar el panel de artefactos',
  },
  render: (args) => <CopyStage {...args} />,
  play: async ({ canvasElement }) => {
    await expectCopy(
      canvasElement,
      {
        greetings: ['Buenos días', 'Buenas tardes', 'Buenas noches'],
        context: 'Viendo «Pricing»',
        hint: 'Hasta 50 MB cada uno · 10 archivos como máximo',
        agentStatus: 'Conectado',
        placements: ['Acoplar a la derecha', 'Acoplar a la izquierda', 'Flotante'],
        panelTitle: 'Artefactos',
        emptyTitle: 'Aún no hay nada',
        emptyDescription: 'Lo que el chat crea para ti, como un panel o una página, se abre aquí.',
      },
      {
        showAgent: 'Mostrar el panel del agente',
        hideAgent: 'Ocultar el panel del agente',
        placement: 'Posición del chat',
        showArtifact: 'Mostrar el panel de artefactos',
      }
    );
  },
};

/* The composed-copy stories' conversation: the demo script, plus one reply
   that carries a trace and a fenced block, so the reasoning summary and a
   reply's CodeBlock both draw. */
const INSTALL_PROMPT = 'Show the install command';
function composedCopyTransport(): ChatTransport {
  const install = scriptChat()
    .user(INSTALL_PROMPT)
    .assistant('Run this in your project:\n\n```bash\nnpm install rift-ds\n```', {
      steps: [{ status: 'Reading the docs', point: 'Found the install line.' }],
      followups: ['How do I get started?'],
    })
    .transport(FAST);
  const demo = createDemoTransport(FAST);
  return (messages, signal) => {
    const last = [...messages].reverse().find((message) => message.role === 'user');
    return last?.content === INSTALL_PROMPT ? install(messages, signal) : demo(messages, signal);
  };
}

const COPY_MODELS: ChatModelOption[] = [
  { value: 'fast', id: 'model-fast', label: 'Fast', description: 'Quick answers', adaptiveThinking: false },
  { value: 'deep', id: 'model-deep', label: 'Deep', description: 'Careful answers', adaptiveThinking: true },
];

/* Every composed component that writes words switched on: the threads
   rail, the tab strip, the agent pane, the artifact panel, attachments and
   the model picker. */
function ComposedCopyStage(args: ChatWidgetProps) {
  return (
    <ChatProvider
      transport={composedCopyTransport()}
      renderers={DEMO_RENDERERS}
      artifactRenderers={DEMO_ARTIFACT_RENDERERS}
      followups={false}
      feedback={false}
      threads={DEMO_THREADS}
    >
      <OpenOnMount>
        <Stage width={1100} height={760}>
          <ChatWidget
            {...args}
            threads
            tabs
            artifacts
            fileAttachments
            models={COPY_MODELS}
            agent={{ tabs: demoAgentTabs(args.title ?? 'Assistant') }}
          />
        </Stage>
      </OpenOnMount>
    </ChatProvider>
  );
}

type ComposedCopy = {
  attach: string;
  files: string;
  remove: string;
  message: string;
  drop: string;
  conversation: string;
  modelPicker: string;
  modelList: string;
  threadOptions: string;
  pin: string;
  rename: string;
  showAgent: string;
  hideAgent: string;
  agentViews: string;
  copyCode: string;
  copyText: string;
  codeRegion: string;
  reasoning: RegExp;
  chosen: string;
  openChats: string;
  closeTab: string;
  step: string;
  skip: string;
  skipped: string;
  preview: string;
  code: string;
  view: string;
  expand: string;
  closeArtifact: string;
  panelCodeRegion: string;
};

const askIn = (canvasElement: HTMLElement, copy: ComposedCopy) => async (prompt: string) => {
  await userEvent.type(within(canvasElement).getByRole('textbox', { name: copy.message }), `${prompt}{Enter}`);
};

/** The parts that write words before anything is said: the composer, the drop overlay, the conversation region, the model picker, the threads rail and the agent pane. */
async function expectChromeCopy(canvasElement: HTMLElement, copy: ComposedCopy) {
  const canvas = within(canvasElement);
  await expect(await canvas.findByRole('button', { name: copy.attach })).toBeInTheDocument();
  await expect(canvas.getByRole('textbox', { name: copy.message })).toBeInTheDocument();
  await expect(canvasElement.querySelector('.ds-attachment-drop-zone__label')?.textContent).toBe(copy.drop);
  await expect(canvas.getByRole('region', { name: copy.conversation })).toBeInTheDocument();

  // The model picker's open list.
  await userEvent.click(canvas.getByRole('combobox', { name: copy.modelPicker }));
  await expect(await screen.findByRole('listbox', { name: copy.modelList })).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');

  // The threads rail: a row's menu trigger, and the menu's own rows. The
  // trigger is hover-revealed, so the test skips the pointer check (see
  // ThreadLifecycle).
  const menu = await canvas.findByRole(
    'button',
    { name: `${copy.threadOptions}: Plan the launch week` },
    { timeout: 4000 }
  );
  await userEvent.click(menu, { pointerEventsCheck: 0 });
  await expect(await screen.findByRole('menuitem', { name: copy.pin }, { timeout: 2000 })).toBeInTheDocument();
  await expect(screen.getByRole('menuitem', { name: copy.rename })).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');

  // The agent pane's tab strip.
  await userEvent.click(canvas.getByRole('button', { name: copy.showAgent }));
  await expect(await canvas.findByRole('tablist', { name: copy.agentViews }, { timeout: 4000 })).toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: copy.hideAgent }));

  // A queued file: the tray's name and the tile's remove button, then the
  // sent message's files.
  const input = canvasElement.querySelector<HTMLInputElement>('.ds-composer input[type="file"]');
  await userEvent.upload(input as HTMLInputElement, new File(['hello'], 'notes.txt', { type: 'text/plain' }));
  await expect(await canvas.findByRole('button', { name: `${copy.remove} notes.txt` })).toBeInTheDocument();
  await expect(canvas.getByRole('list', { name: copy.files })).toBeInTheDocument();
  await userEvent.type(canvas.getByRole('textbox', { name: copy.message }), '{Enter}');
  await waitFor(() => expect(canvasElement.querySelector(`.ds-attachment-group [aria-label="${copy.files}"]`)).not.toBeNull(), {
    timeout: 4000,
  });
}

/** A reply's parts: its fenced code and reasoning summary, the follow-up row's record, and the tab strip the conversation opens. */
async function expectReplyCopy(canvasElement: HTMLElement, copy: ComposedCopy) {
  const canvas = within(canvasElement);
  await askIn(canvasElement, copy)(INSTALL_PROMPT);
  // The fence's language streams in with the words, so the region's name settles last.
  await expect(await canvas.findByRole('region', { name: copy.codeRegion }, { timeout: 8000 })).toBeInTheDocument();
  await expect(canvas.getByRole('button', { name: copy.copyCode }).textContent).toContain(copy.copyText);
  await waitFor(() => expect(canvas.getByText(copy.reasoning)).toBeInTheDocument(), { timeout: 4000 });

  // A follow-up sent from the row keeps it as the record, its pick named as chosen.
  await userEvent.click(await canvas.findByRole('button', { name: 'How do I get started?' }, { timeout: 4000 }));
  await waitFor(
    () =>
      expect(canvasElement.querySelector('.ds-prompt-suggestions__item--kept')?.textContent).toContain(copy.chosen),
    { timeout: 4000 }
  );

  // The tab strip the conversation opened, and its close buttons.
  await waitFor(() => expect(canvasElement.querySelector(`[aria-label="${copy.openChats}"]`)).not.toBeNull(), {
    timeout: 4000,
  });
  await expect(canvas.getAllByRole('button', { name: new RegExp(`^${copy.closeTab}: `) }).length).toBeGreaterThan(0);
}

/** A set of questions (the step count, Skip and the record it leaves), then the artifact panel (its view switch, its buttons and the code view's CodeBlock). */
async function expectPanelCopy(canvasElement: HTMLElement, copy: ComposedCopy) {
  const canvas = within(canvasElement);
  const ask = askIn(canvasElement, copy);
  await ask('Plan our launch kickoff');
  await waitFor(() => expect(canvas.getByText(copy.step)).toBeInTheDocument(), { timeout: 8000 });
  await userEvent.click(canvas.getByRole('button', { name: copy.skip }));
  await expect(canvas.getAllByText(copy.skipped)).toHaveLength(3);

  await waitFor(() => expect(canvas.getByRole('textbox', { name: copy.message })).not.toBeDisabled());
  await ask('Draft the launch page');
  const panel = await waitFor(
    () => {
      const node = canvasElement.querySelector<HTMLElement>('.ds-chat-widget__artifact-rail--open .ds-artifact-panel');
      expect(node).not.toBeNull();
      return node as HTMLElement;
    },
    { timeout: 8000 }
  );
  const inPanel = within(panel);
  await expect(inPanel.getByRole('tablist', { name: copy.view })).toBeInTheDocument();
  await expect(inPanel.getByRole('tab', { name: copy.preview })).toBeInTheDocument();
  await expect(inPanel.getByRole('button', { name: copy.expand })).toBeInTheDocument();
  await expect(inPanel.getByRole('button', { name: copy.closeArtifact })).toBeInTheDocument();
  await userEvent.click(inPanel.getByRole('tab', { name: copy.code }));
  await expect(await inPanel.findByRole('region', { name: copy.panelCodeRegion })).toBeInTheDocument();
  await expect(inPanel.getByRole('button', { name: copy.copyCode })).toBeInTheDocument();
}

const ENGLISH_COMPOSED: ComposedCopy = {
  attach: 'Attach files',
  files: 'Attachments',
  remove: 'Remove',
  message: 'Message',
  drop: 'Drop files to attach',
  conversation: 'Conversation',
  modelPicker: 'Choose a model',
  modelList: 'Model',
  threadOptions: 'Thread options',
  pin: 'Pin',
  rename: 'Rename',
  showAgent: 'Show the agent panel',
  hideAgent: 'Hide the agent panel',
  agentViews: 'Agent views',
  copyCode: 'Copy code',
  copyText: 'Copy',
  codeRegion: 'Code: bash',
  reasoning: /^(Thought for \d+s|Thought process)$/,
  chosen: '(chosen)',
  openChats: 'Open chats',
  closeTab: 'Close chat',
  step: '1 of 3',
  skip: 'Skip',
  skipped: 'Skipped',
  preview: 'Preview',
  code: 'Code',
  view: 'Artifact view',
  expand: 'Expand the artifact',
  closeArtifact: 'Close the artifact',
  panelCodeRegion: 'Code: html',
};

const SPANISH_COMPOSED: ComposedCopy = {
  attach: 'Adjuntar archivos',
  files: 'Archivos adjuntos',
  remove: 'Quitar',
  message: 'Mensaje',
  drop: 'Suelta los archivos para adjuntarlos',
  conversation: 'Conversación',
  modelPicker: 'Elegir un modelo',
  modelList: 'Modelo',
  threadOptions: 'Opciones del hilo',
  pin: 'Fijar',
  rename: 'Renombrar',
  showAgent: 'Mostrar el panel del agente',
  hideAgent: 'Ocultar el panel del agente',
  agentViews: 'Vistas del agente',
  copyCode: 'Copiar el código',
  copyText: 'Copiar',
  codeRegion: 'Código: bash',
  reasoning: /^(Razonó durante \d+ s|Proceso de razonamiento)$/,
  chosen: '(elegida)',
  openChats: 'Chats abiertos',
  closeTab: 'Cerrar el chat',
  step: '1 de 3',
  skip: 'Omitir',
  skipped: 'Omitida',
  preview: 'Vista previa',
  code: 'Código',
  view: 'Vista del artefacto',
  expand: 'Ampliar el artefacto',
  closeArtifact: 'Cerrar el artefacto',
  panelCodeRegion: 'Código: html',
};

/* The rail opens expanded in both languages, so its rows' menus are reachable. */
const ENGLISH_ARGS: Partial<ChatWidgetProps> = { threadsProps: { defaultExpanded: true } };

/* Every grouped label prop set, plus the threads rail's and the tab strip's
   own props, in Spanish. */
const SPANISH_ARGS: Partial<ChatWidgetProps> = {
  modelPickerLabel: 'Elegir un modelo',
  showAgentLabel: 'Mostrar el panel del agente',
  hideAgentLabel: 'Ocultar el panel del agente',
  pastedTextLabel: 'Texto pegado',
  reasoningLabel: (seconds?: number) =>
    seconds === undefined ? 'Proceso de razonamiento' : `Razonó durante ${seconds} s`,
  composerLabels: {
    attachLabel: 'Adjuntar archivos',
    dropLabel: 'Suelta los archivos para adjuntarlos',
    filesLabel: 'Archivos adjuntos',
    stopLabel: 'Detener la respuesta',
    'aria-label': 'Mensaje',
    attachmentTileLabels: { removeLabel: (name: string) => `Quitar ${name}` },
  },
  attachmentDropZoneLabels: { label: 'Suelta los archivos para adjuntarlos' },
  attachmentGroupLabels: {
    label: 'Archivos adjuntos',
    attachmentViewerLabels: { closeLabel: 'Cerrar' },
  },
  chatThreadLabels: { ariaLabel: 'Conversación', jumpLabel: 'Ir al último mensaje' },
  modelPickerLabels: { listLabel: 'Modelo', placeholder: 'Elegir un modelo' },
  threadsProps: {
    defaultExpanded: true,
    historyLabel: 'Historial',
    threadPanelLabels: { threadMenuLabel: 'Opciones del hilo', pinnedLabel: 'Fijado', projectsLabel: 'Proyectos' },
    actionLabels: { pin: 'Fijar', unpin: 'Soltar', rename: 'Renombrar', delete: 'Eliminar' },
  },
  tabsProps: { ariaLabel: 'Chats abiertos', closeLabel: 'Cerrar el chat' },
  agentRailLabels: { tabsLabel: 'Vistas del agente' },
  codeBlockLabels: {
    copyLabel: 'Copiar el código',
    copyText: 'Copiar',
    copiedLabel: 'Copiado',
    codeLabel: (language?: string) => (language ? `Código: ${language}` : 'Código'),
  },
  promptSuggestionsLabels: { chosenLabel: '(elegida)' },
  questionCardLabels: {
    step: (current: number, total: number) => `${current} de ${total}`,
    skip: 'Omitir',
    skipped: 'Omitida',
  },
  questionSummaryLabels: { missingLabel: 'Sin respuesta' },
  artifactPanelLabels: {
    previewLabel: 'Vista previa',
    codeLabel: 'Código',
    viewLabel: 'Vista del artefacto',
    expandLabel: 'Ampliar el artefacto',
    collapseLabel: 'Reducir el artefacto',
    closeLabel: 'Cerrar el artefacto',
    codeBlockLabels: { copyLabel: 'Copiar el código', copyText: 'Copiar', codeLabel: 'Código: html' },
  },
};

/** The composed parts' English at its defaults, before anything is said: the composer, the drop overlay, the conversation, the model picker, the threads rail and the agent pane. */
export const ComposedDefaultCopy: Story = {
  args: ENGLISH_ARGS,
  render: (args) => <ComposedCopyStage {...args} />,
  play: async ({ canvasElement }) => expectChromeCopy(canvasElement, ENGLISH_COMPOSED),
};

/** The same parts localised through the grouped label props and `threadsProps`: here in Spanish. */
export const ComposedLocalisedCopy: Story = {
  args: SPANISH_ARGS,
  render: (args) => <ComposedCopyStage {...args} />,
  play: async ({ canvasElement }) => expectChromeCopy(canvasElement, SPANISH_COMPOSED),
};

/** A reply's English at its defaults: its fenced code, its reasoning summary, the follow-up row's record and the tab strip. */
export const ReplyDefaultCopy: Story = {
  args: ENGLISH_ARGS,
  render: (args) => <ComposedCopyStage {...args} />,
  play: async ({ canvasElement }) => expectReplyCopy(canvasElement, ENGLISH_COMPOSED),
};

/** The same reply localised through `codeBlockLabels`, `reasoningLabel`, `promptSuggestionsLabels` and `tabsProps`: here in Spanish. */
export const ReplyLocalisedCopy: Story = {
  args: SPANISH_ARGS,
  render: (args) => <ComposedCopyStage {...args} />,
  play: async ({ canvasElement }) => expectReplyCopy(canvasElement, SPANISH_COMPOSED),
};

/** A set of questions and the artifact panel at their English defaults. */
export const PanelsDefaultCopy: Story = {
  args: ENGLISH_ARGS,
  render: (args) => <ComposedCopyStage {...args} />,
  play: async ({ canvasElement }) => expectPanelCopy(canvasElement, ENGLISH_COMPOSED),
};

/** The same localised through `questionCardLabels` and `artifactPanelLabels`: here in Spanish. */
export const PanelsLocalisedCopy: Story = {
  args: SPANISH_ARGS,
  render: (args) => <ComposedCopyStage {...args} />,
  play: async ({ canvasElement }) => expectPanelCopy(canvasElement, SPANISH_COMPOSED),
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

