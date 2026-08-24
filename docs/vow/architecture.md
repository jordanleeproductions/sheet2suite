# Sheet2Vow Application Architecture

## 1. Overview
Sheet2Vow is a Next.js (App Router) & TypeScript web application designed for comprehensive wedding planning. It serves as a modern interactive UI canvas connected directly to a private Master Google Spreadsheet in the user's personal Google Drive via the Google Sheets API v4.

---

## 2. Core Technologies
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI & State:** React 19, Client-side state hooks (`useState`, `useEffect`), Local-first persistence (`localStorage`)
- **Backend & APIs:** Next.js Server Route Handlers (`src/app/api/`)
- **Cloud Integrations:** Google Sheets API v4, Google Drive API v3, iTunes Search API
- **Styling:** Vanilla CSS Custom Property Tokens (`theme.css`, `globals.css`) supporting 4 design styles with light & dark modes.

---

## 3. Data & Sync Architecture

### 3.1 Bi-Directional Google Sheets Sync Engine
All application state maps 1:1 to a 15-tab Master Wedding Spreadsheet in Google Drive:
- **`GET /api/sync?spreadsheetId=...`**: Fetches and parses all 10 active data tabs into typed domain models (`Guest[]`, `BudgetItem[]`, `Vendor[]`, `Task[]`, `Song[]`, etc.).
- **`POST /api/sync`**: Serializes modified domain objects back into spreadsheet row arrays with formula protection via `CellGuard`.
- **Relational Integrity (`relationalSync.ts`)**: Automatically syncs cascading changes across tabs (e.g. updating table names in `TABLES` updates assigned guests in `GUESTS`).

### 3.2 CellGuard Formula Preservation
To prevent overwriting spreadsheet formulas (such as `=SUM(...)`, `=COUNTA(...)`), `CellGuard` preserves formula strings during writebacks, ensuring spreadsheet calculations remain intact.

---

## 4. Frontend Component Hierarchy

```text
src/app/vow/page.tsx (Sheet2Vow Dashboard Controller)
├── Navigation Shell
│   ├── Desktop Sidebar (64px collapsed / 220px expanded)
│   ├── Top Header Bar (Wedding Title, Countdown, Quick Settings)
│   └── Mobile Ergonomic Bottom Tab Bar & Swipe-Up Categorized Drawer
│
├── Feature Manager Modules (src/components/)
│   ├── DashboardMetrics.tsx        <-- Overview KPI cards, meters & vendor share status
│   ├── GuestListManager.tsx        <-- Guest registry, RSVP quick toggles, catering filters
│   ├── SeatingChartManager.tsx     <-- Drag-and-drop floorplan & ceremony aisle planner
│   ├── BudgetLedgerManager.tsx     <-- Target caps, category ledger & payment status
│   ├── TimelineManager.tsx         <-- Day-of itinerary timeline & responsibilities
│   ├── VendorManager.tsx           <-- Vendor directory, contract Drive uploads & payments
│   ├── KanbanBoard.tsx             <-- Stage-based task board (To Do, In Progress, Done)
│   ├── MusicManager.tsx            <-- Playlists, iTunes previews, DJ export & live request queue
│   ├── PhotoShotListManager.tsx    <-- Photo shot list, VIP people & priority tagging
│   └── GiftRegistryManager.tsx     <-- Gift tracking, amounts & thank-you status
│
└── Modals & Subsystems
    ├── AdvancedSettingsModal.tsx   <-- Event settings, Drive inspector, co-planning roster
    ├── PrintTemplatesModal.tsx     <-- Place cards, table cards, timeline & Canva CSV exporter
    └── VowSetupWizard.tsx          <-- 5-step guided onboarding wizard
```

---

## 5. Security & Access Control Architecture
- **Tokenized Public Portals:**
  - `/request-song/[token]` — Guest song request portal with live iTunes preview search.
  - `/upload/[token]` — Guest photo & video upload portal to Google Drive.
  - `/share/[token]` — Read-only vendor coordination portal (DJ playlist, photographer shot list).
- **Spouse & Partner Co-Planning (`/api/share/partner`, `[SHARE-4]`):**
  - Delegates Google Drive `writer` or `reader` permissions with zero-cost native Google Drive email notifications.
  - Strictly caps co-planners at a maximum of 2 additional accounts per workspace.
