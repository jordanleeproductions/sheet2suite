# Sheet2Vow — Media, Music & Print Studio Specification

**Primary Components:** `src/components/MusicManager.tsx`, `src/components/PhotoShotListManager.tsx`, `src/components/PrintTemplatesModal.tsx`  
**Google Sheet Tabs:** `MUSIC` (Playlist & tracks, Cols A–F), `PHOTOS` (Shot list, Cols A–H), `GUESTBOOK` (Guest uploads, Cols A–G)

---

## 1. Wedding Playlist & Music Curation (`MusicManager.tsx`)

The Music module allows couples to curate soundtrack playlists across ceremony, cocktail hour, formal dances, and reception moments.

### 1.1 Dual View Mode (`CARDS` vs. `PLAYLIST TABLE`)
- **Visual Cards View:** Responsive track cards grid (`repeat(auto-fill, minmax(320px, 1fr))`) featuring album artwork thumbnails, occasion badges, and playback controls.
- **Tabular Playlist Ledger:** High-density spreadsheet-style table with Track #, sample play/pause trigger, song title, artist, occasion, priority, requester attribution, DJ cue notes, streaming links, and edit actions.

### 1.2 Docked Audio Mini-Player Bar
- Persistent bottom player dock active during 30-second iTunes audio preview playback.
- Features animated spinning vinyl disc icon, track metadata, interactive seekable scrubber with elapsed/total duration, play/pause controls, and direct streaming shortcuts.

### 1.3 Monarch Slide-Over Track Inspector
- Slide-over inspector panel featuring live debounced iTunes Search API catalog lookup.
- Selecting a search result auto-populates title, artist, album name, artwork URL, and audio preview link.
- Includes `<PriorityPills>` (*Must Play*, *Play If Time*, *Banned*), DJ cue notes textarea, and adjacent record navigation (`↑ Previous` / `↓ Next`).

### 1.4 DJ Clipboard Export & Vendor Email
- **`COPY SETLIST`:** Copies a cleanly formatted, plain-text chronological rundown of all playlists to clipboard for instant pasting into external DJ management platforms (Vibo, HoneyBook, Google Docs).
- **`EMAIL DJ`:** Generates a structured `mailto:` link pre-populating the full setlist in the couple's native email client.

### 1.5 Launch Status: Guest Song Request Portal (`[MUSIC-4]`)
> ⚠️ **Initial Launch Status: Sidelined / Disabled**  
> Guest song request portal links (`/request-song/[token]`), inline approval banners, and approval queues are hidden for the initial release to ensure zero spam risk. The core Curated Music Playlist is 100% operational.

---

## 2. Photography Shot List (`PhotoShotListManager.tsx`)

The Photography Shot List tracks mandatory ceremony and reception photography moments.

### 2.1 Core Shot List Management
- Fields: `Shot ID`, `Description`, `Location`, `Shot Time`, `Included People`, `Status`, `Priority`, `Notes`.
- Bidirectionally maps UI priorities (*Must Have*, *Nice To Have*, *Optional*) to Google Sheets `SETTINGS!$E$2:$E$50` Priority Levels (*High*, *Medium*, *Low*).
- Interactive checkoff toggles and photographer email generator (`EMAIL LIST`).

### 2.2 Launch Status: Photo & Video Guestbook & QR Generator
> ⚠️ **Initial Launch Status: Sidelined / Disabled**  
> The secondary **Photo & Video Guestbook** tab, guest upload portal (`/upload/[token]`), and in-app **QR Code generator** have been sidelined for initial launch. The core Photographer Shot List is fully operational.

---

## 3. Print & Export Studio (`PrintTemplatesModal.tsx`)

> ⚠️ **Initial Launch Status: Sidelined / Disabled**  
> Print Studio triggers across the sidebar utility rail, mobile drawer, top header, and module toolbars have been hidden for initial launch. Core template components are preserved in the codebase for Phase 2 hardening.

### 3.1 CSS Print Engine
- High-performance CSS `@media print` rules:
  ```css
  @page {
    size: A4 portrait;
    margin: 12mm;
  }
  ```
- Isolates `#print-studio-paper-content` while hiding navigation rails, headers, and buttons.

### 3.2 Preserved Print Templates
1. **Escort & Folded Place Cards Template:** 2-column grid for attending guests displaying Guest Name, Table Assignment, Meal Selection icon, and fold guidelines.
2. **Table Tent Cards Template:** Table signs displaying Table Name, seat count, and assigned guest list with meal selections.
3. **Day-Of Timeline Roster Template:** Chronological schedule grouped by time block, filterable by responsibility role.
4. **Emergency Vendor Directory Template:** Single-page emergency vendor contact sheet listing Category, Business Name, Contact Person, Phone, Email, and Arrival Notes.
