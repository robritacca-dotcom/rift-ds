---
version: alpha
name: "Velvet"
description: "The Velvet theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#7434b3"
  primary-hover: "#52247d"
  primary-active: "#31164a"
  on-primary: "#e6d2fb"
  primary-dark: "#7434b3"
  canvas-light: "#efedf1"
  canvas-dark: "#0d0811"
  surface: "#fdfaff"
  surface-dark: "rgba(21, 17, 25, 0.8)"
  surface-soft: "#efedf1"
  ink: "#0d0811"
  ink-dark: "#ede9f1"
  display: "#0d0811"
  display-dark: "#ede9f1"
  heading: "#0d0811"
  heading-dark: "#ede9f1"
  logo: "#7434b3"
  logo-dark: "#7434b3"
  logo-end: "#31164a"
  logo-end-dark: "#31164a"
  text-secondary: "#36313a"
  text-tertiary: "#6f6b74"
  border: "#d3cfd7"
  input: "#fdfaff"
  error: "#ba4777"
  success: "#318874"
  warning: "#a45d4a"
  info: "#757bde"
  accent-amber: "#d9915e"
  accent-cobalt: "#6a5be0"
  accent-coral: "#d96ba8"
  accent-gold: "#d9be7a"
  accent-mint: "#6bae9e"
  accent-violet: "#9e47ef"
  chart-1: "#7434b3"
  chart-2: "#6bae9e"
  chart-3: "#d9be7a"
  chart-4: "#d96ba8"
  chart-5: "#9e47ef"
  chart-6: "#d9915e"

typography:
  display-lg:
    fontFamily: "'Playfair Display', serif"
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0.015em
  display-md:
    fontFamily: "'Playfair Display', serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0.01em
  sub-display:
    fontFamily: "'Playfair Display', serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 44px
    letterSpacing: 0.01em
  heading-1:
    fontFamily: "'Playfair Display', serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: 0.01em
  heading-2:
    fontFamily: "'Playfair Display', serif"
    fontSize: 26px
    fontWeight: 500
    lineHeight: 32px
    letterSpacing: 0.01em
  heading-3:
    fontFamily: "'Playfair Display', serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0.01em
  title:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.015em
  body-md:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: -0.005em
  body-emphasis:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.015em
  body-sm:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: -0.005em
  caption:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: -0.005em
  overline:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.075em

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
  md: 13px
  lg: 17px
  xl: 21px
  xxl: 42px

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

# Velvet theme

Velvet: Playfair Display headings over Plus Jakarta Sans text, #7434b3 for actions, pill buttons, 17px inputs and 34px cards. Soft shadows, kept for what floats: menus, popovers and dialogs.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="violet"` on `<html>`. See it at https://rift-ds.com/foundations/themes/violet.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo wears the action colour (`logo`). Its mark is a gradient within that one colour (`logo-end`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#7434b3` | `#7434b3` | `--color-action-primary-bg` |
| `primary-hover` | `#52247d` | `#52247d` | `--color-action-primary-bg-hover` |
| `primary-active` | `#31164a` | `#31164a` | `--color-action-primary-bg-active` |
| `on-primary` | `#e6d2fb` | `#e6d2fb` | `--color-action-primary-text` |
| `canvas-light` | `#efedf1` | `#0d0811` | `--color-bg-page-primary` |
| `surface` | `#fdfaff` | `rgba(21, 17, 25, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#efedf1` | `#36313a` | `--color-bg-container-secondary` |
| `ink` | `#0d0811` | `#ede9f1` | `--color-text-primary` |
| `display` | `#0d0811` | `#ede9f1` | `--color-text-display` |
| `heading` | `#0d0811` | `#ede9f1` | `--color-text-heading` |
| `logo` | `#7434b3` | `#7434b3` | `--color-brand-mark` |
| `logo-end` | `#31164a` | `#31164a` | `--color-brand-mark-end` |
| `text-secondary` | `#36313a` | `#bbb6bf` | `--color-text-secondary` |
| `text-tertiary` | `#6f6b74` | `#a29da6` | `--color-text-tertiary` |
| `border` | `#d3cfd7` | `#29252d` | `--color-bg-container-border` |
| `input` | `#fdfaff` | `#0d0811` | `--color-input-bg-primary` |
| `error` | `#ba4777` | `#e46e9f` | `--color-status-error-icon` |
| `success` | `#318874` | `#3faf95` | `--color-status-positive-icon` |
| `warning` | `#a45d4a` | `#d97b62` | `--color-status-warning-icon` |
| `info` | `#757bde` | `#8f94e4` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#d9915e`, cobalt `#6a5be0`, coral `#d96ba8`, gold `#d9be7a`, mint `#6bae9e`, violet `#9e47ef`.

## Typography

Playfair Display headings over Plus Jakarta Sans text. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Playfair Display | 96px | 400 | 1.05 | 0.015em |
| `display-md` | Playfair Display | 64px | 400 | 1.1 | 0.01em |
| `sub-display` | Playfair Display | 30px | 400 | 44px | 0.01em |
| `heading-1` | Playfair Display | 30px | 500 | 44px | 0.01em |
| `heading-2` | Playfair Display | 26px | 500 | 32px | 0.01em |
| `heading-3` | Playfair Display | 22px | 500 | 28px | 0.01em |
| `title` | Plus Jakarta Sans | 16px | 500 | 24px | -0.015em |
| `body-md` | Plus Jakarta Sans | 16px | 400 | 24px | -0.005em |
| `body-emphasis` | Plus Jakarta Sans | 16px | 500 | 24px | -0.015em |
| `body-sm` | Plus Jakarta Sans | 14px | 400 | 20px | -0.005em |
| `caption` | Plus Jakarta Sans | 12px | 400 | 16px | -0.005em |
| `overline` | Plus Jakarta Sans | 14px | 600 | 20px | 0.075em |

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
- `md`: 13px (`--gap-300`)
- `lg`: 17px (`--gap-400`)
- `xl`: 21px (`--gap-500`)
- `xxl`: 42px (`--gap-1000`)

## Depth

Soft shadows, kept for what floats: menus, popovers and dialogs.

## Motion

- `fast`: 150ms
- `base`: 200ms
- `slow`: 300ms
