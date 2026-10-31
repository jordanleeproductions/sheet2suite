# Sheet2Vow — Financials & Budget Specification

**Primary Components:** `src/components/BudgetLedgerManager.tsx`, `src/lib/sheets/mapper.ts`, `src/app/api/sync/route.ts`  
**Google Sheet Tabs:** `BUDGET` (Category ledger, Cols A–F), `EXPENSES` (Itemized purchases, Cols A–H)

---

## 1. Overview & Architecture

The Financials module provides a dual-level accounting ledger for wedding budgeting. It separates top-level category allocations (`BUDGET` tab) from granular itemized purchase receipts (`EXPENSES` tab), featuring split-screen ergonomics, contributor attribution, hybrid target caps, and real-time Google Sheets formula synchronization.

---

## 2. Desktop Split-Screen Ledger Architecture

Desktop viewports ($\ge 1024\text{px}$) utilize a 12-column side-by-side split screen (`lg:grid lg:grid-cols-12 lg:gap-5`):

```
┌───────────────────────────────────────┬─────────────────────────────────────────────────┐
│ CATEGORIES MASTER RAIL (Left 5 Cols)  │ ITEMIZED EXPENSES DETAIL LEDGER (Right 7 Cols)  │
│ - Search & Sorting Controls (50/50)   │ - Sticky Viewport Pane (position: sticky)       │
│ - Category Filter Pills (Overdue/Paid)│ - Active Category Snapshot Bar                  │
│ - Category List with Outlay & Variance│ - Primary "+ RECORD PURCHASE" Button            │
│ - Pinned Summary Totals Footer        │ - Receipts Table with Payer Badges & Actions    │
└───────────────────────────────────────┴─────────────────────────────────────────────────┘
```

- **Categories Master Rail (Left 5 Columns):**
  - High-density list of all budget categories with projected caps, actual outlay, variance status, and due dates.
  - Sorting dropdown supporting 4 persistent modes: *Alphabetical*, *By Budget*, *By Spent*, and *By Remaining Cushion*.
- **Itemized Expenses Detail Ledger (Right 7 Columns):**
  - Displays line-item receipts filtered to the selected category (or all purchases when unselected).
  - Eliminates vertical scrolling past long category lists to record purchases.
- **Mobile Stacking & 2-Column Adaptation:** On viewports $\le 1023\text{px}$, reflows into a vertical stack; on $\le 768\text{px}$, the top metric strip reflows into a 2x2 grid with full-width mobile touch targets.

---

## 3. Financial KPI Metrics & Allocation Strip

- **Top Exception Strip:** Surfaces critical actionable financial alerts: overdue balances with red alert badges, total pending unpaid amounts, over-budget category counts, earliest upcoming payment due date, and Google Sheets sync status.
- **Horizontal Financial Allocation Strip:** Replaces generic circular pie/donut charts with a structured proportional rule/bar showing target cap, actual outlay, remaining cushion, and percentage allocation ticks.
- **Plain-Language Financial Indicators:** Reworked top metrics around four core figures:
  - **LEFT TO SPEND** (unallocated / remaining cushion)
  - **PAID SO FAR** (reconciled outlay)
  - **DUE SOON** (pending unpaid commitments)
  - **PLANNED BUDGET** (overall budget target)

---

## 4. Hybrid Target Mode (Dynamic vs. Master Cap)

1. **Dynamic Mode (Default):** The master budget target automatically calculates as the live sum of all category allocations (`totalEstimate`). Adjusting category allocations or vendor contracts updates the total dynamically.
2. **Master Cap Mode:** Entering an explicit ceiling (e.g. `$35,000`) establishes a fixed ceiling. The system computes `effectiveTarget - totalEstimate`, rendering either an emerald *Unallocated Cushion* badge or an amber/red *Over-Allocated* alert.
3. **1-Click Sync:** The `SYNC TO CATEGORIES` action snaps the master cap back to the exact category sum at any time.

---

## 5. Contributor Tracking ("Paid By" Breakdown)

- **Schema Mapping:** Stored in **Column H: `Paid By`** (`paidBy`: string) of the `EXPENSES` tab.
- **Contributor Attribution:** Add/Edit Expense modal features an interactive combobox with suggestion chips: `Couple`, `In-Laws`, `Parents`, `Self`, `Partner`, or custom contributor names.
- **Ledger Badging:** Renders styled row-level payer badges in the desktop receipt table and mobile expense cards.
- **Contribution Breakdown:** Computes family contribution breakdown metrics (e.g. `Couple: $18,400 (52%)`, `Parents: $12,000 (34%)`, `In-Laws: $5,000 (14%)`) in the summary ledger.

---

## 6. Data Sanitization & Google Sheets Sync

- **Date Serial Day Normalization (`parseDateOrSerial`):** Converts numeric day integers returned by Google Sheets `UNFORMATTED_VALUE` (e.g. `46276` $\rightarrow$ `2026-09-11`) into valid ISO date strings.
- **Sheet Column Date Formatting:** Applies `repeatCell` format updates enforcing `numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' }` on the `Expenses` sheet.
- **Sanitized Number Parsing (`parseCleanNumber`):** Strips currency symbols (`$`, `£`, `€`) and thousand-separator commas before parsing floats, preventing `NaN` drops.
- **Vendor Deposit Cross-Sync:** Vendor deposits logged in `VendorManager.tsx` automatically create and link corresponding expense entries (`EXP-V-${vendorId}`) in the `EXPENSES` tab.
