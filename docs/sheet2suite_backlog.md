# 📦 Sheet2Suite Platform Pending Backlog

Authoritative pending backlog tracking platform infrastructure, licensing, multi-product architecture, telemetry, and security capabilities across the **Sheet2Suite** ecosystem.

---

## ⚙️ Generic & Platform Infrastructure Pending Tasks

### 🛡️ Entitlements, Licensing & Webhooks
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SYS-6]`** | Native Sheet2Suite Entitlements & License Database (Lemon Squeezy / Etsy Webhooks, Partner Email Validation, & Telemetry) | `/api/webhook` | 🔴 High | ⚡ High (~4-5 turns) | Pending |
| **`[SUITE-1]`** | Multi-Product Licensed Suite Applications Hub & Switcher (Support for Sheet2Finances, Sheet2Stay, Sheet2Closet, Sheet2Inventory multi-product bundle activation & cross-app workspace switching) | `src/app/activate/page.tsx`, `src/components/SuiteProductSwitcher.tsx`, `/api/workspaces` | 🔴 High | ⚡ High (~4-5 turns) | Pending |

### 📊 Telemetry & Analytics
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SYS-5]`** | Unified Product Usage Telemetry (GA4 Event Engine) | `telemetry.ts` | 🟡 Medium | ⚡ Low (~2 turns) | Pending |

### 🔐 Security Vulnerabilities & Hardening Backlog
| Task ID | Severity | Vulnerability Summary | Target File(s) | Status |
|---|---|---|---|---|
| **`[SEC-1]`** | 🔴 **CRITICAL** | Unauthenticated Admin Database Endpoints & UI | `src/app/api/admin/db/route.ts`, `src/app/admin/page.tsx` | ✅ Resolved |
| **`[SEC-2]`** | 🔴 **CRITICAL** | Insecure `postMessage` Wildcard (`*`) Leaking OAuth Access Tokens | `src/app/api/auth/google/callback/route.ts` | ✅ Resolved |
| **`[SEC-3]`** | 🔴 **CRITICAL** | BOLA / IDOR via Firestore Stored Token Substitution | `src/lib/sheets/client.ts`, `src/app/api/sync/route.ts`, `src/app/api/auth/session/route.ts` | 📝 Open |
| **`[SEC-4]`** | 🟠 **HIGH** | Unauthenticated Refresh Token Harvesting via Cookie Injection | `src/app/api/auth/register-token/route.ts` | 📝 Open |
| **`[SEC-5]`** | 🟠 **HIGH** | Hardcoded Fallback JWT Secret for Vendor Share & Upload Links | `src/lib/share/token.ts` | 📝 Open |
| **`[SEC-6]`** | 🟡 **MEDIUM** | Unauthenticated Workspace & User Email Enumeration | `src/app/api/workspaces/route.ts` | 📝 Open |
| **`[SEC-7]`** | 🟡 **MEDIUM** | Missing CSRF State Nonce in Google OAuth Authorization | `src/app/api/auth/google/route.ts` | 📝 Open |
| **`[SEC-8]`** | 🟢 **LOW** | Local JSON Database Files Not Excluded in `.gitignore` | `.gitignore`, `data/workspaces.json` | 📝 Open |
| **`[SEC-9]`** | 🟢 **LOW** | Client-Side / Stubbed License Verification Auto-Approves Any 5+ Character Order ID | `src/lib/core/activation/licenseValidator.ts` | 📝 Open |
| **`[SEC-10]`** | 🟢 **LOW** | Outdated Sub-dependencies with Known CVEs (`next`, `postcss`, `sharp`) | `package.json` | 📝 Open |

#### Vulnerability Details & Remediation Specifications

- **`[SEC-1]` [CRITICAL] Unauthenticated Admin Database Endpoints (`GET`, `PUT`, `DELETE /api/admin/db`) and UI (`/admin`)**:
  - **Summary**: Both the admin UI (`/admin`) and API route (`/api/admin/db`) lack authentication, authorization, or API key validation.
  - **Risk**: Any unauthenticated public user can dump all workspace records, spreadsheet IDs, and customer emails (`GET`), modify records (`PUT`), or permanently wipe the entire database (`DELETE /api/admin/db?all=true`).
  - **Suggested Fix**: Implement admin authentication middleware or gate (`x-admin-secret` header or server-side verified admin session) matching `process.env.ADMIN_SECRET_KEY` / `process.env.ADMIN_EMAILS`. Return `401 Unauthorized` / `403 Forbidden` on unauthorized requests.
  - **Resolution (v1.15.2)**: Implemented `src/lib/auth/adminAuth.ts` with constant-time secret comparison (`validateAdminKey`, `verifyAdminAuth`, `requireAdminAuth`). Added `POST /api/admin/auth` session route. Protected `/api/admin/db` and `/api/admin/validate-schema` across all HTTP methods. Built dedicated Monarch Admin Lock Screen in `src/app/admin/page.tsx` with session key management, protected headers, and lock/logout functionality.

- **`[SEC-2]` [CRITICAL] Insecure `window.opener.postMessage(..., '*')` Wildcard Leaking Google Access Tokens**:
  - **Summary**: Following successful Google OAuth consent, `callback/route.ts` posts the user's raw Google OAuth `accessToken`, user email, and provisioned spreadsheet ID back to `window.opener` using target origin `'*'`.
  - **Risk**: Any malicious site or script that opened or navigated the OAuth popup can intercept the `postMessage` event and steal the user's active Google OAuth credentials.
  - **Suggested Fix**: Replace `'*'` with `window.location.origin` or verified authorized application origin.

- **`[SEC-3]` [CRITICAL] Broken Object Level Authorization (BOLA / IDOR) via Stored Token Substitution**:
  - **Summary**: In `getGoogleAuthAsync`, when an incoming request provides a `spreadsheetId` without a valid caller access token, the server automatically queries Firestore for `tokenDoc` matching `spreadsheetId` and uses the stored `refreshToken` to execute Google API calls. In `/api/auth/session`, it even returns this freshly minted access token in cleartext JSON.
  - **Risk**: Any attacker who discovers or guesses a victim's `spreadsheetId` can read the entire spreadsheet via `GET /api/sync`, overwrite it via `POST /api/sync`, or extract the victim's raw Google access token via `GET /api/auth/session`.
  - **Suggested Fix**: Validate that the requesting user's session (verified via session cookie or bearer token) actually owns or is an authorized collaborator on that `spreadsheetId` before looking up tokens from Firestore. Refuse unauthenticated token retrieval.

- **`[SEC-4]` [HIGH] Unauthenticated Refresh Token Harvesting via Cookie Injection in `/api/auth/register-token`**:
  - **Summary**: When `POST /api/auth/register-token` is called with `{ spreadsheetId: "..." }`, if the caller has no refresh token cookie, it looks up the victim's refresh token from Firestore and sets `response.cookies.set('s2s_refresh_token', existingRefreshToken)`.
  - **Risk**: An attacker can obtain the victim's long-lived Google OAuth refresh token set directly into their own browser cookies, granting persistent offline access to the victim's Google Drive and Sheets.
  - **Suggested Fix**: Restrict `/api/auth/register-token` to authenticated callers. Never set `s2s_refresh_token` cookies to a caller based on an unverified lookup of an untrusted `spreadsheetId`.

- **`[SEC-5]` [HIGH] Hardcoded Default JWT Secret Fallback for Vendor Share & Upload Links**:
  - **Summary**: `src/lib/share/token.ts` falls back to `'sheet2vow-secure-vendor-secret-key-2026'` when `process.env.SHARE_JWT_SECRET` is unset.
  - **Risk**: Because `.env.local` does not set `SHARE_JWT_SECRET`, any attacker who knows this fallback string can forge signed HMAC-SHA256 JWT tokens for any spreadsheet ID and access vendor portals or upload files.
  - **Suggested Fix**: Require `process.env.SHARE_JWT_SECRET` in environment variables; fail fast or generate a random secret if unset.

- **`[SEC-6]` [MEDIUM] Unauthenticated Workspace & User Email Enumeration**:
  - **Summary**: `GET /api/workspaces?email=target@gmail.com` returns all workspace documents and spreadsheet IDs without verifying that the caller is logged in as that email.
  - **Risk**: PII leakage (wedding titles, spreadsheet IDs, partner emails, Drive paths) via email enumeration.
  - **Suggested Fix**: Ensure `email` matches the authenticated session cookie (`s2s_user_email`) or reject unauthenticated queries.

- **`[SEC-7]` [MEDIUM] Missing CSRF State Nonce in Google OAuth Authorization**:
  - **Summary**: The OAuth `state` parameter generated in `/api/auth/google` only encodes `{ spreadsheetId }` without a cryptographically random CSRF nonce.
  - **Risk**: Susceptible to OAuth Login CSRF where an attacker tricks a victim into linking the attacker's Google account or spreadsheet.
  - **Suggested Fix**: Generate an unguessable random nonce stored in an HTTP-only cookie and verify it in `/api/auth/google/callback`.

- **`[SEC-8]` [LOW] Local JSON Database Files Not Excluded in `.gitignore`**:
  - **Summary**: `.gitignore` only ignores `data/firestore/auth_tokens/`. Files like `data/workspaces.json` and `data/licenses.json` contain real user emails and spreadsheet IDs.
  - **Risk**: Accidental git commit and push of local database files containing PII to GitHub.
  - **Suggested Fix**: Add `/data/` to `.gitignore`.

- **`[SEC-9]` [LOW] Client-Side / Stubbed License Verification Auto-Approves Any 5+ Character Order ID**:
  - **Summary**: In `licenseValidator.ts`, any order ID string of 5+ characters not in the database is automatically registered as active, and granting Pro if it contains `"PRO"`.
  - **Risk**: Unpaid commercial bypass.
  - **Suggested Fix**: Connect to Etsy Open API v3 or Lemon Squeezy webhook signature verification before issuing active licenses.

- **`[SEC-10]` [LOW] Outdated Sub-dependencies with Known CVEs**:
  - **Summary**: `npm audit` reports vulnerabilities in sub-dependencies of `next@16.2.10`, `postcss`, and `sharp`.
  - **Risk**: Potential DoS or build-time issues.
  - **Suggested Fix**: Upgrade to `next@16.4.x` and run `npm audit fix`.

---

### 🚀 Firebase & Beta Deployment Readiness
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[DEPLOY-1]`** | Firebase Deployment Configuration (`firebase.json`, `apphosting.yaml`, `.firebaserc`, build & deployment scripts) | `firebase.json`, `apphosting.yaml`, `package.json` | 🟡 Medium | ⚡ Med (~2 turns) | ✅ Completed |
| **`[DEPLOY-2]`** | Firebase Environment Secret Manager & Production Credentials Audit (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `NEXT_PUBLIC_APP_URL`) | `.env.production`, `Secret Manager` | 🟡 Medium | ⚡ Low (~1 turn) | 📝 Ready for Setup |
| **`[DEPLOY-3]`** | Google Cloud OAuth Production Callback URI & Domain Authorization (`https://<app>.web.app/api/auth/google/callback`) | Google Cloud Console, `auth/google/route.ts` | 🟢 Low | ⚡ Low (~1 turn) | 📝 Ready for Setup |
| **`[DEPLOY-4]`** | Cloud Firestore Persistence Engine (Firebase Admin SDK integration for `firestoreDb.ts` to persist workspace records across serverless invocations) | `src/lib/db/firestoreDb.ts` | 🔴 High | ⚡ High (~3-4 turns) | ✅ Completed |
