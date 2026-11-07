---
version: alpha
name: "Signal"
description: "The Signal theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#ff5f1f"
  primary-hover: "#ff7b46"
  primary-active: "#ffa37f"
  on-primary: "#060c17"
  primary-dark: "#ff5f1f"
  canvas-light: "#eef1f6"
  canvas-dark: "#090b0e"
  surface: "#ffffff"
  surface-dark: "rgba(17, 19, 23, 0.8)"
  surface-soft: "#eef1f6"
  ink: "#090c10"
  ink-dark: "#e4e6ea"
  display: "#0f1e37"
  display-dark: "#c9daf5"
  heading: "#090c10"
  heading-dark: "#e4e6ea"
  logo: "#ff5f1f"
  logo-dark: "#ff5f1f"
  logo-end: "#ffa37f"
  logo-end-dark: "#ffa37f"
  text-secondary: "#313337"
  text-tertiary: "#696b6f"
  border: "#caccd0"
  input: "#ffffff"
  error: "#b4313d"
  success: "#247b55"
  warning: "#c14817"
  info: "#4e85e3"
  accent-amber: "#1e9e8a"
  accent-cobalt: "#5cc8e8"
  accent-coral: "#ffb37a"
  accent-gold: "#8fb8f0"
  accent-mint: "#2f6fde"
  accent-violet: "#1f4fa0"
  chart-1: "#ff5f1f"
  chart-2: "#2f6fde"
  chart-3: "#8fb8f0"
  chart-4: "#ffb37a"
  chart-5: "#1f4fa0"
  chart-6: "#1e9e8a"

typography:
  display-lg:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 96px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.022em
  display-md:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.018em
  sub-display:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: -0.012em
  heading-1:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: 0.025em
  heading-2:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 26px
    fontWeight: 500
    lineHeight: 32px
    letterSpacing: 0.025em
  heading-3:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0.025em
  title:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-md:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.01em
  body-emphasis:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-sm:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.01em
  overline:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.09em

rounded:
  xs: 1px
  sm: 1px
  md: 2px
  input: 4px
  lg: 5px
  card: 7px
  xl: 14px
  pill: 4px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  xxl: 40px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
  text-input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
---

# Signal theme

Signal: Bricolage Grotesque headings over Figtree text, #ff5f1f for actions, buttons squared to 4px, 4px inputs and 7px cards. Flat: no shadows at all. Surfaces separate from the page by contrast alone.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="plum"` on `<html>`. See it at https://rift-ds.com/foundations/themes/plum.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo wears the action colour (`logo`). Its mark is a gradient within that one colour (`logo-end`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#ff5f1f` | `#ff5f1f` | `--color-action-primary-bg` |
| `primary-hover` | `#ff7b46` | `#ff7b46` | `--color-action-primary-bg-hover` |
| `primary-active` | `#ffa37f` | `#ffa37f` | `--color-action-primary-bg-active` |
| `on-primary` | `#060c17` | `#060c17` | `--color-action-primary-text` |
| `canvas-light` | `#eef1f6` | `#090b0e` | `--color-bg-page-primary` |
| `surface` | `#ffffff` | `rgba(17, 19, 23, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#eef1f6` | `#313336` | `--color-bg-container-secondary` |
| `ink` | `#090c10` | `#e4e6ea` | `--color-text-primary` |
| `display` | `#0f1e37` | `#c9daf5` | `--color-text-display` |
| `heading` | `#090c10` | `#e4e6ea` | `--color-text-heading` |
| `logo` | `#ff5f1f` | `#ff5f1f` | `--color-brand-mark` |
| `logo-end` | `#ffa37f` | `#ffa37f` | `--color-brand-mark-end` |
| `text-secondary` | `#313337` | `#b3b5b9` | `--color-text-secondary` |
| `text-tertiary` | `#696b6f` | `#9b9da0` | `--color-text-tertiary` |
| `border` | `#caccd0` | `#25272a` | `--color-bg-container-border` |
| `input` | `#ffffff` | `#090b0e` | `--color-input-bg-primary` |
| `error` | `#b4313d` | `#de5764` | `--color-status-error-icon` |
| `success` | `#247b55` | `#2e9e6e` | `--color-status-positive-icon` |
| `warning` | `#c14817` | `#ff5f1f` | `--color-status-warning-icon` |
| `info` | `#4e85e3` | `#719ce8` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#1e9e8a`, cobalt `#5cc8e8`, coral `#ffb37a`, gold `#8fb8f0`, mint `#2f6fde`, violet `#1f4fa0`.

## Typography

Bricolage Grotesque headings over Figtree text. Levels inside a tier share a weight and step by size. Display type `display` takes its own colour, while running text stays in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Bricolage Grotesque | 96px | 500 | 1.05 | -0.022em |
| `display-md` | Bricolage Grotesque | 64px | 500 | 1.1 | -0.018em |
| `sub-display` | Bricolage Grotesque | 30px | 500 | 44px | -0.012em |
| `heading-1` | Bricolage Grotesque | 30px | 500 | 44px | 0.025em |
| `heading-2` | Bricolage Grotesque | 26px | 500 | 32px | 0.025em |
| `heading-3` | Bricolage Grotesque | 22px | 500 | 28px | 0.025em |
| `title` | Figtree | 16px | 500 | 24px | 0 |
| `body-md` | Figtree | 16px | 400 | 24px | 0.01em |
| `body-emphasis` | Figtree | 16px | 500 | 24px | 0 |
| `body-sm` | Figtree | 14px | 400 | 20px | 0.01em |
| `caption` | Figtree | 12px | 400 | 16px | 0.01em |
| `overline` | Figtree | 14px | 600 | 20px | 0.09em |

## Shape

Buttons squared to 4px, 4px inputs and 7px cards. Radius belongs to the element type, never to one instance.

- `xs`: 1px (`--radius-050`)
- `sm`: 1px (`--radius-100`)
- `md`: 2px (`--radius-200`)
- `input`: 4px (`--radius-300`)
- `lg`: 5px (`--radius-400`)
- `card`: 7px (`--radius-600`)
- `xl`: 14px (`--radius-1200`)
- `pill`: 4px (`--radius-pill`)

## Space

- `xxs`: 2px (`--gap-050`)
- `xs`: 4px (`--gap-100`)
- `sm`: 8px (`--gap-200`)
- `md`: 12px (`--gap-300`)
- `lg`: 16px (`--gap-400`)
- `xl`: 20px (`--gap-500`)
- `xxl`: 40px (`--gap-1000`)

## Depth

Flat: no shadows at all. Surfaces separate from the page by contrast alone.

## Motion

- `fast`: 150ms
- `base`: 200ms
- `slow`: 300ms
