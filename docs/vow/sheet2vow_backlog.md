# 💍 Sheet2Vow Pending Feature Backlog

Authoritative feature backlog tracking pending roadmap items, feature enhancements, and product requirements specific to **Sheet2Vow** (Wedding Planner Suite).

---

## 📋 Pending Sheet2Vow Features & Enhancements

### 🍽️ Guest Registry, Catering & Seating
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[GUEST-9]`** | Dual Table Assignment Columns — Split single `tableAssignment` field into **`Ceremony Seating`** and **`Reception Table`**. | `src/types/wedding.ts`, `src/lib/sheets/mapper.ts` | 🔴 High | ⚡ High (~3-4 turns) | ✅ Completed |
| **`[CATERING-1]`** | 2-Way Sync Catering Food Menu Items to Google Spreadsheet (`CATERING` Tab). | `src/components/MenuSetupManager.tsx`, `src/lib/sheets/dropdownValidator.ts`, `src/app/api/sync/route.ts`, `docs/vow/master_spreadsheet_schema.md` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[GUEST-BAR-EST]`** | Guest Drinker Status & Pay-Per-Drink Bar Cost Estimator — Add a "Drinker Status" column/field in Guest Registry (`Non-Drinker`, `Light Drinker`, `Heavy Drinker`). Calculate dynamic estimated alcohol/bar consumption costs based on drink pricing in the Catering page, and project total estimated bar expenses into the Budget & Expenses tracker. | `src/components/GuestListManager.tsx`, `src/components/MenuSetupManager.tsx`, `src/components/BudgetLedgerManager.tsx`, `src/types/wedding.ts` | 🟡 Medium | ⚡ Med (~2-3 turns) | 📝 Backlog |
| **`[CATERING-GUESTLIST-SHEET]`** | Dynamic Shareable Guest List Spreadsheet for Catering Vendor — Dynamically builds a dedicated caterer guest list spreadsheet/export containing: `#`, `First Name`, `Last Name`, `Age Category` (for kids vs adult menus), `Dietary Restrictions` (allergies/preferences), `Meal Choice`, and `Table Number`. Enforces table resolution rule: strictly maps internal IDs (`table-1788572224912`) to the couple's human-designated table names/numbers (e.g. `Table 1`, `Sweetheart Table`), excluding declined RSVPs. Integrated into Catering Manager and Vendor Share Portal. | `src/components/MenuSetupManager.tsx`, `src/app/share/[token]/page.tsx`, `src/app/api/share/[token]/route.ts`, `src/lib/sheets/mapper.ts`, `src/types/wedding.ts` | 🟡 Medium | ⚡ Med (~2-3 turns) | 📝 Backlog |

### 🖨️ Print Studio & Canva Exporter
> ⚠️ **Launch Status:** Sidelined / Disabled for Initial Launch — Not priority for launch and pending production readiness. All entry points across sidebar rail, mobile drawer, top header, and relational module toolbars have been hidden.

| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[PRINT-8]`** | Full Wedding Planner Binder Printout (combines all modules into bound book) | `PrintTemplatesModal.tsx` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[PRINT-10]`** | Responsive Mobile Print Studio layout redesign | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-13]`** | Batch Combined Binder Export or Individual Section PDF downloads | `PrintTemplatesModal.tsx` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[PRINT-15]`** | Dedicated Canva Bulk Create Hub Screen with Data Field Selector & Live Sample CSV Preview | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-16]`** | Print Studio Top Toolbar (Toggles: Hide Title/Date, Paper Size A4/Letter, Emoji Toggle, B&W/Color) | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[PRINT-17]`** | Dynamic QR Code Generator Engine for Photo Upload & Song Request Display Cards | `PrintTemplatesModal.tsx` | 🟡 Medium | ⚡ Med (~2 turns) | Pending |
| **`[PRINT-18]`** | High-Contrast "EXIT STUDIO" Header Action Button Styling | `PrintTemplatesModal.tsx` | 🟢 Low | ⚡ Low (~1 turn) | Pending |
| **`[PRINT-19]`** | Top Header Primary `[ 🖨️ PRINT PAGE ]` Action Button Placement | `PrintTemplatesModal.tsx` | 🟢 Low | ⚡ Low (~1 turn) | Pending |

### 📅 Calendar & Task Integration Sync
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SYS-8]`** | Google Calendar 1-Click Itinerary Sync Engine (`calendar.events` scope) | `TimelineManager.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[SYS-9]`** | Google Tasks 1-Click Kanban Checklist Sync Engine (`tasks` scope) | `KanbanBoard.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |
| **`[TASK-AUTO-SUGGEST]`** | Dynamic Task Category & Assignee Autocomplete Suggestions — In the Add/Edit Task modal, suggest existing task categories and assignees in combo dropdowns (`<datalist>`) while allowing users to type and save new custom values. | `src/components/KanbanBoard.tsx` | 🟢 Low | ⚡ Low (~1-2 turns) | ✅ Completed |

### 💼 Vendor Directory & Document Storage
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[VND-6]`** | Vendor Contract Upload & Google Drive "Contracts" Folder Storage (Upload vendor PDF/image contracts when adding or editing a vendor in `VendorManager.tsx`; automatically provisions a dedicated `Contracts` subfolder inside the couple's selected Google Drive workspace folder and links the contract Drive URL to the vendor entry) | `src/components/VendorManager.tsx`, `src/app/api/upload/contract/route.ts`, `src/types/wedding.ts` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |

### 🔗 Public Portals & Co-Planning
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SHARE-4]`** | Spouse & Partner Co-Planning Access (delegate Drive read/write permissions & free Google email notification with max 2 co-planner quota) | `src/components/AdvancedSettingsModal.tsx`, `src/app/api/share/partner/route.ts`, `src/types/licensing.ts` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |
| **`[PORTAL-SONG-REQUEST]`** | Guest Live DJ Song Request Portal & Admin Approval Queue — Guest reception QR song request submission portal (`/request-song/[token]`), pending song request alert banner, and admin approval/decline queue in `MusicManager.tsx`. *(Sidelined / Disabled for Initial Launch)* | `src/components/MusicManager.tsx`, `src/app/request-song/[token]/page.tsx`, `src/components/VendorShareLinkManager.tsx` | 🟡 Medium | ⚡ Med (~2-3 turns) | 📝 Backlog |
| **`[PORTAL-PHOTO-GUESTBOOK]`** | Live Photo & Video Guestbook Direct-to-Drive Upload Portal — Direct mobile guest uploads to couple's personal Google Drive folder (`/upload/[token]`), real-time submissions ledger, and guest wishes feed in `PhotoShotListManager.tsx`. *(Sidelined / Disabled for Initial Launch)* | `src/components/PhotoShotListManager.tsx`, `src/app/upload/[token]/page.tsx`, `src/components/VendorShareLinkManager.tsx` | 🔴 High | ⚡ High (~3-4 turns) | 📝 Backlog |
| **`[QR-CODE-GENERATOR]`** | Dynamic High-Res QR Code Generator Engine — In-app generation and instant PNG download of high-resolution QR codes for physical table cards, place cards, and reception displays. *(Sidelined / Disabled for Initial Launch)* | `src/components/PhotoShotListManager.tsx`, `src/components/MusicManager.tsx` | 🟢 Low | ⚡ Low (~1 turn) | 📝 Backlog |

### 💰 Financials, Budget & Expense Management
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[EXPENSE-PAID-BY]`** | Expense "Paid By" Contributor Tracking & Family Contribution Breakdown — Track who paid for each logged expense item (e.g. `Couple`, `In-Laws`, `Parents`, `Self`, `Partner`, or custom contributor name). Adds Column H: `Paid By` (`paidBy`: string) to the `EXPENSES` spreadsheet tab. Features an interactive combobox with quick contributor suggestion pills in the Add/Edit Expense modal, color-coded contributor badges on purchase ledger rows and mobile cards, and a dedicated "Paid By" filter and contribution breakdown summary (e.g. Couple: $X (Y%), In-Laws: $X (Y%), Parents: $X (Y%)) in the Financials ledger. | `src/components/BudgetLedgerManager.tsx`, `src/types/wedding.ts`, `src/lib/sheets/mapper.ts`, `src/app/api/sync/route.ts`, `docs/vow/master_spreadsheet_schema.md` | 🟡 Medium | ⚡ Med (~2-3 turns) | ✅ Completed |

### 🚀 Launch Readiness & Google Verification
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[LAUNCH-OAUTH-SCOPE]`** | OAuth Scope Minimization — Replaced restricted `drive` scope with non-sensitive `drive.file` and `spreadsheets` scopes for instant, free Google Cloud OAuth verification without third-party CASA audit. | `src/app/api/auth/google/route.ts`, `src/lib/sheets/client.ts` | 🟢 Low | ⚡ Minimal | ✅ Completed |
| **`[LAUNCH-AUTO-DRIVE-PATH]`** | Automated Fixed Google Drive Storage Path — Removed user-facing folder browsing and selection UI. Locked destination to `My Drive / Sheet2Suite / Sheet2Vow` with clean, informative status card. | `src/app/activate/page.tsx` | 🟢 Low | ⚡ Minimal | ✅ Completed |
| **`[LAUNCH-LEGAL-PAGES]`** | Public Legal Compliance Pages — Created Monarch-styled Privacy Policy (`/privacy`) and Terms of Service (`/terms`) with full Google API Services User Data Policy / Limited Use disclosures. Linked across Hub footer, activation portal, and in-app settings. | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/page.tsx`, `src/components/AdvancedSettingsModal.tsx` | 🟡 Medium | ⚡ None | ✅ Completed |
| **`[LAUNCH-COMING-SOON]`** | Multi-Product Roadmap Focus — Marked `Sheet2Build` and `Sheet2Finance` as disabled "Coming Soon" cards on the parent hub to focus commercial launch exclusively on Sheet2Vow. | `src/app/page.tsx` | 🟢 Low | ⚡ None | ✅ Completed |
| **`[LAUNCH-SETUP-FLOW-UX-REDESIGN]`** | Streamlined Setup Flow, Guided Onboarding Ergonomics & Live Provisioning Stepper — Added top-level 3-stage visual progress stepper, deduplicated partner names & celebration title generation, dynamic future wedding date default (~6 months out), animated 5-stage sequential provisioning checklist, auto-fill indicator, Etsy receipt helper, Google email discrepancy note, and mobile iOS Safari anti-zoom inputs. | `src/app/activate/page.tsx`, `src/products/vow/setup/VowSetupWizard.tsx`, `src/components/activate/StepOrderVerification.tsx` | 🔴 High | ⚡ None | ✅ Completed |

### 🔔 Versioning, Notifications & App Lifecycle
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SYS-UPDATE-TOAST]`** | Persistent "New Version Available" Update Toast (Monarch-Style) — When a new production release is deployed, display a persistent, sticky toast notification pinned to the bottom-right corner notifying users that an update is ready. Does not auto-dismiss. Features an update icon, descriptive message, snooze/close option, and a 1-click **"Refresh App"** button (`window.location.reload()`). Powered by background version polling (`/api/version` or build metadata comparison on window visibility change / 10m interval) comparing the loaded client build timestamp/ID with the server. Mobile-responsive, floating cleanly above mobile navigation bars. | `src/components/AppUpdateToast.tsx`, `src/hooks/useAppVersionCheck.ts`, `src/app/api/version/route.ts`, `src/app/vow/page.tsx`, `src/lib/buildInfo.ts` | 🟢 Low to 🟡 Med | ⚡ Minimal (0 Google Sheets quota) | ✅ Completed |

---

## 🔐 Sheet2Vow Security Vulnerabilities & Hardening Backlog

### 🛡️ Product Security Tasks
| Task ID | Severity | Vulnerability Summary | Target File(s) | Status |
|---|---|---|---|---|
| **`[SEC-VOW-1]`** | 🟠 **HIGH** | Vendor Contracts Automatically Set to Public (`anyoneWithLink: reader`) in Google Drive | `src/app/api/upload/contract/route.ts` | ✅ Resolved |
| **`[SEC-VOW-2]`** | 🟠 **HIGH** | Google Sheets Formula Injection (CSV / Formula Injection) via Public Guest Photo Uploads | `src/app/api/upload/[token]/route.ts` | ✅ Resolved |
| **`[SEC-VOW-3]`** | 🟡 **MEDIUM** | Unrestricted File Upload Types in Contract Uploader & Lack of File Size/DoS Guardrails | `src/app/api/upload/contract/route.ts`, `src/app/api/upload/[token]/route.ts` | ✅ Resolved |

#### Vulnerability Details & Remediation Specifications

- **`[SEC-VOW-1]` [HIGH] Vendor Contracts Automatically Set to Public (`anyoneWithLink: reader`) in Google Drive**:
  - **Summary**: In `upload/contract/route.ts` lines 114-124, after uploading a vendor contract to Google Drive, the endpoint calls `drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } })`.
  - **Risk**: Vendor contracts contain sensitive personal information (PII), signatures, bank/payment details, phone numbers, and pricing. Making them public allows anyone with the link to view and download them.
  - **Suggested Fix**: Remove the public permission creation call. Store contracts privately inside the user's `Contracts` subfolder in Google Drive, inheriting the user's private folder permissions.

- **`[SEC-VOW-2]` [HIGH] Google Sheets Formula Injection (CSV / Formula Injection) via Public Guest Photo Uploads**:
  - **Summary**: In `upload/[token]/route.ts` lines 380-435, guest photo submissions append `uploaderName` and `caption` directly to the `GUESTBOOK` sheet tab using `valueInputOption: 'USER_ENTERED'` without sanitization via `CellGuard`.
  - **Risk**: If a guest enters `=IMPORTXML(...)`, `=IMAGE(...)`, or `=WEBSERVICE(...)` in their name or caption, Google Sheets will execute it as an active formula when opened by the couple, potentially exfiltrating spreadsheet data or executing untrusted formulas.
  - **Suggested Fix**: Pass `rowValues` through `CellGuard.sanitizePayload()` before calling `sheets.spreadsheets.values.append()`.

- **`[SEC-VOW-3]` [MEDIUM] Unrestricted File Upload Types in Contract Uploader & Lack of File Size/DoS Guardrails**:
  - **Summary**: `upload/contract/route.ts` does not validate file extensions or MIME types (unlike `upload/[token]`), and neither route enforces a maximum file size or total payload limit before buffering files into Node memory (`file.arrayBuffer()`).
  - **Risk**: Attackers can upload unexpected file types (executables, scripts) or upload multiple multi-hundred-megabyte files to cause memory exhaustion / Denial of Service.
  - **Suggested Fix**: Restrict contract upload extensions to `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`. Enforce a maximum file size (e.g. 25MB) and limit total batch files.


