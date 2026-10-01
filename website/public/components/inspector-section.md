# Inspector section

Collapsible, titled run of inspector controls whose open body lets a dropdown menu open past its edge.

Generated from the rift-ds registry and prop JSDoc, version 1.1.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorSection } from 'rift-ds';`
- Deep import: `import { InspectorSection } from 'rift-ds/components/Inspector/InspectorSection';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-section

## InspectorSection props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The section's heading, shown on its header row. Not the native tooltip `title` attribute. |
| open | `boolean` | no |  | Whether the section is expanded (controlled). Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `false` | Whether an uncontrolled section starts expanded. |
| onOpenChange | `((open: boolean) => void)` | no |  | Called with the next expanded state when the header is pressed. |
| children | `ReactNode` | no |  | The section's controls, stacked one rhythm apart. |
| className | `string` | no | `` | Additional CSS classes, applied to the <section>. |
