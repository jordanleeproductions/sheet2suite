# Defect Report: DEFECT-001
**Title:** Browser Print Preview Duplicates Page 1 Content Across All Pages Instead of Paginating Full List  
**Severity:** Medium (Operational print flow degraded; workaround available via CSV export)  
**Found In:** `EscortChartModal.tsx` (Alphabetical Escort Chart & Table Roster), `PrintTemplatesModal.tsx`  
**Reported Date:** 2026-11-17  
**Target Milestone:** Future Print Architecture Refactor Phase  

---

## 1. Problem Description
When triggering direct browser print (`window.print()`) from within the Seating Chart or Escort Chart modals (e.g., printing Alphabetical Escort Chart or Table-by-Table Seating Roster), the browser print preview generates multi-page output, but **every page displays the exact same content as Page 1** instead of paginating sequentially down the full guest list.

## 2. Reproduction Steps
1. Navigate to **Sheet2Vow** $\rightarrow$ **Seating & Tables**.
2. Click **EASEL & CANVA** or **Alphabetical Easel Sign** in the Deliverables Bar.
3. Select either:
   - **Alphabetical Escort Chart** (A–Z) with > 50 guests.
   - **Table Roster** with multiple tables.
4. Click the **Print** icon / button (`window.print()`).
5. In the browser print dialog preview:
   - Notice that Page 2, Page 3, etc., repeat the same header and initial rows as Page 1 instead of continuing with the rest of the alphabet or remaining tables.

## 3. Root Cause Analysis
The defect stems from how modal printing is currently implemented in CSS `@media print`:
```css
@media print {
  body * {
    visibility: hidden !important;
  }
  .printable-content, .printable-content * {
    visibility: visible !important;
  }
  .printable-content {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    ...
  }
}
```
1. **Ancestral Layout Constraints:** The printable element `.printable-content` is deeply nested inside a modal overlay (`position: fixed`, `overflow-y: auto`, `height: 100vh`).
2. **`position: absolute` Pagination Bug in Blink / WebKit:** When an absolutely positioned element is printed inside a parent with restricted dimensions or hidden visibility, the browser print layout engine cannot compute natural document flow heights across page breaks. Instead of calculating page break offsets, it renders the static viewport slice at `top: 0` repeatedly across each physical page.
3. **`break-inside` & `page-break` Context Loss:** Because the container is detached from the root printing document flow, CSS rules like `break-inside: avoid` and natural table pagination are ignored.

## 4. Planned Resolution (Future Phase)
Instead of relying on `visibility: hidden` and `position: absolute` on nested modal DOM nodes:
1. **Dedicated Print Window / Iframe Isolation:**
   - Render the print markup into an offscreen hidden `<iframe>` or a lightweight popup window containing *only* clean, semantic HTML and print CSS (`<!DOCTYPE html><html><body>...</body></html>`).
   - Call `iframe.contentWindow.print()`. This guarantees the printable content is at the true document root with 0 parent overflow/position interference.
2. **Alternative Pure CSS Fix:**
   - Set `@media print { html, body, .modal-overlay, .modal-container { position: static !important; overflow: visible !important; height: auto !important; max-height: none !important; } }`.
   - Apply `display: none` to all sibling containers rather than `visibility: hidden`.
