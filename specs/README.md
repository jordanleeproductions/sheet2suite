# 🛠️ Sheet2Suite & Sheet2Vow — Spec Kit Registry

Welcome to the **Spec Kit Feature Pipeline** for the Sheet2Suite platform and Sheet2Vow digital canvas. All upcoming backlog epics and non-trivial feature enhancements are planned, reviewed, and executed through this directory following **Spec-Driven Development (SDD)** principles.

---

## 📜 Architectural Invariants

Every specification and technical plan must comply with the mandatory rules codified in [**`CONSTITUTION.md`**](CONSTITUTION.md):
- **Article I:** Data Sovereignty & Zero Lock-In (Google Sheets single source of truth)
- **Article II:** Formula & Schema Integrity (`CellGuard` preservation rules)
- **Article III:** Mobile Ergonomics & Touch Discipline ($\ge 44\text{px}$ targets, $16\text{px}$ input font)
- **Article IV:** Editorial Utility & Monarch Design System (Plain language, monospace numerals)
- **Article V:** Zero-Trust Security & Identity Isolation (Narrowed `drive.file` scope, BOLA defense)
- **Article VI:** Licensing & Quota Compliance (2-user Standard limit, Pro upgrade waitlist)
- **Article VII:** Ambient Feedback & Toast Restraint (Masthead ambient sync, max 2 toasts)

---

## 📋 Spec Lifecycle States

```
┌───────────┐      ┌─────────────┐      ┌───────────────┐      ┌───────────┐      ┌────────────┐
│ 1. DRAFT  ├─────►│ 2. PLANNED  ├─────►│ 3. IN PROGRESS├─────►│ 4. SHIPPED├─────►│ 5. ARCHIVED │
└───────────┘      └─────────────┘      └───────────────┘      └───────────┘      └────────────┘
```

1. **Draft:** Initial proposal. Problem statement, user stories, and acceptance criteria drafted in `spec.md`.
2. **Planned:** Architecture blueprint, target file inventory, and schema diffs finalized in `plan.md`. Execution tasks ordered in `tasks.md`.
3. **In Progress:** Coding agent or engineer actively executing tasks sequentially from `tasks.md`.
4. **Shipped:** Feature fully implemented, verified via `npm run build`, version bumped, and released to production (`main`).
5. **Archived:** Permanent architectural updates graduated into [`docs/platform/`](../docs/platform/) or [`docs/vow/modules/`](../docs/vow/modules/); spec folder moved to `specs/archive/`.

---

## 🗂️ Active Specifications

| Feature ID | Feature Name | Product | Target Release | DRI / Lead | Status | Specification Links |
|---|---|---|---|---|---|---|
| *None active* | *Run `npm run spec:new <feature-name>` to scaffold an epic* | — | — | — | — | — |

---

## 📦 Shipped & Archived Specifications

Historical completed feature specifications are graduated and archived in [`specs/archive/`](archive/):

| Feature ID | Feature Name | Product | Shipped Release | Archival Date | Graduated Docs Link |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

---

## 🚀 Quickstart: Spec-Driven Workflow

### 1. Scaffold a New Feature Epic
Run the scaffolding script to create a feature specification workspace:
```bash
npm run spec:new <feature-name>
# Example: npm run spec:new guest-rsvp-qr-code
```
This automatically:
- Creates `specs/<feature-name>/`.
- Copies `spec.md`, `plan.md`, and `tasks.md` from `specs/template/`.
- Assigns the next sequential Feature ID (`[FEAT-001]`).
- Registers the new feature in the Active Specifications table above.

### 2. Validate Specifications
Verify that all active specs conform to the required triad and acceptance criteria:
```bash
npm run spec:validate
```

### 3. Graduation & Archival
When a feature is merged to production:
1. Update permanent specifications in `docs/platform/` or `docs/vow/modules/<module>.md` and `docs/vow/master_spreadsheet_schema.md`.
2. Move `specs/<feature-name>/` to `specs/archive/<feature-name>/`.
3. Update the registry tables above.
