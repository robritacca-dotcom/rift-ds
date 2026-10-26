---
version: alpha
name: "Marquee"
description: "The Marquee theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#c9c340"
  primary-hover: "#ccc74c"
  primary-active: "#cfca55"
  on-primary: "#2b2a0e"
  primary-dark: "#c9c340"
  canvas-light: "#e6e9e9"
  canvas-dark: "#080c0d"
  surface: "#f4f6f6"
  surface-dark: "rgba(16, 20, 21, 0.8)"
  surface-soft: "#e6e9e9"
  ink: "#080c0d"
  ink-dark: "#dce0e1"
  display: "#625f1f"
  display-dark: "#c9c340"
  heading: "#080c0d"
  heading-dark: "#dce0e1"
  logo: "#080c0d"
  logo-dark: "#dce0e1"
  logo-end: "#080c0d"
  logo-end-dark: "#dce0e1"
  text-secondary: "#2e3333"
  text-tertiary: "#656a6a"
  border: "#c4c8c9"
  input: "#f4f6f6"
  error: "#c93a5c"
  success: "#05a67c"
  warning: "#c65e33"
  info: "#345ac4"
  accent-amber: "#d69a3e"
  accent-cobalt: "#4f7f8c"
  accent-coral: "#d2643e"
  accent-gold: "#c9c340"
  accent-mint: "#7fa58c"
  accent-violet: "#8e7fa6"
  chart-1: "#c9c340"
  chart-2: "#7fa58c"
  chart-3: "#c9c340"
  chart-4: "#d2643e"
  chart-5: "#8e7fa6"
  chart-6: "#d69a3e"

typography:
  display-lg:
    fontFamily: "'Anton', sans-serif"
    fontSize: 101px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0.02em
  display-md:
    fontFamily: "'Anton', sans-serif"
    fontSize: 67px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0.015em
  sub-display:
    fontFamily: "'Anton', sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 46px
    letterSpacing: 0.015em
  heading-1:
    fontFamily: "'Anton', sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 46px
    letterSpacing: 0.015em
  heading-2:
    fontFamily: "'Anton', sans-serif"
    fontSize: 27px
    fontWeight: 400
    lineHeight: 34px
    letterSpacing: 0.015em
  heading-3:
    fontFamily: "'Anton', sans-serif"
    fontSize: 23px
    fontWeight: 400
    lineHeight: 29px
    letterSpacing: 0.015em
  title:
    fontFamily: "'Work Sans', sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 25px
    letterSpacing: -0.01em
  body-md:
    fontFamily: "'Work Sans', sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 25px
    letterSpacing: 0
  body-emphasis:
    fontFamily: "'Work Sans', sans-serif"
    fontSize: 17px
    fontWeight: 500
    lineHeight: 25px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "'Work Sans', sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0
  caption:
    fontFamily: "'Work Sans', sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 17px
    letterSpacing: 0
  overline:
    fontFamily: "'Work Sans', sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 21px
    letterSpacing: 0.08em

rounded:
  xs: 0px
  sm: 1px
  md: 2px
  input: 2px
  lg: 3px
  card: 5px
  xl: 10px
  pill: 2px

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
    height: 41px
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

# Marquee theme

Marquee: Anton headings over Work Sans text, #c9c340 for actions, buttons squared to 2px, 2px inputs and 5px cards. Flat: no shadows at all. Surfaces separate from the page by contrast alone.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="marquee"` on `<html>`. See it at https://rift-ds.com/foundations/themes/marquee.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo has a colour of its own (`logo`), apart from the action colour. Its mark is a gradient within that one colour (`logo-end`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#c9c340` | `#c9c340` | `--color-action-primary-bg` |
| `primary-hover` | `#ccc74c` | `#ccc74c` | `--color-action-primary-bg-hover` |
| `primary-active` | `#cfca55` | `#cfca55` | `--color-action-primary-bg-active` |
| `on-primary` | `#2b2a0e` | `#2b2a0e` | `--color-action-primary-text` |
| `canvas-light` | `#e6e9e9` | `#080c0d` | `--color-bg-page-primary` |
| `surface` | `#f4f6f6` | `rgba(16, 20, 21, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#e6e9e9` | `#2e3333` | `--color-bg-container-secondary` |
| `ink` | `#080c0d` | `#dce0e1` | `--color-text-primary` |
| `display` | `#625f1f` | `#c9c340` | `--color-text-display` |
| `heading` | `#080c0d` | `#dce0e1` | `--color-text-heading` |
| `logo` | `#080c0d` | `#dce0e1` | `--color-brand-mark` |
| `logo-end` | `#080c0d` | `#dce0e1` | `--color-brand-mark-end` |
| `text-secondary` | `#2e3333` | `#acb1b1` | `--color-text-secondary` |
| `text-tertiary` | `#656a6a` | `#95999a` | `--color-text-tertiary` |
| `border` | `#c4c8c9` | `#232728` | `--color-bg-container-border` |
| `input` | `#f4f6f6` | `#080c0d` | `--color-input-bg-primary` |
| `error` | `#c93a5c` | `#f16385` | `--color-status-error-icon` |
| `success` | `#05a67c` | `#06d6a0` | `--color-status-positive-icon` |
| `warning` | `#c65e33` | `#ef8247` | `--color-status-warning-icon` |
| `info` | `#345ac4` | `#5475d4` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#d69a3e`, cobalt `#4f7f8c`, coral `#d2643e`, gold `#c9c340`, mint `#7fa58c`, violet `#8e7fa6`.

## Typography

Anton headings over Work Sans text. Levels inside a tier share a weight and step by size. Display type `display` takes its own colour, while running text stays in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Anton | 101px | 400 | 1.05 | 0.02em |
| `display-md` | Anton | 67px | 400 | 1.1 | 0.015em |
| `sub-display` | Anton | 32px | 400 | 46px | 0.015em |
| `heading-1` | Anton | 32px | 400 | 46px | 0.015em |
| `heading-2` | Anton | 27px | 400 | 34px | 0.015em |
| `heading-3` | Anton | 23px | 400 | 29px | 0.015em |
| `title` | Work Sans | 17px | 400 | 25px | -0.01em |
| `body-md` | Work Sans | 17px | 400 | 25px | 0 |
| `body-emphasis` | Work Sans | 17px | 500 | 25px | -0.01em |
| `body-sm` | Work Sans | 15px | 400 | 21px | 0 |
| `caption` | Work Sans | 13px | 400 | 17px | 0 |
| `overline` | Work Sans | 15px | 600 | 21px | 0.08em |

## Shape

Buttons squared to 2px, 2px inputs and 5px cards. Radius belongs to the element type, never to one instance.

- `xs`: 0px (`--radius-050`)
- `sm`: 1px (`--radius-100`)
- `md`: 2px (`--radius-200`)
- `input`: 2px (`--radius-300`)
- `lg`: 3px (`--radius-400`)
- `card`: 5px (`--radius-600`)
- `xl`: 10px (`--radius-1200`)
- `pill`: 2px (`--radius-pill`)

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

- `fast`: 135ms
- `base`: 180ms
- `slow`: 270ms
