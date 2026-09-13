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

### 🔔 Versioning, Notifications & App Lifecycle
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SYS-UPDATE-TOAST]`** | Persistent "New Version Available" Update Toast (Monarch-Style) — When a new production release is deployed, display a persistent, sticky toast notification pinned to the bottom-right corner notifying users that an update is ready. Does not auto-dismiss. Features an update icon, descriptive message, snooze/close option, and a 1-click **"Refresh App"** button (`window.location.reload()`). Powered by background version polling (`/api/version` or build metadata comparison on window visibility change / 10m interval) comparing the loaded client build timestamp/ID with the server. Mobile-responsive, floating cleanly above mobile navigation bars. | `src/components/AppUpdateToast.tsx`, `src/hooks/useAppVersionCheck.ts`, `src/app/api/version/route.ts`, `src/app/vow/page.tsx`, `src/lib/buildInfo.ts` | 🟢 Low to 🟡 Med | ⚡ Minimal (0 Google Sheets quota) | 📝 Backlog |

