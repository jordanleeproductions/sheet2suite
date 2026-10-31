# Technical Architecture Plan: [Epic / Feature Name]

**Feature ID:** `[FEAT-XXX]`  
**Target Specification:** [`specs/[feature-name]/spec.md`](spec.md)  
**Status:** `[Draft | In Review | Approved | In Execution]`  

---

## 1. Technical Architecture Overview

*Provide a technical blueprint of the implementation, explaining how components, services, and APIs interact.*

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Client UI Component         │       │     Next.js Server API Route    │
│  (src/components/...Manager)    ├──────►│      (src/app/api/.../route)    │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ Client-side State & Optimistic  │       │ Google Sheets / Drive API v4    │
│    (useState / LocalStorage)    │       │     (CellGuard & Token Auth)    │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 2. Target Files & Component Architecture

### 2.1 File Inventory
| File Path | Action | Responsibility |
|---|---|---|
| `src/components/...` | `[Create / Modify]` | UI component presentation and user interaction |
| `src/app/api/.../route.ts` | `[Create / Modify]` | Server-side validation and Google Sheets proxy |
| `src/lib/sheets/mapper.ts` | `[Modify]` | Two-way row serialization and deserialization |
| `src/types/...ts` | `[Modify]` | TypeScript interfaces and domain schemas |

### 2.2 Component Hierarchy Diff
```text
Existing Container
└── <NewOrModifiedComponent />
    ├── <PageHeaderCard />
    ├── <SlideOverDrawer />
    └── <AmbientSyncIndicator />
```

---

## 3. Database & Spreadsheet Schema Diffs

### 3.1 Google Sheets Schema Diff
- **Target Sheet Tab:** `[e.g. GUESTS | EXPENSES | SCHEDULE]`
- **Column Modifications:**
  ```diff
  + Col X: Header Name (keyName: string) - Description of new column
  ```
- **Formula & Validation Rules:**
  - `CellGuard` preservation rules.
  - Dropdown validation rules linking to `Settings` tab.

### 3.2 Cloud Firestore Schema Diff
- **Target Collection:** `[workspaces | licenses | None]`
- **Document Changes:**
  ```typescript
  // Interface diff
  export interface ModifiedRecord {
    // Existing fields...
    + newField?: string;
  }
  ```

---

## 4. API Endpoints & Route Handlers

### 4.1 New / Updated Endpoints
- **Route:** `[GET | POST | PUT | DELETE] /api/[endpoint]`
- **Authentication:** `[Bearer Token | s2s_refresh_token Cookie | Admin Key | HMAC Share Token]`
- **Request Payload:**
  ```json
  {
    "spreadsheetId": "string",
    "field": "value"
  }
  ```
- **Response Payload:**
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

---

## 5. Security & Authorization Analysis

- **Workspace Authorization:** Verified via `verifyWorkspaceAccess(req, spreadsheetId)` in `src/lib/auth/workspaceAuth.ts`.
- **Formula Injection Defense:** Strings validated via `CellGuard.sanitizeCellValue()` to strip leading `=`, `+`, `-`, `@`.
- **Token Security:** Nonces, timing-safe string comparison, and minimized Google OAuth scopes (`drive.file`, `spreadsheets`).

---

## 6. Dependencies, Build & Performance Impact

- **New Packages:** `[None | package-name@version]` (preference for zero-dependency implementations).
- **Bundle Footprint:** Estimated bundle impact (tree-shaken imports, dynamic imports where appropriate).
- **Mobile Performance:** Avoiding layout shifts, lazy loading drawers, and limiting reactive event listeners.
