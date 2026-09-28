# Top app bar

Mobile screen header with a menu or back button, title, and actions, in Rift, iOS, or Android style, collapsing on scroll.

Generated from the rift-ds registry and prop JSDoc, version 1.0.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { TopAppBar } from 'rift-ds';`
- Deep import: `import { TopAppBar } from 'rift-ds/components/TopAppBar/TopAppBar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/top-app-bar

## TopAppBar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The screen's title |
| subtitle | `string` | no |  | A second line under the title, e.g. a count or a date range |
| platform | `"default" \| "ios" \| "android"` | no | `default` | Which platform's bar to draw. `default` is the Rift bar; `ios` is the iOS 26 navigation bar, with glass circle buttons over content and a soft blurred edge; `android` is the Material 3 Expressive top app bar. |
| size | `"small" \| "large" \| "medium"` | no | `small` | `small` puts the title in the bar. `medium` and `large` add an expanded title under it that collapses into the bar as the page scrolls; on iOS both are the large title. |
| align | `"center" \| "start"` | no |  | Title alignment in the bar. Defaults to centred on iOS and to the start edge elsewhere |
| navigation | `"menu" \| "back" \| "close"` | no |  | The leading control: a menu button, a back button, or a close button |
| onNavigate | `(() => void)` | no |  | Called when the leading control is pressed |
| navigationLabel | `string` | no |  | Accessible label of the leading control; defaults to "Open menu", "Back" or "Close" |
| actions | `TopAppBarAction[]` | no | `[]` | Trailing actions. The first three show as icon buttons; any more join the overflow menu, ahead of `overflowActions`, where they render as plain rows (a menu row draws no badge and routes from `onClick`, not `href`) |
| overflowActions | `TopAppBarOverflowAction[]` | no | `[]` | Actions listed in a menu behind a trailing "More" button |
| overflowLabel | `string` | no | `More` | Accessible label of the button that opens the overflow menu |
| scrolled | `boolean` | no |  | Whether content has scrolled under the bar, which collapses an expanded title and switches the bar to its scrolled surface. Leave unset to have the bar watch `scrollTarget` itself. |
| scrollTarget | `HTMLElement \| null` | no |  | The element whose scroll the bar watches when `scrolled` is unset. Defaults to the window |
| headingLevel | `5 \| 2 \| 3 \| 1 \| 6 \| 4` | no | `1` | Level of the title's heading element |
| sticky | `boolean` | no | `true` | Keeps the bar stuck to the top of its scroll container |
| className | `string` | no | `` | Additional CSS classes |
