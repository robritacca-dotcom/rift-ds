---
version: alpha
name: Wren-design-analysis
description: A fictional marketplace that keeps one faint shadow for what floats.

colors:
  primary: "#ff385c"
  primary-active: "#e00b41"
  ink: "#222222"
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  hairline: "#dddddd"
  on-primary: "#ffffff"

typography:
  display-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 21px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  sm: 8px
  md: 14px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    height: 48px
  text-input:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.sm}"
  property-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
---

## Elevation

The system has essentially one shadow tier plus the flat baseline, applied to hover-floated cards and dropdown menus.

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Body, hero, footer |
| Card float | One soft shadow | Hovered cards, dropdowns |
