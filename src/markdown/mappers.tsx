/* The two mappers rift-ds/markdown publishes; index.ts owns the module's doc block. */
import React from 'react';
import { CodeBlock, type CodeBlockProps } from '../components/CodeBlock/CodeBlock';

/** The words a fenced block's CodeBlock writes. Every key left out keeps CodeBlock's English. */
export interface MarkdownCodeLabels extends Pick<CodeBlockProps, 'copyLabel' | 'copyText' | 'copiedLabel'> {
  /** The block's accessible name, given the fence's language when it named one. */
  codeLabel?: (language: string | undefined) => string;
}

/* A fenced block's hast, as react-markdown hands it over: a `pre` holding
   one `code` element whose text is the code plus the trailing newline the
   markdown-to-hast step appends. */
type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const hastText = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(hastText).join('');

const nodeText = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return nodeText(node.props.children);
  return '';
};

const fenceLanguage = (classes: unknown): string | undefined =>
  (Array.isArray(classes) ? classes.map(String) : typeof classes === 'string' ? classes.split(/\s+/) : [])
    .find((name) => name.startsWith('language-'))
    ?.slice('language-'.length);

/* The fence's code and language, read from the hast node when the renderer
   passes one (react-markdown), else from the `code` element among the
   children (MDX, which passes elements and no node). */
const readFence = (
  node: HastNode | undefined,
  children: React.ReactNode,
): { code: string; language: string | undefined } | null => {
  const hastCode = node?.children?.find((child) => child.type === 'element' && child.tagName === 'code');
  if (hastCode) {
    return { code: hastText(hastCode), language: fenceLanguage(hastCode.properties?.className) };
  }
  const element = React.Children.toArray(children).find(
    (child): child is React.ReactElement<{ className?: string; children?: React.ReactNode }> =>
      React.isValidElement(child) && child.type === 'code',
  );
  if (!element) return null;
  return { code: nodeText(element.props.children), language: fenceLanguage(element.props.className) };
};

export interface MarkdownCodeProps extends React.ComponentPropsWithoutRef<'pre'> {
  /** The element's hast node, when the renderer passes one (react-markdown does). Never written to the DOM. */
  node?: unknown;
  /** The words the block's CodeBlock writes. */
  labels?: MarkdownCodeLabels;
}

/**
 * A markdown renderer's `pre`: a fenced code block drawn as the library
 * CodeBlock, its language read from the fence's info string. A `pre` that
 * holds no `code` element renders as it came, and native `pre` attributes
 * reach only that plain `pre`: a fenced block is CodeBlock's to draw.
 */
export function MarkdownCode({ node, labels, children, ...props }: MarkdownCodeProps) {
  const fence = readFence(node as HastNode | undefined, children);
  if (!fence) return <pre {...props}>{children}</pre>;
  const { codeLabel, ...rest } = labels ?? {};
  return (
    <CodeBlock
      {...rest}
      codeLabel={codeLabel?.(fence.language)}
      code={fence.code.replace(/\n$/, '')}
      language={fence.language}
    />
  );
}

export interface MarkdownScrollTableProps extends React.ComponentPropsWithoutRef<'table'> {
  /** The element's hast node, when the renderer passes one. Never written to the DOM. */
  node?: unknown;
}

/**
 * A markdown renderer's `table`: the native table, focusable, so the scroll
 * area Prose makes of a wide table is reachable from the keyboard. Never
 * swap this for `role="region"` on the table: that replaces the table
 * semantics.
 */
export function MarkdownScrollTable({ node: _node, children, ...props }: MarkdownScrollTableProps) {
  return (
    <table tabIndex={0} {...props}>
      {children}
    </table>
  );
}
