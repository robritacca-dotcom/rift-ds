---
version: alpha
name: Brightline-design-analysis
description: A fictional exchange that names a dark marketing canvas and a light transactional one.

colors:
  primary: "#fcd535"
  primary-active: "#f0b90b"
  on-primary: "#181a20"
  ink: "#181a20"
  on-dark: "#eaecef"
  muted: "#707a8a"
  canvas-light: "#ffffff"
  canvas-dark: "#0b0e11"
  surface-card-dark: "#1e2329"
  hairline-on-light: "#eaecef"

typography:
  display-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.5px
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  md: 6px
  xl: 12px

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
    rounded: "{rounded.md}"
    height: 40px
  text-input-on-light:
    backgroundColor: "{colors.canvas-light}"
    rounded: "{rounded.md}"
  markets-table-card:
    backgroundColor: "{colors.surface-card-dark}"
    rounded: "{rounded.xl}"
---

## Typography

If the custom face is unavailable, **Inter** is the closest open-source substitute.
