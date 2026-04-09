# Wall Calendar

A richly interactive, wall-calendar-style web application built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**. Every piece of state is persisted to `localStorage` — no backend, no sign-in required.

---

## Table of Contents

1. [Demo & Overview](#1-demo--overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Getting Started](#4-getting-started)
5. [Feature Reference](#5-feature-reference)
   - 5.1 [Hero Header — Seasonal Imagery](#51-hero-header--seasonal-imagery)
   - 5.2 [Next-Holiday Countdown Pill](#52-next-holiday-countdown-pill)
   - 5.3 [Year Progress Bar](#53-year-progress-bar)
   - 5.4 [Calendar Grid](#54-calendar-grid)
   - 5.5 [Holiday Display](#55-holiday-display)
   - 5.6 [Date Range Selection](#56-date-range-selection)
   - 5.7 [Date Stamps (Colour Markers)](#57-date-stamps-colour-markers)
   - 5.8 [Notes Panel](#58-notes-panel)
   - 5.9 [Month Notes Tab](#59-month-notes-tab)
   - 5.10 [Date Range Notes Tab](#510-date-range-notes-tab)
   - 5.11 [Note Export](#511-note-export)
   - 5.12 [Monthly Statistics](#512-monthly-statistics)
   - 5.13 [Theme Switcher](#513-theme-switcher)
   - 5.14 [Mini Month Previews](#514-mini-month-previews)
   - 5.15 [Page-Flip Animation](#515-page-flip-animation)
   - 5.16 [Keyboard Shortcuts](#516-keyboard-shortcuts)
6. [localStorage Schema](#6-localstorage-schema)
7. [Component Architecture](#7-component-architecture)
8. [Custom Hooks](#8-custom-hooks)
9. [State Management](#9-state-management)
10. [Theming System](#10-theming-system)
11. [Holiday Data](#11-holiday-data)
12. [Responsive Design](#12-responsive-design)

---

## 1. Demo & Overview

Wall Calendar renders as a single-page, full-featured physical-wall-calendar metaphor inside the browser. It is intentionally designed to feel like holding a real wall calendar — complete with wire binding, page-flip transitions, a large seasonal photograph or illustration at the top, and lined notebook paper for notes on the left.

Key design principles:

- **Zero backend.** Everything lives in `localStorage`. Open it in two tabs and both work independently.
- **Always-on persistence.** Notes, theme choice, and date stamps survive hard-refreshes.
- **Progressive disclosure.** The default view is clean; richer features (range notes, stamps, holiday list) reveal themselves on demand.
- **Keyboard-first.** Every common action has a keyboard shortcut.

---

## 2. Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| UI Library | React 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12.38 |
| Date utilities | date-fns 4.1 |
| Icons | Lucide React 1.7 |
| Class merging | clsx 2.1 + tailwind-merge 3.5 |
| Font | Geist Sans + Geist Mono (via `next/font/google`) |

All dependencies are **client-side only** — the app ships as a static Next.js export with no server-side data fetching.

---

## 3. Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout; loads Geist fonts; sets page metadata
│   ├── page.tsx            # Single route — renders <WallCalendar />
│   └── globals.css         # Tailwind import + CSS custom properties (theme vars)
│
├── lib/
│   └── utils.ts            # cn() helper — merges clsx + tailwind-merge
│
└── components/
    └── WallCalendar/
        ├── index.tsx               # Root orchestrator — wires all pieces together
        ├── types.ts                # Shared TypeScript interfaces & action types
        │
        ├── CalendarHeader.tsx      # Wire binding + hero image/banner + month nav + countdown
        ├── SeasonalBanner.tsx      # Twelve inline SVG seasonal illustrations (fallback art)
        ├── YearProgressBar.tsx     # Animated year-progress strip
        ├── CalendarGrid.tsx        # 8-column grid (week nums + 7 days) + holiday legend
        ├── DateCell.tsx            # Individual date cell — selection, holiday, stamps, copy
        ├── HolidayTooltip.tsx      # Hover tooltip wrapper component
        ├── NotesPanel.tsx          # Left-panel notes — Month tab + Ranges tab + stats + export
        ├── MiniMonthPreview.tsx    # Prev/next month miniature grids in the footer
        ├── ThemeSwitcher.tsx       # Palette button + colour-theme picker dropdown
        │
        ├── useCalendarState.ts     # useReducer-based calendar state (navigation + selection)
        ├── useNotes.ts             # Per-key localStorage note CRUD
        ├── useStoredRangeNotes.ts  # Scans localStorage for all range notes in a given month
        ├── useStarredDates.ts      # Colour-stamp persistence and cycling logic
        ├── useTheme.ts             # Theme persistence + CSS variable injection
        │
        ├── constants/
        │   └── holidays.ts         # US holiday list for 2025–2026
        └── utils/
            └── dateHelpers.ts      # getMonthGrid, formatDateKey, getRangeKey, getMonthlyKey
```

---

## 4. Getting Started

### Prerequisites

- Node.js ≥ 18
- npm, yarn, or pnpm

### Install & run

```bash
# Clone the repo
git clone <repository-url>
cd wall-calendar

# Install dependencies
npm install

# Start the development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Serve the production build
npm start
```

### Environment

No `.env` file is required. The app has no server-side code and makes no external API calls at runtime. Unsplash images are loaded client-side directly by the browser; if they fail, the SVG seasonal banners display automatically instead.

---

## 5. Feature Reference

### 5.1 Hero Header — Seasonal Imagery

**File:** `CalendarHeader.tsx`, `SeasonalBanner.tsx`

The top portion of the calendar mimics a physical wall calendar with:

#### Wire Binding

Thirty-two metallic wire loops rendered as stacked `div` elements with gradient shading to simulate a 3-D spiral binding. The holes beneath each loop are dark circles with an inset shadow. The binding bar uses an inset box-shadow to simulate depth.

#### Seasonal Background System (three layers, back to front)

| Layer | Source | Always visible? |
|---|---|---|
| 1 — Gradient | Hard-coded CSS `linear-gradient` per month | Yes — always |
| 2 — SVG Illustration | Inline React SVG art per month | Yes — always |
| 3 — Photo | Unsplash URL loaded via `<img>` | Only if network request succeeds |

The Unsplash photo uses `onError` to set `opacity: 0` if the image fails, revealing the gradient and SVG layers behind it. No layout shift occurs.

#### Gradient palette (one per month)

| Month | Palette |
|---|---|
| January | Deep winter blue → sky blue |
| February | Dark rose → valentine pink |
| March | Forest green → lime green |
| April | Olive green → bright lime |
| May | Deep magenta → blush pink |
| June | Dark navy → sky blue |
| July | Dark amber → gold yellow |
| August | Deep teal → bright mint |
| September | Burnt red → warm orange |
| October | Very dark brown → pumpkin orange |
| November | Navy slate → cool grey |
| December | Midnight black → deep blue |

#### SVG Seasonal Illustrations

Twelve hand-drawn inline SVG illustrations render when the photo is absent:

| Month | Scene description |
|---|---|
| January | Snowflakes with crystalline 8-arm structure + scattered snow dots + snow-covered ground ellipses |
| February | Floating hearts in varied sizes and rotations + radial glow + sparkle dots |
| March | Cherry blossom branch with sub-branches + white blossom clusters + falling petal ellipses |
| April | 30 diagonal rain streaks + two ground puddles with ripple rings + umbrella silhouette |
| May | Rolling hills + wildflowers on stems with 5-petal geometry + butterfly silhouette |
| June | 12-ray sun with inner/outer circle + rolling wave curves + beach ground |
| July | 5 multi-ray firework bursts from different canvas positions + trailing spark dots |
| August | Layered mountain polygons + pine tree silhouettes (triangular) + star field overhead |
| September | 11 maple leaf shapes with custom cubic-bezier paths and visible leaf veins |
| October | Full moon with halo glow + bare tree with branching lines + 4 bat wing shapes + stars |
| November | 3-layer misty hill paths + 5 bare trees with sub-branches + distant bird M-path silhouettes |
| December | 20 stars + 6 detailed snowflakes + snow-hill curves + Christmas tree polygon |

#### Navigation Controls

- **Prev/Next chevron buttons** inside a diagonally clipped accent-coloured panel (`clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)`) pinned to the bottom-right corner
- **Today button** — pill-shaped frosted button in the top-left, hidden when not needed
- The month/year text label uses `AnimatePresence` with a slide-x transition on month change

---

### 5.2 Next-Holiday Countdown Pill

**File:** `CalendarHeader.tsx` → `getNextHoliday()`

A frosted-glass pill (`bg-black/40 backdrop-blur-md`) horizontally centred in the hero image always shows the next US holiday:

```
Next holiday  ·  Memorial Day  ·  46d
```

Logic detail:
1. Filters `holidays2025_2026` to entries where `date >= today`
2. Sorts ascending by date string
3. Takes the first result
4. Computes `differenceInCalendarDays(holidayDate, today)` using date-fns
5. Renders `Today!` when 0 days away, `Tomorrow` when 1, otherwise `Xd`

---

### 5.3 Year Progress Bar

**File:** `YearProgressBar.tsx`

A slim horizontal strip between the header and the calendar grid showing how much of the current calendar year has elapsed.

- Reads `getDayOfYear(today)` from date-fns
- Accounts for leap years (366-day years)
- Renders as an accent-gradient-filled rounded track
- A pulsing dot sits on the leading edge, coloured `--cal-accent` with a light ring shadow
- Labels: `Day 99` on the left, `27% of 2026` on the right in bold accent colour

The bar always reflects the real-world current date regardless of which month is displayed.

---

### 5.4 Calendar Grid

**File:** `CalendarGrid.tsx`

#### Layout — 8-Column Grid

The grid uses `gridTemplateColumns: '28px repeat(7, 1fr)'`:

- **Column 1 (28 px wide):** ISO week number labels (`W1` … `W53`)
- **Columns 2–8:** Monday through Sunday date cells

The day-of-week header row follows the same 8-column template with an empty first cell for alignment.

#### Week Row Grouping

Dates returned by `getMonthGrid()` are chunked into arrays of 7 before rendering. Each chunk is its own CSS grid row with the week number prepended. This ensures the week label is always vertically aligned with its row regardless of cell height variation caused by holidays.

#### Today's Week Highlight

When any date in a row satisfies `isToday()`, an `absolute` overlay div with `--cal-accent-light` at 40% opacity is rendered behind the entire row, creating a subtle horizontal highlight band behind the current week.

#### Week Number Styling

- Week containing today: accent colour
- All other weeks: `text-gray-300` — deliberately subtle so it does not compete with the date numbers

#### Work Days Left Badge

When the displayed month is the **current real-world month**, a badge appears in the top-left of the grid area:

```
12 work days left
```

This uses `eachDayOfInterval` from date-fns filtered by `isWeekend()` to count Monday–Friday days from today through the end of the month.

#### Grid Pointer Leave

The outer grid container has `onPointerLeave={onClearHover}`. When the mouse exits the entire grid area, `hoverDate` is immediately cleared, preventing the live range preview from "sticking" after the cursor moves into the notes panel.

---

### 5.5 Holiday Display

**File:** `DateCell.tsx`, `constants/holidays.ts`

#### Visual treatment

| Element | National holiday | Observance |
|---|---|---|
| Top-bar stripe | 3 px red (`bg-red-500`) below top edge | 3 px amber (`bg-amber-400`) |
| Date circle | Red text + `ring-2 ring-red-300` + `bg-red-50` background | Amber text + `ring-2 ring-amber-300` + `bg-amber-50` |
| Name label | 8 px bold red text below the circle | 8 px bold amber text |
| Cell height | `min-h-[62px]` — taller than the normal `44px` | Same |
| Hover tooltip | Full holiday name in a dark bubble with arrow | Same |

#### Abbreviated names

Holiday names are mapped to short labels that fit within the small cell width:

| Full Name | Short Label |
|---|---|
| Martin Luther King Jr. Day | MLK Day |
| Presidents' Day | Presidents |
| Valentine's Day | Valentine |
| St. Patrick's Day | St. Pat's |
| Independence Day | July 4th |
| Thanksgiving Day | Thanksgvng |
| New Year's Eve | New Yr Eve |
| All others | First two words of the name |

#### Holiday Legend

A collapsible section at the bottom of the grid shows a colour key and an expandable list of all holidays in the currently displayed month:

```
● National   ● Observance              ▼ 3 holidays
```

When expanded:
```
● Apr 5   Easter Sunday
● Apr 20  ...
```

Only rendered when there is at least one holiday in the current month.

---

### 5.6 Date Range Selection

**File:** `useCalendarState.ts`, `DateCell.tsx`

Clicking two dates on the grid selects a range. The selection is two-phase:

| Phase | State | Behaviour |
|---|---|---|
| `idle` | No dates selected | First click sets `start`, enters `selecting-end` phase |
| `selecting-end` | Start set, no end | Hovering over dates previews the range live; second click sets `end` |
| Complete | Start + End set | Range locked; notes panel auto-switches to Ranges tab |

#### Visual range rendering

Each `DateCell` independently computes its visual state from four booleans:

- **`isStart`** — renders solid accent-coloured filled circle
- **`isEnd`** — same treatment as start
- **`isInRange`** — date falls between confirmed start and end
- **`isPreviewRange`** — date falls between start and current hover date (live preview only)

The pill-strip connection background is drawn by two absolute `div` halves inside each cell (`hasLeftConnection` fills the left half, `hasRightConnection` fills the right half). Adjacent cells' halves meet at cell boundaries to create a seamless pill shape without any wrapper element.

#### Clicking before the start date

If the user moves the mouse to an earlier date and clicks during `selecting-end`, the selection restarts from that earlier date rather than creating an invalid reversed range.

#### Single-day selection

Clicking the same date twice creates a `start === end` range, treated as a single-day note entry.

#### Clearing selection

- **✕ Clear button** — appears top-right of the grid whenever any selection exists
- **`Escape` key** — clears from anywhere on the page (when not focused on an input)
- **Month navigation** — automatically clears selection on every month change

---

### 5.7 Date Stamps (Colour Markers)

**File:** `useStarredDates.ts`, `DateCell.tsx`

**Shift + click** any date to cycle through six colour stamps. Each click advances to the next colour; clicking past the last colour removes the stamp entirely.

| Cycle step | Colour | Hex |
|---|---|---|
| 1 | Red | `#ef4444` |
| 2 | Orange | `#f97316` |
| 3 | Yellow | `#eab308` |
| 4 | Green | `#22c55e` |
| 5 | Blue | `#3b82f6` |
| 6 | Purple | `#a855f7` |
| 7 (wraps) | Removed | — |

#### Visual appearance

The stamp renders as a **10 px dot** in the top-right corner of the date circle with:
- A white ring (`ring-1 ring-white`) to separate it from the date background
- A drop shadow
- It never overlaps the date number

#### Persistence

Stamps are saved to `localStorage` under `wallcal_starred_dates` as a plain JSON object:

```json
{
  "2026-04-09": "#22c55e",
  "2026-04-14": "#ef4444"
}
```

Stamps survive page refreshes, browser restarts, and month navigation. They are global — not per-month.

---

### 5.8 Notes Panel

**File:** `NotesPanel.tsx`, `useNotes.ts`

The left column (40% width on desktop, full-width on mobile) renders a styled **legal notepad** with:

- Yellow notepad background (`#FEFCE8`) with a subtle inner shadow
- A red push-pin at the top center
- Two faint red margin lines on the left (legal-pad aesthetic)
- Two navigation tabs: **Month** and **Date Ranges**
- A bottom statistics bar
- An export button per section

The panel automatically switches to the **Date Ranges** tab when a date range is selected, and back to **Month** when the selection is cleared.

---

### 5.9 Month Notes Tab

**File:** `NotesPanel.tsx` → `MonthNotesTab`

Stores general notes scoped to the entire displayed month (e.g. `April 2026 Notes`).

**Storage key:** `wallcal_notes_general_YYYY-MM`

#### Note-line keyboard behaviour

| Key | Action |
|---|---|
| `Enter` | Saves the current line; moves focus to the next line or creates a new one |
| `Backspace` on empty line | Deletes the empty line; moves focus to the previous line |

Focus is managed via a `Map<noteId, HTMLInputElement>` ref. When a new note is added, a `useEffect` detects the length increase and focuses the last input after 30 ms — avoiding direct DOM queries.

#### Initial state

On the first visit to any month, 5 empty note lines are pre-filled to give the notepad a ruled-paper look even before any text is entered.

---

### 5.10 Date Range Notes Tab

**File:** `NotesPanel.tsx` → `RangeNotesTab`, `useStoredRangeNotes.ts`

Displays **all** previously saved date-range notes that overlap with the currently displayed month. This is the core "always visible" feature: once you add notes for any date range, they reappear automatically every time you navigate to that month.

#### Active selection card

When a range is actively selected on the calendar grid, an **Active Selection Card** appears at the top of the Ranges tab with:
- Accent-coloured border and tinted background
- Range label (e.g. `Apr 5 – Apr 10 (active selection)`)
- Fully editable `NoteList`
- Per-range Export button

**Storage key:** `wallcal_notes_range_YYYY-MM-DD_YYYY-MM-DD`

#### Saved ranges accordion

All other stored ranges for the month appear below as collapsible accordion items, sorted by this priority:

1. **Ranges containing today** — always first, with a `TODAY` badge
2. **Closest to today** — sorted by minimum distance from today to either the start or end date
3. Ranges with zero content (all lines empty) are hidden automatically

Each accordion item shows:
- Date range label (e.g. `Apr 5 – Apr 10, 2026`)
- `TODAY` badge if applicable
- `done/total` note count
- Expand/collapse chevron
- When expanded: fully editable note list + Export button

#### Cross-month ranges

A date range spanning multiple months (e.g. March 29 – April 5) appears in the Ranges tab of **both months**.

---

### 5.11 Note Export

**File:** `NotesPanel.tsx` → `exportNotes()`

An **Export** button appears on:
- The bottom of the Month Notes tab
- The header of the Active Selection card
- The expanded footer of each accordion range item

Clicking it downloads a `.txt` file using the Blob/`createObjectURL` API. Empty lines are excluded. Format:

```
April 2026 Notes
────────────────
[x] Book dentist appointment
[ ] Call the landlord
[ ] Review Q1 report
```

Completed notes are marked `[x]`, incomplete notes `[ ]`. The filename is derived from the section title with special characters replaced by underscores (e.g. `april_2026_notes.txt`).

---

### 5.12 Monthly Statistics

**File:** `NotesPanel.tsx` → `StatsBar`

A compact statistics strip at the bottom of the Month Notes section:

```
📊  3/7 done (43%)  ·  9 work days left  ·  21 days left
```

| Stat | How it is calculated |
|---|---|
| `X/Y done` | Notes with non-empty text that are marked complete / total non-empty notes |
| `(pct%)` | `completed / total × 100`, rounded to the nearest integer |
| `work days left` | Monday–Friday days from today to end-of-month, current month only |
| `days left` | Calendar days from today to end-of-month, current month only |

The stats bar is hidden for past or future months where "days remaining" is not meaningful.

---

### 5.13 Theme Switcher

**File:** `ThemeSwitcher.tsx`, `useTheme.ts`

A `Palette` icon button in the top-right corner of the calendar opens a dropdown menu with four colour themes.

| Theme | Accent hex |
|---|---|
| Sky Blue (default) | `#1A9EE2` |
| Coral | `#E86D4A` |
| Forest Green | `#2D9E5F` |
| Deep Purple | `#7C5CBF` |

Selecting a theme:
1. Calls `document.documentElement.style.setProperty()` for `--cal-accent`, `--cal-accent-light`, and `--cal-accent-dark`
2. Saves the theme name to `localStorage` under key `wallcal_theme`
3. Restores on next page load

Because the entire UI reads from CSS custom properties, the whole application re-colours with a **single CSS repaint** — no React re-renders required.

---

### 5.14 Mini Month Previews

**File:** `MiniMonthPreview.tsx`

The bottom footer (visible only on `lg` screens and above) shows two miniature month grids side-by-side:

- **Prev** — the month preceding the displayed month
- **Next** — the month following the displayed month

Each mini grid:
- Renders the full `getMonthGrid()` date array at 9 px text
- Highlights today with a solid accent-coloured filled circle
- Greys out dates from adjacent months (`text-gray-200`)
- Is fully clickable — clicking navigates to that month with the appropriate flip direction

---

### 5.15 Page-Flip Animation

**File:** `index.tsx`

Month transitions use a 3-D `rotateX` flip that simulates a wall calendar page being peeled off:

| Direction | Entry (`initial`) | Exit (`exit`) |
|---|---|---|
| Forward (next month) | `rotateX: -90°` — page arrives from behind | `rotateX: +90°` — page flips away forward |
| Backward (prev month) | `rotateX: +90°` | `rotateX: -90°` |

Technical details:
- `perspective: 2000px` on the outer container gives realistic depth
- `transformOrigin: 'top center'` makes the page appear to flip from the wire binding
- `backfaceVisibility: 'hidden'` prevents the reverse face from flashing
- Framer Motion `AnimatePresence mode="wait"` ensures the old page fully exits before the new one enters
- Spring animation with `bounce: 0.1` adds a subtle organic settle at the end

---

### 5.16 Keyboard Shortcuts

**File:** `index.tsx` → global `keydown` `useEffect`

A hint bar at the very bottom of the calendar (desktop only) lists all shortcuts. The global listener is suppressed when an `<input>` or `<textarea>` element is focused to avoid firing during note editing.

| Shortcut | Action |
|---|---|
| `→` Arrow Right | Navigate to the next month |
| `←` Arrow Left | Navigate to the previous month |
| `Escape` | Clear the current date range selection |
| `⌘ / Ctrl` + `↑` Arrow Up | Jump to today's month |
| `Shift` + click (on a date) | Cycle the date's colour stamp (6 colours then clear) |
| `⌘ / Ctrl` + click (on a date) | Copy the date string (e.g. `April 9, 2026`) to clipboard |
| `Enter` (inside a note input) | Save the current line and move focus to the next line or create a new one |
| `Backspace` on an empty note line | Delete the empty line and move focus to the previous line |

The `⌘/Ctrl + click` action shows a **"Copied!"** flash tooltip for 1.5 seconds directly above the clicked date cell to confirm the action.

---

## 6. localStorage Schema

All keys are prefixed with `wallcal_` to avoid collisions with other applications using the same origin.

| Key | Value type | Description |
|---|---|---|
| `wallcal_theme` | `string` | Saved theme name e.g. `"Sky Blue"` |
| `wallcal_notes_general_YYYY-MM` | `Note[]` (JSON array) | Monthly notes — one entry per calendar month |
| `wallcal_notes_range_YYYY-MM-DD_YYYY-MM-DD` | `Note[]` (JSON array) | Notes for a specific date range — key encodes start and end date |
| `wallcal_starred_dates` | `Record<string, string>` (JSON object) | Maps date keys (`YYYY-MM-DD`) to hex colour strings |

### Note object shape

```typescript
interface Note {
  id: string;           // Generated by crypto.randomUUID()
  text: string;         // The note content (max 200 characters)
  createdAt: string;    // ISO 8601 date-time string
  isCompleted?: boolean; // Defaults to false
}
```

### Data isolation

Each month and each date range gets its own `localStorage` key. There is no global notes store or sync — data accumulates silently. Notes are never automatically deleted. To clear data, use the browser's DevTools Application → Local Storage panel.

---

## 7. Component Architecture

```
WallCalendar (index.tsx)
│
├── ThemeSwitcher
├── CalendarHeader
│   └── SeasonalBanner                (SVG art, z-index 0 behind photo)
├── YearProgressBar
│
└── [AnimatePresence + motion.div]    (3-D page-flip wrapper)
    │
    ├── NotesPanel
    │   ├── MonthNotesTab
    │   │   └── NoteList              (shared editable list component)
    │   ├── RangeNotesTab
    │   │   └── RangeNoteEditor ──→ NoteList
    │   ├── ActiveRangeCard ──────→ NoteList
    │   └── StatsBar
    │
    └── CalendarGrid
        ├── [week rows]
        │   └── DateCell × 7
        │       └── HolidayLabel      (inline tooltip)
        └── HolidayLegend             (collapsible)

Footer:
├── MiniMonthPreview (Prev)
├── MiniMonthPreview (Next)
└── ShortcutHint
```

---

## 8. Custom Hooks

### `useCalendarState` — `useCalendarState.ts`

```typescript
const { state, dispatch } = useCalendarState();

state: {
  currentYear: number,
  currentMonth: number,          // 0-indexed (January = 0)
  selectedRange: {
    start: Date | null,
    end: Date | null,
  },
  hoverDate: Date | null,        // live preview date during selection
  selectionPhase: 'idle' | 'selecting-end',
}
```

Manages all calendar navigation and date selection via `useReducer`.

| Dispatched action | Effect |
|---|---|
| `NEXT_MONTH` | Advances month by 1; wraps year; clears selection, hover |
| `PREV_MONTH` | Decrements month by 1; wraps year; clears selection, hover |
| `GO_TO_TODAY` | Jumps to the real-world current month; clears all |
| `CLICK_DATE` | Phase-aware: first click sets start + enters selecting-end; second click sets end |
| `SET_HOVER_DATE` | Updates hoverDate only when `selectionPhase === 'selecting-end'` |
| `CLEAR_HOVER` | Immediately nulls `hoverDate` |
| `CLEAR_SELECTION` | Resets range, phase, and hover to defaults |

---

### `useNotes` — `useNotes.ts`

```typescript
const { notes, isLoaded, addNote, updateNote, toggleNote, removeNote } = useNotes(storageKey);
```

- Loads notes from `localStorage` on mount and whenever `storageKey` changes
- Writes back to `localStorage` on every mutation
- Pre-populates 5 empty lines on first load (ruled-paper aesthetic)
- All functions are wrapped in `useCallback` to prevent unnecessary child re-renders
- Fully SSR-safe (`window` guard returns `[]` during server rendering)

---

### `useStoredRangeNotes` — `useStoredRangeNotes.ts`

```typescript
const { rangeNotes, refresh } = useStoredRangeNotes(year, month);

// StoredRangeNote shape:
{
  rangeKey: string,   // "range_YYYY-MM-DD_YYYY-MM-DD"
  start: Date,
  end: Date,
  notes: Note[],
}
```

On mount, iterates all `localStorage` keys matching `wallcal_notes_range_*`, parses the date range from each key, and filters to ranges that **overlap** with the given month/year. "Overlap" includes:
- Range starts inside the month
- Range ends inside the month
- Range completely spans the month (start before, end after)

Results are sorted: today-containing ranges first, then by proximity. Ranges with all-empty notes are excluded. `refresh()` re-runs the scan (called after range notes are edited inline).

---

### `useStarredDates` — `useStarredDates.ts`

```typescript
const { starred, toggleStamp, getStamp } = useStarredDates();
```

Reads `wallcal_starred_dates` from `localStorage` on mount. `toggleStamp(dateKey)` cycles through `STAMP_COLORS` (6 colours) and removes the stamp on the 7th call. `getStamp(dateKey)` returns the hex colour string or `undefined`.

---

### `useTheme` — `useTheme.ts`

```typescript
const { theme, setTheme, isHydrated } = useTheme();
```

`isHydrated` prevents a flash of the default theme during SSR hydration. On the client, `theme` is initialised from `localStorage` before the first render. Setting a new theme calls `document.documentElement.style.setProperty` for all three accent CSS variables.

---

## 9. State Management

The application uses a **three-tier state model** with no global context provider or external store:

| Tier | Mechanism | Scope | Persistence |
|---|---|---|---|
| Navigation & selection | `useReducer` in `useCalendarState` | In-memory per session | Lost on refresh |
| Notes content | `useState` + `localStorage` in `useNotes` | Per storage key | Permanent |
| Stamps & theme | `useState` + `localStorage` in dedicated hooks | Global across months | Permanent |

Props flow downward from `WallCalendar` (index.tsx) to child components directly. No context is used, keeping data flow explicit and debuggable.

### Stale state prevention

Three specific guards are in place:

1. **Month navigation** (`NEXT_MONTH`, `PREV_MONTH`, `GO_TO_TODAY`) always clears `selectedRange`, `selectionPhase`, and `hoverDate` to prevent stale selections appearing after navigation.

2. **`SET_HOVER_DATE` is a no-op** when `selectionPhase !== 'selecting-end'` — prevents the live preview from activating when browsing without selecting.

3. **`onPointerLeave` on the grid container** dispatches `CLEAR_HOVER` — prevents the range preview from "sticking" when the mouse moves from the grid into the notes panel.

---

## 10. Theming System

CSS custom properties on `:root` drive all colour decisions across the entire application:

```css
:root {
  --cal-accent:       #1A9EE2;   /* primary interactive colour */
  --cal-accent-light: #DAEEF9;   /* 10 % tint for backgrounds and hover states */
  --cal-accent-dark:  #0E6FA3;   /* darker shade used in gradient starts */
  --cal-wire:         #9CA3AF;   /* wire binding accent */
}
```

Tailwind uses these via arbitrary-value syntax: `bg-[var(--cal-accent)]`, `text-[var(--cal-accent)]`, etc.

Switching theme calls:
```typescript
document.documentElement.style.setProperty('--cal-accent', theme.accent);
document.documentElement.style.setProperty('--cal-accent-light', theme.accentLight);
document.documentElement.style.setProperty('--cal-accent-dark', theme.accentDark);
```

Because everything reads from these three variables, a theme switch triggers a **single browser repaint** — zero React re-renders.

---

## 11. Holiday Data

**File:** `constants/holidays.ts`

The dataset covers all major US holidays for **2025** and **2026**. Each entry is:

```typescript
interface HolidayEvent {
  date: string;  // "YYYY-MM-DD"
  name: string;
  type: 'national' | 'observance';
}
```

| Type | Count | Visual treatment |
|---|---|---|
| `national` | 9 per year | Red ring + red label + red top-bar stripe |
| `observance` | 9 per year | Amber ring + amber label + amber top-bar stripe |

Full holiday list included (per year):

New Year's Day, Martin Luther King Jr. Day, Valentine's Day, Presidents' Day, St. Patrick's Day, Easter Sunday, Mother's Day, Memorial Day, Father's Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Halloween, Veterans Day, Thanksgiving Day, Christmas Day, New Year's Eve.

### Extending the dataset

To add more years or custom holidays, append entries to the `holidays2025_2026` array:

```typescript
// constants/holidays.ts
export const holidays2025_2026: HolidayEvent[] = [
  // existing entries...
  { date: '2027-01-01', name: "New Year's Day", type: 'national' },
  { date: '2027-07-04', name: "Independence Day", type: 'national' },
  // etc.
];
```

The calendar will automatically display them with the correct visual treatment.

---

## 12. Responsive & Mobile Design

The layout adapts across three breakpoint tiers using Tailwind's responsive prefixes, creating a distinct mobile app experience for devices `< 1024px`.

### Desktop vs Mobile Architecture

| Tier | Trigger | Behaviour |
|---|---|---|
| Mobile / Tablet | `< 1024 px` | The desktop Notes panel is completely hidden. Instead, a persistent `📝 Notes` pill button is anchored to the bottom. Tapping it opens a smooth **Framer Motion Bottom-Sheet Drawer** (drag-to-dismiss). A **Floating Action Button** (`FAB`) appears in the bottom right, expanding into a radial menu for quick actions (Add Note, Stamp Today, Go Today). |
| Desktop | `≥ 1024 px` | Side-by-side layout (notes 40% left / grid 60% right); mini-month previews visible in footer; keyboard shortcut hint bar visible. |

### Compact Mobile Mode

For very narrow screens (`< 640px`) or users who prefer maximum grid space, the app automatically enables "Compact Mode."
- Hides the week number column (reclaiming 28px).
- Increases the date font size to 16px.
- Moves the colour stamp dots to the bottom-right corner to prevent crowding.
- Abbreviates holiday names to their first word.
Users can manually toggle Compact Mode on/off across all breakpoints using the Theme Switcher menu.

---

## 13. Advanced Interactions

### Touch Gestures & Overscroll

- **Swipe Navigation**: Horizontally swiping across the main calendar view triggers month navigation with an overlapping spring animation and side-edge gradients.
- **Pull-to-Refresh**: Overscrolling the vertical page gently pulls down a visual loading indicator behind the calendar, simulating a native mobile app refresh action.
- Swipe boundaries strictly distinguish between a horizontal page swipe and a vertical Drag-and-Drop selection action.

### Haptic Feedback

Using `navigator.vibrate`, the app produces nuanced physical vibrations on mobile devices that support it:
- **Navigation (8ms)**: Swiping between months, using the Prev/Next buttons.
- **Interaction (10ms)**: Tapping a Date cell, checking off a note.
- **Micro-interactions (5ms)**: Tapping the FAB or expanding the radial menu.

### Moon Phase Engine

An astronomically-accurate phase calculator built on a known new-moon epoch computes the synodic phase of the moon based on the currently displayed month. It renders dynamically in the top-left of the hero banner as a multi-path SVG icon overlaying the seasonal art.

### Global Search indexing

Pressing `⌘K` or `Ctrl+K` opens a global command-palette interface. It immediately indices every single note stored in `localStorage` across all months and date ranges. As you type, it live-filters the notes and jumping to one instantly navigates the calendar to the matching month and opens the relevant tab.
