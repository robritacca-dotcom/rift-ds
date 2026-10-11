# rift-ds token reference

Generated from the token registry and the token stylesheets at version 1.6.0. One row per semantic token, grouped by category, with the value it resolves to in the base theme. A name in brackets is the primitive the token points at.

How to read it:

- These are the base theme's values. A project that overrides tokens (a `theme.css` from the playground, a `data-brand` preset, its own overrides) changes what a token resolves to. The token names stay the same, so match on the role first and treat these values as the default.
- The colour and shadow categories differ between light and dark, so they list both. Every other category holds one value in both themes.
- A column headed "At" gives the value inside that media condition, where it differs.
- Use the semantic token in your code, never the primitive. Override a primitive to re-theme.

The live reference with swatches is at https://rift-ds.com/foundations, and the MCP endpoint's `list_tokens` tool serves the names.

## Colour (116)

Prefix: `--color-*`.

| Token | Light | Dark |
| --- | --- | --- |
| `--color-action-icon-active` | `#F1F1F1` (`--primitive-neutral-01`) | `#052F3E` (`--primitive-teal-10`) |
| `--color-action-icon-default` | `#050505` (`--primitive-neutral-10`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-action-neutral-bg` | `#D6D6D6` (`--primitive-neutral-02`) | `#232323` (`--primitive-neutral-08`) |
| `--color-action-neutral-bg-active` | `#A2A2A2` (`--primitive-neutral-04`) | `#6D6D6D` (`--primitive-neutral-06`) |
| `--color-action-neutral-bg-hover` | `#BCBCBC` (`--primitive-neutral-03`) | `#303030` (`--primitive-neutral-07`) |
| `--color-action-neutral-text` | `#050505` (`--primitive-neutral-10`) | `#FFFFFF` (`--primitive-neutral-00`) |
| `--color-action-passive-bg` | `rgba(241, 241, 241, 0.01)` (`--primitive-neutral-01-a01`) | `rgba(14, 14, 14, 0.01)` (`--primitive-neutral-09-a01`) |
| `--color-action-passive-bg-active` | `rgba(188, 188, 188, 0.8)` (`--primitive-neutral-03-a80`) | `rgba(48, 48, 48, 0.8)` (`--primitive-neutral-07-a80`) |
| `--color-action-passive-bg-hover` | `rgba(214, 214, 214, 0.8)` (`--primitive-neutral-02-a80`) | `rgba(35, 35, 35, 0.8)` (`--primitive-neutral-08-a80`) |
| `--color-action-passive-text` | `#050505` (`--primitive-neutral-10`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-action-primary-bg` | `#0E6E8F` (`--primitive-teal-08`) | `#3CA5C6` (`--primitive-teal-05`) |
| `--color-action-primary-bg-active` | `#052F3E` (`--primitive-teal-10`) | `#9ED4E5` (`--primitive-teal-03`) |
| `--color-action-primary-bg-hover` | `#0A4E66` (`--primitive-teal-09`) | `#6DBCD6` (`--primitive-teal-04`) |
| `--color-action-primary-border` | `#052F3E` (`--primitive-teal-10`) | `#3CA5C6` (`--primitive-teal-05`) |
| `--color-action-primary-border-secondary` | `#0E6E8F` (`--primitive-teal-08`) | `#2C9AB9` (`--primitive-teal-06`) |
| `--color-action-primary-border-tertiary` | `#0E6E8F` (`--primitive-teal-08`) | `#6DBCD6` (`--primitive-teal-04`) |
| `--color-action-primary-text` | `#CFEAF3` (`--primitive-teal-02`) | `#052F3E` (`--primitive-teal-10`) |
| `--color-action-primary-text-active` | `#F1F1F1` (`--primitive-neutral-01`) | `#052F3E` (`--primitive-teal-10`) |
| `--color-action-primary-text-secondary` | `#052F3E` (`--primitive-teal-10`) | `#052F3E` (`--primitive-teal-10`) |
| `--color-action-primary-text-tertiary` | `#0A4E66` (`--primitive-teal-09`) | `#6DBCD6` (`--primitive-teal-04`) |
| `--color-ai-button-bg` | `#FFFFFF` (`--primitive-neutral-00`) | `#000000` (`--primitive-true-black`) |
| `--color-ai-gradient-end` | `#118AB2` (`--primitive-teal-07`) | `#118AB2` (`--primitive-teal-07`) |
| `--color-ai-gradient-mid` | `#5475D4` (`--primitive-blue-05`) | `#5475D4` (`--primitive-blue-05`) |
| `--color-ai-gradient-start` | `#F37F9B` (`--primitive-red-05`) | `#F37F9B` (`--primitive-red-05`) |
| `--color-bg-container-border` | `#D6D6D6` (`--primitive-neutral-02`) | `#232323` (`--primitive-neutral-08`) |
| `--color-bg-container-inverse` | `#0E0E0E` (`--primitive-neutral-09`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-bg-container-primary` | `#FFFFFF` (`--primitive-neutral-00`) | `rgba(14, 14, 14, 0.8)` (`--primitive-neutral-09-a80`) |
| `--color-bg-container-primary-semi` | `rgba(255, 255, 255, 0.9)` (`--primitive-neutral-00-a90`) | `rgba(14, 14, 14, 0.6)` (`--primitive-neutral-09-a60`) |
| `--color-bg-container-primary-transparent` | `rgba(255, 255, 255, 0.01)` (`--primitive-neutral-00-a01`) | `rgba(14, 14, 14, 0.01)` (`--primitive-neutral-09-a01`) |
| `--color-bg-container-secondary` | `#F1F1F1` (`--primitive-neutral-01`) | `#303030` (`--primitive-neutral-07`) |
| `--color-bg-container-tertiary` | `#D6D6D6` (`--primitive-neutral-02`) | `#232323` (`--primitive-neutral-08`) |
| `--color-bg-glass` | `rgba(255, 255, 255, 0.9)` (`--primitive-neutral-00-a90`) | `rgba(14, 14, 14, 0.66)` (`--primitive-neutral-09-a66`) |
| `--color-bg-page-inverse` | `#050505` (`--primitive-neutral-10`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-bg-page-primary` | `#F1F1F1` (`--primitive-neutral-01`) | `#050505` (`--primitive-neutral-10`) |
| `--color-calendar-cell-bg` | `#F1F1F1` (`--primitive-neutral-01`) | `rgba(35, 35, 35, 0.8)` (`--primitive-neutral-08-a80`) |
| `--color-calendar-cell-bg-hover` | `rgba(214, 214, 214, 0.8)` (`--primitive-neutral-02-a80`) | `rgba(48, 48, 48, 0.8)` (`--primitive-neutral-07-a80`) |
| `--color-calendar-event-bg` | `#FFFFFF` (`--primitive-neutral-00`) | `rgba(14, 14, 14, 0.8)` (`--primitive-neutral-09-a80`) |
| `--color-calendar-event-bg-hover` | `#F1F1F1` (`--primitive-neutral-01`) | `rgba(35, 35, 35, 0.8)` (`--primitive-neutral-08-a80`) |
| `--color-calendar-event-border` | `#A2A2A2` (`--primitive-neutral-04`) | `#6D6D6D` (`--primitive-neutral-06`) |
| `--color-chart-contribution-0` | `#FFFFFF` (`--primitive-neutral-00`) | `#232323` (`--primitive-neutral-08`) |
| `--color-chart-contribution-1` | `#CEF6E8` (`--primitive-green-02`) | `#024336` (`--primitive-green-10`) |
| `--color-chart-contribution-2` | `#6DE0C0` (`--primitive-green-04`) | `#03765A` (`--primitive-green-09`) |
| `--color-chart-contribution-3` | `#06D6A0` (`--primitive-green-07`) | `#05A67C` (`--primitive-green-08`) |
| `--color-chart-contribution-4` | `#03765A` (`--primitive-green-09`) | `#06D6A0` (`--primitive-green-07`) |
| `--color-chart-series-1` | `#0E6E8F` (`--primitive-teal-08`) | `#3CA5C6` (`--primitive-teal-05`) |
| `--color-chart-series-2` | `#06D6A0` (`--primitive-green-07`) | `#06D6A0` (`--primitive-green-07`) |
| `--color-chart-series-3` | `#FFD166` (`--primitive-yellow-07`) | `#FFD166` (`--primitive-yellow-07`) |
| `--color-chart-series-4` | `#EF476F` (`--primitive-red-07`) | `#EF476F` (`--primitive-red-07`) |
| `--color-chart-series-5` | `#9E47EF` (`--primitive-purple-07`) | `#9E47EF` (`--primitive-purple-07`) |
| `--color-chart-series-6` | `#EF8247` (`--primitive-orange-07`) | `#EF8247` (`--primitive-orange-07`) |
| `--color-chart-series-7` | `#1E47B0` (`--primitive-blue-07`) | `#1E47B0` (`--primitive-blue-07`) |
| `--color-chat-bubble-received-bg` | `#F1F1F1` (`--primitive-neutral-01`) | `#303030` (`--primitive-neutral-07`) |
| `--color-chat-bubble-received-text` | `#050505` (`--primitive-neutral-10`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-chat-bubble-sent-bg` | `#F1F1F1` (`--primitive-neutral-01`) | `#303030` (`--primitive-neutral-07`) |
| `--color-chat-bubble-sent-text` | `#050505` (`--primitive-neutral-10`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-chat-context-bg` | `#F1F1F1` (`--primitive-neutral-01`) | `#0E0E0E` (`--primitive-neutral-09`) |
| `--color-control-thumb` | `#CFEAF3` (`--primitive-teal-02`) | `#052F3E` (`--primitive-teal-10`) |
| `--color-core-accent-amber` | `#EF8247` (`--primitive-orange-07`) | `#EF8247` (`--primitive-orange-07`) |
| `--color-core-accent-cobalt` | `#1E47B0` (`--primitive-blue-07`) | `#1E47B0` (`--primitive-blue-07`) |
| `--color-core-accent-coral` | `#EF476F` (`--primitive-red-07`) | `#EF476F` (`--primitive-red-07`) |
| `--color-core-accent-gold` | `#FFD166` (`--primitive-yellow-07`) | `#FFD166` (`--primitive-yellow-07`) |
| `--color-core-accent-mint` | `#06D6A0` (`--primitive-green-07`) | `#06D6A0` (`--primitive-green-07`) |
| `--color-core-accent-violet` | `#9E47EF` (`--primitive-purple-07`) | `#9E47EF` (`--primitive-purple-07`) |
| `--color-core-ui-primary` | `#0E6E8F` (`--primitive-teal-08`) | `#3CA5C6` (`--primitive-teal-05`) |
| `--color-core-ui-secondary` | `#052F3E` (`--primitive-teal-10`) | `#0A4E66` (`--primitive-teal-09`) |
| `--color-divider` | `rgba(214, 214, 214, 0.8)` (`--primitive-neutral-02-a80`) | `rgba(35, 35, 35, 0.8)` (`--primitive-neutral-08-a80`) |
| `--color-file-document` | `#2684FC` (`--primitive-file-document`) | `#2684FC` (`--primitive-file-document`) |
| `--color-file-pdf` | `#FF2116` (`--primitive-file-pdf`) | `#FF2116` (`--primitive-file-pdf`) |
| `--color-file-presentation` | `#FFBA00` (`--primitive-file-presentation`) | `#FFBA00` (`--primitive-file-presentation`) |
| `--color-file-spreadsheet` | `#00AC47` (`--primitive-file-spreadsheet`) | `#00AC47` (`--primitive-file-spreadsheet`) |
| `--color-icon-primary` | `#6D6D6D` (`--primitive-neutral-06`) | `#D6D6D6` (`--primitive-neutral-02`) |
| `--color-icon-secondary` | `#A2A2A2` (`--primitive-neutral-04`) | `#A2A2A2` (`--primitive-neutral-04`) |
| `--color-input-bg-disabled` | `#D6D6D6` (`--primitive-neutral-02`) | `#0E0E0E` (`--primitive-neutral-09`) |
| `--color-input-bg-primary` | `#FFFFFF` (`--primitive-neutral-00`) | `#050505` (`--primitive-neutral-10`) |
| `--color-input-border-disabled` | `#BCBCBC` (`--primitive-neutral-03`) | `#232323` (`--primitive-neutral-08`) |
| `--color-input-border-hover` | `#2C9AB9` (`--primitive-teal-06`) | `#118AB2` (`--primitive-teal-07`) |
| `--color-input-border-primary` | `#D6D6D6` (`--primitive-neutral-02`) | `#232323` (`--primitive-neutral-08`) |
| `--color-input-border-selected` | `#0E6E8F` (`--primitive-teal-08`) | `#2C9AB9` (`--primitive-teal-06`) |
| `--color-input-text-disabled` | `#A2A2A2` (`--primitive-neutral-04`) | `#303030` (`--primitive-neutral-07`) |
| `--color-input-text-inverse` | `#A2A2A2` (`--primitive-neutral-04`) | `#303030` (`--primitive-neutral-07`) |
| `--color-input-text-placeholder` | `#6D6D6D` (`--primitive-neutral-06`) | `#A2A2A2` (`--primitive-neutral-04`) |
| `--color-input-text-primary` | `#050505` (`--primitive-neutral-10`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-pixel-ink-1` | `#C93A5C` (`--primitive-red-08`) | `#F37F9B` (`--primitive-red-05`) |
| `--color-pixel-ink-2` | `#C65E33` (`--primitive-orange-08`) | `#F09263` (`--primitive-orange-05`) |
| `--color-pixel-ink-3` | `#8A6B2A` (`--primitive-yellow-09`) | `#FFD677` (`--primitive-yellow-05`) |
| `--color-pixel-ink-4` | `#03765A` (`--primitive-green-09`) | `#5ADDB6` (`--primitive-green-05`) |
| `--color-pixel-ink-5` | `#1E47B0` (`--primitive-blue-07`) | `#7F99E3` (`--primitive-blue-04`) |
| `--color-pixel-ink-6` | `#7434B3` (`--primitive-purple-08`) | `#A86AE8` (`--primitive-purple-05`) |
| `--color-scrim` | `rgba(0, 0, 0, 0.5)` (`--primitive-true-black-semi`) | `rgba(0, 0, 0, 0.7)` (`--primitive-true-black-strong`) |
| `--color-status-error-bg` | `#FDEFF3` (`--primitive-red-01`) | `#571727` (`--primitive-red-10`) |
| `--color-status-error-border` | `#EF476F` (`--primitive-red-07`) | `#EF476F` (`--primitive-red-07`) |
| `--color-status-error-icon` | `#C93A5C` (`--primitive-red-08`) | `#F16385` (`--primitive-red-06`) |
| `--color-status-error-text` | `#571727` (`--primitive-red-10`) | `#FDEFF3` (`--primitive-red-01`) |
| `--color-status-info-bg` | `#EEF3FD` (`--primitive-blue-01`) | `#081633` (`--primitive-blue-10`) |
| `--color-status-info-border` | `#1E47B0` (`--primitive-blue-07`) | `#1E47B0` (`--primitive-blue-07`) |
| `--color-status-info-icon` | `#345AC4` (`--primitive-blue-06`) | `#5475D4` (`--primitive-blue-05`) |
| `--color-status-info-text` | `#081633` (`--primitive-blue-10`) | `#EEF3FD` (`--primitive-blue-01`) |
| `--color-status-neutral-bg` | `#D6D6D6` (`--primitive-neutral-02`) | `#232323` (`--primitive-neutral-08`) |
| `--color-status-neutral-border` | `#303030` (`--primitive-neutral-07`) | `#6D6D6D` (`--primitive-neutral-06`) |
| `--color-status-neutral-icon` | `#6D6D6D` (`--primitive-neutral-06`) | `#A2A2A2` (`--primitive-neutral-04`) |
| `--color-status-neutral-text` | `#232323` (`--primitive-neutral-08`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-status-positive-bg` | `#ECFCF7` (`--primitive-green-01`) | `#024336` (`--primitive-green-10`) |
| `--color-status-positive-border` | `#06D6A0` (`--primitive-green-07`) | `#06D6A0` (`--primitive-green-07`) |
| `--color-status-positive-icon` | `#05A67C` (`--primitive-green-08`) | `#06D6A0` (`--primitive-green-07`) |
| `--color-status-positive-text` | `#024336` (`--primitive-green-10`) | `#ECFCF7` (`--primitive-green-01`) |
| `--color-status-warning-bg` | `#FFF3EC` (`--primitive-orange-01`) | `#552716` (`--primitive-orange-10`) |
| `--color-status-warning-border` | `#EF8247` (`--primitive-orange-07`) | `#EF8247` (`--primitive-orange-07`) |
| `--color-status-warning-icon` | `#C65E33` (`--primitive-orange-08`) | `#EF8247` (`--primitive-orange-07`) |
| `--color-status-warning-text` | `#552716` (`--primitive-orange-10`) | `#FFF3EC` (`--primitive-orange-01`) |
| `--color-text-inverse` | `#A2A2A2` (`--primitive-neutral-04`) | `#303030` (`--primitive-neutral-07`) |
| `--color-text-on-inverse` | `#F1F1F1` (`--primitive-neutral-01`) | `#0E0E0E` (`--primitive-neutral-09`) |
| `--color-text-primary` | `#050505` (`--primitive-neutral-10`) | `#F1F1F1` (`--primitive-neutral-01`) |
| `--color-text-secondary` | `#303030` (`--primitive-neutral-07`) | `#BCBCBC` (`--primitive-neutral-03`) |
| `--color-text-tertiary` | `#6D6D6D` (`--primitive-neutral-06`) | `#A2A2A2` (`--primitive-neutral-04`) |
| `--color-trend-down` | `#571727` (`--primitive-red-10`) | `#EF476F` (`--primitive-red-07`) |
| `--color-trend-up` | `#024336` (`--primitive-green-10`) | `#06D6A0` (`--primitive-green-07`) |

## Typography (100)

Prefix: `--font-*`.

| Token | Value | At max-width: 768px |
| --- | --- | --- |
| `--font-caption-family` | `'Nunito Sans', sans-serif` |  |
| `--font-caption-letter-spacing` | `0` |  |
| `--font-caption-line-height` | `16px` |  |
| `--font-caption-size` | `12px` |  |
| `--font-caption-weight` | `400` |  |
| `--font-display-1-family` | `'Nunito Sans', sans-serif` |  |
| `--font-display-1-letter-spacing` | `0.02em` |  |
| `--font-display-1-line-height` | `1.05` |  |
| `--font-display-1-size` | `96px` | `48px` |
| `--font-display-1-weight` | `300` |  |
| `--font-display-2-family` | `'Nunito Sans', sans-serif` |  |
| `--font-display-2-letter-spacing` | `0.015em` |  |
| `--font-display-2-line-height` | `1.1` | `1.15` |
| `--font-display-2-size` | `64px` | `40px` |
| `--font-display-2-weight` | `300` |  |
| `--font-family-body` | `'Nunito Sans', sans-serif` |  |
| `--font-family-code` | `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace` |  |
| `--font-family-heading` | `'Nunito Sans', sans-serif` |  |
| `--font-family-primary` | `'Nunito Sans', sans-serif` |  |
| `--font-heading-1-family` | `'Nunito Sans', sans-serif` |  |
| `--font-heading-1-letter-spacing` | `0.015em` |  |
| `--font-heading-1-line-height` | `44px` |  |
| `--font-heading-1-size` | `30px` |  |
| `--font-heading-1-weight` | `600` |  |
| `--font-heading-2-family` | `'Nunito Sans', sans-serif` |  |
| `--font-heading-2-letter-spacing` | `0.015em` |  |
| `--font-heading-2-line-height` | `32px` |  |
| `--font-heading-2-size` | `26px` |  |
| `--font-heading-2-weight` | `600` |  |
| `--font-heading-3-family` | `'Nunito Sans', sans-serif` |  |
| `--font-heading-3-letter-spacing` | `0.015em` |  |
| `--font-heading-3-line-height` | `28px` |  |
| `--font-heading-3-size` | `22px` |  |
| `--font-heading-3-weight` | `600` |  |
| `--font-line-height-1100` | `44px` |  |
| `--font-line-height-400` | `16px` |  |
| `--font-line-height-500` | `20px` |  |
| `--font-line-height-600` | `24px` |  |
| `--font-line-height-700` | `28px` |  |
| `--font-line-height-800` | `32px` |  |
| `--font-line-height-900` | `36px` |  |
| `--font-mega-1-family` | `'Nunito Sans', sans-serif` |  |
| `--font-mega-1-letter-spacing` | `0.02em` |  |
| `--font-mega-1-line-height` | `0.92` |  |
| `--font-mega-1-size` | `132px` | `64px` |
| `--font-mega-1-weight` | `300` |  |
| `--font-mega-2-family` | `'Nunito Sans', sans-serif` |  |
| `--font-mega-2-letter-spacing` | `0.02em` |  |
| `--font-mega-2-line-height` | `0.92` |  |
| `--font-mega-2-size` | `116px` | `56px` |
| `--font-mega-2-weight` | `300` |  |
| `--font-overline-family` | `'Nunito Sans', sans-serif` |  |
| `--font-overline-letter-spacing` | `0.08em` |  |
| `--font-overline-line-height` | `20px` |  |
| `--font-overline-size` | `14px` |  |
| `--font-overline-weight` | `600` |  |
| `--font-paragraph-emphasis-family` | `'Nunito Sans', sans-serif` |  |
| `--font-paragraph-emphasis-letter-spacing` | `-0.01em` |  |
| `--font-paragraph-emphasis-line-height` | `24px` |  |
| `--font-paragraph-emphasis-size` | `16px` |  |
| `--font-paragraph-emphasis-weight` | `500` |  |
| `--font-paragraph-family` | `'Nunito Sans', sans-serif` |  |
| `--font-paragraph-letter-spacing` | `0` |  |
| `--font-paragraph-line-height` | `24px` |  |
| `--font-paragraph-size` | `16px` |  |
| `--font-paragraph-sm-emphasis-family` | `'Nunito Sans', sans-serif` |  |
| `--font-paragraph-sm-emphasis-letter-spacing` | `0` |  |
| `--font-paragraph-sm-emphasis-line-height` | `20px` |  |
| `--font-paragraph-sm-emphasis-size` | `14px` |  |
| `--font-paragraph-sm-emphasis-weight` | `500` |  |
| `--font-paragraph-sm-family` | `'Nunito Sans', sans-serif` |  |
| `--font-paragraph-sm-letter-spacing` | `0` |  |
| `--font-paragraph-sm-line-height` | `20px` |  |
| `--font-paragraph-sm-size` | `14px` |  |
| `--font-paragraph-sm-weight` | `400` |  |
| `--font-paragraph-weight` | `400` |  |
| `--font-size-1000` | `40px` |  |
| `--font-size-1200` | `48px` |  |
| `--font-size-1400` | `56px` |  |
| `--font-size-1600` | `64px` |  |
| `--font-size-2400` | `96px` |  |
| `--font-size-2900` | `116px` |  |
| `--font-size-300` | `12px` |  |
| `--font-size-3300` | `132px` |  |
| `--font-size-350` | `14px` |  |
| `--font-size-400` | `16px` |  |
| `--font-size-550` | `22px` |  |
| `--font-size-600` | `24px` |  |
| `--font-size-650` | `26px` |  |
| `--font-size-750` | `30px` |  |
| `--font-sub-display-family` | `'Nunito Sans', sans-serif` |  |
| `--font-sub-display-letter-spacing` | `0.015em` |  |
| `--font-sub-display-line-height` | `44px` | `36px` |
| `--font-sub-display-size` | `30px` | `24px` |
| `--font-sub-display-weight` | `300` |  |
| `--font-title-body-family` | `'Nunito Sans', sans-serif` |  |
| `--font-title-body-letter-spacing` | `-0.01em` |  |
| `--font-title-body-line-height` | `24px` |  |
| `--font-title-body-size` | `16px` |  |
| `--font-title-body-weight` | `600` |  |

## Spacing (19)

Prefix: `--gap-*`, `--padding-*`.

| Token | Value | At max-width: 768px |
| --- | --- | --- |
| `--gap-050` | `2px` (`--primitive-gap-050`) |  |
| `--gap-100` | `4px` (`--primitive-gap-100`) |  |
| `--gap-1000` | `40px` (`--primitive-gap-1000`) |  |
| `--gap-1500` | `60px` (`--primitive-gap-1500`) | `40px` (`--primitive-gap-1000`) |
| `--gap-200` | `8px` (`--primitive-gap-200`) |  |
| `--gap-2000` | `80px` (`--primitive-gap-2000`) | `60px` (`--primitive-gap-1500`) |
| `--gap-300` | `12px` (`--primitive-gap-300`) |  |
| `--gap-3000` | `120px` (`--primitive-gap-3000`) | `80px` (`--primitive-gap-2000`) |
| `--gap-400` | `16px` (`--primitive-gap-400`) |  |
| `--gap-500` | `20px` (`--primitive-gap-500`) |  |
| `--padding-050` | `2px` (`--primitive-padding-050`) |  |
| `--padding-100` | `4px` (`--primitive-padding-100`) |  |
| `--padding-1000` | `40px` (`--primitive-padding-1000`) |  |
| `--padding-150` | `6px` (`--primitive-padding-150`) |  |
| `--padding-1500` | `60px` (`--primitive-padding-1500`) | `40px` (`--primitive-padding-1000`) |
| `--padding-200` | `8px` (`--primitive-padding-200`) |  |
| `--padding-300` | `12px` (`--primitive-padding-300`) |  |
| `--padding-400` | `16px` (`--primitive-padding-400`) |  |
| `--padding-500` | `20px` (`--primitive-padding-500`) |  |

## Radius (8)

Prefix: `--radius-*`.

| Token | Value |
| --- | --- |
| `--radius-050` | `2px` (`--primitive-radius-050`) |
| `--radius-100` | `4px` (`--primitive-radius-100`) |
| `--radius-1200` | `48px` (`--primitive-radius-1200`) |
| `--radius-200` | `8px` (`--primitive-radius-200`) |
| `--radius-300` | `12px` (`--primitive-radius-300`) |
| `--radius-400` | `16px` (`--primitive-radius-400`) |
| `--radius-600` | `24px` (`--primitive-radius-600`) |
| `--radius-pill` | `999px` (`--primitive-radius-pill`) |

## Border (2)

Prefix: `--border-*`.

| Token | Value |
| --- | --- |
| `--border-025` | `1px` (`--primitive-border-025`) |
| `--border-050` | `2px` (`--primitive-border-050`) |

## Shadow (2)

Prefix: `--shadow-*`.

| Token | Light | Dark |
| --- | --- | --- |
| `--shadow-floating` | `0 4px 16px rgba(0, 0, 0, 0.12)` | `0 4px 16px rgba(0, 0, 0, 0.55)` |
| `--shadow-modal` | `0 8px 32px rgba(0, 0, 0, 0.2)` | `0 8px 32px rgba(0, 0, 0, 0.6)` |

## Icons (4)

Prefix: `--icon-size-*`.

| Token | Value |
| --- | --- |
| `--icon-size-1200` | `48px` (`--primitive-icon-1200`) |
| `--icon-size-500` | `20px` (`--primitive-icon-500`) |
| `--icon-size-600` | `24px` (`--primitive-icon-600`) |
| `--icon-size-800` | `32px` (`--primitive-icon-800`) |

## Motion (15)

Prefix: `--motion-*`.

| Token | Value | At prefers-reduced-motion: reduce |
| --- | --- | --- |
| `--motion-duration-base` | `200ms` | `0.01ms` |
| `--motion-duration-deliberate` | `400ms` | `0.01ms` |
| `--motion-duration-fast` | `150ms` | `0.01ms` |
| `--motion-duration-instant` | `75ms` | `0.01ms` |
| `--motion-duration-loop-matrix` | `1400ms` | `0.01ms` |
| `--motion-duration-loop-shimmer` | `1800ms` | `0.01ms` |
| `--motion-duration-loop-spin` | `1000ms` | `0.01ms` |
| `--motion-duration-orbit` | `120000ms` | `0.01ms` |
| `--motion-duration-slow` | `300ms` | `0.01ms` |
| `--motion-duration-slower` | `600ms` | `0.01ms` |
| `--motion-ease-emphasized` | `cubic-bezier(0.4, 0, 0.2, 1)` |  |
| `--motion-ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` |  |
| `--motion-ease-linear` | `linear` |  |
| `--motion-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |  |
| `--motion-ease-standard` | `ease` |  |
