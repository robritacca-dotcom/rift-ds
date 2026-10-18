# Artifact panel

The panel a chat opens beside the conversation to preview what it made: live content, a sandboxed page or a site, with the source a switch away.

Generated from the rift-ds registry and prop JSDoc, version 1.10.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ArtifactPanel } from 'rift-ds';`
- Deep import: `import { ArtifactPanel } from 'rift-ds/components/ArtifactPanel/ArtifactPanel';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/artifact-panel

## ArtifactPanel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | yes |  | The artifact's name, shown in the header and used as the panel's accessible name. Collides with the native `title` tooltip attribute on purpose: a panel has a heading, not a tooltip. |
| meta | `ReactNode` | no |  | A quiet line beside the name: what kind of thing this is, or which version. |
| icon | `ReactNode` | no |  | Leading mark in the header — Material Symbol name (string) or custom element (ReactNode). |
| children | `ReactNode` | no |  | The preview, as live React content. Wins over `html` and `src`. |
| html | `string` | no |  | The preview, as a complete HTML document drawn in a sandboxed frame. Wins over `src`. A document that honours `prefers-color-scheme` follows the `color-scheme` of the page around the panel, so set that with your theme and the preview turns light or dark with it. |
| src | `string` | no |  | The preview, as a URL drawn in a sandboxed frame: a deployed page, a site. |
| sandbox | `string` | no | `allow-scripts allow-forms` | The frame's `sandbox` tokens for `html` and `src`. The default lets a document run its own scripts and forms in an origin of its own, with no reach into the host page; widen it only for a source you trust. |
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
| previewLabel | `string` | no | `Preview` | Label for the preview segment of the view switch. |
| codeLabel | `string` | no | `Code` | Label for the code segment of the view switch. |
| viewLabel | `string` | no | `Artifact view` | Accessible name for the view switch. |
| expandLabel | `string` | no | `Expand the artifact` | Accessible name for the expand toggle while the panel is at its resting size. |
| collapseLabel | `string` | no | `Collapse the artifact` | Accessible name for the expand toggle while the panel is expanded. |
| closeLabel | `string` | no | `Close the artifact` | Accessible name for the close button. |
| className | `string` | no | `` | Additional CSS classes |
