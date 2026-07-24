# Sheet2Vow - Features and Roadmap

## Implemented Features

### 1. Dual Design System & Theme Engine
- **Editorial Minimalist Theme (Default):** Calm, high-end editorial aesthetic featuring classic serif typography (`Playfair Display`), warm tones, and subtle borders.
- **Muted Neo-Brutalism Theme (MongoDB / Gumroad Style):** Tactile, bold, geeky design system with 3px dark slate borders, zero-blur hard directional drop shadows, stark white card surfaces, `Geist Mono` typography for buttons/labels/badges, and custom accent color selection.
- **Light & Dark Mode:** Global color theme toggle (`light` | `dark`) persisted in `localStorage` across all pages and components.
- **Custom Primary Color Selector:** User-customizable accent green (`#00ED64` / `#13AA52` / custom hex) for highlighted metrics, badges, and controls.

### 2. Dashboard Summary (`DashboardMetrics`)
- **Real-Time KPI Cards:** Overview of Total Guests, Attending Count, Total Budget, Paid Amount, and Balance Owing.
- **Interactive Progress Bars:** Visual meters for Budget Allocation (% of total estimated cost) and Seating Capacity.

### 3. Guest Registry (`GuestListManager`)
- **View Switcher:** Grid View, Seating View (table arrangements), and Household/Party Group View.
- **Instant RSVP Actions:** Quick-toggle RSVP buttons (ATTENDING, DECLINED, PENDING) with high-contrast color badges.
- **Filtering & Search:** Real-time search by guest name, dietary restriction, or table arrangement.
- **Export & Print:** Native CSV export and optimized `@media print` layout for printable guest lists.

### 4. Budget Ledger (`BudgetLedgerManager`)
- **Financial Tracking:** Estimated Cost vs. Actual Cost vs. Amount Paid vs. Balance Owing per item.
- **Ledger Totals Card:** Highlighted summary card with green accent numbers and clear high-contrast labels.
- **Payment Statuses:** Status tracking for Paid, Pending, and Overdue payments.
- **Category Over-Budget Alerts:** Warning badges for items exceeding initial estimates.

### 5. Day-Of Timeline (`TimelineManager`)
- **"UP NEXT" Banner:** Featured top banner highlighting the immediate next timeline moment with quick step navigation.
- **Role-Based Filtering:** Filter events by responsibility (*Bridal Party*, *Catering*, *Photography*, *Guests*).
- **Late-Night Time Tracking:** Automatic detection for late-night events (12:00 AM – 4:00 AM) with `🌙 +1 DAY` badge.

### 6. Vendor Directory (`VendorManager`)
- **Directory Cards:** Comprehensive vendor contact info, category, phone number, email, and contract notes.
- **Search & Filtering:** Search by vendor name, service category, or payment notes.

### 7. Kanban Checklist (`KanbanBoard`)
- **Task Columns:** Organize tasks by status (*To Do*, *In Progress*, *Done*).
- **Priority Badges:** High, Medium, and Low priority tags with target due dates.

### 8. Wedding Playlist & Music (`MusicManager`)
- **Song Catalog:** Categorized playlist tracks (*Ceremony*, *Reception*, *First Dance*, *Must Play*).
- **Banned Songs Section:** Separate `BANNED` (Do Not Play) tracks with deeper red badges and black borders.
- **iTunes Audio Preview:** Live 30-second audio preview player with play/pause circular toggle.
- **External Streaming Buttons:** Spotify and YouTube search buttons fixed at the bottom of each song card.
- **Smart Sorting:** Automatic grouping of Banned songs at the bottom of the list when viewing "ALL SONGS".

### 9. Modular Feature Toggles (`enabledModules`)
- **Module Customization Controls:** Users can enable or disable individual modules (*Guest Registry*, *Budget Ledger*, *Day-Of Timeline*, *Vendor Directory*, *Kanban Checklist*, *Music Playlist*) during Onboarding setup or anytime in Settings.
- **Dynamic Navigation & Dashboard Filtering:** Disabled modules automatically hide their top navbar tab and corresponding dashboard widgets, keeping the UI minimal and tailored.

---

## Roadmap & Next Features

### Phase 1: Onboarding & Setup Customization (Up Next)

1. **Custom External Links & Platform Controls**
   - **Streaming Platform Chooser:** Allow users to choose which streaming platform buttons appear on Music cards (e.g., toggle Spotify, YouTube, Apple Music, Tidal, or Soundcloud).
   - **Custom Tab Naming & Ordering:** Allow users to rename navigation tabs (e.g., rename `[ LEDGER ]` to `[ EXPENSES ]` or `[ GUEST LIST ]` to `[ RSVPs ]`).

2. **Formula Reveal & Spreadsheet Transparency**
   - **KPI Card Formula Tooltips:** Interactive Info button (`ℹ`) on top-right of summary metric cards that displays the exact Google Sheets / Excel formula used to compute that metric (e.g., `=COUNTIF('Guest List'!E:E, "Attending")`).

3. **Onboarding Preset Packs**
   - Provide ready-to-use template presets during setup (e.g. *Micro Wedding*, *Destination Wedding*, *Traditional Large Wedding*) pre-populating suggested timeline milestones and budget categories.

### Phase 2: Public Guest Portal & Sharing

1. **Guest-Facing RSVP Portal**
   - Generate a lightweight, read-only public link for guests to submit their RSVP and dietary requirements directly into the planner without master edit access.

2. **Shareable Timeline for Vendors & Bridal Party**
   - Dedicated print/digital view of the Day-Of Timeline filtered by specific roles (e.g. a shareable link specifically for the Photographer or Caterer).

### Phase 3: Advanced Integrations & Automations

| Feature | Description |
|---|---|
| **Google Sheet Schema Presets** | One-click Google Sheet template cloning directly to user's Google Drive. |
| **Google Auth & Drive Storage** | Direct OAuth integration with Google Drive to auto-save and auto-sync changes. |
| **Offline Cache & PWA Support** | Progressive Web App support enabling offline timeline access on the wedding day. |

---

## Micro-Animations & Interactivity

| Animation | Location | Description |
|---|---|---|
| **Theme Transition** | Global (`documentElement`) | Smooth 0.2s cross-fade when switching between Editorial and Neo-Brutalism themes. |
| **Active Moment Pulse** | Timeline "UP NEXT" Banner | Soft pulsing highlight on the active moment badge. |
| **Card Hover Lift** | Guest / Music / Vendor Cards | Slight `translate-y (-2px)` with shadow offset on hover. |
| **Audio Spinner** | Music Preview Player | Smooth rotating loading indicator while fetching iTunes audio previews. |
