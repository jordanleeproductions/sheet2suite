# Sheet2Vow — Guest Registry & RSVP Specification

**Primary Components:** `src/components/GuestListManager.tsx`, `src/components/MenuSetupManager.tsx`, `src/lib/sheets/relationalSync.ts`  
**Google Sheet Tabs:** `GUESTS` (Columns A–O), `CATERING` (Columns A–H)

---

## 1. Overview & Capabilities

The Guest Registry manages the complete guest lifecycle from invitation tracking and RSVP responses to dietary restrictions, party grouping, and dining table assignments. It bidirectionally syncs with the `GUESTS` spreadsheet tab and establishes relational linkages with catering menus and reception floorplans.

---

## 2. RSVP & Guest Management

- **RSVP States:** `Attending`, `Declined`, `Pending`.
- **Plus-One Tracking:** Boolean flag (`hasPlusOne`) linked to optional `plusOneName`.
- **Contact Records:** Email address, mobile telephone, and physical mailing address for paper stationery distribution.
- **Thank-You Note Linkage:** Boolean checkbox (`thankedSent`) reflecting thank-you card completion status.
- **Monarch Slide-Over Guest Drawer:** 
  - Desktop slide-over panel and mobile bottom sheet organized into 5 structured cards: *Identity*, *Attendance & RSVP*, *Seating & Aisle*, *Catering & Dietary*, and *Contact Information*.
  - When RSVP is marked `Declined`, seating and catering inputs are context-aware and gracefully hidden.
  - Inputs enforce $\ge 48\text{px}$ minimum height and $16\text{px}$ font size to prevent mobile browser auto-zoom.

---

## 3. Dietary Tracking & Catering Menu Linkage

### 3.1 Menu Setup Synchronization (`MenuSetupManager.tsx`)
- Maps to the `CATERING` spreadsheet tab.
- Generates sequential, human-readable dish catalog IDs (`M101`, `M102`, `M103`...).
- Distinguishes individual guest choice dishes (`isGuestChoice: true`) from communal/buffet courses (`isGuestChoice: false`).

### 3.2 Live Entree Order Analytics & Cross-Tab Redirection
- **Live Entree Statistic Cards:** Interactive metrics cards in `MenuSetupManager.tsx` display the live order count for each individual guest entree choice.
- **1-Click Relational Redirection:** Clicking any entree stat card immediately routes the planner to the **Guest List** tab with `mealFilter` set to that specific dish, highlighting the active filter pill and displaying matching guests.

### 3.3 Inclusive (OR) Multi-Select Quick Filters
- Upgraded catering filters support inclusive OR multi-selection across both Dietary Restrictions and Meal Choices (e.g., viewing guests who requested either *Vegetarian* OR *Gluten-Free*).
- Includes dedicated `ANY RESTRICTION` quick-filter pill matching any guest with populated dietary restrictions.
- Active filters row renders individual dismissible tag badges (`DIET: ... ✕`, `MEAL: ... ✕`) alongside a global `RESET FILTERS` action.

### 3.4 Dynamic Catering Vendor Spreadsheet Engine
Generates a sanitized export tailored for the catering team:
- Columns: `#`, `First Name`, `Last Name`, `Age Category`, `Dietary Restrictions`, `Meal Choice`, `Table Number`.
- **Table Name Resolution:** Automatically resolves internal system IDs (e.g. `table-1788572224912`) to human-designated table labels (e.g. `Table 1`, `Sweetheart Table`).
- Filters out declined RSVPs.

---

## 4. Grouping Views & Seating Table Logic

- **View Modes:**
  - `ALL GUESTS`: Flat searchable list with sorting and filtering.
  - `BY SEATING TABLE`: Grouped by table assignment with capacity badges.
  - `BY PARTY GROUP`: Grouped by family or travel party cluster.
- **Declined Guest Exclusion (`[GUEST-SEATING-DECLINED-EXCLUSION]`):**
  - In `BY SEATING TABLE` grouping, guests with `RSVP Status: Declined` without table assignments are strictly excluded from the "UNASSIGNED SEATING" cluster, preventing false inflation of the unseated guest alert.
- **Desktop Toolbar Ergonomics:**
  - Unified grouping bar combining Grouping View (`ALL GUESTS`, `BY SEATING TABLE`, `BY PARTY GROUP`) on the left and Layout Mode (`CARDS`, `LIST`) on the right.
  - Primary `+ ADD GUEST` button positioned directly in the stats bar adjacent to records, minimizing mouse travel.
