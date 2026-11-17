# User Feedback & Improvement Backlog: Seating Chart Mobile UX & Visual Ergonomics
**Logged Date:** 2026-11-17  
**Status:** ✅ Resolved & Deployed (`v1.25.3` / `v1.19.3`)  
**Impact Areas:** Mobile UX, Visual Glanceability, Typography & Responsiveness  

---

## Item 1: Stat Cards Text Truncation on Mobile UX (Seated & Unassigned Guests)
- **Observed Behavior:** On mobile screens (< 480px / < 640px), the KPI summary stat cards cannot fit all header text on a single line. The label (e.g. `UNASSIGNED GUESTS` or `SEATED GUESTS`) and the status badge (e.g. `4 unseated` or `100% Seated`) compete for width in a single `flex-row justify-between`, causing the labels to truncate with ellipsis (`UNASSIG...`).
- **Affected File:** [`src/components/vow/PageMetricStrip.tsx`](file:///D:/Development/sheet2suite/src/components/vow/PageMetricStrip.tsx)
- **Proposed Redesign:**
  1. **Mobile Stacked Layout:** On small screens, stack the label and status badge vertically (`flex-col items-start gap-1`), or place the status badge directly below the large primary metric value.
  2. **Responsive Typography:** Adjust `fontSize` to `0.7rem` with `tracking-tight` on mobile to prevent overflow.

---

## Item 2: Deliverables & Exports Action Bar Mobile Cramping
- **Observed Behavior:** On mobile screens, the subtitle text in the deliverables bar is truncated (`line-clamp-1`), the 3 action buttons wrap awkwardly and feel cramped, and the icons are too small relative to the excessive gap between icon and text.
- **Affected File:** [`src/components/vow/seating/SeatingActionBar.tsx`](file:///D:/Development/sheet2suite/src/components/vow/seating/SeatingActionBar.tsx)
- **Proposed Redesign:**
  1. **Mobile 2×2 Grid or Action Cards:** On screens below 640px, convert the deliverables bar into a 2-column touch-friendly tile grid or a compact vertical stack where each button has `min-height: 44px` (Apple/Android touch target guidelines).
  2. **Icon & Label Proportions:** Increase icon size to 15–16px, reduce the horizontal gap (`gap-1.5` instead of loose spacing), and use clear, compact action labels:
     - `🍽️ Kitchen Dossier`
     - `📋 Easel Chart`
     - `🏷️ Canva Place Cards`
  3. **Hide Verbose Subtitle on Mobile:** Show only the section title and seated progress pill on mobile viewports.

---

## Item 3: Sweetheart Table Card Title Wrapping on Mobile
- **Observed Behavior:** The default Sweetheart Table title (`Sweetheart Table (Couple)` or `Sweetheart Table (Bride & Groom)`) is too long for mobile table card headers, causing ugly 2-line or 3-line partial text wrapping beside the capacity badge.
- **Affected File:** [`src/components/SeatingChartManager.tsx`](file:///D:/Development/sheet2suite/src/components/SeatingChartManager.tsx)
- **Proposed Redesign:**
  1. **Header Layout Breakpoint:** On mobile viewports (< 640px), stack the table title row above the table actions row (`flex-col items-start gap-1.5`), granting the table name 100% card width.
  2. **Short Display Label Fallback:** Truncate parenthetical descriptors on mobile or display `Sweetheart Table` with a clean subtitle badge below it.

---

## Item 4: Seat Pip Contrast & Extended Meal Categorization
- **Observed Behavior:**
  - **Emoji Legibility:** The dark/saturated solid colored backgrounds behind the meal emojis (e.g. crimson behind 🥩, amber behind 🍗) reduce contrast and make the emojis hard to decipher at 14px size.
  - **Culinary Spectrum:** The current meal categorizer accounts for Beef, Chicken, Fish, Vegan, Vegetarian, and Child, but lacks explicit categorization for other common wedding wedding proteins (Pork/Bacon, Lamb, Turkey, Duck, Pasta, etc.).
- **Affected Files:**
  - [`src/components/vow/seating/SeatGlanceNode.tsx`](file:///D:/Development/sheet2suite/src/components/vow/seating/SeatGlanceNode.tsx)
  - [`src/components/vow/seating/CateringDossierModal.tsx`](file:///D:/Development/sheet2suite/src/components/vow/seating/CateringDossierModal.tsx)
- **Proposed Redesign:**
  1. **High-Contrast Pip Styling:** Use a clean white or dark surface background with a 1.5px colored ring/border (e.g. white background with crimson ring for beef, cyan ring for fish) so the emoji stands out vividly.
  2. **Extended Meal Taxonomy:**
     - 🥓 / 🍖 **Pork:** `pork`, `ham`, `bacon`, `tenderloin`
     - 🐑 **Lamb:** `lamb`, `mutton`, `shank`
     - 🦃 **Turkey / Duck:** `turkey`, `duck`, `game`
     - 🍝 **Pasta / Grain:** `pasta`, `risotto`, `ravioli`, `gluten-free`
  3. **Custom / Fallback Icon:** If unclassified, display a clean neutral fork & knife `🍽️` with a customizable tag.

---

## Item 5: Seat Node Shape Consistency (Circles vs. "Circles with Points")
- **Observed Behavior:** On circular tables, seat nodes are rendered as circles (`50% borderRadius`), whereas on square and rectangular tables, seat nodes are rendered with `borderRadius: '6px'`, creating a rounded square with 4 visible corners/points. In addition, the protruding top/bottom badge pips on the circular perimeter break the smooth circular outline.
- **Affected File:** [`src/components/vow/seating/SeatGlanceNode.tsx`](file:///D:/Development/sheet2suite/src/components/vow/seating/SeatGlanceNode.tsx)
- **Proposed Redesign:**
  1. **Strict Circular Consistency:** Make all physical seat nodes circular (`borderRadius: '50%'`) across all table shapes (circle, square, rectangle, and ceremony aisles) for visual harmony.
  2. **Subtle Inset Badges:** Rather than protruding outside the seat node circle, place the micro-indicators cleanly anchored to the inner rim or bottom edge, maintaining a pristine circular silhouette across the floor plan.
