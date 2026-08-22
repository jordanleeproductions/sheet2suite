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
- [x] **[PRINT-3] Canva Template Integration Hub & Canva Bulk Create Merge CSV Exporter:** Exporter tool to download formatted CSV files for Canva's "Bulk Create" data merge feature for place cards, table numbers, and invitation envelopes, with step-by-step Canva tutorial guide.
- [x] **[PRINT-4] Custom Print Theme & Typography Switcher:** Custom typography selector in Print Studio supporting Classic Serif, Modern Sans, Elegant Script, and Technical Monospace.
- [x] **[PRINT-5] Emoji & Decorative Icon Toggles:** Added options toggle in Print Studio for wedding ring and sparkle decorative emojis.
- [x] **[PRINT-6] Granular Card Field Controls:** Added individual field checkboxes to show/hide Table Number, Meal Selection Icon, Dietary Restrictions, and Plus-One / Party Group names on place cards.
- [x] **[PRINT-7] Strict Print Boundary & Bleed Guardrails:** Avery cardstock grid presets (Avery 5395, Avery 8371, Avery 5302), corner crop/cut markers, and 0.125" bleed safety zone overlays.
- [x] **[PRINT-9] Printable Ceremony Aisle Seating Chart Template:** Printable ceremony aisle seating diagram displaying altar arch, left/right aisle reserved family & VIP rows, central aisle walkway, and usher seating roster.
- [x] **[PRINT-11] Separate Binder Planner pages from Guest Printables:** Categorized Print Studio sidebar into 📖 Binder Planner Pages vs ✂️ Guest & Day-of Printables.
- [x] **[PRINT-12] Binder Hole Punch Margins Toggle:** Sidebar option to dynamically add a 25mm left gutter margin for 3-ring binder punch clearance during printing.
- [x] **[PRINT-14] Table Seating Roster Pagination:** Limited table rosters to 1-2 tables per page with clean CSS page breaks for legibility.

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
- [x] **[VND-2] Payment Due Date Reminder Badges:** Highlights upcoming payment due dates within 30 days (`DUE IN Xd`) and flags past-due balances (`OVERDUE (Xd)`) with alert badges when balance is owing.
- [x] **[VND-3] Category Breakdown Stat Badges:** Category summary breakdown displaying vendor count and total contract cost per category with interactive quick-filter toggles.
- [x] **[VND-4] Vendor Portal Share Link Generator:** Embedded VendorShareLinkManager section allowing instant generation and access control for mobile vendor portals (*Music, Photos, Catering, Timeline*).
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
- [x] **[THEME-3] Expanded Aesthetic Engine (Botanical Romance, Midnight Tuxedo):** Added two new design system themes to the `theme.css` engine with unique color palettes, typography, and styling properties.
- [x] **[THEME-4] Semantic Color Token Expansion (`theme.css`):** Added CSS custom properties across all theme variants to eliminate hardcoded hex values.
- [x] **[THEME-5] PhotoShotListManager Dark Mode Fix:** Replaced hardcoded `#000000` inline styles so Photography page renders correctly in dark mode.
- [x] **[THEME-6] Full Component Color Token Cleanup:** Systematically replaced hardcoded hex color values across components with CSS variables.
- [x] **[NAV-2] Font Size Scaler Controls:** Added `+` and `-` buttons in Quick Settings and Advanced Settings Modal for accessibility scaling 80%-120%.
- [x] **[UX-7] Migrate `!important` Overrides to Semantic CSS Specificity:** Removed unnecessary `!important` from layout classes (`.kpi-grid`, `.photo-shot-card`, `.photo-shots-list`), dark mode color rules (timeline body, kanban columns, category chips, totalCard), badge utilities (`.badge-green`, `.badge-gold`, `.badge-red`), modal headers, sync banner, settings dropdown, and vendor card headers. Replaced over-budget card with `:where()` pseudo-class specificity. Retained `!important` only where React inline `style` props require cascade-trump overrides, annotated with `/* cascade-trump: overrides inline style */` comments.
- [x] **[UX-1] Font Variable Chain Verification:** Confirmed Google Fonts variables in `layout.tsx` match `theme.css` font fallbacks across all 4 design styles.
- [x] **[UX-2] Theme-Aware Modal Header Contrast Fix:** Replaced blanket `#000000 !important` override in `globals.css` with `var(--color-on-primary)` token inheritance, restoring high-contrast white header text in Editorial Dark and Neo-Brutalism Dark modes.
- [x] **[UX-3] Settings Dropdown Dark Mode Contrast:** Fixed selected button text contrast in Tuxedo Dark mode so white-on-white text is avoided.
- [x] **[UX-4] Error Box Color Tokens:** Replaced hardcoded `#fee2e2` and `#ef4444` styles in error box with `var(--color-red-muted)` and `var(--color-red)` tokens.
- [x] **[UX-5] Auth Status Box Tokenization:** Replaced hardcoded `#eef2f7` with `var(--color-bg-subtle)` token.
- [x] **[UX-6] Sync Banner Background Tokenization:** Replaced hardcoded `#f8f9fa` with `var(--color-bg-subtle)` token.
- [x] **[UX-8] Dark Theme Token Completeness:** Added missing `--border-radius-*`, `--border-width`, and `--transition-smooth` token declarations to `Botanical Romance Dark` and `Midnight Tuxedo Dark` in `theme.css`.
- [x] **[UX-9] Modal Header Pattern Standardization:** Standardized header structure across all modal components with uniform icons, titles, close buttons, and `className="modalHeader"`.
- [x] **[UX-10] Modal Header CSS Class Coverage:** Ensured all modal headers (`MenuSetupManager`, `VendorShareLinkManager`, `ShareModal`, `AdvancedSettingsModal`, `PrintTemplatesModal`) have `className="modalHeader"` attached.
- [x] **[UX-11] Touch Target Color Preset Swatches:** Expanded quick settings primary color swatches from 20px to 28px for better mobile touch usability.
- [x] **[UX-12] Design Style Subtitle Descriptions:** Added descriptive hover tooltips and labels to Quick Settings design system selector buttons.
- [x] **[UX-15] Elevated Dark Mode Toast Notifications:** Updated `ToastNotification.tsx` background token to `var(--color-bg-hover)` to ensure clear visual elevation above page canvas in dark mode.
- [x] **[NAV-SWIPE] Mobile Gestures & Swipe Sheet:** Swipe-up from mobile bottom nav reveals categorized module drawer; swipe-down on drag handle dismisses drawer.
- [x] **[NAV-HAPTIC] Mobile Web Micro-Haptic Feedback:** Added safe `triggerHaptic()` feedback on mobile bottom nav tab clicks, drawer module selection, and theme toggles via `navigator.vibrate`.

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
- [x] **[BUDGET-4] Secondary Expenses Log Table & Dynamic Budget Calculations:** Added dedicated secondary Expenses table (`'EXPENSES'` tab / `'Expenses'` sheet table) to record individual itemized purchases (`Item ID`, `Description`, `Category`, `Actual Cost`, `Amount Paid`, `Purchase Date`, `Notes`). Renamed primary header button to `NEW BUDGET` and added secondary header button `NEW EXPENSE`. Logged expenses dynamically calculate category actual costs, amounts paid, remaining headroom, and summary dashboard metrics.

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
- [x] **[NAV-1] Sticky Collapsible Left Sidebar Navigation:** Added desktop wide-screen left sidebar layout option alongside top navbar.
- [x] **[NAV-MOBILE-THUMB] Mobile Ergonomic Thumb-Zone Navigation & Categorized Bottom Sheet Drawer (`src/app/vow/page.tsx`):** Added a persistent glassmorphism bottom navigation bar pinned to the bottom of mobile screens ($\le 768\text{px}$) with 1-tap thumb access to the 4 core daily modules (*Summary*, *Guests*, *Budget*, *Timeline*) plus an active `MORE (☰)` trigger button with live active dot indicators. Upgraded the mobile drawer into an ergonomic bottom sheet drawer sliding up from the bottom with a drag handle, 3 categorized module groups (*Guests & Hospitality*, *Logistics & Budget*, *Day-Of Media & Tasks*), quick action buttons (*Print*, *Share*, *Config*), and 5.5rem safe-area padding.
- [x] **[ONBOARD-1] Express Mode ("Jump Right In") 1-Click Launch:** Added prominent 1-click button (`⚡ EXPLORE DEMO WORKSPACE (JUMP RIGHT IN)`) to instant-load sample wedding workspace without registration forms.
- [x] **[ONBOARD-2] Unified Onboarding Wizard Component:** Created standalone `OnboardingWizard.tsx` component supporting `express`, `quick`, and 4-step `guided` setup modes.
- [x] **[SUITE-SHOWCASE] Multi-Product Ecosystem Showcase Landing Page (`src/app/page.tsx`):** Refreshed parent `sheet2suite.com` landing page showcasing flagship products (*Sheet2Vow*, *Sheet2Build*, *Sheet2Finance*, *Sheet2Home*, *Sheet2Harvest*) with interactive category filter tabs, feature matrices, Sheet2Suite Master Pass bundle card, and data sovereignty guarantees.
- [x] **[ONBOARD-3] Visual Task Preset Selector Cards:** Interactive visual cards (*Traditional*, *Destination*, *Micro-Wedding*, *DIY*) featuring category badges, descriptions, and task preview pills.
- [x] **[ONBOARD-4] Visual Drive Target Directory Selector Cards:** Interactive visual selection cards replacing plain `<select>` dropdown for Drive folder selection (`Default`, `Root`, `Dedicated App`).
- [x] **[ONBOARD-5] Partner & Spouse Quick Invite Step:** Step 4 inline invite input in `OnboardingWizard.tsx` to pre-configure spouse co-admin permissions.
- [x] **[ONBOARD-6] Demo Workspace Status Banner & Conversion Shortcut:** Displays active demo workspace notification bar with 1-click `[CONNECT GOOGLE DRIVE SHEET]` shortcut.
- [x] **[LIFE-1] Reconnect Existing Sheet Onboarding Hub:** Segmented onboarding selector hub allowing users on new devices to reconnect via Drive auto-detect, Etsy Order ID, or Sheet URL.
- [x] **[LIFE-2] 1-Click Google Drive Sheet Scanner:** Drive scanner modal presenting detected Sheet2Vow spreadsheets in Google Drive for 1-tap reconnection.
- [x] **[LIFE-3] Multi-Workspace Switcher Dropdown:** Header & Quick Settings dropdown storing `s2v_workspaces[]` list so pro planners can switch client weddings in 1 click.
- [x] **[LIFE-4] Post-Activation & Reconnection Guidance Banner:** Reassuring notification banner displaying Google Drive folder path, re-entry bookmark URL, and Spreadsheet ID.
- [x] **[LIFE-5] Sheet2Suite Shared Activation Engine:** Subdomain route middleware (`src/middleware.ts`), multi-SKU Order ID verification, and Sheet2Suite Product Hub selector.
- [x] **[ACTIVATION-1] Mobile-Optimized Order Verification & Step 1 Setup Flow (`/activate`):** Fluid responsive card padding, 16px iOS auto-zoom prevention inputs, 48px touch targets, full-width Google Drive target directory pills, and stacked Quick vs. Guided cards with selectable states.
- [x] **[ACTIVATION-3] Redesigned 4-Screen Guided Setup Wizard Flow (`/activate`):**
  - **Screen 1**: Wedding Details (Couple Name/Title, Wedding Date) + Up to 2 Additional Co-Admin User Access.
  - **Screen 2**: Feature & Module Enablement (Financials, Guests, Itinerary, Tasks, Vendors, Music) with settings reassurance note.
  - **Screen 3**: Feature Details (Budget & Currency if Financials enabled; Preset Pack vs Clean Slate + granular Task Checklist item preview with check/uncheck toggles if Tasks enabled).
  - **Screen 4**: Workspace Experience & UI Customization (Theme: Editorial Elegance, Neo-Brutalism, Botanical Romance, Midnight Tuxedo; Light/Dark Mode; Nav Layout: Left-Hand Sidebar vs Top Header, defaulting to Left-Hand Nav).
- [x] **[ACTIVATION-4] Mobile-Friendly Setup Shortcuts, Action Button Elevation & Google Drive Picker Modal:**
  - **Full-Width Mobile Preselected Shortcuts**: Preselected Drive shortcut buttons span full container width on mobile breakpoints (`.preselected-shortcuts-grid`) instead of squeezing on one row.
  - **Google Drive Authentication Gating for Picker**: Disabled and visually gated the "Browse Google Drive" button until user completes Google OAuth sign-in.
  - **Action Button Visual Contrast & Colors**: Upgraded primary, secondary, and utility buttons with distinct background fills, elevated borders, and crisp contrast so interactive actions stand out immediately from form cards.
  - **Responsive Mobile Google Drive Picker Modal (`GoogleDrivePickerModal.tsx`)**: Upgraded Drive picker modal with responsive viewport height bounds, horizontal scrollable navigation pill tabs on mobile (<640px) replacing desktop sidebar, full-touch rows (48px+), and stacked action footer with prominent blue confirmation buttons.
- [x] **[ACTIVATION-5] Live Master Google Sheet Real-Time Exporter & Setup Form Ergonomics:**
  - **Real-Time Master Sheet Cloner (`src/lib/sheets/masterTemplateExporter.ts`)**: Server-side exporter streaming the exact live binary export buffer of the official Master Google Sheet into the customer's Google Drive via `drive.files.create({ mimeType: 'application/vnd.google-apps.spreadsheet' })`, providing 100% template fidelity under the minimal `drive.file` scope without cross-tenant Google Drive API copy permission blocks.
  - **Clean-Slate Wedding Title Input**: Removed prefilled `"Our Wedding"` default across Step 1 and Quick Setup, allowing users to type immediately without backspacing.
  - **Zero-Clearing Financial Budget Field**: Budget input initializes to `0`, clears completely on focus/click, and seamlessly handles backspacing/deletion of leading zeros.
- [x] **[ACTIVATION-6] Automated Dropdown Validation Preservation & Settings Tab Range Linking:**
  - **Dynamic In-Cell Dropdown Preserver (`src/lib/sheets/dropdownValidator.ts`)**: Automated Google Sheets API `setDataValidation` engine that scans table headers across all 10 tabs and applies `ONE_OF_RANGE` validation linked to the `'Settings'` lookup columns (`=Settings!$A$2:$A$50`, `=Settings!$D$2:$D$50`, etc.) with `showCustomUi: true` interactive dropdown arrow pills.
  - **Settings Dropdown Cell Protection**: Relocated system JSON configuration storage from `Settings!B2` (which conflicted with `Table Shapes`) to `Settings!Z1`, preserving 100% of Settings lookup lists and preventing formula `#REF!` degradation.
  - **Post-Provision & Sync Dropdown Repair (`/api/provision`, `/api/sync`)**: Automatically applies dropdown validations during provisioning and exposes `sheetType: 'repair_dropdowns'` for on-demand table validation restoration.
- [x] **[NAV-ENFORCE] Enforced Navigation Architecture & Optional Dual Top Nav Bar:**
  - **Hard-Enforced Desktop & Mobile Layouts**: Desktop layout strictly enforces the sticky collapsible left sidebar, while mobile devices strictly enforce the bottom nav bar with thumb-accessible drawer button.
  - **Optional Top Navigation Bar Setting**: Added an optional **Top Navigation Bar** toggle setting (default: `OFF`) in `AdvancedSettingsModal.tsx`, `VowSetupWizard.tsx` (Step 4), `WelcomeGuideCard.tsx`, and `vow/page.tsx`, allowing users to optionally enable a dual top navbar while keeping the main canvas clean by default.
- [x] **[ONBOARD-7] Bride & Groom Profile Step in Guided Setup:**
  - **Dedicated Bride & Groom Setup Step**: Added Guided Setup Step 2 (`VowSetupWizard.tsx`), allowing couples to define Partner 1 (Bride/Spouse A) and Partner 2 (Groom/Spouse B) with First/Last Name and optional Email/Phone.
  - **Automatic Co-Admin Invite Checkbox**: Integrated partner email sync with partner co-admin access (`grantPartner2Admin`), automatically granting Google Drive and app editing access.
  - **Automatic Guest Registry Provisioning (`/api/provision`)**: Automatically provisions Partner 1 (`G1`) and Partner 2 (`G2`) as the first 2 guest entries under `Sweetheart Table` in the customer's `GUESTS` Google Sheet.
- [x] **[VND-6] Vendor Contract Upload & Google Drive "Contracts" Folder Storage:**
  - **Google Drive Contract Upload API (`/api/upload/contract`)**: API route accepting contract document files (PDF, PNG, JPG, WEBP, DOC, DOCX up to 10MB) and automatically provisioning a dedicated `Contracts` subfolder inside the couple's selected Google Drive workspace folder.
  - **Modal Upload UI & Contract Attachment (`VendorManager.tsx`)**: Integrated single-click file upload trigger alongside standard URL input in the Add/Edit Vendor modal. Automatically uploads attachments to Google Drive and populates the `contractLink` property with the file's Google Drive `webViewLink`.

---
---

# SECTION 2: 📋 PENDING FEATURE BACKLOGS

Pending roadmap features and backlog items have been reorganized into specialized tracking documents:

- 💍 **[Sheet2Vow Pending Feature Backlog](sheet2vow_backlog.md)**: Pending features, print enhancements, calendar/task integrations, dual seating columns, and vendor contract uploads specific to Sheet2Vow.
- 📦 **[Sheet2Suite Platform Pending Backlog](sheet2suite_backlog.md)**: Platform infrastructure, Lemon Squeezy / Etsy licensing webhooks, multi-product suite switcher, telemetry, and security audit tasks across the Sheet2Suite ecosystem.

---

## SECTION 3: 🐛 BUG & DEFECT BACKLOG

| Defect ID | Module / Component | Issue Description | Severity | Status | Reported Date |
|---|---|---|---|---|---|
| **[BUG-1]** | Print Studio (`PrintTemplatesModal.tsx`) | Content bleeds over page borders during printing/PDF generation when table rosters or timeline lists span multiple pages. Needs smart CSS `@page` page breaks (`page-break-inside: avoid; break-inside: avoid;`) and multi-page pagination splitting. | Medium | Resolved | 2026-08-02 |
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

---
## SECTION 5: 🧹 CODEBASE CLEANUP, SIMPLIFICATION & REFACTORING BACKLOG

| Item ID | Task Category | Description & Refactoring Strategy | Target Files | Priority | Status |
|---|---|---|---|---|---|
| **`[ACTIVATION-5]`** | Workaround 1: Live Real-Time Master Template Exporter & Google Drive Conversion Engine (Fetches binary XLSX from `DEFAULT_MASTER_SHEET_ID` and converts directly via `drive.files.create` under `drive.file` scope) | `masterTemplateExporter.ts`, `/api/provision/route.ts` | 🔴 High | ⚡ High | ✅ Completed |
| **`[ACTIVATION-6]`** | Automatic Dropdown Validation Preservation Engine (Applies Google Sheets API `setDataValidation` with `ONE_OF_RANGE` rules linking table columns to `Settings` tab dropdown ranges across all 14 tabs) | `dropdownValidator.ts`, `/api/provision/route.ts`, `/api/sync/route.ts` | 🔴 High | ⚡ High | ✅ Completed |
| **`[ACTIVATION-7]`** | First-Time Workspace Welcome & UX Education Info Card (High-contrast indigo/violet info card replacing Executive Summary for new workspaces; teaches Themes, Light/Dark Mode, and Left Sidebar vs Top Nav; persists dismissal state in `Settings!Z1` and `localStorage`) | `WelcomeGuideCard.tsx`, `DashboardMetrics.tsx`, `vow/page.tsx`, `/api/sync/route.ts` | 🟡 Medium | ⚡ Med | ✅ Completed |
| **`[ACTIVATION-8]`** | Workspace User Profile & Typography Polish (Restores persistent Google profile picture & user display name from localStorage; adds 1-click 'Open Google Spreadsheet' button in profile menu; enforces #0D1B2A Royal Navy default for Editorial light theme; preserves authentic Playfair Display newspaper serif headers for Editorial workspace while keeping Hub/Activation fixed modern sans) | `src/app/vow/page.tsx`, `src/app/activate/page.tsx`, `src/lib/themePresets.ts`, `src/app/theme.css` | 🟡 Medium | ⚡ Low | ✅ Completed |
| **`[UX-BULK-LOAD]`** | Rapid Data Entry 3-Button Modal Workflow ("Save & Add New" bulk loading action across Guests, Vendors, Music, Tasks, Photos, Budget, Timeline, Gifts, Menu, and Seating Table modals; persists the record and instantly cycles the form for the next record) | `GuestListManager.tsx`, `VendorManager.tsx`, `MusicManager.tsx`, `KanbanBoard.tsx`, `PhotoShotListManager.tsx`, `BudgetLedgerManager.tsx`, `TimelineManager.tsx`, `ThankYouManager.tsx`, `MenuSetupManager.tsx`, `SeatingChartManager.tsx` | 🔴 High | ⚡ High | ✅ Completed |
| **`[CLEAN-1]`** | Component Monolith Decomposition | Decompose `src/app/vow/page.tsx` (~2,900 lines) into modular subcomponents: `VowHeader.tsx` (top navigation bar), `VowSidebarNav.tsx` (sidebar & drawer navigation), and `VowDisconnectModal.tsx` (disconnect dialog). | `src/app/vow/page.tsx`, `src/components/vow/` | 🔴 High | ✅ Completed |
| **`[CLEAN-2]`** | Activation Wizard Decomposition | Decompose `src/app/activate/page.tsx` (~1,285 lines) into modular step components: `StepOrderVerification.tsx` (Step 0), `StepPackageHub.tsx` (Step 1), and `StepSetupForm.tsx` (Step 2). | `src/app/activate/page.tsx`, `src/components/activate/` | 🔴 High | ✅ Completed |
| **`[CLEAN-3]`** | Database Layer Unification | Eliminate legacy dual-writes to raw `licenses.json`/`workspaces.json` files and unify all DB operations strictly onto `LocalFirestore` (`firestoreDb.ts`). | `src/lib/db/licensingDb.ts`, `src/lib/db/firestoreDb.ts` | 🟡 Medium | ✅ Completed |
| **`[CLEAN-4]`** | Domain Schema Centralization | Consolidate fragmented TypeScript interfaces (`Guest`, `Vendor`, `BudgetItem`, `TaskItem`, `WorkspaceRecord`, `LicenseRecord`) into `src/types/wedding.ts` and `src/types/licensing.ts`. | `src/types/wedding.ts`, `src/types/licensing.ts` | 🟡 Medium | ✅ Completed |
| **`[CLEAN-5]`** | API Response Normalization | Create standard API helper functions (`apiResponse.success()`, `apiResponse.unauthorized()`, `apiResponse.error()`) to standardize error and status payloads across API endpoints. | `src/lib/core/apiResponse.ts`, `src/app/api/` | 🟡 Medium | ✅ Completed |
| **`[CLEAN-6]`** | CSS Utility Token Cleanup | Extract recurring inline React `style={{ ... }}` patterns (modal headers, badge pills, card containers) into reusable CSS utility classes in `globals.css`. | `src/app/globals.css`, `src/app/theme.css` | 🟢 Low | ✅ Completed |
