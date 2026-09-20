// No 'use client' directive: CodeDiff is purely presentational — no hooks, no
// event handlers — so it stays renderable from a React Server Component.

import React from 'react';
import './CodeDiff.css';

/** The kind of line a parsed diff row represents. */
export type CodeDiffLineType = 'add' | 'remove' | 'context' | 'hunk';

export interface CodeDiffLine {
  /** Whether the line is an addition, a removal, unchanged context, or a hunk header */
  type: CodeDiffLineType;
  /** The line's text with its diff marker stripped (hunk headers keep the full `@@` line) */
  content: string;
  /** Line number in the old file, or null for additions and hunk headers */
  oldLine: number | null;
  /** Line number in the new file, or null for removals and hunk headers */
  newLine: number | null;
}

export interface ParsedCodeDiff {
  /** The diff's rows in order, with per-side line numbers computed */
  lines: CodeDiffLine[];
  /** Count of added lines */
  additions: number;
  /** Count of removed lines */
  deletions: number;
}

const HUNK_HEADER = /^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/;

/**
 * Parse a unified-format diff body into typed lines with old/new line
 * numbers. Lines starting with `+` are additions, `-` removals, `@@ … @@`
 * hunk headers, and everything else context. File header lines (`+++`,
 * `---`) and no-newline markers (`\ No newline at end of file`) carry no
 * content and are skipped. A diff with no hunk headers is treated as one
 * hunk starting at line 1.
 */
// eslint-disable-next-line react-refresh/only-export-components -- the parser is part of CodeDiff's public API and lives with the component that renders its output
export function parseUnifiedDiff(diff: string): ParsedCodeDiff {
  const rawLines = diff.replace(/\n$/, '').split('\n');
  const lines: CodeDiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let oldLine = 1;
  let newLine = 1;

  for (const raw of rawLines) {
    // File headers name the two sides; the no-newline marker is metadata.
    // Neither consumes a line on either side of the diff.
    if (raw.startsWith('+++') || raw.startsWith('---') || raw.startsWith('\\')) {
      continue;
    }

    const hunk = raw.match(HUNK_HEADER);
    if (hunk) {
      oldLine = parseInt(hunk[1], 10);
      newLine = parseInt(hunk[2], 10);
      lines.push({ type: 'hunk', content: raw, oldLine: null, newLine: null });
      continue;
    }

    if (raw.startsWith('+')) {
      additions += 1;
      lines.push({ type: 'add', content: raw.slice(1), oldLine: null, newLine });
      newLine += 1;
      continue;
    }

    if (raw.startsWith('-')) {
      deletions += 1;
      lines.push({ type: 'remove', content: raw.slice(1), oldLine, newLine: null });
      oldLine += 1;
      continue;
    }

    // Context: unified diffs prefix these with one space; a headerless
    // plain diff may not, so only strip the space when it is there.
    lines.push({
      type: 'context',
      content: raw.startsWith(' ') ? raw.slice(1) : raw,
      oldLine,
      newLine,
    });
    oldLine += 1;
    newLine += 1;
  }

  return { lines, additions, deletions };
}

/** Props owned by CodeDiff itself — everything else falls through to the root div. */
type CodeDiffOwnProps = {
  /**
   * A unified-format diff body. Lines starting with `+` render as additions,
   * `-` as removals, `@@ … @@` as hunk headers, everything else as context;
   * `+++`/`---` file header lines are ignored. Without hunk headers the
   * whole string is treated as one hunk starting at line 1.
   */
  diff: string;
  /** Filename shown in a header bar above the diff, with an additions/deletions summary */
  filename?: string;
  /** Show the old and new line number gutters */
  showLineNumbers?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface CodeDiffProps
  extends CodeDiffOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CodeDiffOwnProps> {}

const CHANGE_LABELS: Partial<Record<CodeDiffLineType, string>> = {
  add: 'Added line:',
  remove: 'Removed line:',
};

/**
 * CodeDiff component — unified diff view for code changes. Added lines tint
 * with the positive status background, removed lines with the error one, and
 * two gutters track old and new line numbers. Purely presentational: parsing
 * happens in the exported `parseUnifiedDiff`, long lines scroll horizontally
 * inside the block, and the change type is announced through visually hidden
 * text while the marker column stays decorative.
 */
export const CodeDiff = React.forwardRef<HTMLDivElement, CodeDiffProps>(
  ({ diff, filename, showLineNumbers = true, className = '', ...rest }, ref) => {
    const baseClass = 'ds-codediff';
    const { lines, additions, deletions } = parseUnifiedDiff(diff);

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {filename && (
          <div className={`${baseClass}__header`}>
            <code className={`${baseClass}__filename`}>{filename}</code>
            <span className={`${baseClass}__stats`}>
              <span className={`${baseClass}__stat ${baseClass}__stat--add`}>
                +{additions}
                <span className={`${baseClass}__sr-only`}> added</span>
              </span>
              <span className={`${baseClass}__stat ${baseClass}__stat--remove`}>
                -{deletions}
                <span className={`${baseClass}__sr-only`}> removed</span>
              </span>
            </span>
          </div>
        )}

        {/*
          tabIndex + an accessible name make the scroll container reachable:
          long lines scroll horizontally, and without a tab stop a keyboard
          user has no way to reach that scroll.
        */}
        <div
          className={`${baseClass}__scroll`}
          tabIndex={0}
          role="region"
          aria-label={filename ? `Code diff: ${filename}` : 'Code diff'}
        >
          <ol className={`${baseClass}__lines`}>
            {lines.map((line, index) => {
              const changeLabel = CHANGE_LABELS[line.type];
              return (
                <li
                  key={index}
                  className={[
                    `${baseClass}__line`,
                    line.type === 'add' ? `${baseClass}__line--add` : '',
                    line.type === 'remove' ? `${baseClass}__line--remove` : '',
                    line.type === 'hunk' ? `${baseClass}__line--hunk` : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {showLineNumbers && (
                    <>
                      <span className={`${baseClass}__gutter`} aria-hidden="true">
                        {line.oldLine ?? ''}
                      </span>
                      <span className={`${baseClass}__gutter`} aria-hidden="true">
                        {line.newLine ?? ''}
                      </span>
                    </>
                  )}
                  <span className={`${baseClass}__marker`} aria-hidden="true">
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ''}
                  </span>
                  {changeLabel && (
                    <span className={`${baseClass}__sr-only`}>{changeLabel} </span>
                  )}
                  <span className={`${baseClass}__content`}>{line.content}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  },
);

CodeDiff.displayName = 'CodeDiff';
