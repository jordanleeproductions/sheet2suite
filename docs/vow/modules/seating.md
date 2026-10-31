# Sheet2Vow — Seating & Floorplan Planner Specification

**Primary Components:** `src/components/SeatingChartManager.tsx`, `src/lib/sheets/relationalSync.ts`  
**Google Sheet Tabs:** `TABLES` (Table configurations & shapes), `GUESTS` (Seat position in Col O, table assignment in Col I)

---

## 1. Overview & Capabilities

The Seating module provides an interactive visual floorplan and ceremony aisle planner for wedding receptions and ceremonies, synchronizing bidirectionally with Google Sheets. It allows couples to design dining layouts, assign guests with party group affinity, lock in exact physical seat numbers, and plan dual-aisle ceremony processionals.

---

## 2. Visual Reception Floorplan Canvas

### 2.1 Table Shapes & Dynamic Geometry
- **Round Circle Tables:** Dynamic radial node distribution using trigonometric angle offsets (`Math.cos`, `Math.sin`).
- **Rectangle Banquet Tables:** Dynamic length scaling with dual-rail linear seat distribution, plus optional head and foot end seats.
- **Square Tables:** 4- or 8-seat balanced distribution across all four perimeter edges.
- **Sweetheart & Single-Side Tables:** Single-side seating facing the room with couple iconography.
- **Table Numbering & Sweetheart Offset:** Automatically identifies Sweetheart/Head tables and offsets subsequent numbered tables, ensuring the first general reception table defaults to "Table 1" rather than "Table 2".

### 2.2 Table ID Generation & Sync Resilience
- **Semantic ID Allocation:** Generates human-readable, collision-proof table identifiers (`table-1`, `table-2`, `table-sweetheart`) with gap-filling logic.
- **Ghost Row Filtering:** Automatically cleans and ignores blank spreadsheet rows lacking a valid `tableId` before rendering.

---

## 3. Physical Seat Persistence & Collision-Proof Allocation

### 3.1 Non-Shifting Seat Resolution Engine
- **Seat Number Persistence:** Guest physical seat positions are permanently stored in **Column O: `Seat Number`** (`seatNumber`: integer, `1..capacity`) of the `GUESTS` tab.
- **Locked Seat Allocation (`getResolvedGuestSeatsForTable`):**
  - Resolves each guest to their explicit physical seat number.
  - Guarantees that assigning, unassigning, or swapping a guest never causes neighboring guests to shift seat positions or trigger accidental reallocations.
  - Safely guards against undefined table properties to prevent runtime crashes during rapid guest manipulation.

### 3.2 3-Tier Intelligent Party Group Seating Priority
When browsing the guest drawer to seat guests at a table, the candidate list is dynamically sorted by relationship priority:
1. **Party Group Affinity (`🎉 SAME PARTY GROUP`):** Unassigned guests who belong to the same `partyGroup` as guests already seated at the active table.
2. **General Unassigned Guests (`UNASSIGNED`):** Attending guests who currently have no table assignment.
3. **Assigned Guests:** Attending guests seated elsewhere, surfaced for rapid table transfers.

### 3.3 Declined RSVP Seating Exclusion
- Attending and pending guests are tracked in seating capacity metrics.
- Guests with `rsvpStatus: 'Declined'` are strictly excluded from:
  - Table seated headcounts and progress meters.
  - The unassigned seating counter.
  - The unassigned guest seating drawer.

---

## 4. Ceremony Aisle Planner (`[CEREMONY-SEATING-MOBILE-REDESIGN]`)

### 4.1 Processional Layout Architecture
- **Dual-Aisle Processional:** Left Aisle and Right Aisle seat grids divided by an interactive central aisle walkway runner.
- **VIP Tiers:** Front-row designations with high-contrast VIP attendant badges for immediate family and wedding party.
- **Partner Name Customization:** Aisle headers dynamically populate couple names (`partner1Name` / `partner2Name`) with graceful fallbacks.
- **1-Click Aisle Presets:** Dropdown presets including *Couple Names*, *Partner 1 & Partner 2*, *Two Brides*, *Two Grooms*, *Modern Inclusive / Open Seating*, and *Traditional*.

### 4.2 Adaptive Mobile Deck ($\le 768\text{px}$)
- **Row-by-Row Aisle Cards:** Consolidated view displaying Left and Right sides together with an inline central aisle notch (`🚶 AISLE`), $42\text{px} \times 42\text{px}$ touch targets, and quick row jump pills.
- **Row Roster View:** Segmented side tabs displaying full guest names, party groups, dietary notes, and 1-tap assign/unassign actions.
