---
version: alpha
name: Quillbox Analysis
description: A fictional news brand whose signature orange is identity only; every button is black.

colors:
  primary: "#fa9000"
  on-primary: "#ffffff"
  ink: "#000000"
  canvas: "#ffffff"
  hairline: "#d8d8d8"

typography:
  headline:
    fontFamily: Roboto
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0
  body:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  lg: 18px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px

components:
  logo-block:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-pill-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 6px 17px
---

## Overview

The orange is a marker pen, not a control: it fills the logo block and the section bars. Every action is a black pill.
