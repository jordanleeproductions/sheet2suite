# Sheet2Vow - Master Google Spreadsheet Schema Reference

This document defines the authoritative tab structure and column header contracts required for the **Sheet2Vow Master Google Sheet Template**.

---

## 📊 Complete Tab Architecture Overview

| Tab Name | Purpose | Key Data Types | Formula Protected |
|---|---|---|---|
| **`DASHBOARD`** | Aggregate summary KPI overview cards | Formulas (`SUM`, `COUNTIF`, `SUMIFS`) | 🔒 Yes (Read-Only) |
| **`GUESTS`** | Guest registry, RSVPs, dietary needs & seating assignments | Strings, Enums, Contact Info | ✏️ User Editable |
| **`TABLE_SEATING`** | Floorplan table configurations & seating capacity | IDs, Enums, Integers, Booleans | ✏️ User Editable |
| **`VENDORS`** | Vendor directory, contacts, contracts & meal requirements | Strings, Currency, Links, Enums | ✏️ User Editable |
| **`BUDGET`** | Zero-formula financial ledger & payment tracking | Item IDs, Currency, Dates, Enums | ✏️ User Editable |
| **`SCHEDULE`** | Day-of itinerary timeline & responsibility assignments | Time strings, Moments, Locations | ✏️ User Editable |
| **`MUSIC`** | Wedding playlist & banned tracks catalog | Song Titles, Artists, List Enums | ✏️ User Editable |
| **`PHOTOS`** | Photographer shot list & priority ordering | Sequence IDs, Descriptions, Locations | ✏️ User Editable |
| **`TO DO`** | Wedding task checklist & Kanban stages | Task IDs, Status, Priorities, Dates | ✏️ User Editable |
| **`Calc_Data`** | Internal metric lookup table for dynamic formulas | System keys & metric values | 🔒 Yes (System Internal) |

---

## 📑 Tab 1: `GUESTS`
Stores guest registry information, party groups, dietary restrictions, and table assignments.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Guest ID` | `guestId` | `string` (Primary Key) | `G1`, `G2`, `G3` |
| `First Name` | `firstName` | `string` | `Jane` |
| `Last Name` | `lastName` | `string` | `Doe` |
| `Party Group` | `partyGroup` | `string` | `Bridal Party`, `Doe Household`, `College Friends` |
| `Age Category` | `ageCategory` | `enum` | `Adult`, `Child`, `Infant` |
| `RSVP Status` | `rsvpStatus` | `enum` | `Attending`, `Declined`, `Pending` |
| `Dietary Restrictions` | `dietaryRestrictions` | `string` | `Vegetarian`, `Gluten-Free`, `Nut Allergy`, `None` |
| `Table Assignment` | `tableAssignment` | `string` | `Sweetheart Table (Bride & Groom)`, `Table 1 - Head Table`, `Unassigned` |
| `Email` | `email` | `string` (Email) | `jane.doe@example.com` |
| `Phone Number` | `phoneNumber` | `string` (Phone) | `(555) 234-5678` |
| `Mailing Address` | `mailingAddress` | `string` | `123 Main St, Suite 4, Austin, TX 78701` |

---

## 🪑 Tab 2: `TABLE_SEATING` *(Table Seating & Floorplan)*
Configures visual seating chart floorplan tables, table shapes, and seat capacities.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Table ID` | `tableId` | `string` (Primary Key) | `table-1`, `table-sweetheart` |
| `Table Name` | `tableName` | `string` | `Sweetheart Table (Bride & Groom)`, `Table 1`, `Table 2` |
| `Shape` | `shape` | `enum` | `circle`, `rectangle`, `sweetheart` |
| `Capacity` | `capacity` | `integer` | `2`, `6`, `8`, `10`, `12` |
| `Include End Seats` | `includeEndSeats` | `boolean` | `TRUE`, `FALSE` (Rectangle head/foot end seats) |
| `Sort Order` | `sortOrder` | `integer` | `1`, `2`, `3` |
| `Notes` | `notes` | `string` | `Near dance floor`, `VIP family seating` |

---

## 💵 Tab 3: `BUDGET`
Tracks budget line items, estimated vs. actual costs, amounts paid, and payment statuses.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Item ID` | `itemId` | `string` (Primary Key) | `B1`, `B2` |
| `Category` | `category` | `string` | `Venue & Catering`, `Photography`, `Attire`, `Florals`, `Music` |
| `Vendor Name` | `vendorName` | `string` | `Grand Plaza Hotel`, `Luna Photography` |
| `Estimated Cost` | `estimatedCost` | `number` (Currency) | `12000.00` |
| `Actual Cost` | `actualCost` | `number` (Currency) | `12500.00` |
| `Amount Paid` | `amountPaid` | `number` (Currency) | `5000.00` |
| `Due Date` | `dueDate` | `string` (Date) | `2026-08-15` |
| `Payment Status` | `paymentStatus` | `enum` | `Paid`, `Pending`, `Overdue` |

---

## 🤝 Tab 4: `VENDORS`
Maintains vendor directory, contact details, total contract values, and staff meal requirements.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Vendor ID` | `vendorId` | `string` (Primary Key) | `V1`, `V2` |
| `Vendor Name` | `vendorName` | `string` | `Grand Plaza Hotel` |
| `Category` | `category` | `string` | `Venue & Catering`, `DJ & MC`, `Floral Design` |
| `Contact Name` | `contactName` | `string` | `Sarah Jenkins` |
| `Email Address` | `emailAddress` | `string` (Email) | `sarah@grandplaza.com` |
| `Phone Number` | `phoneNumber` | `string` (Phone) | `(555) 987-6543` |
| `Total Contract Value` | `totalContractValue` | `number` (Currency) | `15000.00` |
| `Deposit Paid` | `depositPaid` | `number` (Currency) | `5000.00` |
| `Balance Owing` | `balanceOwing` | `number` (Currency) | `10000.00` |
| `Payment Due` | `paymentDueDate` | `string` (Date) | `2026-09-01` |
| `Contract Link` | `contractLink` | `string` (URL) | `https://drive.google.com/file/d/...` |
| `Staff Meals Required` | `staffMealsRequired` | `enum` | `Yes`, `No` |

---

## ⏰ Tab 5: `SCHEDULE`
Manages day-of timeline itinerary moments, vendor responsibilities, and late-night tracking.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Event ID` | `eventId` | `string` (Primary Key) | `E1`, `E2` |
| `Start Time` | `startTime` | `string` (Time) | `08:00 AM`, `04:30 PM`, `01:00 AM` |
| `End Time` | `endTime` | `string` (Time) | `09:30 AM`, `05:00 PM`, `02:00 AM` |
| `Event Moment` | `eventMoment` | `string` | `Bridal Hair & Makeup`, `Ceremony Processional`, `Late Night Shuttle` |
| `Location` | `location` | `string` | `Bridal Suite`, `Main Garden Chapel`, `Hotel Lobby` |
| `Responsibility / Vendors` | `responsibility` | `string` | `Bridal Party`, `Catering`, `Photography`, `Guests` |
| `Notes / Details` | `notes` | `string` | `Photographer to capture dress reveal`, `Shuttle bus leaves every 20 mins` |
| `Is After Midnight` | `isAfterMidnight` | `boolean` | `TRUE`, `FALSE` |

---

## 🎵 Tab 6: `MUSIC`
Categorizes wedding music playlists, track choices, and banned tracks.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Song ID` | `songId` | `string` (Primary Key) | `M1`, `M2` |
| `List Type` | `listType` | `enum` | `Ceremony`, `Reception`, `First Dance`, `Must Play`, `Banned` |
| `Song Title` | `songTitle` | `string` | `At Last`, `Perfect`, `Chicken Dance` |
| `Artist` | `artist` | `string` | `Etta James`, `Ed Sheeran` |
| `Requested By` | `requestedBy` | `string` | `Bride`, `Groom`, `Guests` |
| `Notes` | `notes` | `string` | `Play during cake cutting`, `DO NOT PLAY UNDER ANY CIRCUMSTANCES` |

---

## 📋 Tab 7: `TO DO`
Organizes wedding tasks, categories, due dates, and Kanban workflow stages.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Task ID` | `taskId` | `string` (Primary Key) | `T1`, `T2` |
| `Task Name` | `taskName` | `string` | `Book Photographer & Videographer` |
| `Status` | `kanbanStage` | `enum` | `To Do`, `In Progress`, `Done` |
| `Category` | `category` | `string` | `Venue & Vendors`, `Attire & Rings`, `Logistics` |
| `Priority` | `priority` | `enum` | `High`, `Medium`, `Low` |
| `Assigned To` | `assignedTo` | `string` | `Alex`, `Sam`, `Wedding Planner` |
| `Due Date` | `dueDate` | `string` (Date) | `2026-06-01` |
| `Notes / Links` | `notes` | `string` | `Compare quotes from 3 photographers` |

---

## 📷 Tab 8: `PHOTOS`
Photographer shot list requirements and group priority sequence.

| Column Header Name | Developer Key | Type / Format | Allowed Values / Examples |
|---|---|---|---|
| `Shot ID` | `shotId` | `string` (Primary Key) | `P1`, `P2` |
| `Shot Order` | `shotOrder` | `integer` | `1`, `2`, `3` |
| `Shot Time` | `shotTime` | `string` | `03:30 PM (Post-Ceremony)` |
| `Description or People` | `description` | `string` | `Bride & Groom with Bride's Grandparents` |
| `Location` | `location` | `string` | `Chapel Altar` |
| `Priority` | `priority` | `enum` | `Must Have`, `Nice To Have` |

---

## 📊 Tab 9: `DASHBOARD` *(Summary KPI View)*
Contains aggregate formulas displaying high-level metrics.

| Cell / Range | Metric Name | Spreadsheet Formula | Description |
|---|---|---|---|
| `B2` | Total Guests | `=COUNTA(GUESTS!A2:A)` | Total guest entries |
| `B3` | Attending Count | `=COUNTIF(GUESTS!F2:F, "Attending")` | Total confirmed attending |
| `B4` | Declined Count | `=COUNTIF(GUESTS!F2:F, "Declined")` | Total declined |
| `B5` | Total Estimated Budget | `=SUM(BUDGET!D2:D)` | Sum of estimated line items |
| `B6` | Total Actual Budget | `=SUM(BUDGET!E2:E)` | Sum of actual line items |
| `B7` | Total Paid Amount | `=SUM(BUDGET!F2:F)` | Sum of payments made |
| `B8` | Balance Owing | `=B6-B7` | Remaining balance due |

---

## ⚙️ Tab 10: `Calc_Data` *(System Internal)*
Internal lookup metrics key-value table used by `@germin8/sheet2-core`.

| Metric ID | Category | Name | Value |
|---|---|---|---|
| `SYS_VERSION` | System | Core Engine Version | `1.0.0` |
| `SCHEMA_VER` | System | Schema Specification | `2026-07-29` |
| `DEFAULT_CURRENCY` | Settings | Currency Symbol | `$` |
