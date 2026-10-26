---
version: alpha
name: "Getaway"
description: "The Getaway theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#d9234e"
  primary-hover: "#b41d41"
  primary-active: "#7c142d"
  on-primary: "#ffffff"
  primary-dark: "#d9234e"
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
  logo: "#d9234e"
  logo-dark: "#d9234e"
  text-secondary: "#303030"
  text-tertiary: "#6d6d6d"
  border: "#d6d6d6"
  input: "#ffffff"
  error: "#b41d41"
  success: "#318360"
  warning: "#bf4c22"
  info: "#658fd7"
  accent-amber: "#ff8e3c"
  accent-cobalt: "#5e7bd0"
  accent-coral: "#ff5a5f"
  accent-gold: "#ffc24b"
  accent-mint: "#2ebfa5"
  accent-violet: "#c86b98"
  chart-1: "#d9234e"
  chart-2: "#2ebfa5"
  chart-3: "#ffc24b"
  chart-4: "#ff5a5f"
  chart-5: "#c86b98"
  chart-6: "#ff8e3c"

typography:
  display-lg:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 96px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-1:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'Poppins', sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.015em
  title:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-emphasis:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  overline:
    fontFamily: "'DM Sans', sans-serif"
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
  pill: 16px

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

# Getaway theme

Getaway: Poppins headings over DM Sans text, #d9234e for actions, buttons squared to 16px, 12px inputs and 24px cards. Soft shadows, kept for what floats: menus, popovers and dialogs.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="coral"` on `<html>`. See it at https://rift-ds.com/foundations/themes/coral.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo wears the action colour (`logo`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#d9234e` | `#d9234e` | `--color-action-primary-bg` |
| `primary-hover` | `#b41d41` | `#b41d41` | `--color-action-primary-bg-hover` |
| `primary-active` | `#7c142d` | `#7c142d` | `--color-action-primary-bg-active` |
| `on-primary` | `#ffffff` | `#ffffff` | `--color-action-primary-text` |
| `canvas-light` | `#f1f1f1` | `#050505` | `--color-bg-page-primary` |
| `surface` | `#ffffff` | `rgba(14, 14, 14, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#f1f1f1` | `#303030` | `--color-bg-container-secondary` |
| `ink` | `#050505` | `#f1f1f1` | `--color-text-primary` |
| `display` | `#050505` | `#f1f1f1` | `--color-text-display` |
| `heading` | `#050505` | `#f1f1f1` | `--color-text-heading` |
| `logo` | `#d9234e` | `#d9234e` | `--color-brand-mark` |
| `text-secondary` | `#303030` | `#bcbcbc` | `--color-text-secondary` |
| `text-tertiary` | `#6d6d6d` | `#a2a2a2` | `--color-text-tertiary` |
| `border` | `#d6d6d6` | `#232323` | `--color-bg-container-border` |
| `input` | `#ffffff` | `#050505` | `--color-input-bg-primary` |
| `error` | `#b41d41` | `#de4367` | `--color-status-error-icon` |
| `success` | `#318360` | `#3fa97c` | `--color-status-positive-icon` |
| `warning` | `#bf4c22` | `#fc642d` | `--color-status-warning-icon` |
| `info` | `#658fd7` | `#83a5df` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#ff8e3c`, cobalt `#5e7bd0`, coral `#ff5a5f`, gold `#ffc24b`, mint `#2ebfa5`, violet `#c86b98`.

## Typography

Poppins headings over DM Sans text. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Poppins | 96px | 300 | 1.05 | 0.02em |
| `display-md` | Poppins | 64px | 300 | 1.1 | 0.015em |
| `sub-display` | Poppins | 30px | 300 | 44px | 0.015em |
| `heading-1` | Poppins | 30px | 600 | 44px | 0.015em |
| `heading-2` | Poppins | 26px | 600 | 32px | 0.015em |
| `heading-3` | Poppins | 22px | 600 | 28px | 0.015em |
| `title` | DM Sans | 16px | 600 | 24px | -0.01em |
| `body-md` | DM Sans | 16px | 400 | 24px | 0 |
| `body-emphasis` | DM Sans | 16px | 500 | 24px | -0.01em |
| `body-sm` | DM Sans | 14px | 400 | 20px | 0 |
| `caption` | DM Sans | 12px | 400 | 16px | 0 |
| `overline` | DM Sans | 14px | 600 | 20px | 0.08em |

## Shape

Buttons squared to 16px, 12px inputs and 24px cards. Radius belongs to the element type, never to one instance.

- `xs`: 2px (`--radius-050`)
- `sm`: 4px (`--radius-100`)
- `md`: 8px (`--radius-200`)
- `input`: 12px (`--radius-300`)
- `lg`: 16px (`--radius-400`)
- `card`: 24px (`--radius-600`)
- `xl`: 48px (`--radius-1200`)
- `pill`: 16px (`--radius-pill`)

## Space

- `xxs`: 2px (`--gap-050`)
- `xs`: 4px (`--gap-100`)
- `sm`: 8px (`--gap-200`)
- `md`: 12px (`--gap-300`)
- `lg`: 16px (`--gap-400`)
- `xl`: 20px (`--gap-500`)
- `xxl`: 40px (`--gap-1000`)

## Depth

Soft shadows, kept for what floats: menus, popovers and dialogs.

## Motion

- `fast`: 150ms
- `base`: 200ms
- `slow`: 300ms
