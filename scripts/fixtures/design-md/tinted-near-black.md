---
version: alpha
name: Nordlane-design-analysis
description: A fictional workflow tool whose primary button is a navy so deep it reads as black.

colors:
  primary: "#181d26"
  primary-active: "#0d1218"
  ink: "#181d26"
  body: "#333840"
  canvas: "#ffffff"
  surface-soft: "#f8fafc"
  hairline: "#dddddd"
  on-primary: "#ffffff"

typography:
  display-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: 0

rounded:
  sm: 6px
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
    rounded: "{rounded.lg}"
    padding: 16px 24px
  text-input:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.sm}"
---

## Overview

The primary CTA is near-black ink with white text.
