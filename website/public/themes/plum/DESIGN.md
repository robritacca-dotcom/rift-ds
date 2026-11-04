---
version: alpha
name: "Aubergine"
description: "The Aubergine theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#ffa81d"
  primary-hover: "#ffad2b"
  primary-active: "#ffb236"
  on-primary: "#372406"
  primary-dark: "#ffa81d"
  canvas-light: "#f2eeeb"
  canvas-dark: "#0f070e"
  surface: "#ffffff"
  surface-dark: "rgba(24, 15, 23, 0.8)"
  surface-soft: "#f2eeeb"
  ink: "#130d08"
  ink-dark: "#ebe2ea"
  display: "#721767"
  display-dark: "#f7eef6"
  heading: "#130d08"
  heading-dark: "#ebe2ea"
  logo: "#9a1f8c"
  logo-dark: "#b050a5"
  logo-end: "#721767"
  logo-end-dark: "#ce93c7"
  text-secondary: "#3b3430"
  text-tertiary: "#736c68"
  border: "#d3cdc9"
  input: "#ffffff"
  error: "#b4313d"
  success: "#247b55"
  warning: "#b65c23"
  info: "#5c74d0"
  accent-amber: "#ffa81d"
  accent-cobalt: "#4f6bd8"
  accent-coral: "#e0605a"
  accent-gold: "#ffcb5c"
  accent-mint: "#3fa889"
  accent-violet: "#9a1f8c"
  chart-1: "#9a1f8c"
  chart-2: "#e6a9ee"
  chart-3: "#5c74d0"
  chart-4: "#8ec3f2"
  chart-5: "#4cac83"
  chart-6: "#ffa81d"

typography:
  display-lg:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 96px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.022em
  display-md:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.018em
  sub-display:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: -0.012em
  heading-1:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: 0.025em
  heading-2:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 26px
    fontWeight: 500
    lineHeight: 32px
    letterSpacing: 0.025em
  heading-3:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0.025em
  title:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.01em
  body-emphasis:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-sm:
    fontFamily: "'Inter', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: "'Inter', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.01em
  overline:
    fontFamily: "'Inter', sans-serif"
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

# Aubergine theme

Aubergine: Inter Tight headings over Inter text, #ffa81d for actions, buttons squared to 4px, 4px inputs and 7px cards. Flat: no shadows at all. Surfaces separate from the page by contrast alone.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="plum"` on `<html>`. See it at https://rift-ds.com/foundations/themes/plum.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo has a colour of its own (`logo`), apart from the action colour. Its mark is a gradient within that one colour (`logo-end`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#ffa81d` | `#ffa81d` | `--color-action-primary-bg` |
| `primary-hover` | `#ffad2b` | `#ffad2b` | `--color-action-primary-bg-hover` |
| `primary-active` | `#ffb236` | `#ffb236` | `--color-action-primary-bg-active` |
| `on-primary` | `#372406` | `#372406` | `--color-action-primary-text` |
| `canvas-light` | `#f2eeeb` | `#0f070e` | `--color-bg-page-primary` |
| `surface` | `#ffffff` | `rgba(24, 15, 23, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#f2eeeb` | `#372f36` | `--color-bg-container-secondary` |
| `ink` | `#130d08` | `#ebe2ea` | `--color-text-primary` |
| `display` | `#721767` | `#f7eef6` | `--color-text-display` |
| `heading` | `#130d08` | `#ebe2ea` | `--color-text-heading` |
| `logo` | `#9a1f8c` | `#b050a5` | `--color-brand-mark` |
| `logo-end` | `#721767` | `#ce93c7` | `--color-brand-mark-end` |
| `text-secondary` | `#3b3430` | `#bab1b9` | `--color-text-secondary` |
| `text-tertiary` | `#736c68` | `#a199a0` | `--color-text-tertiary` |
| `border` | `#d3cdc9` | `#2b232a` | `--color-bg-container-border` |
| `input` | `#ffffff` | `#0f070e` | `--color-input-bg-primary` |
| `error` | `#b4313d` | `#de5764` | `--color-status-error-icon` |
| `success` | `#247b55` | `#2e9e6e` | `--color-status-positive-icon` |
| `warning` | `#b65c23` | `#f07a2e` | `--color-status-warning-icon` |
| `info` | `#5c74d0` | `#7c8fd9` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#ffa81d`, cobalt `#4f6bd8`, coral `#e0605a`, gold `#ffcb5c`, mint `#3fa889`, violet `#9a1f8c`.

## Typography

Inter Tight headings over Inter text. Levels inside a tier share a weight and step by size. Display type `display` takes its own colour, while running text stays in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Inter Tight | 96px | 500 | 1.05 | -0.022em |
| `display-md` | Inter Tight | 64px | 500 | 1.1 | -0.018em |
| `sub-display` | Inter Tight | 30px | 500 | 44px | -0.012em |
| `heading-1` | Inter Tight | 30px | 500 | 44px | 0.025em |
| `heading-2` | Inter Tight | 26px | 500 | 32px | 0.025em |
| `heading-3` | Inter Tight | 22px | 500 | 28px | 0.025em |
| `title` | Inter | 16px | 500 | 24px | 0 |
| `body-md` | Inter | 16px | 400 | 24px | 0.01em |
| `body-emphasis` | Inter | 16px | 500 | 24px | 0 |
| `body-sm` | Inter | 14px | 400 | 20px | 0.01em |
| `caption` | Inter | 12px | 400 | 16px | 0.01em |
| `overline` | Inter | 14px | 600 | 20px | 0.09em |

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
