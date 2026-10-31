# Sheet2Suite & Sheet2Vow — Architectural Constitution

This Constitution declares the non-negotiable architectural invariants and quality standards that **every** feature epic, specification (`spec.md`), and technical plan (`plan.md`) must satisfy before implementation.

---

## Article I: Data Sovereignty & Zero Vendor Lock-In
1. **User-Owned Single Source of Truth:** All primary operational data (guests, budgets, timelines, vendors, seating, tasks, music, photos) must reside inside user-owned Google Spreadsheets within the user's personal Google Drive.
2. **Offline Independence:** If Sheet2Suite servers or web clients are unreachable, the user's Google Spreadsheet must remain 100% human-readable, editable, and structurally sound directly inside Google Sheets.
3. **Zero Proprietary Data Traps:** No core domain data may be held exclusively in proprietary cloud databases without direct bidirectional mirroring to the user's spreadsheet.

---

## Article II: Formula & Schema Integrity (`CellGuard`)
1. **Formula Preservation:** All spreadsheet writebacks (`POST /api/sync`) must run through `CellGuard` to preserve calculated formulas (`=SUM(...)`, `=COUNTA(...)`, etc.). Formulas must never be overwritten with hardcoded values.
2. **Formula Injection Defense:** User-supplied strings must be sanitized against formula injection prefixes (`=`, `+`, `-`, `@`) before persistence.
3. **Authoritative Schema Contract:** Any modification, addition, or retirement of spreadsheet columns or tabs must be recorded in [`docs/vow/master_spreadsheet_schema.md`](../docs/vow/master_spreadsheet_schema.md).

---

## Article III: Mobile Ergonomics & Touch Discipline
1. **Touch Target Floor:** All interactive controls (buttons, segmented pills, dropdown selectors, edit chips, delete actions) must satisfy a minimum tap hitbox of $\ge 44\text{px}$–$48\text{px}$ on mobile viewports ($\le 768\text{px}$).
2. **iOS Auto-Zoom Prevention:** Form inputs (`input`, `select`, `textarea`) on mobile must enforce `font-size: 16px` (or `1rem`) and `min-height: 48px` to eliminate unwanted viewport zooming in iOS Safari.
3. **Safe-Area Awareness:** Drawers, floating buttons (`MobileFAB`), and bottom navigation bars must dock with hardware safe areas (`env(safe-area-inset-bottom, 0px)`).

---

## Article IV: Editorial Utility & Monarch Design System
1. **Plain-Language User Interface:** User screens must employ everyday, warm wedding and project language. Developer, accounting, and spreadsheet jargon ("relational entity", "raw float serial", "cell coordinate", "ledger partition") are strictly prohibited.
2. **Typographic Hierarchy:**
   - Display & Masthead: Editorial serif (`Newsreader` / `Playfair Display`).
   - Body & Controls: Clean interface sans (`Inter`).
   - Numerical & Financial: Technical monospace with tabular figures and slashed zeroes (`JetBrains Mono` / `Geist Mono` with `tnum` and `zero` features).
3. **Low-Radius & Hairline Discipline:** Radii are clamped to low-radius values (`rounded-[3px]`, `2px`–`4px`). Oversized pills, floating bento grids, and blurry drop shadows are prohibited in favor of crisp 1px hairline rules (`border-slate-200` / `border-slate-800`).
4. **Theme Adaptability:** All UI components must render correctly across all active design themes (*Editorial Minimalist*, *Muted Neo-Brutalism*, *Botanical Romance*) in both Light and Dark modes.

---

## Article V: Zero-Trust Security & Identity Isolation
1. **Scope Minimization:** Applications must request strictly restricted OAuth scopes (`https://www.googleapis.com/auth/drive.file` and `spreadsheets`). Broad root `drive` scopes are strictly prohibited.
2. **Caller Identity Isolation (BOLA / IDOR):** All spreadsheet data access routes (`/api/sync`), session verification, and folder lookups must verify caller identity (`verifyWorkspaceAccess`). Refuse stored refresh token lookups for unauthenticated callers.
3. **Administrative Protection:** Administrative endpoints (`/api/admin/*`) require constant-time cryptographic comparison (`crypto.timingSafeEqual`) of `ADMIN_SECRET_KEY` and secure HttpOnly session cookies.
4. **Login CSRF Defense:** Google OAuth authorization flows must bind an unpredictable 32-byte cryptographic nonce (`s2s_oauth_nonce`) validated upon callback.

---

## Article VI: Licensing & Quota Compliance
1. **2-User Standard Limit:** Standard workspaces strictly limit collaboration to **2 accounts total** (1 Primary Owner + 1 Secondary Partner/Co-Planner; `MAX_SECONDARY_USERS = 1`).
2. **Pro Tier Gating:** Attempting to invite a 3rd user on a Standard license must return HTTP 403 `requiresPro: true` and prompt [`ProUpgradeModal.tsx`](../src/components/vow/ProUpgradeModal.tsx).

---

## Article VII: Ambient Feedback & Toast Queue Discipline
1. **Ambient Sync Decoupling:** Routine spreadsheet auto-saves must be reflected exclusively via [`AmbientSyncIndicator.tsx`](../src/components/vow/AmbientSyncIndicator.tsx) docked quietly in the masthead.
2. **Toast System Restraint:** Floating popup toasts (`ToastNotification.tsx`) are reserved strictly for high-value milestone actions (exports, link copies, session restores) and critical errors. The toast queue is strictly capped at a maximum of **2 visible toasts** with automatic deduplication.
