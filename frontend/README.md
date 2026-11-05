# Mentorship site: Phase 1 mockup

A clickable mockup of every Phase 1 page in `../phase1-build-blueprint.md`, built to show the mentor before any backend work. Everything runs on mock data in the browser. There is no database, no real login, no AI calls and no email.

## Run it

```
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and production build
npm run lint
```

## Demo guide

Use the dark **Demo: viewing as…** button in the bottom-left corner to switch between accounts:

| View as | Lands on | Try |
|---|---|---|
| Visitor | `/` | The landing page, then **Apply for mentorship**. **Fill with sample answers** skips the typing. |
| Applicant | `/status` | The "application received" message. Student pages redirect here. |
| Waitlisted | `/status` | The waitlist message. |
| Approved | `/status` | Payment instructions (Venmo/PayPal). |
| Student | `/learn` | The library, a lesson, search in the top bar, resources and session notes. |
| Mentor | `/admin/applications` | Open an application and **Approve**. Then under Students, **Mark as paid and activate** and **Add session note**. Content lets you edit, reorder and publish modules. |

Demo actions are saved in the browser, so they survive a reload. The same menu has **Reset demo data**, plus **Simulate AI ranking failure** to show the "Re-run ranking" fallback. The `/login` page also lists the demo accounts.

Every toast that says "Email sent to…" stands in for an email the real build will send.

## Needed from the mentor

Everything below is a visible placeholder in the mockup. Swap these in once they arrive:

| Input | Where it goes |
|---|---|
| Site name, logo, colors, domain | `src/config/site.ts` (name), `src/components/Logo.tsx` and `public/favicon.svg` (logo), `src/index.css` (colors) |
| Bio, approach, photo | Landing page "About" section, `src/pages/public/Landing.tsx` |
| 2–3 real testimonials and dated results | `src/mocks/landing.ts` (results strip and case studies) |
| Pricing and call cadence | FAQ in `src/mocks/landing.ts`, "What you get" in `Landing.tsx` |
| Payment handles (Venmo, PayPal) and response time | `src/config/site.ts` |
| Application questions and what he looks for | `src/config/application.ts` |
| Education content from Discord, sorted into modules | `src/mocks/library.ts` (or entered through the Content page) |
| PDFs, indicator links, checklists | `src/mocks/library.ts` (resources) |
| Session note template | `src/components/SessionNoteCard.tsx` and the note dialog in `src/pages/admin/StudentDetail.tsx` |
| List of current students (name and email) | `src/mocks/people.ts` |

## Gaps the real build will need to fill

- **Lesson progress.** The mockup tracks completed modules, but the blueprint's five tables have no place for it. The real build needs a `module_progress (student_id, module_id, completed_at)` table.
- **Application timestamps.** `applications.created_at` isn't in the blueprint's field list but is used to sort and date the inbox. It should be added as a column.
