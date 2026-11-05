# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An application-only mentorship site for one options & futures trading mentor and his ~75–150 students. Built by Eli and Brayden. The product spec is `phase1-build-blueprint.md` (treat its feature checklists as acceptance criteria); the build plan we are following is `docs/PLAN.md`.

**Current stage: Build Order step 1 — a clickable mockup for the mentor's sign-off.** There is no quote yet, so:

- **Mock data only.** No Supabase, Vercel, Resend, or real AI calls. Don't add backend code, env vars, or API keys.
- Everything lives in `frontend/` (Vite + React + TypeScript + Tailwind v4 + React Router). The blueprint names Next.js; we deliberately chose Vite for the mockup. Keep components free of Vite-specific APIs so they can move into Next.js later.
- Phase 2 (trade journal, My Notes, AI scheduling) and Phase 3 (Stripe, AI search, analytics) are out of scope. Don't build them.

## Commands

Run from `frontend/`:

```
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check (tsc -b) + production build
npm run lint      # ESLint (v10 flat config, eslint.config.js)
npm run preview   # serve the production build
```

There is no test runner yet. Verify changes with `npm run build` and `npm run lint`, and check UI changes in the browser at desktop (1280px) and mobile (390px) widths.

TypeScript is pinned to `~6.0` on purpose: typescript-eslint doesn't support TS 7 yet. Don't bump it until it does.

Don't use `npm audit fix --force`: it once downgraded ESLint to v9, which breaks the Vite lint config (JSX-only usages get flagged as unused). The remaining moderate audit warnings come from ESLint's dev-only dependencies and are expected.

## Architecture

The mockup is built so the mock layer can be swapped for Supabase without touching pages.

- **Types mirror the database.** `src/types/` defines the five blueprint tables (`profiles`, `applications`, `modules`, `resources`, `session_notes`) with the blueprint's snake_case field names and enum values (`role`, `status`, resource `type`). Don't rename fields for JS style; they must match the future schema.
- **All data goes through `src/data/api.ts`.** Pages call async functions (e.g. `listApplications()`, `setProfileStatus()`) and read them with the `useQuery(key, fn)` hook in `src/data/useQuery.ts`, which refetches whenever the mock store changes. The store (`src/data/store.ts`) is seeded from `src/mocks/` and persisted to `localStorage` (`sti-demo-db`), so demo actions survive a reload. Pages never import `src/mocks/` or `store.ts` directly. Bump `schema` in `store.ts` when the seed's shape changes, so old saved data is discarded.
- **Lesson progress is mock-only.** It lives in `DbState.progress` because the blueprint's tables have nowhere to store it; the real build needs a `module_progress` table (noted in `frontend/README.md`).
- **Mock auth + "View as" switcher.** `src/auth/` holds a mock session (`sti-demo-session` in `localStorage`); `useSession()` and `homePathFor()` live in `auth/context.ts`. Demo-only pieces to remove before real auth: `components/DemoSwitcher.tsx`, `auth/personas.ts`, the "Fill with sample answers" bar on `/apply`, and the demo accounts panel on `/login`.
- **Route guards follow the blueprint's guard rules.** Student routes (`/learn`, `/resources`, `/sessions`) require `status = active`; any other status redirects to `/status`. `/admin/*` requires `role = mentor`. In the real build RLS is the security boundary; here the guards are the only check.
- **Config, not hard-coding.** `src/config/site.ts` holds brand name, mentor name, payment instructions, and social links (clearly marked placeholders until the mentor provides real ones). `src/config/application.ts` holds the application questions and the mentor's scoring criteria; the apply form renders from it.
- **Mock AI ranking.** `src/data/ranking.ts` stands in for the server-side ranking function. It returns `{ score, summary, strengths, flags }` (score 0–100), is validated against that shape before saving, never looks at name/email/location, and can simulate a failure so the "Re-run ranking" fallback on the detail page is exercisable. AI only sorts and summarizes; it never makes a decision.
- **Emails are simulated** with a toast saying who would be emailed and why (new application → mentor; approve/waitlist/reject → applicant; approval mail mentions Venmo/PayPal as the next step).
- **Lesson bodies** are a small typed block list (heading, paragraph, image, video embed, callout) rendered by one component, never raw HTML. It maps onto Tiptap JSON later.
- Three layouts in `src/components/layout/`: public (top nav + footer), and `AppShell` used for both the student portal (Learn, Resources, Sessions, plus library search) and the mentor admin (Applications, Students, Content). On mobile the sidebar becomes a bottom tab bar.
- **Lint rule to know:** `react-refresh/only-export-components` means `.tsx` component files export only components. Put shared constants and helpers in `.ts` files (e.g. `lib/labels.ts`, `components/ui/buttonClass.ts`, `components/ui/toast-context.ts`).

## Design direction

Light and clean, modeled on TTrades (ttrades.com): white surfaces, one blue accent, generous whitespace, a single obvious hero button, little motion. From High Alpha Trends we borrow the landing-page structure (applications-open badge, proof right after the hero, case studies, 3-step "how applying works", FAQ before the final CTA, repeated Apply button) and, sparingly, its motion (one slow results marquee, a pulsing "open" dot). From RC Visionaries we borrow the education library's tiered concept index and single "Start here" path. Design tokens and type choices are in `docs/PLAN.md` and `src/index.css` (Tailwind v4 `@theme`, font Schibsted Grotesk). Keep motion to the hero chart draw, the "Applications open" pulse and the results marquee; everything else moves only in response to an action. Use the `tabular` utility for numbers that line up in columns, but not on text containing commas (it widens them).

Content rules from the blueprint: only show proof the mentor can back up (real, dated results), and put a risk disclaimer in the footer and next to any results. Placeholder testimonials and results must be visibly marked as placeholders.
