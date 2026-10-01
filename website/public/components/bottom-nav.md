# Bottom nav

Mobile tab bar for three to five destinations, in the Rift style or as iOS Liquid Glass or Material 3 Expressive.

Generated from the rift-ds registry and prop JSDoc, version 1.2.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { BottomNav } from 'rift-ds';`
- Deep import: `import { BottomNav } from 'rift-ds/components/BottomNav/BottomNav';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/bottom-nav

## BottomNav props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `BottomNavItem[]` | yes |  | Destinations, three to five of them |
| activeKey | `string` | no |  | Key of the destination for the current page |
| onValueChange | `((key: string) => void)` | no |  | Called with a destination's key when it is pressed |
| platform | `"default" \| "ios" \| "android"` | no | `default` | Which platform's tab bar to draw. `default` is the Rift bar; `ios` is the iOS 26 Liquid Glass capsule floating over content with a sliding lens behind the selection; `android` is the Material 3 Expressive navigation bar with a pill indicator behind the selected icon. |
| search | `BottomNavSearch` | no |  | A destination set apart from the rest, search unless its `icon` says otherwise. On iOS it is its own glass circle beside the bar; elsewhere it joins the bar as the last destination. |
| minimized | `boolean` | no | `false` | iOS only: shrinks the bar to the selected destination alone, the way the system bar minimises while the page scrolls down. Ignored on other platforms. |
| fixed | `boolean` | no | `false` | Pins the bar to the bottom of the viewport, above the home-indicator safe area |
| aria-label | `string` | no | `Tabs` | Accessible name of the navigation landmark. Defaults to "Tabs", distinct from Nav's "Main", so a screen carrying both announces two different navs |
| className | `string` | no | `` | Additional CSS classes |
