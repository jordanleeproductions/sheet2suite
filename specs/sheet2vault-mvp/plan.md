# Technical Architecture Plan: Sheet2Vault MVP

**Feature ID:** `[FEAT-002]`  
**Target Specification:** [`specs/sheet2vault-mvp/spec.md`](spec.md)  
**Status:** `Approved`  

---

## 1. Technical Architecture Overview

Sheet2Vault operates as a domain sub-product within the Next.js App Router multi-product platform (`sheet2suite.com/vault` and `vault.sheet2suite.com` via `src/proxy.ts`). It leverages the platform's core infrastructure: Google OAuth, `CellGuard` formula integrity engine, Drive directory manager, and the Monarch Design System.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Sheet2Vault Client Application                       │
│  Mobile PWA (Room Sweep & Fast-Add)  │ Desktop Station (Audit & Claims) │
└────────────────────┬────────────────────────────────────┬───────────────┘
                     │                                    │
                     ▼                                    ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────┐
│   Google Drive API v3 (drive.file)   │ │  Next.js Serverless API Routes │
│ Upload Item Photos, Serials, Receipts│ │ /api/sync  │ /api/vault/export │
│  Folder: "Sheet2Vault Media"         │ │ /api/share/claim-token         │
└────────────────────┬─────────────────┘ └────────────────┬───────────────┘
                     │                                    │
                     └──────────────────┬─────────────────┘
                                        │
                                        ▼
                     ┌────────────────────────────────────┐
                     │ Google Sheets API v4 (CellGuard)   │
                     │ User-Owned Spreadsheet:            │
                     │  - VAULT_ITEMS                     │
                     │  - VAULT_SETTINGS                  │
                     │  - VAULT_CLAIMS                    │
                     └────────────────────────────────────┘
```

---

## 2. Target Files & Component Architecture

### 2.1 File Inventory

| File Path | Action | Responsibility |
|---|---|---|
| `src/app/vault/page.tsx` | Create | Vault main canvas (Responsive Mobile PWA & Desktop station) |
| `src/app/vault/claim/[token]/page.tsx` | Create | Tokenized read-only Adjuster Claim Dossier Portal |
| `src/app/api/vault/export/pdf/route.ts` | Create | Serverless PDF claim dossier renderer with photo plates |
| `src/app/api/vault/export/police/route.ts` | Create | Serverless high-contrast Police Stolen Goods Ledger export |
| `src/products/vault/setup/VaultSetupWizard.tsx` | Create | Step 2 `<VaultSetupPlugin />` for `/activate` pipeline |
| `src/products/vault/components/RoomSweepDrawer.tsx` | Create | Mobile-first 30-second progressive capture drawer |
| `src/products/vault/components/VaultHeroStrip.tsx` | Create | Monarch 4-tile metric strip (Total, Readiness, Sub-Limit alerts) |
| `src/products/vault/components/VaultItemLedger.tsx` | Create | Data-table with category/room filtering and missing evidence badges |
| `src/products/vault/components/ClaimDossierModal.tsx` | Create | Incident loss selector, preview, and dual-export generator |
| `src/products/vault/lib/vaultSchema.ts` | Create | TypeScript types, CellGuard column mappings, and default categories |
| `src/products/vault/lib/sublimitCalculator.ts` | Create | Logic for detecting when cataloged inventory exceeds policy sub-limits |
| `templates/sheet2vault_master_template.xlsx` | Create | Master spreadsheet template containing formulas and pre-formatted tabs |
| `src/proxy.ts` | Modify | Register `vault` subdomain mapping (`vault.sheet2suite.com`) |
| `docs/platform/architecture.md` | Modify | Update platform sub-product registry with Sheet2Vault |

### 2.2 Component Hierarchy Diff
```text
<VaultPageLayout>
├── <VaultHeaderCard>
│   ├── <EditorialMasthead />
│   └── <AmbientSyncIndicator />
├── <VaultHeroStrip />
│   ├── <MetricTile label="Total Replacement Value" />
│   ├── <MetricTile label="Claim Readiness Gauge" />
│   └── <MetricTile label="Policy Sub-Limit Warnings" />
├── <VaultFilterBar />
├── <VaultItemLedger />
│   ├── <VaultItemCard /> (Mobile)
│   └── <VaultTableRows /> (Desktop)
├── <MobileRoomSweepFAB />
│   └── <RoomSweepDrawer />
└── <ClaimDossierModal />
    ├── <IncidentDetailsForm />
    ├── <ItemSelectionList />
    └── <ExportActions (PDF & Adjuster Portal Link) />
```

---

## 3. Database & Spreadsheet Schema Diffs

### 3.1 Google Sheets Schema: `sheet2vault_master_template.xlsx`

#### Tab 1: `VAULT_ITEMS`
- **Col A:** `Item ID` (`VLT-0001`, auto-incremented)
- **Col B:** `Item Name` (e.g., "Sony A7 IV Mirrorless Camera")
- **Col C:** `Category` (Dropdown: Electronics, Jewelry, Power Tools, Musical Instruments, Sporting Goods, Appliances, Art & Collectibles, Home Furnishings, Other)
- **Col D:** `Room` (Dropdown populated dynamically from `VAULT_SETTINGS`)
- **Col E:** `Brand / Make` (e.g., "Sony")
- **Col F:** `Model Number` (e.g., "ILCE-7M4")
- **Col G:** `Serial Number` (e.g., "3049281")
- **Col H:** `Purchase Date` (`YYYY-MM-DD`)
- **Col I:** `Purchase Price` (Currency, `tnum`)
- **Col J:** `Est. Replacement Cost` (Currency, `tnum`)
- **Col K:** `Condition` (Mint, Good, Fair, Damaged)
- **Col L:** `Photo URL` (Google Drive webViewLink)
- **Col M:** `Serial Tag URL` (Google Drive webViewLink)
- **Col N:** `Receipt URL` (Google Drive webViewLink)
- **Col O:** `Claim Readiness` (Formula: `=IF(AND(LEN(G2)>0,LEN(L2)>0,LEN(N2)>0),1,IF(LEN(L2)>0,0.6,0.2))`)
- **Col P:** `Status` (Active, Stolen, Destroyed, Sold, Donated)
- **Col Q:** `Distinguishing Marks / Notes` (e.g., "Scratch on bottom plate, 35mm f/1.4 lens attached")

#### Tab 2: `VAULT_SETTINGS`
- `Property Nickname`: "Maple Street Residence"
- `Total Contents Coverage (Coverage C)`: `$100,000`
- `Policy Deductible`: `$1,000`
- `Jewelry Sub-Limit`: `$1,500`
- `Electronics Sub-Limit`: `$5,000`
- `Power Tools Sub-Limit`: `$2,500`
- `Musical Instruments Sub-Limit`: `$2,500`
- `Rooms List`: `["Living Room", "Master Bedroom", "Kitchen", "Home Office", "Garage", "Basement"]`

#### Tab 3: `VAULT_CLAIMS`
- `Claim ID`, `Incident Date`, `Incident Type` (Burglary, Fire, Water, Storm), `Police Report Number`, `Insurance Claim Number`, `Claimed Items Count`, `Total Claimed Value`, `Dossier URL`.

### 3.2 Cloud Firestore Schema Diff
- **Collection `workspaces/{spreadsheetId}`:**
  - Add product identifier: `product: "vault"`.
- **Collection `portals/{claimToken}`:**
  - `claimToken`: string (HMAC-SHA256 signature).
  - `spreadsheetId`: string.
  - `incidentType`: string.
  - `incidentDate`: string.
  - `itemIds`: string[].
  - `createdAt`: timestamp.
  - `expiresAt`: timestamp (default 90 days).

---

## 4. API Endpoints & Route Handlers

### 4.1 Specialized Endpoints
- **`POST /api/sync` (Existing Platform Sync Route):**
  - Synchronizes item mutations to `VAULT_ITEMS` using `CellGuard` to preserve readiness formulas.
- **`POST /api/vault/media/upload`:**
  - Uploads photo/receipt buffer to user's `Sheet2Vault Media` Drive folder using `drive.files.create`.
  - Returns direct Drive URL.
- **`POST /api/vault/export/pdf`:**
  - Renders a multi-page PDF packet: Cover page with incident summary, itemized loss table, and high-resolution photo plates.
- **`POST /api/vault/export/police`:**
  - Generates a PDF/printable page optimized for law enforcement, emphasizing serial numbers and item markings.
- **`POST /api/vault/claim/share`:**
  - Generates signed HMAC token for the Adjuster Portal `/vault/claim/[token]`.

---

## 5. Security & Authorization Analysis

- **Workspace Access Isolation:** All vault data operations authenticate through `verifyWorkspaceAccess(req, spreadsheetId)` preventing BOLA/IDOR vulnerabilities.
- **Narrowed OAuth Scopes:** Operates strictly with `https://www.googleapis.com/auth/drive.file` and `spreadsheets`. Does not possess access to user's broader Google Drive files.
- **Formula Injection Defense:** All string inputs (serial numbers, notes, brand names) pass through `CellGuard.sanitizeCellValue()` stripping `=, +, -, @` prefixes.
- **Adjuster Portal Token Security:** Public claim URLs are protected with HMAC-SHA256 signed tokens containing expiration timestamps.
