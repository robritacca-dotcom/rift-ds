"use client";

import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Link from "next/link";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ArchitectureMap } from "@/components/ArchitectureMap/ArchitectureMap";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table } from "rift-ds/components/Table/Table";
import {
  ASIDE_RAIL_MIN_WIDTH,
  ARTIFACT_CARD_KIND,
  CHAT_EVENT_KINDS,
  DOCK_QUERY,
  SUGGESTION_MAX_CHARS,
  TAKEOVER_QUERY,
  THREADS_RAIL_MIN_WIDTH,
  chatWidget,
  type ChatEvent,
} from "rift-ds/chat";
import { PACKAGE_NAME } from "@/config/brand.generated";
import { SITE_URL } from "@/lib/structuredData";
import { chatExchangeMap } from "../../overview/maps";
import { widgetMap } from "./maps";
import s from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/chat");

/* The chat's docs page: a light overview, then how to add it, in the
   blueprints' register: headings, short notes, code and tables, in the
   order a consumer works through them. Three ways in, each a section: the
   full install (one command, bring a key), UI only (the panel over your own
   endpoint) and headless (the engine under your own UI), then the packages.
   The props live on the widget's own page under /components. The command
   and the packages come from the widget registry, the thresholds and event
   kinds from the package itself. The file list and the env names are hand
   mirrors of the init bin's templates (src/cli/templates/chat/), held to
   them in both directions by scripts/validate-chat-widget.mjs. */

const INSTALL_SNIPPET = `npm install ${PACKAGE_NAME}
npx ${PACKAGE_NAME} ${chatWidget.command}`;

/** What the command writes, relative to the app. Mirrors src/cli/templates/chat/. */
const SCAFFOLD_FILES = [
  "app/api/chat/route.ts",
  "app/api/chat/followups/route.ts",
  "app/api/chat/feedback/route.ts",
  "app/api/chat/guardrails.ts",
  "components/chat/ChatMount.tsx",
  "components/chat/models.ts",
  ".env.chat.example",
];

const MOUNT_SNIPPET = `// app/layout.tsx
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

/** The env the scaffold reads. Names mirror .env.chat.example. */
const ENV_VARS = [
  { name: "NEXT_PUBLIC_CHAT_DEMO", what: "Plays a written conversation in the browser. No key needed." },
  { name: "CHAT_ENABLED", what: "Lets the routes call a model." },
  { name: "ANTHROPIC_API_KEY", what: "Your Anthropic key. It stays on the server." },
  { name: "KV_REST_API_URL", what: "Upstash Redis, for rate limits and the daily budget. Optional." },
  { name: "KV_REST_API_TOKEN", what: "The token for that Redis. Optional." },
  { name: "CHAT_VISITOR_SALT", what: "Salts the visitor key the rate limiter uses. Optional." },
  { name: "CHAT_DAILY_MESSAGE_CAP", what: "Messages per day before the chat pauses." },
  { name: "CHAT_DAILY_SPEND_CAP_CENTS", what: "Spend per day, in US cents, before the chat pauses." },
];

const LIVE_SNIPPET = `# .env.local
NEXT_PUBLIC_CHAT_DEMO=false
CHAT_ENABLED=true
ANTHROPIC_API_KEY=<your key>`;

const ROUTE_SNIPPET = `// app/api/chat/route.ts, trimmed
import { createChatHandler } from '${PACKAGE_NAME}/chat/server';
import { createUpstashGuardrails } from '${PACKAGE_NAME}/chat/upstash';

const handler = createChatHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  system: SYSTEM_PROMPT,
  models: CHAT_MODELS,
  tools: [lookupTool],   // a tool may answer with a card
  askUser: true,         // let a reply end in answers to pick
  guardrails: createUpstashGuardrails({ url, token, salt }),
});

export const POST = (request: Request) => handler(request);`;

const UI_INSTALL_SNIPPET = `npm install ${PACKAGE_NAME} ${(chatWidget.peers["./chat"] ?? []).join(" ")}`;

const LOCALE_SNIPPET = `<ChatLauncher
  label="Preguntar"
  widget={{
    title: 'Asistente',
    sendLabel: 'Enviar',
    closeLabel: 'Cerrar el chat',
    composerLabels: { attachLabel: 'Adjuntar archivos' },
    questionCardLabels: { skip: 'Omitir', skipped: 'Omitida' },
  }}
/>`;

const UI_MOUNT_SNIPPET = `import { ChatProvider, ChatLauncher } from '${PACKAGE_NAME}/chat';
import '${PACKAGE_NAME}/chat/chat.css';

export function Chat() {
  return (
    <ChatProvider endpoint="/api/chat" followups={false} feedback={false}>
      <ChatLauncher
        label="Ask"
        widget={{
          title: 'Assistant',
          starters: [{ id: 'start', label: 'How do I get started?' }],
        }}
      />
    </ChatProvider>
  );
}`;

const SCRIPT_SNIPPET = `import { ChatProvider, ChatLauncher, scriptChat } from '${PACKAGE_NAME}/chat';

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

const HOST_SNIPPET = `/* Make room for the panel only when it docks. */
@media ${DOCK_QUERY} {
  html[data-chat="docked"] body { padding-right: var(--ds-chat-width); }
  html[data-chat="docked-left"] body { padding-left: var(--ds-chat-width); }
}

/* On a phone the chat is the page. Hide what is behind it. */
@media ${TAKEOVER_QUERY} {
  html[data-chat="takeover"] .site-chrome { display: none; }
}`;

const STREAM_SNIPPET = `// POST /api/chat, one JSON object per line
{"type":"status","label":"Thinking"}
{"type":"delta","text":"Create a workspace from the dashboard, "}
{"type":"delta","text":"then invite your team."}
{"type":"card","card":{"kind":"chart","data":{"title":"Trial signups"}}}
{"type":"done"}`;

/* One line per event kind, typed against the protocol: a kind added to the
   union without a line here fails the build rather than the page. */
const ARTIFACT_SNIPPET = `// What the server sends, as one line of the stream:
// {"type":"card","card":{"kind":"${ARTIFACT_CARD_KIND}","data":{
//   "id":"launch-page","title":"Launch page","kind":"html",
//   "meta":"Web page","html":"<!doctype html>..."}}}

<ChatProvider
  endpoint="/api/chat"
  artifactRenderers={{
    // A kind of your own, drawn as live components.
    "sales-board": (artifact) => <SalesBoard data={artifact.data} />,
  }}
>
  <ChatLauncher widget={{ artifacts: true }} />
</ChatProvider>`;

const EVENT_LINES: Record<ChatEvent["type"], string> = {
  status: "What the model is doing, shown while it thinks. An optional trace point collects under it.",
  model: "The model serving this reply, as a label.",
  models: "The default model and any the budget has locked. The picker follows it.",
  delta: "A piece of reply text. The first one ends the thinking phase.",
  exchange: "The server's log id for the reply. Its presence shows the thumbs.",
  followups: "Questions to offer under the finished reply.",
  content: "Rich content as a React node. Only a transport in the browser can send one.",
  card: "Rich content as data, drawn by your renderers by kind. What a server sends.",
  question: "Questions the agent asks with answers to pick, drawn in place of the follow-ups.",
  notice: "A limit's reply, shown as an ordinary message.",
  error: "A failure the person should see. Only before the first delta.",
  done: "The reply is complete. Always last.",
};

const USE_CHAT_SNIPPET = `import { useChat, createFetchTransport } from '${PACKAGE_NAME}/chat';

const transport = createFetchTransport('/api/chat');

export function MyChat() {
  const chat = useChat(transport);

  return (
    <>
      {chat.turns.map((turn) => (
        <p key={turn.id}>{turn.text}</p>
      ))}
      {chat.live && <p>{chat.live.text}</p>}
      <form onSubmit={(e) => { e.preventDefault(); chat.send(draft); }}>
        ...
      </form>
    </>
  );
}`;

const THREADS_SNIPPET = `import { useChat, useThreads } from '${PACKAGE_NAME}/chat';

const chat = useChat(transport);
const threads = useThreads(chat, {
  groups: savedGroups,          // where to start from
  nameThread: (n) => \`Chat \${n}\`,  // or a promise from your own namer
  onRename: save,
  onDelete: remove,
});

// threads.groups, threads.activeThreadId, threads.select(id),
// threads.rename(id, title), threads.remove(id), threads.togglePin(id)`;

const TRANSPORT_SNIPPET = `import type { ChatTransport } from '${PACKAGE_NAME}/chat';

// A transport is one function: the conversation in, events out.
const transport: ChatTransport = async function* (messages, signal) {
  yield { type: 'status', label: 'Thinking' };
  for await (const text of myBackend(messages, signal)) {
    yield { type: 'delta', text };
  }
  yield { type: 'done' };
};`;

const DIRECTOR_SNIPPET = `import { useChatWidget } from '${PACKAGE_NAME}/chat';

// Under a ChatProvider: drive the chat from anywhere in the tree.
const { send, setDraft, injectTurn, stop, reset, setOpen } = useChatWidget();

setOpen(true);
setDraft('How is the trial going?');
send('How is the trial going?');
injectTurn({ role: 'assistant', text: 'A turn the model never said.' });`;

const SHADCN_SNIPPET = `npx shadcn@latest add ${SITE_URL}/r/${chatWidget.slug}.json`;

export default function ChatInstallPage() {
  return (
    <>
      <MegaNav />

      <div className={s.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={s.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${s.pageHeader} animate-in`}>
            <h1 className={s.pageTitle}>Add AI chat</h1>
          </div>

          <div className={`${s.introSection} animate-in animate-delay-1`}>
            <p className={s.subDisplay}>A complete chat, added with one command</p>
            <p className={s.introBody}>
              The package ships the whole AI chat assembled: the panel in its docked, overlay and
              full-screen forms, the streaming replies with their status and reasoning, the cards a
              reply can carry, the thread history and tabs, the agent pane, the artifact panel for
              what a reply makes, the composer with files
              and mentions, and the server handlers behind it all. The chat in the corner of this
              page is it. Every option is a prop, listed on{" "}
              <Link href={`/components/${chatWidget.slug}`} className={s.inlineLink}>
                its component page
              </Link>
              , and{" "}
              <Link href="/playground?view=chat" className={s.inlineLink}>
                the playground
              </Link>{" "}
              stages it with every option live.
            </p>
            <p className={s.introBody}>
              There are three ways to add it. The full install adds everything to a Next.js app
              with one command; bring a key. UI only puts the chat panel over an endpoint you
              already have. Headless gives you the engine under your own design. The packages are
              at the end.
            </p>
          </div>

          {/* ------------------------------------------------------ full */}
          <section id="full-install" className={`${s.section} animate-in animate-delay-2`}>
            <SectionTitle title="Full install" />
            <p className={s.sectionNote}>
              For a Next.js app. The command writes the chat routes, their limits, a mount and an env
              example. It never overwrites a file, so it is safe to run again.
            </p>
            <h3 className={s.propsHeading}>Run it</h3>
            <CodeBlock code={INSTALL_SNIPPET} language="bash" showCopy />
            <p className={s.sectionNote}>What it writes:</p>
            <CodeBlock code={SCAFFOLD_FILES.join("\n")} language="text" />
            <p className={s.sectionNote}>
              It then lists the peers to install. One of them, <code>recharts</code>, is only for the
              scripted demo: the mount imports <code>{PACKAGE_NAME}/chat/demo</code> so the chat plays
              a conversation with chart cards before you have a key. Delete that import when you go
              live and <code>recharts</code> can go with it. If your <code>.gitignore</code> ignores{" "}
              <code>.env*</code>, as a fresh <code>create-next-app</code> does, the env example is
              ignored too; the command says so, and <code>git add -f</code> commits it.
            </p>

            <h3 className={s.propsHeading}>Mount it once</h3>
            <p className={s.sectionNote}>
              At the end of the root layout, after the page content, so the chat survives page
              changes and sits last in the tab order.
            </p>
            <CodeBlock code={MOUNT_SNIPPET} language="tsx" showCopy />

            <h3 className={s.propsHeading}>Set the env</h3>
            <p className={s.sectionNote}>
              Copy what you need from the example into your local env. Demo mode works with nothing
              set, Redis is optional, and the caps have defaults.
            </p>
            <Table
              bordered
              size="compact"
              caption="Environment variables"
              captionHidden
              columns={[
                { key: "name", header: "Variable", width: "40%" },
                { key: "what", header: "What it does" },
              ]}
              rows={ENV_VARS.map((row) => ({
                id: row.name,
                cells: { name: <code className={s.defKey}>{row.name}</code>, what: row.what },
              }))}
            />

            <h3 className={s.propsHeading}>Go live</h3>
            <p className={s.sectionNote}>
              Demo mode plays a written conversation with no key. Turn it off, add the key and enable
              the routes. Until both are set, the routes answer with a notice. The key never reaches
              the browser.
            </p>
            <CodeBlock code={LIVE_SNIPPET} language="bash" showCopy />

            <h3 className={s.propsHeading}>The routes</h3>
            <p className={s.sectionNote}>
              Each handler is a plain function from a request to a response, so it mounts on any
              framework. You set the prompt, the models, the tools and the limits. A tool can answer
              with a chart, a plan or a card. With <code>askUser</code> on, a reply can end in a
              question with answers to pick, drawn in place of the follow-ups. A limit answers as a
              normal reply, never a broken chat.
            </p>
            <CodeBlock code={ROUTE_SNIPPET} language="ts" showCopy />

            <h3 className={s.propsHeading}>Limits</h3>
            <p className={s.sectionNote}>
              With Redis set, every visitor is rate limited and the day has a spend cap: the chat
              steps down to the cheaper model as the day fills, locks the dearer one near the cap,
              and logs each exchange for the thumbs. Without Redis, everything is allowed and nothing
              is logged.
            </p>
            <ArchitectureMap
              map={chatExchangeMap}
              caption="One exchange on this site: the prose answers from the corpus, the contracts from the lookup tools, and the limits pick the model."
            />
          </section>

          {/* --------------------------------------------------- ui only */}
          <section id="ui-only" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="UI only" />
            <p className={s.sectionNote}>
              The chat panel over your own endpoint. Your server sends the events; the panel does the
              streaming, the history, the cards and the screens. Three components, set up with props.
            </p>
            <h3 className={s.propsHeading}>Install</h3>
            <p className={s.sectionNote}>The package and the two peers the panel reads markdown with.</p>
            <CodeBlock code={UI_INSTALL_SNIPPET} language="bash" showCopy />

            <h3 className={s.propsHeading}>Mount it once</h3>
            <p className={s.sectionNote}>
              The provider holds the conversation and points at your endpoint. The launcher is the
              button and the panel. Turn follow-ups and feedback on when you have routes for them.
            </p>
            <CodeBlock code={UI_MOUNT_SNIPPET} language="tsx" showCopy />

            <h3 className={s.propsHeading}>Try it with no key</h3>
            <p className={s.sectionNote}>
              A script is a transport. Write the exchange in advance and the panel plays it back with
              everything: the thinking, the reveal, the cards, the chips. The examples on the
              component page are these.
            </p>
            <CodeBlock code={SCRIPT_SNIPPET} language="tsx" showCopy />

            <h3 className={s.propsHeading}>Three components</h3>
            <p className={s.sectionNote}>
              A provider, a surface and a launcher. A transport, one function, joins them to any
              backend.
            </p>
            <ArchitectureMap
              map={widgetMap}
              caption="The client half: one provider, two surfaces, and a transport that is the whole integration."
            />

            <h3 className={s.propsHeading}>The host page</h3>
            <p className={s.sectionNote}>
              The launcher marks the page while the panel is open. Your stylesheet makes room, and
              only when it docks: beside the page at {DOCK_QUERY.replace(/[()]/g, "")}, the whole
              screen under {TAKEOVER_QUERY.replace(/[()]/g, "")}. The rails sit inline from{" "}
              {THREADS_RAIL_MIN_WIDTH}px and {ASIDE_RAIL_MIN_WIDTH}px of panel width. A suggestion
              chip holds {SUGGESTION_MAX_CHARS} characters, and a longer one is dropped.
            </p>
            <CodeBlock code={HOST_SNIPPET} language="css" showCopy />
            <h3 className={s.propsHeading}>In your language</h3>
            <p className={s.sectionNote}>
              Every word the panel writes is a prop, with the English text as its default: the
              names of its controls, the copy on screen, and the words of the components inside it,
              one grouped prop per component (<code>composerLabels</code>,{" "}
              <code>questionCardLabels</code> and the rest). Leave a key out and it keeps its
              English. Under your own UI, <code>useThreads</code> takes <code>labels</code> for the
              names it writes into the history.
            </p>
            <CodeBlock code={LOCALE_SNIPPET} language="tsx" showCopy />

            <h3 className={s.propsHeading}>What your endpoint sends</h3>
            <p className={s.sectionNote}>
              A stream of events, one JSON object per line. Start with status, end with done. Send a
              card for a chart, a plan or a diff, and a notice for a limit, never an error page.
            </p>
            <CodeBlock code={STREAM_SNIPPET} language="json" showCopy />
            <dl className={s.defList}>
              {CHAT_EVENT_KINDS.map((kind) => (
                <div key={kind} className={s.defRow}>
                  <dt className={s.defKey}>{kind}</dt>
                  <dd className={s.defWhat}>{EVENT_LINES[kind]}</dd>
                </div>
              ))}
            </dl>

            <h3 className={s.propsHeading}>Artifacts</h3>
            <p className={s.sectionNote}>
              An artifact is something a reply makes that wants more room than a turn: a
              dashboard, a page, a file. Send it as a card of kind {ARTIFACT_CARD_KIND} and turn{" "}
              <code>artifacts</code> on. The thread shows a tile, and the tile opens the artifact in
              a panel beside the conversation, from {ASIDE_RAIL_MIN_WIDTH}px of chat width, or
              as a sheet below that. An <code>html</code> document or a <code>url</code> is drawn
              in a sandboxed frame with no reach into your page. For live components, give the
              artifact a kind of your own and draw it with the provider&apos;s{" "}
              <code>artifactRenderers</code>.
            </p>
            <CodeBlock code={ARTIFACT_SNIPPET} language="tsx" showCopy />
          </section>

          {/* -------------------------------------------------- headless */}
          <section id="headless" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Headless" />
            <p className={s.sectionNote}>
              The engine under your own UI. Two hooks, two transports and one event contract. Render
              the conversation however you like; the pacing, the history and the protocol are already
              handled.
            </p>
            <h3 className={s.propsHeading}>The conversation</h3>
            <p className={s.sectionNote}>
              Give the hook a transport. It hands back the turns, the reply in flight, and the
              controls: send, stop and reset. The reveal is paced for you. A turn that asks
              carries its <code>question</code>; draw it with the question card, then pass what was
              picked to <code>answerQuestion</code>, which sends it as the next message, or call{" "}
              <code>skipQuestion</code>. Sending a follow-up chip through{" "}
              <code>chooseFollowup</code> keeps the choice on its turn.
            </p>
            <CodeBlock code={USE_CHAT_SNIPPET} language="tsx" showCopy />

            <h3 className={s.propsHeading}>The threads</h3>
            <p className={s.sectionNote}>
              A second hook turns one conversation into many: born on the first message, named a
              beat later. Pin, rename and delete, tabs that follow the open threads, your own namer
              and your own store.
            </p>
            <CodeBlock code={THREADS_SNIPPET} language="ts" showCopy />

            <h3 className={s.propsHeading}>Your own transport</h3>
            <p className={s.sectionNote}>
              A transport is a function from the conversation to a stream of events. Write one for
              any backend. The fetch transport reads the server handler&apos;s stream and a script
              plays a written one; the hook cannot tell them apart. The events are listed under UI
              only above.
            </p>
            <CodeBlock code={TRANSPORT_SNIPPET} language="ts" showCopy />

            <h3 className={s.propsHeading}>Drive it from anywhere</h3>
            <p className={s.sectionNote}>
              Under a provider, any component can open the chat, fill the draft, send, or stage a
              turn. A staged turn never reaches the model.
            </p>
            <CodeBlock code={DIRECTOR_SNIPPET} language="ts" showCopy />
          </section>

          {/* -------------------------------------------------- packages */}
          <section id="packages" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Packages" />
            <p className={s.sectionNote}>
              The chat lives in its own subpaths, each with the peers it needs. Or copy the source
              into your app with shadcn.
            </p>
            <dl className={s.defList}>
              {Object.entries(chatWidget.subpaths).map(([subpath, what]) => (
                <div key={subpath} className={s.defRow}>
                  <dt className={s.defKey}>
                    {PACKAGE_NAME}
                    {subpath.slice(1)}
                  </dt>
                  <dd className={s.defWhat}>{what}</dd>
                  {chatWidget.peers[subpath] && (
                    <dd className={s.defMeta}>Peers: {chatWidget.peers[subpath].join(", ")}</dd>
                  )}
                </div>
              ))}
            </dl>
            <CodeBlock code={SHADCN_SNIPPET} language="bash" showCopy />
          </section>
        </main>
      </div>
    </>
  );
}
