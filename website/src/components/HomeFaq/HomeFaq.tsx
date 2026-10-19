/**
 * The home page's closing questions: what a stranger asks before trying the
 * package, each answered in a few sentences with a link to the page that
 * owns the fact. Every count is a registry import, never a typed number.
 */

import Link from "next/link";
import { Accordion } from "rift-ds/components/Accordion/Accordion";
import { COMPONENT_COUNT } from "rift-ds/components/registry";
import { THEME_SELECTOR_ORDER } from "@/lib/theme/presets";
import styles from "./HomeFaq.module.css";

const ITEMS = [
  {
    id: "what",
    title: "What is Rift?",
    content: (
      <p>
        A React design system on npm as <code>rift-ds</code>: {COMPONENT_COUNT} components,
        the semantic tokens they are styled from, theme presets, template screens and an AI
        chat you can drop into an app. Every page of this site is built from it.
      </p>
    ),
  },
  {
    id: "tailwind",
    title: "Do I need Tailwind or another UI library?",
    content: (
      <p>
        No. Components are styled with plain CSS that reads the tokens, so there is no CSS
        framework to set up. React 19 and React DOM are the only required peers. Recharts is
        needed for the charts alone, and the AI chat brings a few optional packages of its own.
      </p>
    ),
  },
  {
    id: "install",
    title: "How do I install it?",
    content: (
      <p>
        Run <code>npm install rift-ds</code>, import the token stylesheet once, then import
        components by name. To own the source instead, add any component from the shadcn
        registry. <Link href="/docs/get-started">Get started</Link> has both paths.
      </p>
    ),
  },
  {
    id: "agents",
    title: "Does it work with Claude Code, Cursor or Codex?",
    content: (
      <p>
        Yes. A public MCP endpoint serves every component&apos;s props, the tokens and the
        install steps to any MCP client. <code>npx rift-ds init</code> adds agent skills that
        teach your agent the library, how to move an existing screen onto it, and how to
        audit styles against the tokens.
      </p>
    ),
  },
  {
    id: "themes",
    title: "Can it look like my brand?",
    content: (
      <>
        <p>
          Yes, all of it. Every colour, radius, typeface, spacing step, shadow and duration is a
          token, and the components are styled from those tokens. Change a token and every component that uses
          it follows, in light and dark, with no component code touched.
        </p>
        <p>
          The <Link href="/playground">playground</Link> is the quick way in: move the sliders
          or drop in an image of your brand, then export the result as CSS. The{" "}
          {THEME_SELECTOR_ORDER.length} themes in the package are there to use as they are or to
          start from: import <code>presets.css</code> once, then each is one attribute,{" "}
          <code>data-brand</code> on the root element.
        </p>
      </>
    ),
  },
  {
    id: "modes",
    title: "Does it work in light and dark mode?",
    content: (
      <p>
        Both, from one token layer. Set <code>data-theme=&quot;dark&quot;</code> on the root
        element and every semantic colour switches, in every theme.
      </p>
    ),
  },
  {
    id: "chat",
    title: "Does the AI chat work with any model?",
    content: (
      <>
        <p>
          Yes. The chat never talks to a model directly: it reads a stream of small events
          from your server, one JSON object per line. <code>{`{"type":"delta","text":"…"}`}</code>{" "}
          carries the reply as it is written, a <code>status</code> event shows what the agent
          is doing, and <code>{`{"type":"done"}`}</code> ends the turn.
        </p>
        <p>
          To use OpenAI, Gemini, a local model or your own agent, write a route that calls it
          and turns each streamed chunk into a <code>delta</code> line, then point{" "}
          <code>createFetchTransport</code> at that route. You can also skip the server format
          and write a transport in the browser: one function that takes the conversation and
          yields the same events.
        </p>
        <p>
          The packaged server half is built for Claude, so the quickest start is an Anthropic
          key and <code>npx rift-ds init chat</code>, which scaffolds the route and the mount.{" "}
          <Link href="/docs/chat">Add the chat</Link> lists every event the panel reads.
        </p>
      </>
    ),
  },
  {
    id: "licence",
    title: "Is it free for client work?",
    content: (
      <p>
        Yes. The package is MIT licensed, every component included. Use it in commercial and
        client projects with nothing to buy and no key to register.
      </p>
    ),
  },
];

export default function HomeFaq() {
  return (
    <section className={styles.section} aria-labelledby="home-faq-title">
      <h2 id="home-faq-title" className={styles.title}>
        Common questions
      </h2>
      <Accordion className={styles.list} items={ITEMS} defaultExpanded={["what"]} />
    </section>
  );
}
