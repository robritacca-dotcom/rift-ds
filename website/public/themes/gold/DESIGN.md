---
version: alpha
name: "Volt"
description: "The Volt theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#2c2a26"
  primary-hover: "#181612"
  primary-active: "#0f0d09"
  on-primary: "#ffd166"
  primary-dark: "#ffd166"
  canvas-light: "#f1f0ee"
  canvas-dark: "#0f0d09"
  surface: "#fffefc"
  surface-dark: "rgba(24, 22, 18, 0.8)"
  surface-soft: "#f1f0ee"
  ink: "#0f0d09"
  ink-dark: "#f2f0eb"
  text-secondary: "#383632"
  text-tertiary: "#73716d"
  border: "#d8d6d2"
  input: "#fffefc"
  error: "#c7414e"
  success: "#24946f"
  warning: "#c1752e"
  info: "#526fde"
  accent-amber: "#ffae4f"
  accent-cobalt: "#6e7fd9"
  accent-coral: "#f58b5b"
  accent-gold: "#ffd166"
  accent-mint: "#7fc9a0"
  accent-violet: "#b78ad9"
  chart-1: "#2c2a26"
  chart-2: "#7fc9a0"
  chart-3: "#ffd166"
  chart-4: "#f58b5b"
  chart-5: "#b78ad9"
  chart-6: "#ffae4f"

typography:
  display-lg:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: 96px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: 0.01em
  display-md:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0.005em
  sub-display:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: 0.005em
  heading-1:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: 0.005em
  heading-2:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: 26px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: 0.005em
  heading-3:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 28px
    letterSpacing: 0.005em
  title:
    fontFamily: "'Manrope', sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: -0.02em
  body-md:
    fontFamily: "'Manrope', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: -0.01em
  body-emphasis:
    fontFamily: "'Manrope', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.02em
  body-sm:
    fontFamily: "'Manrope', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: -0.01em
  caption:
    fontFamily: "'Manrope', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: -0.01em
  overline:
    fontFamily: "'Manrope', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.07em

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
  md: 11px
  lg: 15px
  xl: 19px
  xxl: 38px

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
    shadow: "0 4px 16px rgba(0, 0, 0, 0.12)"
  modal:
    shadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
---

# Volt theme

Volt: Space Grotesk headings over Manrope text, #2c2a26 for actions, buttons squared to 4px, 4px inputs and 7px cards. Two shadows, one for what floats and one for dialogs. Everything else separates by contrast.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="gold"` on `<html>`. See it at https://rift-ds.com/foundations/themes/gold.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles.

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#2c2a26` | `#ffd166` | `--color-action-primary-bg` |
| `primary-hover` | `#181612` | `#ffd97f` | `--color-action-primary-bg-hover` |
| `primary-active` | `#0f0d09` | `#ffe5a3` | `--color-action-primary-bg-active` |
| `on-primary` | `#ffd166` | `#42320f` | `--color-action-primary-text` |
| `canvas-light` | `#f1f0ee` | `#0f0d09` | `--color-bg-page-primary` |
| `surface` | `#fffefc` | `rgba(24, 22, 18, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#f1f0ee` | `#383632` | `--color-bg-container-secondary` |
| `ink` | `#0f0d09` | `#f2f0eb` | `--color-text-primary` |
| `text-secondary` | `#383632` | `#bfbdb9` | `--color-text-secondary` |
| `text-tertiary` | `#73716d` | `#a6a4a0` | `--color-text-tertiary` |
| `border` | `#d8d6d2` | `#2c2a26` | `--color-bg-container-border` |
| `input` | `#fffefc` | `#0f0d09` | `--color-input-bg-primary` |
| `error` | `#c7414e` | `#f26775` | `--color-status-error-icon` |
| `success` | `#24946f` | `#2fbf8f` | `--color-status-positive-icon` |
| `warning` | `#c1752e` | `#ff9a3d` | `--color-status-warning-icon` |
| `info` | `#526fde` | `#738be4` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#ffae4f`, cobalt `#6e7fd9`, coral `#f58b5b`, gold `#ffd166`, mint `#7fc9a0`, violet `#b78ad9`.

## Typography

Space Grotesk headings over Manrope text. Levels inside a tier share a weight and step by size.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Space Grotesk | 96px | 500 | 1.05 | 0.01em |
| `display-md` | Space Grotesk | 64px | 500 | 1.1 | 0.005em |
| `sub-display` | Space Grotesk | 30px | 500 | 44px | 0.005em |
| `heading-1` | Space Grotesk | 30px | 700 | 44px | 0.005em |
| `heading-2` | Space Grotesk | 26px | 700 | 32px | 0.005em |
| `heading-3` | Space Grotesk | 22px | 700 | 28px | 0.005em |
| `title` | Manrope | 16px | 700 | 24px | -0.02em |
| `body-md` | Manrope | 16px | 400 | 24px | -0.01em |
| `body-emphasis` | Manrope | 16px | 500 | 24px | -0.02em |
| `body-sm` | Manrope | 14px | 400 | 20px | -0.01em |
| `caption` | Manrope | 12px | 400 | 16px | -0.01em |
| `overline` | Manrope | 14px | 600 | 20px | 0.07em |

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
- `md`: 11px (`--gap-300`)
- `lg`: 15px (`--gap-400`)
- `xl`: 19px (`--gap-500`)
- `xxl`: 38px (`--gap-1000`)

## Depth

Two shadows, one for what floats and one for dialogs. Everything else separates by contrast.

## Motion

- `fast`: 135ms
- `base`: 180ms
- `slow`: 270ms
