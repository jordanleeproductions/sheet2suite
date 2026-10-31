# Execution Tasks: Support Help Center

**Feature ID:** `[FEAT-001]`  
**Target Specification:** [`specs/support-help-center/spec.md`](spec.md)  
**Technical Plan:** [`specs/support-help-center/plan.md`](plan.md)  
**Status:** `Completed`  

---

## Phase 1: Support Knowledge Base & Static Data

- [x] **Task 1.1: Create Articles Dictionary (`src/data/supportArticles.ts`)**
  - Define `SupportArticle` and `SupportCategory` TypeScript interfaces.
  - Author comprehensive guide articles across all 5 categories:
    - *Activation:* Etsy 10-digit order lookup, Google OAuth setup, folder location in My Drive.
    - *Collaboration:* 2-user model (Primary + Partner), Pro tier upgrade, Drive permissions.
    - *Spreadsheet Sync:* Bidirectional sync, `CellGuard` formula protection, offline edits.
    - *Privacy & Sovereignty:* Non-sensitive `drive.file` scope, data ownership guarantees.
    - *Troubleshooting:* Session expired recovery, 401 refresh, mobile browser tips.
  - Include search indexing keywords, summary lines, and tips for each article.

---

## Phase 2: Help Center UI Page Component

- [x] **Task 2.1: Page Shell & Masthead (`src/app/support/page.tsx`)**
  - Set up Next.js App Router client component with SEO metadata.
  - Implement Monarch editorial masthead with badge, serif title, and descriptive subtitle.
- [x] **Task 2.2: Live Search & Category Filter Navigation**
  - Integrate `<PageSearchInput />` with debounced search query state.
  - Build horizontal scrollable category pills bar with live match count badges.
  - Filter articles dynamically via `useMemo`.
- [x] **Task 2.3: Interactive Article Accordion Cards**
  - Build expandable accordion cards with chevron indicator and transition animations.
  - Support URL hash anchor deep-linking (auto-scroll and auto-expand target article on mount).
  - Add high-contrast empty state with "Clear Search" button when no results match.
- [x] **Task 2.4: In-Page Diagnostic Contact Card**
  - Build contact card with category select dropdown and message textarea.
  - Implement client-side diagnostic telemetry compiler (User Agent, OS, screen dimensions).
  - Implement 1-click `mailto:support@sheet2suite.com` generator with formatted subject and body.

---

## Phase 3: Routing & Cross-Platform Entry Points

- [x] **Task 3.1: Subdomain & Proxy Rewrite (`src/proxy.ts`)**
  - Add `/help` rewrite mapping directly to `/support`.
- [x] **Task 3.2: Landing Page Links (`src/app/page.tsx`)**
  - Add `Support` link in header navigation bar.
  - Add `Support & Help Center` in the footer link columns.
- [x] **Task 3.3: Activation Flow Help Integration (`src/app/activate/page.tsx`)**
  - Add `Help` link in header navigation.
  - Add direct link to `/support#how-to-find-etsy-order` in the Step 0 order help callout.
- [x] **Task 3.4: In-App Settings Deep-Link (`SettingsManager.tsx`)**
  - Ensure Support tab includes direct link to `/support`.

---

## Phase 4: Ergonomics & Multi-Theme Verification

- [x] **Task 4.1: Mobile Touch Targets & iOS Anti-Zoom**
  - Verify all touch hitboxes satisfy $\ge 48\text{px}$ on mobile viewports ($\le 768\text{px}$).
  - Enforce `font-size: 16px` on form inputs.
- [x] **Task 4.2: Multi-Theme Aesthetics**
  - Test visual presentation across Editorial Minimalist, Neo-Brutalism, and Botanical Romance.

---

## Phase 5: Verification & Quality Assurance

- [x] **Task 5.1: Spec Kit Validation**
  - Run `npm run spec:validate` to ensure `specs/support-help-center/` satisfies all standards.
- [x] **Task 5.2: Production Build Check**
  - Run `npm run build` to confirm zero Next.js App Router or TypeScript compilation errors.

---

## Phase 6: Release & Production Deployment

- [x] **Task 6.1: Documentation Synchronization**
  - Sync platform documentation index in `docs/platform/architecture.md` and `docs/README.md`.
- [x] **Task 6.2: Version Bump & Release Notes**
  - Run `npm run bump:minor` to increment version and write user-facing release notes.
- [x] **Task 6.3: Production Deployment**
  - Commit and push to `develop`, merge into `main`, and push to `origin main`.
