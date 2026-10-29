# Selection card

Large option cards for high-visibility choices like settings and onboarding, with radio, checkbox or per-card toggle indicators.

Generated from the rift-ds registry and prop JSDoc, version 1.17.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { SelectionCard } from 'rift-ds';`
- Deep import: `import { SelectionCard } from 'rift-ds/components/SelectionCard/SelectionCard';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/selection-card

## SelectionCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| mode | `"checkbox" \| "radio" \| "toggle"` | no | `radio` | Selection mode — radio (single), checkbox (multi), or toggle (each card is an on/off switch) |
| options | `SelectionCardOption[]` | yes |  | Available options |
| value | `string \| string[]` | no |  | Currently selected value(s), controlled: a string for radio, a string[] otherwise. Leave undefined to let the group keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string \| string[]` | no |  | Selected value(s) on first render when uncontrolled (`value` undefined). |
| onValueChange | `((value: string \| string[]) => void)` | no |  | Called with the next selection — a string in radio mode, an array otherwise |
| name | `string` | no |  | Group name (used for aria-label on the group) |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string \| string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
