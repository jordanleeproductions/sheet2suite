# 🏷️ Sheet2Vow — Pricing Models & Feature Tier Mapping

**Authoritative Documentation**  
**Version**: 1.0  
**Last Updated**: July 2026  
**Status**: Approved Architecture & Strategy  

---

## 1. Executive Summary & Monetization Philosophy

Sheet2Vow operates on a **Google Sheets-Native Micro-SaaS Model**. Couples receive full, perpetual ownership of their Google Spreadsheet data while unlocking a modern web application for mobile guest check-in, visual seating arrangements, vendor share portals, and PDF print exports.

### 💡 Core Value Proposition
- **No Monthly Lock-in**: Weddings have a fixed end-date. Monthly subscriptions cause churn friction; lifetime one-time pricing creates high impulse conversion on Etsy, Gumroad, and Product Hunt.
- **Data Sovereignty**: All data remains stored safely in the user's personal Google Drive.
- **Value-Gated Upgrades**: Basic core features (Guests, Budget, Kanban) are accessible at an entry-level tier, while advanced coordination tools (Tokenized Vendor Links, Co-Planning, Print Exports) incentivize upgrades to **Pro** or **VIP**.

---

## 2. Recommended Tiered Pricing Model (Basic vs. Pro vs. VIP)

```
┌───────────────────────────────────┬───────────────────────────────────┬───────────────────────────────────┐
│           BASIC / LITE            │           PRO (POPULAR)           │          VIP CO-PLANNER           │
│              $29 USD              │              $59 USD              │              $99 USD              │
│         (One-Time Lifetime)       │         (One-Time Lifetime)       │         (One-Time Lifetime)       │
├───────────────────────────────────┼───────────────────────────────────┼───────────────────────────────────┤
│ • Master Google Sheet Workspace   │ • Everything in Basic, plus:      │ • Everything in Pro, plus:        │
│ • Guest Registry & RSVPs          │ • 🔗 Tokenized Read-Only Vendor   │ • 👫 Spouse / Co-Planner Admin    │
│ • Visual Table Seating Builder    │   Share Portals (DJ, Photo, etc.) │   Real-time Access (Drive Sync)   │
│ • Budget Ledger & Payment Tracker │ • 🖨️ PDF & Printable Export Suite │ • 🤖 AI Seating & Budget Assistant│
│ • Kanban Task Checklist Presets   │ • 🎨 Expanded Themes (Botanical,  │ • ⚡ Priority Setup Concierge    │
│ • Light / Dark Theme & Colors     │   Midnight Tuxedo, Cyberpunk)     │ • 🎁 Unlimited Vendor Links       │
└───────────────────────────────────┴───────────────────────────────────┴───────────────────────────────────┘
```

---

## 3. Comprehensive Feature Entitlement Matrix

| Feature / Capability | Basic ($29) | Pro ($59) | VIP ($99) | Technical Enforcement Key |
|---|:---:|:---:|:---:|---|
| **Google Sheet Workspace Direct Sync** | ✅ | ✅ | ✅ | `core_sheet_sync` |
| **Guest Registry & RSVP Manager** | ✅ (Up to 150) | ✅ Unlimited | ✅ Unlimited | `max_guests` |
| **Visual Seating Chart Manager** | ✅ (Up to 15 Tables) | ✅ Unlimited Tables | ✅ Unlimited Tables | `max_tables` |
| **Budget Ledger & Cost Category Meter** | ✅ | ✅ | ✅ | `budget_ledger` |
| **Day-Of Timeline Itinerary Builder** | ✅ | ✅ | ✅ | `timeline_builder` |
| **Kanban Task Checklist & Presets** | ✅ | ✅ | ✅ | `kanban_presets` |
| **Email List Formatter for DJ/Photo** | ✅ | ✅ | ✅ | `email_formatter` |
| **Thank You Card & Gift Tracker** | ❌ | ✅ (With Party Bundling)| ✅ | `thank_you_manager` |
| **Photo Shot List Manager** | ❌ | ✅ | ✅ | `photo_shot_list` |
| **Music Playlist & Audio 30s Previews** | ❌ | ✅ | ✅ | `music_playlist` |
| **Tokenized Read-Only Vendor Share Links** | ❌ | ✅ (Up to 3 Active) | ✅ Unlimited Active | `vendor_share_links` |
| **PDF & Printable Export Suite** | ❌ | ✅ | ✅ | `print_pdf_exports` |
| **Interactive Dietary Restrictions Drawer** | ❌ | ✅ | ✅ | `dietary_drawer` |
| **Multi-Theme Engine (Botanical, Midnight, etc.)** | ❌ (Editorial/Brutalism Only) | ✅ | ✅ | `theme_presets` |
| **Spouse / Co-Planner Admin Drive Sync** | ❌ | ❌ | ✅ | `co_planner_admin` |
| **AI Seating & Budget Assistant (Gemini)** | ❌ | ❌ | ✅ | `ai_assistant` |

---

## 4. Alternative Monetization Strategies Considered

### Model A: Single Flat-Rate One-Time ($39)
- **Pros**: Extremely low barrier to purchase, zero confusion for buyers.
- **Cons**: Misses upside from high-intent couples wanting multi-vendor sharing or co-planning.

### Model B: Tiered Lifetime (Basic $29 / Pro $59 / VIP $99) — **RECOMMENDED**
- **Pros**: Clear value progression. Couples buying Basic on Etsy can seamlessly upgrade to Pro in the app when hiring vendors.
- **Cons**: Requires feature license gating logic in the frontend shell.

### Model C: Annual / Seasonal Subscription ($9/month or $49/year)
- **Pros**: Recurring revenue stream.
- **Cons**: High churn post-wedding; users resist subscriptions for wedding software.

---

## 5. Technical Implementation & License Entitlement Architecture

### 5.1 License Storage (`Settings!B2`)
The user's entitlement tier is stored in cell **`Settings!B2`** inside the JSON config payload:
```json
{
  "licenseKey": "S2V-PRO-9842-8810",
  "tier": "PRO",
  "activatedAt": "2026-07-30T16:30:00Z",
  "enabledFeatures": [
    "vendor_share_links",
    "print_pdf_exports",
    "thank_you_manager",
    "theme_presets"
  ]
}
```

### 5.2 Frontend Feature Gating (`src/components/` & UI Badges)
When a Basic user attempts to access a Pro or VIP feature (e.g. generating a vendor share link or printing a PDF roster):
1. The app presents a non-intrusive **Upgrade Drawer Modal**:
   - Displays feature highlights and price difference ($30 upgrade).
2. Clicking **"UPGRADE TO PRO"** opens Lemon Squeezy checkout prefilled with the user's `spreadsheetId`.
3. Lemon Squeezy webhook updates cell `Settings!B2` to `tier: "PRO"`, immediately unlocking features without data migration.

---

## 6. Related Documentation Sync
- 📘 [tech_spec.md](file:///d:/Development/sheet2vow/docs/tech_spec.md) (Section 3.4 Access Control & License Entitlements)
- 🗺️ [features_roadmap.md](file:///d:/Development/sheet2vow/docs/features_roadmap.md) (Phase 3 Monetization & Lemon Squeezy Integration)
