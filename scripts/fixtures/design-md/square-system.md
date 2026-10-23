---
version: alpha
name: Tideway-design-analysis
description: A fictional automotive site where every corner is square.

colors:
  primary: "#1c69d4"
  primary-active: "#0653b6"
  ink: "#262626"
  canvas: "#ffffff"
  surface-card: "#fafafa"
  hairline: "#e6e6e6"
  on-primary: "#ffffff"

typography:
  display-xl:
    fontFamily: "Inter, sans-serif"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 300
    lineHeight: 1.55
    letterSpacing: 0

rounded:
  none: 0px

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
    rounded: "{rounded.none}"
    height: 48px
  text-input:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.none}"
  model-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.none}"
---

## Elevation & Depth

The system never uses a drop shadow. Depth comes from colour-block contrast.
