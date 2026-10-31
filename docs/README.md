# 📚 Sheet2Suite Documentation Directory

Welcome to the authoritative documentation repository for the **Sheet2Suite** digital canvas platform and its suite of domain-specific Google Sheets-backed applications.

---

## 🗂️ Documentation Sitemap

### 🌐 1. Platform Core Architecture (`docs/platform/`)
Foundational platform infrastructure, proxy routing, generic activation, licensing, and design system:

- [**`platform/architecture.md`**](platform/architecture.md) — Multi-product platform architecture, subdomain proxy routing (`src/proxy.ts`), zero-rebuild sub-product engine, and Next.js App Router workspace standards.
- [**`platform/activation_pipeline.md`**](platform/activation_pipeline.md) — Generic activation engine (`activate.sheet2suite.com`), Google OAuth flow, automated Drive folder resolution (`My Drive/Sheet2Suite/<Product>`), live spreadsheet copying, and pluggable `<ProductSetupPlugin />` contract.
- [**`platform/licensing_and_security.md`**](platform/licensing_and_security.md) — Cloud Firestore workspace licensing schema, 2-user collaboration limit enforcement (`MAX_SECONDARY_USERS = 1`), Pro upgrade tier, minimized OAuth scopes (`drive.file`, `spreadsheets`), and BOLA / cross-user authorization security.
- [**`platform/design_system.md`**](platform/design_system.md) — Monarch design language, CSS custom property tokens, multi-theme architecture (Editorial Minimalist, Neo-Brutalism, Botanical Romance), ambient sync indicator (`AmbientSyncIndicator.tsx`), and decoupled toast notification system.
- [**`user_lifecycle_flows.md`**](user_lifecycle_flows.md) — User lifecycle states, returning user flows, and multi-workspace switching.
- [**`sheet2suite_backlog.md`**](sheet2suite_backlog.md) — Platform roadmap, Lemon Squeezy / Etsy webhooks, Firebase App Hosting, and telemetry.

---

### 💍 2. Sheet2Vow Modular Domain Specs (`docs/vow/modules/`)
Discrete technical specifications for Sheet2Vow planning modules and user workflows:

- [**`vow/modules/seating.md`**](vow/modules/seating.md) — Visual floorplan canvas, ceremony aisle planner, party group priority sorting, seat position persistence (`Seat Number` in Col O), and collision-proof allocation algorithm.
- [**`vow/modules/guest_registry.md`**](vow/modules/guest_registry.md) — Guest RSVP management, dietary tracking, catering menu linkage, and party table groupings.
- [**`vow/modules/financials.md`**](vow/modules/financials.md) — Budget ledger, target caps, paid-by contributor breakdown (`paidBy` in Col H), and horizontal financial allocation strip.
- [**`vow/modules/timeline_and_kanban.md`**](vow/modules/timeline_and_kanban.md) — Day-of itinerary schedule and Jira mobile-inspired tasks Kanban board.
- [**`vow/modules/vendor_and_catering.md`**](vow/modules/vendor_and_catering.md) — Vendor directory, contract PDF upload to Drive `Contracts/` folder, and catering menu setup (`CATERING` tab sync).
- [**`vow/modules/settings_and_admin.md`**](vow/modules/settings_and_admin.md) — Monarch admin inspector (`/admin`), multi-device workspace auto-discovery, Google session recovery, and workspace user management.
- [**`vow/modules/media_and_print.md`**](vow/modules/media_and_print.md) — Music playlist curation (with launch status notes on DJ song request portal), and Print/Canva Studio (marked as sidelined for initial launch).

---

### 📊 3. Authoritative Schema & System Contracts
- [**`vow/master_spreadsheet_schema.md`**](vow/master_spreadsheet_schema.md) — Authoritative 15-tab schema reference matching the live Master Wedding Spreadsheet template.
- [**`vow/architecture.md`**](vow/architecture.md) — Sheet2Vow application shell, component hierarchy, and Next.js App Router structure.
- [**`vow/design.md`**](vow/design.md) — Design tokens, color palettes, and theme switcher architecture.
- [**`vow/pricing_models.md`**](vow/pricing_models.md) — Tiered pricing strategy (Basic vs Pro vs VIP) and feature gating matrix.
- [**`vow/ux_audit_report.md`**](vow/ux_audit_report.md) — UX/UI accessibility review across 8 style & color mode combinations.

---

### 🛠️ 4. Spec Kit Feature Pipeline (`specs/`)
Standardized feature engineering templates for future epics:
- [**`specs/template/spec.md`**](../specs/template/spec.md) — Product intent, user stories, functional requirements, edge cases, strict acceptance criteria, and non-goals.
- [**`specs/template/plan.md`**](../specs/template/plan.md) — Technical architecture blueprint, target files, schema diffs, API endpoints, and dependency impacts.
- [**`specs/template/tasks.md`**](../specs/template/tasks.md) — Granular, sequential, checkbox execution tasks for coding agents.

---

### 📦 5. Technical Specification Index & Historical Archives
- [**`tech_spec.md`**](tech_spec.md) — Master technical specification index pointing to modular platform and domain specs.
- [**`archive/v1_completed_features.md`**](archive/v1_completed_features.md) — Historical completed task and implementation matrix from the V1.0 release.
- [**`vow/features.md`**](vow/features.md) — Active features overview, bug backlog, micro-animations, and codebase refactoring tracker.
- [**`vow/sheet2vow_backlog.md`**](vow/sheet2vow_backlog.md) — Sheet2Vow pending feature roadmap.
