---
version: alpha
name: Foundry-design-analysis
description: A fictional developer brand with uppercase eyebrows, a monospace code face, an ink-outlined secondary button and a second action colour.

colors:
  primary: "#f54e00"
  secondary: "#0075ff"
  on-primary: "#ffffff"
  ink: "#26251e"
  canvas: "#f7f7f4"
  surface-card: "#ffffff"
  hairline: "#e6e5e0"
  hairline-strong: "#cfcdc4"

typography:
  display-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.72px
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption-uppercase:
    fontFamily: "Inter, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.88px
    textTransform: uppercase
  code:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  md: 8px
  lg: 12px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 16px
  md: 20px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: 40px
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-strong}"
    rounded: "{rounded.md}"
    height: 40px
  text-input:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
  feature-card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
---

## Elevation & Depth

The system uses hairline-only depth. No drop shadows.
