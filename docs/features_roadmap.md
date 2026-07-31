# Sheet2Vow - Features and Roadmap

## Implemented Features

### 1. Dual Design System & Theme Engine
- **Editorial Minimalist Theme (Default):** Calm, high-end editorial aesthetic featuring classic serif typography (`Playfair Display`), warm tones, and subtle borders.
- **Muted Neo-Brutalism Theme (MongoDB / Gumroad Style):** Tactile, bold, geeky design system with 3px dark slate borders, zero-blur hard directional drop shadows, stark white card surfaces, `Geist Mono` typography for buttons/labels/badges, and custom accent color selection.
- **Light & Dark Mode:** Global color theme toggle (`light` | `dark`) persisted in `localStorage` across all pages and components.
- **Custom Primary Color Selector:** User-customizable accent green (`#00ED64` / `#13AA52` / custom hex) for highlighted metrics, badges, and controls.
- **Sweetheart Theme Token (`--color-sweetheart`):** Dynamic theme token rendering sleek black in Light mode and clean white in Dark mode for Bride & Groom Sweetheart tables.

### 2. Purchase Activation & Setup Flow (`/activate`)
- **Etsy Order ID Verification API (`/api/verify-order`):** Secure license verification accepting Email Address and Etsy Order ID with mock latency and entitlement checks.
- **Setup Choice Flow:**
  - ⚡ **Quick Setup:** Single-page questionnaire for 1-minute configuration.
  - 🚀 **Guided Setup Wizard:** 4-screen step-by-step setup (Wedding Title & Budget, Feature Toggles, Spouse Co-Admin Invites & Read-Only Access Rights, Task List Presets).
- **Task Preset Packs (`taskPresets.ts`):** Pre-built milestone checklists for Traditional Weddings, Micro/Intimate Weddings, Destination Weddings, or Blank Slate.
- **Settings Re-Run Link:** Direct link inside Settings Modal to re-launch the activation & setup wizard anytime.

### 3. Visual Table Seating Plan & Floorplan Manager (`SeatingChartManager`)
- **Multiple Table Shapes:**
  - **Round Circle Tables:** Central disc with perimeter seats positioned uniformly using radial trigonometric math ($\theta_i = \frac{2\pi \cdot i}{N} - \frac{\pi}{2}$).
  - **Rectangle Banquet Tables:** Dynamic length scaling matching exact side seats count (`sideCount * 48px`), even seat capacity enforcement, and optional Head & Foot end seats toggle (`includeEndSeats`).
  - 💑 **Sweetheart Tables:** Dedicated Bride & Groom table with 2 seats positioned side-by-side on the same top side facing out towards guests.
- **Interactive Seat Avatar Nodes:** Displays guest's uppercase initials (e.g. `JD` for Jane Doe) on assigned seat nodes with drop-shadow styling (`boxShadow: var(--box-shadow-subtle)`).
- **Interactive Guest Profile Popup:** Clicking any occupied seat initials pops up full guest details, dietary restrictions, party group, RSVP status, contact info, and instant table reassignment.
- **Unassigned Guests Pool Drawer:** Quick drawer listing all unassigned guests for fast assignment during floorplan setup.

### 4. Dashboard Summary (`DashboardMetrics`)
- **Real-Time KPI Cards:** Overview of Total Guests, Attending Count, Total Budget, Paid Amount, and Balance Owing.
- **Interactive Progress Bars:** Visual meters for Budget Allocation (% of total estimated cost) and Seating Capacity.

### 5. Guest Registry (`GuestListManager`)
- **View Switcher:** Grid View, Seating View (table arrangements), and Household/Party Group View.
- **Instant RSVP Actions:** Quick-toggle RSVP buttons (ATTENDING, DECLINED, PENDING) with high-contrast color badges.
- **Filtering & Search:** Real-time search by guest name, dietary restriction, or table arrangement.
- **Export & Print:** Native CSV export and optimized `@media print` layout for printable guest lists.

### 6. Budget Ledger (`BudgetLedgerManager`)
- **Financial Tracking:** Estimated Cost vs. Actual Cost vs. Amount Paid vs. Balance Owing per item.
- **Ledger Totals Card:** Highlighted summary card with green accent numbers and clear high-contrast labels.
- **Payment Statuses:** Status tracking for Paid, Pending, and Overdue payments.
- **Category Over-Budget Alerts:** Warning badges for items exceeding initial estimates.

### 7. Day-Of Timeline (`TimelineManager`)
- **"UP NEXT" Banner:** Featured top banner highlighting the immediate next timeline moment with quick step navigation.
- **Role-Based Filtering:** Filter events by responsibility (*Bridal Party*, *Catering*, *Photography*, *Guests*).
- **Late-Night Time Tracking:** Automatic detection for late-night events (12:00 AM – 4:00 AM) with `🌙 +1 DAY` badge.

### 8. Vendor Directory (`VendorManager`)
- **Directory Cards:** Comprehensive vendor contact info, category, phone number, email, and contract notes.
- **Search & Filtering:** Search by vendor name, service category, or payment notes.

### 9. Kanban Checklist (`KanbanBoard`)
- **Task Columns:** Organize tasks by status (*To Do*, *In Progress*, *Done*).
- **Priority Badges:** High, Medium, and Low priority tags with target due dates.

### 10. Wedding Playlist & Music (`MusicManager`)
- **Song Catalog:** Categorized playlist tracks (*Ceremony*, *Reception*, *First Dance*, *Must Play*).
- **Banned Songs Section:** Separate `BANNED` (Do Not Play) tracks with deeper red badges and black borders.
- **iTunes Audio Preview:** Live 30-second audio preview player with play/pause circular toggle.
- **External Streaming Buttons:** Spotify and YouTube search buttons fixed at the bottom of each song card.
- **Smart Sorting:** Automatic grouping of Banned songs at the bottom of the list when viewing "ALL SONGS".
- **Email Playlist to DJ/Band:** One-click `EMAIL LIST` button generating a structured, formatted email (`mailto:`) broken down by Special Moments, Must Play, General Tracks, and Banned Songs.

### 11. Photography Shot List (`PhotoShotListManager`)
- **Shot List Catalog:** Interfacing with the `PHOTOS` Google Sheet tab (`Shot ID`, `Description`, `Location`, `Shot Time`, `Included People`, `Status`, `Priority`, `Notes`).
- **KPI Metrics Cards:** Overview of Total Required Shots, Captured Count, Pending Shots, and Must Have priority moments.
- **Interactive Checkoffs:** Quick-toggle checkoff buttons to mark shots `Captured` vs `Pending`.
- **Search & Filters:** Search by description, location, or VIP names; filter by status and priority (`Must Have` | `Nice To Have`).
- **Email List to Photographer:** One-click `EMAIL LIST` button generating a structured, formatted email (`mailto:`) for the photographer.

### 12. Thank You Card & Gift Registry Tracker (`ThankYouManager`)
- **Dual Tracker Views:**
  - 🎁 **Gift Registry Thank Yous:** Interfacing with the `GIFT REGISTRY` Google Sheet tab (`Item ID`, `Gift Description`, `Giver / From`, `Category / Store`, `Estimated Value / Cash Amount`, `Thank You Sent`, `Notes`).
  - 💌 **Guest Attendance Thank You Cards:** Interfacing with the `Guest List` `Thanked` column (Column L).
- **Party Group Bundling:** Attendance thank-you cards automatically bundled per household/party group for attending guests with single party-level checkoff toggling.
- **KPI Progress Cards:** Overview of Total Gifts Received ($ value), Gift Thank Yous Sent (%), Attending Parties, and Attendance Cards Sent (%).

### 13. Modular Feature Toggles (`enabledModules`)
- **Module Customization Controls:** Users can enable or disable individual modules (*Guest Registry*, *Seating Chart*, *Budget Ledger*, *Day-Of Timeline*, *Vendor Directory*, *Kanban Checklist*, *Music Playlist*, *Photo Shot List*, *Thank You Tracker*) during Onboarding setup or anytime in Settings.
- **Dynamic Navigation & Dashboard Filtering:** Disabled modules automatically hide their top navbar tab and corresponding dashboard widgets.

---

## Architecture Core: `@germin8/sheet2-core` & Roadmap

Under the hood, Sheet2Vow anchors the **Sheet2 Suite** (*Sheet2Vow, Sheet2Finance, Sheet2Home, Sheet2Closet, Sheet2Inventory*) built on `@germin8/sheet2-core`.

```
 HIGH IMPACT  │ [P1] Mobile RSVP Index         │ [P2] Dynamic Relational RSVP Sync
              │ [P1] Zero-Formula Budget Logger│ [P2] Visual Seating Chart Builder
              │ [P1] Day-of Timeline Cards     │ [P2] Tokenized Vendor Views
              ├────────────────────────────────┼─────────────────────────────────
  LOW IMPACT  │ [P1] Prepopulate Tasks Presets │ [P3] Lemon Squeezy Upgrade Flow
              │ [P1] Dark/Editorial Theme      │ [P3] Etsy Order Entitlement
              └────────────────────────────────┴─────────────────────────────────
                             LOW EFFORT                    HIGH EFFORT
```

### Phase 1: MVP Core (Completed)
- [x] **[Task 1.1] Dual Design Engine:** Editorial & Neo-Brutalism with Light/Dark modes.
- [x] **[Task 1.2] Purchase Activation & Setup Wizard:** `/activate` setup flow.
- [x] **[Task 1.3] Task List Preset Packs:** Traditional, Micro, Destination, Blank.
- [x] **[Task 1.4] Mobile-First Core Modules:** Guest Registry, Budget Ledger, Timeline, Vendor Directory, Kanban, Music Player.
- [x] **[Task 1.5] Visual Table Seating Plan Manager:** Circle, Rectangle, Square, Sweetheart/Single-side seating, Seat ID persistence.
- [x] **[Task 1.6] Photography Shot List Manager:** `PhotoShotListManager` with Captured/Pending checkoffs.
- [x] **[Task 1.7] Thank You Card & Gift Tracker:** `ThankYouManager` with Party Group bundling.
- [x] **[Task 1.8] DJ & Photographer Email Lists:** Quick `mailto:` email list formatting.
- [x] **[Task 1.9] Tokenized Read-Only Vendor Share Portals:** `/share/[token]` with HMAC-SHA256 tokens & active link manager card.
- [x] **[Task 1.10] Multi-Currency Formatting Engine:** `formatCurrency` helper supporting USD $, CAD $, French Canadian 35 000 $, GBP £, and EUR €.
- [x] **[Task 1.11] Advanced Settings Portal:** `AdvancedSettingsModal` with Wedding Metadata Editor, Currency Selector, Visual & UX Theme / 12h-24h Time Format controls, Drive Inspector, Module Toggles, Feedback/Bug Submitter, and Dev Environment Mock toggle in Quick Settings menu.

### Phase 2: Relational Sync, Printable Exports & Visual Customization (NEXT PRIORITY)
- [x] **[Task 2.1] Print-Ready PDF & Printable Export Templates (`PrintTemplatesModal.tsx`):** One-click printable Escort / Folded Place Cards (with meal choice icons & crop/fold guidelines), Table Tent Cards & Seating Rosters, Day-Of Timeline Itinerary, and Emergency Vendor Directory Contact Sheet. Includes global header Print Studio launcher and contextual module triggers.
- [x] **[Task 2.2] Guest Photo & Video Upload Portal & Printable QR Card (`/upload/[token]`):** Tokenized, mobile-optimized public guest portal allowing wedding guests to upload photos and videos directly from their mobile gallery into the couple's personal Google Drive folder (`My Drive/Wedding Planning/Guest Uploads`) while hiding all technical Google Drive authentication details. Includes a printable QR code card generator for place settings and table cards.
- [x] **[Task 2.3] Guest Live Song Request Portal & DJ Sync (`/request-song/[token]`):** Public guest song request portal allowing guests to scan a printable QR code at the reception to submit live song requests with iTunes 30-second audio previews. Requests automatically append to the `Music` tab in Google Sheets and instantly sync into the DJ's live read-only vendor view (`/share/[token]`).
- [ ] **[Task 2.3.1] Admin Song Request Approval Queue & DJ Status Filter:**
  - Adds Column I: `Approval Status` (`approvalStatus`: `'Approved' | 'Pending Approval' | 'Banned' | 'Declined'`) to the `MUSIC` tab schema.
  - Automatically flags incoming guest song requests as `Pending Approval` (or `Banned` if matching a Banned track).
  - Admin approval workflow in `MusicManager.tsx` allowing couples to approve or decline song requests.
  - DJ Vendor View (`/share/[token]`) status filter pills for **All**, **Approved**, **Pending**, and **Banned**.
- [ ] **[Task 2.4] Dynamic Relational RSVP Sync:** Auto-updating guest RSVPs sync dietary restrictions directly into vendor catering counts and seating chart capacity alerts.
- [ ] **[Task 2.5] Catering & Menu Setup Page:** Dedicated menu management interface allowing couples to configure custom entree, appetizer, and dessert options, automatically populating meal choices into the Guest Registry Add/Edit modal.
- [ ] **[Task 2.6] Expanded Multi-Theme Aesthetic Engine:** Expand design presets beyond Editorial Minimalist and Neo-Brutalism by introducing **Botanical Romance** (sage green & soft blush tones with organic curves), **Midnight Tuxedo** (navy & gold leaf luxury dark mode), and **Retro Cyberpunk** (neon violet/cyan grid overlays & pixel badges), along with custom wedding palette token presets.

### Phase 2.5: Advanced Print & Export Studio Customization Engine
- [ ] **[Task 2.5.1] Custom Print Theme & Typography Switcher:** Allow couples to switch between print visual styles (*Classic Editorial Serif*, *Modern Minimalist Sans*, *Boho Elegant Script*, *High-Contrast Mono Roster*).
- [ ] **[Task 2.5.2] Canva Template Integration & Canva Bulk Create Exporter:**
  - Provide a dedicated **Canva Integration Hub** in the Print Studio with official Sheet2Vow Canva template links (*Editorial, Boho Romance, Minimalist, Luxury Gold*).
  - 1-click **`EXPORT CANVA BULK MERGE CSV`** formatted specifically for Canva's *Bulk Create* tool (`First Name`, `Last Name`, `Table Name`, `Seat Number`, `Meal Choice`, `Photo Upload QR URL`), allowing couples to auto-populate custom Canva place card and table number designs in seconds.
  - Future support for Canva Connect API (`Design with Canva` embed button).
- [ ] **[Task 2.5.3] Visual Table Diagrams & Numbered Seat Maps for Coordinators:** Render dynamic SVG/CSS shape diagrams (Circle, Rectangle, Square, Sweetheart) on printable Table Roster cards with numbered seat nodes (`#1`, `#2`, `#3`...) matching the numbered guest list, enabling day-of venue coordinators to physically place guest name cards at exact seat locations.
- [ ] **[Task 2.5.4] Emoji & Decorative Icon Toggles:** Option to toggle off food/meal emojis (e.g. `🥩`, `🍗`, `🐟`) for ultra-formal black-tie printouts or clean text-only place cards.
- [ ] **[Task 2.5.5] Granular Card Field & Seat ID Controls:** Option to show/hide Table Assignment, Seat ID (`Seat #4`), Meal Selection, or Dietary Restriction tags on place cards and table tent cards.
- [ ] **[Task 2.5.6] Strict Print Page Boundary & Bleed Guardrails:** Advanced CSS page-break logic (`page-break-inside: avoid; break-inside: avoid;`) and standard cardstock grid dimensions (Avery 5302 / 3.5" x 2" folded card templates) ensuring zero card bleed or awkward page overflow during PDF generation and physical printing.

### Phase 3: Live Google OAuth, Real Sheets Sync, Monetization & Suite Expansion
- [ ] **[Task 3.1] Production Google OAuth 2.0 & Real Google Sheets Sync:**
  - Connect live Google OAuth 2.0 authentication flow (`google-auth-library` / NextAuth / `@germin8/sheet2-core`) with verified Google Cloud Console OAuth App credentials (`drive.file` scope).
  - Transition from Mock Mode to live Google Sheets API v4 / Drive API v3 cell synchronization, automatically generating and initializing the master wedding planner sheet in the user's personal Google Drive (`My Drive/Wedding Planning`) with real-time two-way cell persistence.
- [ ] **[Task 3.2] Unified Product Usage Telemetry (GA4 Event Engine):** Standardized, privacy-conscious event tracking across the Sheet2 Suite (*Sheet2Vow, Sheet2Finance, Sheet2Home*) using Google Analytics 4 (`gtag` / `@next/third-parties`). Tracks feature engagement (e.g., `feature_tab_view`, `vendor_link_generated`, `seating_table_created`, `preset_chosen`) to pinpoint high-value modules vs. low-usage features across the product ecosystem.
- [ ] **[Task 3.3] Lemon Squeezy Integration & License Entitlements:** Merchant-of-Record webhook integration enforcing Basic vs Pro vs VIP feature gating as documented in [pricing_models.md](file:///d:/Development/sheet2vow/docs/pricing_models.md).
- [ ] **[Task 3.4] Co-Planning Partner Access (Spouse Google Drive Permission Delegation):** Invite a partner/spouse via email (`GRANT ADMIN ACCESS`) to delegate Google Drive read/write permissions so both spouses can co-plan on the same spreadsheet in real time.
- [ ] **[Task 3.5] Sheet2 Suite Ecosystem Expansion:** Reusing `@germin8/sheet2-core` for Sheet2Finance and Sheet2Home.

### Phase 4: Application Security, Risk Audit & Data Protection
- [ ] **[Task 4.1] OAuth Scope Isolation & Token Storage Audit:**
  - Enforce strict `drive.file` scope boundary so the application never accesses user Drive files outside Sheet2Vow.
  - Store tokens in encrypted, HTTP-only session cookies with automatic token revocation on disconnect.
- [ ] **[Task 4.2] Formula & CSV Injection Prevention:**
  - Implement strict string sanitization on user input fields to prevent Google Sheets Formula Injection attacks (escaping leading `=`, `+`, `-`, `@`).
- [ ] **[Task 4.3] Cryptographic Read-Only Token Security (`TokenShareEngine`):**
  - Sign vendor/coordinator share links with HMAC-SHA256 JWT tokens with strict payload scoping (e.g., read-only timeline slice for coordinators; music slice for DJs) and expiration timestamps.
- [ ] **[Task 4.4] Webhook Authentication & Replay Protection:**
  - Verify signature headers on Etsy and Lemon Squeezy payment webhooks (`HMAC-SHA256`) to prevent fraudulent license activation.
- [ ] **[Task 4.5] Data Loss & Backup Guardrails:**
  - Create automatic Google Sheet version snapshots prior to executing bulk row operations or structural changes.

---

## Micro-Animations & Interactivity

| Animation | Location | Description |
|---|---|---|
| **Theme Transition** | Global (`documentElement`) | Smooth 0.2s cross-fade when switching between Editorial and Neo-Brutalism themes. |
| **Seat Node Hover** | Seating Chart Canvas | Soft scale-up and highlight outline on seat initials nodes. |
| **Active Moment Pulse** | Timeline "UP NEXT" Banner | Soft pulsing highlight on the active moment badge. |
| **Card Hover Lift** | Guest / Music / Vendor Cards | Slight `translate-y (-2px)` with shadow offset on hover. |
| **Audio Spinner** | Music Preview Player | Smooth rotating loading indicator while fetching iTunes audio previews. |
