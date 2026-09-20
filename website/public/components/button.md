# Button

Primary, secondary, tertiary, neutral and destructive variants in default and compact sizes, with icon support and multiple states.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: actions
- Import: `import { Button } from '@robr0/design-system';`
- Deep import: `import { Button } from '@robr0/design-system/components/Button/Button';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/button

## Button props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `Button` | Button text content |
| iconLeft | `ReactNode` | no |  | Icon for left side — Material Symbol name (string) or custom element (ReactNode) |
| iconRight | `ReactNode` | no |  | Icon for right side — Material Symbol name (string) or custom element (ReactNode) |
| variant | `"neutral" \| "destructive" \| "primary" \| "secondary" \| "tertiary"` | no |  | Visual treatment |
| size | `"default" \| "compact"` | no | `default` | Button size |
| disabled | `boolean` | no |  | Whether the button is disabled |
| loading | `boolean` | no |  | Shows a spinner in the left icon slot and blocks interaction while an async action runs. Keeps the variant's full-colour appearance (unlike `disabled`) and sets `aria-busy` on the rendered element. |
| href | `string` | no |  | Optional href — renders as <a> instead of <button> |
| target | `string` | no |  | Optional target attribute for links |
| rel | `string` | no |  | Optional rel attribute for links |
| ariaCurrent | `boolean` | no |  | Marks this link as the current page (adds aria-current="page") |
| className | `string` | no | `` | Additional CSS classes |
| priority | `"destructive" \| "primary" \| "secondary" \| "tertiary"` | no |  | Legacy alias for `variant`. Deprecated: Use `variant` instead. |
| state | `"default" \| "disabled" \| "hover" \| "active"` | no |  | Documentation-only interaction state. Deprecated: Use `disabled` for the disabled state.  Documentation-only affordance for rendering a *static* interaction state in Storybook and the showcase site. Real hover/active styling comes from CSS pseudo-classes and needs no prop — for docs, prefer `className="ds-button--hover"`. |
| icon | `string` | no |  | Legacy alias for `iconLeft`. Deprecated: Use `iconLeft` instead. |
| text | `boolean` | no | `true` | Legacy toggle for showing the text label. Deprecated: Will be removed once `label` loses its default in the next major; an icon-only button will simply omit `label`. |
