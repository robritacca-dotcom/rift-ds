// No 'use client' directive: CodeDiff is purely presentational — no hooks, no
// event handlers — so it stays renderable from a React Server Component.

import React from 'react';
import './CodeDiff.css';
import '../../behaviors/visually-hidden.css';

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

const HUNK_HEADER = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/;

/**
 * Parse a unified-format diff body into typed lines with old/new line
 * numbers. Lines starting with `+` are additions, `-` removals, `@@ … @@`
 * hunk headers, and everything else context. File header lines (a `---`
 * line directly followed by a `+++` line, outside a hunk's counted body)
 * and no-newline markers (`\ No newline at end of file`) carry no content
 * and are skipped, so a removed `-- comment` or an added `++i` stays a
 * content line. A diff with no hunk headers is treated as one hunk starting
 * at line 1.
 */
// eslint-disable-next-line react-refresh/only-export-components -- the parser is part of CodeDiff's public API and lives with the component that renders its output
export function parseUnifiedDiff(diff: string): ParsedCodeDiff {
  const rawLines = diff.replace(/\n$/, '').split('\n');
  const lines: CodeDiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let oldLine = 1;
  let newLine = 1;
  // Lines a hunk header says are still to come on each side. Inside that
  // counted body every line is content, whatever it starts with.
  let oldRemaining = 0;
  let newRemaining = 0;
  // Set when a `---` header was skipped, so the `+++` after it goes too.
  let inFileHeader = false;

  for (let index = 0; index < rawLines.length; index += 1) {
    const raw = rawLines[index];

    // The no-newline marker is metadata and consumes no line on either side.
    if (raw.startsWith('\\')) continue;

    // File headers come as a pair, `---` then `+++`, and name the two sides.
    // Matching the pair rather than either prefix alone keeps a removed
    // `-- comment` (`--- comment`) or an added `++i` (`+++i`) as content.
    if (oldRemaining <= 0 && newRemaining <= 0) {
      if (raw.startsWith('---') && rawLines[index + 1]?.startsWith('+++')) {
        inFileHeader = true;
        continue;
      }
      if (inFileHeader && raw.startsWith('+++')) {
        inFileHeader = false;
        continue;
      }
    }
    inFileHeader = false;

    const hunk = raw.match(HUNK_HEADER);
    if (hunk) {
      oldLine = parseInt(hunk[1], 10);
      newLine = parseInt(hunk[3], 10);
      oldRemaining = hunk[2] === undefined ? 1 : parseInt(hunk[2], 10);
      newRemaining = hunk[4] === undefined ? 1 : parseInt(hunk[4], 10);
      lines.push({ type: 'hunk', content: raw, oldLine: null, newLine: null });
      continue;
    }

    if (raw.startsWith('+')) {
      additions += 1;
      lines.push({ type: 'add', content: raw.slice(1), oldLine: null, newLine });
      newLine += 1;
      newRemaining -= 1;
      continue;
    }

    if (raw.startsWith('-')) {
      deletions += 1;
      lines.push({ type: 'remove', content: raw.slice(1), oldLine, newLine: null });
      oldLine += 1;
      oldRemaining -= 1;
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
    oldRemaining -= 1;
    newRemaining -= 1;
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
  /**
   * Accessible name for the scrolling diff region, given the `filename` when
   * there is one. Defaults to "Code diff: <filename>", or "Code diff" without one.
   */
  diffLabel?: (filename?: string) => string;
  /**
   * Visually hidden text announced before each changed line, so the change
   * type is not carried by colour and the marker alone. Merged over the
   * English defaults: `added` "Added line:", `removed` "Removed line:".
   */
  changeLabels?: Partial<CodeDiffChangeLabels>;
  /**
   * The header's additions and deletions summary as a screen reader hears it,
   * given both counts; the visible `+3 -1` is hidden from assistive technology.
   * Defaults to "3 added, 1 removed".
   */
  statsLabel?: (additions: number, deletions: number) => string;
  /** Additional CSS classes */
  className?: string;
};

export interface CodeDiffProps
  extends CodeDiffOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CodeDiffOwnProps> {}

/** The visually hidden text announced before a changed line, per change type. */
export interface CodeDiffChangeLabels {
  /** Announced before an added line */
  added: string;
  /** Announced before a removed line */
  removed: string;
}

const CHANGE_LABELS: CodeDiffChangeLabels = {
  added: 'Added line:',
  removed: 'Removed line:',
};

const defaultDiffLabel = (filename: string | undefined) =>
  filename ? `Code diff: ${filename}` : 'Code diff';

const defaultStatsLabel = (additions: number, deletions: number) =>
  `${additions} added, ${deletions} removed`;

/**
 * CodeDiff component — unified diff view for code changes. Added lines tint
 * with the positive status background, removed lines with the error one, and
 * two gutters track old and new line numbers. Purely presentational: parsing
 * happens in the exported `parseUnifiedDiff`, long lines scroll horizontally
 * inside the block, and the change type is announced through visually hidden
 * text while the marker column stays decorative.
 */
export const CodeDiff = React.forwardRef<HTMLDivElement, CodeDiffProps>(
  (
    {
      diff,
      filename,
      showLineNumbers = true,
      diffLabel = defaultDiffLabel,
      changeLabels,
      statsLabel = defaultStatsLabel,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-codediff';
    const { lines, additions, deletions } = parseUnifiedDiff(diff);
    const changeText = { ...CHANGE_LABELS, ...changeLabels };

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {filename && (
          <div className={`${baseClass}__header`}>
            <code className={`${baseClass}__filename`}>{filename}</code>
            <span className={`${baseClass}__stats`}>
              <span
                className={`${baseClass}__stat ${baseClass}__stat--add`}
                aria-hidden="true"
              >
                +{additions}
              </span>
              <span
                className={`${baseClass}__stat ${baseClass}__stat--remove`}
                aria-hidden="true"
              >
                -{deletions}
              </span>
              <span className="ds-visually-hidden">
                {statsLabel(additions, deletions)}
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
          aria-label={diffLabel(filename)}
        >
          <ol className={`${baseClass}__lines`}>
            {lines.map((line, index) => {
              const changeLabel =
                line.type === 'add'
                  ? changeText.added
                  : line.type === 'remove'
                    ? changeText.removed
                    : undefined;
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
                    <span className="ds-visually-hidden">{changeLabel} </span>
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
