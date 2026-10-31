# Execution Tasks: Sheet2vault Mvp

**Feature ID:** `[FEAT-002]`  
**Target Specification:** [`specs/sheet2vault-mvp/spec.md`](spec.md)  
**Technical Plan:** [`specs/sheet2vault-mvp/plan.md`](plan.md)  
**Status:** `[Pending | In Progress | Completed]`  

---

## Phase 1: Domain Models & Schema Definitions

- [ ] **Task 1.1: TypeScript Domain Types**
  - Update or define interfaces in `src/types/wedding.ts` or `src/types/licensing.ts`.
  - Add strict typing for all new payload models and form data structures.
- [ ] **Task 1.2: Google Sheet Row Mapper**
  - Update `src/lib/sheets/mapper.ts` (`fromRow` and `toRow` methods).
  - Verify `CellGuard` preserves formula strings and sanitizes user input values.
- [ ] **Task 1.3: Update Authoritative Schema Reference**
  - Record any column diffs in `docs/vow/master_spreadsheet_schema.md`.

---

## Phase 2: Backend Handlers & API Routes

- [ ] **Task 2.1: Server API Route Handler**
  - Implement or update route handlers under `src/app/api/.../route.ts`.
  - Enforce caller identity and authorization check (`verifyWorkspaceAccess`).
- [ ] **Task 2.2: Session & Auth Error Handling**
  - Ensure 401 token expirations trigger silent refresh via `/api/auth/refresh`.
  - Return standardized API response format (`apiResponse.success()`, `apiResponse.error()`).

---

## Phase 3: UI Components & Client Ergonomics

- [ ] **Task 3.1: Desktop Component Layout**
  - Implement or update desktop manager components under `src/components/`.
  - Standardize headers with `<PageHeaderCard />` and metric strips with `<PageMetricStrip />`.
- [ ] **Task 3.2: Universal Slide-Over Drawer Inspector**
  - Implement edit/creation forms using `<SlideOverDrawer />` and `<MonarchForm />`.
  - Ensure 3-button bulk-loading workflow (`CANCEL`, `SAVE & ADD NEW`, `SAVE`).
- [ ] **Task 3.3: Mobile Ergonomics & Touch Optimization**
  - Enforce $\ge 44\text{px}$–$48\text{px}$ touch targets on buttons, toggles, and edit actions.
  - Enforce $16\text{px}$ font size and $\ge 48\text{px}$ input height on mobile form fields.
  - Dock drawers above mobile bottom nav with `safe-area-inset-bottom`.
- [ ] **Task 3.4: Multi-Theme Adaptability**
  - Verify visual presentation across Editorial Minimalist, Neo-Brutalism, and Botanical Romance.

---

## Phase 4: State Synchronization & Ambient Feedback

- [ ] **Task 4.1: Client State & Optimistic Rendering**
  - Update React state (`useState`, `useCallback`) for immediate optimistic response.
- [ ] **Task 4.2: Ambient Sync Decoupling**
  - Route routine spreadsheet save states to `<AmbientSyncIndicator />`.
  - Reserve floating popups (`ToastNotification.tsx`) strictly for milestone exports or errors.

---

## Phase 5: Verification & Quality Assurance

- [ ] **Task 5.1: Build & Type-Check Verification**
  - Run `npm run build` to verify zero Next.js App Router or TypeScript compilation errors.
- [ ] **Task 5.2: Responsive Viewport Testing**
  - Verify layout integrity across Desktop ($\ge 1200\text{px}$), Tablet ($768\text{px}$–$1023\text{px}$), and Mobile ($\le 480\text{px}$).
- [ ] **Task 5.3: End-to-End Data Persistence Test**
  - Verify create, read, update, and delete actions against Google Sheets sync engine.

---

## Phase 6: Documentation Synchronization & Deployment

- [ ] **Task 6.1: Documentation Synchronization**
  - Update corresponding modular specification in `docs/platform/` or `docs/vow/modules/`.
- [ ] **Task 6.2: Semantic Version Bump & Release Notes**
  - Run `npm run bump:minor` (or `bump:patch` for fixes).
  - Add user-facing, non-technical release notes entry in `src/lib/releaseNotes.ts`.
- [ ] **Task 6.3: Production Deployment**
  - Push changes to `develop`, merge to `main`, and push to `origin main`.
