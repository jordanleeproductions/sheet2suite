# Sheet2Vow - Technical Specification

## 1. Architecture Overview

Sheet2Vow is a high-end, localized digital wedding planner built on **Next.js 14 (App Router)** and **TypeScript**. It maps directly to a single Google Sheet in the user's personal Google Drive via the Google Sheets API v4. Sheet2Vow anchors the **Sheet2 Suite** (*Sheet2Vow, Sheet2Finance, Sheet2Home*) using `@germin8/sheet2-core`.

---

## 2. Core Modules & Component Architecture

### 2.1 Navigation & Shell (`src/app/page.tsx`)
- **Dual Design Engine:** Supports **Editorial Minimalist** (serif typography, subtle warm tones) and **Muted Neo-Brutalism** (3px slate borders, hard directional drop shadows, `Geist Mono` typography).
- **Theme & Color Customization:** Light/Dark mode toggle with customizable primary accent color.
- **Modular Feature Toggles (`enabledModules`):** Users can toggle individual modules (*Guest Registry*, *Seating Chart*, *Budget Ledger*, *Day-Of Timeline*, *Vendor Directory*, *Kanban Checklist*, *Music Playlist*, *Photo Shot List*, *Thank You Tracker*). Disabled modules automatically hide their top navbar tab and dashboard widgets.

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

### 2.10 Photography Shot List (`PhotoShotListManager.tsx`)
- Required photography moments (`Shot ID`, `Description`, `Location`, `Shot Time`, `Included People`, `Status`, `Priority`, `Notes`).
- Interactive `Captured` vs `Pending` checkoff toggles and **`EMAIL LIST`** photographer email generator (`mailto:`).

### 2.11 Thank You & Gift Registry Tracker (`ThankYouManager.tsx`)
- 🎁 **Gift Registry Thank Yous:** Tracks received gifts, givers, categories/stores, estimated values/cash amounts, and thank-you card status.
- 💌 **Guest Attendance Thank You Cards:** Interfacing with the `Guest List` `Thanked` column (Column `L`), automatically bundled per household/party group for attending guests with single party-level checkoff toggles.

---

## 3. Cryptographic Tokenized Vendor Share Engine (`/share/[token]`)

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

### 3.2 Data Sanitization Proxy (`src/app/api/share/[token]/route.ts`)
- Verifies token signature and expiration. Any tampered token produces an immediate `401 Unauthorized` response.
- Fetches Google Sheet tabs server-side and strips out confidential information (Budget Ledger items, guest mailing addresses, phone numbers, private notes) before returning sanitized JSON.

### 3.3 Mobile-First Vendor Page (`src/app/share/[token]/page.tsx`)
- High-contrast, standalone vendor page optimized for mobile phones at wedding venues.
- Includes Light/Dark mode toggle, search/filtering, and zero app header clutter.

### 3.4 Access Control & Revocation
- Configuration JSON stored in cell **`Settings!B2`** includes `shareVersion`.
- Clicking **"Revoke All Shared Links"** in Settings increments `shareVersion` in `Settings!B2`. Old tokens generated with previous versions are instantly rejected by the backend proxy.

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
