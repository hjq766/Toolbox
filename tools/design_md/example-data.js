/* design_md/example-data.js — 内置示例（Stitch / YAML frontmatter 格式） */

export const EXAMPLE = `---
version: alpha
name: Stellar-design-system
description: A developer-focused design system built on a warm cream canvas with a single high-voltage brand accent. Near-black ink carries all body and display text. Inter serves as the universal typeface. Zero drop shadows — depth comes from surface tinting alone. 4px base unit with generous section rhythm.

colors:
  primary: "#5B47E0"
  primary-active: "#4A38C2"
  primary-soft: "#EEF0FF"
  ink: "#1A1A2E"
  body: "#4A4A6A"
  muted: "#8080A0"
  hairline: "#E4E4F0"
  hairline-soft: "#EDEDF8"
  canvas: "#F8F8FC"
  surface-card: "#FFFFFF"
  surface-raised: "#F0F0FA"
  on-primary: "#FFFFFF"
  on-dark: "#F8F8FC"
  semantic-success: "#1A9E6C"
  semantic-warning: "#D4860A"
  semantic-error: "#D03050"

typography:
  display-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1.5px
  display-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.8px
  title-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  title-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.5px
  code:
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 16px
  md: 24px
  lg: 32px
  xl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 20px
    height: 40px
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 9px 19px
    height: 40px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.button}"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 14px
    height: 44px
---

## Overview

Stellar is a developer-focused design system built on restraint and clarity. The base canvas is **warm off-white** (\`{colors.canvas}\` — #F8F8FC), carrying near-black ink (\`{colors.ink}\` — #1A1A2E). The single brand voltage is **Stellar Purple** (\`{colors.primary}\` — #5B47E0) — reserved for primary CTAs and interactive states.

**Key Characteristics:**
- Warm canvas, not pure white. Ink is warm-tinted, not pure black.
- Single CTA color: \`{colors.primary}\`. Used purposefully.
- Zero drop shadows — depth via surface tinting only.
- 4px base unit with 80px section rhythm.
- Inter as the universal typeface. JetBrains Mono on all code surfaces.

## Colors

### Brand
- **Primary** (\`{colors.primary}\` — #5B47E0): Interactive elements, CTAs, brand accent.
- **Primary Active** (\`{colors.primary-active}\` — #4A38C2): Hover and press states.
- **Primary Soft** (\`{colors.primary-soft}\` — #EEF0FF): Tinted backgrounds for badges, focus rings.

### Surface
- **Canvas** (\`{colors.canvas}\` — #F8F8FC): Warm off-white page background.
- **Surface Card** (\`{colors.surface-card}\` — #FFFFFF): Card surfaces — slight pop above canvas.
- **Surface Raised** (\`{colors.surface-raised}\` — #F0F0FA): Subtle raised surface for secondary panels.

### Text
- **Ink** (\`{colors.ink}\` — #1A1A2E): Display and emphasis text.
- **Body** (\`{colors.body}\` — #4A4A6A): Default running text.
- **Muted** (\`{colors.muted}\` — #8080A0): Sub-labels, placeholders.

### Semantic
- **Success** (\`{colors.semantic-success}\` — #1A9E6C): Confirmation states.
- **Warning** (\`{colors.semantic-warning}\` — #D4860A): Caution states.
- **Error** (\`{colors.semantic-error}\` — #D03050): Validation errors.

## Typography

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| \`display-lg\` | 56px | 700 | 1.1 | -1.5px | Hero headline |
| \`display-md\` | 36px | 700 | 1.15 | -0.8px | Section heads |
| \`title-lg\` | 22px | 600 | 1.3 | 0 | Card group titles |
| \`title-md\` | 18px | 600 | 1.4 | 0 | Component titles |
| \`body-md\` | 16px | 400 | 1.6 | 0 | Default body |
| \`body-sm\` | 14px | 400 | 1.55 | 0 | Footer, secondary |
| \`caption\` | 12px | 500 | 1.4 | 0.5px | Labels, tags |
| \`code\` | 13px | 400 | 1.6 | 0 | Code surfaces (JetBrains Mono) |
| \`button\` | 14px | 500 | 1.0 | 0 | CTA labels |

## Layout

### Spacing Tokens
- **Base unit:** 4px.
- \`xxs\` 4px · \`xs\` 8px · \`sm\` 12px · \`base\` 16px · \`md\` 24px · \`lg\` 32px · \`xl\` 48px · \`section\` 80px

## Do's and Don'ts

### Do
- Reserve \`{colors.primary}\` for primary CTAs only.
- Use \`{colors.canvas}\` as the page floor — never pure white.
- Render every code surface in JetBrains Mono.

### Don't
- Don't add drop shadows. Surface tinting carries depth.
- Don't use pure black (#000000). Always use \`{colors.ink}\`.
`.trim();
