---
name: agri-sys-ui-design
description: "Apply enterprise/corporate SaaS UI design rules, component best practices, and accessibility standards for the Agri-Sys frontend."
---

# Agri-Sys UI Design Guidelines

This skill encapsulates the UI/UX design philosophy, component knowledge, and strict quality rules for the Agricultural Intervention Distribution System frontend (`/agri_sys`).

## Design Philosophy & Direction

- **Style:** Enterprise / Corporate (information-dense, compact spacing, fully keyboard-navigable) with Modern SaaS influence.
- **Palette & Styling:**
  - Sidebar: `bg-green-950`
  - Primary Buttons: `bg-green-700 hover:bg-green-800`
  - Page Background: `bg-slate-100`
  - Cards: `bg-white border border-slate-200 shadow-sm rounded-xl`
  - Table Headers: `bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide`
  - Font: Inter
- **Spacing:** Use an 8px grid. Tighter gaps group related elements; generous gaps let content breathe.
- **Accessibility:** WCAG AA contrast (4.5:1 min), focus indicators, semantic HTML.

## Component Quick Reference

When building or modifying UI components, adhere to these key rules:

- **Button:** Verb-first labels, one primary per section, minimum 44px touch target. Show spinner and disable during async operations.
- **Card:** Media → title → meta → action hierarchy. Shadow OR border, not both.
- **Table:** Sticky header, right-align numbers, sortable indicators, horizontal scroll on mobile.
- **Form/Input:** Labels above inputs, proper input types, inline validation on blur (not keystroke), show inline errors below with red border.
- **Modal/Drawer:** Trap focus, allow closing via X, Cancel, and Escape.
- **Toast:** Use `react-hot-toast` (top-right), auto-dismiss.
- **State management:** Provide empty states (positive framing) and skeleton loaders (shimmer pulse, shape matching) instead of plain spinners for layout loads.

## Critical UX Quality Rules (Pre-Delivery Checklist)

Always run the following checks before committing UI code:

1. **Accessibility:**
   - Minimum 4.5:1 contrast ratio.
   - Visible focus rings.
   - Every `<input>` has an associated `<label>`.
2. **Touch & Interaction:**
   - Add `cursor-pointer` to all clickable elements.
   - Disable buttons during async operations + show loading state.
3. **Responsive Layout:**
   - No horizontal scroll on mobile.
   - Use consistent `max-w-6xl` or `max-w-7xl` containers.
4. **Animation:**
   - Micro-interactions (hover feedback) must have smooth transitions (150-300ms) like `transition-colors duration-200`.
   - Never use emojis as icons; use Lucide React SVGs only.
