# Sheet2Vow - Features & Topic Roadmap

---

## 🪑 1. Seating & Floorplan Planner (`SeatingChartManager.tsx`)
- [x] **[SEAT-1] Visual Table Floorplan Canvas:** Interactive reception seating manager supporting Circle, Rectangle, Square, and Sweetheart table geometries with trigonometric node placement.
- [x] **[SEAT-2] Table Capacity Status Alerts:** Real-time capacity badges displaying `NORMAL`, `FULL`, and high-contrast `OVER CAPACITY ⚠️` warnings when table seat allocations exceed capacity.
- [x] **[SEAT-3] 3-Tier Intelligent Party Group Priority Sorting:** Seat assignment selector automatically ranks unassigned guests matching seated `partyGroup` names at the top (`🎉 SAME PARTY GROUP`), followed by unassigned guests (`UNASSIGNED`), and assigned guests last.
- [x] **[SEAT-4] Ceremony Row & Aisle Seating Floorplan Planner (`SeatingChartManager.tsx`):** Dual-side aisle seating planner calculating required seats for `Attending + Pending` guests (excluding `Declined`), customizable row count & chairs per row, central aisle runner visual, interactive seat placement with party group priority sorting, and responsive mobile dual-card splitting.
- [x] **[SEAT-5] Visual Table Diagrams & Numbered Seat Maps for Coordinators (`PrintTemplatesModal.tsx`):** Renders dynamic SVG/CSS shape diagrams (Circle, Rectangle, Square, Sweetheart) on printable Table Roster cards with numbered seat nodes (`#1`, `#2`, `#3`...) matching the numbered guest roster for day-of venue setup. Includes a toggle option in Print Studio.

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

---

## 🖨️ 3. Print & Canva Export Studio (`PrintTemplatesModal.tsx`)
- [x] **[PRINT-1] One-Click Printable PDF Studio:** Escort / Folded Place Cards (with meal choice icons & crop/fold guidelines), Table Tent Cards & Seating Rosters, Day-Of Timeline Itinerary, and Emergency Vendor Directory Contact Sheet.
- [x] **[PRINT-2] Guest Photo/Video Upload QR Cards:** Printable place cards with custom QR code linking guests directly to the photo upload portal (`/upload/[token]`).
- [ ] **[PRINT-3] Canva Template Integration & Canva Bulk Create Exporter:**
  - Provide a dedicated **Canva Integration Hub** in the Print Studio with official Sheet2Vow Canva template links (*Editorial, Boho Romance, Minimalist, Luxury Gold*).
  - 1-click **`EXPORT CANVA BULK MERGE CSV`** formatted specifically for Canva's *Bulk Create* tool (`First Name`, `Last Name`, `Table Name`, `Seat Number`, `Meal Choice`, `Photo Upload QR URL`), allowing couples to auto-populate custom Canva place card and table number designs in seconds.
  - Future support for Canva Connect API (`Design with Canva` embed button).
- [ ] **[PRINT-4] Custom Print Theme & Typography Switcher:** Switch between print visual styles (*Classic Editorial Serif*, *Modern Minimalist Sans*, *Boho Elegant Script*, *High-Contrast Mono Roster*).
- [ ] **[PRINT-5] Emoji & Decorative Icon Toggles:** Option to toggle off food/meal emojis (`🥩`, `🍗`, `🐟`) for formal black-tie printouts or clean text-only place cards.
- [ ] **[PRINT-6] Granular Card Field Controls:** Option to show/hide Table Assignment, Seat ID (`Seat #4`), Meal Selection, or Dietary Restriction tags on place cards.
- [ ] **[PRINT-7] Strict Print Boundary & Bleed Guardrails:** Advanced CSS page-break logic (`break-inside: avoid`) and standard cardstock grid dimensions (Avery 5302 / 3.5" x 2" folded card templates) ensuring zero card bleed during PDF generation.
- [ ] **[PRINT-8] Full Wedding Planner Binder Printout:** Dedicated Print Studio mode to print the entire wedding planner as a comprehensive physical binder (combining Master Guest List, Catering Summary, Seating Floorplan, Day-Of Timeline, Music Playlist, and Vendor Directory into a formatted bound book), with optional Canva cover page & section divider templates.
- [ ] **[PRINT-9] Printable Ceremony Aisle Seating Chart Template:** Dedicated print template in `PrintTemplatesModal.tsx` rendering the dual-side Ceremony Aisle Seating chart (Bride's Side / Left vs Groom's Side / Right), row numbers, altar stage indicator, and assigned guest seats.

---

## 🍽️ 4. Guest Registry, Catering & Relational RSVP (`GuestListManager.tsx`)
- [x] **[GUEST-1] Guest Registry & RSVP Management:** Grid View, Seating View, Household/Party Group View, RSVP toggles, dietary restriction notes, and CSV import/export.
- [x] **[GUEST-2] Dynamic Relational RSVP Sync & Catering Intelligence (`relationalSync.ts`):** Auto-updating guest RSVPs sync dietary restrictions directly into vendor catering counts, meal choice totals (`🥩 Beef`, `🍗 Chicken`, `🐟 Fish`, `🌱 Vegan`), and table capacity alerts.
- [x] **[GUEST-3] Catering & Menu Setup Page (`MenuSetupManager.tsx`):** Dedicated menu management interface allowing couples to configure custom entree, appetizer, and dessert options, automatically populating meal choices into the Guest Registry Add/Edit modal and tracking live RSVP order counts.

---

## 🔗 5. Tokenized Vendor Share & Public Guest Portals
- [x] **[SHARE-1] Cryptographic Token Engine (`token.ts`):** HMAC-SHA256 tokenized vendor share links (`/share/[token]`) with scope isolation (*Music*, *Photos*, *Timeline*, *Catering*, *Vendor Hub*) and Active Link Manager card.
- [x] **[SHARE-2] Guest Photo & Video Upload Portal (`/upload/[token]`):** Mobile portal routing guest photos and videos directly into the couple's personal Google Drive folder (`My Drive/Wedding Planning/Guest Uploads`) with MIME/extension format validation.
- [x] **[SHARE-3] Guest Live Song Request Portal (`/request-song/[token]`):** Mobile song request portal with live iTunes catalog auto-complete and 30s audio previews.
- [ ] **[SHARE-4] Spouse & Partner Co-Planning Access (`GRANT ADMIN ACCESS`):** Invite a partner/spouse via email to delegate Google Drive read/write permissions for real-time co-planning.

---

## 🎨 6. Aesthetic Theme Engine & UI Design System
- [x] **[THEME-1] Dual Design System:** High-contrast switching between **Editorial Minimalist** (serif typography, soft borders) and **Muted Neo-Brutalism** (3px borders, hard drop shadows, `Geist Mono` typography).
- [x] **[THEME-2] Light/Dark Mode & Custom Accent Colors:** Global theme toggle with 4 curated primary accent color presets (**Emerald Green** `#13AA52`, **Royal Navy** `#0d1b2a`, **Romantic Rose** `#e11d48`, **Velvet Purple** `#7c3aed`) plus an interactive custom HTML5 native hex color picker in Advanced Settings.
- [ ] **[THEME-3] Expanded Multi-Theme Aesthetic Engine:** Introduce **Botanical Romance** (sage green & soft blush tones), **Midnight Tuxedo** (navy & gold leaf luxury dark mode), and **Retro Cyberpunk** (neon violet/cyan grid overlays & pixel badges).
- [x] **[THEME-4] Semantic Color Token Expansion (`theme.css`):** Add missing CSS custom properties (`--color-amber`, `--color-purple`, `--color-text-secondary`, `--color-text-tertiary`, `--color-bg-subtle`, `--color-bg-hover`, `--color-border`, `--color-on-dark`, `--color-on-light`) across all 4 theme variants (Editorial Light/Dark, Neo-Brutalism Light/Dark) to eliminate hardcoded hex values.
- [x] **[THEME-5] PhotoShotListManager Dark Mode Fix:** Replace 18 hardcoded `#000000` inline styles with `var(--color-text)` and `var(--color-on-light)` tokens so Photography page renders correctly in dark mode.
- [x] **[THEME-6] Full Component Color Token Cleanup (~160 replacements):** Systematically replace all remaining hardcoded hex color values in `DashboardMetrics.tsx`, `MusicManager.tsx`, `BudgetLedgerManager.tsx`, `GuestListManager.tsx`, and `KanbanBoard.tsx` with centralized CSS variables. Excludes `PrintTemplatesModal.tsx` (intentionally hardcoded for print output).

---

## 📊 7. Summary Dashboard Enhancements (`DashboardMetrics.tsx`)
- [x] **[DASH-1] Interactive & Filtered KPI Navigation (`DashboardMetrics.tsx`):** Make all summary KPI cards clickable links routing directly to their corresponding tab (Guest Registry, Kanban Tasks, Budget, Music Playlist, Table Seating) with pre-applied status filters (e.g., *Attending Guests* -> Guests tab `Attending`; *Tasks To Do* -> Kanban tab `To Do`; *Pending Requests* -> Music tab `PENDING APPROVAL`).
- [x] **[DASH-2] Multi-View Section Toggles (Cards | Pie Chart | Labeled Progress Bar):** Display right-aligned header view mode icons (`LayoutGrid`, `PieChart`, `BarChart2`) on summary sections (*Checklist*, *Guest Registry & RSVP Summary*, *Music Playlist*, *Table Seating*), rendering SVG donut/pie charts with legends or labeled progress bars.
- [ ] **[DASH-3] Reorderable & Custom Summary Dashboard Layout:** Allow couples to reorder summary sections up/down and toggle section visibility via an inline layout control panel or Advanced Settings, persisting layout preferences in `localStorage` and `Settings` cell B2 JSON config.
- [x] **[DASH-4] Reception Table Seating Summary Module (`DashboardMetrics.tsx`):** Add a dedicated summary section for Table Seating displaying cards for `TOTAL TABLES`, `SEATED GUESTS`, `UNSEATED GUESTS`, and `% CAPACITY FILLED`, with optional Pie Chart and Labeled Progress Bar views.
- [x] **[DASH-5] Browser Back/Forward Tab History Navigation (`page.tsx`):** Integrate HTML5 History API (`window.history.pushState` & `popstate` event listener) to push URL hashes (`#guests?filter=Attending`, `#music?filter=PENDING%20APPROVAL`, `#budget`) when switching tabs or clicking summary KPI cards, allowing couples to navigate backward/forward through tab history using browser Back/Forward buttons.
- [ ] **[DASH-6] Photography Summary Module (`DashboardMetrics.tsx`):** Add a dedicated Photography section in Summary with Cards, Donut Chart, and Labeled Progress Bar views displaying "Total Required Shots", "Captured Shots", "Pending Shots", and "Percentage Complete".

---

## 💰 8. Ledger Budget Enhancements (`BudgetLedgerManager.tsx`)
- [x] **[BUDGET-1] Interactive Multi-Category Quick Filter Cards:** Make each category card clickable as a quick filter in `BudgetLedgerManager.tsx`. Clicking a category filters the ledger table; clicking it again deselects it. Support selecting multiple categories simultaneously for combined filtering.
- [ ] **[BUDGET-2] Inline Editable Budget Target:** Introduce an edit icon on the Total Budget KPI card allowing users to define an updated total budget directly, distinct from the Total Estimated cost.
- [ ] **[BUDGET-3] Optional Unset Budget Tracking Mode:** Provide an option to disable/unset the budget target entirely, shifting the dashboard to track Total Estimates and Actual Outlays without overage warnings.

---

## 📸 9. Photography & Shot List Manager (`PhotoShotListManager.tsx`)
- [x] **[PHOTO-1] Photography Shot List Enhancements (`PhotoShotListManager.tsx`):** Make unchecked cards have a solid black border. Set all section headers to black text. In desktop view, display each shot item as a full-width single row card with right-aligned time and bold "Who" field for maximum visual hierarchy.

---

## ⚙️ 10. Platform Infrastructure, Production Sync & Security
- [x] **[SYS-1] Purchase Activation Flow (`/activate`):** Etsy order verification API with Quick Setup and 4-screen Guided Setup Wizard.
- [x] **[SYS-2] Multi-Currency Formatting Engine:** Support for USD $, CAD $, French Canadian 35 000 $, GBP £, and EUR €.
- [x] **[SYS-3] Advanced Settings Portal:** Metadata editor, currency selector, drive inspector, feature toggles, and dev mock controls.
- [ ] **[SYS-4] Production Google OAuth 2.0 & Real Google Sheets Sync:** Connect live Google OAuth (`drive.file` scope) and Google Sheets API v4 for cell persistence in user's Google Drive (`My Drive/Wedding Planning`).
- [ ] **[SYS-5] Unified Product Usage Telemetry (GA4 Event Engine):** Google Analytics 4 event engine tracking feature usage across the Sheet2 Suite.
- [ ] **[SYS-6] Lemon Squeezy Integration & License Entitlements:** Merchant-of-Record webhook integration enforcing Basic vs Pro vs VIP feature gating.
- [ ] **[SYS-7] Security & Risk Audit:** Formula injection prevention, strict `drive.file` scope isolation, HMAC replay protection, and session cookie encryption.

---

## 🐛 9. Bug & Defect Backlog

| Defect ID | Module / Component | Issue Description | Severity | Status | Reported Date |
|---|---|---|---|---|---|
| **[BUG-1]** | Print Studio (`PrintTemplatesModal.tsx`) | Content bleeds over page borders during printing/PDF generation when table rosters or timeline lists span multiple pages. Needs smart CSS `@page` page breaks (`page-break-inside: avoid; break-inside: avoid;`) and multi-page pagination splitting. | Medium | Open | 2026-08-02 |

---

## Micro-Animations & Interactivity

| Animation | Location | Description |
|---|---|---|
| **Theme Transition** | Global (`documentElement`) | Smooth 0.2s cross-fade when switching between Editorial and Neo-Brutalism themes. |
| **Seat Node Hover** | Seating Chart Canvas | Soft scale-up and highlight outline on seat initials nodes. |
| **Active Moment Pulse** | Timeline "UP NEXT" Banner | Soft pulsing highlight on the active moment badge. |
| **Card Hover Lift** | Guest / Music / Vendor Cards | Slight `translate-y (-2px)` with shadow offset on hover. |
| **Audio Spinner** | Music Preview Player | Smooth rotating loading indicator while fetching iTunes audio previews. |
