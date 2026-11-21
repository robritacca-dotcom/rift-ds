'use client';

import React, { useId, useState, type CSSProperties } from 'react';
import { CopyButton } from '../CopyButton/CopyButton';
import { Tabs } from '../Tabs/Tabs';
import { useSyncedChoice } from '../../behaviors/syncedChoice';
import './CodeBlock.css';
import '../../fonts/material-symbols.css';

/** A syntax role a highlighter marks a run of code with. Each is coloured by its `--color-code-*` token. */
export type CodeTokenRole = 'keyword' | 'string' | 'function' | 'constant' | 'comment';

/** One run of code text, optionally marked with a syntax role. */
export interface CodeToken {
  /** The text of the run, exactly as it appears in the source. */
  content: string;
  /** The syntax role, which picks its colour. Leave it out for plain text. */
  role?: CodeTokenRole;
}

/** One line of highlighted code: its runs, in order, with no newline. */
export type CodeLine = CodeToken[];

/** One snippet in a tabbed CodeBlock. */
export interface CodeBlockTab {
  /** Unique value; also the value a `syncKey` shares between blocks. */
  value: string;
  /** Tab label, e.g. "pnpm". */
  label: string;
  /** The snippet, as a plain string. Copied as is. */
  code: string;
  /** The snippet highlighted, as returned by `highlight()` from `rift-ds/code/highlight`. */
  lines?: CodeLine[];
}

/** Props owned by CodeBlock itself — everything else falls through to the root div. */
type CodeBlockOwnProps = {
  /** The code to display, as a plain string. Required unless `lines` or `tabs` supply it. */
  code?: string;
  /**
   * The code highlighted, one array of tokens per line, as returned by
   * `highlight()` from `rift-ds/code/highlight`. Each token is coloured by
   * its role. Without it the code is monochrome. When `code` is left out,
   * the copy button copies the text of these lines.
   */
  lines?: CodeLine[];
  /** Language tag shown in the header, e.g. "tsx", "css" */
  language?: string;
  /** Filename shown in the header, e.g. "tokens-light.css" */
  filename?: string;
  /** Show a line number before each line. */
  showLineNumbers?: boolean;
  /** Line numbers (counted from 1) to mark with a highlighted background, e.g. the lines a step changed. */
  highlightLines?: number[];
  /**
   * Several snippets behind a row of tabs in the header (an install command
   * for each package manager, the same example in two languages). Replaces
   * the filename and language. `packageManagerTabs()` from `rift-ds/code`
   * writes the install case.
   */
  tabs?: CodeBlockTab[];
  /** The selected tab's value (controlled). */
  value?: string;
  /** The initially selected tab's value (uncontrolled). Defaults to the first tab. */
  defaultValue?: string;
  /** Called with the tab's value when the reader picks a tab. */
  onValueChange?: (value: string) => void;
  /**
   * Share the selected tab with every CodeBlock on the page that has the
   * same key, and remember it for the reader's next visit (in
   * localStorage). Ignored while `value` is controlled.
   */
  syncKey?: string;
  /** Accessible name for the tab list. */
  tabsLabel?: string;
  /** Show the copy-to-clipboard button */
  showCopy?: boolean;
  /** Called after the code is put on the clipboard, through the async API or its textarea fallback, so a host can count copies. */
  onCopied?: () => void;
  /** Max height of the block; code scrolls vertically inside while the header stays pinned. Numbers are px. */
  maxHeight?: number | string;
  /** Show a chevron beside the filename that collapses/expands the code area */
  collapsible?: boolean;
  /** Start collapsed (only applies when collapsible) */
  defaultCollapsed?: boolean;
  /** Accessible name for the copy button before it is pressed */
  copyLabel?: string;
  /** Visible text on the copy button before it is pressed */
  copyText?: string;
  /** Text and accessible name the copy button shows once the code is copied */
  copiedLabel?: string;
  /** Accessible name for the collapse toggle while the code is collapsed */
  expandLabel?: string;
  /** Accessible name for the collapse toggle while the code is showing */
  collapseLabel?: string;
  /**
   * Accessible name for the scrollable code region. Defaults to
   * "Code: <filename>", then "Code: <language>", then "Code".
   */
  codeLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface CodeBlockProps
  extends CodeBlockOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CodeBlockOwnProps | 'children'> {}

const linesText = (lines: CodeLine[]) => lines.map((line) => line.map((t) => t.content).join('')).join('\n');

/**
 * CodeBlock component — monospace code with an optional header row
 * (filename, language tag, or a row of tabs) and a copy-to-clipboard
 * button. Highlighted `lines`, line numbers and marked lines are opt-in;
 * plain `code` renders exactly as before. Forwards a ref to the root div and
 * spreads native attributes onto it.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      lines,
      language,
      filename,
      showLineNumbers = false,
      highlightLines,
      tabs,
      value: valueProp,
      defaultValue,
      onValueChange,
      syncKey,
      tabsLabel = 'Code variants',
      showCopy = true,
      onCopied,
      maxHeight,
      collapsible = false,
      defaultCollapsed = false,
      copyLabel = 'Copy code',
      copyText = 'Copy',
      copiedLabel = 'Copied',
      expandLabel = 'Expand code',
      collapseLabel = 'Collapse code',
      codeLabel,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-code-block';
    const [collapsed, setCollapsed] = useState(collapsible && defaultCollapsed);
    const panelId = useId();

    // Tabs: controlled value, else the synced pick, else local state.
    const hasTabs = Boolean(tabs && tabs.length > 0);
    const firstValue = defaultValue ?? tabs?.[0]?.value;
    const [localValue, setLocalValue] = useState(firstValue);
    const [syncedValue, setSyncedValue] = useSyncedChoice(hasTabs ? syncKey : undefined, firstValue);
    const picked = valueProp ?? (syncKey ? syncedValue : localValue);
    const activeTab = hasTabs ? (tabs!.find((t) => t.value === picked) ?? tabs![0]) : undefined;
    const selectTab = (next: string) => {
      if (valueProp === undefined) {
        if (syncKey) setSyncedValue(next);
        else setLocalValue(next);
      }
      onValueChange?.(next);
    };

    const shownLines = activeTab ? activeTab.lines : lines;
    const shownCode = activeTab ? activeTab.code : (code ?? (lines ? linesText(lines) : ''));
    const marked = new Set(highlightLines ?? []);
    const byLine = Boolean(shownLines || showLineNumbers || marked.size > 0);
    const rows: CodeLine[] | null = byLine
      ? (shownLines ?? shownCode.split('\n').map((text) => [{ content: text }]))
      : null;

    const classes = [
      baseClass,
      collapsed ? `${baseClass}--collapsed` : '',
      showLineNumbers ? `${baseClass}--numbered` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const rootStyle = {
      ...style,
      ...(maxHeight !== undefined
        ? { '--ds-code-block-max-height': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }
        : null),
      ...(rows && showLineNumbers ? { '--ds-code-block-gutter': `${String(rows.length).length}ch` } : null),
    } as CSSProperties;
    const hasHeader = Boolean(hasTabs || filename || language || showCopy || collapsible);
    const regionLabel =
      codeLabel ??
      (activeTab
        ? `Code: ${activeTab.label}`
        : filename
          ? `Code: ${filename}`
          : language
            ? `Code: ${language}`
            : 'Code');

    return (
      <div {...rest} ref={ref} className={classes} style={rootStyle}>
        {hasHeader && (
          <div className={`${baseClass}__header${hasTabs ? ` ${baseClass}__header--tabs` : ''}`}>
            <div className={`${baseClass}__meta`}>
              {collapsible && (
                <button
                  type="button"
                  className={`${baseClass}__toggle`}
                  onClick={() => setCollapsed((c) => !c)}
                  aria-expanded={!collapsed}
                  aria-controls={panelId}
                  aria-label={collapsed ? expandLabel : collapseLabel}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    expand_more
                  </span>
                </button>
              )}
              {hasTabs ? (
                <Tabs
                  className={`${baseClass}__tabs`}
                  size="compact"
                  aria-label={tabsLabel}
                  tabs={tabs!.map((t) => ({ value: t.value, label: t.label, panelId }))}
                  value={activeTab!.value}
                  onValueChange={selectTab}
                />
              ) : (
                <>
                  {filename && <code className={`${baseClass}__filename`}>{filename}</code>}
                  {language && <span className={`${baseClass}__language`}>{language}</span>}
                </>
              )}
            </div>
            {showCopy && (
              <CopyButton
                className={`${baseClass}__copy`}
                value={shownCode}
                onCopied={() => onCopied?.()}
                copyText={copyText}
                copyLabel={copyLabel}
                copiedLabel={copiedLabel}
              />
            )}
          </div>
        )}
        <div
          id={panelId}
          className={`${baseClass}__panel`}
          aria-hidden={collapsed || undefined}
          role={hasTabs ? 'tabpanel' : undefined}
          aria-label={hasTabs ? activeTab!.label : undefined}
        >
          <div className={`${baseClass}__panel-inner`}>
            {/*
              tabIndex + an accessible name make the scroll container reachable:
              long lines scroll horizontally, and without a tab stop a keyboard
              user has no way to reach that scroll.
            */}
            <pre
              className={`${baseClass}__pre`}
              // -1 while collapsed: the panel is aria-hidden then, and a focusable
              // element inside aria-hidden content is unreachable yet still tabbable.
              tabIndex={collapsed ? -1 : 0}
              // In a tabbed block the tab panel names the code, and a page
              // of install blocks would otherwise repeat one region name.
              role={hasTabs ? undefined : 'region'}
              aria-label={hasTabs ? undefined : regionLabel}
            >
              {rows ? (
                <code className={`${baseClass}__code ${baseClass}__code--lines`}>
                  {rows.map((line, index) => (
                    <span
                      key={index}
                      className={`${baseClass}__line${marked.has(index + 1) ? ` ${baseClass}__line--marked` : ''}`}
                    >
                      {showLineNumbers && (
                        <span className={`${baseClass}__line-number`} aria-hidden="true">
                          {index + 1}
                        </span>
                      )}
                      <span className={`${baseClass}__line-text`}>
                        {line.map((token, t) =>
                          token.role ? (
                            <span key={t} className={`${baseClass}__token ${baseClass}__token--${token.role}`}>
                              {token.content}
                            </span>
                          ) : (
                            token.content
                          ),
                        )}
                      </span>
                    </span>
                  ))}
                </code>
              ) : (
                <code className={`${baseClass}__code`}>{shownCode}</code>
              )}
            </pre>
          </div>
        </div>
      </div>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';
