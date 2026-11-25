/**
 * rift-ds/markdown: the two elements a markdown renderer has to map for
 * rendered markdown to be drawn by the system, with no dependencies.
 *
 * Prose styles every element markdown produces, so a renderer's output
 * placed inside `<Prose>` needs no element map of its own. Two things only
 * the renderer can supply, because Prose styles markup it does not render:
 *
 * - `MarkdownCode`, for `pre`: a fenced block becomes the library CodeBlock,
 *   so a snippet is one click from the clipboard and reads its language from
 *   the fence's info string.
 * - `MarkdownScrollTable`, for `table`: Prose makes a wide table its own
 *   scroll container, and a scrollable region has to be reachable without a
 *   mouse, so the table takes `tabIndex`.
 *
 * `markdownComponents` is both, in the shape react-markdown's `components`
 * prop and an MDX provider take. This module ships no renderer: bring
 * react-markdown, MDX or another one, and wrap its output in Prose.
 *
 * Neither component uses a hook, so both render from a Server Component.
 */
import { MarkdownCode, MarkdownScrollTable } from './mappers';

export { MarkdownCode, MarkdownScrollTable } from './mappers';
export type { MarkdownCodeLabels, MarkdownCodeProps, MarkdownScrollTableProps } from './mappers';

/** Both mappers, in the shape a renderer's `components` option takes. Spread it and add your own entries beside them. */
export const markdownComponents = {
  pre: MarkdownCode,
  table: MarkdownScrollTable,
};
