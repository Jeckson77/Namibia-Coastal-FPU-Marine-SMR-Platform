# Design System Document: Maritime Energy Command

## 1. Overview & Creative North Star
### Creative North Star: "The Sovereign Intelligence"
This design system is engineered to move beyond a simple dashboard and into the realm of an authoritative "Decision Support Environment." The aesthetic is informed by maritime radar systems and high-end industrial engineering consoles, tailored specifically for the Namibia Coastal FPU (Floating Power Unit) and Marine SMR (Small Modular Reactor) infrastructure.

To break the "standard template" look, we employ **Intentional Asymmetry** and **Tonal Depth**. We prioritize a "heads-up display" (HUD) feel where the most critical technical data sits on the highest visual plane, while supporting geological and environmental data recedes into the atmospheric background. The layout should feel like a custom-built command center—unapologetically technical, hyper-legible, and sophisticated.

---

## 2. Colors & Surface Architecture
The palette is rooted in the deep oceanic hues of the South Atlantic, contrasted against the electric precision of modern energy infrastructure.

### The Palette (Material Logic)
- **Primary (`#c3f5ff`):** Electric tech-blue. Reserved for active states and critical navigational paths.
- **Secondary (`#b1cad7`):** Slate gray-blue. Used for supporting technical data and inactive UI elements.
- **Tertiary (`#ffe9cd`):** Amber/Gold. Strictly for hazard alerts, warnings, and high-priority reactor status updates.
- **Background (`#10141a`):** The "Deep Sea" base. All UI begins here.

### The "No-Line" Rule & Surface Hierarchy
Traditional 1px borders are a sign of uninspired design. In this system:
- **Prohibit 1px solid borders for sectioning.** Boundaries must be defined by shifts in the `surface-container` tiers.
- **Nesting Logic:** Place `surface-container-lowest` (`#0a0e14`) panels for background technical grids and `surface-container-high` (`#262a31`) for active modular cards. This creates a physical sense of "equipment" being mounted onto a console.
- **The Glass & Gradient Rule:** For floating modals or "Top-Level" critical alerts, use **Glassmorphism**. Apply `surface-variant` (`#31353c`) at 60% opacity with a `20px` backdrop-blur. 
- **Signature Texture:** Use a subtle linear gradient on primary CTAs (from `primary` to `primary-container`) to simulate the glow of a backlit physical button.

---

## 3. Typography
The typography system balances the technical utility of *Inter* with the aggressive, modern geometric feel of *Space Grotesk*.

*   **Display & Headlines (Space Grotesk):** Used for high-level KPIs and sector titles (e.g., "SMR CORE TEMPERATURE"). The wide apertures and geometric forms convey a sense of "Advanced Engineering."
*   **Body & Labels (Inter):** High-legibility sans-serif used for all data readouts, coordinate systems, and technical descriptions.

**Hierarchy as Authority:** 
- Use `display-lg` for single, massive numbers (e.g., Total MW Output). 
- Use `label-sm` in all-caps with `0.1em` letter-spacing for metadata and industrial "tags."

---

## 4. Elevation & Depth
In a professional engineering environment, depth equals hierarchy. We achieve this through **Tonal Layering** rather than drop shadows.

*   **The Layering Principle:** Treat the UI as a series of stacked panels. 
    - Base: `surface`
    - Inset Panels (Charts/Maps): `surface-container-low`
    - Interactive Cards: `surface-container-highest`
*   **Ambient Shadows:** If a card must "float" (e.g., a draggable map overlay), use an extra-diffused shadow: `offset-y: 24px`, `blur: 48px`, `color: rgba(0, 0, 0, 0.4)`. 
*   **The "Ghost Border" Fallback:** Where visual separation is non-negotiable (e.g., complex data tables), use a **Ghost Border**: `outline-variant` (`#3b494c`) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Primary Buttons (Energy Actions)
- **Style:** Flat, high-contrast. `primary` background with `on-primary` text.
- **Radius:** `md` (0.375rem) for a precise, "machined" edge.
- **State:** On hover, apply a `primary-container` outer glow (4px blur) to simulate active power.

### Technical Data Cards
- **Construction:** No dividers. Use `surface-container-high` background.
- **Spacing:** Use strict 24px internal padding (the "Safe Zone") to ensure technical data has room to breathe.
- **Visuals:** Integrate high-contrast Sparklines using `primary` (tech) or `tertiary` (hazard) to show 24h trends.

### Status Chips (Industrial Grade)
- **Success (Emerald):** Background `surface-container-highest` with a `primary_fixed_dim` left-accent bar (2px).
- **Warning (Amber):** `tertiary_container` background with `on_tertiary_fixed` text. Use for SMR thresholds.

### Input Fields (Telemetry Input)
- **Style:** Underline-only or subtle "Ghost Border" boxes.
- **Focus:** Transition the bottom border to `primary` with a subtle glow. Avoid heavy fills; keep the interface light and "airy" despite the dark theme.

### Specialized Component: "The Reactor HUD"
A custom visualization component for this system that uses concentric circles (Glassmorphism layers) to show reactor stability. Avoid standard pie charts; use circular progress gauges with "notched" intervals to mimic physical pressure gauges.

---

## 6. Do’s and Don'ts

### Do:
- **Use Intentional Asymmetry:** Align technical metadata to the right while primary charts sit left. It looks "custom," not "templated."
- **Embrace Vertical Space:** Energy infrastructure is vast. Don't crowd the data. Use the spacing scale to create distinct "zones" of operations.
- **Monochromatic Visualization:** Use shades of `primary` for 90% of your charts. Only introduce `tertiary` (amber) or `error` (red) when a human needs to intervene.

### Don't:
- **No Divider Lines:** Never use a solid line to separate list items. Use a `4px` gap and a subtle background shift on hover.
- **No Rounded "Pills":** Avoid `full` roundedness on anything other than status tags. It feels too "consumer app." Stick to `md` or `sm` for a professional, industrial feel.
- **No Pure Black:** Never use `#000000`. It kills the depth. Always use the `surface` or `surface-container-lowest` tokens to maintain the "Midnight Blue" atmospheric depth.