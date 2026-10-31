# Sheet2Suite Monarch Design System & Aesthetic Engine

The Sheet2Suite design system is built on the **Monarch Design Language** and **Editorial Utility** aesthetic—marrying the high-density precision of financial software with the elegance of bespoke editorial publishing.

---

## 1. Core Principles & Philosophy

1. **Spreadsheet Precision, Zero SaaS Clutter:** Replaces generic SaaS tropes (bloated bento grids, oversized pill badges, blurry drop shadows) with crisp hairline borders, dense typographic hierarchy, and tabular data discipline.
2. **Plain-Language Human Ergonomics:** Eliminates accounting and developer jargon from user-facing screens (e.g. "Left to spend" instead of "Remaining Allocation Cushion", "Guests & RSVPs" instead of "Relational Entity Registry").
3. **Tactile Touch Targets:** All interactive controls (buttons, segmented toggles, edit chips) enforce a minimum hitbox of $\ge 44\text{px}$–$48\text{px}$ on mobile viewports ($\le 768\text{px}$). Form inputs enforce a minimum height of $48\text{px}$ and $16\text{px}$ font size to prevent iOS Safari auto-zoom.

---

## 2. Typographic Hierarchy

Sheet2Suite employs a three-font typographic architecture:

| Font Role | Primary Font | Fallbacks | Usage |
|---|---|---|---|
| **Display / Editorial Serif** | `Newsreader` (`--font-serif`) | `Playfair Display`, `Georgia`, serif | Mastheads, major section titles, table names, celebratory cards |
| **Interface Sans** | `Inter` (`--font-sans`) | `-apple-system`, `BlinkMacSystemFont`, sans-serif | Form controls, input text, buttons, body copy, dialog content |
| **Technical Monospace** | `JetBrains Mono` / `Geist Mono` (`--font-mono`) | `Menlo`, `Monaco`, monospace | Numbers, currency amounts, dates, timestamps, status deltas, metric strip labels |

> Tabular numerals and slashed zeroes (`font-feature-settings: "tnum" 1, "zero" 1; font-variant-numeric: tabular-nums slashed-zero;`) are strictly enforced across all monetary figures and calculations.

---

## 3. Radii, Borders & Color Palette

- **Radii Discipline:** Clamped to strict low-radius corners (`rounded-[3px]`, `--border-radius-xs: 2px`, `--border-radius-sm: 2px`, `--border-radius-md: 3px`, `--border-radius-lg: 4px`).
- **Hairline Rules:** Elevated cards and panels utilize crisp 1px hairline rules (`border-slate-200` / `border-slate-800`) rather than fuzzy drop shadows.
- **Core Semantic Palette:**
  - **Canvas Paper:** Crisp paper white (`#FFFFFF`) or low-glare dark slate (`#0B0F17`).
  - **Structural Pane:** Off-white background pane (`#F8FAFC`) or elevated dark container (`#121824`).
  - **Ink:** Deep slate text and active action buttons (`#0F172A`).
  - **Reconciled / Paid:** Emerald green (`#059669` text, `#ECFDF5` background).
  - **Milestone / Alert:** Restrained champagne gold (`#D4AF37`) and ruby alert (`#EF4444`).

---

## 4. Multi-Theme Architecture

Themes are declared via root HTML attributes `data-style` and `data-theme` and defined in `src/app/theme.css` and `src/lib/themePresets.ts`:

### 4.1 Editorial Minimalist (`data-style="editorial"`)
- **Desktop Sidebar:** Contrasting ink slate background (`#090D16`), hairline borders (`#1E293B`), white text, crisp muted labels (`#94A3B8`), and dark elevated active nav highlights.
- **Content Area:** Crisp paper white background, Playfair Display serif headers, and subtle dark slate hairline rules.

### 4.2 Muted Neo-Brutalism (`data-style="neo-brutalism"`)
- **Borders & Shadows:** 2px–3px solid slate borders with hard zero-blur directional drop shadows (`3px 3px 0px 0px #121824` in light mode, `3px 3px 0px 0px #00ED64` in dark mode).
- **Feel:** High-contrast, tactile, engineered, featuring `Geist Mono` code tags and bold 2px borders.

### 4.3 Botanical Romance (`data-style="botanical-romance"`)
- **Desktop Sidebar:** Dominant rich forest green (`#1B4332`), `#25583E` hairline borders, and `#2D6A4F` active highlights.
- **Content Area:** Warm organic cream (`#FAF7F2`), crisp paper white (`#FFFFFF`), warm off-white pane (`#F4EFEA`), and deep earthy slate typography (`#1F2E26`).

---

## 5. Reusable Monarch UI Primitives

### 5.1 `<PageHeaderCard />` (`src/components/vow/PageHeaderCard.tsx`)
Standardized header component across modules featuring an editorial serif title, sans subtitle, count badge, integrated segment switcher (e.g., Reception vs Ceremony, Cards vs Table), and responsive action buttons.

### 5.2 `<PageMetricStrip />` (`src/components/vow/PageMetricStrip.tsx`)
Monarch Money-inspired hero metric strip rendering 3 to 4 operational indicators with uppercase monospace labels, large tabular figures, colored delta pills, and click-to-filter triggers. Reflows into a balanced 2x2 grid on mobile viewports ($\le 768\text{px}$).

### 5.3 `<SlideOverDrawer />` & `<MonarchForm />`
- **Slide-Over Panel ($\ge 641\text{px}$):** Right-hand slide-over inspector replacing popup modals. Includes adjacent record pager navigation (`↑ Previous` / `↓ Next`), backdrop blur, and sticky bottom action bar.
- **Bottom Sheet Drawer ($\le 640\text{px}$):** Automatically reflows into a native bottom sheet with touch drag handle, rounded top corners (`20px`), full-width inputs, and hardware safe-area padding.
- **Form Primitives:** `<DrawerSection>`, `<DrawerRow>`, `<DrawerField>`, `<PriorityPills>`, `<QuickDateChips>`, and `<QuickAssignChips>`.

---

## 6. Ambient Sync Indicator (`AmbientSyncIndicator.tsx`)

Routine spreadsheet synchronization is decoupled from floating popups to prevent screen clutter:
- **Location:** Docked in the sticky top masthead beside workspace controls.
- **States:**
  - **Saving:** Animated spinner with `"Saving..."` / `"Saving changes..."`.
  - **Saved:** Transitions smoothly to an emerald green check badge with `"Saved"` / `"Saved to Sheets"` and timestamp tooltip, before quietly fading to idle (`opacity: 0`) after 3.2s.
  - **Error:** Displays high-visibility retry badge with 1-click manual retry trigger.

---

## 7. Decoupled Toast Notification System (`ToastNotification.tsx`)

- **Scope Separation:** Routine auto-saves are handled by `AmbientSyncIndicator`. Floating toasts are strictly reserved for high-value milestone actions (e.g. export generated, link copied, session restored, network errors).
- **Aesthetic Refinement:** Frosted glass surface (`backdrop-filter: blur(16px)`), subtle 1px border, rounded squircle icon badges, and a bottom auto-dismiss duration progress bar.
- **Queue Discipline:** Enforces a strict maximum of **2 visible toasts** with message deduplication, mobile-safe bottom positioning at `calc(4.75rem + env(safe-area-inset-bottom, 0px))`, and smooth slide-out exit animations.
