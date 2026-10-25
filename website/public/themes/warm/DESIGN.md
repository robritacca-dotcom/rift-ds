---
version: alpha
name: "Ember"
description: "The Ember theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#d97757"
  primary-hover: "#dc8063"
  primary-active: "#dd876a"
  on-primary: "#341c15"
  primary-dark: "#d97757"
  canvas-light: "#efedeb"
  canvas-dark: "#14100c"
  surface: "#fcfaf8"
  surface-dark: "rgba(28, 24, 20, 0.8)"
  surface-soft: "#efedeb"
  ink: "#14100c"
  ink-dark: "#ede9e5"
  display: "#14100c"
  display-dark: "#ede9e5"
  heading: "#14100c"
  heading-dark: "#ede9e5"
  text-secondary: "#3c3734"
  text-tertiary: "#746f6c"
  border: "#d4d0cc"
  input: "#fcfaf8"
  error: "#b04b55"
  success: "#358261"
  warning: "#a45a42"
  info: "#5a69ad"
  accent-amber: "#e0955c"
  accent-cobalt: "#5e6fa8"
  accent-coral: "#d4695f"
  accent-gold: "#e7c175"
  accent-mint: "#7fae8f"
  accent-violet: "#a5789f"
  chart-1: "#d97757"
  chart-2: "#7fae8f"
  chart-3: "#e7c175"
  chart-4: "#d4695f"
  chart-5: "#a5789f"
  chart-6: "#e0955c"

typography:
  display-lg:
    fontFamily: "'Lora', serif"
    fontSize: 96px
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'Lora', serif"
    fontSize: 64px
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'Lora', serif"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-1:
    fontFamily: "'Lora', serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'Lora', serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'Lora', serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.015em
  title:
    fontFamily: "'Source Sans 3', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: "'Source Sans 3', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-emphasis:
    fontFamily: "'Source Sans 3', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "'Source Sans 3', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: "'Source Sans 3', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  overline:
    fontFamily: "'Source Sans 3', sans-serif"
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

# Ember theme

Ember: Lora headings over Source Sans 3 text, #d97757 for actions, pill buttons, 12px inputs and 24px cards. Two shadows, one for what floats and one for dialogs. Everything else separates by contrast.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="warm"` on `<html>`. See it at https://rift-ds.com/foundations/themes/warm.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles.

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#d97757` | `#d97757` | `--color-action-primary-bg` |
| `primary-hover` | `#dc8063` | `#dc8063` | `--color-action-primary-bg-hover` |
| `primary-active` | `#dd876a` | `#dd876a` | `--color-action-primary-bg-active` |
| `on-primary` | `#341c15` | `#341c15` | `--color-action-primary-text` |
| `canvas-light` | `#efedeb` | `#14100c` | `--color-bg-page-primary` |
| `surface` | `#fcfaf8` | `rgba(28, 24, 20, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#efedeb` | `#3c3734` | `--color-bg-container-secondary` |
| `ink` | `#14100c` | `#ede9e5` | `--color-text-primary` |
| `display` | `#14100c` | `#ede9e5` | `--color-text-display` |
| `heading` | `#14100c` | `#ede9e5` | `--color-text-heading` |
| `text-secondary` | `#3c3734` | `#bcb8b4` | `--color-text-secondary` |
| `text-tertiary` | `#746f6c` | `#a4a09c` | `--color-text-tertiary` |
| `border` | `#d4d0cc` | `#302b28` | `--color-bg-container-border` |
| `input` | `#fcfaf8` | `#14100c` | `--color-input-bg-primary` |
| `error` | `#b04b55` | `#da737c` | `--color-status-error-icon` |
| `success` | `#358261` | `#44a87d` | `--color-status-positive-icon` |
| `warning` | `#a45a42` | `#d97757` | `--color-status-warning-icon` |
| `info` | `#5a69ad` | `#7a86bd` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#e0955c`, cobalt `#5e6fa8`, coral `#d4695f`, gold `#e7c175`, mint `#7fae8f`, violet `#a5789f`.

## Typography

Lora headings over Source Sans 3 text. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Lora | 96px | 300 | 1.05 | 0.02em |
| `display-md` | Lora | 64px | 300 | 1.1 | 0.015em |
| `sub-display` | Lora | 30px | 300 | 44px | 0.015em |
| `heading-1` | Lora | 30px | 600 | 44px | 0.015em |
| `heading-2` | Lora | 26px | 600 | 32px | 0.015em |
| `heading-3` | Lora | 22px | 600 | 28px | 0.015em |
| `title` | Source Sans 3 | 16px | 600 | 24px | -0.01em |
| `body-md` | Source Sans 3 | 16px | 400 | 24px | 0 |
| `body-emphasis` | Source Sans 3 | 16px | 500 | 24px | -0.01em |
| `body-sm` | Source Sans 3 | 14px | 400 | 20px | 0 |
| `caption` | Source Sans 3 | 12px | 400 | 16px | 0 |
| `overline` | Source Sans 3 | 14px | 600 | 20px | 0.08em |

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
