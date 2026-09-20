# Nav

Desktop top navigation bar with a brand slot, horizontal button group, and optional trailing content.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: navigation
- Import: `import { Nav } from '@robr0/design-system';`
- Deep import: `import { Nav } from '@robr0/design-system/components/Nav/Nav';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/nav

## Nav props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brandText | `string` | no |  | Brand/logo text |
| brandIcon | `ReactNode` | no |  | Brand icon element (img, svg, etc.) |
| buttons | `ButtonProps[]` | yes |  | Navigation buttons config — passed directly to ButtonGroup |
| trailing | `ReactNode` | no |  | Additional elements rendered after the button group (e.g. ToggleSwitch) |
| className | `string` | no | `` | Additional CSS classes |
