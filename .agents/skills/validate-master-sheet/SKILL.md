---
name: validate-master-sheet
description: Validates live Google Sheets master template against codebase schema contracts, reports missing or extra columns, and offers automated sheet or code repairs.
---

# Validate Master Sheet Skill

Use this skill whenever the user asks to validate, audit, or check the Master Google Spreadsheet template schema, or align the Google Sheet headers with the codebase data contracts.

## Workflow Steps

1. **Execute Schema Audit**:
   - Run the validation script in dry-run mode to inspect the live Master Spreadsheet without making changes:
     ```powershell
     npx tsx scripts/validateMasterSheet.ts --dry-run
     ```
   - Alternatively, audit a specific custom spreadsheet ID:
     ```powershell
     npx tsx scripts/validateMasterSheet.ts <SPREADSHEET_ID> --dry-run
     ```

2. **Analyze Audit Results**:
   - Inspect output for:
     - 🔴 **Missing Required Headers**: Column headers expected by `mapper.ts` & `HEADERS_MAP` but missing in the Google Sheet.
     - 🟡 **Extra Unmapped Headers**: Column headers present in the Google Sheet but not mapped in code.
     - ❌ **Missing Tabs**: Spreadsheet tabs missing from the Master template.

3. **Execute Selected Repair Action**:
   - **Option A: Auto-Repair Google Sheet (Add Missing Columns to Google Drive)**:
     ```powershell
     npx tsx scripts/validateMasterSheet.ts --fix-sheet
     ```
   - **Option B: Auto-Repair via Admin Web Dashboard**:
     - Direct user to `/admin` dashboard to click **`Run Schema Audit`** or **`🛠️ Auto-Repair Google Sheet`**.
   - **Option C: Align Code Mappers**:
     - If new columns in the Google Sheet should be supported by Sheet2Vow, update `GUEST_HEADERS`, `VENDOR_HEADERS`, etc. in `src/lib/sheets/mapper.ts` and `HEADERS_MAP` in `src/app/api/sync/route.ts`.
