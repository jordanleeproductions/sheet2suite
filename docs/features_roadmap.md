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

### 11. Modular Feature Toggles (`enabledModules`)
- **Module Customization Controls:** Users can enable or disable individual modules (*Guest Registry*, *Seating Chart*, *Budget Ledger*, *Day-Of Timeline*, *Vendor Directory*, *Kanban Checklist*, *Music Playlist*) during Onboarding setup or anytime in Settings.
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
- [x] Dual Design Engine (Editorial & Neo-Brutalism with Light/Dark modes).
- [x] Purchase Activation & Setup Wizard (`/activate`).
- [x] Task List Preset Packs (Traditional, Micro, Destination, Blank).
- [x] Mobile-first Guest Registry, Budget Ledger, Timeline, Vendor Directory, Kanban, Music Player.
- [x] Visual Table Seating Plan Manager (Circle, Rectangle, Sweetheart tables).

### Phase 2: Relational Sync & Public Share Portals (In Progress)
- [ ] **Dynamic Relational RSVP Sync:** Auto-updating guest RSVPs sync dietary restrictions directly into vendor catering counts and seating chart capacity alerts.
- [ ] **Tokenized Read-Only Vendor Views (`/share/[token]`):** Cryptographic JWT view links for vendors (DJ playlist, Photographer shot list, Coordinator itinerary) without forcing login.
- [ ] **Print-Ready PDF CSS Export Templates:** One-click printable place cards, timeline rosters, and vendor contacts.

### Phase 3: Monetization & Suite Expansion
- [ ] **Lemon Squeezy Integration:** Merchant-of-Record webhook integration for Tier 2 / Pro upgrades.
- [ ] **Sheet2 Suite Ecosystem Expansion:** Reusing `@germin8/sheet2-core` for Sheet2Finance and Sheet2Home.

### Phase 4: Application Security, Risk Audit & Data Protection
- [ ] **OAuth Scope Isolation & Token Storage Audit:**
  - Enforce strict `drive.file` scope boundary so the application never accesses user Drive files outside Sheet2Vow.
  - Store tokens in encrypted, HTTP-only session cookies with automatic token revocation on disconnect.
- [ ] **Formula & CSV Injection Prevention:**
  - Implement strict string sanitization on user input fields to prevent Google Sheets Formula Injection attacks (escaping leading `=`, `+`, `-`, `@`).
- [ ] **Cryptographic Read-Only Token Security (`TokenShareEngine`):**
  - Sign vendor/coordinator share links with HMAC-SHA256 JWT tokens with strict payload scoping (e.g., read-only timeline slice for coordinators; music slice for DJs) and expiration timestamps.
- [ ] **Webhook Authentication & Replay Protection:**
  - Verify signature headers on Etsy and Lemon Squeezy payment webhooks (`HMAC-SHA256`) to prevent fraudulent license activation.
- [ ] **Data Loss & Backup Guardrails:**
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
