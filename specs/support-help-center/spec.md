# Feature Specification: Support Help Center

**Feature ID:** `[FEAT-001]`  
**Target Product:** `Sheet2Suite Platform`  
**Status:** `Approved`  
**Author / DRI:** `Jordan Lee / Platform Team`  
**Created Date:** `2026-10-31`  

---

## 1. Product Intent & Problem Statement

Users purchasing Sheet2Suite products (starting with Sheet2Vow on Etsy) frequently have foundational questions regarding:
1. Where to find their 10-digit order receipt number on Etsy.
2. How Google OAuth permissions work and why `drive.file` guarantees private data sovereignty.
3. Where their spreadsheet is created in their personal Google Drive (`My Drive / Sheet2Suite / Sheet2Vow`).
4. How the 2-user collaboration model works (Primary Owner + Secondary Partner) and when to upgrade to Pro.
5. How two-way Google Sheets synchronization and `CellGuard` formula preservation operate.

Currently, this information is fragmented across tooltips or activation helper banners. There is no central, authoritative, public-facing knowledge base.

**Proposed Solution:** A dedicated, high-contrast, Monarch-branded Support & Help Center at `/support` (with `/help` alias), featuring instant keyword search, categorized interactive article accordions, deep-link anchors, and a privacy-first diagnostic contact card.

---

## 2. User Stories

1. **New Customer Onboarding:** As a new buyer, I want a clear visual step-by-step guide on finding my order number and connecting Google Drive, so that I can activate my planning canvas with confidence.
2. **Co-Planning Collaboration:** As a couple or planning team, I want to understand how to invite a secondary partner or wedding coordinator and manage Google Drive access, so that we collaborate effectively without exceeding license limits.
3. **Data Sovereignty & Safety:** As a privacy-conscious user, I want reassurance on how Sheet2Suite accesses my Google Drive and how to access my spreadsheet offline, so that I know my data is 100% mine.
4. **Troubleshooting & Help:** As an active user encountering an issue, I want to search for quick solutions in real time and submit diagnostic details to support in 1 click if I need human assistance.

---

## 3. Functional Requirements

### 3.1 Public Routing & Navigation
- **Primary Route:** `src/app/support/page.tsx` accessible at `/support`.
- **Proxy Alias:** `/help` automatically rewrites to `/support` in `src/proxy.ts`.
- **Zero Authentication Gating:** Accessible publicly without requiring Google OAuth login or prior order activation.

### 3.2 Monarch Editorial Layout & Typography
- **Masthead:** Editorial serif headline (*"Help Center & Knowledge Base"*), clean sans subtitle (*"Guides, tutorials, and answers for activating and co-planning with Sheet2Suite"*), and Monarch uppercase monospace badge (`SHEET2SUITE SUPPORT`).
- **Live Search Bar:** Reusable `<PageSearchInput />` component providing debounced real-time filtering across article titles, body copy, and category tags with an inline clear button (`✕`).
- **Category Filter Pills:** Horizontal scrollable pills with count badges:
  - `ALL TOPICS` (aggregate count)
  - `⚡ ACTIVATION` (Getting Started, Order IDs, Google Drive setup)
  - `👥 COLLABORATION` (Primary + Partner 2-user model, Pro tier, Drive sharing)
  - `📊 SPREADSHEETS & SYNC` (Bidirectional sync, CellGuard, offline access)
  - `🔒 PRIVACY & SOVEREIGNTY` (Scopes, data ownership, zero vendor lock-in)
  - `❓ FAQ & TROUBLESHOOTING` (Common errors, 401 recovery, session refresh)

### 3.3 Interactive Article Accordion Cards
- **Card Structure:** Low-radius hairline container (`rounded-[3px] border border-slate-200 dark:border-slate-800`), bold title, category tag, chevron expand/collapse indicator.
- **Deep-Link Anchor Support:** Each article possesses a semantic URL hash anchor (e.g. `/support#how-to-activate`, `/support#invite-partner`). Loading the page with an anchor hash automatically expands that article and scrolls it into view.
- **Accessible Interactions:** Full keyboard support (`Enter` or `Space` toggles accordion).

### 3.4 In-Page Diagnostic Contact Module
- Allows users to contact the team when self-service guides do not resolve their issue:
  - Category selector: `Activation & Order`, `Google Drive & Sync`, `Sharing & Collaborators`, `Feature Request`, `Other`.
  - Message textarea.
  - Automated diagnostic telemetry collector (non-sensitive: Browser User Agent, Operating System, Screen Resolution, Current Timestamp).
  - Primary button: `[ ✉️ SEND EMAIL TO SUPPORT ]` which generates a formatted `mailto:support@sheet2suite.com` with pre-filled subject and diagnostic body.

### 3.5 Global Entry Points
- **Main Platform Landing Page (`src/app/page.tsx`):**
  - Navigation bar link to `Support`.
  - Footer link to `Support & Help Center`.
- **Activation Wizard (`src/app/activate/page.tsx`):**
  - Top header `Help` link.
  - Step 0 order help callout link (*"Need help finding your order receipt? Read the activation guide"*).
- **In-App Workspace (`SettingsManager.tsx`):**
  - "Support & Help" tab deep-links to `/support`.

---

## 4. Edge Cases & Error Handling

| Scenario | Expected Behavior |
|---|---|
| **Zero Search Results** | Render high-contrast empty state with "No guides found matching '[query]'", a `[ CLEAR SEARCH ]` button, and direct link to the contact module. |
| **Direct Anchor Navigation** | When user navigates directly to `/support#sharing`, auto-scroll to the targeted card and expand its accordion body. |
| **JavaScript Disabled (SSR)** | Accordion articles render with readable semantic HTML so search engines and no-JS visitors have full content access. |
| **Small Mobile Screens ($\le 360\text{px}$)** | Category pills scroll horizontally with momentum; contact form reflows to single-column full-width touch targets ($\ge 48\text{px}$). |

---

## 5. Strict Acceptance Criteria

- [ ] **AC-1: Route Availability:** Navigating to `/support` and `/help` loads the Help Center with HTTP 200 and zero runtime errors.
- [ ] **AC-2: Real-Time Search:** Typing into `<PageSearchInput />` filters articles dynamically by title, content keywords, and category tags.
- [ ] **AC-3: Category Filtering:** Clicking category pills restricts the view to matching articles and updates the active pill style.
- [ ] **AC-4: Accordion & Deep-Linking:** Articles expand and collapse smoothly; URL hash anchors expand targeted articles on initial page load.
- [ ] **AC-5: Diagnostic Contact Form:** Submitting the contact form opens the user's email client with pre-filled category, message, and diagnostic telemetry directed to `support@sheet2suite.com`.
- [ ] **AC-6: Entry Point Integration:** Landing page header/footer, Activation wizard, and in-app Settings link cleanly to `/support`.
- [ ] **AC-7: Multi-Theme Support:** Renders seamlessly across Editorial Minimalist, Neo-Brutalism, and Botanical Romance in both Light and Dark modes.
- [ ] **AC-8: Code & Spec Verification:** `npm run build` and `npm run spec:validate` succeed with zero errors.

---

## 6. Explicit Non-Goals (Scope Guardrails)

- **Non-Goal 1: No Third-Party Chat Widgets:** Will not embed Intercom, Crisp, or Zendesk scripts to maintain zero tracker overhead and 100% data privacy.
- **Non-Goal 2: No Authentication Gating:** Support guides will not require Google sign-in or active licenses to read.
- **Non-Goal 3: No Server-Side Ticketing Database:** Will not build a complex cloud ticket database in this phase; client-side diagnostic `mailto:` satisfies all initial launch needs.
