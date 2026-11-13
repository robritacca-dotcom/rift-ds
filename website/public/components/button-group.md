# Button group

Horizontal and vertical button group layouts for related actions and navigation patterns.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ButtonGroup } from 'rift-ds';`
- Deep import: `import { ButtonGroup } from 'rift-ds/components/ButtonGroup/ButtonGroup';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/button-group
- Schema: https://rift-ds.com/schema/components/button-group.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ButtonGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | no | `'horizontal'` | Orientation of the button group |
| buttons | `ButtonProps[]` | yes |  | Array of button configurations |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the group. Deprecated: Pass the native `aria-label` attribute instead. |
| className | `string` | no | `''` | Additional CSS class |

## Types

### ButtonOwnProps

Props owned by Button itself — everything else falls through to the DOM node.

```ts
type ButtonOwnProps = {
  /**
   * Button text content. When it is absent, plain-text `children` stand in
   * for it (with a development warning), and failing both the button reads
   * "Button".
   * @default 'Button'
   */
  label?: string;
  /** Plain text to use as the label when `label` is absent. Anything richer than text is ignored; prefer `label`. */
  children?: React.ReactNode;
  /** Icon for left side — Material Symbol name (string) or custom element (ReactNode) */
  iconLeft?: string | React.ReactNode;
  /** Icon for right side — Material Symbol name (string) or custom element (ReactNode) */
  iconRight?: string | React.ReactNode;
  /**
   * Emphasis: `primary` (filled), `secondary` (outlined) or `tertiary`
   * (ghost). The colour is `tone`'s job. `neutral` and `destructive` are
   * legacy values from before the split: `neutral` renders as
   * `variant="primary" tone="neutral"` and `destructive` as
   * `variant="secondary" tone="destructive"`.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'destructive';
  /**
   * Colour, independent of emphasis. `default` carries the action colour,
   * `neutral` the greys, `destructive` the danger colour. Tertiary is
   * already grey, so `neutral` leaves it unchanged; a tertiary
   * `destructive` takes the outlined look, since a danger action needs a
   * visible edge. Left unset, a legacy `variant` (`neutral` or
   * `destructive`) supplies the tone instead.
   * @default 'default'
   */
  tone?: 'default' | 'neutral' | 'destructive';
  /** Button size */
  size?: 'default' | 'compact';
  /** Whether the button is disabled */
  disabled?: boolean;
  /**
   * Shows a spinner in the left icon slot and blocks interaction while an
   * async action runs. Keeps the variant's full-colour appearance (unlike
   * `disabled`) and sets `aria-busy` on the rendered element.
   */
  loading?: boolean;
  /** Optional href — renders as <a> instead of <button> */
  href?: string;
  /** Optional target attribute for links */
  target?: string;
  /** Optional rel attribute for links */
  rel?: string;
  /**
   * The component the link renders with, such as Next.js's `Link`, so it
   * navigates through the app's router. Wins over a LinkProvider's; a plain
   * `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
  /** Marks this link as the current page (adds aria-current="page") */
  ariaCurrent?: boolean;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy alias for `variant`.
   *
   * @deprecated Use `variant` instead.
   */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  /**
   * Documentation-only interaction state.
   *
   * @deprecated Use `disabled` for the disabled state.
   *
   * Documentation-only affordance for rendering a *static* interaction state in
   * Storybook and the showcase site. Real hover/active styling comes from CSS
   * pseudo-classes and needs no prop — for docs, prefer `className="ds-button--hover"`.
   */
  state?: 'default' | 'hover' | 'active' | 'disabled';
  /**
   * Legacy alias for `iconLeft` — Material Symbol name (string) or custom element (ReactNode).
   *
   * @deprecated Use `iconLeft` instead.
   */
  icon?: string | React.ReactNode;
  /**
   * Legacy toggle for showing the text label.
   *
   * @deprecated Will be removed once `label` loses its default in the next major;
   * an icon-only button will simply omit `label`.
   */
  text?: boolean;
};
```

### ButtonProps

```ts
interface ButtonProps
  extends ButtonOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof ButtonOwnProps | 'type'> {}
```

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

Types from other packages: `Array` (typescript), `ComponentPropsWithoutRef` (react), `ComponentPropsWithRef` (react), `ElementType` (react), `Omit` (typescript), `ReactNode` (react).
