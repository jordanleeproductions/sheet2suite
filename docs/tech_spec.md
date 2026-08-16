# Sheet2Vow - Technical Specification

## 1. Architecture Overview

Sheet2Vow is a high-end, localized digital wedding planner built on **Next.js 14 (App Router)** and **TypeScript**. It maps directly to a single Google Sheet in the user's personal Google Drive via the Google Sheets API v4. Sheet2Vow anchors the **Sheet2 Suite** (*Sheet2Vow, Sheet2Finance, Sheet2Home*) using `@germin8/sheet2-core`.

---

## 2. Core Modules & Component Architecture

### 2.1 Navigation & Shell (`src/app/page.tsx` & `AdvancedSettingsModal.tsx`)
- **Multi-Theme Aesthetic Engine:** Currently supports **Editorial Minimalist** (serif typography, subtle warm tones) and **Muted Neo-Brutalism** (3px slate borders, hard directional drop shadows, `Geist Mono` typography), with **Botanical Romance**, **Midnight Tuxedo**, and **Retro Cyberpunk** planned for Phase 2 expansion.
- **Streamlined Quick Settings Dropdown:** Header settings icon triggers a lightweight dropdown for fast visual tweaks: Design Style (`Editorial` vs `Neo-Brutalism`), Color Mode (`Light` vs `Dark`), Primary Accent Color picker, and a direct launch button for **`ADVANCED SETTINGS`**.
- **Advanced Settings & Configuration Portal (`AdvancedSettingsModal.tsx`):**
  - 💒 **Wedding Details & Location:** Edit Wedding Title, Event Date (with live countdown sync), and Venue/Location details (synced to `Settings!B2`).
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
- RSVP status tracking (`Attending`, `Declined`, `Pending`), dietary restrictions, table assignments, plus-ones, and contact info.
- Native CSV export and printable layout.

### 2.4 Visual Table Seating Plan (`SeatingChartManager.tsx`)
- Multiple table shapes: **Round Circle Tables** (radial trigonometric node layout), **Rectangle Banquet Tables** (dynamic length scaling, optional head/foot end seats), **Square Tables** (4 or 8 seats on all 4 sides), and **Sweetheart / Single-Side Tables**.
- Seat ID persistence (`seatNumber`) per guest.
- Interactive seat nodes with initials avatar, guest profile popups, and unassigned guest drawer.

### 2.5 Budget Ledger (`BudgetLedgerManager.tsx`)
- Itemized financial ledger (Estimated vs Actual Cost vs Amount Paid vs Balance Owing).
- Payment status tags (`Paid`, `Pending`, `Overdue`) and category over-budget alerts.

### 2.6 Day-Of Timeline (`TimelineManager.tsx`)
- Day-Of itinerary timeline with "UP NEXT" active moment banner ticker.
- Filter by responsibility (*Bridal Party*, *Catering*, *Photography*, *Guests*) and late-night tracking (`🌙 +1 DAY`).

### 2.7 Vendor Directory (`VendorManager.tsx`)
- Vendor contact directory, categories, contract values, deposit paid, and staff meal requirements.

### 2.8 Kanban Checklist (`KanbanBoard.tsx`)
- Categorized checklist (*To Do*, *In Progress*, *Done*) with priority badges and target due dates.

### 2.9 Wedding Playlist & Music (`MusicManager.tsx`)
- Categorized music tracks (*Ceremony*, *Reception*, *First Dance*, *Must Play*, *Banned / Do Not Play*).
- Live 30-second iTunes audio preview player, Spotify/YouTube search buttons, and **`EMAIL LIST`** DJ email generator (`mailto:`).

### 2.11 Admin Song Request Approval Queue & DJ Gating (`[MUSIC-4]`)
- **Automated Request Gating:** Incoming guest song requests (`/api/request-song/[token]`) default to `approvalStatus: 'Pending Approval'` (or `Banned` if matching a Banned track).
- **Admin Approval Queue:** Displays a Pending Requests Banner in `MusicManager.tsx` with quick inline action buttons (`Approve ✓`, `Decline ✗`) and `PENDING APPROVAL` filter pills.
- **DJ Status Filtering:** Tokenized DJ Share portal (`/share/[token]`) status filter pills (`ALL ACTIVE TRACKS`, `APPROVED ONLY`, `PENDING APPROVAL`, `BANNED TRACKS`), automatically hiding Banned songs from the active playlist.

### 2.10 Photography Shot List (`PhotoShotListManager.tsx`)
- Required photography moments (`Shot ID`, `Description`, `Location`, `Shot Time`, `Included People`, `Status`, `Priority`, `Notes`).
- Interactive `Captured` vs `Pending` checkoff toggles and **`EMAIL LIST`** photographer email generator (`mailto:`).

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
- **Algorithm:** Signed `HMAC-SHA256` token payload containing `{ spreadsheetId, scope, weddingName, shareVersion, exp }`.
- **Scopes:**
  - `'music'`: DJ / Band Playlist & Banned tracks.
  - `'photos'`: Photographer Shot List & posing notes.
  - `'timeline'`: Day-Of Schedule & responsibility moments.
  - `'catering'`: Attending headcount, dietary restrictions breakdown, and table seating capacity.
  - `'vendor_hub'`: All-in-one vendor portal hub with tab navigation.
  - `'guest_upload'`: Guest photo/video upload portal (`/upload/[token]`) routing uploads directly into couple's Drive folder (`My Drive/Wedding Planning/Guest Uploads`).
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

### 3.8 Guided Setup & Onboarding Engine (`src/app/activate/page.tsx`)
- **Step 1: Wedding Details & Multi-Admin Access:** Captures Couple's Name / Wedding Title, Wedding Date (with live countdown sync), and up to 2 additional Co-Admin accounts with full edit permissions to the underlying Google Sheet database.
- **Step 2: Feature & Module Enablement:** Interactive module toggles (*Financials & Budget*, *Guests & RSVPs*, *Day-Of Itinerary*, *Tasks & Checklist*, *Vendors Directory*, *Music & DJ Playlist*), with explicit user assurance that modules can be toggled in Settings without data loss.
- **Step 3: Conditional Feature Details:** Dynamically adapts based on enabled features:
  - *Financials Enabled:* Estimated Total Budget input and multi-currency selector (`USD`, `CAD`, `GBP`, `EUR`, `AUD`).
  - *Tasks Enabled:* Choice between Pre-populated Task Presets (*Traditional*, *Destination*, *Micro-Wedding*, *DIY*) and *Clean Slate*, featuring an interactive task item checklist with granular check/uncheck controls before spreadsheet provisioning.
- **Step 4: UI Theme & Navigation Customization:** User customization for Style Theme (*Editorial Elegance*, *Neo-Brutalism*, *Botanical Romance*, *Midnight Tuxedo*), Color Mode (*Light* vs *Dark*), and Navigation Layout (*Left-Hand Sidebar Nav* [Default] vs *Top Header Nav*), instantly persisting to client state and database workspace configuration.

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
4. **`Budget Ledger`**: Columns A–H (`Item ID`, `Category`, `Vendor Name`, `Estimated Cost`, `Actual Cost`, `Amount Paid`, `Due Date`, `Payment Status`).
5. **`Day-Of-Schedule`**: Columns A–F (`Start Time`, `End Time`, `Event Moment`, `Location`, `Responsibility / Vendors`, `Notes / Details`).
6. **`Vendors`**: Columns A–L (`Vendor ID`, `Vendor Name`, `Category`, `Contact Name`, `Email Address`, `Phone Number`, `Total Contract Value`, `Deposit Paid`, `Balance Owing`, `Payment Due Date`, `Contract Link`, `Staff Meals Required`).
7. **`To-Do List`**: Columns A–H (`Task ID`, `Task Name`, `Kanban Stage`, `Category`, `Priority`, `Assigned To`, `Due Date`, `Notes / Links`).
8. **`Music Playlist`**: Columns A–F (`Song ID`, `Title`, `Artist`, `List Type`, `Link`, `Notes`).
9. **`PHOTOS`**: Columns A–H (`Shot ID`, `Description`, `Location`, `Shot Time`, `Included People`, `Status`, `Priority`, `Notes`).
10. **`GIFT REGISTRY`**: Columns A–G (`Item ID`, `Gift Description / Name`, `Giver / From`, `Category / Store`, `Estimated Value / Cash Amount`, `Thank You Sent`, `Notes`).

---

## 5. Security & Risk Audit Guidelines

1. **OAuth Scope Isolation:** Access restricted strictly to Google Drive files created/selected by Sheet2Vow (`drive.file`).
2. **Formula Injection Defense:** User input fields sanitized against leading `=`, `+`, `-`, `@` string characters to prevent spreadsheet formula injection.
3. **Stateless Token Integrity:** HMAC-SHA256 signed vendor tokens prevent URL parameter tampering without storing keys in external databases.
