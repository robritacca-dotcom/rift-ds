# Inspector section

Collapsible, titled run of inspector controls whose open body lets a dropdown menu open past its edge.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorSection } from 'rift-ds';`
- Deep import: `import { InspectorSection } from 'rift-ds/components/Inspector/InspectorSection';`
- Rendering: client component (declares 'use client')
- Size: 0.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/inspector-section
- Schema: https://rift-ds.com/schema/components/inspector-section.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## InspectorSection props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The section's heading, shown on its header row. Not the native tooltip `title` attribute. |
| open | `boolean` | no |  | Whether the section is expanded (controlled). Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `false` | Whether an uncontrolled section starts expanded. |
| onOpenChange | `((open: boolean) => void)` | no |  | Called with the next expanded state when the header is pressed. |
| children | `ReactNode` | no |  | The section's controls, stacked one rhythm apart. |
| className | `string` | no | `''` | Additional CSS classes, applied to the <section>. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The collapsible section follows the WAI-ARIA disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

| Key | What it does |
| --- | --- |
| Enter | Opens what it controls, and closes it when it is open. |
| Space | Does the same as Enter. |

Types from other packages: `ReactNode` (react).
