# Sheet2Suite Platform Architecture

## 1. Multi-Product Platform Architecture Overview

Sheet2Suite is the parent digital canvas application platform residing on **`sheet2suite.com`**, built on **Next.js (App Router)** and **TypeScript**. Sheet2Suite powers a family of domain-specific productivity applications (sub-products / digital canvases) that map directly to private Google Spreadsheets in the user's Google Drive via the Google Sheets API v4 with zero vendor lock-in.

```
                                  ┌──────────────────────────────────────────────┐
                                  │             SHEET2SUITE PLATFORM             │
                                  │               sheet2suite.com                │
                                  └──────────────────────┬───────────────────────┘
                                                         │
             ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
             │                                                                                       │
             ▼                                                                                       ▼
┌──────────────────────────────────────────┐                               ┌──────────────────────────────────────────┐
│        GENERIC ACTIVATION ENGINE         │                               │     SUB-PRODUCTS / DIGITAL CANVASES      │
│         activate.sheet2suite.com         │                               │                                          │
│                                          │                               │ 💍 Sheet2Vow (vow.sheet2suite.com)       │
│ 1. License & Order Validation            │                               │ 🏗️ Sheet2Build (build.sheet2suite.com)   │
│ 2. Google OAuth & Drive Selection        ├─────────── Provisions ───────►│ 💰 Sheet2Finance (finance.sheet2suite...) │
│ 3. Feature Setup Plugin Injection        │      Directly into User Drive │ 🏡 Sheet2Home (home.sheet2suite.com)     │
│ 4. Automated Spreadsheet Template Copy   │                               │ 🏋️ Sheet2Fit (fit.sheet2suite.com)       │
└──────────────────────────────────────────┘                               └──────────────────────────────────────────┘
```

---

## 2. Architectural Guarantees & Developer Experience

- **Zero Rebuild for New Products:** Adding a new sub-product (e.g., *Sheet2Build*, *Sheet2Fit*, *Sheet2Finance*) does **not** require rebuilding authentication, Google Drive integration, licensing, provisioning, theme engines, or application layout shells.
- **Generic Activation Framework:** A single, unified activation pipeline (`/activate` or `activate.sheet2suite.com`) handles order verification, Google OAuth authentication, target Drive directory resolution, and Drive spreadsheet provisioning for all products across the suite.
- **Pluggable Feature Setup Modules:** Setup wizards are modular plugins injected into Step 2 of the Activation pipeline. Each product exposes a standard `<ProductSetupPlugin />` interface supplying product-specific onboarding steps (e.g., Wedding Date & Couple Names for Sheet2Vow vs Project Milestones & Trade Categories for Sheet2Build).
- **Subdomain & Path Parity (`src/proxy.ts`):** Dynamic subdomain routing engine mapping `{product}.sheet2suite.com` and `sheet2suite.com/{product}` seamlessly to corresponding App Router pages.

---

## 3. Subdomain Proxy Routing Engine (`src/proxy.ts`)

Sheet2Suite employs a dynamic routing layer designed for subdomain and path equivalence across serverless deployments:

- **Hostname Parsing & Product Resolution:**
  - `sheet2suite.com` or `www.sheet2suite.com` $\rightarrow$ Main platform showcase and suite hub `src/app/(suite)/page.tsx`
  - `activate.sheet2suite.com` $\rightarrow$ Universal activation engine `src/app/activate/page.tsx`
  - `{product}.sheet2suite.com` (e.g. `vow.sheet2suite.com`) $\rightarrow$ Product digital canvas `src/app/{product}/page.tsx`
  - `sheet2suite.com/{product}` $\rightarrow$ Canonical path rewrite mapping directly to the same sub-product canvas route.
- **Header Forwarding & Security Context:**
  - Forwards `x-forwarded-host`, `x-real-ip`, and `x-subproduct` headers.
  - Ensures CORS headers and cookie domains (`.sheet2suite.com`) persist cross-subdomain authentication states seamlessly.
- **Tokenized Shared Route Bypass:**
  - Share and portal paths (`/share/[token]`, `/upload/[token]`, `/request-song/[token]`) operate identically regardless of whether accessed via the platform root or domain subdomain.

---

## 4. Next.js App Router Structure & Modular Workspace Standards

To prevent code duplication and enforce separation of concerns, the Sheet2Suite codebase adheres to a strict 3-tier modular architecture:

```
src/
├── app/                              # Next.js App Router Shells & Subdomain Entrypoints
│   ├── (suite)/                      # Main Platform Showcase (sheet2suite.com)
│   ├── activate/                     # Generic Suite Activation Engine (activate.sheet2suite.com)
│   ├── support/                      # Monarch Editorial Help Center & Knowledge Base (/support, /help)
│   ├── vow/                          # Sheet2Vow Digital Wedding Canvas (vow.sheet2suite.com)
│   ├── [future-app]/                 # e.g., build/ (build.sheet2suite.com), finance/, home/
│   ├── api/                          # Shared Serverless API Endpoints
│   │   ├── auth/google/              # Reusable Google OAuth Handlers & CSRF Validation
│   │   ├── auth/refresh/             # Silent Refresh Token Exchange
│   │   ├── auth/session/             # Session Connectivity Check
│   │   ├── verify-order/             # Generic License & Order Entitlement Engine
│   │   ├── provision/                # Universal Drive Spreadsheet Duplicator & Injector
│   │   ├── sync/                     # Bi-Directional Google Sheets Synchronization
│   │   ├── drive/                    # Drive Folder Hierarchy & Native Picker Resolution
│   │   └── admin/                    # Monarch Admin Operations & Database Endpoints
│   ├── share/[token]/                # Reusable Tokenized Vendor/Client Read-Only Portals
│   ├── upload/[token]/               # Reusable Guest/Client File & Photo Upload Portals
│   └── request-song/[token]/         # Interactive Guest Request Portals
│
├── core/ (or src/lib/core/)          # Shared Platform Engine (@germin8/sheet2-core)
│   ├── activation/                   # Generic Order Validator & Setup Plugin Registry
│   ├── auth/                         # OAuth Client, Token Refresh, Session Hydration
│   ├── drive/                        # Drive Picker, Folder Hierarchy, Google Drive API
│   ├── sheets/                       # CellGuard, Range Sync, In-Memory XLSX Engine
│   ├── theme/                        # Multi-Theme Provider, Dark Mode, Font Size Scaler
│   └── security/                     # HMAC-SHA256 Token Crypto, Rate Limiting, Input Sanitization
│
├── components/
│   ├── shared/                       # Shared Cross-App UI Primitives
│   │   ├── OfficialGoogleButton.tsx  # Google Identity Buttons & Badges
│   │   ├── GoogleDrivePickerModal.tsx# Universal Drive Directory Picker
│   │   ├── ToastNotification.tsx     # Global Floating Toast System
│   │   ├── AppVersionBadge.tsx       # Live Version & Deployment Dateline
│   │   ├── AppUpdateToast.tsx        # Monarch-style Deployment Update Notifier
│   │   └── PageSearchInput.tsx       # Unified Search Input with Theme Adaptation
│   └── activate/                     # Generic Activation Engine UI Components
│       ├── StepOrderVerification.tsx # Step 0 Order Form
│       ├── StepPackageHub.tsx        # Step 1 Package Confirmation
│       └── StepSetupForm.tsx         # Step 2 Setup Wrapper
│
└── products/ (or src/components/vow/) # Encapsulated Domain Product Modules
    ├── vow/                          # Sheet2Vow Product Module
    │   ├── components/               # Vow Managers (GuestList, Seating, Budget, Timeline, etc.)
    │   ├── setup/                    # Vow Setup Wizard Plugin (<VowSetupWizard />)
    │   ├── schemas/                  # Master Wedding Sheet 15-Tab Schema Definition
    │   ├── presets/                  # Wedding Task & Style Presets
    │   └── types/                    # Vow TypeScript Models (Guest, Vendor, Song, etc.)
    │
    └── [future-product]/             # e.g., build/, finance/, fit/, property/
        ├── components/
        ├── setup/                    # Product Setup Plugin (<ProductSetupPlugin />)
        ├── schemas/                  # Master Product Spreadsheet Schema
        └── types/
```

---

## 5. Sub-Product Onboarding Workflow

When introducing a new product to the platform:
1. **Define Schema Contract**: Declare the authoritative multi-tab Google Sheet structure under `docs/[product]/master_spreadsheet_schema.md`.
2. **Implement Setup Plugin**: Create `<[Product]SetupPlugin />` conforming to `ProductSetupPluginProps` in `src/lib/core/activation/pluginTypes.ts`.
3. **Register Product Code**: Register product key (e.g. `SHEET2BUILD`) in `src/lib/core/activation/registry.ts`.
4. **Deploy Template XLSX**: Deposit binary master template or export ID into Google Drive for live duplication.
5. **Implement Product Canvas**: Create `src/app/[product]/page.tsx` utilizing shared `src/lib/core/` data sync, session, and UI shell primitives.
