# Sheet2Vow UX & UI Design System

Sheet2Vow supports dual customizable style themes (**Editorial Minimalist** and **Muted Neo-Brutalism**), each supporting **Light** and **Dark** mode options. Theme selection is stored in `localStorage` (`s2v_style_theme` and `s2v_theme`) and synced to root HTML `data-style` and `data-theme` attributes.

---

## 1. Theme: Editorial Minimalist (`[data-style='editorial']`)
The **Editorial Minimalist** style provides an elegant, high-end, print-publication feel tailored for wedding planning, balancing generous whitespace with refined typography and soft drop shadows.

### Typography
- **Header Font:** `'Inter'`, sans-serif (`var(--font-header, var(--font-sans))`) - Used for primary headings, brand titles, and hero titles.
- **Body Font:** `'Inter'`, sans-serif (`var(--font-sans)`) - Used for form fields, cards, and data tables.
- **Accent & Monospace Font:** `'Geist Mono'`, monospace (`var(--font-mono)`) - Used for numerical data, currency display, subtitles, status badges, and structured tables.

### Color Palette
- `var(--color-bg)`: `#ffffff` (Light Canvas) / `#121212` (Dark)
- `var(--color-primary)`: `#0d1b2a` (Corporate Navy) / `#f5f5f5` (Dark Accent)
- `var(--color-text)`: `#2f3e46` (Deep Slate) / `#e0e0e0` (Dark Text)
- `var(--color-muted)`: `#708090` (Soft Slate Gray)
- `var(--color-highlight)`: `#f7e7ce` (Polished Champagne Gold)

---

## 2. Theme: Muted Neo-Brutalism (`[data-style='neo-brutalism']`)
Inspired by MongoDB & Gumroad design systems, **Muted Neo-Brutalism** feels tactile, bold, geeky, and minimal—combining structural confidence with a grounded dark slate and forest green palette.

### Visual Principles & UI Patterns
- **Borders:** Thick dark slate borders (`--border-width: 2px`).
- **Hard Drop Shadows:** Zero-blur solid directional drop shadows (`3px 3px 0px 0px #121824` in light mode, `3px 3px 0px 0px #00ED64` in dark mode).
- **Corner Radii:** Micro-rounded corners (`--border-radius-sm: 2px`, `--border-radius-md: 4px`, `--border-radius-lg: 6px`).
- **Typography:** Heavy geometric sans-serif headings (`var(--font-sans)`) paired with monospace metrics & code tags (`var(--font-mono)`).

### Color Palette
- `var(--color-bg)`: `#F4F4F0` (Warm Off-White) / `#0B0F19` (Rich Dark Charcoal Base)
- `var(--color-primary)`: `#121824` (Dark Charcoal Slate) / `#13AA52` (Deep Forest Green Accent)
- `var(--color-text)`: `#121824` (High Contrast Slate) / `#F4F4F0` (Dark Mode Off-White Text)
- `var(--color-highlight)`: `#00ED64` (Electric Lime Highlight)
- `var(--color-gold-dark)`: `#13AA52` (Deep Forest Green)

---

## Theme Switcher Architecture
Theme attributes are managed on the root `<html>` element:
- `data-style="editorial"` or `data-style="neo-brutalism"`
- `data-theme="light"` or `data-theme="dark"`

Users can configure their preferred combination inside the dashboard **Settings** panel.
