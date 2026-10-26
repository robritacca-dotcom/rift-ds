# Theme toggle

The colour-mode control: System, Light and Dark over a stored setting, with the script that applies it before first paint.

Generated from the rift-ds registry and prop JSDoc, version 1.15.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ThemeToggle } from 'rift-ds';`
- Deep import: `import { ThemeToggle } from 'rift-ds/components/ThemeToggle/ThemeToggle';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/theme-toggle

## ThemeToggle props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `"dark" \| "system" \| "light"` | no |  | The setting shown, for a host that owns colour mode (its own settings store, or a library such as next-themes). A pick then only calls `onValueChange`, and the host applies it. Leave undefined to let the toggle keep the setting in its own store, `useColorMode`. |
| defaultValue | `"dark" \| "system" \| "light"` | no |  | The setting applied when the store holds no choice yet, for uncontrolled use. Without it, a first visit follows the operating system. |
| onValueChange | `((value: "dark" \| "system" \| "light") => void)` | no |  | Fires with the setting after every pick, controlled or not. |
| size | `"default" \| "compact"` | no | `compact` | Control size, on SegmentedControl's scale. |
| showLabels | `boolean` | no | `true` | Show each segment's label beside its icon. Set `false` for an icon-only strip: each label becomes the segment's tooltip on hover and keyboard focus, and stays its accessible name. |
| storageKey | `string` | no |  | The localStorage key the choice is kept under. Match the key given to `colorModeScript`. Default `theme`. |
| systemLabel | `string` | no | `System` | Label of the setting that follows the operating system. |
| lightLabel | `string` | no | `Light` | Label of the light setting. |
| darkLabel | `string` | no | `Dark` | Label of the dark setting. |
| className | `string` | no | `` | Additional CSS classes |
