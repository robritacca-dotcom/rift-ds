# Circular button

Round icon button in primary, secondary and tertiary emphasis and a default, neutral or destructive tone, in default and compact sizes.

Generated from the rift-ds registry and prop JSDoc, version 1.15.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { CircularButton } from 'rift-ds';`
- Deep import: `import { CircularButton } from 'rift-ds/components/CircularButton/CircularButton';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/circular-button

## CircularButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| icon | `ReactNode` | yes |  | The icon — Material Symbol name (string) or custom element (ReactNode) |
| variant | `"neutral" \| "primary" \| "secondary" \| "tertiary"` | no |  | Emphasis: `primary` (filled), `secondary` (outlined) or `tertiary` (ghost). The colour is `tone`'s job. `neutral` is the legacy value from before the split and renders as `variant="primary" tone="neutral"`. |
| tone | `"default" \| "neutral" \| "destructive"` | no |  | Colour, independent of emphasis: `default` carries the action colour, `neutral` the greys, `destructive` the danger colour. Tertiary is already grey, so `neutral` leaves it unchanged; a tertiary `destructive` takes the outlined look, since a danger action needs a visible edge. |
| priority | `"primary" \| "secondary" \| "tertiary"` | no |  | Legacy alias for `variant`. Deprecated: Use `variant` instead. |
| disabled | `boolean` | no |  | Whether the button is disabled |
| state | `"active" \| "default" \| "disabled" \| "hover"` | no |  | Documentation-only interaction state. Deprecated: Use `disabled` for the disabled state.  Documentation-only affordance for rendering a *static* interaction state in Storybook and the showcase site. Real hover/active styling comes from CSS pseudo-classes and needs no prop — for docs, prefer `className="ds-circular-button--hover"`. |
| size | `"default" \| "compact"` | no | `default` | Button size |
| loading | `boolean` | no |  | Shows a spinner in place of the icon and blocks interaction while an async action runs. Keeps the variant's full-colour appearance (unlike the disabled state) and sets `aria-busy` on the rendered element. |
| ariaLabel | `string` | yes |  | Accessible label — required, because the button has no visible text |
| tooltip | `string \| false` | no |  | The hover/focus tooltip. An icon-only control names itself: by default the button wears a Tooltip carrying `ariaLabel`. Pass a string to show different wording, or `false` to opt out — for a host that labels the control another way, or one that owns the button's box directly (SplitButton's trigger stretches to its sibling segment, which the tooltip wrapper would block). |
| tooltipPosition | `"top" \| "bottom" \| "start" \| "end" \| "left" \| "right"` | no | `top` | Which side the tooltip opens on. `start` and `end` follow the reading direction. |
| href | `string` | no |  | Optional href — renders as <a> instead of <button> |
| target | `string` | no |  | Optional target attribute for links |
| rel | `string` | no |  | Optional rel attribute for links |
| className | `string` | no | `` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component the link renders with, such as Next.js's `Link`, so it navigates through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |
