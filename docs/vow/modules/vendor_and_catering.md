# Sheet2Vow — Vendor & Catering Specification

**Primary Components:** `src/components/VendorManager.tsx`, `src/components/MenuSetupManager.tsx`, `src/app/share/[token]/page.tsx`  
**Google Sheet Tabs:** `VENDORS` (Vendor directory, Cols A–L), `CATERING` (Menu items & dishes, Cols A–H)

---

## 1. Vendor Directory (`VendorManager.tsx`)

The Vendor Directory centralizes professional service providers (photographers, caterers, florists, musicians, coordinators), contracts, payment deadlines, and cross-tab budget dependencies.

### 1.1 Automated Balance & Cross-Tab Budget Sync
- **Auto-Calculated Balance Owing:** Real-time formula `Math.max(0, Contract Value - Deposit Paid)` calculates outstanding commitments dynamically and presents a read-only field in the modal.
- **Cross-Tab Category Budget Sync:** Adding a vendor contract automatically verifies if a corresponding category exists in the `BUDGET` tab. If missing, it automatically creates the category with a planned target matching the contract value.
- **Deposit Paid Expense Logging:** Whenever `depositPaid > 0`, the system automatically logs a linked expense item (`EXP-V-${vendorId}`) into the `EXPENSES` tab under the vendor's category. Reducing the deposit to `$0` or deleting the vendor automatically reconciles or removes the linked expense.

### 1.2 Vendor Contract Document Storage (`[VND-6]`)
- **Direct Drive Uploads:** Add/Edit Vendor drawer includes an integrated PDF and document uploader.
- **Dedicated Folder Resolution:** Uploaded contract agreements are deposited directly into a `Contracts/` subfolder located inside the couple's active Google Drive workspace folder (`My Drive / Sheet2Suite / Sheet2Vow / Contracts`).
- **Security & Privacy Standards (`[SEC-VOW-1]`, `[SEC-VOW-3]`):**
  - Contract documents remain strictly private (zero public `anyoneWithLink` exposure).
  - 25MB maximum file size ceiling.
  - Allowed file whitelist: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`.
- **Link Persistence:** Google Drive file URL (`webViewLink`) is recorded in Column K: `Contract Link` of the `VENDORS` tab, allowing 1-click document viewing directly from the vendor card.

---

## 2. Catering & Menu Setup (`MenuSetupManager.tsx`)

The Catering module manages wedding meal courses, entree selections, and dietary requirements in direct coordination with the catering team.

### 2.1 Schema & Catalog Architecture
- Synchronizes with the `CATERING` spreadsheet tab.
- Generates sequential catalog dish IDs (`M101`, `M102`, `M103`...).
- Distinguishes selectable guest entrees (`isGuestChoice: true`) from fixed or shared courses (cocktail hour hors d'oeuvres, family-style sides, midnight snacks).

### 2.2 Relational Entree Analytics & Guest List Cross-Filtering
- **Live Entree Statistic Cards:** Displays live guest tally for each individual entree option directly below the main KPI summary bar.
- **Cross-Tab Deep Linking:** Clicking any entree stat card or card button routes the user directly to the **Guest List** tab with the `mealFilter` active for that dish.

### 2.3 Tokenized Read-Only Catering Share Portal (`/share/[token]`)
- Provides caterers and banquet captains with a mobile-optimized, real-time portal without requiring Google Workspace accounts.
- **Sanitized Headcount & Order Totals:** Displays aggregate headcount, exact guest counts for each dish (`Filet Mignon: 62`, `Pan-Seared Salmon: 48`, `Vegan Risotto: 14`), and expandable dietary drawers listing matching guest names and table assignments.
- Excludes confidential financial information, budgets, and private notes.
