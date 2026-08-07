# Sheet2Vow - Features & Topic Roadmap

---

# SECTION 1: ✅ COMPLETED FEATURES

## 🪑 1. Seating & Floorplan Planner (`SeatingChartManager.tsx`)
- [x] **[SEAT-1] Visual Table Floorplan Canvas:** Interactive reception seating manager supporting Circle, Rectangle, Square, and Sweetheart table geometries with trigonometric node placement.
- [x] **[SEAT-2] Table Capacity Status Alerts:** Real-time capacity badges displaying `NORMAL`, `FULL`, and high-contrast `OVER CAPACITY ⚠️` warnings when table seat allocations exceed capacity.
- [x] **[SEAT-3] 3-Tier Intelligent Party Group Priority Sorting:** Seat assignment selector automatically ranks unassigned guests matching seated `partyGroup` names at the top (`🎉 SAME PARTY GROUP`), followed by unassigned guests (`UNASSIGNED`), and assigned guests last.
- [x] **[SEAT-4] Ceremony Row & Aisle Seating Floorplan Planner (`SeatingChartManager.tsx`):** Dual-side aisle seating planner calculating required seats for `Attending + Pending` guests (excluding `Declined`), customizable row count & chairs per row, central aisle runner visual, interactive seat placement with party group priority sorting, and responsive mobile dual-card splitting.
- [x] **[SEAT-5] Visual Table Diagrams & Numbered Seat Maps for Coordinators (`PrintTemplatesModal.tsx`):** Renders dynamic SVG/CSS shape diagrams (Circle, Rectangle, Square, Sweetheart) on printable Table Roster cards with numbered seat nodes (`#1`, `#2`, `#3`...) matching the numbered guest roster for day-of venue setup. Includes a toggle option in Print Studio.
- [x] **[SEAT-6] Unassigned Guests Drawer Initials Avatar:** Display guest initial avatar circles to the left of names inside the Unassigned Guests drawer.
- [x] **[SEAT-7] Seating KPI Card Value Font Consistency:** Matched KPI card value typography with Summary Dashboard monospace fonts (`var(--font-mono)`).

---

## 🎵 2. Music, Song Requests & DJ Sync (`MusicManager.tsx`)
- [x] **[MUSIC-1] Song Catalog & Banned Tracks:** Categorized playlists (*Ceremony*, *Reception*, *First Dance*, *Must Play*, *Banned Songs*) with streaming links and structured `mailto:` DJ email export.
- [x] **[MUSIC-2] iTunes Auto-Suggest Search:** Integrated live iTunes search bar in "Add Song" modal with 30s audio previews and track metadata auto-fill.
- [x] **[MUSIC-3] Guest Live Song Request Portal (`/request-song/[token]`):** Tokenized mobile guest portal allowing wedding guests to scan reception QR codes and submit live song requests with iTunes previews.
- [x] **[MUSIC-4] Admin Song Request Approval Queue & DJ Status Filter (`MusicManager.tsx`, `/share/[token]`, `DashboardMetrics.tsx`):**
  - Adds Column I: `Approval Status` (`approvalStatus`: `'Approved' | 'Pending Approval' | 'Banned' | 'Declined'`) to the `MUSIC` tab schema.
  - Automatically flags incoming guest song requests as `Pending Approval` (or `Banned` if matching a Banned track).
  - Admin approval workflow in `MusicManager.tsx` with top Pending Request Alert banner, top-row `🎵 SONG REQUEST` badges, bottom-row inline `Approve ✓` / `Decline ✗` actions, and Spotify/YouTube brand icon buttons.
  - Summary Page (`DashboardMetrics.tsx`) Music Playlist Summary section with KPI cards for `ADDED BY ADMIN`, `GUEST REQUESTS`, `TOTAL TRACKS`, and clickable `PENDING REQUESTS` (directs couple to Pending Approval view).
  - DJ Vendor Share Portal (`/share/[token]`) status filter pills (`ALL ACTIVE TRACKS`, `✓ APPROVED SONGS`, `⏳ PENDING APPROVAL`, `🚫 BANNED TRACKS`), red `🚫 BANNED` badges, and 15s background auto-polling for live updates.
- [x] **[MUSIC-5] Descriptive Header Subtitle:** Added an informative subtitle explaining playlist curation and request portal workflow under the Music header.
- [x] **[MUSIC-6] Direct Portal Quick Action Buttons:** Added active link buttons for Guest Song Request Portal (`📻 REQUEST PORTAL`) and DJ Share Page (`🔗 DJ PORTAL`) on the Music header.
- [x] **[MUSIC-7] YouTube Music Branding & Player Fallback:** Updated track cards to use YouTube Music red branding and direct links, removed redundant 3rd platform icon, and added fallback audio error handling for mock preview links (`BUG-2`).
- [x] **[MUSIC-8] Auto-Populate DJ Email:** Automatically prepopulates the `TO` email address with the DJ/Band's email from the Vendor Directory when exporting the Music list.

---

## 🖨️ 3. Print & Canva Export Studio (`PrintTemplatesModal.tsx`)
- [x] **[PRINT-1] One-Click Printable PDF Studio:** Escort / Folded Place Cards (with meal choice icons & crop/fold guidelines), Table Tent Cards & Seating Rosters, Day-Of Timeline Itinerary, and Emergency Vendor Directory Contact Sheet.
- [x] **[PRINT-2] Guest Photo/Video Upload QR Cards:** Printable place cards with custom QR code linking guests directly to the photo upload portal (`/upload/[token]`).
- [x] **[PRINT-5] Emoji & Decorative Icon Toggles:** Added options toggle in Print Studio for wedding ring and sparkle decorative emojis.
- [x] **[PRINT-6] Granular Card Field Controls:** Added individual field checkboxes to show/hide Table Number, Meal Selection Icon, Dietary Restrictions, and Plus-One / Party Group names on place cards.

---

## 🍽️ 4. Guest Registry, Catering & Relational RSVP (`GuestListManager.tsx`)
- [x] **[GUEST-1] Guest Registry & RSVP Management:** Grid View, Seating View, Household/Party Group View, RSVP toggles, dietary restriction notes, and CSV import/export.
- [x] **[GUEST-2] Dynamic Relational RSVP Sync & Catering Intelligence (`relationalSync.ts`):** Auto-updating guest RSVPs sync dietary restrictions directly into vendor catering counts, meal choice totals (`🥩 Beef`, `🍗 Chicken`, `🐟 Fish`, `🌱 Vegan`), and table capacity alerts.
- [x] **[GUEST-3] Catering & Menu Setup Page (`MenuSetupManager.tsx`):** Dedicated menu management interface allowing couples to configure custom entree, appetizer, and dessert options, automatically populating meal choices into the Guest Registry Add/Edit modal and tracking live RSVP order counts.
- [x] **[GUEST-4] Dedicated Dietary Restrictions Summary Row:** Moved Dietary Restrictions to a dedicated row under Meal Totals inside guest cards with total counts and dietary breakdowns.
- [x] **[GUEST-5] Clickable Meal Totals & Dietary Restriction Badges:** Made meal total choice pills and dietary restriction alert badges interactive quick-filters that filter the guest list on click.
- [x] **[GUEST-6] Desktop List Row View Toggle:** Switchable compact list table view for dense guest data management alongside card grid view.
- [x] **[GUEST-7] Header Action Realignment & Subtitle:** Moved "Add Guest" button to right hand side with centered text and added a descriptive subtitle under "Guest Registry".
- [x] **[GUEST-8] Dynamic Party Group Combo Dropdown:** Converted Party Group text input in guest modal to an interactive HTML5 combo dropdown pre-seeded with existing party groups.

---

## 🍽️ 5. Menu & Catering Setup (`MenuSetupManager.tsx`)
- [x] **[MENU-1] Header Action Realignment:** Moved "Add Menu Item" button to the far right side of the header.

---

## 🔗 6. Tokenized Vendor Share & Public Guest Portals
- [x] **[SHARE-1] Cryptographic Token Engine (`token.ts`):** HMAC-SHA256 tokenized vendor share links (`/share/[token]`) with scope isolation (*Music*, *Photos*, *Timeline*, *Catering*, *Vendor Hub*) and Active Link Manager card.
- [x] **[SHARE-2] Guest Photo & Video Upload Portal (`/upload/[token]`):** Mobile portal routing guest photos and videos directly into the couple's personal Google Drive folder (`My Drive/Wedding Planning/Guest Uploads`) with MIME/extension format validation.
- [x] **[SHARE-3] Guest Live Song Request Portal (`/request-song/[token]`):** Mobile song request portal with live iTunes catalog auto-complete and 30s audio previews.

---

## 💼 7. Vendor Directory (`VendorManager.tsx`)
- [x] **[VND-1] Add/Edit Vendor Modal Header Font Fix:** Fixed modal header font color in Add & Edit Vendor modal to high-contrast white (`#ffffff`).
- [x] **[VND-3] Category Breakdown Stat Badges:** Category summary breakdown displaying vendor count and total contract cost per category with interactive quick-filter toggles.
- [x] **[VND-4] Vendor Portal Share Link Generator:** Dedicated **SHARE PORTAL** buttons on vendor cards/rows that automatically generate category-scoped signed HMAC access tokens for mobile vendor portals (*Music, Photos, Catering, Timeline*).
- [x] **[VND-5] Vendor Subtitle Description:** Added a clean descriptive subtitle beneath the Vendor Management header detailing contract, payment, and meal tracking.

---

## 📋 8. Task Checklist & Kanban (`KanbanBoard.tsx`)
- [x] **[TASK-1] Clickable Kanban Task Edit Modal:** Clicking any task card on the Kanban board opens its edit modal window.
- [x] **[TASK-2] Switchable Progress Cards / Progress Bar Header:** Added switchable progress view mode toggle (Progress Cards vs Multi-color Progress Bar) above the Kanban board.
- [x] **[TASK-3] Header Methodology Description:** Added a descriptive subtitle under the header explaining Kanban task management workflow.

---

## 🎨 9. Aesthetic Theme Engine & UI Design System
- [x] **[THEME-1] Dual Design System:** High-contrast switching between **Editorial Minimalist** (serif typography, soft borders) and **Muted Neo-Brutalism** (3px borders, hard drop shadows, `Geist Mono` typography).
- [x] **[THEME-2] Light/Dark Mode & Custom Accent Colors:** Global theme toggle with 4 curated primary accent color presets (**Emerald Green** `#13AA52`, **Royal Navy** `#0d1b2a`, **Romantic Rose** `#e11d48`, **Velvet Purple** `#7c3aed`) plus an interactive custom HTML5 native hex color picker in Advanced Settings.
- [x] **[THEME-4] Semantic Color Token Expansion (`theme.css`):** Added CSS custom properties across all theme variants to eliminate hardcoded hex values.
- [x] **[THEME-5] PhotoShotListManager Dark Mode Fix:** Replaced hardcoded `#000000` inline styles so Photography page renders correctly in dark mode.
- [x] **[THEME-6] Full Component Color Token Cleanup:** Systematically replaced hardcoded hex color values across components with CSS variables.

---

## 📊 10. Summary Dashboard Enhancements (`DashboardMetrics.tsx`)
- [x] **[DASH-1] Interactive & Filtered KPI Navigation:** Made all summary KPI cards clickable links routing directly to corresponding tabs with pre-applied status filters.
- [x] **[DASH-2] Multi-View Section Toggles (Cards | Pie Chart | Labeled Progress Bar):** Displayed header view mode icons on summary sections.
- [x] **[DASH-3] Reorderable & Custom Summary Dashboard Layout:** Allowed couples to reorder summary sections up/down and toggle section visibility with `localStorage` persistence.
- [x] **[DASH-4] Reception Table Seating Summary Module:** Added dedicated summary section for Table Seating displaying KPI cards, Pie Chart, and Progress Bar views.
- [x] **[DASH-5] Browser Back/Forward Tab History Navigation:** Integrated HTML5 History API for seamless browser back/forward navigation.
- [x] **[DASH-6] Photography Summary Module:** Added dedicated Photography section in Summary with Cards, Donut Chart, and Progress Bar views.
- [x] **[DASH-7] Edit Icon Summary Layout Control Shortcut:** Prominent `✏️ EDIT LAYOUT CONTROLS` shortcut button on executive summary header to configure visible modules.

---

## 💰 11. Ledger Budget Enhancements (`BudgetLedgerManager.tsx`)
- [x] **[BUDGET-1] Interactive Multi-Category Quick Filter Cards:** Made category cards clickable quick filters in `BudgetLedgerManager.tsx`.
- [x] **[BUDGET-2] Inline Editable Budget Target:** Click-to-edit overall budget target directly in the utilization meter banner.
- [x] **[BUDGET-3] Optional Unset Budget Tracking Mode:** Toggle mode to track expenses without requiring a fixed overall budget limit.

---

## 📸 12. Photography & Shot List Manager (`PhotoShotListManager.tsx`)
- [x] **[PHOTO-1] Photography Shot List Enhancements:** Unchecked cards have solid black borders, section headers black text, and desktop view single-row layout.
- [x] **[PHOTO-2] Auto-Populate Photographer Email:** Automatically prepopulates the `TO` email address with the Photographer's email from the Vendor Directory when emailing the Shot List.

---

## ⚙️ 13. Platform Infrastructure & Standards
- [x] **[SYS-1] Purchase Activation Flow (`/activate`):** Etsy order verification API with Quick Setup and 4-screen Guided Setup Wizard.
- [x] **[SYS-2] Multi-Currency Formatting Engine:** Support for USD $, CAD $, French Canadian 35 000 $, GBP £, and EUR €.
- [x] **[SYS-3] Advanced Settings Portal:** Metadata editor, currency selector, drive inspector, feature toggles, and dev mock controls.
- [x] **[GEN-1] Dropdown to Checkbox Standard:** Converted binary Yes/No dropdown fields to native checkboxes (e.g. Staff Meals Required).
- [x] **[GEN-2] Desktop Wide-Screen Layout Optimization:** Expanded max-width container bounds to 1680px for desktop viewports.
- [x] **[GEN-3] Toast Notification System:** Brief "Saved!" popup on settings/modal saves and data sync updates.

---
---

# SECTION 2: 📋 PENDING FEATURE BACKLOG

### ⚙️ General & Platform Infrastructure

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[GEN-3]`** | Toast Notification System: Brief "Saved!" popup on settings/modal save | `ToastNotification.tsx` | 🟡 Medium | ⚡ Low (~2 turns) | ✅ Complete |
| **`[SYS-4]`** | Production Google OAuth 2.0 & Real Google Sheets Sync (`drive.file` scope) | `googleSheets.ts` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[SYS-5]`** | Unified Product Usage Telemetry (GA4 Event Engine) | `telemetry.ts` | 🟡 Medium | ⚡ Low (~2 turns) | Pending |
| **`[SYS-6]`** | Lemon Squeezy Integration & License Entitlements | `/api/webhook` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[SYS-7]`** | Security & Risk Audit (formula injection prevention, HMAC replay guard) | `security.ts` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |

### 🧭 Navigation & Settings

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[NAV-1]`** | Sticky Collapsible Left Sidebar Navigation setting instead of top navbar | `page.tsx` | 🔴 High | ⚡ Med (~3-4 turns) | Pending |

### 👥 Guest Registry

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[GUEST-5]`** | Make Meal Totals & Dietary Restriction badges clickable quick-filters | `GuestListManager.tsx` | 🟡 Medium | ⚡ Low (~1-2 turns) | ✅ Complete |
| **`[GUEST-6]`** | Desktop List Row View Toggle: Switch between Card Grid and List Table Rows | `GuestListManager.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Complete |
| **`[GUEST-8]`** | Dynamic Party Group Combo Dropdown (select existing or type custom) | `GuestListManager.tsx` | 🟡 Medium | ⚡ Low (~2 turns) | ✅ Complete |

### 💼 Vendor Directory

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[VND-2]`** | Payment Due Date Reminder Badges (Highlight balance owing within 30 days) | `VendorManager.tsx` | 🟢 Low | ⚡ Low (~1 turn) | Pending |
| **`[VND-3]`** | Category Breakdown Stat Badges (Count & total contract cost per category) | `VendorManager.tsx` | 🟡 Medium | ⚡ Low (~1-2 turns) | ✅ Complete |
| **`[VND-4]`** | Vendor Portal Link Generator (Shareable portal per vendor) | `VendorManager.tsx` | 🟡 Medium | ⚡ Med (~2 turns) | ✅ Complete |

### 📋 Task Checklist & Kanban

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[TASK-2]`** | Switchable Progress Cards / Progress Bar header above Kanban board | `KanbanBoard.tsx` | 🟡 Medium | ⚡ Low (~2 turns) | ✅ Complete |

### 🎵 Music Playlist

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[MUSIC-7]`** | YouTube Music branding/link, remove 3rd platform icon, fix mock preview playback | `MusicManager.tsx` | 🟡 Medium | ⚡ Low (~2 turns) | ✅ Complete |

### 📸 Photography & Shot List

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[PHOTO-2]`** | Auto-Populate Photographer Email in `TO` field when emailing Shot List | `PhotoShotListManager.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Complete |

### 💰 Ledger Budget Manager

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[BUDGET-2]`** | Inline editable budget target limit | `BudgetLedgerManager.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Complete |
| **`[BUDGET-3]`** | Optional unset budget tracking mode | `BudgetLedgerManager.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Complete |

### 📊 Summary Dashboard

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[DASH-7]`** | Edit Icon summary layout control shortcut | `DashboardMetrics.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Complete |

### 🖨️ Print Studio & Canva Exporter

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[PRINT-3]`** | Canva Template Integration Hub & Canva Bulk Create Merge CSV Exporter | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-4]`** | Custom Print Theme & Typography Switcher (Serif, Sans, Script, Mono) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Low (~2 turns) | Pending |
| **`[PRINT-5]`** | Emoji & decorative icon toggles | `PrintTemplatesModal.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Complete |
| **`[PRINT-6]`** | Granular card field controls (Table #, Meal Icon, Dietary, Plus-One) | `PrintTemplatesModal.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Complete |
| **`[PRINT-7]`** | Strict Print Boundary & Bleed Guardrails (Avery cardstock grid dimensions) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-8]`** | Full Wedding Planner Binder Printout (combines all modules into bound book) | `PrintTemplatesModal.tsx` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[PRINT-9]`** | Printable Ceremony Aisle Seating Chart Template | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-10]`** | Responsive Mobile Print Studio layout redesign | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-11]`** | Separate Binder Planner pages from Guest Printables (place cards, QR cards) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-12]`** | Binder Hole Punch Margins toggle (space for 3-ring binder punches) | `PrintTemplatesModal.tsx` | 🟢 Low | ⚡ Low (~1 turn) | Pending |
| **`[PRINT-13]`** | Batch Combined Binder Export or Individual Section PDF downloads | `PrintTemplatesModal.tsx` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[PRINT-14]`** | Table Seating Roster Pagination: Limit to 1-2 tables per page for legibility | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |

### 🎨 Theme Engine

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[THEME-3]`** | Expanded Aesthetic Engine (Botanical Romance, Midnight Tuxedo, Cyberpunk) | `theme.css` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |

### 🔗 Public Portals

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SHARE-4]`** | Spouse & Partner Co-Planning Access (delegate Drive read/write permissions) | `page.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |

---

## SECTION 3: 🐛 BUG & DEFECT BACKLOG

| Defect ID | Module / Component | Issue Description | Severity | Status | Reported Date |
|---|---|---|---|---|---|
| **[BUG-1]** | Print Studio (`PrintTemplatesModal.tsx`) | Content bleeds over page borders during printing/PDF generation when table rosters or timeline lists span multiple pages. Needs smart CSS `@page` page breaks (`page-break-inside: avoid; break-inside: avoid;`) and multi-page pagination splitting. | Medium | Open | 2026-08-02 |
| **[BUG-2]** | Music Manager (`MusicManager.tsx`) | Audio preview playback triggers console/runtime error when playing mock song items. Resolved with fallback error banner and YouTube Music link. | Medium | Resolved | 2026-08-03 |

---

# SECTION 4: ✨ MICRO-ANIMATIONS & INTERACTIVITY

| Animation | Location | Description |
|---|---|---|
| **Theme Transition** | Global (`documentElement`) | Smooth 0.2s cross-fade when switching between Editorial and Neo-Brutalism themes. |
| **Seat Node Hover** | Seating Chart Canvas | Soft scale-up and highlight outline on seat initials nodes. |
| **Active Moment Pulse** | Timeline "UP NEXT" Banner | Soft pulsing highlight on the active moment badge. |
| **Card Hover Lift** | Guest / Music / Vendor Cards | Slight `translate-y (-2px)` with shadow offset on hover. |
| **Audio Spinner** | Music Preview Player | Smooth rotating loading indicator while fetching iTunes audio previews. |
