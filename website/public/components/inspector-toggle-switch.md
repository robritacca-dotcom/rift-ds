# Inspector toggle switch

One-row switch for inspector panels, where the whole bar toggles and the track sits at its end.

Generated from the rift-ds registry and prop JSDoc, version 1.4.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorToggleSwitch } from 'rift-ds';`
- Deep import: `import { InspectorToggleSwitch } from 'rift-ds/components/Inspector/InspectorToggleSwitch';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-toggle-switch

## InspectorToggleSwitch props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The setting's name, drawn inside the bar on the left. Also the switch's accessible name. |
| size | `"default" \| "compact"` | no | `default` | Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute). |
| onCheckedChange | `((checked: boolean) => void)` | no |  | Convenience callback receiving the checked state directly. Fires alongside `onChange`, which keeps the standard React event signature. |
| className | `string` | no | `` | Additional CSS classes, applied to the bar rather than the <input>. |
