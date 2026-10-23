---
version: alpha
name: Marrow Analysis
description: A fictional newsroom with capsule inputs, modest cards and a pill button stated in pixels.

colors:
  primary: "#000000"
  ink: "#000000"
  canvas: "#ffffff"
  hairline: "#d8d8d8"
  on-primary: "#ffffff"

typography:
  headline-md:
    fontFamily: Roboto
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  md: 10px
  lg: 18px
  xl: 22px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 6px 17px
  text-input:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
  news-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
---

## Shapes

Controls are capsules; imagery stays near-square.
