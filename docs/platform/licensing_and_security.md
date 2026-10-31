# Sheet2Suite Licensing & Security Architecture

Sheet2Suite implements an autonomous licensing engine, strict multi-tenant workspace isolation, and zero-trust authorization to ensure user data sovereignty and protect private Google Spreadsheets.

---

## 1. Cloud Firestore Licensing & Workspace Schema

Sheet2Suite utilizes Cloud Firestore (`src/lib/db/firestoreDb.ts` and `src/lib/db/licensingDb.ts`) for entitlement tracking and active workspace records, persisting data reliably across serverless container scale-downs:

### 1.1 License Record Schema (`licenses` collection)
```typescript
export interface LicenseRecord {
  licenseKey: string;             // Unique license key / order receipt
  orderId: string;                // Etsy or Lemon Squeezy order ID
  purchaserEmail: string;         // Primary customer purchase email
  sku: string;                    // Purchased package SKU (e.g., 'VOW_PRO', 'BUNDLE_V1')
  status: 'active' | 'revoked' | 'refunded';
  licenseTier: 'standard' | 'pro'; // Standard (2 users) vs Pro (unlimited)
  maxWorkspaces: number;          // Default: 1 (or N for multi-property bundles)
  entitledProducts: string[];     // Array of allowed product keys, e.g. ['SHEET2VOW']
  createdAt: string;              // ISO 8601 creation timestamp
  updatedAt: string;              // ISO 8601 last update timestamp
}
```

### 1.2 Workspace Record Schema (`workspaces` collection)
```typescript
export interface WorkspaceRecord {
  spreadsheetId: string;          // Google Spreadsheet ID (Primary Key)
  spreadsheetName: string;        // Name of celebration/project workspace
  userEmail: string;              // Primary Workspace Owner Google Email
  partnerEmail?: string;          // Secondary Partner / Co-Planner Google Email
  coPlanners?: string[];          // Additional authorized collaborator emails (Pro tier)
  orderId: string;                // Linked order identifier
  orderVerified: boolean;         // Order verification status
  driveFolderPath?: string;       // Resolved Google Drive destination folder path
  webViewLink?: string;           // Direct web view URL in Google Drive
  productName: string;            // Product key (e.g., 'SHEET2VOW')
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Licensing Tier Hierarchy & 2-User Collaboration Enforcement

### 2.1 Standard Tier vs. Pro Tier
- **Standard Tier (Default):**
  - Entitles 1 active workspace per license.
  - **2-User Maximum Limit:** Strictly limits collaboration to **2 total accounts** (1 Primary Owner + 1 Secondary Partner / Co-Planner).
  - Configured via constant: `MAX_SECONDARY_USERS = 1`.
- **Pro Tier:**
  - Entitles 1 workspace with **unlimited co-planners**, wedding coordinators, bridal party members, and event planners.
  - Priority synchronization and Pro badging.
  - Granted via `PRO` order keywords in receipt lookup or pre-registered Cloud Firestore records.

### 2.2 Quota Enforcement Logic (`/api/share/partner`)
1. When a user invites a secondary partner or coordinator, `/api/share/partner` queries `LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId)` and loads the linked `LicenseRecord`.
2. If `licenseTier === 'standard'` and a secondary user is already registered, attempting to invite a 3rd collaborator triggers:
   ```json
   {
     "success": false,
     "requiresPro": true,
     "message": "Standard workspaces support up to 2 users (Primary + Partner). Upgrade to Pro for unlimited co-planners."
   }
   ```
3. The client receives `requiresPro: true` and presents the interactive `ProUpgradeModal.tsx` detailing Pro collaboration advantages.

### 2.3 Drive Permission Reconciliation & Self-Healing
To prevent out-of-sync state when permissions are modified directly in Google Drive:
- During workspace hydration, the server executes Google Drive `permissions.list`.
- Auto-detects existing partner emails holding `writer` permissions on the spreadsheet file and updates the Firestore `WorkspaceRecord`.

---

## 3. Minimized Google OAuth Scopes & Data Sovereignty

- **Restricted Scopes:**
  - `https://www.googleapis.com/auth/drive.file`: Permits access strictly to files created by Sheet2Suite or explicitly selected by the user via the native Google Picker. Zero access to the user's broader Google Drive contents.
  - `https://www.googleapis.com/auth/spreadsheets`: Allows reading and writing spreadsheet tab data.
- **CASA Compliance Exemption:** Minimized scopes eliminate Google Cloud CASA (Cloud Application Security Assessment) Tier 2 audit friction, guaranteeing rapid approval and zero privacy intrusion.
- **Zero Data Lock-In:** All master operational records reside directly inside user-owned Google Spreadsheets. If Sheet2Suite is disconnected, all user data remains 100% accessible via Google Sheets.

---

## 4. Cross-User Authorization & Security Defenses

### 4.1 Broken Object Level Authorization (BOLA / IDOR) Defense
- **Workspace Access Verification (`src/lib/auth/workspaceAuth.ts`):**
  - All spreadsheet data access routes (`GET /api/sync`, `POST /api/sync`), session checks (`/api/auth/session`), collaborator mutations (`/api/share/partner`), and Drive endpoints (`/api/drive/*`) invoke `verifyWorkspaceAccess`.
  - Authenticated caller identity (verified via HTTP-only session cookie or Google bearer token) is matched against the workspace's `userEmail`, `partnerEmail`, or `coPlanners` array in Cloud Firestore.
  - Cross-user or unauthenticated access attempts are rejected with `401 Unauthorized` or `403 Forbidden`.
- **Zero Unauthenticated Token Substitution (`src/lib/sheets/client.ts`):**
  - Stored refresh token lookups by `spreadsheetId` are strictly forbidden for unauthenticated callers.
  - Stored token fallback is only permitted under verified server delegation (`allowStoredFallback: true`), such as cryptographically signed vendor share tokens.

### 4.2 OAuth Origin Validation & Login CSRF Hardening
- **Origin Validation (`[SEC-2]`):** Popup authentication messaging (`postMessage`) strictly validates receiver origins against authorized Sheet2Suite domains, preventing rogue window openers from intercepting OAuth access tokens.
- **Cryptographic State Nonce (`[SEC-7]`):** Binds a 32-byte unpredictable random nonce in a secure HTTP-only cookie (`s2s_oauth_nonce`). The callback endpoint validates this nonce using `crypto.timingSafeEqual`, preventing OAuth login CSRF attacks.

### 4.3 Monarch Admin Operations & Zero-Trust Access (`[SEC-1]`)
- **Admin Authentication Gateway (`src/lib/auth/adminAuth.ts`):** Admin endpoints (`/api/admin/db`, `/api/admin/validate-schema`) require timing-safe validation of `ADMIN_SECRET_KEY`.
- **Admin Lock Screen (`src/app/admin/page.tsx`):** Unauthenticated visitors cannot inspect database records, customer emails, or execute mutations. Sessions are governed by 7-day secure HttpOnly cookies (`s2s_admin_key`).
