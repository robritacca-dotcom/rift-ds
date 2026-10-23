---
version: alpha
name: Kestrel Analysis
description: A fictional sportsbook set in heavy weights only, body copy included.

colors:
  primary: "#00b24b"
  on-primary: "#ffffff"
  canvas: "#141415"
  surface: "#2e3035"
  hairline: "#2d2f33"
  ink: "#f0f2f5"
  muted: "#9aa1b1"

typography:
  display:
    fontFamily: Inter
    fontSize: 33px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  md: 8px
  lg: 10px
  card: 16px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 8px 12px
  text-input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  game-tile:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
---

## Typography

There is no regular-weight body text; even running copy is semibold.
