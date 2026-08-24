# Sheet2Vow Application Architecture

## Overview
Sheet2Vow is a Next.js-based web application designed to help manage wedding planning. It is built as a single-page-like experience within the Next.js App Router paradigm, serving modular dashboard components depending on the user's role (Admin vs. Guest).

## Core Technologies
- **Framework:** Next.js (App Router)
- **UI Library:** React.js
- **Styling:** Vanilla CSS (CSS Modules / Global CSS) with CSS Variables for theming
- **Deployment:** Vercel (or similar Node.js hosting)

## Frontend Architecture
- **Dynamic Imports:** The main page (`src/app/page.js`) uses `next/dynamic` to load modules (e.g., `DashboardModule`, `GuestListModule`) asynchronously. This bypasses Server-Side Rendering (SSR) hydration issues, which is critical since the app heavily relies on client-side state (`localStorage`, `window`).
- **Module Pattern:** Each major feature (Budget, Tasks, Music, Guests) is encapsulated in its own React component module under `src/app/components/`.
- **Content Configuration:** Static strings, headers, and localized text are centralized in `src/config/content.js` to allow easy updates without touching component logic.
- **State Management:** Local component state via React Hooks (`useState`, `useEffect`). No global state managers (like Redux) are used, keeping the architecture lightweight.

## Backend & Data Architecture
- **API Routes:** Next.js API routes (`src/app/api/`) serve as a lightweight backend.
- **Data Persistence:** Currently interacts with local storage/JSON/CSV logic. (e.g., `/api/guests`, `/api/music`).
- **Authentication:** A lightweight, client-side authentication system. Users are differentiated by an `admin` or `guest` flag stored in `localStorage`, unlocked via a hardcoded passcode (`Emery2026`).

## Component Hierarchy
- `RootLayout` (`src/app/layout.js`): Injects global fonts and metadata.
- `Home` (`src/app/page.js`): Manages navigation state (current tab) and renders the appropriate module.
  - `Navigation`: Top header for desktop, bottom bar for mobile.
  - `Modules` (`src/app/components/`):
    - `DashboardModule`
    - `GuestListModule`
    - `MusicModule`
    - `BudgetModule`
    - `TasksModule`
    - `ScheduleModule`
    - `ItineraryModule`
    - `VendorsModule`
