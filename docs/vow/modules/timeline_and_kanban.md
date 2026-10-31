# Sheet2Vow — Timeline & Tasks Kanban Specification

**Primary Components:** `src/components/TimelineManager.tsx`, `src/components/KanbanBoard.tsx`, `src/components/TimeDialPicker.tsx`  
**Google Sheet Tabs:** `SCHEDULE` (Day-of timeline, Cols A–F), `TO DO` (Tasks checklist, Cols A–H)

---

## 1. Day-Of Timeline & Itinerary (`TimelineManager.tsx`)

The Day-Of Timeline manages the chronological schedule for wedding day events, rehearsal dinners, vendor arrival times, and late-night transitions.

### 1.1 "UP NEXT" Active Moment Ticker
- Evaluates real-time clock time against scheduled start/end windows.
- Displays a high-visibility, ambient pulsing banner featuring the active milestone, location, assigned vendor roles, and time remaining.

### 1.2 Time Serial Normalization Engine (`[SCHED-7]`)
- **Root Cause & Fix:** Eliminates the classic Google Sheets `12:00 AM` bug where `UNFORMATTED_VALUE` returns raw floating-point day fractions (e.g., `0.5833333333333334` for 2:00 PM).
- **Canonical Parser (`parseTimeOrSerial`):** Accurately calculates fraction-of-day offsets and ISO strings into formatted 12-hour timestamps with AM/PM indicators.
- **Explicit Sheet Formatting:** During bidirectional sync, executes `repeatCell` requests setting `numberFormat: { type: 'TIME', pattern: 'hh:mm am/pm' }` on the `SCHEDULE` tab.

### 1.3 Multi-Assignee & Multi-Role Selection (`[SCHED-MULTI-ASSIGNEE]`)
- Add/Edit Moment modal supports assigning multiple roles and individuals to a single itinerary milestone via multi-select chips and combobox search.
- Quick suggestion badges: `+ Photographer`, `+ Videographer`, `+ Wedding Party`, `+ Coordinator`, `+ Catering`.
- Stores assignments as clean comma-separated values in Column E (`Responsibility / Vendors`), ensuring complete compatibility with plain spreadsheet viewing.

### 1.4 Modal Spacing & Time Dial Ergonomics
- Overhauled desktop modal to an 820px four-card layout: *Timing & Duration*, *Moment & Venue*, *Assigned Roles*, and *Notes & Guidelines*.
- Includes a live duration calculation pill (`⏱ EST. DURATION: X hrs Y mins`) with WCAG AAA high-contrast dark amber styling (`#92400e`).

---

## 2. Tasks & Checklist Kanban Board (`KanbanBoard.tsx`)

The Kanban module organizes wedding preparations into a 3-stage board: **To Do**, **In Progress**, and **Done**.

### 2.1 Jira Mobile-Inspired Ergonomics (`[TASK-JIRA-MOBILE-REDESIGN]`)
- **4px Priority Left Border Accent:** Task cards render a solid 4px left border matching priority level (`High` = Red `#EF4444`, `Medium` = Amber `#F59E0B`, `Low` = Emerald `#10B981`).
- **Mobile Quick Chips Filter Bar:** Horizontally scrolling filter bar on mobile ($\le 767\text{px}$) with expandable search, `High Priority` toggle, `Overdue` toggle, partner assignment filters, and category selectors.
- **Segmented Stage Capsules & Swipe Gestures:** Compact segmented capsule bar (`TO DO`, `IN PROGRESS`, `DONE`) with count badges and touch swipe navigation (`handleTouchStart`, `handleTouchEnd`) with 12ms haptic vibration.
- **1-Tap Status Switcher Bottom Sheet:** Mobile status chip opens an ergonomic slide-up drawer for 1-tap column transitions, triggering celebratory HTML5 canvas confetti when the final task is completed.

### 2.2 Board Filtering & Quick-Add Controls
- **Category Filter Dropdown:** Filter by category with live task counts and automatic assignment of newly added tasks to the active category filter. Unassigned categories default to `General`.
- **Dynamic Assignee Filter:** Filter tasks across `ALL ASSIGNEES`, `UNASSIGNED`, or individual co-planners.
- **Desktop Column Quick-Add:** Bottom-pinned `+ ADD TO DO TASK`, `+ ADD IN PROGRESS TASK`, and `+ ADD DONE TASK` buttons pre-populate stages automatically without requiring top-of-page scrolling.

### 2.3 Date Formatting & Overdue Highlighting
- **Overdue Task Alert:** Tasks in `To Do` or `In Progress` whose due dates are in the past render due dates and calendar icons in bold red (`var(--color-red, #ef4444)`).
- **Standardized MM/DD/YYYY Display:** Normalizes task due date formatting to uniform `MM/DD/YYYY` across desktop cards and mobile drawer lists regardless of raw spreadsheet date serial formats.
