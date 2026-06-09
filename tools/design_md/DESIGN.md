```markdown
# Design System Document: The Precision Curator

## 1. Overview & Creative North Star

The Creative North Star for this system is **"The Precision Curator."** 

While the inspiration source (jqnav.top) provides a functional foundation, this design system evolves it into a high-end editorial experience. We are moving away from the "utility-standard" look of the early web toward a sophisticated, layered environment. The goal is to make tool discovery feel less like a database search and more like browsing a premium digital gallery. 

We achieve this through **Intentional Asymmetry** (using varied card heights or offset headers), **Tonal Depth** (replacing lines with color shifts), and **Sophisticated Breathing Room**. The layout should feel "airy" yet authoritative, using whitespace as a structural element rather than a void.

---

## 2. Colors

This palette is designed for prolonged utility. It leverages cool-toned neutrals to reduce eye strain while using vibrant primaries to signal interaction.

### The "No-Line" Rule
**Strict Directive:** 1px solid borders are prohibited for sectioning. To separate a sidebar from a main feed, or a header from a hero, use background color shifts. 
*   *Example:* Place a `surface-container-low` sidebar against a `surface` main content area. The eye perceives the boundary through the shift in value, creating a cleaner, more modern aesthetic.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-paper layers. 
- **Base Layer:** `surface` (#f7f9ff)
- **Secondary Logic Layers (Sidebars/Filters):** `surface-container-low` (#edf4ff)
- **Active Interactive Elements (Cards):** `surface-container-lowest` (#ffffff) to provide a "pop" of brightness.
- **Elevated Overlays:** `surface-container-high` (#d9eaff) for active states or flyout menus.

### The "Glass & Gradient" Rule
For floating navigation or top-bars, use Glassmorphism. Set the background to `surface` at 80% opacity with a `backdrop-blur` of 12px. This prevents the UI from feeling "chopped up" and maintains a sense of spatial continuity. Use a subtle linear gradient (from `primary` #004be3 to `primary-container` #3366ff) for primary CTA buttons to add "soul" and depth.

---

## 3. Typography

We utilize **Inter** across the board to ensure a neutral, highly readable foundation that feels "Engineered."

*   **Display (lg/md):** Reserved for hero section value propositions. Use `on-background` with a slight letter-spacing reduction (-0.02em) to create a tight, editorial feel.
*   **Headline & Title:** These are your navigational anchors. `title-lg` (1.375rem) should be used for category headers to establish clear entry points.
*   **Body:** `body-md` (0.875rem) is the workhorse for tool descriptions. It provides high information density without sacrificing legibility.
*   **Labels:** Use `label-md` in All Caps with +0.05em letter-spacing for "NEW" tags or "BETA" statuses to provide a technical, curated aesthetic.

---

## 4. Elevation & Depth

### The Layering Principle
Hierarchy is achieved through **Tonal Layering**. Instead of using box-shadows to indicate every card, use the color scale. A `surface-container-lowest` card sitting on a `surface-container` background creates a natural, soft lift.

### Ambient Shadows
Shadows are used only for "Global" floating elements (Modals, Hovered Cards). 
- **Specification:** `0px 20px 40px rgba(9, 29, 46, 0.06)`. 
The shadow is tinted with the `on-surface` color (#091d2e) at a very low opacity to mimic natural light refraction rather than a "dirty" grey drop shadow.

### The "Ghost Border" Fallback
If a visual separator is required for accessibility in dense data views, use a **Ghost Border**: `outline-variant` (#c3c5d8) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards (The Core Unit)
- **Structure:** Forbid divider lines. Use `spacing-6` (1.5rem) to separate the icon, title, and description.
- **Styling:** `surface-container-lowest` background with `roundedness-lg` (1rem). 
- **Hover State:** Shift background to `surface-bright` and apply an **Ambient Shadow**.

### Buttons
- **Primary:** Gradient (`primary` to `primary-container`), `roundedness-full`, white text. No border.
- **Secondary:** `surface-container-highest` background, `on-surface` text.
- **Tertiary/Ghost:** No background. `primary` text. Use for "View All" links.

### Filtering Chips
- **Inactive:** `surface-container-low` background, `on-surface-variant` text.
- **Active:** `primary` background, `on-primary` text, `roundedness-md`.

### Input Fields
- **Search Bar:** Use `surface-container-low`. Instead of a heavy border, use the `outline-variant` at 20% opacity. On focus, transition the background to `surface-container-lowest` and add a subtle `primary` glow.

### Category Sidebar
- **Layout:** Vertical list using `spacing-2` between items. 
- **Active State:** A vertical "pill" indicator (2px wide) using the `tertiary` color (#00693a) to the left of the text, rather than highlighting the whole row.

---

## 6. Do's and Don'ts

### Do
- **DO** use the `spacing-12` (3rem) and `spacing-16` (4rem) values to create generous gutters between tool categories.
- **DO** use `tertiary` (#00693a) for "Success" or "Verified Tool" indicators to provide a sophisticated alternative to standard green.
- **DO** align the logo exactly with the left-padding of the sidebar to create a strong vertical axis.

### Don't
- **DON'T** use 100% black (#000000) for text. Always use `on-surface` (#091d2e) to maintain a premium, soft-contrast feel.
- **DON'T** use `roundedness-none`. Everything in this system has a minimum of `sm` (0.25rem) to avoid a "harsh" or "dated" feel.
- **DON'T** use horizontal rules (`<hr>`) to separate cards in a list. Use `surface-container` background shifts or vertical whitespace.

---

## 7. Signature Interaction: The "Drift"
When a user scrolls, the sidebar should remain fixed, but the tool cards in the grid should have a staggered entrance animation (Fade + Slide Y 20px). This reinforces the "Precision Curator" feel—every tool is being presented intentionally.```