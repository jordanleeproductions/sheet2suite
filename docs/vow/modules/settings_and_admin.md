# Sheet2Vow — Settings & Admin Specification

**Primary Components:** `src/app/admin/page.tsx`, `src/components/settings/SettingsManager.tsx`, `src/lib/auth/adminAuth.ts`, `src/lib/core/sessionCheck.ts`  
**API Endpoints:** `/api/admin/db`, `/api/admin/auth`, `/api/workspaces`, `/api/share/partner`, `/api/auth/session`, `/api/auth/refresh`

---

## 1. Dedicated Settings Workspace (`/settings` & `/vow/settings`)

The Settings module provides comprehensive workspace configuration, layout personalization, user access governance, and cloud data source inspection.

### 1.1 Responsive 2-Pane Split & Mobile Drill-Down
- **Desktop 2-Pane Split:** Centered 1020px container with a 220px sticky navigation rail and 680px right-hand form pane featuring quiet "Saved" status indicators and unsaved changes confirmation guards.
- **Mobile Settings Drill-Down Architecture:**
  - **Index View:** Sticky app bar labeled "Settings", user summary card with Google avatar initials and email, and 5 distinct grouped list cards (*Your Wedding*, *Preferences*, *Planning*, *Data*, *Support*) with $\ge 52\text{px}$ tap targets.
  - **Detail Views:** Full-screen views with top back navigation (`‹ Settings`), single-column inputs, visual theme selector cards with live swatches, and a reactive planning tools toggle list (*"Choose which tools appear in your navigation. Turning a tool off does not delete its information."*).

### 1.2 Quick Settings Popover (`QuickSettingsPopover.tsx`)
Header gear icon triggers an instant lightweight popover for immediate 3-way color mode switching (Light/Dark/System), text scale adjustment (80%–120%), and visual style preview without leaving the active canvas.

---

## 2. Multi-Device Workspace Auto-Discovery & Cloud Sync

### 2.1 Cross-Device Workspace Discovery (`[WORKSPACE-MULTI-DEVICE-DISCOVERY]`)
- Upon logging in with Google OAuth on a new desktop or mobile device, the system automatically queries `/api/workspaces` and scans `My Drive / Sheet2Suite / Sheet2Vow`.
- Auto-hydrates the active spreadsheet ID into `localStorage` and application state without requiring manual link sharing or configuration transfers.

### 2.2 404 Self-Healing Recovery
- If a client device holds a stale spreadsheet ID resulting in a 404 `"Requested entity was not found."` error from the Google Sheets API, the client triggers automatic self-healing by querying `/api/workspaces` for the active user spreadsheet and hot-swapping `localStorage`.

---

## 3. Session Recovery & Silent Refresh Engine

### 3.1 Long-Lived 90-Day Sessions (`[AUTH-LONG-LIVED-SESSIONS]`)
- **HTTP-Only Refresh Cookie:** Stores Google OAuth `refresh_token` in a 90-day secure HTTP-only cookie (`s2s_refresh_token`).
- **Dedicated Silent Refresh Route (`POST /api/auth/refresh`):** Exchanges refresh tokens silently for fresh Google access tokens, updates cookies and Cloud Firestore, and returns fresh access credentials.
- **Automatic 401 Retry Resilience:** Catches 401 token expirations in `/api/sync` and `/api/auth/session`, automatically requests a refreshed access token, retries the operation once, and returns updated tokens.
- **Tab Visibility Heartbeat:** Triggers silent token verification upon browser tab focus (`visibilitychange`) and on a 25-minute background interval.

### 3.2 Preemptive Modal Session Check (`[AUTH-MODAL-SESSION-CHECK]`)
- Calls `verifyActiveSession()` (`sessionCheck.ts`) prior to opening Add or Edit modals across all 10 modules.
- Caches positive session checks for 45 seconds to keep the interface fast while ensuring no user data is typed into an expired session.

### 3.3 Session Expired Modal (`[AUTH-SESSION-EXPIRED-MODAL-REDESIGN]`)
- High-contrast security dialog triggered when tokens cannot be refreshed silently.
- Features a prominent 1-click `SIGN IN WITH GOOGLE` primary action, connected account email indicator, and workspace disconnect option.

---

## 4. Workspace User Management & 2-User Model Enforcer

- **Standard 2-User Model:** Standard tier licenses strictly enforce a quota of 2 users (1 Primary Owner + 1 Secondary Partner/Co-Planner).
- **Pro Tier Waitlist & Modal (`ProUpgradeModal.tsx`):** Attempting to invite a 3rd user returns HTTP 403 `requiresPro: true` and launches the Pro modal detailing unlimited collaborator seats.
- **Drive Permission Reconciliation:** Uses Google Drive `permissions.list` to auto-discover partner emails possessing `writer` permissions on the spreadsheet, auto-healing Firestore workspace records.
- **Card Controls:** `SettingsManager.tsx` displays the Primary User Crown card, Secondary User Slot with an invite/revoke action, and Pro upgrade card.

---

## 5. Monarch Admin Database Inspector (`/admin`)

Sheet2Suite administrators access system diagnostics and records at `/admin`:

- **Operational Hero Metric Strip:** Live status cards for *Active Workspaces*, *Registered Licenses*, *Schema Engine*, and *Database Mode* (`FIRESTORE LIVE` vs `LOCAL DISK MOCK`).
- **Monarch Segmented Capsule Navigation:** Switch between *Workspaces (N)*, *Licenses (N)*, and *Schema Engine*.
- **Universal Slide-Over Inspector (`<SlideOverDrawer>` + `<MonarchForm>`):**
  - **Structured Form Mode:** Edit workspace and license attributes with formatted inputs and validation.
  - **Raw JSON Editor Mode:** Full JSON document editor with real-time syntax checking.
- **Zero-Trust Administrative Protection (`src/lib/auth/adminAuth.ts`):** Constant-time cryptographic comparison (`safeCompare`) of administrative secret keys (`ADMIN_SECRET_KEY`), 7-day secure HttpOnly session cookies (`s2s_admin_key`), and Monarch Admin Lock Screen.
- **BOLA / IDOR Defense:** Refuses unauthenticated token lookups and enforces caller token isolation across sync and drive endpoints.
