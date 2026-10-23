---
version: alpha
name: Meadow-design-analysis
description: A fictional canvas tool whose story sections are oversized pastel colour blocks on a monochrome frame.

colors:
  primary: "#000000"
  on-primary: "#ffffff"
  ink: "#000000"
  canvas: "#ffffff"
  hairline: "#e6e6e6"
  surface-soft: "#f7f7f5"
  block-lime: "#dceeb1"
  block-lilac: "#c5b0f4"
  block-cream: "#f4ecd6"
  block-pink: "#efd4d4"
  block-mint: "#c8e6cd"
  block-coral: "#f3c9b6"
  accent-magenta: "#ff3d8b"

typography:
  display-xl:
    fontFamily: "Inter, sans-serif"
    fontSize: 86px
    fontWeight: 340
    lineHeight: 1.0
    letterSpacing: -1.72px
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: 18px
    fontWeight: 320
    lineHeight: 1.45
    letterSpacing: -0.26px

rounded:
  md: 8px
  lg: 24px
  pill: 50px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: 10px 20px
  text-input:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
  pricing-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
---

## Elevation & Depth

Don't add drop shadows to colour-block sections; the colour is the depth device.
