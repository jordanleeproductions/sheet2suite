# Sheet2Suite Activation Pipeline

The Sheet2Suite Activation Engine (`activate.sheet2suite.com` / `src/app/activate/page.tsx`) is a generic, reusable suite orchestrator that verifies licenses, authenticates Google accounts, resolves Drive storage destinations, dynamically mounts product-specific setup wizards, and provisions Google Spreadsheets for any Sheet2Suite digital canvas product.

---

## 1. End-to-End Activation Sequence

```
┌────────────────────────────────────────────────────────────────────────┐
│ Step 0: Order Verification (StepOrderVerification.tsx)                 │
│ - Accepts orderId, email, and target productCode                       │
│ - Etsy receipt number helper & URL parameter auto-filling              │
│ - Validates license entitlement against Cloud Firestore                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 1: Google OAuth & Automated Drive Path (StepPackageHub.tsx)       │
│ - Connects user Google Account with minimized drive.file scopes        │
│ - Enforces OAuth CSRF state nonce (s2s_oauth_nonce)                   │
│ - Sets 90-day HTTP-only refresh token cookie (s2s_refresh_token)       │
│ - Auto-resolves locked folder: My Drive / Sheet2Suite / <Product>      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 2: Pluggable Product Setup (<ProductSetupPluginRenderer />)       │
│ - Dynamically mounts product onboarding wizard (<ProductSetupPlugin>) │
│ - 💍 Sheet2Vow: <VowSetupWizard /> (Couple names, wedding date, etc.)  │
│ - 🏗️ Sheet2Build: <BuildSetupWizard /> (Project title, milestones)     │
│ - 💰 Sheet2Finance: <FinanceSetupWizard /> (Fiscal year, accounts)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Step 3: Automated Provisioning & Launch (/api/provision)               │
│ - Animated 5-stage live sequential provisioning stepper                │
│ - Streams master binary XLSX via drive.files.create under drive.file   │
│ - Preserves dropdown validation rules linking to Settings tab          │
│ - Injects initial configuration metadata into Settings!Z1 & DASHBOARD  │
│ - Registers workspace in Cloud Firestore & launches digital canvas     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Order Verification Engine (Step 0)

- **Input Parameters:** Order identifier (`orderId`), customer email (`email`), and target product key (`productCode`).
- **Etsy & Marketplace Integration:**
  - Automatically parses `orderId`, `order`, or `license` query parameters directly from Etsy or Lemon Squeezy download links.
  - Surfaces a visual `⚡ AUTO-FILLED` badge when credentials are pre-populated.
  - Provides inline helper text and diagrams assisting customers in finding 10-digit numeric Etsy order receipt numbers.
- **Google Account Mismatch Reassurance:** Explicitly clarifies that the customer's Google account email does not need to match their purchase receipt email, eliminating activation hesitation.
- **Entitlement Lookup:** Queries `LocalLicensingDb.getLicenseByKeyAsync()` backed by Cloud Firestore. Resolves the license tier (`Standard` vs `Pro`) and entitled product keys.

---

## 3. Google OAuth & Drive Folder Resolution (Step 1)

- **Scope Minimization:**
  - Requests strictly non-sensitive, narrowed Google OAuth scopes:
    - `https://www.googleapis.com/auth/drive.file` (access strictly restricted to files created or opened by Sheet2Suite)
    - `https://www.googleapis.com/auth/spreadsheets`
  - Completely avoids broad root `drive` scopes, eliminating Google Cloud CASA Tier-2 compliance overhead.
- **State Nonce CSRF Protection (`src/lib/auth/oauthCsrf.ts`):**
  - Generates a 32-byte cryptographic random nonce bound to an HTTP-only, `SameSite=Lax`, `Secure` cookie (`s2s_oauth_nonce`).
  - Callback verifies the state nonce using `crypto.timingSafeEqual` before issuing tokens.
- **Session Durability & Refresh Tokens:**
  - Enforces `prompt=consent` and `access_type=offline` ensuring Google returns a persistent `refresh_token`.
  - Persists refresh token in a 90-day secure HTTP-only cookie (`s2s_refresh_token`) and synchronizes with Cloud Firestore.
- **Automated Locked Storage Destination:**
  - Completely removes manual directory pickers from onboarding to avoid user configuration friction.
  - Automatically locks the provisioning target to `My Drive / Sheet2Suite / <Product>` (e.g., `My Drive / Sheet2Suite / Sheet2Vow`).
  - Checks if the folder exists via Google Drive API; automatically creates parent and child folders if missing.
  - Displays a high-contrast data sovereignty badge reassuring users that all data resides 100% within their personal Google Drive.

---

## 4. Pluggable `<ProductSetupPlugin />` Contract (Step 2)

Products provide an encapsulated setup wizard implementing the standard contract defined in `src/lib/core/activation/pluginTypes.ts`:

```typescript
export interface ProductSetupPluginProps<TConfig = any> {
  productCode: string;
  initialData?: Partial<TConfig>;
  onComplete: (productConfig: TConfig) => void;
  onBack: () => void;
  theme?: 'light' | 'dark';
}
```

- **Contract Invariants:**
  - The activation host handles container layout, stepper headers, and Google authentication.
  - The plugin renders domain-specific onboarding questions (e.g., Couple Names, Wedding Date, Pre-Built Task Presets, and Target Budget for Sheet2Vow).
  - Once user inputs are validated, calling `onComplete(productConfig)` transitions the host pipeline into the provisioning stepper.

---

## 5. Automated Spreadsheet Provisioning Engine (`/api/provision`)

Spreadsheet creation executes server-side via `/api/provision`:

### 5.1 Live Binary Template Duplication (`masterTemplateExporter.ts`)
1. Fetches binary `.xlsx` export buffer of the official Master Google Sheet template (`drive.files.export`).
2. Streams the XLSX binary directly into the user's resolved destination folder via `drive.files.create({ mimeType: 'application/vnd.google-apps.spreadsheet' })`.
3. Bypasses cross-tenant Google Drive API permission restrictions under `drive.file` while preserving formulas, tab formatting, and layout structure.
4. Falls back to an in-memory XLSX builder (`generateMasterXlsxBuffer`) if network export is unreachable.

### 5.2 Automated Dropdown Validation Engine (`dropdownValidator.ts`)
- Automatically iterates over sheet tabs and applies `setDataValidation` requests with `type: 'ONE_OF_RANGE'`, linking columns to lookup ranges on the `'Settings'` tab (e.g. `=Settings!$A$2:$A$50`).
- Isolates system configuration metadata into cell `Settings!Z1`, protecting visible dropdown lookup columns (A–M) from being corrupted.

### 5.3 Live Sequential Provisioning Stepper
During the 4–8 second setup phase, the UI renders an animated 5-stage sequential checklist replacing static spinners:
1. *Verifying Google Drive account & permissions*
2. *Duplicating master template into Sheet2Suite folder*
3. *Initializing financial budget, guest lists & settings*
4. *Registering secure multi-device workspace session*
5. *Workspace ready! Launching your planning canvas*

### 5.4 Post-Provision Metadata & Workspace Launch
- Writes customized celebration/project metadata into `Settings!Z1` and `DASHBOARD!B2`.
- Records active workspace in Cloud Firestore via `LocalLicensingDb.saveWorkspaceAsync()`.
- Seamlessly redirects user to the live canvas at `{product}.sheet2suite.com` or `/{product}`.
- Provides an explicit diagnostic error card and 1-click `[ 🔄 RETRY PROVISIONING SPREADSHEET ]` action in the event of transient network failure.
