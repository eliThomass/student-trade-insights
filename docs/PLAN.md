# Build Plan: Phase 1 Clickable Mockup

Goal: Build Order step 1 from `phase1-build-blueprint.md`, a clickable mockup of every Phase 1 route running on mock data, polished enough to show the mentor for sign-off. Steps 2–12 (Supabase, auth, real AI, emails, deploy) come after he approves it and after there's a quote.

Decisions (Nov 5, 2026):

- Stack: Vite + React + TypeScript + Tailwind v4 + React Router, in `frontend/`.
- Theme: light, TTrades-style (superseded Nov 8 by the mentor's dark chart palette; see Color).
- Subject: options and futures trading.
- Branding: clearly marked placeholders in one config file.
- Scope: all routes from the blueprint's route table, plus a "View as" switcher so the mentor can click through as each kind of user.

---

## 1. Design plan

### Subject, audience, job

- **Subject:** a single mentor's application-only program for options and futures traders.
- **Audience:** people who already know trading is hard and are wary of "get rich" pitches. Then the mentor himself, who will live in the admin side every day.
- **Primary job:** the landing page earns a serious application. The portal makes it obvious what to study next. The admin side makes deciding on an applicant a 30-second task.

### Color

The mentor's own chart palette (Nov 8, 2026), which replaces the original light, TTrades-style palette. The layout and restraint of TTrades still apply; only the colors changed. Token names predate the dark theme, so `paper` is the page background and `ink` is the main text.

| Token | Hex | Role |
|---|---|---|
| `paper` | `#131722` | Page background (the chart navy) |
| `mist` | `#1A1F2C` | Cards, panels, sidebar, alternate sections |
| `raised` | `#232938` | Hover, inputs, popups (dialogs, menus, toasts) |
| `line` | `#2E3446` | Borders and dividers |
| `ink` | `#F5F7FA` | Headings and body text |
| `slate` | `#9AA3B5` | Labels, timestamps, secondary text |
| `accent` | `#56BFD8` | Cyan, the one brand color: primary buttons, links, active nav |
| `accent-strong` | `#B8E8F0` | Ice cyan: hover and highlight |
| `on-fill` | `#131722` | Text on solid colored fills (white on cyan would fail contrast) |

Semantic colors are used only where they carry meaning, never as decoration:

- `up` `#56BFD8` (cyan): gains, active status, approve, the reward side of a trade
- `down` `#F07178`: losses, errors, AI red flags, reject
- `hold` `#FCEF72` (yellow, sparingly): needs attention, meaning pending and waitlisted, the unranked-application warning, placeholder tags
- `info` `#C0D8F8` (soft blue): info, tags, approved-awaiting-payment
- `mentor` `#E0BCE6` (lavender): the mentor's comments and markup, meaning session notes, his levels on the hero chart, the Mentor badge

Each has a `*-soft` tint (16% over the background) for badge and banner backgrounds. All text pairs pass WCAG AA (at least 4.5:1); the lowest is red on its tint at 5.0:1.

### Type

- **One family: Schibsted Grotesk** (Google Fonts, variable 400–800). It's a crisp, slightly condensed news grotesque: confident at display sizes, plain at UI sizes, and not the Inter/Geist default.
- **Scale** (1.25 ratio, 16px base): 13 / 14 / 16 / 20 / 25 / 31 / 39 / 61 (hero only).
  - Headings: weight 700, tracking −1.5% at 31px and up.
  - Body: weight 400, line-height 1.6, measure capped at ~68ch.
- **Numbers:** scores, P&L, and dates use `font-variant-numeric: tabular-nums` so columns line up. If Schibsted lacks `tnum`, switch the whole family to Hanken Grotesk, which has it. Don't add a monospace face.
- **Case:** sentence case everywhere. No all-caps eyebrows. Labels only where they carry information (status badges, the "Applications open" badge).

### The one memorable thing: the marked-up chart

The most characteristic object in this world is a chart the mentor has marked up: price, a dashed level, an arrow, a short handwritten-style note like "liquidity taken" or "entry after reclaim". The hero centers on one of these, drawn as inline SVG.

It's a 2-minute ES chart of the New York open with a price scale, session times, and the shaded risk/reward box traders use (risk to the stop, reward to the target, with the R multiple). Candles are cyan (up) and red (down), as on the mentor's charts, with his levels in lavender.

The chart is a short walkthrough of the setup: Levels, Sweep, Entry, Target. When it scrolls into view it plays through once, revealing candles up to each step with a one-line explanation. Visitors can tap any step or replay it. Afterwards the last candle ticks quietly as if live, pausing when off screen. Hovering, dragging or using the arrow keys shows a crosshair and that candle's open/high/low/close. It's drawn at real pixel size, so text stays readable on phones. Under `prefers-reduced-motion` it shows the finished setup with no autoplay or ticking.

The same annotation language (a dashed level line plus a small note) is reused quietly elsewhere:

- the progress marker on `/learn`
- the "you are here" step in "How applying works"

Everything else stays calm.

### Motion budget

- **Allowed:**
  - the hero chart walkthrough (autoplays once) and the quiet live tick on its last candle
  - the pulsing dot on "Applications open" (from High Alpha Trends)
  - one slow, pausable marquee of dated student results directly under the hero, with its disclaimer inline (from High Alpha Trends)
  - transitions that answer an action: a dialog opening, a toast confirming "Approved · email sent to applicant", an accordion expanding, a reorder settling
- **Not allowed:**
  - fade-up on every section
  - hover lift on every card
  - gradient washes

### Layout

**Alignment:** left-aligned throughout, so headings line up with body text and with the chart. The final CTA is the only centered block.

**Grid:** 12 columns, 1200px max width, 24px gutters. Sections are separated by space and an occasional `mist` band, not by cards.

**Landing (`/`)**

```
┌───────────────────────────────────────────────────────────────┐
│ [Logo] Brand          Approach  Included  Results  FAQ  [Apply]│
├───────────────────────────────────────────────────────────────┤
│ ● Applications open · replies within 72h                      │
│ Learn to trade options and      ┌──────────────────────────┐  │
│ futures with a mentor who       │  /\    ‾‾ liquidity taken │  │
│ reviews your trades.            │ /  \/\  - - - - - - - - - │  │
│ subhead (1–2 lines)             │       \/\_/‾ entry        │  │
│ [Apply for mentorship]          └──────────────────────────┘  │
│ How applying works ↓ (text link)                              │
├───────────────────────────────────────────────────────────────┤
│ « dated results marquee · each with "results vary" note »     │  ← proof right after hero
├───────────────────────────────────────────────────────────────┤
│ What's included: one large item (1:1 mentorship) on the left, │
│ two stacked items on the right (library, session notes)       │  ← not 3 identical cards
├───────────────────────────────────────────────────────────────┤
│ The mentor and the approach: photo placeholder + bio + 3 rules│
├───────────────────────────────────────────────────────────────┤
│ Student case studies: 2–3, each before → after + date         │
├───────────────────────────────────────────────────────────────┤
│ How applying works: 1 Apply  2 Reviewed (≤72h)  3 Start       │  ← a real sequence, so numbered
├───────────────────────────────────────────────────────────────┤
│ FAQ (accordion)                                               │
├───────────────────────────────────────────────────────────────┤
│            Ready when you are. [Apply for mentorship]         │
├───────────────────────────────────────────────────────────────┤
│ Footer: links · risk disclaimer (full text)                   │
└───────────────────────────────────────────────────────────────┘
```

**Student portal (app shell)**

```
┌────────────┬──────────────────────────────────────────────────┐
│ Brand      │ Search lessons and resources…          [avatar]  │
│            ├──────────────────────────────────────────────────┤
│ Learn      │ Start here → next lesson card (one path)         │
│ Resources  │ Principles │ Foundation │ Structure │ Models     │  ← RC Visionaries tiered index
│ Sessions   │  module rows with order #, progress, est. time   │
└────────────┴──────────────────────────────────────────────────┘
```

On mobile the sidebar becomes a bottom tab bar.

**Mentor inbox (`/admin/applications`)**

```
Pending 12 │ Waitlisted 4 │ Approved 31 │ Rejected 9        [search]
───────────────────────────────────────────────────────────────────
Score  Applicant        Hours/wk  Flags                 Applied
 87 ▇▇▇▇▇▇▇▇░  Jordan P.  10–15   —                     Nov 3
 62 ▇▇▇▇▇▇░░░  Sam R.     3–5     under 5 hrs/week      Nov 2
  — not ranked  Alex K.   …       [Re-run ranking]      Nov 2
```

On mobile the table becomes a stacked list.

### Review against the generic defaults

| Check | Result |
|---|---|
| Light with a blue accent | The brief asked for this (TTrades). Distinctiveness comes from the marked-up chart motif and the type, not the palette. |
| SaaS card kit | Revised. "What's included" was first a 3-up card grid; it's now one large item plus two smaller ones, because 1:1 mentorship is the product and the rest supports it. Lists and tables beat cards in the portal and admin. |
| All-caps eyebrow labels | Dropped. Section headings stand alone. |
| Numbered markers | Kept only for "How applying works" and the module order, which are real sequences. |
| Scattered fade-ins | Replaced with one hero moment plus the marquee. |
| Monospace for data | Not used. Tabular figures instead. |
| `→` appended to buttons | Not used. Buttons say exactly what happens ("Apply for mentorship", "Approve", "Add session note"). |

---

## 2. Build steps

These are build steps for the mockup, all inside the blueprint's **Phase 1**. Nothing from the blueprint's Phase 2 or 3 is built, and there is no backend: everything runs on mock data.

Each step ends with `npm run build` and `npm run lint` passing, plus a browser check at 1280px and 390px.

### Step 0: Tooling

- [x] Convert to TypeScript (pinned to TS ~6.0 because typescript-eslint doesn't support TS 7 yet):
  - `tsconfig` files
  - rename `.jsx` to `.tsx`
  - `typescript-eslint` in `eslint.config.js`
  - `build` script becomes `tsc -b && vite build`
- [x] Tailwind v4 via `@tailwindcss/vite`. Define the design tokens in `src/index.css` with `@theme`.
- [x] Add React Router and `lucide-react` (icons).
- [x] Add the `@/` path alias.
- [x] Load Schibsted Grotesk (self-hosted via `@fontsource-variable/schibsted-grotesk`; confirmed it has `tnum`).
- [x] Remove the Vite boilerplate (logos, hero.png, counter, App.css). Set the `<title>` and favicon placeholder.

### Step 1: Foundations

- [x] `src/types/`: the five tables, plus enums for role, status, and resource type.
- [x] `src/config/site.ts`: brand and mentor placeholders, payment instructions, disclaimer text.
- [x] `src/config/application.ts`: questions and scoring criteria.
- [x] `src/mocks/`: seed data.
  - 1 mentor
  - ~20 applicants across all statuses, with a spread of scores, including one unranked
  - ~12 active students
  - 4 tiers of modules (~10 modules) with lesson blocks
  - ~15 resources across PDF, link, and indicator
  - session notes for each student
- [x] `src/data/`: async store with `localStorage` persistence and reset. Includes the mock `ranking.ts` with schema validation and a simulated failure.
- [x] `src/auth/`: mock session, the "View as" switcher, and route guards per the blueprint.
- [x] UI primitives:
  - Button, Badge (status colors), Input, Textarea, Select, Tabs
  - Table and stacked-list pair
  - Dialog, Toast, Accordion, EmptyState
  - Disclaimer
- [x] Three layouts (public, student shell, admin shell) and the router with every route.

### Step 2: Public pages

- [x] `/` landing page as wireframed. The hero chart is an SVG component with its draw animation.
- [x] `/apply`: sign-up fields (email and password) plus a config-driven form with validation.
  - Submitting creates an `applicant` profile and an application.
  - It runs the mock ranking and toasts "Mentor notified".
  - The session switches to that applicant and lands on `/status`.
- [x] `/status`: received, waitlisted, not accepted, and approved-awaiting-payment messages. The approved message shows the Venmo/PayPal next step.
- [x] `/login`: mock login (pick a demo account) plus a reset-password form that confirms by toast.

### Step 3: Student portal

- [x] `/learn`:
  - "Start here" next-lesson block
  - tier tabs (Principles, Foundation, Structure, Models)
  - ordered module list with progress
- [x] `/learn/:module`:
  - lesson block renderer (text, images, video embed)
  - attached resources
  - mark complete
  - previous and next lesson
- [x] `/resources`: filter by tag and type.
- [x] Global search across module titles, lesson text, and resource names.
- [x] `/sessions`: the student's own notes, newest first.

### Step 4: Mentor admin

- [x] `/admin/applications`: sorted by AI score, status tabs with counts, search.
- [x] `/admin/applications/:id`:
  - every answer
  - AI summary, strengths, and flags
  - one-click Approve, Waitlist, and Reject, each toasting the simulated email
  - "Re-run ranking" when unranked
- [x] `/admin/students`: status and last session date, with a status filter.
- [x] `/admin/students/:id`:
  - profile
  - set status, including `approved` → `active` once paid
  - add, edit, and delete session notes in a dialog
- [x] `/admin/content`:
  - create and edit modules with the lesson block editor
  - reorder modules (up/down controls, keyboard accessible)
  - publish and unpublish
  - create, edit, delete, and tag resources

### Step 5: Polish and review

- [x] Responsive pass, including the mobile tab bar and stacked tables.
- [x] Keyboard focus styles, `prefers-reduced-motion`, and color contrast check.
- [x] Empty and error states written as directions ("No session notes yet. Your mentor adds one after each call.").
- [x] Take screenshots of each route at both widths and critique them against this plan. Remove one accessory.
- [x] Every placeholder (brand, testimonials, results, bio) is visibly marked and listed in a "Needed from the mentor" section of `frontend/README.md`, matching the blueprint's inputs list.
- [x] Update `CLAUDE.md` if the architecture drifted.

**Checkpoint:** after Step 5, the build is ready to demo to the mentor. Collect his feedback before any backend work.
