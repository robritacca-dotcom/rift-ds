/**
 * The chat widget's registry accessor (registry.json beside it).
 *
 * One entry by design: the composed chat is the package's fourth kind of
 * thing, between the components and the templates. Its implementation is
 * src/chat/ behind the hand-written barrel index.ts, and the engine
 * (useChat, the transports, useThreads, the ChatEvent protocol in types.ts)
 * is importable on its own under the widget.
 *
 * The site renders the entry on two pages: its component page under
 * /components/<slug>, which joins the component `category` it names in the
 * components index, sidebar and summaries through `componentPages` in
 * website/src/data/component-pages.ts (the one merged list of components
 * and widgets every component surface reads), and /docs/chat, how to add it.
 * The site corpus carries it, and /api/mcp serves its `documented` props
 * through the component API. scripts/validate-chat-widget.mjs holds every
 * field to what it describes.
 */
import registry from './registry.json';

/** One widget's metadata, as the registry records it. */
export interface ChatWidgetMeta {
  name: string;
  slug: string;
  label: string;
  description: string;
  /** The component category whose /components section and sidebar group the widget's page joins. */
  category: string;
  /** The init bin's subcommand that scaffolds it. */
  command: string;
  /** Each package subpath the widget occupies, with what it holds. */
  subpaths: Record<string, string>;
  /** The optional peer dependencies each subpath needs. */
  peers: Record<string, string[]>;
  /** The library components the widget composes. */
  parts: string[];
  /** The exported components whose props are documented through docgen. */
  documented: string[];
}

export const chatWidgetRegistry: { widgets: ChatWidgetMeta[] } = registry;

/** The one widget, by design. */
export const chatWidget: ChatWidgetMeta = registry.widgets[0];

export const WIDGET_COUNT = registry.widgets.length;
