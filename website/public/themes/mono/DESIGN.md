---
version: alpha
name: "Smoke"
description: "The Smoke theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#232323"
  primary-hover: "#0e0e0e"
  primary-active: "#050505"
  on-primary: "#d6d6d6"
  primary-dark: "#f1f1f1"
  canvas-light: "#f1f1f1"
  canvas-dark: "#050505"
  surface: "#ffffff"
  surface-dark: "rgba(14, 14, 14, 0.8)"
  surface-soft: "#f1f1f1"
  ink: "#050505"
  ink-dark: "#f1f1f1"
  display: "#050505"
  display-dark: "#f1f1f1"
  heading: "#050505"
  heading-dark: "#f1f1f1"
  logo: "#232323"
  logo-dark: "#f1f1f1"
  logo-end: "#050505"
  logo-end-dark: "#bcbcbc"
  text-secondary: "#303030"
  text-tertiary: "#6d6d6d"
  border: "#d6d6d6"
  input: "#ffffff"
  error: "#b64b64"
  success: "#179373"
  warning: "#a66845"
  info: "#4e6aae"
  accent-amber: "#b8b8b8"
  accent-cobalt: "#5c5c5c"
  accent-coral: "#a3a3a3"
  accent-gold: "#c9c9c9"
  accent-mint: "#adadad"
  accent-violet: "#8f8f8f"
  chart-1: "#232323"
  chart-2: "#adadad"
  chart-3: "#c9c9c9"
  chart-4: "#a3a3a3"
  chart-5: "#8f8f8f"
  chart-6: "#b8b8b8"

typography:
  display-lg:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 96px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-1:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.015em
  title:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-emphasis:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "'Inter', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: "'Inter', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  overline:
    fontFamily: "'Inter', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.08em

rounded:
  xs: 1px
  sm: 2px
  md: 3px
  input: 5px
  lg: 6px
  card: 10px
  xl: 19px
  pill: 5px

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

# Smoke theme

Smoke: Montserrat headings over Inter text, #232323 for actions, buttons squared to 5px, 5px inputs and 10px cards. Flat: no shadows at all. Surfaces separate from the page by contrast alone.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="mono"` on `<html>`. See it at https://rift-ds.com/foundations/themes/mono.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo wears the action colour (`logo`). Its mark is a gradient within that one colour (`logo-end`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#232323` | `#f1f1f1` | `--color-action-primary-bg` |
| `primary-hover` | `#0e0e0e` | `#d6d6d6` | `--color-action-primary-bg-hover` |
| `primary-active` | `#050505` | `#bcbcbc` | `--color-action-primary-bg-active` |
| `on-primary` | `#d6d6d6` | `#303030` | `--color-action-primary-text` |
| `canvas-light` | `#f1f1f1` | `#050505` | `--color-bg-page-primary` |
| `surface` | `#ffffff` | `rgba(14, 14, 14, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#f1f1f1` | `#303030` | `--color-bg-container-secondary` |
| `ink` | `#050505` | `#f1f1f1` | `--color-text-primary` |
| `display` | `#050505` | `#f1f1f1` | `--color-text-display` |
| `heading` | `#050505` | `#f1f1f1` | `--color-text-heading` |
| `logo` | `#232323` | `#f1f1f1` | `--color-brand-mark` |
| `logo-end` | `#050505` | `#bcbcbc` | `--color-brand-mark-end` |
| `text-secondary` | `#303030` | `#bcbcbc` | `--color-text-secondary` |
| `text-tertiary` | `#6d6d6d` | `#a2a2a2` | `--color-text-tertiary` |
| `border` | `#d6d6d6` | `#232323` | `--color-bg-container-border` |
| `input` | `#ffffff` | `#050505` | `--color-input-bg-primary` |
| `error` | `#b64b64` | `#e0738c` | `--color-status-error-icon` |
| `success` | `#179373` | `#1ebe94` | `--color-status-positive-icon` |
| `warning` | `#a66845` | `#db895b` | `--color-status-warning-icon` |
| `info` | `#4e6aae` | `#7186bd` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#b8b8b8`, cobalt `#5c5c5c`, coral `#a3a3a3`, gold `#c9c9c9`, mint `#adadad`, violet `#8f8f8f`.

## Typography

Montserrat headings over Inter text. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Montserrat | 96px | 300 | 1.05 | 0.02em |
| `display-md` | Montserrat | 64px | 300 | 1.1 | 0.015em |
| `sub-display` | Montserrat | 30px | 300 | 44px | 0.015em |
| `heading-1` | Montserrat | 30px | 600 | 44px | 0.015em |
| `heading-2` | Montserrat | 26px | 600 | 32px | 0.015em |
| `heading-3` | Montserrat | 22px | 600 | 28px | 0.015em |
| `title` | Inter | 16px | 600 | 24px | -0.01em |
| `body-md` | Inter | 16px | 400 | 24px | 0 |
| `body-emphasis` | Inter | 16px | 500 | 24px | -0.01em |
| `body-sm` | Inter | 14px | 400 | 20px | 0 |
| `caption` | Inter | 12px | 400 | 16px | 0 |
| `overline` | Inter | 14px | 600 | 20px | 0.08em |

## Shape

Buttons squared to 5px, 5px inputs and 10px cards. Radius belongs to the element type, never to one instance.

- `xs`: 1px (`--radius-050`)
- `sm`: 2px (`--radius-100`)
- `md`: 3px (`--radius-200`)
- `input`: 5px (`--radius-300`)
- `lg`: 6px (`--radius-400`)
- `card`: 10px (`--radius-600`)
- `xl`: 19px (`--radius-1200`)
- `pill`: 5px (`--radius-pill`)

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
