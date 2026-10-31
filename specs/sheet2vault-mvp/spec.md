# Feature Specification: Sheet2Vault MVP (Home Valuables & Insurance Claim Dossier)

**Feature ID:** `[FEAT-002]`  
**Target Product:** `Sheet2Vault` (`vault.sheet2suite.com` / `sheet2suite.com/vault`)  
**Status:** `Approved`  
**Author / DRI:** `Jordan Lee`  
**Created Date:** `2026-10-31`  

---

## 1. Product Intent & Problem Statement

- **Problem:** Everyday people accumulate tens of thousands of dollars in personal valuables (electronics, jewelry, musical instruments, tools, appliances). However, cataloging these items manually is tedious and quickly abandoned. In the devastating event of a house fire, flood, or burglary, victims face immense stress while insurance adjusters demand itemized proof of ownership, serial numbers, receipts, and replacement costs. Without documentation, claims are delayed, heavily discounted by standard depreciation formulas, or outright denied. Furthermore, most users are unaware of standard policy "sub-limits" (e.g., standard policies capping unscheduled jewelry at \$1,500), leaving them dangerously underinsured.
- **Proposed Solution:** **Sheet2Vault** is a personal asset inventory and catastrophe preparedness digital canvas within the Sheet2Suite platform. It provides a frictionless **Mobile-First "Room Sweep"** progressive capture flow (< 30 seconds per item), proactive **Insurance Sub-Limit Gap Auditing**, and 1-click generation of both a formal **Insurance Claim Dossier** (PDF + secure adjuster web portal) and a **Police Stolen Goods Recovery Sheet**.
- **Value Proposition:** 100% data sovereignty (all data lives in the user's private Google Sheet and Google Drive), zero vendor lock-in, zero ongoing cloud storage costs, and peace of mind knowing that years of acquired property can be proven and recovered in minutes.

---

## 2. User Stories

1. **User Story 1 (The Room Sweep Onboarder):** As a homeowner or renter, I want to walk through my rooms with my smartphone and quickly photograph items, auto-select categories, and optionally snap serial number plates and receipts, so that I can inventory an entire room in under 5 minutes without setup fatigue.
2. **User Story 2 (The Proactive Policy Auditor):** As an asset owner, I want Sheet2Vault to automatically compare my cataloged replacement values against standard insurance policy sub-limits (e.g., jewelry, electronics, tools), so that I am alerted before a disaster occurs to schedule necessary insurance riders/endorsements.
3. **User Story 3 (The Disaster Claimant):** As a victim of a burglary or fire, I want to filter my inventory by incident date/room and generate a tamper-evident, adjuster-ready PDF Dossier with embedded photo plates and serial numbers, plus generate a tokenized read-only link, so that my insurance adjuster can verify and settle my claim rapidly.
4. **User Story 4 (The Police Recovery Reporter):** As a burglary victim, I want to export a high-contrast Police Recovery Sheet focused strictly on serial numbers, makes, models, photos, and distinctive markings, so that law enforcement and pawn registries can trace and recover my stolen property.

---

## 3. Functional Requirements

### 3.1 User Interface & Interaction Flow
- **Entry Points:**
  - Subdomain routing: `vault.sheet2suite.com` or `sheet2suite.com/vault`.
  - Generic Platform Activation: `/activate` $\rightarrow$ `<VaultSetupPlugin />` (seeds residence nickname, default room list, and policy limits).
- **Mobile Experience ($\le 768\text{px}$):**
  - **Bottom Docked Navigation:** Home/Vault, Room Sweep FAB, Inventory List, Claims & Reports, Settings.
  - **Room Sweep Progressive Capture Modal / Drawer:**
    - Step 1: Room Selector (quick toggle between Living Room, Kitchen, Garage, etc.).
    - Step 2: Camera capture / photo upload of item.
    - Step 3: Quick title & category chip selection.
    - Step 4: Optional quick-snap for Serial Plate and Receipt (skippable with 1 tap, updates Claim Readiness Score).
  - Touch targets $\ge 44\text{px}$–$48\text{px}$; form inputs enforce $16\text{px}$ font to eliminate iOS Safari auto-zoom; bottom nav respects `env(safe-area-inset-bottom)`.
- **Desktop Experience ($\ge 1024\text{px}$):**
  - **Monarch Hero Metric Strip:**
    - Total Replacement Value (`$XX,XXX` in tabular monospace `tnum`).
    - Claim Readiness Gauge (e.g. `82% Claim-Ready` based on verified photos + serials + receipts).
    - Sub-Limit Alerts (e.g., `⚠️ Jewelry exceeds $1,500 standard cap by $3,200`).
  - **Filterable Inventory Ledger:** Sort and filter by Room, Category, Status (Active, Stolen, Damaged, Sold), and Missing Evidence (Missing Serial, Missing Receipt).
  - **Claim & Dossier Studio:** Select lost/stolen items $\rightarrow$ preview and generate the Insurance Claim PDF and Adjuster Web Portal link.

### 3.2 Data Mutations & Synchronization
- **Single Source of Truth:** Google Spreadsheet tab `VAULT_ITEMS` and `VAULT_SETTINGS`.
- **Media Assets:** Photos and receipts upload directly to `My Drive/Sheet2Vault Media/` via Google Drive API v3 under the narrowed `drive.file` scope. The resulting Google Drive URLs are written into columns `L` (`photo_url`), `M` (`serial_url`), and `N` (`receipt_url`).
- **Ambient Sync:** Routine row edits and photo syncs display quietly in the masthead `<AmbientSyncIndicator />` (`Saving...` $\rightarrow$ `Saved`).

### 3.3 Theme & Style Adaptability
- Adheres to the Sheet2Suite Monarch Design System:
  - Masthead: Editorial serif (`Newsreader`).
  - Interface: Clean sans (`Inter`).
  - Numerals: Tabular monospace (`Geist Mono` / `JetBrains Mono` with `tnum` and `zero`).
  - Low-radius discipline (`rounded-[3px]`, hairline $1\text{px}$ borders, zero bulky shadows).
- Full contrast compliance across Editorial Light, Editorial Dark, and Botanical Romance.

---

## 4. Edge Cases & Error Handling

| Scenario / Edge Case | Expected System Behavior | Fallback / UI Feedback |
|---|---|---|
| **Expired Google OAuth Session (401)** | Silent refresh via `/api/auth/refresh`. | If refresh fails, show session restore modal preserving in-flight photo capture draft in localStorage. |
| **Offline Room Sweep (No Connectivity)** | PWA Service Worker caches captured images and metadata in IndexedDB. | Ambient sync indicator displays "Offline — Changes queued". Autosyncs upon network restoration. |
| **Missing Google Drive Media Folder** | Automatically create `Sheet2Vault Media` folder in user's Drive. | Save newly created folder ID in `VAULT_SETTINGS` tab. |
| **Camera Access Denied on Mobile** | Prompt user to enable camera permissions in browser settings. | Graceful fallback to native `<input type="file" accept="image/*">` file picker. |
| **Extreme Viewports ($\le 360\text{px}$)** | Stack controls vertically; prevent horizontal scrollbars; wrap metric strip. | Safe-area padding `env(safe-area-inset-bottom)`. |

---

## 5. Strict Acceptance Criteria

- [ ] **AC-1:** User can complete the 3-step `<VaultSetupPlugin />` during `/activate` to initialize a new Sheet2Vault spreadsheet with custom rooms and policy limits.
- [ ] **AC-2:** Mobile Room Sweep allows capturing an item with photo, title, room, category, and optional serial tag/receipt in $< 30$ seconds.
- [ ] **AC-3:** Photos and receipts upload to the user's private Google Drive folder (`Sheet2Vault Media`) and record valid URLs in `VAULT_ITEMS`.
- [ ] **AC-4:** Monarch metric strip calculates Total Replacement Value, Claim Readiness %, and triggers amber alerts when a category exceeds its configured sub-limit.
- [ ] **AC-5:** User can generate an Insurance Claim Dossier PDF containing incident details, itemized replacement values, and embedded photo/receipt plates.
- [ ] **AC-6:** User can generate a tokenized, read-only Adjuster Web Portal link (`/vault/claim/[token]`) protected by HMAC-SHA256 signature.
- [ ] **AC-7:** User can export a Police Stolen Goods Ledger formatted specifically for law enforcement with prominent serial numbers and distinguishing marks.
- [ ] **AC-8:** All mobile inputs enforce $16\text{px}$ font, $\ge 44\text{px}$ tap hitboxes, and `CellGuard` protects formulas (`=IF(...)`, `=SUM(...)`).
- [ ] **AC-9:** Verification passes cleanly with `npm run spec:validate`, `npm run build`, and `npm run lint`.

---

## 6. Explicit Non-Goals (Scope Guardrails)

- **Non-Goal 1: Home Maintenance Tracking:** No maintenance task logs, HVAC filter reminders, contractor directories, or paint swatch catalogs. Those belong in a future dedicated sibling product (`Sheet2Home`).
- **Non-Goal 2: Automated Scraping of Resale Markets:** No live dynamic pricing scrapers (eBay, StockX, Chrono24) in MVP; valuations rely on purchase price, user replacement estimates, or receipt values.
- **Non-Goal 3: Proprietary Cloud Media Hosting:** No photos or documents stored in proprietary databases; 100% of media resides in the user's personal Google Drive.
