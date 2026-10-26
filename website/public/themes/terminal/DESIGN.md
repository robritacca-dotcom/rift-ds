---
version: alpha
name: "Terminal"
description: "The Terminal theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#06d6a0"
  primary-hover: "#41d9ac"
  primary-active: "#5addb6"
  on-primary: "#01342a"
  primary-dark: "#06d6a0"
  canvas-light: "#ecf0ef"
  canvas-dark: "#050d0b"
  surface: "#fafefd"
  surface-dark: "rgba(14, 22, 20, 0.8)"
  surface-soft: "#ecf0ef"
  ink: "#050d0b"
  ink-dark: "#e8f0ee"
  display: "#050d0b"
  display-dark: "#e8f0ee"
  heading: "#050d0b"
  heading-dark: "#e8f0ee"
  logo: "#06d6a0"
  logo-dark: "#06d6a0"
  logo-end: "#5addb6"
  logo-end-dark: "#5addb6"
  text-secondary: "#2e3734"
  text-tertiary: "#69716f"
  border: "#ced6d4"
  input: "#fafefd"
  error: "#ba4754"
  success: "#05a67c"
  warning: "#a97441"
  info: "#4b72b1"
  accent-amber: "#57e0b0"
  accent-cobalt: "#2fa98f"
  accent-coral: "#35d6a0"
  accent-gold: "#7ce8c2"
  accent-mint: "#06d6a0"
  accent-violet: "#3dbfa8"
  chart-1: "#06d6a0"
  chart-2: "#06d6a0"
  chart-3: "#7ce8c2"
  chart-4: "#35d6a0"
  chart-5: "#3dbfa8"
  chart-6: "#57e0b0"

typography:
  display-lg:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 96px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-1:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.015em
  title:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-emphasis:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  overline:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.08em

rounded:
  xs: 0px
  sm: 0px
  md: 0px
  input: 0px
  lg: 0px
  card: 0px
  xl: 0px
  pill: 0px

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

# Terminal theme

Terminal: IBM Plex Mono throughout, #06d6a0 for actions, buttons squared to 0px, 0px inputs and 0px cards. Flat: no shadows at all. Surfaces separate from the page by contrast alone.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="terminal"` on `<html>`. See it at https://rift-ds.com/foundations/themes/terminal.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo wears the action colour (`logo`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#06d6a0` | `#06d6a0` | `--color-action-primary-bg` |
| `primary-hover` | `#41d9ac` | `#41d9ac` | `--color-action-primary-bg-hover` |
| `primary-active` | `#5addb6` | `#5addb6` | `--color-action-primary-bg-active` |
| `on-primary` | `#01342a` | `#01342a` | `--color-action-primary-text` |
| `canvas-light` | `#ecf0ef` | `#050d0b` | `--color-bg-page-primary` |
| `surface` | `#fafefd` | `rgba(14, 22, 20, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#ecf0ef` | `#2e3734` | `--color-bg-container-secondary` |
| `ink` | `#050d0b` | `#e8f0ee` | `--color-text-primary` |
| `display` | `#050d0b` | `#e8f0ee` | `--color-text-display` |
| `heading` | `#050d0b` | `#e8f0ee` | `--color-text-heading` |
| `logo` | `#06d6a0` | `#06d6a0` | `--color-brand-mark` |
| `logo-end` | `#5addb6` | `#5addb6` | `--color-brand-mark-end` |
| `text-secondary` | `#2e3734` | `#b5bdbb` | `--color-text-secondary` |
| `text-tertiary` | `#69716f` | `#9ca4a2` | `--color-text-tertiary` |
| `border` | `#ced6d4` | `#222a28` | `--color-bg-container-border` |
| `input` | `#fafefd` | `#050d0b` | `--color-input-bg-primary` |
| `error` | `#ba4754` | `#e46e7b` | `--color-status-error-icon` |
| `success` | `#05a67c` | `#06d6a0` | `--color-status-positive-icon` |
| `warning` | `#a97441` | `#e09956` | `--color-status-warning-icon` |
| `info` | `#4b72b1` | `#6e8dc0` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#57e0b0`, cobalt `#2fa98f`, coral `#35d6a0`, gold `#7ce8c2`, mint `#06d6a0`, violet `#3dbfa8`.

## Typography

IBM Plex Mono throughout. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | IBM Plex Mono | 96px | 300 | 1.05 | 0.02em |
| `display-md` | IBM Plex Mono | 64px | 300 | 1.1 | 0.015em |
| `sub-display` | IBM Plex Mono | 30px | 300 | 44px | 0.015em |
| `heading-1` | IBM Plex Mono | 30px | 600 | 44px | 0.015em |
| `heading-2` | IBM Plex Mono | 26px | 600 | 32px | 0.015em |
| `heading-3` | IBM Plex Mono | 22px | 600 | 28px | 0.015em |
| `title` | IBM Plex Mono | 16px | 600 | 24px | -0.01em |
| `body-md` | IBM Plex Mono | 16px | 400 | 24px | 0 |
| `body-emphasis` | IBM Plex Mono | 16px | 500 | 24px | -0.01em |
| `body-sm` | IBM Plex Mono | 14px | 400 | 20px | 0 |
| `caption` | IBM Plex Mono | 12px | 400 | 16px | 0 |
| `overline` | IBM Plex Mono | 14px | 600 | 20px | 0.08em |

## Shape

Buttons squared to 0px, 0px inputs and 0px cards. Radius belongs to the element type, never to one instance.

- `xs`: 0px (`--radius-050`)
- `sm`: 0px (`--radius-100`)
- `md`: 0px (`--radius-200`)
- `input`: 0px (`--radius-300`)
- `lg`: 0px (`--radius-400`)
- `card`: 0px (`--radius-600`)
- `xl`: 0px (`--radius-1200`)
- `pill`: 0px (`--radius-pill`)

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

- `fast`: 120ms
- `base`: 160ms
- `slow`: 240ms
