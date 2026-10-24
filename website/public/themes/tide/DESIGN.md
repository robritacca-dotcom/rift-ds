---
version: alpha
name: "Tide"
description: "The Tide theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#0e6e8f"
  primary-hover: "#0a4e66"
  primary-active: "#052f3e"
  on-primary: "#cfeaf3"
  primary-dark: "#3ca5c6"
  canvas-light: "#f1f1f1"
  canvas-dark: "#050505"
  surface: "#ffffff"
  surface-dark: "rgba(14, 14, 14, 0.8)"
  surface-soft: "#f1f1f1"
  ink: "#050505"
  ink-dark: "#f1f1f1"
  text-secondary: "#303030"
  text-tertiary: "#6d6d6d"
  border: "#d6d6d6"
  input: "#ffffff"
  error: "#c93a5c"
  success: "#05a67c"
  warning: "#c65e33"
  info: "#345ac4"
  accent-amber: "#ef8247"
  accent-cobalt: "#1e47b0"
  accent-coral: "#ef476f"
  accent-gold: "#ffd166"
  accent-mint: "#06d6a0"
  accent-violet: "#9e47ef"
  chart-1: "#0e6e8f"
  chart-2: "#06d6a0"
  chart-3: "#ffd166"
  chart-4: "#ef476f"
  chart-5: "#9e47ef"
  chart-6: "#ef8247"

typography:
  display-lg:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 96px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-1:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.015em
  title:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-emphasis:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  overline:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.08em

rounded:
  xs: 2px
  sm: 4px
  md: 8px
  input: 12px
  lg: 16px
  card: 24px
  xl: 48px
  pill: 999px

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
    shadow: "0 4px 16px rgba(0, 0, 0, 0.12)"
  modal:
    shadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
---

# Tide theme

Tide: Nunito Sans throughout, #0e6e8f for actions, pill buttons, 12px inputs and 24px cards. Two shadows, one for what floats and one for dialogs. Everything else separates by contrast.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="tide"` on `<html>`. See it at https://rift-ds.com/foundations/themes/tide.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles.

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#0e6e8f` | `#3ca5c6` | `--color-action-primary-bg` |
| `primary-hover` | `#0a4e66` | `#6dbcd6` | `--color-action-primary-bg-hover` |
| `primary-active` | `#052f3e` | `#9ed4e5` | `--color-action-primary-bg-active` |
| `on-primary` | `#cfeaf3` | `#052f3e` | `--color-action-primary-text` |
| `canvas-light` | `#f1f1f1` | `#050505` | `--color-bg-page-primary` |
| `surface` | `#ffffff` | `rgba(14, 14, 14, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#f1f1f1` | `#303030` | `--color-bg-container-secondary` |
| `ink` | `#050505` | `#f1f1f1` | `--color-text-primary` |
| `text-secondary` | `#303030` | `#bcbcbc` | `--color-text-secondary` |
| `text-tertiary` | `#6d6d6d` | `#a2a2a2` | `--color-text-tertiary` |
| `border` | `#d6d6d6` | `#232323` | `--color-bg-container-border` |
| `input` | `#ffffff` | `#050505` | `--color-input-bg-primary` |
| `error` | `#c93a5c` | `#f16385` | `--color-status-error-icon` |
| `success` | `#05a67c` | `#06d6a0` | `--color-status-positive-icon` |
| `warning` | `#c65e33` | `#ef8247` | `--color-status-warning-icon` |
| `info` | `#345ac4` | `#5475d4` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#ef8247`, cobalt `#1e47b0`, coral `#ef476f`, gold `#ffd166`, mint `#06d6a0`, violet `#9e47ef`.

## Typography

Nunito Sans throughout. Levels inside a tier share a weight and step by size.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Nunito Sans | 96px | 300 | 1.05 | 0.02em |
| `display-md` | Nunito Sans | 64px | 300 | 1.1 | 0.015em |
| `sub-display` | Nunito Sans | 30px | 300 | 44px | 0.015em |
| `heading-1` | Nunito Sans | 30px | 600 | 44px | 0.015em |
| `heading-2` | Nunito Sans | 26px | 600 | 32px | 0.015em |
| `heading-3` | Nunito Sans | 22px | 600 | 28px | 0.015em |
| `title` | Nunito Sans | 16px | 600 | 24px | -0.01em |
| `body-md` | Nunito Sans | 16px | 400 | 24px | 0 |
| `body-emphasis` | Nunito Sans | 16px | 500 | 24px | -0.01em |
| `body-sm` | Nunito Sans | 14px | 400 | 20px | 0 |
| `caption` | Nunito Sans | 12px | 400 | 16px | 0 |
| `overline` | Nunito Sans | 14px | 600 | 20px | 0.08em |

## Shape

Pill buttons, 12px inputs and 24px cards. Radius belongs to the element type, never to one instance.

- `xs`: 2px (`--radius-050`)
- `sm`: 4px (`--radius-100`)
- `md`: 8px (`--radius-200`)
- `input`: 12px (`--radius-300`)
- `lg`: 16px (`--radius-400`)
- `card`: 24px (`--radius-600`)
- `xl`: 48px (`--radius-1200`)
- `pill`: 999px (`--radius-pill`)

## Space

- `xxs`: 2px (`--gap-050`)
- `xs`: 4px (`--gap-100`)
- `sm`: 8px (`--gap-200`)
- `md`: 12px (`--gap-300`)
- `lg`: 16px (`--gap-400`)
- `xl`: 20px (`--gap-500`)
- `xxl`: 40px (`--gap-1000`)

## Depth

Two shadows, one for what floats and one for dialogs. Everything else separates by contrast.

## Motion

- `fast`: 150ms
- `base`: 200ms
- `slow`: 300ms
