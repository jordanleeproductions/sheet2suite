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
- [x] **[PRINT-12] Binder Hole Punch Margins Toggle:** Sidebar option to dynamically add a 25mm left gutter margin for 3-ring binder punch clearance during printing.

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
- [x] **[UX-13] Explicit Color Reset Label:** Updated color reset button label to "RESET TO DEFAULT" with explicit hover tooltip.
- [x] **[UX-15] Elevated Dark Mode Toast Notifications:** Updated `ToastNotification.tsx` background token to `var(--color-bg-hover)` to ensure clear visual elevation above page canvas in dark mode.

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
- [x] **[NAV-1] Sticky Collapsible Left Sidebar Navigation:** Added desktop wide-screen left sidebar layout option alongside top navbar.
- [x] **[ONBOARD-1] Express Mode ("Jump Right In") 1-Click Launch:** Added prominent 1-click button (`⚡ EXPLORE DEMO WORKSPACE (JUMP RIGHT IN)`) to instant-load sample wedding workspace without registration forms.
- [x] **[ONBOARD-2] Unified Onboarding Wizard Component:** Created standalone `OnboardingWizard.tsx` component supporting `express`, `quick`, and 4-step `guided` setup modes.
- [x] **[ONBOARD-3] Visual Task Preset Selector Cards:** Interactive visual cards (*Traditional*, *Destination*, *Micro-Wedding*, *DIY*) featuring category badges, descriptions, and task preview pills.
- [x] **[ONBOARD-4] Visual Drive Target Directory Selector Cards:** Interactive visual selection cards replacing plain `<select>` dropdown for Drive folder selection (`Default`, `Root`, `Dedicated App`).
- [x] **[ONBOARD-5] Partner & Spouse Quick Invite Step:** Step 4 inline invite input in `OnboardingWizard.tsx` to pre-configure spouse co-admin permissions.
- [x] **[ONBOARD-6] Demo Workspace Status Banner & Conversion Shortcut:** Displays active demo workspace notification bar with 1-click `[CONNECT GOOGLE DRIVE SHEET]` shortcut.
- [x] **[LIFE-1] Reconnect Existing Sheet Onboarding Hub:** Segmented onboarding selector hub allowing users on new devices to reconnect via Drive auto-detect, Etsy Order ID, or Sheet URL.
- [x] **[LIFE-2] 1-Click Google Drive Sheet Scanner:** Drive scanner modal presenting detected Sheet2Vow spreadsheets in Google Drive for 1-tap reconnection.
- [x] **[LIFE-3] Multi-Workspace Switcher Dropdown:** Header & Quick Settings dropdown storing `s2v_workspaces[]` list so pro planners can switch client weddings in 1 click.
- [x] **[LIFE-4] Post-Activation & Reconnection Guidance Banner:** Reassuring notification banner displaying Google Drive folder path, re-entry bookmark URL, and Spreadsheet ID.
- [x] **[LIFE-5] Sheet2Suite Shared Activation Engine:** Subdomain route middleware (`src/middleware.ts`), multi-SKU Order ID verification, and Sheet2Suite Product Hub selector.

---
---

# SECTION 2: 📋 PENDING FEATURE BACKLOG

### ⚙️ General & Platform Infrastructure

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SYS-4A]`** | Production Google OAuth 2.0 & `drive.file` Scope Auth Plumbing | `/api/auth/google` | 🔴 High | ⚡ High (~3-4 turns) | Pending |
| **`[SYS-4B]`** | Automated Google Drive Folder & Master Template Sheet Provisioning | `/api/provision` | 🔴 High | ⚡ High (~3-4 turns) | Pending |
| **`[SYS-4C]`** | Upload Master Google Sheet Database Template File (`.xlsx` / schema) to Repo | `templates/` | 🟢 Low | ⚡ Low (~1 turn) | Pending |
| **`[SYS-5]`** | Unified Product Usage Telemetry (GA4 Event Engine) | `telemetry.ts` | 🟡 Medium | ⚡ Low (~2 turns) | Pending |
| **`[SYS-6]`** | Lemon Squeezy Integration & License Entitlements | `/api/webhook` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[SYS-7]`** | Security & Risk Audit (formula injection prevention, HMAC replay guard) | `security.ts` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |

### 🧭 Navigation & Settings

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[NAV-1]`** | Sticky Collapsible Left Sidebar Navigation setting instead of top navbar | `page.tsx` | 🔴 High | ⚡ Med (~3-4 turns) | ✅ Completed |
| **`[NAV-2]`** | Font Size Scaler Controls (`+` and `-` buttons in Quick Settings and Advanced Settings Modal for accessibility scaling 80%-120%) | `vow/page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |

### 🚀 Onboarding & Registration UX

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[ONBOARD-1]`** | Express Mode ("Jump Right In") 1-Click Launch button for instant demo workspace | `page.tsx` | 🟢 Low | ⚡ Low (~1-2 turns) | ✅ Completed |
| **`[ONBOARD-2]`** | Unified Onboarding Wizard Component (`OnboardingWizard.tsx`) (`express` \| `quick` \| `guided`) | `OnboardingWizard.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[ONBOARD-3]`** | Visual Task Preset Selector Cards (*Traditional*, *Destination*, *Micro-Wedding*, *DIY*) | `page.tsx` | 🟢 Low | ⚡ Low (~1-2 turns) | ✅ Completed |
| **`[ONBOARD-4]`** | Visual Drive Target Directory Selector Cards | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[ONBOARD-5]`** | Partner & Co-Planner Quick Invite Step (Guided Setup Step 4) | `OnboardingWizard.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[ONBOARD-6]`** | Demo Workspace Status Banner & 1-Click Google Drive Conversion Shortcut | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |

### 🔑 User Lifecycle, Multi-Device Re-entry & Pro Switching

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[LIFE-1]`** | "Reconnect Existing Sheet" Onboarding Tab (Google Drive Auto-Detect, Etsy Order ID, Sheet URL) | `page.tsx` | 🟡 Medium | ⚡ Low (~2 turns) | ✅ Completed |
| **`[LIFE-2]`** | 1-Click Google Drive Sheet Scanner & Reconnection Modal | `page.tsx` | 🟡 Medium | ⚡ Med (~2 turns) | ✅ Completed |
| **`[LIFE-3]`** | Multi-Workspace Switcher Dropdown (`s2v_workspaces[]`) for Pro Planners | `page.tsx` | 🟡 Medium | ⚡ Med (~2 turns) | ✅ Completed |
| **`[LIFE-4]`** | Post-Activation Guidance Banner (Drive folder path, bookmark link, Sheet ID) | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[LIFE-5]`** | Sheet2Suite Shared Activation Engine (`activate.sheet2suite.com` multi-SKU entitlement lookup) | `/api/verify-order` | 🔴 High | ⚡ High (~3-4 turns) | ✅ Completed |

### 🖨️ Print Studio & Canva Exporter

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[PRINT-3]`** | Canva Template Integration Hub & Canva Bulk Create Merge CSV Exporter | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[PRINT-4]`** | Custom Print Theme & Typography Switcher (Serif, Sans, Script, Mono) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Low (~2 turns) | ✅ Completed |
| **`[PRINT-7]`** | Strict Print Boundary & Bleed Guardrails (Avery cardstock grid dimensions) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[PRINT-8]`** | Full Wedding Planner Binder Printout (combines all modules into bound book) | `PrintTemplatesModal.tsx` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[PRINT-9]`** | Printable Ceremony Aisle Seating Chart Template | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[PRINT-10]`** | Responsive Mobile Print Studio layout redesign | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-11]`** | Separate Binder Planner pages from Guest Printables (place cards, QR cards) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[PRINT-13]`** | Batch Combined Binder Export or Individual Section PDF downloads | `PrintTemplatesModal.tsx` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[PRINT-14]`** | Table Seating Roster Pagination: Limit to 1-2 tables per page for legibility | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[PRINT-15]`** | Dedicated Canva Bulk Create Hub Screen with Data Field Selector & Live Sample CSV Preview | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-16]`** | Print Studio Top Toolbar (Toggles: Hide Title/Date, Paper Size A4/Letter, Emoji Toggle, B&W/Color) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-17]`** | Dynamic QR Code Generator Engine for Photo Upload & Song Request Display Cards | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2 turns) | Pending |
| **`[PRINT-18]`** | High-Contrast "EXIT STUDIO" Header Action Button Styling | `PrintTemplatesModal.tsx` | 🟢 Low | ⚡ Low (~1 turn) | Pending |
| **`[PRINT-19]`** | Top Header Primary `[ 🖨️ PRINT PAGE ]` Action Button Placement | `PrintTemplatesModal.tsx` | 🟢 Low | ⚡ Low (~1 turn) | Pending |

### 🔗 Public Portals

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SHARE-4]`** | Spouse & Partner Co-Planning Access (delegate Drive read/write permissions) | `page.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |

### 🎨 UX / UI Design & Accessibility (from UX Audit Report)

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[UX-1]`** | Verify & fix Botanical/Tuxedo font variable chain | `layout.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-2]`** | Fix modal header contrast across all 8 theme combos | `globals.css` | 🟡 Medium | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-3]`** | Fix settings dropdown button contrast in Tuxedo/Botanical Dark | `globals.css` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-4]`** | Use color tokens for error boxes (`var(--color-red-muted)`) | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-5]`** | Use `var(--color-bg-subtle)` for onboarding auth status box | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-6]`** | Use token for sync banner background (`var(--color-bg-subtle)`) | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-7]`** | Migrate `!important` overrides to semantic CSS classes | `globals.css` | 🔴 High | ⚡ Med (~3-4 turns) | Pending |
| **`[UX-8]`** | Add missing border-radius tokens to Botanical/Tuxedo Dark | `theme.css` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-9]`** | Standardize modal header pattern across all components | Components | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[UX-10]`** | Add `className="modalHeader"` to all modal headers | Components | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-11]`** | Increase color preset swatch dot size to 28px | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-12]`** | Add design style subtitle descriptions in Quick Settings | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-13]`** | Clarify "RESET" button label and behavior to "RESET TO DEFAULT" | `page.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |
| **`[UX-14]`** | Consider tab grouping to reduce navigation count | `page.tsx` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[UX-15]`** | Elevated toast background in dark mode (`var(--color-bg-hover)`) | `ToastNotification.tsx` | 🟢 Low | ⚡ Low (~1 turn) | ✅ Completed |

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
