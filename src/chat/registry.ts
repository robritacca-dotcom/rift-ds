import registry from './registry.json';

/** One widget's metadata, as the registry records it. */
export interface ChatWidgetMeta {
  name: string;
  slug: string;
  label: string;
  description: string;
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
