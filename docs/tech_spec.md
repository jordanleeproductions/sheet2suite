# Sheet2Suite & Sheet2Vow - Technical Specification

## 1. Multi-Product Platform Architecture Overview

Sheet2Suite is the parent digital canvas application platform residing on **`sheet2suite.com`**, built on **Next.js (App Router)** and **TypeScript**. Sheet2Suite powers a family of domain-specific productivity applications (sub-products / features) that map directly to private Google Spreadsheets in the user's Google Drive via the Google Sheets API v4 with zero vendor lock-in.

```
                                  ┌──────────────────────────────────────────────┐
                                  │             SHEET2SUITE PLATFORM             │
                                  │               sheet2suite.com                │
                                  └──────────────────────┬───────────────────────┘
                                                         │
             ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
             │                                                                                       │
             ▼                                                                                       ▼
┌──────────────────────────────────────────┐                               ┌──────────────────────────────────────────┐
│        GENERIC ACTIVATION ENGINE         │                               │     SUB-PRODUCTS / DIGITAL CANVASES      │
│         activate.sheet2suite.com         │                               │                                          │
│                                          │                               │ 💍 Sheet2Vow (vow.sheet2suite.com)       │
│ 1. License & Order Validation            │                               │ 🏗️ Sheet2Build (build.sheet2suite.com)   │
│ 2. Google OAuth & Drive Selection        ├─────────── Provisions ───────►│ 💰 Sheet2Finance (finance.sheet2suite...) │
│ 3. Feature Setup Plugin Injection        │      Directly into User Drive │ 🏡 Sheet2Home (home.sheet2suite.com)     │
│ 4. Automated Spreadsheet Template Copy   │                               │ 🏋️ Sheet2Fit (fit.sheet2suite.com)       │
└──────────────────────────────────────────┘                               └──────────────────────────────────────────┘
```

### 1.1 Architectural Guarantees & Developer Experience
- **Zero Rebuild for New Products:** Adding a new sub-product (e.g., *Sheet2Build*, *Sheet2Fit*) does NOT require rebuilding authentication, Google Drive integration, licensing, provisioning, theme engines, or layout shells.
- **Generic Activation Framework:** A single, unified activation pipeline (`/activate` / `activate.sheet2suite.com`) handles order verification, Google OAuth, target Drive directory resolution, and Drive spreadsheet provisioning for all products.
- **Pluggable Feature Setup Modules:** Setup wizards are modular plugins injected into Step 3 of the Activation pipeline. Each product exposes a standard `<ProductSetupPlugin />` interface supplying product-specific onboarding questions (e.g. Wedding Date & Couple Names for Sheet2Vow vs Project Milestones & Trade Categories for Sheet2Build).
- **Subdomain & Path Parity (`src/proxy.ts`):** Dynamic subdomain routing engine mapping `{product}.sheet2suite.com` and `sheet2suite.com/{product}` seamlessly to corresponding app routes.

---

## 2. Core Modules & Component Architecture

### 2.1 Navigation & Shell (`src/app/vow/page.tsx` & `AdvancedSettingsModal.tsx`)
- **Multi-Theme Aesthetic Engine:** Currently supports **Editorial Minimalist** (serif typography, subtle warm tones) and **Muted Neo-Brutalism** (3px slate borders, hard directional drop shadows, `Geist Mono` typography), with **Botanical Romance**, **Midnight Tuxedo**, and **Retro Cyberpunk** planned for Phase 2 expansion.
- **Desktop Navigation Switcher (`navLayout: 'sidebar' | 'top'`):** Supports sticky collapsible left-hand sidebar navigation (with 64px collapsed icon-only vs 220px expanded labels) as well as classic top header navigation bar.
- **Mobile Ergonomic Thumb-Zone Navigation (`[NAV-MOBILE-THUMB]`, `[NAV-SWIPE]`, `[NAV-HAPTIC]`):**
  - **Persistent Glassmorphism Bottom Tab Bar:** Fixed to the bottom viewport on mobile screens ($\le 768\text{px}$) offering 1-tap thumb access to the 4 core daily modules (*Summary*, *Guests*, *Budget*, *Timeline*) plus an active **`MORE (☰)`** trigger button with live active dot indicators.
  - **Categorized Bottom Sheet Action Drawer (`[NAV-MOBILE-DRAWER]`):** Tapping *More* or the header menu button slides up a full-width bottom sheet drawer from the bottom of the screen (within natural thumb reach) featuring a drag handle, 3 organized module clusters (*Core Planning*, *Media & Experience*, *Export & Quick Tools*), and quick access actions (*Print Studio*, *Share Link*, *Settings*).
  - **Touch Gestures (`[NAV-SWIPE]`):** Touch event listeners on the mobile bottom tab bar detect swipe-up gestures ($\ge 35\text{px}$) to reveal the categorized module drawer, while swipe-down gestures on the drawer drag handle / header dismiss it smoothly.
  - **Micro-Haptic Feedback (`[NAV-HAPTIC]`):** Native `navigator.vibrate(10-15ms)` touch feedback triggered on tab selections, drawer open/close transitions, and theme selector toggles.
  - **Safe Bottom Padding:** Automatically applies `padding-bottom: 5.5rem` on mobile viewports to prevent content clipping behind the fixed floating tab bar.
  - **Standardized Mobile Floating Action Button (FAB) Architecture (`[MOBILE-FAB-ACTIONS]`):** Fixed circular 56px action button (`rounded-full`, elevated drop-shadow, active scale `0.92`, `z-index: 100`) pinned at `bottom: 5.125rem` and `right: 1.25rem`, hovering cleanly above the 62px mobile bottom tab bar across vertical scroll positions. Standard in-page "Add" buttons are hidden on mobile viewports ($\le 768\text{px}$) and delegated to the FAB across all 10 core views (with dual Speed-Dial options on Budget Ledger).
  - **Incremental App Version & Deployment Timestamp Indicator (`AppVersionBadge.tsx`):** Displays semantic app version (`v1.2.1`) with an active green status dot and exact deployment date-time (`Deployed Sep 11, 2026 • 3:32 PM`) at the bottom of both the desktop sticky sidebar (compact tooltip icon when collapsed) and the mobile slide-up module drawer, injected dynamically via Next.js build-time environment variables (`NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_BUILD_TIMESTAMP`).
- **Streamlined Quick Settings Dropdown:** Header settings icon triggers a lightweight dropdown for fast visual tweaks: Design Style (`Editorial` vs `Neo-Brutalism`), Color Mode (`Light` vs `Dark`), Primary Accent Color picker, and a direct launch button for **`ADVANCED SETTINGS`**.
- **Advanced Settings & Configuration Portal (`AdvancedSettingsModal.tsx`):**
  - 💒 **Wedding Details & Location:** Edit Wedding Title, Event Date (with live countdown sync), Venue/Location details, and Total Target Budget (synced to `Settings!B2:B3`).
  - 📁 **Drive & Data Source Inspector:** Displays Google Spreadsheet ID, direct link to open Google Sheet, and Drive folder path (`My Drive/Wedding Planning`).
  - ⚙️ **Feature Module Controls:** Toggle active tabs (*Guest Registry*, *Seating Chart*, *Budget Ledger*, *Day-Of Timeline*, *Vendor Directory*, *Kanban Checklist*, *Music Playlist*, *Photo Shot List*, *Thank You Tracker*). Disabled modules automatically hide from navbar and summary dashboard.
  - 🛡️ **Security & Access Control:** Read-only vendor portal summary, spouse/partner co-planning admin invitation input (`GRANT ADMIN ACCESS` with Phase 3 Germin8 integration badge), and master workspace disconnect button.
  - 📱 **Mobile-Responsive Modal Engine:** On mobile screens ($\le 640\text{px}$), the sidebar navigation converts into a top horizontal scrollable pill bar, providing maximum reading space for settings forms.
  - 💡 **Report a Bug / Submit Feature Idea:** Interactive feedback form with prefilled diagnostic telemetry (User Agent, Spreadsheet ID) triggering support email or feedback log.

### 2.2 Summary Dashboard (`DashboardMetrics.tsx`)
- Real-time KPI summary cards (Guests, Attending Count, Total Budget, Paid Amount, Balance Owing).
- Budget allocation & seating capacity visual meters.
- **Active Vendor Share Links & Access Control Card (`VendorShareLinkManager.tsx`):** Displays generated vendor share links, active/expired/revoked status, copy/preview buttons, and individual/master link revocation controls.

### 2.3 Guest Registry (`GuestListManager.tsx`)
- RSVP status tracking (`Attending`, `Declined`, `Pending`), dietary restrictions, table assignments (persisted as canonical `tableId` linked to `TABLES` tab), plus-ones, and contact info.
- Native CSV export, printable layout, and switchable Cards vs Compact List view.
- Responsive mobile header ergonomics with dedicated full-width `+ ADD GUEST` button and quick-filter cluster grouping bar above the search input.
- Catering & Menu Setup (`MenuSetupManager.tsx`) with 2-way Google Sheets sync to the `CATERING` tab, automatic guest meal choice linkage, and human-readable sequential catalog ID generation (`M101`, `M102`, `M103`...).

### 2.4 Visual Table Seating Plan (`SeatingChartManager.tsx`)
- Multiple table shapes: **Round Circle Tables** (radial trigonometric node layout), **Rectangle Banquet Tables** (dynamic length scaling, optional head/foot end seats), **Square Tables** (4 or 8 seats on all 4 sides), and **Sweetheart / Single-Side Tables**.
- Reliable 2-way Google Sheets sync to the `TABLES` tab, filtering out blank/empty ghost rows lacking a valid `tableId`.
- Direct relational guest seating assignments mapping `guest.tableAssignment` to `tableId` with backward-compatible display resolution.
- Human-readable sequential and semantic table ID generation (`table-1`, `table-2`, `table-sweetheart`, etc.) with intelligent gap-filling and collision avoidance.
- Seat ID persistence (`seatNumber`) per guest.
- Interactive seat nodes with initials avatar, guest profile popups (featuring meal choice display above dietary restrictions and friendly table name unassignment), and unassigned guest drawer.
- **Declined RSVP Seating Exclusion (`[SEAT-DECLINED-EXCLUSION]`):** Seated Guests KPI card (`seatedGuestsCount / eligibleSeatingGuests.length`) and Unassigned Guests KPI counter strictly account for guests with Accepted (Attending) or Pending RSVP. Declined guests are excluded from the seating totals, unassigned counts, and the unassigned guest drawer.
- **Table Card Visuals & Numbering Offset (`[SEAT-SHAPE-COLOR-AND-SWEETHEART-NUMBERING-OFFSET]`):** Table shape icons match the Table Name color (`var(--color-text, currentColor)`). `getNextSuggestedTableNumber` recognizes Sweetheart and Head tables, subtracting 1 so that the first table after Sweetheart/Head defaults to "Table 1" rather than "Table 2".
- Navigation button uses dedicated chair icon (`Armchair`) across mobile drawer, sidebar, and module selectors.

### 2.5 Budget Ledger (`BudgetLedgerManager.tsx`)
- Itemized financial ledger (Estimated vs Actual Cost vs Amount Paid vs Balance Owing).
- Payment status tags (`Paid`, `Pending`, `Overdue`) and category over-budget alerts.
- **Modernized Financial Terminology (`[FINANCIALS-TERMINOLOGY-MODERNIZATION]`):** Replaced legacy terms `CAP`, `OUTLAY`, and `CUSHION` with universally recognized consumer finance standards: **`BUDGET`** (target allocation), **`SPENT`** (actual outlay/paid), and **`REMAINING`** (available balance).
- **Interactive In-App Category Budget Management (`[FINANCIALS-EDIT-DELETE-CATEGORY-BUDGET]`):**
  - **Desktop Master Rail**: Quick inline actions (`Edit2` and `Trash2`) on category cards to adjust target budget amounts or delete category budgets, with a `+ Set Budget` trigger for unbudgeted categories.
  - **Mobile Bottom Sheet**: Interactive `CATEGORY BUDGET ALLOCATION` card with touch-friendly `Edit` and `Delete` buttons, plus `+ SET BUDGET` prompt for unallocated categories.
- **Dual-Mode Budget Progress Visualizer (`[FINANCIALS-UTILIZATION-DONUT-TOGGLE]`):**
  - Segmented toggle supporting **`BAR`** (linear multi-state progress bar) and **`DONUT`** (interactive SVG circular gauge with center utilization percentage and colored status arc).
  - Remembers user preference in `localStorage` (`'s2v_budget_meter_mode'`).
  - Clear descriptive balance summary positioned directly under the visualizer (`$X spent of $Y target budget · $Z remaining available` or over-budget warning).
- **Desktop Master-Detail Split-View (`[FINANCIALS-MASTER-DETAIL-VIEW]`):**
  - **Responsive Shell**: On screens `< lg` (<1024px), maintains existing stacked view (budget cards/table above expenses ledger). On screens `>= lg`, transitions to a two-column grid (`lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start`).
  - **Master Rail (Left Column - ~5 cols / `lg:col-span-5`)**: Scrollable category budget list bounded to viewport (`lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2`) prioritized by active/alert allocations. Features prominent active selection highlighting (`selectedCategoryId`), serif category titles, mini utilization progress tracks, and BUDGET / SPENT / REMAINING tabular metrics. Clicking any card updates selection.
  - **Detail Ledger (Right Column - ~7 cols / `lg:col-span-7`)**: Dynamic Category Snapshot header displaying Target Allocation Budget, Total Expenses Logged, and Remaining Balance (`Target - Sum(Expenses)`), paired with an inline `+ ADD EXPENSE` action button pre-populating `category = selectedCategoryId`. Renders the itemized expenses table filtered strictly to the selected category, with empty-state guidance for categories without logged items. Full dynamic recalculation updates category cards and the global progress meter immediately upon adding, editing, or deleting expenses.
  - **Desktop Compact Active/Alert Filter Pills**: Replaces the large 20+ item chip cloud on desktop with a compact horizontal pill list showing only categories with activity or over-budget alerts.
- **6-Column Category Budget Schema & Formula Linkage (`[BUDGET-SCHEMA-MODERNIZATION-6COL]`):** Streamlines the Google Sheet `BUDGET` tab into a 6-column allocation table (`Category ID`, `Category`, `Target Budget`, `Total Spent`, `Remaining`, `Notes`), eliminating redundant vendor/due date columns and supporting live `=SUMIF` expense calculations and open-text custom categories.

### 2.6 Day-Of Timeline (`TimelineManager.tsx`)
- Day-Of itinerary timeline with "UP NEXT" active moment banner ticker.
- Filter by responsibility (*Bridal Party*, *Catering*, *Photography*, *Guests*) and late-night tracking (`🌙 +1 DAY`).

### 2.7 Vendor Directory (`VendorManager.tsx`)
- Vendor contact directory, categories, contract values, deposit paid, and staff meal requirements.
- **Relational Category Combobox (`[VND-8]`):** Vendor Category input integrates an interactive combobox populated from standard budget presets (`STANDARD_VENDOR_CATEGORIES`) and existing categories across `budget`, `vendors`, and `expenses`, while allowing instant freeform typing of custom categories.
- **Auto-Calculated Real-Time Balance Owing:** Real-time formula `Math.max(0, Contract Value - Deposit Paid)` updates dynamically upon contract or deposit changes; rendered as a read-only auto-calculated input in the modal.
- **Cross-Tab Budget Category Target Sync:** Checks for an existing category entry in `budget`. If absent, initializes a category budget target allocation with the vendor's Contract Value (`estimatedCost`). If present with a `$0` target, updates it to the Contract Value.
- **Deposit Paid Logged as Expense:** Automatically logs/updates a linked `ExpenseItem` (`EXP-V-${vendorId}`) in the `expenses` tab when `depositPaid > 0`, categorized under the vendor's category with purchase date, amount, and notes. Cleans up linked deposit expense upon deposit reduction to 0 or vendor deletion.
- **Vendor Contract Document Storage (`[VND-6]` - Backlog):** Integrated PDF/image contract uploader in Add/Edit Vendor modal. Automatically uploads attachments to a dedicated `Contracts` subfolder inside the couple's selected Google Drive workspace folder and links the Drive URL to the vendor entry.

### 2.8 Kanban Checklist (`KanbanBoard.tsx`)
- Categorized checklist (*To Do*, *In Progress*, *Done*) with priority badges, target due dates, and isolated 1-click stage advancement arrows without triggering the card edit modal.
- **Interactive Category & Assignee Combobox (`[TASK-CATEGORY-COMBOBOX]`):** Add/Edit Task modal features an interactive Combobox with a visible chevron dropdown button (`ChevronDown`). Displays all existing categories and assignees in a scrollable, search-filtered menu while preserving 100% free-text typing and overwrite ability for custom inputs.
- **Overdue Task Due Date Highlighting (`[TASK-OVERDUE-RED-HIGHLIGHT]`):** Tasks in `To Do` or `In Progress` whose due dates are in the past render their due date font and calendar icon in a distinct red (`var(--color-red, #ef4444)`) with font weight `600`, providing instant visual prioritization of overdue items. Add/Edit modal similarly displays a `PAST DUE` red badge and border.
- **Unified MM/DD/YYYY Due Date Presentation (`[TASK-DUE-DATE-FORMAT-MMDDYYYY]`):** Standardizes all task card due date displays to `MM/DD/YYYY` format regardless of underlying Google Sheet format (ISO or US), avoiding mixed visual representations.
- **Category Dropdown Filter with 'General' Fallback (`[TASK-CATEGORY-FILTER-DROPDOWN]`):** Header controls feature an interactive Category `<select>` dropdown displaying all active categories with live task counts. Default tasks lacking an explicit category are categorized under **`General`**. Supports clearing back to `"ALL CATEGORIES"` and provides an instantaneous 1-click `RESET` button when filtered. Columns, mobile stage tabs, empty state notices, and progress metrics update dynamically based on the selected category, and newly added tasks inherit the active category filter automatically.
- **Dedicated Controls Toolbar & Header Separation (`[TASK-DESKTOP-HEADER-TOOLBAR-SEPARATION]`):** Separates the page title and description into an uncrowded full-width header block, with Category dropdown, Sort controls, and Add Task button housed on a dedicated full-width toolbar row below it, eliminating cramped multi-line stacking when browser windows or desktop screens are shrunk.

### 2.9 Wedding Playlist & Music (`MusicManager.tsx`)
- Categorized music tracks (*Ceremony*, *Reception*, *First Dance*, *Must Play*, *Banned / Do Not Play*).
- Live 30-second iTunes audio preview player, Spotify/YouTube search buttons, and **`EMAIL LIST`** DJ email generator (`mailto:`).

### 2.11 Admin Song Request Approval Queue & DJ Gating (`[MUSIC-4]`)
- **Automated Request Gating:** Incoming guest song requests (`/api/request-song/[token]`) default to `approvalStatus: 'Pending Approval'` (or `Banned` if matching a Banned track).
- **Admin Approval Queue:** Displays a Pending Requests Banner in `MusicManager.tsx` with quick inline action buttons (`Approve ✓`, `Decline ✗`) and `PENDING APPROVAL` filter pills.
- **DJ Status Filtering:** Tokenized DJ Share portal (`/share/[token]`) status filter pills (`ALL ACTIVE TRACKS`, `APPROVED ONLY`, `PENDING APPROVAL`, `BANNED TRACKS`), automatically hiding Banned songs from the active playlist.

### 2.10 Photography Shot List (`PhotoShotListManager.tsx`)
- Required photography moments (`Shot ID`, `Description`, `Location`, `Shot Time`, `Included People`, `Status`, `Priority`, `Notes`).
- Priority levels support photographer-friendly enums (`Must Have`, `Nice To Have`, `Optional`) in the UI, bi-directionally translated to Google Sheets `SETTINGS!$E$2:$E$50` Priority Levels (`High`, `Medium`, `Low`).
- Interactive `Captured` vs `Pending` checkoff toggles and **`EMAIL LIST`** photographer email generator (`mailto:`).
- **Responsive Mobile Segmented View Switcher (`[PHOTO-MOBILE-BALANCED-TABS]`):** 2-column balanced grid (`50% / 50%`) on mobile screens (`< 640px`) featuring shortened labels (`SHOT LIST` and `GUESTBOOK`) with dynamic count badges, completely eliminating horizontal scrolling and layout overflow.

### 2.12 Print & Export Studio (`PrintTemplatesModal.tsx`)
- 🖨️ **Print Studio Launcher:** Header action button (`Printer` icon) and contextual module triggers opening the Print Studio portal.
- 🎟️ **Escort & Folded Place Cards Template:** 2-column grid layout for attending guests displaying Guest Name, Table Assignment, Meal Selection icon, and optional crop/fold guidelines. Filterable by Table.
- 🍽️ **Table Tent Cards Template:** Table number display signs featuring Table Name, seat count, and assigned guest list with meal choices. Filterable by Table.
- 🕒 **Day-Of Timeline Roster Template:** High-contrast chronological schedule grouped by time block, filterable by responsibility role (*All*, *Bridal Party*, *Catering*, *Photography*, *Coordinators*).
- 📋 **Emergency Vendor Contact Directory Template:** Single-page emergency vendor contact sheet listing Category, Business Name, Contact Person, Phone, Email, and Arrival/Setup notes. Filterable by Category.
- 🖨️ **CSS `@media print` Engine:** High-performance `@media print` rules injecting `@page { size: A4 portrait; margin: 12mm; }` and isolating `#print-studio-paper-content` while hiding all app UI elements.

### 2.13 Relational RSVP Sync Engine & Intelligent Seating Priority (`relationalSync.ts`)
- **Real-Time Relational Analytics (`calculateRelationalCateringSummary`):** Calculates attending vs total invited ratios, dynamic meal choice totals (`🥩 Beef`, `🍗 Chicken`, `🐟 Fish`, `🌱 Vegan`), and dietary restriction drawers with matching guest names and table numbers.
- **Seating Floorplan Guardrails:** Computes table capacity utilization and triggers `NORMAL`, `FULL`, and `OVER CAPACITY ⚠️` visual alert badges on seating floorplan cards whenever seat allocations exceed table limits.
- **3-Tier Intelligent Seat Assignment Priority (`SeatingChartManager.tsx`):** Ranks guest selection list when populating table seats: (1) Unassigned guests matching seated `partyGroup` names (`🎉 SAME PARTY GROUP`), (2) All unassigned guests (`UNASSIGNED`), and (3) Already assigned guests for re-assignment.
- **Ceremony Row & Aisle Seating Engine (`[SEAT-4]`):** Dual-side aisle seating planner calculating required seats for `Attending + Pending` guests (excluding `Declined`), customizable row count & chairs per row, central aisle runner visual, interactive seat placement, and responsive mobile dual-card layout splitting left/right sides onto dedicated cards.
- **Visual Table Diagrams & Numbered Coordinator Seat Maps (`[SEAT-5]`):** Dynamic SVG/CSS table shape rendering on printable Table Tent Cards (`PrintTemplatesModal.tsx`), projecting numbered seat nodes (`#1`, `#2`, `#3`...) matching assigned guest roster items for day-of venue setup.

### 2.14 Thank You Tracker & Gift Log (`ThankYouManager.tsx`)
- Received gifts and thank you card status tracking (`Gift ID`, `Sender/Guest Name`, `Gift Description`, `Value`, `Thank You Note Sent Status`).
- **Couple / Bride & Groom Attendance Exclusion (`[THANKS-COUPLE-ATTENDANCE-EXCLUSION]`):** Attendance cards and pending/sent thank-you metrics strictly filter out the Bride & Groom / Couple party records (identifying party names, Sweetheart/Head table assignments, or couple first names from `weddingName`), keeping the thank-you checklist 100% focused on guests.

---

## 4. Native Sheet2Suite License & Entitlement Architecture

### 4.1 Ecosystem Licensing Model
Sheet2Suite operates a unified, autonomous entitlement database (`activate.sheet2suite.com` / `/api/verify-order`). License validation is self-contained within the Sheet2Suite product ecosystem, providing instant activation without external system hops.

### 4.2 License Schema & Partner Co-Planning Validation
- **Single Master License Key:** Unlocks purchased products (`Sheet2Vow`, `Sheet2Home`, `Sheet2Finance`, or `Sheet2Suite Bundle`).
- **Spouse / Partner Co-Planning Access (`coPlanner`):** Tracks primary buyer email alongside partner/spouse email (`coPlanner.partnerEmail`), allowing dual-household Google OAuth validation across separate devices.
- **Product Telemetry & Usage Metrics:** Captures active workspace counts, wedding size scale (`totalGuestsCount`), portal adoption metrics (*Vendor Share Links, Song Requests, Photo Uploads*), and event date lifecycle triggers for automated post-wedding **Sheet2Finance** and **Sheet2Home** product transitions.

To provide external vendors (DJs, Photographers, Coordinators, Caterers) with secure, mobile-optimized, read-only portals without forcing them to sign into Google Workspace or access confidential data:

```
                  ┌─────────────────────────────────────────────────┐
                  │ Couple / Admin Dashboard (Sheet2Vow)             │
                  │ Clicks "Generate Vendor Share Link"             │
                  └────────────────────────┬────────────────────────┘
                                           │
                                           ▼
                  ┌─────────────────────────────────────────────────┐
                  │ Token Engine (src/lib/share/token.ts)           │
                  │ HMAC-SHA256 Signed JWT Token Generation         │
                  │ Payload: { spreadsheetId, scope, exp, version } │
                  └────────────────────────┬────────────────────────┘
                                           │
                                           ▼
                  ┌─────────────────────────────────────────────────┐
                  │ Public Share Link: /share/[token]               │
                  └────────────────────────┬────────────────────────┘
                                           │
                                           ▼
                  ┌─────────────────────────────────────────────────┐
                  │ Backend Sanitization Proxy (/api/share/[token]) │
                  │ 1. Verifies HMAC-SHA256 Signature               │
                  │ 2. Verifies Expiration & Share Version Salt     │
                  │ 3. Fetches target Google Sheet tabs             │
                  │ 4. Strips Budget, Addresses, & Private Notes    │
                  └────────────────────────┬────────────────────────┘
                                           │
                                           ▼
                  ┌─────────────────────────────────────────────────┐
                  │ Mobile-First Vendor View (/share/[token]/page) │
                  │ Rendered scope: Music, Photos, Timeline,        │
                  │ Catering, or Full Vendor Hub                    │
                  └─────────────────────────────────────────────────┘
```

### 3.1 Token Cryptography (`src/lib/share/token.ts`)
- **Algorithm:** Signed `HMAC-SHA256` token payload containing `{ spreadsheetId, scope, weddingName, folderId?, folderName?, folderPath?, shareVersion, exp }`.
- **Scopes:**
  - `'music'`: DJ / Band Playlist & Banned tracks.
  - `'photos'`: Photographer Shot List & posing notes.
  - `'timeline'`: Day-Of Schedule & responsibility moments.
  - `'catering'`: Attending headcount, dietary restrictions breakdown, and table seating capacity.
  - `'vendor_hub'`: All-in-one vendor portal hub with tab navigation.
  - `'guest_upload'`: Guest photo/video upload portal (`/upload/[token]`) routing uploads directly into couple's designated Drive folder (e.g. `My Drive/Wedding Planning/Guest Uploads`).
  - `'guest_song_request'`: Guest live song request portal (`/request-song/[token]`) appending requested tracks to `Music!A:E` for live DJ view sync.

### 3.2 Data Sanitization Proxy (`src/app/api/share/[token]/route.ts`)
- Verifies token signature and expiration. Any tampered token produces an immediate `401 Unauthorized` response.
- Fetches Google Sheet tabs server-side and strips out confidential information (Budget Ledger items, guest mailing addresses, phone numbers, private notes) before returning sanitized JSON.

### 3.3 Mobile-First Vendor Page (`src/app/share/[token]/page.tsx`)
- High-contrast, standalone vendor page optimized for mobile phones and tablet viewports at wedding venues.
- **🖨️ PDF & Print Export Engine:** Built-in `PRINT / EXPORT PDF` header button with `@media print` CSS rules, cleanly formatting the vendor view into printable PDF documents without navigation buttons, theme toggles, or background clutter.
- **🎵 Music Page Quick Filters & Sorting:** Quick filter pills (`ALL SONGS`, `REQUESTED SONGS`, `BANNED MUSIC`). Default view automatically sorts Banned / Do Not Play tracks to the bottom of the list.
- **🍽️ Catering & Meal Choice Breakdown:** Displays aggregate headcount, **Guest Meal Choice Totals** (`Filet Mignon`, `Pan-Seared Salmon`, `Vegan Risotto`, `Kids Tenders`), and **Interactive Dietary Restriction Drawers** which expand to list matching guest names, meal choices, and table numbers.

### 3.4 Admin Link Confirmation & Access Control (`ShareModal.tsx` & `VendorShareLinkManager.tsx`)
- **Draft Link Confirmation Workflow:** Generated share links remain in draft mode until the couple explicitly clicks **`CONFIRM SHARE LINK`**. Clicking **`CANCEL`** or closing the modal invalidates and discards the token.
- **Master & Individual Revocation:** Configuration JSON stored in cell **`Settings!B2`** includes `shareVersion`. Clicking **"Revoke All Shared Links"** in Settings increments `shareVersion` in `Settings!B2`. Old tokens generated with previous versions are instantly rejected by the backend proxy.
- **Collapsible Revoked & Expired Links Section:** In the dashboard's Access Control card (`VendorShareLinkManager.tsx`), revoked and expired links are tucked away in a collapsible accordion (`SHOW REVOKED & EXPIRED LINKS`), keeping the main active dashboard uncluttered while allowing couples to view preview links or clear revoked history.

### 3.5 Guest Photo & Video Upload Portal & Drive Folder Setup (`/upload/[token]` & `PhotoShotListManager.tsx`)
- **Direct-to-Drive Guest Upload Portal (`/upload/[token]/page.tsx`):** Standalone mobile-optimized web portal where wedding guests scan reception QR codes or follow a shortlink to upload photos and videos directly from their mobile camera roll or live camera without signing in or installing apps.
- **Strict File Format Validation:** Server and client enforce photo & video formats (`image/*`, `video/*`, JPG, PNG, HEIC, MP4, MOV, etc.) rejecting unsupported document formats.
- **In-App Portal Setup (`PhotoShotListManager.tsx`):** Accessible via the `📸 GUEST UPLOADS` header button in the Photography Shot List. Allows couples to:
  - Select or create any Google Drive folder for upload storage using `GoogleDrivePickerModal.tsx`.
  - Set access expiration duration (`7d`, `14d`, `30d`, `60d`, `90d` recommended, `180d`, `365d`, or permanent / no expiration).
  - Copy live link (`${origin}/upload/${token}`) and generate printable high-res QR codes for table place cards.
  - Automatically persists chosen settings to `localStorage` and the couple's active link registry.

### 3.6 Guest Song Request Portal & DJ Live Sync (`/request-song/[token]` & `src/app/api/request-song/[token]/route.ts`)
- **Public Mobile Song Request Portal (`/request-song/[token]/page.tsx`):** Tokenized song request page featuring real-time iTunes Search API auto-complete, 30-second audio previews, manual song entry fallback, requester name input, and special dedications for the DJ.
- **Backend Song Request API Proxy (`/api/request-song/[token]/route.ts`):** Validates HMAC-SHA256 token signature (`scope: 'guest_song_request'`) and appends requested songs directly to `Music!A:E` (`listType: 'Play List'`).
- **Live DJ Vendor Sync (`/share/[token]/page.tsx`):** Instantly displays requested songs under the `REQUESTED SONGS` filter pill in the DJ's live read-only vendor view.
- **Printable QR Code Tent Cards:** Integrated in `VendorShareLinkManager.tsx` and `PrintTemplatesModal.tsx` (`song_request_qr_cards`) to print bar and DJ booth tent cards.

### 3.7 Google Drive Native Picker & Hierarchy Resolution (`/api/drive/resolve-path`)
- **Native Google Picker API Integration (`src/lib/google/googlePicker.ts`):** Directly interfaces with Google's native `google.picker.PickerBuilder` allowing users to select target directories from their personal Google Drive without granting broad root permissions.
- **Parent Hierarchy Path Resolution (`/api/drive/resolve-path`):** Server-side endpoint traversing parent folder chains (`drive.files.get({ fields: 'id, name, parents' })`) to reconstruct the full breadcrumb directory string (e.g., `My Drive / DEVELOPMENT / Sheet2Vow`) upon folder selection.

### 3.7.1 Live Master Template Exporter & Multi-Tier Provisioning Engine (`src/lib/sheets/masterTemplateExporter.ts` & `/api/provision`)
- **Live Binary Spreadsheet Exporter:** Fetches the real-time `.xlsx` export buffer of the official Master Google Sheet (`1h_RGirRXv...`) via Google Sheets export endpoint or Service Account JWT credentials (`drive.files.export`).
- **Zero-Friction `drive.file` Scope Duplication:** Streams the exact Master Sheet binary directly into the user's selected Drive folder via `drive.files.create({ mimeType: 'application/vnd.google-apps.spreadsheet' })`, bypassing cross-tenant Google Drive API `copy` restrictions while preserving 100% of formatting, tab colors, formulas, and data validations.
- **Programmatic Fallback:** If network export is unreachable, automatically falls back to in-memory template generation (`generateMasterXlsxBuffer`).
- **Post-Provision Injection:** Updates `DASHBOARD!B2` and `'Settings'!Z1` via Sheets batch API with exact custom wedding title and budget metadata without clobbering dropdown lookup columns.

### 3.7.2 Automated Dropdown Validation Preserver (`src/lib/sheets/dropdownValidator.ts`)
- **Native Google Sheets In-Cell Dropdown Engine:** Automatically inspects table headers across all 10 tabs and applies `setDataValidation` requests with `type: 'ONE_OF_RANGE'`, `showCustomUi: true`, and userEnteredValues linking directly to the corresponding lookup range on the `'Settings'` tab (`=Settings!$A$2:$A$50`, `=Settings!$D$2:$D$50`, etc.).
- **Settings Tab Lookup Integrity:** Protects columns A–M of the `'Settings'` tab (Age Categories, Table Shapes, RSVP Statuses, Task Statuses, etc.) from configuration overwrites by relocating metadata JSON to cell `Settings!Z1`.

### 3.7.3 Hybrid Budget Architecture & Currency Parsing Sanitization (`mapper.ts`, `BudgetLedgerManager.tsx`, `/api/sync`)
- **Sanitized Float Parsing (`parseCleanNumber`):** Strips currency symbols (`$`, `£`, `€`), thousand-separator commas, and spaces before `parseFloat()`, ensuring cells formatted with Google Sheets Currency format or strings like `"$15,000.00"` never collapse to `NaN || 0`.
- **Atomic Value Rendering (`UNFORMATTED_VALUE`):** Fetches sheets values with `valueRenderOption: 'UNFORMATTED_VALUE'` in `/api/sync` so numeric values are natively parsed while text columns remain untouched.
- **Hybrid Budget Architecture (Dynamic Auto-Sum + Master Cap):**
  - **Dynamic Mode (Default)**: Total budget target automatically resolves to the live sum of all category targets (`totalEstimate`). Line item changes and new vendor contracts adjust the budget automatically.
  - **Master Cap Mode**: When an explicit limit is entered (e.g., `$35,000`), it acts as a firm ceiling. The UI computes `effectiveTarget - totalEstimate` to display either an emerald **Unallocated Cushion** badge or an amber/red **Over-Allocated** warning.
  - **1-Click Sync**: `SYNC TO CATEGORIES` allows couples to snap the master cap back to the category sum and resume dynamic tracking at any point.
- **Auto-Provisioned Settings & Dashboard Sync:** Automatically creates the `SETTINGS` sheet tab if missing before saving budget updates, and synchronizes the target budget to `localStorage` (`s2v_budget_threshold`) as a local fail-safe against network rollbacks.
- **Dynamic Prop Synchronization:** `BudgetLedgerManager` reacts dynamically to `budgetTarget` prop updates via `useEffect`, preventing unset mode locks when switching between tabs.

### 3.8 Generic Activation Pipeline & Pluggable Product Setup (`/activate`)

The Activation Engine (`src/app/activate/page.tsx` & `activate.sheet2suite.com`) is a generic, reusable suite orchestrator that activates licenses, connects Google Drive, and provisions personal Google Spreadsheets for ANY Sheet2Suite digital canvas product:

```
[ Step 0: Order Verification ]
- Accepts orderId, email, and target productCode (e.g. 'SHEET2VOW', 'SHEET2BUILD', 'MASTER_PASS').
- Verifies entitlement and resolves purchased product tier.

[ Step 1: Google OAuth Connection & Trust ]
- Connects user's personal Google Account with `drive.file` scope.
- Displays Pre-Auth Trust Card and Data Protection guarantees.

[ Step 2: Target Drive Directory Resolution ]
- Prompts user to select or create their destination Drive folder (e.g., `My Drive/Sheet2Suite/Sheet2Vow`).
- Uses Google Picker API (`openGoogleDriveNativePicker`) or in-app modal.

[ Step 3: Pluggable Product Setup Plugin (<ProductSetupPlugin />) ]
- Dynamically mounts the target product's setup wizard:
  - 💍 Sheet2Vow: `<VowSetupWizard />` (Couple Names, Wedding Date, Presets, Active Modules).
  - 🏗️ Sheet2Build: `<BuildSetupWizard />` (Project Title, Address, Milestones, Trade Contractors).
  - 💰 Sheet2Finance: `<FinanceSetupWizard />` (Fiscal Year, Accounts, Budget Categories).

[ Step 4: Automated Provisioning & Workspace Launch ]
- Calls `/api/provision` with `{ productCode, driveFolderId, customMetadata }`.
- Streams product template XLSX into user's Google Drive.
- Injects custom metadata into `Settings!Z1` and `DASHBOARD!B2`.
- Directs user to the activated digital canvas (`{product}.sheet2suite.com` or `/{product}`).
```

#### 3.8.0 Product Setup Plugin Contract (`src/lib/core/activation/pluginTypes.ts`)
```typescript
export interface ProductSetupPluginProps<TConfig = any> {
  productCode: string;
  initialData?: Partial<TConfig>;
  onComplete: (productConfig: TConfig) => void;
  onBack: () => void;
  theme?: 'light' | 'dark';
}
```

---

## 4. Modular Workspace Architecture & Directory Standards

To prevent code duplication and enable rapid addition of new digital canvas applications, the Sheet2Suite workspace adheres to a strict 3-tier modular architecture:

```
src/
├── app/                              # Next.js App Router Shells & Subdomain Entrypoints
│   ├── (suite)/                      # Main Showcase Platform (sheet2suite.com)
│   ├── activate/                     # Generic Suite Activation Engine (activate.sheet2suite.com)
│   ├── vow/                          # Sheet2Vow Digital Wedding Canvas (vow.sheet2suite.com)
│   ├── [future-app]/                 # e.g., build/ (build.sheet2suite.com), finance/, home/
│   ├── api/                          # Shared Serverless API Endpoints
│   │   ├── auth/google/              # Reusable Google OAuth Handlers
│   │   ├── verify-order/             # Generic License & Order Entitlement Engine
│   │   ├── provision/                # Universal Drive Spreadsheet Duplicator & Injector
│   │   ├── sync/                     # Bi-Directional Google Sheets Synchronization
│   │   └── drive/                    # Drive Folder Hierarchy & Native Picker Resolution
│   ├── share/[token]/                # Reusable Tokenized Vendor/Client Read-Only Portals
│   ├── upload/[token]/               # Reusable Guest/Client File & Photo Upload Portals
│   └── request-song/[token]/         # Interactive Guest Request Portals
│
├── core/ (or src/lib/core/)          # Shared Platform Engine (@germin8/sheet2-core)
│   ├── activation/                   # Generic Order Validator & Setup Plugin Registry
│   ├── auth/                         # OAuth Client, Token Refresh, Session Hydration
│   ├── drive/                        # Drive Picker, Folder Hierarchy, Google Drive API
│   ├── sheets/                       # CellGuard, Range Sync, In-Memory XLSX Engine
│   ├── theme/                        # Multi-Theme Provider, Dark Mode, Font Size Scaler
│   └── security/                     # HMAC-SHA256 Token Crypto, Rate Limiting, Input Sanitization
│
├── components/
│   ├── shared/                       # Shared Cross-App UI Primitives
│   │   ├── OfficialGoogleButton.tsx  # Google Identity Buttons & Badges
│   │   ├── GoogleDrivePickerModal.tsx# Universal Drive Directory Picker
│   │   ├── ToastNotification.tsx     # Global Floating Toast System
│   │   ├── SafetyShieldSyncBadge.tsx # Bi-Directional Sync & Status Badge
│   │   └── InfoDisclosure.tsx        # Expandable Tooltip & Diagnostic Accordion
│   └── activate/                     # Generic Activation Engine UI Components
│       ├── StepOrderVerification.tsx # Step 0 Order Form
│       └── PreAuthTrustCard.tsx      # Step 1 Trust & Privacy Card
│
└── products/ (or src/features/)      # Encapsulated Domain Product Modules
    ├── vow/                          # Sheet2Vow Product Module
    │   ├── components/               # Vow-Specific Components (GuestList, Seating, Budget, Music)
    │   ├── setup/                    # Vow Setup Wizard Plugin (<VowSetupWizard />)
    │   ├── schemas/                  # Master Wedding Sheet 14-Tab Schema Definition
    │   ├── presets/                  # Wedding Task & Style Presets
    │   └── types/                    # Vow TypeScript Models (Guest, Vendor, Song, etc.)
    │
    └── [future-product]/             # e.g., build/, finance/, fit/, property/
        ├── components/
        ├── setup/                    # Product Setup Plugin
        ├── schemas/                  # Master Product Spreadsheet Schema
        └── types/
```

#### 3.8.1 Mobile Google Drive Picker & Action Ergonomics (`src/components/GoogleDrivePickerModal.tsx`)
- **Full-Width Mobile Shortcuts:** Responsive `.preselected-shortcuts-grid` transforming 3-column desktop shortcuts into full-width touch cards on mobile screens.
- **Authentication-Gated Browse Picker:** Enforces Google OAuth connection before the Drive picker modal can be opened; displays `📁 CONNECT GOOGLE DRIVE TO BROWSE` with disabled state when unauthenticated.
- **High-Contrast Action Button Palette:** Clear visual separation between interactive action buttons (bold `#0f172a` obsidian backgrounds, 2px borders, vibrant primary buttons) and background cards/inputs.
- **Responsive In-App Drive Picker Modal:** Adapts dynamically to mobile viewports with horizontal scrollable scope pills (`My Drive`, `Shared with me`, `Starred`), 48px+ folder rows, and stacked confirmation footer.

#### 3.8.2 First-Time Workspace Welcome & UX Education Info Card (`src/components/WelcomeGuideCard.tsx`)
- **Standout Visual Presence:** Rendered with a high-contrast royal indigo/violet gradient card (`#1e1b4b` to `#4f46e5`) with radiant borders, replacing the Executive Summary header bar on newly created or non-dismissed workspaces.
- **Purpose & Core Value Education:** Explains that Sheet2Vow is a live digital canvas connected directly to their private Google Spreadsheet in Google Drive, featuring bi-directional synchronization and zero data lock-in.
- **Interactive UX Customization Pillars:**
  - *1. Style Aesthetic:* Direct 1-click selectors to preview and switch between 4 bespoke themes (*Editorial Elegance*, *Neo-Brutalism*, *Botanical Romance*, *Midnight Tuxedo*).
  - *2. Color Mode:* 1-click interactive toggle between crisp Light Mode and sleek low-light Dark Mode.
  - *3. Navigation Layout:* 1-click interactive toggle between collapsible Left-Hand Sidebar and classic Top Header navigation tabs.
- **Cross-Device Persistence:** Permanent dismissal state is stored in `localStorage` (`s2v_welcome_dismissed_${spreadsheetId}`) and persisted directly into the user's spreadsheet configuration in `Settings!Z1` (`hasDismissedWelcomeCard: true`). Once dismissed, the dashboard directly showcases planning KPI modules with no clutter.

#### 3.8.3 User Profile Popover & Workspace Typography Isolation
- **Persistent Google Avatar & Display Name:** Restores `s2v_google_name`, `s2v_google_avatar`, and `s2v_google_email` from `localStorage` across page reloads and authentication callbacks.
- **1-Click Google Spreadsheet Deep Link:** In-app profile menu features an instant `OPEN GOOGLE SPREADSHEET` action button linking directly to `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`.
- **Editorial Light Default Primary Color:** `#0D1B2A` (Royal Navy) configured as the first/default preset color.
- **Newspaper Serif Workspace Header Isolation:** Restores Playfair Display serif header typography (`--font-header: var(--font-serif)`) specifically for workspace headers while keeping the Hub landing page and Activation wizard locked to clean, fixed modern sans.

#### 3.8.4 Rapid Bulk-Loading 3-Button Modal Workflow (`[UX-BULK-LOAD]`)
- **Tri-Action Modal Controls:** All standard item creation modals implement a 3-button footer layout:
  1. `CANCEL`: Discards changes and closes the modal dialog without saving.
  2. `SAVE & ADD NEW`: Persists the current input record, triggers background bi-directional synchronization with Google Sheets, and immediately resets form inputs with the next sequential ID—keeping the modal open for uninterrupted high-velocity batch data entry.
  3. `SAVE [ITEM]`: Persists the record, triggers synchronization, and closes the modal.
- **Enabled Across All 10 Workspace Modules:**
  - `GuestListManager.tsx` (Guest Records)
  - `VendorManager.tsx` (Vendor Contracts & Balances)
  - `MusicManager.tsx` (Song & DJ Playlist Items)
  - `KanbanBoard.tsx` (Planning Tasks & Milestones)
  - `PhotoShotListManager.tsx` (Photography Required Shot List)
  - `BudgetLedgerManager.tsx` (Budget Line-Item Expenses)
  - `TimelineManager.tsx` (Day-Of Schedule Events)
  - `ThankYouManager.tsx` (Gift Records & Thank You Notes)
  - `MenuSetupManager.tsx` (Catering Dishes & Entrees)
  - `SeatingChartManager.tsx` (Seating Table Configurations)

---

## 4. Data Storage & Schema Mapping

### 4.1 Master Google Spreadsheet Structure (14 Tabs)
1. **`Settings`**: System configuration JSON stored in cell **`B2`** (`budget`, `weddingName`, `weddingDate`, `shareVersion`), keeping system metadata separated from human-readable tabs.
2. **`DASHBOARD`**: Visual KPI summary cards and charts for human spreadsheet viewers.
3. **`Guest List`**: Columns A–L (`Guest ID`, `First Name`, `Last Name`, `Party Group`, `Age Category`, `RSVP Status`, `Dietary Restrictions`, `Table Assignment`, `Email Address`, `Phone Number`, `Mailing Address`, `Thanked`).
4. **`Budget Ledger`**: Columns A–F (`Item ID`, `Category`, `Target Budget`, `Total Actual`, `Total Paid`, `Notes`). Streamlined category allocation ledger.
5. **`Expenses`**: Columns A–H (`Item ID`, `Description / Receipt`, `Category`, `Estimated Amount`, `Actual Cost`, `Amount Paid`, `Purchase Date`, `Notes`). Granular receipt tracker with automatic vendor deposit sync.
6. **`Day-Of-Schedule`**: Columns A–F (`Start Time`, `End Time`, `Event Moment`, `Location`, `Responsibility / Vendors`, `Notes / Details`).
7. **`Vendors`**: Columns A–L (`Vendor ID`, `Vendor Name`, `Category`, `Contact Name`, `Email Address`, `Phone Number`, `Total Contract Value`, `Deposit Paid`, `Balance Owing`, `Payment Due Date`, `Contract Link`, `Staff Meals Required`).
8. **`To-Do List`**: Columns A–H (`Task ID`, `Task Name`, `Kanban Stage`, `Category`, `Priority`, `Assigned To`, `Due Date`, `Notes / Links`).
9. **`Music Playlist`**: Columns A–F (`Song ID`, `Title`, `Artist`, `List Type`, `Link`, `Notes`).
10. **`PHOTOS`**: Columns A–H (`Shot ID`, `Description`, `Location`, `Shot Time`, `Included People`, `Status`, `Priority`, `Notes`).
11. **`GIFT REGISTRY`**: Columns A–G (`Item ID`, `Gift Description / Name`, `Giver / From`, `Category / Store`, `Estimated Value / Cash Amount`, `Thank You Sent`, `Notes`).

---

## 5. Security & Risk Audit Guidelines

1. **OAuth Scope Isolation:** Access restricted strictly to Google Drive files created/selected by Sheet2Vow (`drive.file`).
2. **Formula Injection Defense:** User input fields sanitized against leading `=`, `+`, `-`, `@` string characters to prevent spreadsheet formula injection.
3. **Stateless Token Integrity:** HMAC-SHA256 signed vendor tokens prevent URL parameter tampering without storing keys in external databases.
