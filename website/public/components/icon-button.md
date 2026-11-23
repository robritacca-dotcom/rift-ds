# Icon button

Icon-only button in primary, secondary and tertiary emphasis and a default, neutral or destructive tone, in default and compact sizes.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { IconButton } from 'rift-ds';`
- Deep import: `import { IconButton } from 'rift-ds/components/IconButton/IconButton';`
- Rendering: server-renderable (no 'use client')
- Size: 4.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/icon-button
- Schema: https://rift-ds.com/schema/components/icon-button.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Button](https://rift-ds.com/components/button.md) instead when the action needs its words on show, with or without an icon beside them.
- Use [Copy button](https://rift-ds.com/components/copy-button.md) instead when the button puts a value on the clipboard and should confirm it.

## IconButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| icon | `string \| ReactNode` | yes |  | The icon — Material Symbol name (string) or custom element (ReactNode) |
| variant | `"neutral" \| "primary" \| "secondary" \| "tertiary"` | no |  | Emphasis: `primary` (filled), `secondary` (outlined) or `tertiary` (ghost). The colour is `tone`'s job. `neutral` is the legacy value from before the split and renders as `variant="primary" tone="neutral"`. |
| tone | `"default" \| "destructive" \| "neutral"` | no |  | Colour, independent of emphasis: `default` carries the action colour, `neutral` the greys, `destructive` the danger colour. Tertiary is already grey, so `neutral` leaves it unchanged; a tertiary `destructive` takes the outlined look, since a danger action needs a visible edge. |
| priority | `"primary" \| "secondary" \| "tertiary"` | no |  | Legacy alias for `variant`. Deprecated: Use `variant` instead. |
| disabled | `boolean` | no |  | Whether the button is disabled |
| state | `"default" \| "active" \| "disabled" \| "hover"` | no |  | Documentation-only interaction state. Deprecated: Use `disabled` for the disabled state. Documentation-only affordance for rendering a *static* interaction state in Storybook and the showcase site. Real hover/active styling comes from CSS pseudo-classes and needs no prop — for docs, prefer `className="ds-icon-button--hover"`. |
| size | `"default" \| "compact"` | no | `'default'` | Button size |
| loading | `boolean` | no |  | Shows a spinner in place of the icon and blocks interaction while an async action runs. Keeps the variant's full-colour appearance (unlike the disabled state) and sets `aria-busy` on the rendered element. |
| label | `string` | yes |  | The button's name: what a screen reader announces and, by default, what the tooltip shows. Required, because the button has no visible text. Named as Button's and AiButton's text is, so the family spells it one way. |
| tooltip | `string \| false` | no |  | The hover/focus tooltip. An icon-only control names itself: by default the button wears a Tooltip carrying `label`. Pass a string to show different wording, or `false` to opt out — for a host that labels the control another way, or one that owns the button's box directly (SplitButton's trigger stretches to its sibling segment, which the tooltip wrapper would block). |
| tooltipPosition | `"top" \| "bottom" \| "left" \| "right" \| "start" \| "end"` | no | `'top'` | Which side the tooltip opens on. `start` and `end` follow the reading direction. |
| href | `string` | no |  | Optional href — renders as <a> instead of <button> |
| target | `string` | no |  | Optional target attribute for links |
| rel | `string` | no |  | Optional rel attribute for links |
| badge | `string \| number \| true` | no |  | A mark on the button's top-end corner, as BottomNav draws one: a count (a notification bell's unread), or `true` for a dot with no number. |
| badgeMax | `number` | no | `99` | The highest count the badge spells out; a larger one reads "99+". Defaults to 99. |
| badgeLabel | `((badge: string \| number \| true) => string)` | no | `` (badge: number \| string \| true) => (badge === true ? ', new' : `, ${badge} new`) `` | Text read after `label` while the button carries a badge, given the badge. Defaults to ", new" for a dot and ", 3 new" for a count; the leading comma and space are part of the text. The tooltip keeps `label` alone. |
| locale | `string` | no | `'en-US'` | The BCP 47 locale a numeric badge is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `''` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component the link renders with, such as Next.js's `Link`, so it navigates through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### LinkComponent

A component that renders a link in place of a plain `<a>`, such as a router's.

```ts
type LinkComponent = React.ElementType<LinkComponentProps>;
```

### LinkComponentProps

The props a link component receives: every anchor attribute, the ref, and
an `href` that is always a string. Next.js's `Link` takes these as they
are; a router whose link takes `to` instead needs a one-line adapter:
`({ href, ...props }) => <RouterLink to={href} {...props} />`.

```ts
type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `ReactNode` (react).
