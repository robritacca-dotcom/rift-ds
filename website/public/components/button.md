# Button

Primary, secondary and tertiary emphasis, each in a default, neutral or destructive tone, with icons, loading, and default and compact sizes.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { Button } from 'rift-ds';`
- Deep import: `import { Button } from 'rift-ds/components/Button/Button';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/button

## Button props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `'Button'` | Button text content. When it is absent, plain-text `children` stand in for it (with a development warning), and failing both the button reads "Button". |
| children | `ReactNode` | no |  | Plain text to use as the label when `label` is absent. Anything richer than text is ignored; prefer `label`. |
| iconLeft | `ReactNode` | no |  | Icon for left side — Material Symbol name (string) or custom element (ReactNode) |
| iconRight | `ReactNode` | no |  | Icon for right side — Material Symbol name (string) or custom element (ReactNode) |
| variant | `"neutral" \| "destructive" \| "primary" \| "secondary" \| "tertiary"` | no |  | Emphasis: `primary` (filled), `secondary` (outlined) or `tertiary` (ghost). The colour is `tone`'s job. `neutral` and `destructive` are legacy values from before the split: `neutral` renders as `variant="primary" tone="neutral"` and `destructive` as `variant="secondary" tone="destructive"`. |
| tone | `"default" \| "neutral" \| "destructive"` | no |  | Colour, independent of emphasis. `default` carries the action colour, `neutral` the greys, `destructive` the danger colour. Tertiary is already grey, so `neutral` leaves it unchanged; a tertiary `destructive` takes the outlined look, since a danger action needs a visible edge. |
| size | `"default" \| "compact"` | no | `default` | Button size |
| disabled | `boolean` | no |  | Whether the button is disabled |
| loading | `boolean` | no |  | Shows a spinner in the left icon slot and blocks interaction while an async action runs. Keeps the variant's full-colour appearance (unlike `disabled`) and sets `aria-busy` on the rendered element. |
| href | `string` | no |  | Optional href — renders as <a> instead of <button> |
| target | `string` | no |  | Optional target attribute for links |
| rel | `string` | no |  | Optional rel attribute for links |
| linkComponent | `LinkComponent` | no |  | The component the link renders with, such as Next.js's `Link`, so it navigates through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| ariaCurrent | `boolean` | no |  | Marks this link as the current page (adds aria-current="page") |
| className | `string` | no | `` | Additional CSS classes |
| priority | `"destructive" \| "primary" \| "secondary" \| "tertiary"` | no |  | Legacy alias for `variant`. Deprecated: Use `variant` instead. |
| state | `"active" \| "default" \| "disabled" \| "hover"` | no |  | Documentation-only interaction state. Deprecated: Use `disabled` for the disabled state.  Documentation-only affordance for rendering a *static* interaction state in Storybook and the showcase site. Real hover/active styling comes from CSS pseudo-classes and needs no prop — for docs, prefer `className="ds-button--hover"`. |
| icon | `ReactNode` | no |  | Legacy alias for `iconLeft` — Material Symbol name (string) or custom element (ReactNode). Deprecated: Use `iconLeft` instead. |
| text | `boolean` | no | `true` | Legacy toggle for showing the text label. Deprecated: Will be removed once `label` loses its default in the next major; an icon-only button will simply omit `label`. |
