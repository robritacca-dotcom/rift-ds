"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import PageLinks from "@/components/PageLinks/PageLinks";
import PropsTable from "@/components/PropsTable/PropsTable";
import { ArchitectureMap } from "@/components/ArchitectureMap/ArchitectureMap";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Button } from "rift-ds/components/Button/Button";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import { componentMetadata } from "rift-ds/components/registry";
import {
  CHAT_EVENT_KINDS,
  ChatWidget,
  DOCK_QUERY,
  SUGGESTION_MAX_CHARS,
  TAKEOVER_QUERY,
  THREADS_RAIL_MIN_WIDTH,
  ASIDE_RAIL_MIN_WIDTH,
  chatWidget,
  useChatWidget,
  type ChatEvent,
} from "rift-ds/chat";
import {
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_RENDERERS,
  DEMO_STARTERS,
  DEMO_THREADS,
  createDemoTransport,
  demoAgentTabs,
} from "rift-ds/chat/demo";
import { componentApi } from "@/data/component-api.generated";
import { chatExchangeMap } from "../overview/maps";
import { widgetMap } from "./maps";
import { PACKAGE_NAME } from "@/config/brand.generated";
import { SITE_URL } from "@/lib/structuredData";
import styles from "./page.module.css";

/* Every fact on this page comes from the widget's registry, the package's
   exports or the generated component API: the install command, the subpaths
   and their peers, the composed parts, the props, the protocol's event kinds
   and the thresholds. Nothing countable is typed here. */

const widgetApi = componentApi.find((entry) => entry.kind === "widget" && entry.name === chatWidget.name);
const parts = chatWidget.parts
  .map((name) => componentMetadata.find((component) => component.name === name))
  .filter((component): component is NonNullable<typeof component> => Boolean(component));

const INSTALL_SNIPPET = `npm install ${PACKAGE_NAME}
npx ${PACKAGE_NAME} ${chatWidget.command}`;

const SHADCN_SNIPPET = `npx shadcn@latest add ${SITE_URL}/r/${chatWidget.slug}.json`;

const MOUNT_SNIPPET = `// app/layout.tsx: render the mount once, after the page content.
import { ChatMount } from '../components/chat/ChatMount';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatMount />
      </body>
    </html>
  );
}`;

const SCRIPT_SNIPPET = `import { ChatProvider, ChatLauncher, scriptChat } from '${PACKAGE_NAME}/chat';
import '${PACKAGE_NAME}/chat/chat.css';

// A conversation written in advance: no model, no route, no key.
const transport = scriptChat()
  .user('How do I get started?')
  .assistant('Create a workspace, then invite your team.', {
    steps: [{ status: 'Reading the first-run flow' }],
    followups: ['What do the plans include?'],
  })
  .user('What do the plans include?')
  .assistant('Every plan includes unlimited projects.')
  .transport();

export function Preview() {
  return (
    <ChatProvider transport={transport} followups={false} feedback={false}>
      <ChatLauncher label="Ask" widget={{ title: 'Assistant' }} />
    </ChatProvider>
  );
}`;

const ROUTE_SNIPPET = `// app/api/chat/route.ts: what \`${chatWidget.command}\` writes, trimmed.
import { createChatHandler } from '${PACKAGE_NAME}/chat/server';
import { createUpstashGuardrails } from '${PACKAGE_NAME}/chat/upstash';

const handler = createChatHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
  models: CHAT_MODELS,
  tools: [lookupTool],   // a tool may answer with a card
  guardrails: createUpstashGuardrails({ url, token, salt }),
});

export const POST = (request: Request) => handler(request);`;

const TRANSPORT_SNIPPET = `type ChatTransport = (
  messages: ChatTransportMessage[],
  signal: AbortSignal,
) => AsyncIterable<ChatEvent>;`;

/* One line per event kind. Typed against the protocol, so a kind added to
   the union without a line here fails the build rather than the page. */
const EVENT_LINES: Record<ChatEvent["type"], string> = {
  status: "A live status step: the label the agent status shows, with an optional reasoning trace point that collects under it.",
  model: "The model that is serving this exchange, as a display label.",
  models: "What the server is offering: its default and the values the budget has locked. The picker follows it.",
  delta: "A chunk of reply text. The first one ends the thinking phase.",
  exchange: "The server's log id for the exchange. Its presence is what shows the thumbs.",
  followups: "The follow-up questions to offer under the finished reply.",
  content: "Rich content as a React node, for a transport that runs in the browser.",
  card: "Rich content as data, drawn by the provider's renderers by kind. The form a server can send.",
  notice: "A guardrail's reply, rendered as an ordinary assistant message.",
  error: "A failure the person should see, sent only before the first delta.",
  done: "The exchange is complete. Always last.",
};

/* The hero's two review footprints: a wide card that seats every rail, and
   a phone, which is the takeover the widget's hosts give a real one. */
const STAGES = {
  desktop: { label: "Desktop", width: 1100, height: 760, phone: false },
  phone: { label: "Phone", width: 390, height: 760, phone: true },
} as const;
type Stage = keyof typeof STAGES;

/** Opens the demo's provider on mount: the widget renders nothing useful closed. */
function OpenOnMount() {
  const { setOpen } = useChatWidget();
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);
  return null;
}

function HeroDemo({ stage }: { stage: Stage }) {
  const { send } = useChatWidget();
  const preset = STAGES[stage];
  return (
    <div
      className={styles.stage}
      style={{ width: "100%", maxWidth: preset.width, height: preset.height }}
      data-stage={stage}
    >
      <OpenOnMount />
      <ChatWidget
        title="Acme Assistant"
        tagline="How can we help you today?"
        starters={DEMO_STARTERS}
        startersKey={stage}
        fullscreenEnabled={false}
        closeEnabled={false}
        compact={preset.phone}
        phone={preset.phone}
        threads={!preset.phone}
        threadsProps={{
          defaultExpanded: false,
          logoText: "Acme Assistant",
          profile: { name: "Jordan Reyes", meta: "Pro" },
        }}
        tabs={!preset.phone}
        agent={{ tabs: demoAgentTabs("Acme Assistant") }}
        fileAttachments
        mentions={DEMO_MENTIONS}
        placeholder="Ask anything, @ for entities or / for commands"
        composerActions={<ModelPicker models={DEMO_MODELS} placement="top" />}
        disclaimer={
          <>
            A scripted preview. Nothing you type or attach leaves your browser.{" "}
            <button type="button" className={styles.disclaimerAction} onClick={() => send("How is the trial going?")}>
              Ask about the trial
            </button>
          </>
        }
      />
    </div>
  );
}

export default function ChatPage() {
  const [stage, setStage] = useState<Stage>("desktop");
  const transport = useMemo(() => createDemoTransport(), []);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>{chatWidget.label}</h1>
            <PageLinks storybookPath="/?path=/docs/chat-chatwidget--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The whole AI chat, as one widget</p>
            <p className={styles.introBody}>
              Most libraries hand you chat parts and leave the wiring to you. This one
              ships the finished thing: the panel that docks, overlays and takes over a
              phone, the engine that streams a reply and paces it, the threads, the
              tabs, the agent pane, the rich cards a reply can carry, and the server
              handlers that call the model. You mount it, configure it with props, and
              the chat in the corner of this page is the same component, running live.
            </p>
          </div>

          {/* ---------------------------------------------------------- hero */}
          <section id="demo" className={`${styles.section} animate-in animate-delay-2`} data-anchor-ignore>
            <div className={styles.stageBar}>
              <SegmentedControl
                segments={Object.entries(STAGES).map(([value, preset]) => ({ value, label: preset.label }))}
                activeSegment={stage}
                onSegmentChange={(value) => setStage(value as Stage)}
                size="compact"
                ariaLabel="Preview size"
              />
              <p className={styles.stageNote}>
                Running on the scripted transport: a conversation written in advance, no
                model behind it. Pick a chip to see a reply stream in with its reasoning,
                cards and follow-ups.
              </p>
            </div>
            <SiteChatProvider
              key={stage}
              transport={transport}
              renderers={DEMO_RENDERERS}
              threads={DEMO_THREADS}
            >
              <HeroDemo stage={stage} />
            </SiteChatProvider>
          </section>

          {/* ------------------------------------------------------- install */}
          <section id="install" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Install" />
            <p className={styles.sectionNote}>
              One command scaffolds the chat into a Next.js app: the chat, follow-ups
              and feedback routes, the guardrails beside them, a mount component with
              its model list, and an env example. It never overwrites a file, so
              re-running is safe.
            </p>
            <CodeBlock code={INSTALL_SNIPPET} language="bash" showCopy />
            <p className={styles.sectionNote}>
              Then render the mount once, after your page content, and copy the env
              example into your local env. With the demo flag on, the widget plays its
              scripted conversation and needs no key. Set your Anthropic key and the
              enable flag to go live.
            </p>
            <CodeBlock code={MOUNT_SNIPPET} language="tsx" showCopy />
            <p className={styles.sectionNote}>
              Prefer owning the source? The shadcn registry carries the whole widget
              as one item, with the components it composes as its dependencies:
            </p>
            <CodeBlock code={SHADCN_SNIPPET} language="bash" showCopy />
            <p className={styles.sectionNote}>
              The widget occupies its own subpaths, each with the optional peers it
              needs, so the main barrel stays free of them:
            </p>
            <ul className={styles.subpathList}>
              {Object.entries(chatWidget.subpaths).map(([subpath, what]) => (
                <li key={subpath} className={styles.subpathItem}>
                  <code className={styles.subpathName}>
                    {PACKAGE_NAME}
                    {subpath.slice(1)}
                  </code>
                  <span className={styles.subpathWhat}>{what}</span>
                  {chatWidget.peers[subpath] && (
                    <span className={styles.subpathPeers}>
                      Peers: {chatWidget.peers[subpath].join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* ------------------------------------------------------- no key */}
          <section id="scripted" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Try it with no key" />
            <p className={styles.sectionNote}>
              A transport is the one thing between the widget and a backend, and a
              script is a transport. Write a conversation in advance and the widget
              plays it back with the full choreography: status beats, the reasoning
              trace, the word-by-word reveal, a card, the follow-up chips. The demo on
              this page is one such script, shipped in the demo subpath with every card
              its story uses. Use yours for previews, design reviews and tests.
            </p>
            <CodeBlock code={SCRIPT_SNIPPET} language="tsx" showCopy />
          </section>

          {/* ------------------------------------------------------ features */}
          <section id="features" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="What it does" />
            <div className={styles.featureGrid}>
              <Feature title="Streams and paces">
                Deltas arrive in uneven clumps; the widget holds them and reveals at a
                steady rate that scales with the backlog, honouring reduced motion.
                While the model thinks, its reasoning collects as trace points under a
                live status, then folds into a line that says how long it took.
              </Feature>
              <Feature title="Carries rich content">
                A reply can bring a card: a chart, a plan, a diff, a tool call, an
                approval. A tool on the server answers with one, a script attaches one,
                and your renderers decide how each kind is drawn. Any component in the
                library can sit inside a turn.
              </Feature>
              <Feature title="Docks, overlays, takes over">
                Beside the page at {DOCK_QUERY.replace(/[()]/g, "")}, a modal overlay below that, and
                the whole document under {TAKEOVER_QUERY.replace(/[()]/g, "")}, where the chat is
                the page and the soft keyboard is the browser&apos;s problem. The host
                reserves width only at the dock, never below it.
              </Feature>
              <Feature title="Moves where you want it">
                Dock it to either edge or float it as a card you move by its header
                and size from eight grips, inside limits. Full screen is a glide, not
                a swap: every property that differs animates together.
              </Feature>
              <Feature title="Threads, tabs and an agent pane">
                A history rail with the whole lifecycle: a thread is born from the
                first message, named a beat later, pinned, renamed inline, deleted. A
                tab strip stays in sync. An agent pane seats on the trailing edge. Each
                rail is inline on a wide host and a sheet on a narrow one, judged by the
                widget&apos;s own width ({THREADS_RAIL_MIN_WIDTH}px and {ASIDE_RAIL_MIN_WIDTH}px),
                never the viewport&apos;s.
              </Feature>
              <Feature title="Suggests the next question">
                Starters open the conversation, drawn from your pools with a seed that
                holds still until a new chat. Follow-ups arrive a beat after each answer,
                with a written fallback so a shimmer never resolves to nothing. Every
                chip fits one line: {SUGGESTION_MAX_CHARS} characters, dropped rather
                than clipped.
              </Feature>
              <Feature title="Offers the models you allow">
                The picker lists your models; the pick rides each request and the
                server resolves it through the day&apos;s budget. A locked model stays
                listed, disabled, with the reason, so the lineup reads as paused rather
                than gone.
              </Feature>
              <Feature title="Takes files and mentions">
                Pick, paste or drop files anywhere on the chat; long pastes fold into a
                tile. Previews are built in the browser and nothing is uploaded unless
                your transport sends it. Mentions reach for people, files and skills
                with the trigger characters you define.
              </Feature>
              <Feature title="Stays honest about links and feedback">
                Model output is untrusted, so only the same-site paths you allow become
                links, rendered through your router. Thumbs appear only on an answer the
                server logged, and the disclaimer line is yours to write.
              </Feature>
              <Feature title="Welcomes with widgets">
                The empty screen can be a home page: tiles, cards or a whole dashboard
                under the composer, in a column or running wide, fitted to one viewport
                or scrolling as a page. It leaves with the first message.
              </Feature>
            </div>
          </section>

          {/* ------------------------------------------------------- configure */}
          <section id="configure" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Configure" />
            <p className={styles.sectionNote}>
              Three components make the widget. The provider holds the conversation
              and is mounted once; the widget is the surface; the launcher is the
              button and the panel. Every prop below is read from the same JSDoc that
              ships in the package&apos;s types, so this table cannot say something the
              code does not. Copy for agents hands your coding agent the same contract.
            </p>
            {widgetApi?.exports.map((exported) => (
              <div key={exported.component} className={styles.propsBlock}>
                <h3 className={styles.propsHeading}>{exported.component}</h3>
                <PropsTable exported={exported} />
              </div>
            ))}
          </section>

          {/* ------------------------------------------------------- anatomy */}
          <section id="anatomy" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="What it is made of" />
            <p className={styles.sectionNote}>
              The widget composes the library&apos;s own components. Each one has its
              own page, its own stories and its own props, and the widget adds the
              behaviour none of them could own alone: the responsive modes, the
              transport contract, the thread lifecycle and the suggestion budget.
            </p>
            <ArchitectureMap
              map={widgetMap}
              caption="The client half: one provider, two surfaces, and a transport that is the whole integration."
            />
            <ul className={styles.partsList}>
              {parts.map((component) => (
                <li key={component.slug}>
                  <Link href={`/components/${component.slug}`} className={styles.partLink}>
                    <span className={styles.partName}>{component.label}</span>
                    <span className={styles.partDescription}>{component.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ------------------------------------------------------- protocol */}
          <section id="protocol" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="The protocol" />
            <p className={styles.sectionNote}>
              Swapping transports is the whole integration. A transport is one
              function: it takes the conversation and an abort signal, and yields
              events until it says done. The fetch transport parses them off the
              server handler&apos;s stream; a script plays them from a file; yours can
              yield whatever your backend produces.
            </p>
            <CodeBlock code={TRANSPORT_SNIPPET} language="ts" showCopy />
            <dl className={styles.eventList}>
              {CHAT_EVENT_KINDS.map((kind) => (
                <div key={kind} className={styles.eventRow}>
                  <dt className={styles.eventKind}>
                    <code>{kind}</code>
                  </dt>
                  <dd className={styles.eventWhat}>{EVENT_LINES[kind]}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* --------------------------------------------------------- server */}
          <section id="server" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="The server half" />
            <p className={styles.sectionNote}>
              The handlers are web-standard functions from a request to a response,
              so they mount on any framework&apos;s route: Next&apos;s app router, Remix,
              Hono, a plain Node server. You supply the system prompt, the models and
              their budget roles, the tools and the guardrails; the protocol, the body
              caps and the error rules are fixed. Keys stay on the server. A guardrail
              outcome is a normal reply, never a broken widget, and the stream always
              ends.
            </p>
            <CodeBlock code={ROUTE_SNIPPET} language="ts" showCopy />
            <p className={styles.sectionNote}>
              The Upstash guardrails add per-visitor rate limits, a daily budget that
              steps the default model down and then locks the dearer one, an exchange
              log and the feedback store. Unconfigured, they fail open, so the chat
              works before Redis exists. This is how this site&apos;s own chat answers:
            </p>
            <ArchitectureMap
              map={chatExchangeMap}
              caption="One exchange on this site: the corpus answers the prose, the lookup tools answer the contracts, and the guardrails pick the tier."
            />
            <div className={styles.ctaRow}>
              <Button label="Read the component pages" variant="secondary" href="/components" />
              <Button label="Open the playground" variant="tertiary" href="/playground" />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className={styles.feature}>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureBody}>{children}</p>
    </article>
  );
}
