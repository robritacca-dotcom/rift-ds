# Artifact panel

A preview with its source a switch away: the panel a chat opens beside the conversation, or an inline live example on a page.

Generated from the rift-ds registry and prop JSDoc, version 1.35.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ArtifactPanel } from 'rift-ds';`
- Deep import: `import { ArtifactPanel } from 'rift-ds/components/ArtifactPanel/ArtifactPanel';`
- Rendering: client component (declares 'use client')
- Size: 10.5 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/artifact-panel
- Schema: https://rift-ds.com/schema/components/artifact-panel.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ArtifactPanel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | no |  | The artifact's name, shown in the header and used as the panel's accessible name. Collides with the native `title` tooltip attribute on purpose: a panel has a heading, not a tooltip. Required for the `panel` layout; an `inline` example may leave it out, and is then named by `viewLabel`. |
| layout | `"inline" \| "panel"` | no | `'panel'` | Where it sits. `panel` (the default) fills the box a host gives it, beside a conversation, and the host paints the card. `inline` is a self-contained frame in the flow of a page, sized by its content: its own card, a centred preview stage, and the source a switch away, the live example of a component's documentation. |
| lines | `CodeLine[]` | no |  | The source highlighted, as `highlight()` from `rift-ds/code/highlight` returns it, passed to the code view's CodeBlock. Offers the Code view on its own; `code`, when also given, is the text the copy button copies. |
| meta | `ReactNode` | no |  | A quiet line beside the name: what kind of thing this is, or which version. |
| icon | `string \| ReactNode` | no |  | Leading mark in the header — Material Symbol name (string) or custom element (ReactNode). |
| children | `ReactNode` | no |  | The preview, as live React content. Wins over `html` and `src`. |
| html | `string` | no |  | The preview, as a complete HTML document drawn in a sandboxed frame. Wins over `src`. A document that honours `prefers-color-scheme` follows the `color-scheme` of the page around the panel, so set that with your theme and the preview turns light or dark with it. |
| src | `string` | no |  | The preview, as a URL drawn in a sandboxed frame: a deployed page, a site. |
| sandbox | `string` | no | `'allow-scripts allow-forms'` | The frame's `sandbox` tokens for `html` and `src`. The default lets a document run its own scripts and forms in an origin of its own, with no reach into the host page; widen it only for a source you trust. |
| frameTitle | `string` | no |  | Accessible name for the preview frame. Defaults to the title when that is a string. |
| code | `string` | no |  | The artifact's source. Given, the header offers a Code view beside the preview (or shows the code alone when there is no preview). |
| language | `string` | no |  | The source's language, shown on the code view. |
| view | `ArtifactPanelView` | no |  | The view on stage, when the host owns the state. |
| defaultView | `ArtifactPanelView` | no |  | The view the panel opens on when it keeps its own state. |
| onViewChange | `((view: ArtifactPanelView) => void)` | no |  | Fires with the chosen view. |
| expanded | `boolean` | no | `false` | Whether the host is showing the panel at its expanded size. The panel never sizes itself: this only picks the toggle's icon and name. |
| onExpandedChange | `((expanded: boolean) => void)` | no |  | Fires with the next state when the expand toggle is pressed. The toggle renders only when this is given. |
| onClose | `(() => void)` | no |  | Fires when the close button is pressed. The button renders only when this is given. |
| actions | `ReactNode` | no |  | Extra header controls, seated ahead of the expand and close buttons: a download, a share, a version menu. |
| previewLabel | `string` | no | `'Preview'` | Label for the preview segment of the view switch. |
| codeLabel | `string` | no | `'Code'` | Label for the code segment of the view switch. |
| viewLabel | `string` | no | `'Artifact view'` | Accessible name for the view switch, and for the panel itself when `title` is left out (an untitled `inline` example). |
| expandLabel | `string` | no | `'Expand the artifact'` | Accessible name for the expand toggle while the panel is at its resting size. |
| collapseLabel | `string` | no | `'Collapse the artifact'` | Accessible name for the expand toggle while the panel is expanded. |
| closeLabel | `string` | no | `'Close the artifact'` | Accessible name for the close button. |
| codeBlockLabels | `Pick<CodeBlockProps, "codeLabel" \| "copyLabel" \| "copyText" \| "copiedLabel">` | no |  | The words the code view's CodeBlock writes, merged over its English defaults: the copy button's name and text ("Copy code", "Copy", "Copied") and the code region's name ("Code: <language>"). |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The buttons follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### ArtifactPanelView

Which face of the artifact is on stage.

```ts
type ArtifactPanelView = 'preview' | 'code';
```

### CodeBlockProps

The props of CodeBlock: `get_component("CodeBlock")`.

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

Types from other packages: `Pick` (typescript), `ReactNode` (react).
