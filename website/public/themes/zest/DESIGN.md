---
version: alpha
name: "Zest"
description: "The Zest theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#8ae86e"
  primary-hover: "#9beb83"
  primary-active: "#a7ee92"
  on-primary: "#233b1c"
  primary-dark: "#8ae86e"
  canvas-light: "#ededec"
  canvas-dark: "#060705"
  surface: "#fafbfa"
  surface-dark: "rgba(14, 15, 13, 0.8)"
  surface-soft: "#ededec"
  ink: "#060705"
  ink-dark: "#e8e9e7"
  display: "#060705"
  display-dark: "#e8e9e7"
  heading: "#060705"
  heading-dark: "#e8e9e7"
  logo: "#8ae86e"
  logo-dark: "#8ae86e"
  logo-end: "#a7ee92"
  logo-end-dark: "#a7ee92"
  text-secondary: "#2f302e"
  text-tertiary: "#6a6b69"
  border: "#cecfcd"
  input: "#fafbfa"
  error: "#c7384c"
  success: "#6bb455"
  warning: "#c16a32"
  info: "#5a81eb"
  accent-amber: "#ffa94d"
  accent-cobalt: "#5aa9e6"
  accent-coral: "#ff7a66"
  accent-gold: "#ffe14d"
  accent-mint: "#8ae86e"
  accent-violet: "#b18cff"
  chart-1: "#8ae86e"
  chart-2: "#8ae86e"
  chart-3: "#ffe14d"
  chart-4: "#ff7a66"
  chart-5: "#b18cff"
  chart-6: "#ffa94d"

typography:
  display-lg:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 96px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.025em
  display-md:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  sub-display:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.015em
  heading-1:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'Inter Tight', sans-serif"
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
  xs: 3px
  sm: 6px
  md: 11px
  input: 17px
  lg: 22px
  card: 34px
  xl: 67px
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

# Zest theme

Zest: Inter Tight headings over Inter text, #8ae86e for actions, pill buttons, 17px inputs and 34px cards. Soft shadows, kept for what floats: menus, popovers and dialogs.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="zest"` on `<html>`. See it at https://rift-ds.com/foundations/themes/zest.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo wears the action colour (`logo`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#8ae86e` | `#8ae86e` | `--color-action-primary-bg` |
| `primary-hover` | `#9beb83` | `#9beb83` | `--color-action-primary-bg-hover` |
| `primary-active` | `#a7ee92` | `#a7ee92` | `--color-action-primary-bg-active` |
| `on-primary` | `#233b1c` | `#233b1c` | `--color-action-primary-text` |
| `canvas-light` | `#ededec` | `#060705` | `--color-bg-page-primary` |
| `surface` | `#fafbfa` | `rgba(14, 15, 13, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#ededec` | `#2f302e` | `--color-bg-container-secondary` |
| `ink` | `#060705` | `#e8e9e7` | `--color-text-primary` |
| `display` | `#060705` | `#e8e9e7` | `--color-text-display` |
| `heading` | `#060705` | `#e8e9e7` | `--color-text-heading` |
| `logo` | `#8ae86e` | `#8ae86e` | `--color-brand-mark` |
| `logo-end` | `#a7ee92` | `#a7ee92` | `--color-brand-mark-end` |
| `text-secondary` | `#2f302e` | `#b5b7b4` | `--color-text-secondary` |
| `text-tertiary` | `#6a6b69` | `#9c9e9c` | `--color-text-tertiary` |
| `border` | `#cecfcd` | `#222422` | `--color-bg-container-border` |
| `input` | `#fafbfa` | `#060705` | `--color-input-bg-primary` |
| `error` | `#c7384c` | `#f25e73` | `--color-status-error-icon` |
| `success` | `#6bb455` | `#8ae86e` | `--color-status-positive-icon` |
| `warning` | `#c16a32` | `#ff8c42` | `--color-status-warning-icon` |
| `info` | `#5a81eb` | `#7a9aef` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#ffa94d`, cobalt `#5aa9e6`, coral `#ff7a66`, gold `#ffe14d`, mint `#8ae86e`, violet `#b18cff`.

## Typography

Inter Tight headings over Inter text. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Inter Tight | 96px | 800 | 1.05 | -0.025em |
| `display-md` | Inter Tight | 64px | 800 | 1.1 | -0.02em |
| `sub-display` | Inter Tight | 30px | 700 | 44px | -0.015em |
| `heading-1` | Inter Tight | 30px | 600 | 44px | 0.015em |
| `heading-2` | Inter Tight | 26px | 600 | 32px | 0.015em |
| `heading-3` | Inter Tight | 22px | 600 | 28px | 0.015em |
| `title` | Inter | 16px | 600 | 24px | -0.01em |
| `body-md` | Inter | 16px | 400 | 24px | 0 |
| `body-emphasis` | Inter | 16px | 500 | 24px | -0.01em |
| `body-sm` | Inter | 14px | 400 | 20px | 0 |
| `caption` | Inter | 12px | 400 | 16px | 0 |
| `overline` | Inter | 14px | 600 | 20px | 0.08em |

## Shape

Pill buttons, 17px inputs and 34px cards. Radius belongs to the element type, never to one instance.

- `xs`: 3px (`--radius-050`)
- `sm`: 6px (`--radius-100`)
- `md`: 11px (`--radius-200`)
- `input`: 17px (`--radius-300`)
- `lg`: 22px (`--radius-400`)
- `card`: 34px (`--radius-600`)
- `xl`: 67px (`--radius-1200`)
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
