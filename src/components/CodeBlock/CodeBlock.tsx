'use client';

import React, { useId, useState, type CSSProperties } from 'react';
import { MOTION_FEEDBACK_RESET_MS } from '../../tokens/motion';
import './CodeBlock.css';
import '../../fonts/material-symbols.css';

/** Props owned by CodeBlock itself — everything else falls through to the root div. */
type CodeBlockOwnProps = {
  /** The code to display, as a plain string */
  code: string;
  /** Language tag shown in the header, e.g. "tsx", "css" */
  language?: string;
  /** Filename shown in the header, e.g. "tokens-light.css" */
  filename?: string;
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

/**
 * CodeBlock component — monospace code with an optional header row
 * (filename, language tag) and a copy-to-clipboard button. Forwards a ref
 * to the root div and spreads native attributes onto it.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      filename,
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
    const [copied, setCopied] = useState(false);
    const [collapsed, setCollapsed] = useState(collapsible && defaultCollapsed);
    const panelId = useId();

    const classes = [
      baseClass,
      collapsed ? `${baseClass}--collapsed` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const rootStyle =
      maxHeight !== undefined
        ? ({
            ...style,
            '--ds-code-block-max-height':
              typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          } as CSSProperties)
        : style;
    const hasHeader = Boolean(filename || language || showCopy || collapsible);
    const regionLabel =
      codeLabel ?? (filename ? `Code: ${filename}` : language ? `Code: ${language}` : 'Code');

    const copy = () => {
      // Textarea fallback for contexts where the async clipboard API is
      // unavailable or permission-gated (embedded browsers, http)
      const fallback = () => {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      };

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code).catch(fallback);
      } else {
        fallback();
      }

      onCopied?.();
      setCopied(true);
      window.setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
    };

    return (
      <div {...rest} ref={ref} className={classes} style={rootStyle}>
        {hasHeader && (
          <div className={`${baseClass}__header`}>
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
              {filename && <code className={`${baseClass}__filename`}>{filename}</code>}
              {language && <span className={`${baseClass}__language`}>{language}</span>}
            </div>
            {showCopy && (
              <button
                type="button"
                className={`${baseClass}__copy`}
                onClick={copy}
                aria-label={copied ? copiedLabel : copyLabel}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? copiedLabel : copyText}
              </button>
            )}
          </div>
        )}
        <div id={panelId} className={`${baseClass}__panel`} aria-hidden={collapsed || undefined}>
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
              role="region"
              aria-label={regionLabel}
            >
              <code className={`${baseClass}__code`}>{code}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';
