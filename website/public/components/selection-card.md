# Selection card

Large selectable option cards with radio or checkbox indicators for high-visibility choices like settings and onboarding.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { SelectionCard } from '@robr0/design-system';`
- Deep import: `import { SelectionCard } from '@robr0/design-system/components/SelectionCard/SelectionCard';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/selection-card

## SelectionCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| mode | `"checkbox" \| "radio" \| "toggle"` | no | `radio` | Selection mode — radio (single), checkbox (multi), or toggle (each card is an on/off switch) |
| options | `SelectionCardOption[]` | yes |  | Available options |
| value | `string \| string[]` | no |  | Currently selected value(s) — string for radio, string[] for checkbox |
| onValueChange | `((value: string \| string[]) => void)` | no |  | Called with the next selection — a string in radio mode, an array otherwise |
| name | `string` | no |  | Group name (used for aria-label on the group) |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string \| string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
