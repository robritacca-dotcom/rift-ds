# Nav

Desktop top navigation bar with a brand slot, horizontal button group, and optional trailing content.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Nav } from 'rift-ds';`
- Deep import: `import { Nav } from 'rift-ds/components/Nav/Nav';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/nav

## Nav props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brandText | `string` | no |  | Brand/logo text |
| brandIcon | `ReactNode` | no |  | Brand icon element (img, svg, etc.) |
| buttons | `ButtonProps[]` | yes |  | Navigation buttons config — passed directly to ButtonGroup |
| trailing | `ReactNode` | no |  | Additional elements rendered after the button group (e.g. ToggleSwitch) |
| className | `string` | no | `` | Additional CSS classes |
