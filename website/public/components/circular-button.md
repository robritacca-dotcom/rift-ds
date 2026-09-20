# Circular button

Round icon button with primary, secondary, tertiary and neutral variants, default and compact sizes.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: actions
- Import: `import { CircularButton } from '@robr0/design-system';`
- Deep import: `import { CircularButton } from '@robr0/design-system/components/CircularButton/CircularButton';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/circular-button

## CircularButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| icon | `string` | yes |  | Material Symbol icon name |
| variant | `"neutral" \| "primary" \| "secondary" \| "tertiary"` | no |  | Visual treatment |
| priority | `"primary" \| "secondary" \| "tertiary"` | no |  | Legacy alias for `variant`. Deprecated: Use `variant` instead. |
| disabled | `boolean` | no |  | Whether the button is disabled |
| state | `"default" \| "disabled" \| "hover" \| "active"` | no |  | Documentation-only interaction state. Deprecated: Use `disabled` for the disabled state.  Documentation-only affordance for rendering a *static* interaction state in Storybook and the showcase site. Real hover/active styling comes from CSS pseudo-classes and needs no prop — for docs, prefer `className="ds-circular-button--hover"`. |
| size | `"default" \| "compact"` | no | `default` | Button size |
| loading | `boolean` | no |  | Shows a spinner in place of the icon and blocks interaction while an async action runs. Keeps the variant's full-colour appearance (unlike the disabled state) and sets `aria-busy` on the rendered element. |
| ariaLabel | `string` | yes |  | Accessible label — required, because the button has no visible text |
| tooltip | `string \| false` | no |  | The hover/focus tooltip. An icon-only control names itself: by default the button wears a Tooltip carrying `ariaLabel`. Pass a string to show different wording, or `false` to opt out — for a host that labels the control another way, or one that owns the button's box directly (SplitButton's trigger stretches to its sibling segment, which the tooltip wrapper would block). |
| tooltipPosition | `"top" \| "bottom" \| "left" \| "right"` | no | `top` | Which side the tooltip opens on. |
| href | `string` | no |  | Optional href — renders as <a> instead of <button> |
| target | `string` | no |  | Optional target attribute for links |
| rel | `string` | no |  | Optional rel attribute for links |
| className | `string` | no | `` | Additional CSS classes |
