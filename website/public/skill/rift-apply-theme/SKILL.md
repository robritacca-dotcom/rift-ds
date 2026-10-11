---
name: rift-apply-theme
description: Restyle existing screens onto the rift-ds design tokens and components. Use when asked to apply a theme, adopt the design system in an existing app, move hand-written styles onto tokens, or make a screen match THEME.md.
---

# Applying a rift-ds theme

Generated from the library's registries at version 1.6.0. You take screens that already exist and move them onto the library's components and semantic tokens, so one theme styles all of them. Token names and values are in the `rift-design-system` skill's `references/tokens.md`; the component catalogue is the `rift-design-system` skill's `references/components.md`. Both files install beside this skill with `npx rift-ds init`. If they are missing, run that command, or read them at https://rift-ds.com/skill/rift-design-system/references/tokens.md and https://rift-ds.com/skill/rift-design-system/references/components.md.

## Before you change anything

1. Check the wiring. The package is installed and `rift-ds/tokens/tokens.css` is imported once at the root of the app. If either is missing, follow the Install section of the `rift-design-system` skill first.
2. Find the theme. If the project has a `THEME.md` (the playground at https://rift-ds.com/playground exports one beside a `theme.css`), read it: it describes the look in words, and where it disagrees with a default in this skill, it wins. If the root element carries a `data-brand` attribute, the project uses a shipped preset. With neither, the project is on the base theme.
3. Agree the scope with the user: one screen, one folder or the whole app. Work one screen at a time and keep each one working before you start the next.

## Order of work

1. Wire the theme. `theme.css`, when there is one, is imported after `tokens.css`. A shipped preset needs `rift-ds/tokens/presets/presets.css` imported once and `data-brand` on the root element set to one of: `contrast`, `coral`, `forest`, `gold`, `mono`, `pink`, `terminal`, `violet`, `warm`, `zest`. Dark mode is `data-theme="dark"` on the root element.
2. Swap components first. Where the screen hand-builds a control the library ships (a button, an input, a dialog, a table), replace it with the library component. Find it in the catalogue, then read its prop contract before you write the JSX: do not guess props. Once a component is in place, do not restyle it from outside to recover the old look. If it looks wrong, the theme is wrong, and the fix is a token.
3. Then move what is left onto tokens. Every remaining raw colour, radius, spacing value, shadow, font value and timing becomes a semantic token, chosen by the rules below.
4. Remove the duplicate dark styles. Each colour token already holds a light and a dark value, so a `prefers-color-scheme` branch or a second set of dark colours for a tokenised value is dead weight. Delete it.
5. Check the result in light and dark, then write the report.

## Choosing a token

Choose by role, never by the nearest value. A grey that is body text and the same grey used as a border are two different tokens, and they will part ways the first time the theme changes.

- Text: `--color-text-primary` for body and headings, `--color-text-secondary` and `--color-text-tertiary` for supporting text. Icons take `--color-icon-primary` or `--color-icon-secondary`.
- Page and surfaces: the page is `--color-bg-page-primary`. A card, panel or sheet on it is `--color-bg-container-primary`, stepping to `--color-bg-container-secondary` and `--color-bg-container-tertiary` for surfaces nested inside. A surface border is `--color-bg-container-border`.
- Form fields: the `--color-input-*` family (`--color-input-bg-primary`, `--color-input-border-primary`, `--color-input-text-placeholder` and the rest). Better still, use the library's `Input`.
- Status: success, warning, error, info and neutral states use the `--color-status-*` family, each with a bg, border, icon and text token (`--color-status-error-text`, `--color-status-positive-bg`). Never a hand-picked red or green.
- The action colour, `--color-action-primary-bg`, means "this is the main action or the current selection". Use it for a primary button, a focus ring, an active input border, a checked control and the selected item of a set. Never as decoration: an accent stripe or a coloured heading in the action colour teaches the user that it is not a signal.
- Shape: `--radius-*`. Shape belongs to the element type, not the instance: every button takes `--radius-pill` and every input takes `--radius-300`. Do not pick a radius per screen.
- Spacing: `--gap-*`, `--padding-*`. Take the step that matches the old value. If the old value falls between two steps, take the nearer one and say so in the report.
- Depth: the only shadows are `--shadow-floating` for floating surfaces and `--shadow-modal` for modals. Everything else separates from the page through the container colours, so remove other shadows instead of mapping them.
- Type: each text style is a bundle of tokens, `--font-<style>-family`, `-size`, `-weight`, `-line-height` and `-letter-spacing`. The styles are `caption`, `display-1`, `display-2`, `heading-1`, `heading-2`, `heading-3`, `mega-1`, `mega-2`, `overline`, `paragraph-emphasis`, `paragraph`, `paragraph-sm-emphasis`, `paragraph-sm`, `sub-display`, `title-body`. Apply a whole bundle. Do not mix one style's size with another's weight.
- Icons: set `--icon-size` on the icon to a step from `--icon-size-*`. Never set `font-size` on an icon.
- Motion: `--motion-*` for durations and easings in CSS. A timing that lives in a JavaScript timer comes from `rift-ds/tokens/motion`.

In Tailwind, point the theme at the tokens (a colour named for its role whose value is the token's `var()`), then use those names. An arbitrary value such as `bg-[#1a1a1a]` is a hardcoded value with extra steps. In CSS-in-JS and inline styles, write the same `var()` reference a stylesheet would.

## When nothing fits

- No token matches the role: keep the raw value, leave the code working, and list it in the report. Do not invent a token name, and do not borrow a token from another role because its value is close.
- The user wants the old colour kept: that is a theme decision, not a per-screen one. Override the primitive or the token once, in the project's theme file, so every screen follows.
- A screen needs a component the library does not ship: build it from tokens alone, and say so in the report.

## Report

End with a short report in plain language:

- The screens you changed.
- The components you swapped in, as old to new.
- The values you moved onto tokens, counted by category.
- Every value you left raw, with its file and line and the reason.
- Anything that now looks different and deserves a look from the user.

Then offer to run the `rift-style-audit` skill over the same scope to catch what is left.
