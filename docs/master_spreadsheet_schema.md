# Sheet2Vow - Master Google Spreadsheet Schema Reference

This document defines the authoritative tab structure and column header contracts matching the live **Wedding Planner Template Google Sheet**.

---

## 📊 Complete Sheet Architecture Overview (14 Tabs)

| Tab Name | Sheet Table Name | Key Purpose | Status |
|---|---|---|---|
| **`INFO`** | Getting Started | Master template index & instructions | ✏️ Documentation |
| **`DASHBOARD`** | Overview Cards | Summary KPI meters & charts | 🔒 Read-Only |
| **`GUESTS`** | GuestList | Guest registry, RSVPs, dietary needs & seating | ✏️ Active |
| **`TABLES`** | Table Assignments | Floorplan table shapes & seating capacity | ✏️ Active |
| **`VENDORS`** | Vendors | Vendor directory, contacts & payment tracking | ✏️ Active |
| **`BUDGET`** | Budget Ledger | Estimated vs. actual costs & payment status | ✏️ Active |
| **`SCHEDULE`** | Day of Schedule | Day-of itinerary timeline & responsibilities | ✏️ Active |
| **`MUSIC`** | Music | Playlist tracks, occasions & priorities | ✏️ Active |
| **`PHOTOS`** | Photography Shot List | Shot list requirements, timing & status | ✏️ Active |
| **`TO DO`** | To Do List | Task checklist, categories, due dates & status | ✏️ Active |
| **`GIFT REGISTRY`** | Gift Registry | Gifts received, amounts & thank-you cards | ✏️ Active |
| **`DECOR INVENTORY`**| Decor Inventory | Venue decor, packing checklist & cleanup | ✏️ Active |
| **`Calc_Data`** | System Lookup | System metric lookup table for formulas | 🔒 Internal |
| **`Settings`** | Config Dropdowns | Master enum dropdown validation lists | 🔒 System Config |

---

## 📑 Tab 1: `GUESTS`
**Sheet Table Name**: `GuestList`

| Column Header Name | Developer Key | Format / Input Type | Description / Notes |
|---|---|---|---|
| `Guest ID` | `guestId` | Text (Primary Key) | e.g. `G1`, `G2` |
| `First Name` | `firstName` | Text | Guest first name |
| `Last Name` | `lastName` | Text | Guest last name |
| `Guest Age Category` | `ageCategory` | Dropdown | `Adult`, `Child`, `Infant` |
| `Table Number` | `tableAssignment` | Dropdown | Assigned table name / ID |
| `Plus-One?` | `hasPlusOne` | Checkbox | `TRUE`, `FALSE` |
| `Plus-One Name` | `plusOneName` | Text | Name of guest's plus-one |
| `RSVP Status` | `rsvpStatus` | Dropdown | `Attending`, `Declined`, `Pending` |
| `Dietary Restrictions` | `dietaryRestrictions` | Text | e.g. `Vegetarian`, `Nut Allergy`, `None` |
| `Meal Choice` | `mealChoice` | Text / Dropdown | e.g. `Filet Mignon`, `Pan-Seared Salmon`, `Vegan Risotto` |
| `Notes` | `notes` | Text | Additional guest notes |

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
| `Expense ID` | `itemId` | Text (Primary Key) | e.g. `B1`, `B2` |
| `Item Name` | `vendorName` | Text | Expense / vendor line item name |
| `Category` | `category` | Dropdown | Budget category |
| `Estimated Cost` | `estimatedCost` | Currency ($) | Initial estimated cost |
| `Actual Cost` | `actualCost` | Currency ($) | Final actual cost |
| `Amount Paid` | `amountPaid` | Currency ($) | Amount paid to date |
| `Payment Status` | `paymentStatus` | Dropdown | `Paid`, `Pending`, `Overdue` |
| `Notes` | `notes` | Text | Due date or payment notes |

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
| `ID` | `songId` | Text (Primary Key) | e.g. `M1`, `M2` |
| `Song Title` | `title` | Text | Song title |
| `Artist` | `artist` | Text | Artist / Band name |
| `Occasion` | `listType` | Dropdown / Text | `Ceremony`, `Reception`, `First Dance` |
| `Priority` | `priority` | Dropdown | `Must Play`, `Play If Time`, `Banned` |
| `Played?` | `played` | Checkbox | `TRUE`, `FALSE` |
| `Notes` | `notes` | Text | Special notes or requests |

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

## ⚙️ Tab 11: `Settings` *(Config & System Metadata)*
Contains master validation dropdown lists as well as application configuration JSON in cell **`B2`** (`budget`, `weddingName`, `weddingDate`, `shareVersion`). Keeping configuration JSON in the `Settings` tab preserves the `DASHBOARD` tab purely as a human-friendly visual overview for couples opening their spreadsheet.

---

## 📊 Tab 12: `DASHBOARD` *(User Visual Overview)*
Pure human-readable visual dashboard containing aggregate summary KPI cards (`Total Invited`, `Accepted`, `Declined`, `Pending`, `Total Estimated Budget`, `Actual Budget`, `Amount Paid`, `Tasks To Do`, `Tasks Completed`) and visual charts (`Guest RSVP Breakdown`, `Estimated vs Actual Budget`).

---

## ⚙️ Tab 13: `Calc_Data` *(System Internal)*
Metric lookup table (`Metric Category`, `Metric Name`, `Value`) calculated from `GUESTS`, `BUDGET`, and `TO DO` sheets for dashboard widgets.

---

## 🚀 Future Roadmap Additions (Planned)

The following tabs are reserved for future product releases:
- **`ACCOMMODATIONS`**: Hotel room blocks, booking codes, and cutoff dates.
- **`DAY_OF_CONTACTS`**: Emergency phone roster for wedding coordinators and vendors.
- **`RSVP_LOG`**: Raw web form submissions log for public guest RSVP link.
