# Sheet2Vow - Master Google Spreadsheet Schema Reference

This document defines the authoritative tab structure and column header contracts matching the live **Wedding Planner Template Google Sheet**.

---

## 📊 Complete Sheet Architecture Overview (15 Tabs)

| Tab Name | Sheet Table Name | Key Purpose | Status |
|---|---|---|---|
| **`INFO`** | Getting Started | Master template index & instructions | ✏️ Documentation |
| **`DASHBOARD`** | Overview Cards | Summary KPI meters & charts | 🔒 Read-Only |
| **`GUESTS`** | GuestList | Guest registry, RSVPs, dietary needs & seating | ✏️ Active |
| **`TABLES`** | Table Assignments | Floorplan table shapes & seating capacity | ✏️ Active |
| **`VENDORS`** | Vendors | Vendor directory, contacts & payment tracking | ✏️ Active |
| **`BUDGET`** | Budget Ledger | Estimated vs. actual costs & payment status | ✏️ Active |
| **`EXPENSES`** | Expenses | Logged purchases & itemized outlays by category | ✏️ Active |
| **`SCHEDULE`** | Day of Schedule | Day-of itinerary timeline & responsibilities | ✏️ Active |
| **`MUSIC`** | Music | Playlist tracks, occasions & priorities | ✏️ Active |
| **`PHOTOS`** | Photography Shot List | Shot list requirements, timing & status | ✏️ Active |
| **`TO DO`** | To Do List | Task checklist, categories, due dates & status | ✏️ Active |
| **`GIFT REGISTRY`** | Gift Registry | Gifts received, amounts & thank-you cards | ✏️ Active |
| **`DECOR INVENTORY`**| Decor Inventory | Venue decor, packing checklist & cleanup | ✏️ Active |
| **`Calc_Data`** | System Lookup | System metric lookup table for formulas | 🔒 Internal |
| **`SETTINGS`** | Config & Dropdowns | Master Settings table & enum dropdown lists | 🔒 System Config |

---

## 📑 Tab 1: `GUESTS`
**Sheet Table Name**: `GuestList`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Guest ID` | `guestId` | Text (Primary Key) | e.g. `G1`, `G2` |
| `First Name` | `firstName` | Text | Guest first name |
| `Last Name` | `lastName` | Text | Guest last name |
| `Guest Age Category` | `ageCategory` | Dropdown | `Adult`, `Child`, `Infant` |
| `Ceremony Seating` | `ceremonySeating` | Text / Dropdown | Row & side assignment in ceremony aisle planner (e.g. `Row 3 - Bride Side`). Separate from reception table. |
| `Reception Table` | `tableAssignment` | Dropdown | Assigned reception dinner table name / ID (e.g. `Table 1 - Head Table`). Linked to `TABLES` tab. |
| `Plus-One?` | `hasPlusOne` | Checkbox | `TRUE`, `FALSE` |
| `Plus-One Name` | `plusOneName` | Text | Name of guest's plus-one |
| `RSVP Status` | `rsvpStatus` | Dropdown | `Attending`, `Declined`, `Pending` |
| `Dietary Restrictions` | `dietaryRestrictions` | Text | e.g. `Vegetarian`, `Nut Allergy`, `None` |
| `Meal Choice` | `mealChoice` | Text / Dropdown | e.g. `Filet Mignon`, `Pan-Seared Salmon`, `Vegan Risotto` |
| `Notes` | `notes` | Text | Additional guest notes |

> **Schema Change Notice (`[GUEST-9]`):** The legacy single `Table Number` column has been split into two separate columns: `Ceremony Seating` and `Reception Table`. This prevents the ceremony aisle planner from overwriting the reception dinner table assignment and vice-versa. Both the XLSX master template and the Google Sheets provisioning API must be updated to reflect this two-column layout.

---

## 🪑 Tab 2: `TABLES`
**Sheet Table Name**: `Table Assignments`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Table ID` | `tableId` | Text (Primary Key) | e.g. `table-1`, `sweetheart` |
| `Table Name` | `tableName` | Text | Display name (e.g. `Table 1`, `Sweetheart Table`) |
| `Table Shape` | `shape` | Dropdown | `Circle`, `Rectangle`, `Sweetheart` |
| `Max Seats` | `capacity` | Integer | Total seat capacity (e.g. `2`, `8`, `10`) |
| `Assigned Seats` | `assignedCount` | Formula / Calculated | Calculated count of seated guests |
| `Notes` | `notes` | Text | Table location or notes |

---

## 🤝 Tab 3: `VENDORS`
**Sheet Table Name**: `Vendors`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Vendor ID` | `vendorId` | Text (Primary Key) | e.g. `V1`, `V2` |
| `Vendor Name` | `vendorName` | Text | Vendor business name |
| `Category` | `category` | Dropdown | `Venue & Catering`, `DJ & MC`, `Florals`, etc. |
| `Contact Person` | `contactName` | Text | Contact name |
| `Email` | `email` | Text (Email) | Contact email address |
| `Phone` | `phone` | Text (Phone) | Contact phone number |
| `Total Cost` | `totalContractValue` | Currency ($) | Total contract value |
| `Paid Amount` | `depositPaid` | Currency ($) | Amount paid to date |
| `Remaining Balance` | `balanceOwing` | Formula ($) | Calculated remaining balance |
| `Notes` | `notes` | Text | Contract or service details |

---

## 💵 Tab 4: `BUDGET`
**Sheet Table Name**: `Budget Ledger`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Item ID` | `itemId` | Text (Primary Key) | e.g. `B1`, `B2` |
| `Category` | `category` | Dropdown | Budget category |
| `Vendor Name` | `vendorName` | Text | Line item / vendor name |
| `Estimated Cost` | `estimatedCost` | Currency ($) | Initial estimated cost cap |
| `Actual Cost` | `actualCost` | Currency ($) | Final actual cost |
| `Amount Paid` | `amountPaid` | Currency ($) | Amount paid to date |
| `Due Date` | `dueDate` | Date | Payment due date |
| `Payment Status` | `paymentStatus` | Dropdown | `Paid`, `Pending`, `Overdue` |

---

## 💳 Tab 4b: `EXPENSES`
**Sheet Table Name**: `Expenses`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Item ID` | `itemId` | Text (Primary Key, Hidden in UI) | e.g. `EXP1`, `EXP2` |
| `Description` | `description` | Text | Purchase / item description |
| `Category` | `category` | Dropdown | Expense category (linked to `=SETTINGS!$K$2:$K$50`) |
| `Amount` | `amount` | Currency ($) | Purchase amount |
| `Purchase Date` | `purchaseDate` | Date | Date of purchase |
| `Notes` | `notes` | Text | Payment method or receipt details |

---

## ⏰ Tab 5: `SCHEDULE`
**Sheet Table Name**: `Day of Schedule`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Time` | `startTime` | Time Text | Moment time (e.g. `08:00 AM`, `04:30 PM`) |
| `Event Name` | `eventMoment` | Text | Moment name (e.g. `Ceremony Processional`) |
| `Location` | `location` | Text | Event venue location |
| `Responsible Party` | `responsibility` | Text | Responsible vendor or group |
| `Notes` | `notes` | Text | Special cues or guidelines |

---

## 🎵 Tab 6: `MUSIC`
**Sheet Table Name**: `Music`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Song ID` | `songId` | Text (Primary Key) | e.g. `M1`, `M2` |
| `Song Title` | `title` | Text | Song title |
| `Artist` | `artist` | Text | Artist / Band name |
| `Occasion` | `listType` | Dropdown / Text | `Ceremony`, `Reception`, `First Dance`, `Special Moment`, `Requested Song`, `Banned` |
| `Play Status` | `playStatus` | Dropdown | `Must Play`, `Play If Time`, `Banned` |
| `Notes` | `notes` | Text | Special notes or guest dedication messages |
| `Requested By` | `requestedBy` | Text | Name of guest who requested the song |
| `Approval Status` | `approvalStatus` | Dropdown | `Approved`, `Pending Approval`, `Banned`, `Declined` |

---

## 📷 Tab 7: `PHOTOS`
**Sheet Table Name**: `Photography Shot List`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Shot ID` | `shotId` | Text (Primary Key) | e.g. `P1`, `P2` |
| `Description` | `description` | Text | Shot description / people included |
| `Location` | `location` | Text | Photo location |
| `Estimated Time` | `shotTime` | Text | Scheduled photo time |
| `Included People` | `people` | Text | Names of people required |
| `Status` | `status` | Dropdown | `Pending`, `Captured` |
| `Notes` | `notes` | Text | Lighting or composition notes |

---

## 📋 Tab 8: `TO DO`
**Sheet Table Name**: `To Do List`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Task ID` | `taskId` | Text (Primary Key) | e.g. `T1`, `T2` |
| `Task Description` | `taskName` | Text | Task name / description |
| `Category` | `category` | Dropdown | Task category |
| `Due Date` | `dueDate` | Date | Target completion date |
| `Status` | `kanbanStage` | Dropdown | `To Do`, `In Progress`, `Done` |
| `Assigned To` | `assignedTo` | Text | Person responsible |
| `Notes` | `notes` | Text | Links or sub-checklist |

---

## 🎁 Tab 9: `GIFT REGISTRY`
**Sheet Table Name**: `Gift Registry`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Gift ID` | `giftId` | Text (Primary Key) | e.g. `GF1`, `GF2` |
| `Guest / Party Name` | `guestName` | Text | Guest or family name |
| `Gift Description` | `giftDescription` | Text | Physical item description |
| `Gift Type` | `giftType` | Dropdown | `Physical Item`, `Cash`, `Gift Card`, `Honeymoon Fund` |
| `Amount` | `amount` | Currency ($) | Monetary value |
| `Received Date` | `receivedDate` | Date | Date gift received |
| `Thank You Sent` | `thankYouSent` | Checkbox | `TRUE`, `FALSE` |
| `Sent Date` | `sentDate` | Date | Date thank-you card sent |
| `Notes` | `notes` | Text | Additional gift notes |

---

## 📦 Tab 10: `DECOR INVENTORY`
**Sheet Table Name**: `Decor Inventory`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Item ID` | `itemId` | Text (Primary Key) | e.g. `DEC1`, `DEC2` |
| `Item Name` | `itemName` | Text | Decor item name |
| `Category` | `category` | Dropdown | `Ceremony`, `Reception`, `Signage`, etc. |
| `Owner / Brought By` | `owner` | Text | Person bringing item |
| `Packed` | `packed` | Checkbox | `TRUE`, `FALSE` |
| `Return Home Required` | `returnHome` | Checkbox | `TRUE`, `FALSE` |
| `Cleanup Person` | `cleanupPerson` | Text | Person responsible for cleanup |

---

## 🍽️ Tab 11: `CATERING` *(Food & Beverage Menu Items)*

| Column Header | JSON Key | Data Type | Notes / Description |
| :--- | :--- | :--- | :--- |
| `Item ID` | `id` | Text | Unique menu item ID (e.g. `M101`) |
| `Course Category` | `category` | Dropdown (`=SETTINGS!$P$2:$P$50`) | `Entree`, `Appetizer`, `Dessert`, `Late Night Snack`, `Beverage` |
| `Item Name` | `name` | Text | Menu item name displayed on RSVP meal choices |
| `Description` | `description` | Text | Ingredients, preparation, and presentation description |
| `Is Guest Choice` | `isGuestChoice` | Checkbox | `TRUE` if selectable by guests on RSVP; `FALSE` for set courses |
| `Vegetarian` | `isVegetarian` | Checkbox | `TRUE`, `FALSE` |
| `Vegan` | `isVegan` | Checkbox | `TRUE`, `FALSE` |
| `Gluten-Free` | `isGlutenFree` | Checkbox | `TRUE`, `FALSE` |
| `Nut-Free` | `isNutFree` | Checkbox | `TRUE`, `FALSE` |

---

## ⚙️ Tab 12: `SETTINGS` *(Config & System Metadata)*
Contains two primary sections:
1. **Settings Table (`A1:B6`)**:
   - `A1`: `Name` | `B1`: `Value`
   - `A2`: `Wedding Name` | `B2`: `weddingName` string value (e.g. `Alex & Sam's Wedding`)
   - `A3`: `Wedding Budget` | `B3`: `budget` numeric value (e.g. `35000`)
   - `A4`: `Wedding Date` | `B4`: `weddingDate` ISO string value (e.g. `2026-09-20`)
   - `A5`: `Location Details` | `B5`: `location` string value (e.g. `Grand Ballroom, Toronto ON`)
   - `A6`: `Currency` | `B6`: `currency` code string value (e.g. `USD`, `CAD`, `GBP`, `EUR`)
2. **Master Dropdown Lookup Lists (`Columns C to P`)**:
   - `C`: Guest Age Category | `D`: Table Shapes | `E`: Priority Levels
   - `F`: RSVP Status | `G`: Payment Status | `H`: Task Status / Kanban Stage
   - `I`: Decor Category | `J`: Vendor Category | `K`: Budget Category
   - `L`: Task Category | `M`: Gift Type | `N`: Approval Status | `O`: Play Status
   - `P`: Course Category (`Entree`, `Appetizer`, `Dessert`, `Late Night Snack`, `Beverage`)

---

## 📊 Tab 13: `DASHBOARD` *(User Visual Overview)*
Pure human-readable visual dashboard containing aggregate summary KPI cards (`Total Invited`, `Accepted`, `Declined`, `Pending`, `Total Estimated Budget`, `Actual Budget`, `Amount Paid`, `Tasks To Do`, `Tasks Completed`) and visual charts (`Guest RSVP Breakdown`, `Estimated vs Actual Budget`).

---

## ⚙️ Tab 14: `Calc_Data` *(System Internal)*
Metric lookup table (`Metric Category`, `Metric Name`, `Value`) calculated from `GUESTS`, `BUDGET`, and `TO DO` sheets for dashboard widgets.

---

## 🚀 Future Roadmap Additions (Planned)

The following tabs are reserved for future product releases:
- **`ACCOMMODATIONS`**: Hotel room blocks, booking codes, and cutoff dates.
- **`DAY_OF_CONTACTS`**: Emergency phone roster for wedding coordinators and vendors.
- **`RSVP_LOG`**: Raw web form submissions log for public guest RSVP link.
