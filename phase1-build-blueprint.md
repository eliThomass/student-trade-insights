# Phase 1 Build Blueprint — Mentorship Platform

> Source: Phase 1 Build Blueprint (Nov 5, 2026, @Brayden). This file is the spec for Claude Code. Build in the order given under **Build Order**, and treat each feature's checklist as its acceptance criteria.

## Goal

Get the mentor off Discord for anything reference-worthy. Phase 1 delivers:

1. A public application page
2. A mentor-approved student portal
3. An organized education library

Must work end to end for **~75–150 students** and be built on the full stack so Phases 2 and 3 plug in **without a rebuild**.

## Scope

### In Phase 1
- Public landing page and application form
- Mentor applications inbox with AI fit ranking and Approve / Waitlist / Reject
- Student accounts that only unlock after approval
- Education library (modules and resources)
- Session notes for each student
- Mentor content manager and student list

### Out of scope (do NOT build yet)
- **Phase 2:** Trade journal, My Notes, AI scheduling
- **Phase 3:** Stripe payments, AI library search, analytics

**Payments:** stay on Venmo/PayPal (off-platform). The mentor manually sets a student to `active` after they pay.

## Stack

Suggested stack (mentor owns all accounts; developer is added as a collaborator):

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) + TypeScript + Tailwind |
| Database, auth, storage | Supabase |
| Hosting | Vercel, auto-deploying from GitHub |
| Email | Resend (or Supabase auth emails for the basics) |
| AI | Claude or OpenAI API, **server-side only** |
| Rich text | Tiptap or MDX for lessons |

### Environment variables
- Supabase URL + anon key (client), Supabase service role key (server only)
- AI API key (server only — never exposed to the browser)
- Email (Resend) API key

## Routes

Three areas: **public**, **student**, **mentor**. Route guards check the user's `role` and `status`.

| Route | Who | What it shows |
|---|---|---|
| `/` | Anyone | Landing page: the mentor, his approach, what's included, testimonials, Apply button |
| `/apply` | Anyone | Sign up (email + password) and the application form |
| `/status` | Applicant | "Application received / waitlisted / not accepted" message |
| `/login` | Anyone | Log in and reset password |
| `/learn` | Active student | Module list in order, with progress |
| `/learn/[module]` | Active student | Lesson content and attached resources |
| `/resources` | Active student | All resources, filterable by tag and type |
| `/sessions` | Active student | Their session notes, newest first |
| `/admin/applications` | Mentor | Inbox sorted by AI score, with filter by status |
| `/admin/applications/[id]` | Mentor | Full answers, AI summary, decision buttons |
| `/admin/students` | Mentor | All students, status, last session |
| `/admin/students/[id]` | Mentor | Profile, add or edit session notes, set status |
| `/admin/content` | Mentor | Create, edit and reorder modules and resources |

### Guard rules
- Non-`active` students (applicant / approved / waitlisted / rejected / inactive) → redirect to `/status`; never show student pages.
- `/admin/*` → `role = mentor` only.
- Enforce access in **both** middleware/route guards **and** Supabase RLS (RLS is the real security boundary).

## Data Model

Five tables. **Row-level security ON for all of them from day one.**

| Table | Fields | Read / write |
|---|---|---|
| `profiles` | `id` (= auth user id), `name`, `email`, `role` (`student` / `mentor`), `status` (`applicant` / `approved` / `active` / `waitlisted` / `rejected` / `inactive`), `time_zone`, `created_at` | Own row; mentor all. **Only the mentor can change `role` or `status`** |
| `applications` | `id`, `user_id`, `answers` (jsonb), `ai_score`, `ai_summary`, `ai_strengths`, `ai_flags`, `decision`, `decided_at` | Applicant inserts own; mentor reads and updates all |
| `modules` | `id`, `title`, `slug`, `order`, `body`, `tags`, `published` | Active students read published; mentor writes |
| `resources` | `id`, `module_id`, `title`, `type` (`pdf` / `link` / `indicator`), `url` or file, `tags` | Active students read; mentor writes |
| `session_notes` | `id`, `student_id`, `session_date`, `takeaways`, `homework`, `recording_url` | Student reads own; mentor reads and writes all |

### Storage
- Supabase Storage bucket for PDFs and images — **private**, served through **signed URLs**.

### Future-proofing
Leave room for Phase 2 tables, all keyed on `student_id`:
`notes`, `journal_entries`, `journal_comments`, `availability`, `sessions`.

## Feature Specs

Each feature is done when **every** check passes.

### 1. Application flow
- [ ] A visitor signs up and submits the form; their profile is created with status `applicant`
- [ ] Application questions come from a config the mentor can edit, not hard-coded
- [ ] On submit, the AI ranking runs and saves its score, summary and flags
- [ ] The mentor gets an email for each new application
- [ ] The applicant sees only `/status`, never student pages

### 2. Mentor applications inbox
- [ ] List sorted by AI score, with status filter (pending / waitlisted / rejected / approved)
- [ ] Detail view shows every answer, the AI summary and the red flags
- [ ] Approve, Waitlist and Reject each take one click and send the applicant an email
- [ ] Approve sets status to `approved`. The email says the next step is payment (Venmo/PayPal for now)
- [ ] On the student page, the mentor sets `approved` → `active` once paid

### 3. Education library
- [ ] Modules show in the mentor's set order
- [ ] Lesson body supports rich text, images and embedded video links
- [ ] Resources (PDF, link, indicator) attach to a module and can be tagged
- [ ] Search across module titles, lesson text and resource names
- [ ] Only `active` students can open it

### 4. Session notes
- [ ] The mentor adds a note to a student: date, takeaways, what to work on, optional recording link
- [ ] The student sees only their own notes, newest first
- [ ] The mentor can edit or delete any note

### 5. Mentor admin
- [ ] Student list with status and last session date
- [ ] Set status to any value (active, inactive, etc.)
- [ ] Content manager to create, edit, reorder and unpublish modules and resources

## AI Fit Ranking

The AI **sorts and summarizes** applications. It **never approves or rejects anyone** on its own.

- **When it runs:** a server-side function (route handler / server action / edge function) runs on submit and stores the result. The API key never reaches the browser.
- **Input:** the application answers + the mentor's criteria (from config): discipline, willingness to learn, weekly time commitment, realistic goals, coachability.
- **Output (JSON):**
  ```json
  {
    "score": 0,
    "summary": "2–3 sentences",
    "strengths": ["..."],
    "flags": ["expects fast money", "under 3 hrs/week"]
  }
  ```
  `score` is 0–100. Validate the response against this schema before saving.
- **Prompt rule:** score only on the stated criteria and the answers given. **Never** on name, age, location or writing style. (Don't send name/email/location to the model at all.)
- **Fallback:** if the call fails, save the application without a score and let the mentor re-run it from the detail view.
- **Cost:** one call per application — a fraction of a cent to a few cents each.

## Design References

Use each site for one thing only:

| Site | Use it for | Borrow this |
|---|---|---|
| **High Alpha Trends** | Landing page | Application-only landing page: "Applications open" badge, proof right after the hero, student case studies, FAQ before the last CTA, a 3-step "how applying works" block with response time, Apply button repeated through the page, disclaimers next to claims |
| **TTrades** | Site structure | Clean top nav, one obvious hero button, card grid of offerings (Mentorship, Education, Indicators), free-education-first entry point |
| **RC Visionaries** | Education library | Tiered concept index (Principles → Foundation → Structure → Models), a single "Start here" path, product cards with real screenshots, footer risk disclaimer |

**Content rules:**
- Only use proof the mentor can back up (real, dated results and testimonials).
- Add a **risk disclaimer** in the footer and next to any results.

## Setup Steps

1. Create the GitHub repo and the Next.js project.
2. Create the Supabase project, the tables and the RLS policies. Seed one mentor account.
3. Connect Vercel to the repo, then add the env vars (Supabase keys, AI key, email key).
4. Point the domain at Vercel.
5. Turn on 2FA everywhere, plus Supabase daily backups.

## Build Order

Build in this order so each step can be tested on the one before it. **Show the mentor the clickable mockup after step 1.**

1. Mockup of the landing page, inbox and student portal for mentor sign-off
2. Repo, Supabase, Vercel, domain, auth
3. Schema + RLS policies + seed data; **test that one student can't see another student's data**
4. Landing page and `/apply` flow
5. AI ranking function
6. Mentor applications inbox and decision emails
7. Content manager, then student education library
8. Session notes (mentor write, student read)
9. Student list and status controls
10. Load the mentor's real content from Discord
11. Test pass on mobile and desktop, plus a security check
12. Launch: invite the current students, then walk the mentor through it on a call

## Inputs Needed From the Mentor

Brayden collects these. **Steps 4–10 depend on them** — use clearly marked placeholders until they arrive.

- [ ] List of current students (name + email) to invite as `active`, skipping the application
- [ ] Application questions and what he looks for in a student
- [ ] Education content from Discord, sorted into modules and in order
- [ ] Resources: PDFs, indicator links, checklists
- [ ] Landing page copy: bio, approach, what's included, 2–3 testimonials
- [ ] Branding: site name, domain, logo, colors
- [ ] Session note template he likes (what goes in a recap)
- [ ] Hour estimate, to confirm the Phase 1 price and the split
