# Technical Architecture Plan: Support Help Center

**Feature ID:** `[FEAT-001]`  
**Target Specification:** [`specs/support-help-center/spec.md`](spec.md)  
**Status:** `Approved`  

---

## 1. Technical Architecture Overview

The Support & Help Center is built as a server-rendered Next.js App Router page (`src/app/support/page.tsx`) with client-side interactive search, accordion filtering, and diagnostic mail dispatch. It leverages existing Monarch UI primitives (`<PageSearchInput />`, theme CSS custom properties) with zero external dependencies.

```
┌────────────────────────────────────────────────────────┐
│ Public Visitor / Active Planner                        │
│ Navigates to /support or /help                         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Next.js App Router Shell (src/app/support/page.tsx)    │
│ ├── Monarch Editorial Masthead                         │
│ ├── <PageSearchInput /> (Debounced Keyword Filter)     │
│ ├── Category Filter Pills Bar (All, Activation, etc.)  │
│ ├── Filtered Article Accordion List                    │
│ └── In-Page Diagnostic Contact Card                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Static Data Dictionary (src/data/supportArticles.ts)   │
│ - Structured guide articles, anchors, keywords         │
│ - Client-side telemetry compiler for mailto:           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Target Files & Component Architecture

### 2.1 File Inventory
| File Path | Action | Responsibility |
|---|---|---|
| `src/app/support/page.tsx` | Create | Main Help Center page component with search and accordion interactions |
| `src/data/supportArticles.ts` | Create | Centralized dictionary of support guides, FAQs, and categories |
| `src/proxy.ts` | Modify | Add `/help` rewrite rule mapping directly to `/support` |
| `src/app/page.tsx` | Modify | Add `Support` navigation link in top header and footer |
| `src/app/activate/page.tsx` | Modify | Add `Help` link in header and Step 0 order verification help callout |
| `src/components/settings/SettingsManager.tsx` | Modify | Link to `/support` from in-app Support & Help tab |

### 2.2 Component Hierarchy & Data Flow
```text
src/app/support/page.tsx (Client Component)
├── <SupportHeader />              # Editorial title, badge, and search input
├── <CategoryFilterBar />          # Category pills with active counts
├── <ArticleAccordionList />       # Filtered guides with expand/collapse and anchors
│   └── <ArticleAccordionCard />   # Individual guide card with markdown/rich formatting
└── <ContactSupportCard />         # Category dropdown, message, and diagnostic mailto
```

---

## 3. Data Schema & Models

### 3.1 Support Article Schema (`src/data/supportArticles.ts`)
```typescript
export type SupportCategory = 
  | 'activation' 
  | 'collaboration' 
  | 'sync' 
  | 'privacy' 
  | 'troubleshooting';

export interface SupportArticle {
  id: string;               // e.g. 'art-001'
  slug: string;             // URL anchor e.g. 'how-to-activate'
  category: SupportCategory;
  categoryLabel: string;    // e.g. 'Activation'
  title: string;            // e.g. 'How to Find Your Etsy Order Number'
  summary: string;          // Scannable 1-line overview
  keywords: string[];       // Search indexing tags
  content: string[];        // Step-by-step paragraphs / formatted instructions
  callout?: {
    type: 'tip' | 'info' | 'warning';
    text: string;
  };
}
```

### 3.2 Database & Sheets Impact
- **Database Collections:** None (Zero database mutations; static client-side guide delivery).
- **Google Sheets Tabs:** None (Purely informational knowledge base).

---

## 4. Routing & Proxy Rewrite

In `src/proxy.ts`, add the rewrite rule for `/help`:
```typescript
// Rewrite /help -> /support
if (pathname === '/help') {
  return NextResponse.rewrite(new URL('/support', request.url));
}
```

---

## 5. Security, Privacy & Performance Analysis

- **Zero-Dependency Footprint:** Uses standard React state (`useState`, `useMemo`), Lucide icons, and existing CSS classes. Zero runtime packages added.
- **Privacy Guarantees:** Telemetry generated in the contact card is computed exclusively client-side upon clicking the send button (Browser User Agent, Screen Dimensions, Timestamp). No tracking beacons, cookies, or remote logging.
- **SEO & Social Sharing:** Includes Next.js `metadata` title and description:
  - Title: *"Help Center & Knowledge Base — Sheet2Suite"*
  - Description: *"Guides, tutorials, and answers for activating and co-planning with Sheet2Suite."*

---

## 6. Theme & Responsive Styling

- Conforms to `globals.css` and `theme.css` tokens:
  - Container: Centered max-width container (`max-w-4xl mx-auto px-4 py-8`).
  - Cards: `bg-card border border-border rounded-[3px]`.
  - Typography: `Newsreader` serif masthead, `Inter` sans body, `Geist Mono` badges.
  - Mobile Touch Targets: $\ge 48\text{px}$ on category pills, inputs, and accordion headers.
