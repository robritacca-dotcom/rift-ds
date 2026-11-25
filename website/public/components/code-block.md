# Code block

Monospace code with a header and one-click copy, optional highlighting, line numbers and tabs.

Generated from the rift-ds registry and prop JSDoc, version 1.37.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { CodeBlock } from 'rift-ds';`
- Deep import: `import { CodeBlock } from 'rift-ds/components/CodeBlock/CodeBlock';`
- Rendering: client component (declares 'use client')
- Size: 7.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/code-block
- Schema: https://rift-ds.com/schema/components/code-block.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## CodeBlock props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| code | `string` | no |  | The code to display, as a plain string. Required unless `lines` or `tabs` supply it. |
| lines | `CodeLine[]` | no |  | The code highlighted, one array of tokens per line, as returned by `highlight()` from `rift-ds/code/highlight`. Each token is coloured by its role. Without it the code is monochrome. When `code` is left out, the copy button copies the text of these lines. |
| language | `string` | no |  | Language tag shown in the header, e.g. "tsx", "css" |
| filename | `string` | no |  | Filename shown in the header, e.g. "tokens-light.css" |
| showLineNumbers | `boolean` | no | `false` | Show a line number before each line. |
| highlightLines | `number[]` | no |  | Line numbers (counted from 1) to mark with a highlighted background, e.g. the lines a step changed. |
| tabs | `CodeBlockTab[]` | no |  | Several snippets behind a row of tabs in the header (an install command for each package manager, the same example in two languages). Replaces the filename and language. `packageManagerTabs()` from `rift-ds/code` writes the install case. |
| value | `string` | no |  | The selected tab's value (controlled). |
| defaultValue | `string` | no |  | The initially selected tab's value (uncontrolled). Defaults to the first tab. |
| onValueChange | `((value: string) => void)` | no |  | Called with the tab's value when the reader picks a tab. |
| syncKey | `string` | no |  | Share the selected tab with every CodeBlock on the page that has the same key, and remember it for the reader's next visit (in localStorage). Ignored while `value` is controlled. |
| tabsLabel | `string` | no | `'Code variants'` | Accessible name for the tab list. |
| showCopy | `boolean` | no | `true` | Show the copy-to-clipboard button |
| onCopied | `((value: string) => void)` | no |  | Called with the copied text (the shown tab's code, or the text of `lines`) as it is sent to the clipboard, through the async API or its textarea fallback (the write is not awaited), so a host can count copies. |
| maxHeight | `string \| number` | no |  | Max height of the block; code scrolls vertically inside while the header stays pinned. Numbers are px. |
| collapsible | `boolean` | no | `false` | Show a chevron beside the filename that collapses/expands the code area |
| defaultCollapsed | `boolean` | no | `false` | Start collapsed (only applies when collapsible) |
| copyLabel | `string` | no | `'Copy code'` | Accessible name for the copy button before it is pressed |
| copyText | `string` | no | `'Copy'` | Visible text on the copy button before it is pressed |
| copiedLabel | `string` | no | `'Copied'` | Text and accessible name the copy button shows once the code is copied |
| expandLabel | `string` | no | `'Expand code'` | Accessible name for the collapse toggle while the code is collapsed |
| collapseLabel | `string` | no | `'Collapse code'` | Accessible name for the collapse toggle while the code is showing |
| codeLabel | `string` | no |  | Accessible name for the scrollable code region. Defaults to "Code: <filename>", then "Code: <language>", then "Code". |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The collapsible section follows the WAI-ARIA disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

| Key | What it does |
| --- | --- |
| Enter | Opens what it controls, and closes it when it is open. |
| Space | Does the same as Enter. |

The snippet tabs follows the WAI-ARIA tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

| Key | What it does |
| --- | --- |
| Tab | Moves focus into the list at the selected tab, and out of the list on the next press. |
| Arrow Right | Moves to the next tab and selects it. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous tab and selects it. The opposite arrow in a right-to-left layout. |
| End | Moves to the last tab and selects it. |
| Home | Moves to the first tab and selects it. |

## Types

### CodeBlockTab

One snippet in a tabbed CodeBlock.

```ts
interface CodeBlockTab {
  /** Unique value; also the value a `syncKey` shares between blocks. */
  value: string;
  /** Tab label, e.g. "pnpm". */
  label: string;
  /** The snippet, as a plain string. Copied as is. */
  code: string;
  /** The snippet highlighted, as returned by `highlight()` from `rift-ds/code/highlight`. */
  lines?: CodeLine[];
}
```

### CodeLine

One line of highlighted code: its runs, in order, with no newline.

```ts
type CodeLine = CodeToken[];
```

### CodeToken

One run of code text, optionally marked with a syntax role.

```ts
interface CodeToken {
  /** The text of the run, exactly as it appears in the source. */
  content: string;
  /** The syntax role, which picks its colour. Leave it out for plain text. */
  role?: CodeTokenRole;
}
```

### CodeTokenRole

A syntax role a highlighter marks a run of code with. Each is coloured by its `--color-code-*` token.

```ts
type CodeTokenRole = 'keyword' | 'string' | 'function' | 'constant' | 'comment';
```
