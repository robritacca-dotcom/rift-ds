---
version: alpha
name: Harbor-design-analysis
description: A fictional editor whose headlines are tracked tight in pixels while body copy stays plain.

colors:
  primary: "#f54e00"
  ink: "#26251e"
  canvas: "#f7f7f4"
  hairline: "#e6e5e0"
  on-primary: "#ffffff"

typography:
  display-mega:
    fontFamily: "Inter, sans-serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -1.28px
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  md: 8px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: 40px
---

## Typography

Display sits at weight 400 with negative letter-spacing.
