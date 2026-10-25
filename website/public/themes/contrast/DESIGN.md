---
version: alpha
name: "Blueprint"
description: "The Blueprint theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#003dff"
  primary-hover: "#002ec2"
  primary-active: "#002085"
  on-primary: "#d7e1ff"
  primary-dark: "#003dff"
  canvas-light: "#ecedf1"
  canvas-dark: "#05070f"
  surface: "#fafbff"
  surface-dark: "rgba(13, 16, 24, 0.8)"
  surface-soft: "#ecedf1"
  ink: "#05070f"
  ink-dark: "#e7eaf2"
  display: "#05070f"
  display-dark: "#e7eaf2"
  heading: "#05070f"
  heading-dark: "#e7eaf2"
  text-secondary: "#2e3138"
  text-tertiary: "#696b73"
  border: "#cdd0d8"
  input: "#fafbff"
  error: "#d32652"
  success: "#00a66f"
  warning: "#c15123"
  info: "#275aff"
  accent-amber: "#ff8a3d"
  accent-cobalt: "#2e5bff"
  accent-coral: "#ff3d7a"
  accent-gold: "#ffc53d"
  accent-mint: "#00e0b8"
  accent-violet: "#7a3dff"
  chart-1: "#003dff"
  chart-2: "#00e0b8"
  chart-3: "#ffc53d"
  chart-4: "#ff3d7a"
  chart-5: "#7a3dff"
  chart-6: "#ff8a3d"

typography:
  display-lg:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 96px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-1:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.015em
  title:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-emphasis:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  overline:
    fontFamily: "'IBM Plex Sans', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.08em

rounded:
  xs: 1px
  sm: 3px
  md: 6px
  input: 8px
  lg: 11px
  card: 17px
  xl: 34px
  pill: 11px

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

# Blueprint theme

Blueprint: IBM Plex Sans throughout, #003dff for actions, buttons squared to 11px, 8px inputs and 17px cards. Two shadows, one for what floats and one for dialogs. Everything else separates by contrast.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="contrast"` on `<html>`. See it at https://rift-ds.com/foundations/themes/contrast.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles.

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#003dff` | `#003dff` | `--color-action-primary-bg` |
| `primary-hover` | `#002ec2` | `#002ec2` | `--color-action-primary-bg-hover` |
| `primary-active` | `#002085` | `#002085` | `--color-action-primary-bg-active` |
| `on-primary` | `#d7e1ff` | `#d7e1ff` | `--color-action-primary-text` |
| `canvas-light` | `#ecedf1` | `#05070f` | `--color-bg-page-primary` |
| `surface` | `#fafbff` | `rgba(13, 16, 24, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#ecedf1` | `#2e3138` | `--color-bg-container-secondary` |
| `ink` | `#05070f` | `#e7eaf2` | `--color-text-primary` |
| `display` | `#05070f` | `#e7eaf2` | `--color-text-display` |
| `heading` | `#05070f` | `#e7eaf2` | `--color-text-heading` |
| `text-secondary` | `#2e3138` | `#b4b7bf` | `--color-text-secondary` |
| `text-tertiary` | `#696b73` | `#9c9ea6` | `--color-text-tertiary` |
| `border` | `#cdd0d8` | `#22242c` | `--color-bg-container-border` |
| `input` | `#fafbff` | `#05070f` | `--color-input-bg-primary` |
| `error` | `#d32652` | `#ff4c79` | `--color-status-error-icon` |
| `success` | `#00a66f` | `#00d68f` | `--color-status-positive-icon` |
| `warning` | `#c15123` | `#ff6b2e` | `--color-status-warning-icon` |
| `info` | `#275aff` | `#507aff` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#ff8a3d`, cobalt `#2e5bff`, coral `#ff3d7a`, gold `#ffc53d`, mint `#00e0b8`, violet `#7a3dff`.

## Typography

IBM Plex Sans throughout. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | IBM Plex Sans | 96px | 300 | 1.05 | 0.02em |
| `display-md` | IBM Plex Sans | 64px | 300 | 1.1 | 0.015em |
| `sub-display` | IBM Plex Sans | 30px | 300 | 44px | 0.015em |
| `heading-1` | IBM Plex Sans | 30px | 600 | 44px | 0.015em |
| `heading-2` | IBM Plex Sans | 26px | 600 | 32px | 0.015em |
| `heading-3` | IBM Plex Sans | 22px | 600 | 28px | 0.015em |
| `title` | IBM Plex Sans | 16px | 600 | 24px | -0.01em |
| `body-md` | IBM Plex Sans | 16px | 400 | 24px | 0 |
| `body-emphasis` | IBM Plex Sans | 16px | 500 | 24px | -0.01em |
| `body-sm` | IBM Plex Sans | 14px | 400 | 20px | 0 |
| `caption` | IBM Plex Sans | 12px | 400 | 16px | 0 |
| `overline` | IBM Plex Sans | 14px | 600 | 20px | 0.08em |

## Shape

Buttons squared to 11px, 8px inputs and 17px cards. Radius belongs to the element type, never to one instance.

- `xs`: 1px (`--radius-050`)
- `sm`: 3px (`--radius-100`)
- `md`: 6px (`--radius-200`)
- `input`: 8px (`--radius-300`)
- `lg`: 11px (`--radius-400`)
- `card`: 17px (`--radius-600`)
- `xl`: 34px (`--radius-1200`)
- `pill`: 11px (`--radius-pill`)

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
