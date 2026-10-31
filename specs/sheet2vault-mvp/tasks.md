# Execution Tasks: Sheet2Vault MVP

**Feature ID:** `[FEAT-002]`  
**Target Specification:** [`specs/sheet2vault-mvp/spec.md`](spec.md)  
**Technical Plan:** [`specs/sheet2vault-mvp/plan.md`](plan.md)  
**Status:** `Approved`  

---

## Phase 1: Foundation & Master Template Engineering

- [ ] **Task 1.1:** Create `templates/sheet2vault_master_template.xlsx` with formatted tabs: `VAULT_ITEMS`, `VAULT_SETTINGS`, and `VAULT_CLAIMS`.
- [ ] **Task 1.2:** Inject `CellGuard`-safe formulas in column O of `VAULT_ITEMS` for automated readiness calculation (`=IF(AND(LEN(G2)>0,LEN(L2)>0,LEN(N2)>0),1,IF(LEN(L2)>0,0.6,0.2))`).
- [ ] **Task 1.3:** Configure sub-limit defaults in `VAULT_SETTINGS` (\$1,500 jewelry, \$5,000 electronics, \$2,500 power tools).
- [ ] **Task 1.4:** Register `vault` subdomain and route rewrites in `src/proxy.ts` and `next.config.ts`.

---

## Phase 2: Domain Types & Pluggable Activation Wizard

- [ ] **Task 2.1:** Implement TypeScript interfaces, enums, and CellGuard column mapping definitions in `src/products/vault/lib/vaultSchema.ts`.
- [ ] **Task 2.2:** Build `<VaultSetupWizard />` in `src/products/vault/setup/VaultSetupWizard.tsx` (Step 2 plugin capturing residence nickname, room selector checklist, and policy caps).
- [ ] **Task 2.3:** Register `<VaultSetupWizard />` in the generic activation engine (`src/components/activate/StepSetupForm.tsx`).
- [ ] **Task 2.4:** Implement `src/products/vault/lib/sublimitCalculator.ts` for real-time policy limit gap analysis.

---

## Phase 3: Mobile PWA "Room Sweep" Ingestion

- [ ] **Task 3.1:** Create `<RoomSweepDrawer />` in `src/products/vault/components/RoomSweepDrawer.tsx` optimized for 30-second mobile progressive capture.
- [ ] **Task 3.2:** Wire device camera & file input for progressive photo snapping (Item Photo $\rightarrow$ Serial Plate $\rightarrow$ Receipt).
- [ ] **Task 3.3:** Implement `/api/vault/media/upload` route handler to save photos directly to user's `Sheet2Vault Media` Drive folder using `drive.file` scope.
- [ ] **Task 3.4:** Ensure all mobile inputs enforce $16\text{px}$ font (iOS auto-zoom prevention) and $\ge 44\text{px}$–$48\text{px}$ touch targets per Article III of `CONSTITUTION.md`.

---

## Phase 4: Desktop Station & Monarch Hero Analytics

- [ ] **Task 4.1:** Build `src/app/vault/page.tsx` responsive canvas with dual mobile/desktop view modes.
- [ ] **Task 4.2:** Implement `<VaultHeroStrip />` featuring Monarch tabular typography (`tnum`, `zero`), showing Total Replacement Cost, Claim Readiness %, and Sub-Limit gap warnings.
- [ ] **Task 4.3:** Build `<VaultItemLedger />` supporting search, room filtering, category grouping, and "Missing Evidence" filter chips.
- [ ] **Task 4.4:** Integrate `<AmbientSyncIndicator />` in the masthead for quiet Google Sheets auto-saving per Article VII.

---

## Phase 5: Dossier Engine & Adjuster Portal

- [ ] **Task 5.1:** Build `<ClaimDossierModal />` allowing incident configuration (burglary, fire, water) and item selection.
- [ ] **Task 5.2:** Implement `/api/vault/export/pdf` route generating a downloadable, insurance-ready PDF with itemized replacement costs and embedded photo plates.
- [ ] **Task 5.3:** Implement `/api/vault/export/police` route outputting high-contrast stolen goods ledger with serial numbers for law enforcement.
- [ ] **Task 5.4:** Implement tokenized adjuster portal at `src/app/vault/claim/[token]/page.tsx` protected by HMAC-SHA256 signatures.

---

## Phase 6: Verification, Documentation & Production Release

- [ ] **Task 6.1:** Run `npm run spec:validate` to confirm all Spec Kit criteria and triad integrity.
- [ ] **Task 6.2:** Execute full TypeScript build verification (`npm run build`) and linting (`npm run lint`).
- [ ] **Task 6.3:** Verify manual flows: Room Sweep on mobile viewport, sub-limit alert triggers, and PDF claim dossier rendering.
- [ ] **Task 6.4:** Update `docs/platform/architecture.md` with Sheet2Vault entry and bump minor version (`npm run bump:minor`).
- [ ] **Task 6.5:** Commit and merge to `main` following Production Deployment Rule in `AGENTS.md`.
