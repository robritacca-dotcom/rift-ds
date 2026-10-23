---
version: alpha
name: Lantern-design-analysis
description: A fictional publisher pairing a licensed serif display face with a licensed sans body, each with its own stand-in.

colors:
  primary: "#cc785c"
  primary-active: "#a9583e"
  ink: "#141413"
  canvas: "#faf9f5"
  surface-soft: "#f5f0e8"
  hairline: "#e6dfd8"
  on-primary: "#ffffff"

typography:
  display-xl:
    fontFamily: "Quillface, Tiempos Headline, serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -1.5px
  body-md:
    fontFamily: "Harborgrot, -apple-system, Roboto, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0

rounded:
  md: 8px
  lg: 12px

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
  text-input:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
  feature-card:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.lg}"
---

## Typography

### Font Family

The system runs **Quillface** (or **Tiempos Headline** as substitute) as the serif display face, and **Harborgrot** (or **Inter** as substitute) as the humanist sans for body. Fallback stack: `-apple-system, Roboto, sans-serif`.

### Note on Font Substitutes

If Quillface is unavailable, **Cormorant Garamond** at weight 500 is the closest open-source approximation. For Harborgrot, **Inter** is the closest match.
