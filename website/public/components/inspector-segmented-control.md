# Inspector segments

One-row choice between a few options for inspector panels, as native radios with a neutral selected chip.

Generated from the rift-ds registry and prop JSDoc, version 1.3.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorSegmentedControl } from 'rift-ds';`
- Deep import: `import { InspectorSegmentedControl } from 'rift-ds/components/Inspector/InspectorSegmentedControl';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-segmented-control

## InspectorSegmentedControl props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The setting's name, drawn inside the bar on the left. Names the radiogroup. |
| options | `InspectorSegment[]` | yes |  | The choices, drawn left to right in the bar's end. |
| value | `string` | no |  | The selected value (controlled). Leave unset and use `defaultValue` for an uncontrolled set. |
| defaultValue | `string` | no |  | The starting selection for an uncontrolled set. |
| name | `string` | no |  | The radios' shared `name`, for native form submission. Generated when unset. |
| disabled | `boolean` | no | `false` | Takes the whole set out of use. |
| size | `"default" \| "compact"` | no | `default` | Component size, matching Button: `default` is 40px tall, `compact` 32px. |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly chosen value. |
| className | `string` | no | `` | Additional CSS classes, applied to the bar. |
