# Theme picker

A circular trigger wearing the active theme's swatch, opening a menu of every theme on offer with its colour, corner and faces.

Generated from the rift-ds registry and prop JSDoc, version 1.18.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ThemePicker } from 'rift-ds';`
- Deep import: `import { ThemePicker } from 'rift-ds/components/ThemePicker/ThemePicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/theme-picker

## ThemePicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| themes | `ThemePickerOption[]` | yes |  | The themes on offer, in the order the menu lists them. |
| value | `string` | no |  | The active theme, controlled. Leave undefined to let the picker keep its own, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | The active theme on first render when uncontrolled. Defaults to the first theme. |
| onValueChange | `((value: string) => void)` | no |  | Fires with the chosen theme's value. The host applies it (a `data-brand` attribute on `<html>`, for the shipped presets). |
| open | `boolean` | no |  | Whether the menu is open, controlled. Leave undefined to let the picker open and close itself. |
| defaultOpen | `boolean` | no | `false` | Whether the menu starts open when uncontrolled. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires when the menu opens or closes. |
| disabled | `boolean` | no | `false` | Whether the picker is disabled: the trigger takes no press and the menu cannot open. |
| size | `"default" \| "compact"` | no | `default` | Trigger size, on the row-control scale: `default` is 40px, `compact` 32px. |
| placement | `"top" \| "bottom"` | no | `bottom` | Which side of the trigger the menu prefers; it flips when that side has no room. |
| align | `"start" \| "end"` | no | `end` | Which trigger edge the menu lines up with. |
| footer | `ReactNode` | no |  | Content after the themes, below a divider: a link to make a theme of your own, say. Give each control in it `role="menuitem"`, since a menu holds only menu items; the arrow keys reach it. |
| triggerLabel | `((label: string) => string)` | no | `(label: string) => `Theme: ${label}`` | Accessible name of the trigger, given the active theme's name. Defaults to "Theme: " followed by it. |
| menuLabel | `string` | no | `Theme` | Accessible name of the menu. |
| className | `string` | no | `` | Additional CSS classes |
