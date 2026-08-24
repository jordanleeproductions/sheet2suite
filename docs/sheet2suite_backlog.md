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

### 🔐 Security & Audit
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[SYS-7]`** | Security & Risk Audit (formula injection prevention, HMAC replay guard) | `security.ts` | 🟡 Medium | ⚡ Med (~2-3 turns) | Pending |

### 🚀 Firebase & Beta Deployment Readiness
| Task ID | Feature Requirement | Target File | Effort Level | Quota Impact | Status |
|---|---|---|---|---|---|
| **`[DEPLOY-1]`** | Firebase Deployment Configuration (`firebase.json`, `apphosting.yaml`, `.firebaserc`, build & deployment scripts) | `firebase.json`, `apphosting.yaml`, `package.json` | 🟡 Medium | ⚡ Med (~2 turns) | ✅ Completed |
| **`[DEPLOY-2]`** | Firebase Environment Secret Manager & Production Credentials Audit (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `NEXT_PUBLIC_APP_URL`) | `.env.production`, `Secret Manager` | 🟡 Medium | ⚡ Low (~1 turn) | 📝 Ready for Setup |
| **`[DEPLOY-3]`** | Google Cloud OAuth Production Callback URI & Domain Authorization (`https://<app>.web.app/api/auth/google/callback`) | Google Cloud Console, `auth/google/route.ts` | 🟢 Low | ⚡ Low (~1 turn) | 📝 Ready for Setup |
| **`[DEPLOY-4]`** | Cloud Firestore Persistence Engine (Firebase Admin SDK integration for `firestoreDb.ts` to persist workspace records across serverless invocations) | `src/lib/db/firestoreDb.ts` | 🔴 High | ⚡ High (~3-4 turns) | ✅ Completed |
