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
- [x] **[SEAT-2WAY-SYNC] 2-Way Google Sheets Sync for Tables & Clean Initial State (`TABLES` Tab):** Full bi-directional synchronization between the app and the `TABLES` spreadsheet tab. Persists custom table additions, edits, and deletions across devices. Cleaned default initial state so only the Sweetheart table is present by default instead of cluttering mock tables.
- [x] **[SEAT-DECLINED-EXCLUSION] Exclude Declined Guests from Seated & Unassigned Seating Counts (`SeatingChartManager.tsx`):**
  - Updated "Seated Guests" KPI card to strictly count guests who have Accepted (Attending) or Pending RSVP, excluding Declined guests from both the numerator and the total denominator (`seatedGuestsCount / eligibleSeatingGuests.length`).
  - Filtered "Unassigned Guests" pool and KPI counter to only account for unassigned guests with Accepted or Pending RSVP, removing Declined guests who do not require a seat.
  - Synchronized Unassigned Guests drawer count and Add/Assign seat dialog header unassigned counters.
- [x] **[SEAT-SHAPE-COLOR-AND-SWEETHEART-NUMBERING-OFFSET] Table Card Shape Icon Color Sync & Sweetheart Table Numbering Offset (`SeatingChartManager.tsx`):**
  - Synchronized the table geometry icon color (Circle, Square, Rectangle) in table card headers to match the Table Name typography color (`var(--color-text, currentColor)`), replacing hardcoded highlight gold.
  - Updated `getNextSuggestedTableNumber` to check for non-numbered Sweetheart or Head tables. When dynamically calculating default table numbers from total tables, it offsets special tables by 1 so the first numbered table created after a Sweetheart or Head table correctly defaults to "Table 1" instead of "Table 2".

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
- [x] **[GUEST-CARD-REDESIGN] Responsive Guest Card Layout & Data Density:** Redesigned guest cards with dedicated contact row, 2x2 structured meta chips for Reception Table, Ceremony Seating, Meal Choice, and Dietary Restrictions with ellipsis truncation, eliminating content bleeding across mobile and desktop viewports.
- [x] **[GUEST-MOBILE-HEADER-UI-REFACTOR] Mobile View Header & Filter Ergonomics:** Moved grouping selector (`ALL GUESTS`, `BY SEATING TABLE`, `BY PARTY GROUP`) above the search bar in the filter section for cleaner thumb access. Placed `+ ADD GUEST` button on its own dedicated full-width row with responsive sizing matching other managers, freeing up top actions to hold Cards/List layout switcher and CSV/Print studio shortcuts.
- [x] **[RECEPTION-TABLES-SYNC-AND-GUEST-LINK] Reception Table Seating Sync & Guest Table ID Linkage (`TABLES` & `GUESTS` Tab):**
  - Eliminated phantom/ghost tables by removing fallback generated timestamp IDs during row hydration and strictly filtering empty rows without valid `tableId` in `GET /api/sync`, `POST /api/sync`, and `SeatingChartManager.tsx`.
  - Linked guest `tableAssignment` directly to canonical `tableId` matching the `TABLES` tab Column A while seamlessly supporting legacy name matching.
  - Updated Add/Edit guest dropdown in `GuestListManager.tsx` to list configured tables with `tableId` values and `${tableName} (${tableId})` labels.
  - Synchronized Print Studio (`PrintTemplatesModal.tsx`), table reassignment popups, seating diagrams, and relational capacity calculations (`relationalSync.ts`) to resolve human-readable table names from `tableId`.
- [x] **[SEATING-SEQUENTIAL-TABLE-IDS] Human-Readable Sequential & Semantic Table ID Generation (`SeatingChartManager.tsx`):**
  - Replaced machine timestamp IDs (`table-1725...`) with human-readable sequence-based (`table-1`, `table-2`, `table-3`) and semantic (`table-sweetheart`, `table-vip-head`) IDs.
  - Integrated smart gap-filling for suggested table numbers (`getNextSuggestedTableNumber`) and robust collision handling with suffix increments.
  - Keeps Column A of the `TABLES` tab and manual guest table assignments in Google Sheets clean, predictable, and human-friendly.
- [x] **[SEATING-POPUP-ENHANCE] Seated Guest Profile Popup & Seating Icon Upgrade (`SeatingChartManager.tsx`, `src/app/vow/page.tsx`):**
  - Replaced generic `Grid` icon with `Armchair` chair icon across mobile navigation drawer, desktop sidebar, and module selector menus.
  - Updated seated guest popup "Unassign Seat" button to reference the human-readable Table Name instead of raw Table ID (e.g. `UNASSIGN SEAT FROM SWEETHEART TABLE`).
  - Removed contact info (email/phone) from seating popup and placed Meal Selection prominently above Dietary Restrictions.
- [x] **[GUEST-DECLINED-LOCK] Declined RSVP Meal & Seating Invalidation Rule:** Automatically clears and disables reception table assignments, ceremony seating, and meal choice selections when a guest's RSVP is set to `Declined`. Hides the 4 inner meta chips (*Reception*, *Ceremony*, *Meal*, *Diet*) on the guest card for a cleaner declined view, and excludes declined guests from seating assignment picker modals.

---

## 🍽️ 5. Menu & Catering Setup (`MenuSetupManager.tsx`)
- [x] **[MENU-1] Header Action Realignment:** Moved "Add Menu Item" button to the far right side of the header.
- [x] **[CATERING-2WAY-SYNC] 2-Way Google Sheets Sync for Catering Menu (`CATERING` Tab):** Full bi-directional synchronization between the app and the `CATERING` spreadsheet tab. Automatically links Course Category to `=SETTINGS!$P$2:$P$50`, populates entree choices into the Guest Registry, and retains cross-device menu changes.
- [x] **[MENU-DELETE-MODAL] In-App Delete Menu Item Confirmation Modal:** Replaced native browser `window.confirm()` popup with a styled, accessible in-app modal featuring item name highlights, descriptive impact details, and responsive action buttons.
- [x] **[MENU-SEQUENTIAL-ITEM-IDS] Human-Readable Sequential Catalog Code Generation (`M101`, `M102`, ...):** Replaced random machine timestamp IDs (`menu-1725...`) with clean, sequential catalog codes (`M101`, `M102`, `M108`, etc.) matching the master spreadsheet schema contract. Added smart gap-filling for deleted items and visible monospace SKU badges on menu cards for effortless cross-referencing with the `CATERING` tab.
- [x] **[SYNC-RESILIENT-OPTIONAL-TABS] Resilient Google Sheets Dynamic Tab Querying & Auto-Provisioning (`/api/sync`):**
  - Updated `GET /api/sync` to only register cell ranges in Google Sheets API `batchGet` for tabs that actually exist in the connected workbook. Prevents fatal `400 Bad Request: Unable to parse range: 'CATERING'!A1:I1000` errors when opening older spreadsheets created before the `CATERING` or other newer tabs existed.
  - Dynamically initializes missing optional tabs with empty arrays (`catering: []`, `tables: []`) during read sync.
  - Updated `POST /api/sync` to automatically create missing sheet tabs on the fly via `addSheet` batch updates and safely clear rows starting at row 2 when users add records to an older sheet.


---

## 🔗 6. Tokenized Vendor Share & Public Guest Portals
- [x] **[SHARE-1] Cryptographic Token Engine (`token.ts`):** HMAC-SHA256 tokenized vendor share links (`/share/[token]`) with scope isolation (*Music*, *Photos*, *Timeline*, *Catering*, *Vendor Hub*) and Active Link Manager card.
- [x] **[SHARE-2] Guest Photo & Video Upload Portal (`/upload/[token]`):** Mobile portal routing guest photos and videos directly into the couple's personal Google Drive folder (`My Drive/Wedding Planning/Guest Uploads`) with MIME/extension format validation.
- [x] **[SHARE-3] Guest Live Song Request Portal (`/request-song/[token]`):** Mobile song request portal with live iTunes catalog auto-complete and 30s audio previews.

---

## 💼 7. Vendor Directory (`VendorManager.tsx`)
- [x] **[VND-1] Add/Edit Vendor Modal Header Font Fix:** Fixed modal header font color in Add & Edit Vendor modal to high-contrast white (`#ffffff`).
- [x] **[VND-2] Payment Due Date Reminder Badges:** Highlights upcoming payment due dates within 30 days (`DUE IN Xd`) and flags past-due balances (`OVERDUE (Xd)`) with alert badges when balance is owing.
- [x] **[VND-3] Category Breakdown Stat Badges (Streamlined):** Removed the crowded category quick-filter pill buttons from the top layout to eliminate visual clutter, retaining category filtering in the unified search & filter bar.
- [x] **[VND-4] Vendor Portal Share Link Generator:** Embedded VendorShareLinkManager section allowing instant generation and access control for mobile vendor portals (*Music, Photos, Catering, Timeline*).
- [x] **[VND-5] Vendor Subtitle Description:** Added a clean descriptive subtitle beneath the Vendor Management header detailing contract, payment, and meal tracking.
- [x] **[VND-7] Instant Vendor Card Refresh & Optimistic State Sync:** Fixed race condition where saving a vendor's contact details would not immediately update the vendor card in the UI without a browser refresh. Converted `syncUpdate` state setters in `src/app/vow/page.tsx` to functional updates (`prev => ({ ...prev, [sheetType]: updatedData })`), tracked exact vendor indices via `editingIndex` in `VendorManager.tsx`, made vendor record matching resilient against missing IDs or name updates, and eliminated redundant secondary sync calls to `budget` when non-financial contact information is saved.
- [x] **[VND-8] Relational Category Combobox, Budget Allocation & Expense Auto-Sync (`VendorManager.tsx`):**
  - **Budget-Aligned Category Combobox:** Aligns the Vendor Category selector with budget categories (`STANDARD_VENDOR_CATEGORIES` + existing categories across `budget`, `vendors`, and `expenses`). Features an interactive dropdown combobox with search filtering, custom entry creation (`+ Use custom: "..."`), and full typing override.
  - **Auto-Calculated Balance Owing & Decimal Formatting:** Real-time formula `Math.max(0, Contract Value - Deposit Paid)` updates dynamically as contract or deposit values are modified. Rendered in modal as a read-only auto-calculated input strictly formatted to 2 decimal places (`minimumFractionDigits: 2, maximumFractionDigits: 2`).
  - **In-Textbox Currency Symbol Prefixes:** All modal currency input fields (*Contract Value*, *Deposit Paid*, and *Balance Owing*) incorporate an elegant in-textbox currency symbol prefix (`$`, `£`, `€`, etc.) anchored seamlessly inside the input boundary.
  - **Cross-Tab Budget Category Target Sync:** When adding/editing a vendor, checks if a budget entry exists for that category. If absent, automatically adds a new category budget allocation with the vendor's Contract Value initialized as `estimatedCost`. If the category exists with a `$0` allocation, updates it to the Contract Value while preserving existing allocations.
  - **Deposit Paid Logged as Expense:** Automatically logs/updates a linked `ExpenseItem` (`EXP-V-${vendorId}`) in the `expenses` tab when `depositPaid > 0`, categorizing it under the vendor's category with amount, purchase date, and vendor details. When deposit is reduced to 0 or the vendor is deleted, cleans up the linked deposit expense item automatically.

---

## 📋 8. Task Checklist & Kanban (`KanbanBoard.tsx`)
- [x] **[TASK-1] Clickable Kanban Task Edit Modal:** Clicking any task card on the Kanban board opens its edit modal window.
- [x] **[TASK-2] Switchable Progress Cards / Progress Bar Header (`KanbanBoard.tsx`):**
  - Added switchable progress view mode toggle (Progress Cards vs Multi-color Progress Bar) above the Kanban board.
  - **Dedicated Header Title Row**: Separated the card title (`TASK PROGRESS & COMPLETION METRICS`) onto its own full-width row instead of sharing horizontal space with the view toggle, eliminating awkward text wrapping when category filters are applied.
  - **Mobile Default Progress Bar View**: Defaults to the multi-segment Progress Bar view on mobile viewports (< 768px) while defaulting to Cards view on desktop.
  - **Mobile Full-Width Segmented Toggle**: Upgraded toggle button group on mobile to span the full card width with 50/50 flex distribution for comfortable thumb access.
- [x] **[TASK-3] Header Methodology Description:** Added a descriptive subtitle under the header explaining Kanban task management workflow.
- [x] **[TASK-DELETE-MODAL] Delete Task Modal Redesign:** Upgraded task deletion confirmation popup with high-contrast alert styling, permanent removal notice, comfortable desktop/mobile padding, and full-width mobile action buttons.
- [x] **[TASK-MOBILE-HEADER] Mobile "Add Task" Button Dedicated Row:** Realigned the mobile "Add Task" button onto its own full-width row under the title and description, preventing text compression.
- [x] **[TASK-AUTO-SUGGEST] Dynamic Task Category & Assignee Autocomplete Suggestions:** Pre-seeds HTML5 `<datalist>` auto-suggestions for task categories and assignees based on standard defaults and active tasks on the board, while supporting freeform user text entry.
- [x] **[TASK-QUICK-MOVE-STOP-PROPAGATION] 1-Click Status Progression Isolation:** Added event bubbling cancellation (`e.stopPropagation()`) to quick movement forward/backward arrow buttons (`ArrowRight`, `ArrowLeft`) on task cards, allowing instantaneous single-click stage advancement without opening the task edit modal.
- [x] **[TASK-PROGRESS-CARDS-PERCENTAGE] Consistent Task Stage Progress Card Metrics (`KanbanBoard.tsx`):**
  - Standardized UI structure across all three progress cards (`TO DO`, `IN PROGRESS`, `COMPLETED`):
    - Line 1: Uppercase stage title in small muted monospace text (`0.65rem`).
    - Line 2: Large, bold stage count integer (`1.25rem`, `fontWeight: 800`).
    - Line 3: Calculated percentage (`{percentToDo}%`, `{percentInProgress}%`, `{percentDone}%`) placed directly below the count in smaller muted text (`0.75rem`, `fontWeight: 600`, `var(--color-muted)`).
  - Eliminates visual clutter (removed `/ total` and inline `(X%)` parentheses) for a unified, balanced 3-card metric layout.
- [x] **[TASK-DESKTOP-HEADER-TOOLBAR-SEPARATION] Dedicated Controls Toolbar & Uncrowded Header Row (`KanbanBoard.tsx`):**
  - Separated the page header (Title `Kanban Checklist` & description) from the interactive controls into distinct full-width stacked rows (`flex-direction: column; align-items: stretch`).
  - The Title and description span the entire top row, allowing the text to breathe naturally without horizontal crowding.
  - The Category dropdown filter, Sort bar, and desktop `+ ADD TASK` button reside on their own dedicated full-width toolbar row below the description (`display: flex; justify-content: space-between; align-items: center; width: 100%`).
  - Completely eliminates cramped multi-line stacking of Category, Sort, and Add Task beside the description text when desktop screens or browser windows are shrunk.

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
- [x] **[UX-16] Crisp White Search Bars & Dropdown Menus in Light Mode:**
  - Added `--color-input-bg` token to `theme.css` across all 4 design styles (`editorial`, `neo-brutalism`, `botanical-romance`, `midnight-tuxedo`), defaulting to solid white (`#ffffff`) in light mode and surface tokens (`var(--color-surface)`) in dark mode.
  - Enforced crisp white backgrounds (`#ffffff`), dark legible text (`#121824`), subtle elevation shadows (`0 1px 3px rgba(0,0,0,0.05)`), and high-contrast hover/focus rings for all search bars, filter dropdowns, `<select>` inputs, and modal form fields in `globals.css` and individual component styles (`VendorManager`, `TimelineManager`, `GuestListManager`, `MusicManager`, `PhotoShotListManager`, `ThankYouManager`, `BudgetLedgerManager`, `KanbanBoard`, `MenuSetupManager`, `SeatingChartManager`, `PrintTemplatesModal`, `AdvancedSettingsModal`).
  - Preserved dark mode aesthetics with dark background surfaces and high-contrast text.
- [x] **[NAV-SWIPE] Mobile Gestures & Swipe Sheet:** Swipe-up from mobile bottom nav reveals categorized module drawer; swipe-down on drag handle dismisses drawer.
- [x] **[NAV-HAPTIC] Mobile Web Micro-Haptic Feedback:** Added safe `triggerHaptic()` feedback on mobile bottom nav tab clicks, drawer module selection, and theme toggles via `navigator.vibrate`.
- [x] **[NAV-APP-VERSION-BADGE] Incremental App Version & Deployment Date-Time Indicator (`AppVersionBadge.tsx`, `next.config.ts`, `vow/page.tsx`, `buildInfo.ts`):**
  - **Desktop Left-Hand Nav Sidebar**: Embedded at the very bottom of the desktop navigation sidebar. Displays semantic version (`v1.2.1`) with live status dot and deployment date-time (`Deployed Sep 11, 2026 • 3:32 PM`). When sidebar is collapsed, displays an ultra-compact version pill with hover tooltip.
  - **Mobile Slide-Up Navigation Drawer**: Embedded at the very bottom of the mobile slide-up module drawer, cleanly displaying the app version and last deployment timestamp to verify production updates instantly on mobile devices.
  - **Automated Build-Time Injection**: Injected via `next.config.ts` during Next.js builds, ensuring the build timestamp automatically updates with every Firebase App Hosting production deploy.

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
- [x] **[VND-BUDGET-SYNC] Auto-Sync Vendor Financials to Budget Tracker:** Adding, updating, or deleting a Vendor with contract values, estimates, categories, and deposits automatically creates or updates the corresponding line item in the Budget Tracker and recalculates totals and payment statuses.
- [x] **[BUDGET-CATEGORY-DROPDOWN-AUTO-CLEAR] Category Dropdown & Auto-Clearing Zero Input UX:** Added wedding category selection dropdown populated with standard categories (`Venue`, `Catering`, `Florals`, `DJ`, `Photography`, etc.) + custom typing option. Number inputs for Estimated Cost, Actual Cost, and Amount Paid automatically clear the default `0` on focus and allow instant typing without leading zeroes.
- [x] **[BUDGET-DEFAULT-DUEDATE] Default Due Date to Wedding Date:** When adding a new budget line item or using "Save & Add Another", the Due Date input defaults automatically to the couple's Wedding Date from the `SETTINGS` tab.
- [x] **[BUDGET-CONSISTENT-DATES-EXPENSE-MATCH] Standardized Date Formats & Specific Line Item Expense Matching:**
  - Standardized all Due Date and Purchase Date renderings across tables and card views into a unified format (`YYYY-MM-DD`).
  - Refactored expense matching logic so itemized purchases only update specific budget line items when the Expense Description matches the Budget Line Item / Vendor name (or if a single overview line item exists for that category), preventing separate vendor actual costs (e.g. florist contracts) from being overwritten by unrelated purchases (e.g. terracotta pots).
  - Added pre-populated category suggestions and zero-clearing on focus to the New Expense modal.
- [x] **[BUDGET-HYBRID-DYNAMIC-MODEL] Hybrid Budget Architecture (Dynamic Auto-Sum + Optional Master Target Cap) (`BudgetLedgerManager.tsx`, `DashboardMetrics.tsx`, `vow/page.tsx`):**
  - **Dynamic Category Auto-Sum by Default**: Total wedding budget automatically defaults to the live sum of all category targets (`totalEstimate`). Adding or editing categories or vendor contracts instantly updates the budget without manual recalculation.
  - **Optional Master Target Cap Ceiling**: Couples can set an explicit Master Cap (e.g., `$35,000`), locking the ceiling and unlocking the **Allocation Cushion** indicator.
  - **Allocation Cushion & Health Warnings**: Dynamically computes `effectiveTarget - totalEstimate`. Highlights `+${cushion} Unallocated Cushion` in emerald when headroom remains, or flags `⚠️ Over-Allocated by ${amount}` in amber/red when category targets exceed the master cap ceiling.
  - **1-Click Sync to Categories**: Dedicated `SYNC TO CATEGORIES` button snaps the master cap back to the current category sum and restores dynamic auto-sum mode with zero friction.
  - **Retained Unset Mode**: Preserves "No Hard Limit" mode for couples purely tracking expenses without arbitrary caps.
  - **Summary Dashboard Integration**: Updated `DashboardMetrics.tsx` financial KPI cards and progress bars to display `effectiveTotalBudget` with badges distinguishing Master Target Cap from Dynamic Sum of Categories.

---

## 📸 12. Photography & Shot List Manager (`PhotoShotListManager.tsx`)
- [x] **[PHOTO-1] Photography Shot List Enhancements:** Unchecked cards have solid black borders, section headers black text, and desktop view single-row layout.
- [x] **[PHOTO-2] Auto-Populate Photographer Email:** Automatically prepopulates the `TO` email address with the Photographer's email from the Vendor Directory when emailing the Shot List.
- [x] **[PHOTO-PRIORITY-SETTINGS-SYNC] Bi-Directional Priority Translation (`PhotoShotListManager.tsx`, `mapper.ts`):** Retains photographer-intuitive priority labels (`Must Have`, `Nice To Have`, and `Optional`) in the web app UI while bi-directionally translating to and from Google Sheets `SETTINGS!$E$2:$E$50` Priority Levels (`Must Have` ↔ `High`, `Nice To Have` ↔ `Medium`, `Optional` ↔ `Low`). Eliminates spreadsheet validation warnings while keeping photography terminology seamless.
- [x] **[PHOTO-GUEST-UPLOAD-SETUP] Guest Photo Upload Portal Setup & Live Google Drive Folder Integration (`PhotoShotListManager.tsx`, `GoogleDrivePickerModal.tsx`, `token.ts`, `/upload/[token]`, `drive/create-folder`, `drive/folders`, `auth/register-token`):**
  - Added prominent `📸 GUEST UPLOADS` action button to the Photography Shot List header.
  - Dedicated in-app configuration modal allowing couples to:
    - Select or create any Google Drive destination folder using the integrated `GoogleDrivePickerModal.tsx`.
    - **Live Google Drive Folder Creation (`/api/drive/create-folder`)**: Creating a new folder inside the modal communicates directly with Google Drive API via authenticated server proxy (`getGoogleAuthAsync`), creating a genuine Google Drive directory and returning its permanent Google Drive Folder ID.
    - **Live Google Drive Folder Browser (`/api/drive/folders`)**: Traverses subfolders dynamically with server-side token refresh support, eliminating client-side expired OAuth errors.
    - Configure signed token expiration duration (7d, 14d, 30d, 60d, 90d recommended, 180d, 365d, or permanent/no expiration).
    - View, copy, and test their live guest upload portal link (`${origin}/upload/${token}`) with instant clipboard feedback.
    - Generate and download a printable high-resolution QR code (`api.qrserver.com`) for wedding place cards, bar signs, and dinner table displays.
    - **Live Google Drive Connection Indicator & Reconnect Action**: In-modal connection status showing connected Google account email, with 1-click `CONNECT GOOGLE DRIVE` / `Reconnect account` trigger to seamlessly authorize or refresh Google Drive permissions without leaving the Photography page.
  - **Production Auth Resolution & Silent Token Refresh**:
    - **Token User Email Binding**: Cryptographically signs both `spreadsheetId` and couple `userEmail` into the HMAC-SHA256 upload token so the guest endpoint can locate credentials by either identifier.
    - **Bidirectional Token Resolution (`findAuthTokenDocAsync`)**: Queries Cloud Firestore by `spreadsheetId` or `userEmail`, auto-refreshing OAuth access tokens via Google Cloud credentials when expired.
    - **Automatic Token Registration (`/api/auth/register-token`)**: Automatically links active spreadsheet IDs and Google tokens in Cloud Firestore whenever the couple opens the upload modal.
    - **OAuth State Binding & Awaited Serverless Persistence (`setDocAsync`)**: Embeds `spreadsheetId` into Google OAuth `state` parameter and awaits asynchronous document writes so serverless App Hosting containers never terminate before token persistence completes.
  - **Live Google Drive File Streaming (`/api/upload/[token]`)**: Authenticates via the couple's stored Google Drive credentials, dynamically verifies or creates destination folder hierarchies, and streams incoming guest photos and videos directly into the couple's private Google Drive folder with guest attribution metadata.
- [x] **[PHOTO-GUESTBOOK-FEED] In-App Guestbook Feed & Real-Time Photo Notes (`PhotoShotListManager.tsx`, `firestoreDb.ts`, `/api/upload/[token]`, `/api/drive/guest-uploads`):**
  - **Sub-Tab Navigation View Switcher**: Clean segmented toggle at the top of the Photography page switching between `📷 PHOTOGRAPHER SHOT LIST` and `💌 GUESTBOOK & PHOTO NOTES` (with dynamic counters for required shots and received guest uploads).
  - **In-App Guestbook Feed**: Renders wedding guest photo submissions in a card-based feed complete with initials avatar, guest name, timestamp, total files badge, heartfelt message quote bubbles (`💬 "..."`), uploaded file pills with 1-click Google Drive viewer links (`webViewLink`), and target Drive album tag.
  - **Guestbook KPIs & Toolbar**: Real-time metrics tracking Total Guest Submissions, Photos & Videos Received, Heartfelt Notes & Wishes Count, and Target Google Drive Album. Features guest search (by name, note content, or filename), "With Written Notes Only" filter toggle, and live Refresh trigger.
  - **Google Drive `Guest_Messages_&_Notes.txt` Real-Time Log**: Automatically creates and continuously appends every guest wish, comment, uploader name, file count, and timestamp directly to a consolidated text log file inside the couple's Google Drive folder.
  - **Full Firestore & Offline Parity (`LocalFirestore.getDocsAsync`, `deleteDoc`)**: Persists guest uploads under the `guest_uploads` collection in Cloud Firestore (production) and local storage (dev), with query and deletion endpoints (`GET /api/drive/guest-uploads`, `DELETE /api/drive/guest-uploads`).
  - **Dismiss / Delete Modal**: Allows the couple to clean up test or spam guestbook entries with safety confirmation ensuring uploaded Google Drive media files are preserved.
- [x] **[PHOTO-MOBILE-BALANCED-TABS] Responsive Mobile Two-Column Segmented Tab Switcher (`PhotoShotListManager.tsx`):**
  - Upgraded the top view switcher (`.photo-view-switcher`) on mobile screens (`< 640px`) to use a responsive 2-column balanced grid (`grid-template-columns: 1fr 1fr; width: 100%`) instead of an overflowing single-row flex layout.
  - Shortened mobile button labels:
    - Desktop: `PHOTOGRAPHER SHOT LIST` $\rightarrow$ Mobile: `SHOT LIST`
    - Desktop: `GUESTBOOK & PHOTO NOTES` $\rightarrow$ Mobile: `GUESTBOOK`
  - Eliminated horizontal scrolling, text wrapping, and truncated badge counters on mobile devices while maintaining dynamic counters (`{shots.length}`, `{guestUploads.length}`) and desktop label fidelity.

---


## ⚙️ 13. Platform Infrastructure & Standards
- [x] **[SYS-1] Purchase Activation Flow (`/activate`):** Etsy order verification API with Quick Setup and 4-screen Guided Setup Wizard.
- [x] **[SYS-2] Multi-Currency Formatting Engine:** Support for USD $, CAD $, French Canadian 35 000 $, GBP £, and EUR €.
- [x] **[SYS-3] Advanced Settings Portal & Metadata 2-Way Sync:** Metadata editor, currency selector, drive inspector, feature toggles, and dev mock controls. Full 2-way synchronization with `SETTINGS` tab (Wedding Title `B2`, Budget `B3`, Wedding Date `B4`, Location/Venue Details `B5`, and Currency `B6`). State is continuously restored from live sheet data across devices.
- [x] **[CLEAN-WORKSPACE-ZERO-MOCK-FALLBACK] Zero-Mock Clean Sheet Hydration:** Removed legacy mock fallbacks for `photos`, `gifts` (Thanks page), `music`, and `catering` in the Google Sheets sync API. New workspaces connected to fresh Google Sheets start completely clean with zero sample data unless the user explicitly launches in Demo / Mock Mode.
- [x] **[GEN-1] Dropdown to Checkbox Standard:** Converted binary Yes/No dropdown fields to native checkboxes (e.g. Staff Meals Required).
- [x] **[GEN-2] Desktop Wide-Screen Layout Optimization:** Expanded max-width container bounds to 1680px for desktop viewports.
- [x] **[GEN-3] Toast Notification System:** Brief "Saved!" popup on settings/modal saves and data sync updates.
- [x] **[NAV-1] Sticky Collapsible Left Sidebar Navigation:** Added desktop wide-screen left sidebar layout option alongside top navbar.
- [x] **[NAV-MOBILE-THUMB] Mobile Ergonomic Thumb-Zone Navigation & Categorized Bottom Sheet Drawer (`src/app/vow/page.tsx`):** Added a persistent glassmorphism bottom navigation bar pinned to the bottom of mobile screens ($\le 768\text{px}$) with 1-tap thumb access to the 4 core daily modules (*Summary*, *Guests*, *Budget*, *Timeline*) plus an active `MORE (☰)` trigger button with live active dot indicators. Upgraded the mobile drawer into an ergonomic bottom sheet drawer sliding up from the bottom with a drag handle, 3 categorized module groups (*Guests & Hospitality*, *Logistics & Budget*, *Day-Of Media & Tasks*), quick action buttons (*Print*, *Share*, *Config*), and 5.5rem safe-area padding.
- [x] **[MOBILE-FAB-ACTIONS] Standardized Mobile Floating Action Button (FAB) Architecture (`MobileFAB.tsx`):**
  - Replaced redundant inline "Add" buttons across all 10 core views with a standardized, elevated Floating Action Button (FAB) pinned above the mobile bottom navigation bar (`bottom: 5.125rem`, `right: 1.25rem`, `z-index: 100`).
  - Circular 56px design (`rounded-full`), theme accent background, bold centered `+` icon, multi-layer drop shadow, active press micro-scale (`scale-92`), and accessible labels.
  - Implemented across **Guest List** (`Add Guest`), **Day-Of Timeline** (`Add Event`), **Tasks** (`Add Task`), **Music** (`Add Song`), **Vendors** (`Add Vendor`), **Photography** (`Add Shot`), **Seating** (`Add Table`), **Menu Setup** (`Add Menu Item`), **Thank You Tracker** (`Log Received Gift`), and **Budget Ledger** (with Speed-Dial for `+ New Expense` & `+ New Budget Item`).
  - Desktop views ($\ge 769\text{px}$) strictly retain header buttons for desktop ergonomics, while mobile views seamlessly transfer creation actions to the persistent thumb-zone FAB.
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
- [x] **[AUTH-REFRESH-LONG-LIVED] Long-Lived Google OAuth Sessions & Silent Token Refresh:** Stores Google `refresh_token` in Firestore/local storage on authentication. Automatically refreshes expired 1-hour access tokens via `getGoogleAuthAsync()` in `/api/sync` routes without interrupting user workflow, and uses `prompt=select_account` during manual reauth to skip permission re-consent.
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
- [x] **[SHARE-4] Spouse & Partner Co-Planning Access & Quota Control:**
  - **Co-Planner API Handler (`/api/share/partner`)**: API endpoint supporting `POST` and `DELETE` requests. Grants Google Drive `writer` (edit) or `reader` (view) permissions on the Master Spreadsheet and triggers zero-cost native Google Drive notification emails (`sendNotificationEmail: true`).
  - **Quota Enforcement (Max 2 Co-Planners)**: Persists `coPlanners: string[]` on `WorkspaceRecord` in database and strictly caps total active co-planners at 2 slots per workspace.
  - **Co-Planning Access Card (`AdvancedSettingsModal.tsx`)**: Renders real-time slot counter (`1 / 2 Slots Used`), invite email input, active co-planners roster, 🗑️ **Revoke Access** actions, and zero-cost 1-click personal email app (`mailto:`) / link copy triggers.
- [x] **[GUEST-9] Dual Table Assignment Columns (Ceremony Seating vs Reception Table):**
  - **Domain & Spreadsheet Schema Update**: Separated guest seating into `ceremonySeating` (`Ceremony Seating` column) and `tableAssignment` (`Reception Table` column), resolving value override conflicts.
  - **UI & Seating Chart Integration**: Added `CEREMONY SEATING (ROW / SIDE)` form input in Add/Edit Guest modal (`GuestListManager.tsx`), table/card badges, and ceremony row/aisle assignment support in `SeatingChartManager.tsx`.
  - **Export Engine Compatibility**: Updated `masterTemplateExporter.ts`, `xlsxGenerator.ts`, and `PrintTemplatesModal.tsx` Canva CSV exporters to include `Ceremony Seating`.
- [x] **[FETCH-SETTINGS-ON-LOGIN-RECONNECT] Wedding Date, Location & Budget Hydration from SETTINGS Sheet:**
  - **Direct Sheet Hydration on Mobile / Web OAuth Reconnect (`src/app/vow/page.tsx`)**: Fixed mobile session reconnection bug where `weddingDate`, `locationDetails`, and `budgetThreshold` were not populated from the connected Google Sheet's `SETTINGS` tab. Now immediately invokes `fetchWeddingData(accessToken, provision.spreadsheetId)` during `handleAuthMessage` rather than waiting on asynchronous state dependency effects.
  - **Dual-Argument `fetchWeddingData` Engine**: Updated `fetchWeddingData` signature to accept `(overrideToken?: string, overrideSpreadsheetId?: string)`, avoiding empty/stale `spreadsheetId` closures during login transitions.
  - **Settings Budget Ledger & KPI Meter Synchronization**: Hydrates `totalBudget` from `data.dashboard.totalBudget` directly into `budgetThreshold` state and `localStorage` (`s2v_budget_threshold`) upon login and mount, ensuring countdown timers and budget meters reflect the Google Sheet immediately.
  - **Total Budget Configuration in Advanced Settings (`AdvancedSettingsModal.tsx`)**: Added `TOTAL TARGET BUDGET` input to the Wedding Details tab, enabling couples to view and update cell `Settings!B3` directly from the settings dialog.
- [x] **[TASK-CATEGORY-COMBOBOX] Interactive Category & Assignee Combobox with Free-Text Overwrite (`KanbanBoard.tsx`):**
  - Upgraded task Add/Edit modal Category and Assigned To fields from plain inputs with invisible browser `<datalist>` elements into a responsive Combobox.
  - Displays a visible chevron dropdown toggle button (`ChevronDown`) indicating available options on desktop and mobile.
  - Clicking the chevron or focusing opens a styled popup list of all existing wedding categories (and assignees) with hover feedback, checkmark indicator for the active item, and instant search filtering.
  - Retains 100% free-text typing and overwrite ability so users can edit or type custom categories on demand.
- [x] **[TASK-OVERDUE-RED-HIGHLIGHT] Distinct Red Highlighting for Overdue Tasks (`KanbanBoard.tsx`):**
  - Evaluates task due dates against current local date midnight.
  - For incomplete tasks (`kanbanStage !== 'Done'`) whose due dates are in the past, renders the due date text and calendar icon in a distinct red (`var(--color-red, #ef4444)`) with font weight `600` and an informative tooltip.
  - In the Add/Edit Task modal, displays a prominent `PAST DUE` red badge with a red border and text on the date picker whenever an overdue date is selected or edited.
- [x] **[TASK-DUE-DATE-FORMAT-MMDDYYYY] Unified MM/DD/YYYY Due Date Display Normalization (`KanbanBoard.tsx`, `currency.ts`):**
  - Implemented `formatDateToMMDDYYYY` helper converting raw spreadsheet dates (ISO `YYYY-MM-DD`, `YYYY/MM/DD`, or mixed `M/D/YYYY`) into a strictly unified `MM/DD/YYYY` presentation across all task cards and modal headers.
  - Ensures date input forms accept and render ISO format seamlessly while presenting users with uniform `MM/DD/YYYY` dates.
- [x] **[TASK-CATEGORY-FILTER-DROPDOWN] Category Dropdown Filter with 'General' Fallback and 1-Click Clear (`KanbanBoard.tsx`):**
  - Added an interactive Category `<select>` dropdown filter to the Kanban board header controls, positioned alongside the Sort controls.
  - Automatically identifies all unique categories across tasks and computes live task counts per category.
  - Treats all default tasks without a category (blank, null, or whitespace) as **`General`**, matching the card badges.
  - Includes an `"ALL CATEGORIES"` option to view all tasks, plus an explicit `RESET` button that appears when an active category filter is applied for instantaneous 1-click clearing.
  - Dynamically updates Kanban columns, mobile stage tab counters, empty column messages, and top progress metrics / progress bar cards to reflect the filtered category subset.
- [x] **[FINANCIALS-MASTER-DETAIL-VIEW] Desktop Master-Detail Split-View for Wedding Financials (`BudgetLedgerManager.tsx`):**
  - **Responsive Layout**: On screens `< lg` (<1024px), strictly maintains the stacked view (Budget Tracker cards/table above Expenses table/cards). On desktop (`lg:` breakpoint and up), switches to a 12-column grid (`lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start`).
  - **Master Rail (Left Column - `lg:col-span-5`)**: Scrollable viewport-bounded list (`lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2`) of category budget cards prioritized by active activity (caps, logged expenses, or over-budget alerts) with live search filtering (`FILTER CATEGORIES...`). Features distinct active card selection styling (`2px solid var(--color-primary)`, subtle background highlight, ring shadow, and `ACTIVE` tag). Displays serif category headings, mini utilization progress tracks, CAP / OUTLAY / CUSHION tabular numbers, and item counters. Clicking any card updates `selectedCategoryId`.
  - **Detail Ledger (Right Column - `lg:col-span-7`)**: Dynamic Category Snapshot header for the selected category showing Target Allocation Cap, Total Expenses Logged, and Remaining Cushion (`Target - Sum(Expenses)`), paired with an inline `+ ADD EXPENSE` action button pre-populating `category = selectedCategoryId`. Renders the itemized expenses table filtered strictly to `selectedCategoryId` (with dedicated category search, tabular amounts, dates, and dynamic total footer). Zero-expense categories render clean empty-state guidance with an immediate "LOG FIRST EXPENSE" action.
  - **Dynamic Recalculation**: Adding, editing, or deleting expenses immediately updates the category card's outlay and cushion on the left rail, the detail snapshot header, and the global top-level budget progress bar.
  - **Desktop Compact Active/Alert Filter Pills**: Replaced the large 20+ item chip cloud on desktop with a single-row horizontal pill list of active or alert categories with over-budget alerts and percentage pills, while preserving the full filter chip grid on mobile.
- [x] **[FINANCIALS-MOBILE-BOTTOM-SHEET] Mobile Interactive Category List & Sliding Bottom Sheet Drill-Down (`BudgetLedgerManager.tsx`):**
  - **Mobile Category Explorer (`< lg`)**: Replaced the long dual-stacked layout with a streamlined, 1-column list of high-density category cards. Each card acts as an ergonomic tap target displaying Category Title, Over-budget / utilization percentage badges, mini progress track, tabular CAP vs OUTLAY vs CUSHION numbers, logged expense count, and a chevron navigation cue.
  - **Instant Search & Quick Filters**: Mobile search input (`SEARCH CATEGORIES...`) paired with quick-filter pills (`ALL`, `ACTIVE`, `⚠️ OVER BUDGET`) to quickly locate categories on mobile devices.
  - **Animated Sliding Bottom Sheet**: Pure CSS/Tailwind transition drawer sliding up from the bottom (`translate-y-0`) with blurred/dimmed backdrop (`rgba(0, 0, 0, 0.55)`, `backdrop-blur-sm`), centered grab handle pill, and close (`✕`) button.
  - **Bottom Sheet Category Snapshot & Itemized Expenses**: Header displays 3-metric tiles (Allowance Cap, Total Spent, Remaining Cushion) and baseline target cap pills. Body renders scrollable mobile expense cards (Line 1: description & bold tabular amount; Line 2: purchase date & payment status badge `Paid`/`Partial`/`Pending`; Line 3: notes & inline Edit/Delete triggers).
  - **Sticky Bottom Action & FAB Coordination**: Persistent bottom button (`+ Log Expense to [Category Name]`) launches the Add Expense modal with category pre-selected. Sticky mobile budget utilization progress meter (`position: sticky; top: 0.5rem; z-index: 30`) remains visible during scroll, and the base floating FAB smoothly coordinates behind the bottom sheet overlay (`z-index: 120`) to eliminate touch interference.
- [x] **[NAV-MOBILE-HEADER-FULLWIDTH] Edge-to-Edge Mobile Brand Header (`src/app/vow/page.tsx`, `globals.css`):**
  - **Full-Width Viewport Spanning**: Breakout negative horizontal margins (`margin-left: -1.5rem; margin-right: -1.5rem; width: calc(100% + 3rem);`) and responsive padding (`padding: 0.75rem 1.25rem`) applied to `<header className="app-brand-header">` on mobile screens (`<= 768px`).
  - **Seamless FAB Backdrop Alignment**: Resolves gutter clipping where the white header bar stopped at the 1.5rem page container padding, exposing dark grey backdrop margins on its left and right flanks when opening the mobile FAB speed-dial. The header now spans 100% edge-to-edge across the screen with its primary color underline connecting seamlessly to both viewport edges.
- [x] **[FINANCIALS-ZERO-BUDGET-FILTER] Zero-Dollar Category Budget Suppression (`BudgetLedgerManager.tsx`):**
  - Automatically filters out categories with a zero-dollar budget cap and no recorded expenses (`estimatedCost <= 0 && actualCost <= 0 && expenseCount === 0`) across both desktop Master Rail and mobile Category lists, eliminating 15+ empty phantom category cards.
  - Desktop category rail count, mobile quick-filter pill counts, and active category selection fallbacks only consider active budgeted categories.
  - Category breakdown chip cloud and summary meter pills strictly render active budgeted categories.
- [x] **[FINANCIALS-SIMPLIFIED-BUDGET-MODAL] Streamlined Budget Category Addition Modal (`BudgetLedgerManager.tsx`):**
  - Redesigned the "New Budget" dialog into a focused Budget Category Addition Modal: removed `Line Item / Vendor Name`, `Actual Cost`, `Amount Paid`, `Payment Status`, and `Due Date` fields.
  - Modal strictly collects **Budget Category** (standard wedding category select + custom typing) and **Target Budget Allocation ($)**.
  - Expense receipts and itemized purchases directly line up under each category.
  - Added grouped category selectors in the Add Expense modal (`Active Budget Categories` with allocated cap amounts listed first, followed by unbudgeted options).
  - Maintained 100% backward compatibility with Google Sheets `BUDGET` tab schema by setting sensible defaults (`${categoryName} Budget`, `Pending`, `0` actual/paid).
  - Added in-modal category deletion and dynamic budget cap editing directly from category snapshot headers.
- [x] **[FINANCIALS-VIEW-TOGGLE-REMOVAL] Table vs Card View Toggle Removal (`BudgetLedgerManager.tsx`):**
  - Removed the legacy List/Table vs. Card view toggle buttons (`.budget-view-toggle`) from all viewports (desktop, tablet, mobile), along with obsolete `viewMode` state and styling.
  - The modernized Master-Detail split-view (desktop) and interactive sliding bottom sheet (mobile) make the legacy table vs card toggle completely obsolete.
- [x] **[FINANCIALS-NAV-LABEL-SYNC] Left Nav & Drawer Label Updated to FINANCIALS (`src/app/vow/page.tsx`):**
  - Changed the desktop left sidebar navigation label from `LEDGER` to `FINANCIALS` (`{ id: 'budget', label: 'Financials', icon: DollarSign }`).
  - Aligns the desktop navigation label with the mobile slide-up drawer and module header naming (`Wedding Financials`).
- [x] **[FINANCIALS-TERMINOLOGY-MODERNIZATION] Financial Terminology Modernization (`BudgetLedgerManager.tsx`):**
  - Modernized planning and consumer finance terminology across the entire Financials module, replacing awkward legacy terms:
    - `CAP` / `Total Cap` $\rightarrow$ **`BUDGET`** / **`Target Budget Allocation`**
    - `OUTLAY` / `Total Outlay` $\rightarrow$ **`SPENT`** / **`Total Spent / Paid`**
    - `CUSHION` / `Remaining Cushion` $\rightarrow$ **`REMAINING`** / **`Remaining Available`**
  - Applied uniformly across Desktop Master Rail cards, Category Detail Snapshot cards, Mobile Category Cards, and the Mobile Sliding Bottom Sheet.
- [x] **[FINANCIALS-DOUBLE-PLUS-FIX] Double Plus Button Icon Cleanup (`BudgetLedgerManager.tsx`):**
  - Fixed duplicate plus symbols where Lucide `<Plus />` icons were immediately followed by literal string `+` characters in button text.
  - Standardized button labels: `<Plus size={12} /> ADD BUDGET` (category header), `<Plus size={13} /> NEW CATEGORY` (mobile bottom sheet unbudgeted row), and `<Plus size={14} /> NEW BUDGET CATEGORY` (rail header).
- [x] **[FINANCIALS-EDIT-DELETE-CATEGORY-BUDGET] In-App Category Budget Editing & Deletion on Desktop & Mobile (`BudgetLedgerManager.tsx`):**
  - **Desktop Master Rail Actions**: Hovering over category budget cards reveals dedicated inline **Edit** (`<Edit2 size={12} />`) and **Delete** (`<Trash2 size={12} />`) buttons. Clicking Edit pre-populates the target category budget modal; clicking Delete prompts for confirmation and cleans up the budget allocation. If a category has logged expenses but no budget target, a prominent `+ Set Budget` shortcut button is rendered.
  - **Mobile Bottom Sheet Allocation Card**: Upgraded static category metrics in the bottom sheet with an interactive **CATEGORY BUDGET ALLOCATION** card. Displays target allocation, live spent amount, remaining balance, and full-touch **Edit** and **Delete** buttons, as well as an unallocated `+ SET BUDGET` prompt for instant mobile budget configuration.
- [x] **[FINANCIALS-UTILIZATION-DONUT-TOGGLE] Switchable Bar & Donut Budget Utilization Visualizer (`BudgetLedgerManager.tsx`):**
  - Added an interactive visual mode toggle (`BAR` vs `DONUT`) to the overall Budget Progress header with `localStorage` persistence (`'s2v_budget_meter_mode'`).
  - **Linear Progress Bar View**: Retains sleek horizontal multi-state progress bar with milestone indicators.
  - **Interactive Donut Chart View**: High-fidelity SVG circular donut meter displaying central utilization percentage, dynamic colored stroke arc (`emerald` within budget, `rose/red` over budget), and clean side-by-side metric labels for Total Budget, Total Spent, and Remaining Balance.
  - **Sub-Track Descriptive Remaining Balance**: Removed awkward floating pill badge from the header; repositioned clean, readable status text directly below the progress track or donut chart (e.g., `$18,500.00 spent of $25,000.00 target budget · $6,500.00 remaining available` or high-contrast over-budget alert).
- [x] **[BUDGET-SCHEMA-MODERNIZATION-6COL] Modernized 6-Column Category Budget Schema (`mapper.ts`, `route.ts`, `xlsxGenerator.ts`, `CellGuard.ts`):**
  - Streamlined the `BUDGET` Google Sheet tab into a focused 6-column Category Budget Allocation table: `Category ID`, `Category`, `Target Budget`, `Total Spent`, `Remaining`, and `Notes`.
  - Pruned obsolete columns (`Vendor Name`, `Due Date`, `Payment Status`) that conflicted with receipt tracking in the `EXPENSES` tab.
  - Keeps Column B (`Category`) as open text to give couples 100% freedom to create custom categories without Google Sheets data validation warning triangles.
  - Multi-alias header parser in `mapper.ts` seamlessly reads both modern (`Category ID`, `Target Budget`, `Total Spent`, `Remaining`) and legacy 8-column sheets.
  - Generates live spreadsheet `=SUMIF(EXPENSES!C:C, B{row}, EXPENSES!D:D)` and `=C{row} - D{row}` formulas during sync and XLSX template creation, with `CellGuard` allowing safe mathematical formulas.

---

## ⏱️ 14. Day-of Timeline & Schedule (`TimelineManager.tsx`, `TimeDialPicker.tsx`)
- [x] **[SCHED-1] Robust Chronological Event Sorting & Meridiem Normalization (`TimelineManager.tsx`, `PrintTemplatesModal.tsx`):**
  - Resolved time string parsing bugs where seconds (e.g. `01:00:00 PM` or `2:00:00 PM`) or non-standard casing from Google Sheets prevented meridiem recognition in `parseTimeToMinutes`, causing afternoon PM events to mistakenly evaluate as morning minutes and sort before AM events.
  - Implemented robust regex matching for hours, minutes, optional seconds, and varied meridiem indicators (`AM`, `PM`, `am`, `pm`, `a.m.`, `p.m.`) as well as 24-hour military times.
  - Updated `formatTimeDisplay` to strip redundant `:00` seconds in 12-hour mode, rendering clean, consistent wedding schedule badges (`02:00 PM`).
  - Updated `compareScheduleEvents` and `isOvernightEvent` to ensure morning events (AM), afternoon/evening events (PM), and overnight moments (`+1 DAY` / 12:00 AM – 4:59 AM) sort in strict chronological sequence.
  - Synchronized `filteredTimelineEvents` in Print Studio (`PrintTemplatesModal.tsx`) to apply the same chronological sorting for printable Day-Of Timeline rosters.
- [x] **[SCHED-2] UP NEXT MOMENT Banner Chronological Synchronization (`TimelineManager.tsx`):**
  - Linked the featured UP NEXT banner navigation (PREV / NEXT) to advance sequentially through the sorted timeline array instead of the raw unsorted spreadsheet list.
  - The banner displays the true first chronological milestone of the wedding day by default and advances in order.
- [x] **[SCHED-3] Mobile Time Dial & Quick Duration Picker (`TimeDialPicker.tsx`, `TimelineManager.tsx`):**
  - Replaced raw text inputs for Start Time and End Time with an ergonomic `TimeDialPicker` component.
  - **Native Mobile Time Dial Trigger**: Features an integrated `DIAL` button backed by `<input type="time">` and `showPicker()`, triggering the native OS spinning time wheel on iOS Safari and the circular clock dial on Android Chrome.
  - **1-Tap AM / PM Switch**: Instant toggle button to switch between morning and afternoon/evening without opening the keyboard.
  - **15-Minute Rounding Chips**: Quick-tap chips (`:00`, `:15`, `:30`, `:45`) for effortless minute selection.
  - **Dynamic End Time Duration Presets**: When configuring End Time, dynamically computes duration offset pills (`+30m`, `+45m`, `+1h`, `+1.5h`, `+2h`) relative to the event's Start Time, enabling couples and coordinators to set end times in a single tap.
- [x] **[SCHED-4] Leading Zero Removal for 12-Hour Times (`TimelineManager.tsx`, `TimeDialPicker.tsx`):**
  - Formatted all 12-hour timestamps without leading zeros on the hour component (`4:00 PM` instead of `04:00 PM`, `8:00 AM` instead of `08:00 AM`).
- [x] **[SCHED-5] Interactive Combobox for Responsibility / Vendors (`TimelineManager.tsx`):**
  - Replaced static input with an interactive combobox featuring a dropdown toggle (`ChevronDown`).
  - Pre-populates a filterable list of all unique previously entered roles/vendors from the workbook and standard defaults (`Officiant`, `Photographer`, `DJ / MC`, `Coordinator`, `Glam Team`, etc.).
  - Preserves 100% free-text editing and typing so users can override or enter custom vendor assignments at any time.
- [x] **[SCHED-6] Responsive Past-Midnight Warning Card Layout (`TimelineManager.tsx`):**
  - Added responsive boundary guardrails (`box-sizing: border-box`, `width: 100%`, `overflow: hidden`) preventing horizontal overflow on mobile screens.

---

## 💌 15. Thank You Tracker & Gift Log (`ThankYouManager.tsx`)
- [x] **[THANKS-COUPLE-ATTENDANCE-EXCLUSION] Exclude Bride & Groom / Couple from Attendance Cards (`ThankYouManager.tsx`, `src/app/vow/page.tsx`):**
  - Updated Guest Attendance Cards and tracking metrics to strictly exclude the Bride & Groom / Couple parties from the thank-you tracking card roster.
  - Implemented `isCoupleOrBrideGroomParty()` checking party group names (`Bride & Groom`, `Couple`, `Newlyweds`, `Wedding Couple`), table assignments (Sweetheart table, Head table), and dynamic matching against the couple's first names parsed from `weddingName` prop (e.g. "Alex & Sam").
  - Preserves 100% accurate count and card presentation focused strictly on wedding guests requiring thank you notes.

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
