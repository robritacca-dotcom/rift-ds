# Nav

**Deprecated.** Use `SiteHeader` instead.

A legacy plain top bar of brand and page links, superseded by the site header and kept for existing consumers.

Generated from the rift-ds registry and prop JSDoc, version 1.31.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Nav } from 'rift-ds';`
- Deep import: `import { Nav } from 'rift-ds/components/Nav/Nav';`
- Rendering: server-renderable (no 'use client')
- Size: 1.9 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/nav
- Schema: https://rift-ds.com/schema/components/nav.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Nav props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brandText | `string` | no |  | Brand/logo text |
| brandIcon | `ReactNode` | no |  | Brand icon element (img, svg, etc.) |
| buttons | `ButtonProps[]` | yes |  | Navigation buttons config — passed directly to ButtonGroup |
| trailing | `ReactNode` | no |  | Additional elements rendered after the button group (e.g. ToggleSwitch) |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The items follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### ButtonGroupProps

The props of ButtonGroup: `get_component("ButtonGroup")`.

### ButtonProps

The props of Button: `get_component("Button")`.

Types from other packages: `Array` (typescript), `ReactNode` (react).
