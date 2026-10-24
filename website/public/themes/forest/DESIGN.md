---
version: alpha
name: "Forest"
description: "The Forest theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#23573f"
  primary-hover: "#1b4331"
  primary-active: "#133023"
  on-primary: "#cfdad5"
  primary-dark: "#23573f"
  canvas-light: "#ebecec"
  canvas-dark: "#070a08"
  surface: "#f8faf9"
  surface-dark: "rgba(15, 18, 17, 0.8)"
  surface-soft: "#ebecec"
  ink: "#070a08"
  ink-dark: "#e5e8e6"
  text-secondary: "#2f3231"
  text-tertiary: "#696c6a"
  border: "#cbcecd"
  input: "#f8faf9"
  error: "#a7443e"
  success: "#1b4331"
  warning: "#915126"
  info: "#5881ab"
  accent-amber: "#c97f3f"
  accent-cobalt: "#446e93"
  accent-coral: "#b45e4a"
  accent-gold: "#c2a147"
  accent-mint: "#4e9a6c"
  accent-violet: "#7e6899"
  chart-1: "#23573f"
  chart-2: "#4e9a6c"
  chart-3: "#c2a147"
  chart-4: "#b45e4a"
  chart-5: "#7e6899"
  chart-6: "#c97f3f"

typography:
  display-lg:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 96px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: 30px
    fontWeight: 500
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
---

# Forest theme

Forest: Montserrat headings over DM Sans text, #23573f for actions, pill buttons, 12px inputs and 24px cards. Soft shadows, kept for what floats: menus, popovers and dialogs.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="forest"` on `<html>`. See it at https://rift-ds.com/foundations/themes/forest.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles.

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#23573f` | `#23573f` | `--color-action-primary-bg` |
| `primary-hover` | `#1b4331` | `#1b4331` | `--color-action-primary-bg-hover` |
| `primary-active` | `#133023` | `#133023` | `--color-action-primary-bg-active` |
| `on-primary` | `#cfdad5` | `#cfdad5` | `--color-action-primary-text` |
| `canvas-light` | `#ebecec` | `#070a08` | `--color-bg-page-primary` |
| `surface` | `#f8faf9` | `rgba(15, 18, 17, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#ebecec` | `#2f3231` | `--color-bg-container-secondary` |
| `ink` | `#070a08` | `#e5e8e6` | `--color-text-primary` |
| `text-secondary` | `#2f3231` | `#b3b6b5` | `--color-text-secondary` |
| `text-tertiary` | `#696c6a` | `#9a9e9c` | `--color-text-tertiary` |
| `border` | `#cbcecd` | `#232625` | `--color-bg-container-border` |
| `input` | `#f8faf9` | `#070a08` | `--color-input-bg-primary` |
| `error` | `#a7443e` | `#d16b65` | `--color-status-error-icon` |
| `success` | `#1b4331` | `#23573f` | `--color-status-positive-icon` |
| `warning` | `#915126` | `#c06b32` | `--color-status-warning-icon` |
| `info` | `#5881ab` | `#789abb` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#c97f3f`, cobalt `#446e93`, coral `#b45e4a`, gold `#c2a147`, mint `#4e9a6c`, violet `#7e6899`.

## Typography

Montserrat headings over DM Sans text. Levels inside a tier share a weight and step by size.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Montserrat | 96px | 600 | 1.05 | 0.02em |
| `display-md` | Montserrat | 64px | 600 | 1.1 | 0.015em |
| `sub-display` | Montserrat | 30px | 500 | 44px | 0.015em |
| `heading-1` | Montserrat | 30px | 600 | 44px | 0.015em |
| `heading-2` | Montserrat | 26px | 600 | 32px | 0.015em |
| `heading-3` | Montserrat | 22px | 600 | 28px | 0.015em |
| `title` | DM Sans | 16px | 600 | 24px | -0.01em |
| `body-md` | DM Sans | 16px | 400 | 24px | 0 |
| `body-emphasis` | DM Sans | 16px | 500 | 24px | -0.01em |
| `body-sm` | DM Sans | 14px | 400 | 20px | 0 |
| `caption` | DM Sans | 12px | 400 | 16px | 0 |
| `overline` | DM Sans | 14px | 600 | 20px | 0.08em |

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

Soft shadows, kept for what floats: menus, popovers and dialogs.

## Motion

- `fast`: 150ms
- `base`: 200ms
- `slow`: 300ms
