# Theme toggle

The colour-mode control: System, Light and Dark over a stored setting, with the script that applies it before first paint.

Generated from the rift-ds registry and prop JSDoc, version 1.29.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ThemeToggle } from 'rift-ds';`
- Deep import: `import { ThemeToggle } from 'rift-ds/components/ThemeToggle/ThemeToggle';`
- Rendering: client component (declares 'use client')
- Size: 6.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/theme-toggle
- Schema: https://rift-ds.com/schema/components/theme-toggle.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ThemeToggle props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `"dark" \| "system" \| "light"` | no |  | The setting shown, for a host that owns colour mode (its own settings store, or a library such as next-themes). A pick then only calls `onValueChange`, and the host applies it. Leave undefined to let the toggle keep the setting in its own store, `useColorMode`. |
| defaultValue | `"dark" \| "system" \| "light"` | no |  | The setting applied when the store holds no choice yet, for uncontrolled use. Without it, a first visit follows the operating system. |
| onValueChange | `((value: "dark" \| "system" \| "light") => void)` | no |  | Fires with the setting after every pick, controlled or not. |
| size | `"default" \| "compact"` | no | `'default'` | Control size, on SegmentedControl's scale: `default` (the default), the height of the CommandPaletteTrigger and AiButton beside it in a top bar, or `compact`. |
| showLabels | `boolean` | no | `true` | Show each segment's label beside its icon. Set `false` for an icon-only strip: each label becomes the segment's tooltip on hover and keyboard focus, and stays its accessible name. |
| cycle | `boolean` | no | `false` | Draw one circle that shows the current setting and steps to the next on each press (System, Light, Dark), in place of the strip, for a row short of room, such as a condensed SiteHeader's `condensedActions`. Each label becomes the circle's tooltip and its accessible name comes from `cycleLabel`. |
| cycleLabel | `((current: string, next: string) => string)` | no | `` (current: string, next: string) => `${ariaLabel}: ${current}. Switch to ${next}` `` | The cycle circle's accessible name, from the current setting's label and the next one's. Default: the control's `aria-label`, then both, as in "Colour mode: Light. Switch to Dark". |
| storageKey | `string` | no |  | The localStorage key the choice is kept under. Match the key given to `colorModeScript`. Default `theme`. |
| systemLabel | `string` | no | `'System'` | Label of the setting that follows the operating system. |
| lightLabel | `string` | no | `'Light'` | Label of the light setting. |
| darkLabel | `string` | no | `'Dark'` | Label of the dark setting. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

| Key | What it does |
| --- | --- |
| Tab | Moves focus into the list at the selected tab, and out of the list on the next press. |
| Arrow Right | Moves to the next tab and selects it. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous tab and selects it. The opposite arrow in a right-to-left layout. |
| End | Moves to the last tab and selects it. |
| Home | Moves to the first tab and selects it. |

## Types

### ColorModeSetting

```ts
type ColorModeSetting = (typeof colorModeSettings)[number];
```
