---
version: alpha
name: "Bubblegum"
description: "The Bubblegum theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#d0117e"
  primary-hover: "#ac0e68"
  primary-active: "#770a48"
  on-primary: "#fef8fb"
  primary-dark: "#d0117e"
  canvas-light: "#f0eaee"
  canvas-dark: "#11060c"
  surface: "#fef8fb"
  surface-dark: "rgba(26, 14, 21, 0.8)"
  surface-soft: "#f0eaee"
  ink: "#11060c"
  ink-dark: "#efe4ea"
  display: "#11060c"
  display-dark: "#efe4ea"
  heading: "#11060c"
  heading-dark: "#efe4ea"
  logo: "#d0117e"
  logo-dark: "#d0117e"
  logo-end: "#770a48"
  logo-end-dark: "#770a48"
  text-secondary: "#3a2e35"
  text-tertiary: "#73676e"
  border: "#d6cad1"
  input: "#fef8fb"
  error: "#ac0e68"
  success: "#24a86b"
  warning: "#c15c2e"
  info: "#6881ff"
  accent-amber: "#ff9a4d"
  accent-cobalt: "#5c7cff"
  accent-coral: "#ff5a8a"
  accent-gold: "#ffd34d"
  accent-mint: "#3ddcb8"
  accent-violet: "#c45cff"
  chart-1: "#d0117e"
  chart-2: "#3ddcb8"
  chart-3: "#ffd34d"
  chart-4: "#ff5a8a"
  chart-5: "#c45cff"
  chart-6: "#ff9a4d"

typography:
  display-lg:
    fontFamily: "'Fredoka', sans-serif"
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0.025em
  display-md:
    fontFamily: "'Fredoka', sans-serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0.02em
  sub-display:
    fontFamily: "'Fredoka', sans-serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 44px
    letterSpacing: 0.02em
  heading-1:
    fontFamily: "'Fredoka', sans-serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: 0.02em
  heading-2:
    fontFamily: "'Fredoka', sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: 0.02em
  heading-3:
    fontFamily: "'Fredoka', sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: 0.02em
  title:
    fontFamily: "'Nunito', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: "'Nunito', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.005em
  body-emphasis:
    fontFamily: "'Nunito', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: "'Nunito', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.005em
  caption:
    fontFamily: "'Nunito', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.005em
  overline:
    fontFamily: "'Nunito', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.085em

rounded:
  xs: 2px
  sm: 5px
  md: 10px
  input: 14px
  lg: 19px
  card: 29px
  xl: 58px
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

# Bubblegum theme

Bubblegum: Fredoka headings over Nunito text, #d0117e for actions, pill buttons, 14px inputs and 29px cards. Soft shadows, kept for what floats: menus, popovers and dialogs.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="pink"` on `<html>`. See it at https://rift-ds.com/foundations/themes/pink.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo wears the action colour (`logo`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#d0117e` | `#d0117e` | `--color-action-primary-bg` |
| `primary-hover` | `#ac0e68` | `#ac0e68` | `--color-action-primary-bg-hover` |
| `primary-active` | `#770a48` | `#770a48` | `--color-action-primary-bg-active` |
| `on-primary` | `#fef8fb` | `#fcf1f7` | `--color-action-primary-text` |
| `canvas-light` | `#f0eaee` | `#11060c` | `--color-bg-page-primary` |
| `surface` | `#fef8fb` | `rgba(26, 14, 21, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#f0eaee` | `#3a2e35` | `--color-bg-container-secondary` |
| `ink` | `#11060c` | `#efe4ea` | `--color-text-primary` |
| `display` | `#11060c` | `#efe4ea` | `--color-text-display` |
| `heading` | `#11060c` | `#efe4ea` | `--color-text-heading` |
| `logo` | `#d0117e` | `#d0117e` | `--color-brand-mark` |
| `logo-end` | `#770a48` | `#770a48` | `--color-brand-mark-end` |
| `text-secondary` | `#3a2e35` | `#bdb2b8` | `--color-text-secondary` |
| `text-tertiary` | `#73676e` | `#a599a0` | `--color-text-tertiary` |
| `border` | `#d6cad1` | `#2d2228` | `--color-bg-container-border` |
| `input` | `#fef8fb` | `#11060c` | `--color-input-bg-primary` |
| `error` | `#ac0e68` | `#d73390` | `--color-status-error-icon` |
| `success` | `#24a86b` | `#2ed98a` | `--color-status-positive-icon` |
| `warning` | `#c15c2e` | `#ff7a3d` | `--color-status-warning-icon` |
| `info` | `#6881ff` | `#859aff` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#ff9a4d`, cobalt `#5c7cff`, coral `#ff5a8a`, gold `#ffd34d`, mint `#3ddcb8`, violet `#c45cff`.

## Typography

Fredoka headings over Nunito text. Levels inside a tier share a weight and step by size. Every tier is set in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Fredoka | 96px | 400 | 1.05 | 0.025em |
| `display-md` | Fredoka | 64px | 400 | 1.1 | 0.02em |
| `sub-display` | Fredoka | 30px | 400 | 44px | 0.02em |
| `heading-1` | Fredoka | 30px | 600 | 44px | 0.02em |
| `heading-2` | Fredoka | 26px | 600 | 32px | 0.02em |
| `heading-3` | Fredoka | 22px | 600 | 28px | 0.02em |
| `title` | Nunito | 16px | 600 | 24px | -0.005em |
| `body-md` | Nunito | 16px | 400 | 24px | 0.005em |
| `body-emphasis` | Nunito | 16px | 500 | 24px | -0.005em |
| `body-sm` | Nunito | 14px | 400 | 20px | 0.005em |
| `caption` | Nunito | 12px | 400 | 16px | 0.005em |
| `overline` | Nunito | 14px | 600 | 20px | 0.085em |

## Shape

Pill buttons, 14px inputs and 29px cards. Radius belongs to the element type, never to one instance.

- `xs`: 2px (`--radius-050`)
- `sm`: 5px (`--radius-100`)
- `md`: 10px (`--radius-200`)
- `input`: 14px (`--radius-300`)
- `lg`: 19px (`--radius-400`)
- `card`: 29px (`--radius-600`)
- `xl`: 58px (`--radius-1200`)
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

- `fast`: 135ms
- `base`: 180ms
- `slow`: 270ms
