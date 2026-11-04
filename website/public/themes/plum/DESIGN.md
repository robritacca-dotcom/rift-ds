---
version: alpha
name: "Aubergine"
description: "The Aubergine theme of rift-ds: its colours, type, shape, space and depth, as the theme resolves them."

colors:
  primary: "#efa640"
  primary-hover: "#f0ac4c"
  primary-active: "#f1b055"
  on-primary: "#33240e"
  primary-dark: "#efa640"
  canvas-light: "#f2eeeb"
  canvas-dark: "#110d09"
  surface: "#ffffff"
  surface-dark: "rgba(25, 22, 18, 0.8)"
  surface-soft: "#f2eeeb"
  ink: "#130e0a"
  ink-dark: "#ece9e5"
  display: "#44261c"
  display-dark: "#f2e8dc"
  heading: "#130e0a"
  heading-dark: "#ece9e5"
  logo: "#5c3426"
  logo-dark: "#e0a878"
  logo-end: "#44261c"
  logo-end-dark: "#e0a878"
  text-secondary: "#3a3632"
  text-tertiary: "#726e6a"
  border: "#d3cfca"
  input: "#ffffff"
  error: "#b4313d"
  success: "#247b55"
  warning: "#b65c23"
  info: "#5c74d0"
  accent-amber: "#efa640"
  accent-cobalt: "#4f6bd8"
  accent-coral: "#e0605a"
  accent-gold: "#8cc0e8"
  accent-mint: "#3f78b5"
  accent-violet: "#7a4a32"
  chart-1: "#efa640"
  chart-2: "#3f78b5"
  chart-3: "#8cc0e8"
  chart-4: "#e0605a"
  chart-5: "#7a4a32"
  chart-6: "#efa640"

typography:
  display-lg:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 96px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.022em
  display-md:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.018em
  sub-display:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: -0.012em
  heading-1:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: 0.025em
  heading-2:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 26px
    fontWeight: 500
    lineHeight: 32px
    letterSpacing: 0.025em
  heading-3:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0.025em
  title:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-md:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.01em
  body-emphasis:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  body-sm:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.01em
  overline:
    fontFamily: "'Figtree', sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.09em

rounded:
  xs: 1px
  sm: 1px
  md: 2px
  input: 4px
  lg: 5px
  card: 7px
  xl: 14px
  pill: 4px

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

# Aubergine theme

Aubergine: Bricolage Grotesque headings over Figtree text, #efa640 for actions, buttons squared to 4px, 4px inputs and 7px cards. Flat: no shadows at all. Surfaces separate from the page by contrast alone.

Take it whole: `import 'rift-ds/tokens/presets/presets.css'` after the tokens, then set `data-brand="plum"` on `<html>`. See it at https://rift-ds.com/foundations/themes/plum.

## Colour

One action colour, kept for primary buttons, focus rings, the checked state of a control and the selected item of a set. Everything else is the neutral scale and five status roles. The logo has a colour of its own (`logo`), apart from the action colour. Its mark is a gradient within that one colour (`logo-end`).

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| `primary` | `#efa640` | `#efa640` | `--color-action-primary-bg` |
| `primary-hover` | `#f0ac4c` | `#f0ac4c` | `--color-action-primary-bg-hover` |
| `primary-active` | `#f1b055` | `#f1b055` | `--color-action-primary-bg-active` |
| `on-primary` | `#33240e` | `#33240e` | `--color-action-primary-text` |
| `canvas-light` | `#f2eeeb` | `#110d09` | `--color-bg-page-primary` |
| `surface` | `#ffffff` | `rgba(25, 22, 18, 0.8)` | `--color-bg-container-primary` |
| `surface-soft` | `#f2eeeb` | `#393531` | `--color-bg-container-secondary` |
| `ink` | `#130e0a` | `#ece9e5` | `--color-text-primary` |
| `display` | `#44261c` | `#f2e8dc` | `--color-text-display` |
| `heading` | `#130e0a` | `#ece9e5` | `--color-text-heading` |
| `logo` | `#5c3426` | `#e0a878` | `--color-brand-mark` |
| `logo-end` | `#44261c` | `#e0a878` | `--color-brand-mark-end` |
| `text-secondary` | `#3a3632` | `#bbb7b4` | `--color-text-secondary` |
| `text-tertiary` | `#726e6a` | `#a39f9b` | `--color-text-tertiary` |
| `border` | `#d3cfca` | `#2d2925` | `--color-bg-container-border` |
| `input` | `#ffffff` | `#110d09` | `--color-input-bg-primary` |
| `error` | `#b4313d` | `#de5764` | `--color-status-error-icon` |
| `success` | `#247b55` | `#2e9e6e` | `--color-status-positive-icon` |
| `warning` | `#b65c23` | `#f07a2e` | `--color-status-warning-icon` |
| `info` | `#5c74d0` | `#7c8fd9` | `--color-status-info-icon` |

Accents, for charts and the background field: amber `#efa640`, cobalt `#4f6bd8`, coral `#e0605a`, gold `#8cc0e8`, mint `#3f78b5`, violet `#7a4a32`.

## Typography

Bricolage Grotesque headings over Figtree text. Levels inside a tier share a weight and step by size. Display type `display` takes its own colour, while running text stays in the ink.

| Style | Face | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | Bricolage Grotesque | 96px | 500 | 1.05 | -0.022em |
| `display-md` | Bricolage Grotesque | 64px | 500 | 1.1 | -0.018em |
| `sub-display` | Bricolage Grotesque | 30px | 500 | 44px | -0.012em |
| `heading-1` | Bricolage Grotesque | 30px | 500 | 44px | 0.025em |
| `heading-2` | Bricolage Grotesque | 26px | 500 | 32px | 0.025em |
| `heading-3` | Bricolage Grotesque | 22px | 500 | 28px | 0.025em |
| `title` | Figtree | 16px | 500 | 24px | 0 |
| `body-md` | Figtree | 16px | 400 | 24px | 0.01em |
| `body-emphasis` | Figtree | 16px | 500 | 24px | 0 |
| `body-sm` | Figtree | 14px | 400 | 20px | 0.01em |
| `caption` | Figtree | 12px | 400 | 16px | 0.01em |
| `overline` | Figtree | 14px | 600 | 20px | 0.09em |

## Shape

Buttons squared to 4px, 4px inputs and 7px cards. Radius belongs to the element type, never to one instance.

- `xs`: 1px (`--radius-050`)
- `sm`: 1px (`--radius-100`)
- `md`: 2px (`--radius-200`)
- `input`: 4px (`--radius-300`)
- `lg`: 5px (`--radius-400`)
- `card`: 7px (`--radius-600`)
- `xl`: 14px (`--radius-1200`)
- `pill`: 4px (`--radius-pill`)

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

- `fast`: 150ms
- `base`: 200ms
- `slow`: 300ms
