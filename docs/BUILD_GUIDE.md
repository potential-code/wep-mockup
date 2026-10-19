# WEPs Portal Mockup — Build Guide for feature work

Read this before building any page. The full client brief is in `docs/brief.txt` (sections
numbered 1–28; read the sections for your area). The plan is in
`/home/aliya/.claude/plans/hashed-tumbling-puzzle.md`.

## What we are building

A **frontend-only**, clickable, premium mockup of the UN Women Women’s Empowerment Principles
(WEPs) portal. English only, light theme only. No backend: a mock API (`src/services/*`) runs
over an in-memory database (`src/mocks/db.ts`) persisted to localStorage. It must feel like a
real product: every primary nav item opens a designed screen with useful content, every
primary button causes a visible state change, opens a detail screen or shows a confirmation.

## Architecture (separation of concerns — do not break)

```
routes/        thin route files (already generated; do not add logic there)
features/<domain>/pages/      page components (one per route — already stubbed, you fill them)
features/<domain>/components/ components used only by that domain
queries/<domain>.queries.ts   TanStack Query hooks (the ONLY way UI reads/writes data)
services/<domain>.service.ts  mock API + business rules
mocks/                         seed data + db (services only)
shared/                        types, reference data, rules, permissions (framework-free)
components/ui/                 shadcn primitives (kebab-case)
components/shared|layout|motion  app-wide building blocks
```

Rules:
- UI never imports `src/mocks/*` or `src/services/*` directly — use `src/queries/*`.
  Exception: pure constants exported through queries (e.g. `SECTION_META`, `CHANNELS`, `OFFERINGS`).
- `shared/` (types, reference, rules, permissions), `src/services/api.ts`, `src/services/metrics.ts`,
  `src/mocks/db.ts`, `src/components/**`, `src/config/**`, `src/lib/**`, `src/styles/**`,
  `src/routes/**` are **frozen**. If you truly need a change there, do not make it — describe
  it in your final report.
- You MAY edit the service, queries and seed files **of your own domain** (listed in your task)
  when a function is missing or wrong. Keep business rules in services, not components.
- Build reusable pieces for your domain under `features/<domain>/components/`.
- Do **not** run `bun add` / install anything. Available: react 19, @tanstack/react-router,
  @tanstack/react-query, radix-ui (via `src/components/ui/*`), lucide-react, recharts 3,
  motion (`motion/react`), gsap + `@gsap/react` (`useGSAP`), lenis, sonner (`toast`),
  date-fns 4, zod 4, cmdk, vaul, canvas-confetti, clsx/tailwind-merge (`cn` from `@/lib/utils`).
- Imports: `@/…` = `src/…`, `@shared/…` = `shared/…`. Use `import type` for types.
- Style: single quotes, no semicolons, 2-space indent (Biome). Match surrounding code.

## Design direction

Modern institutional: welcoming, credible, easy to navigate. Generous white space, strong
photography, clear hierarchy, restrained colour, purposeful motion. Public pages can be more
expressive; authenticated workspaces prioritise clarity and task completion. Every dashboard has
an obvious next action; don’t show every metric above the fold.

**Tokens** (Tailwind classes, defined in `src/styles/app.css`):
- Colours: `navy` (#153B55 text, dark sections), `navy-900`, `navy-700`, `blue` (#167CB3
  primary actions), `blue-50`, `blue-100`, `blue-600`, `gold` (#D6A44A small warm accents),
  `gold-50`, `gold-700`, `surface` (#F4F7FA page bg), `card` (white). Status: `success`,
  `warning`, `danger`, `info` + `-soft` variants. Never encode meaning with colour alone.
- Type: headings use `font-heading` (Montserrat). Utilities: `text-hero`, `text-page-title`,
  `text-section`. Body 16px Figtree.
- Radius: cards `rounded-2xl`; inputs/buttons `rounded-lg`. Shadows: `shadow-card`,
  `shadow-lift` (hover). Public content width: `container-public` (1200px + gutters).
- Buttons (`@/components/ui/button`): variants `default` (blue), `navy`, `gold`, `outline`,
  `outline-light` (on dark), `secondary`, `ghost`, `link`; sizes `sm`, `default`, `lg`, `xl`,
  `icon`, `icon-sm`. One primary button per view.

**Brand assets**: `WepsLogo` / `PartnerLogos` from `@/components/shared/Logo` (white lockup —
only on navy/dark). Principle icons `/brand/principle-{1..7}.png`. Photos & company logos via
`images` from `@/config/images` (`images.hero.homeHero.src`, `.alt`, groups: hero, sections,
courses, clinics, people, logos, marketplace, resources). Never draw or invent official logos.

**Content**: realistic, specific, professional English. Never lorem ipsum or “Test”. Official
WEPs content (7 principles, 6 journey stages, Join field groups, official resource titles) comes
from `@shared/reference` and must stay accurate. Portal layouts, gamification, marketplace, AI and
the three paid certifications are PROPOSED — label them with `<DemoLabel>` (“Proposed feature”
/ “Illustrative demo data”) where the brief asks. Payments say “Demo payment”. AI says scripted.

## Building blocks (use these, don’t re-invent)

- `PageHeader` (`@/components/layout/PageHeader`): title, description, `actions`, `breadcrumbs`
  (`[{label,to}]`, only 2+ levels deep), `eyebrow`.
- `SectionCard`, `DemoLabel`, `FilterBar` (`@/components/shared/Cards`).
- `StatCard` (`@/components/shared/StatCard`): KPI with count-up, `to` makes it open records.
- `StatusBadge` / `WorkflowStatus status="…"` (`@/components/shared/StatusBadge`) — covers every
  workflow status in the app.
- `DataTable` + `columnsToCsvRows` (`@/components/shared/DataTable`): sortable, paginated,
  becomes cards on mobile, optional CSV export.
- `EmptyState`, `ErrorState`, `AccessNotice`, `CardGridSkeleton`, `StatsSkeleton`,
  `PageSkeleton` (`@/components/shared/States`). Every page shows skeleton loading, empty and
  error states.
- `PrincipleTag id={n}` (links to official principle page), `UserAvatar`, `CompanyLogo`,
  `FileDrop` (simulated upload with valid / wrong type / too large / missing states),
  `ConfirmDialog`.
- shadcn UI in `@/components/ui/*`: accordion, alert-dialog, avatar, badge, breadcrumb, button,
  calendar, card, chart (recharts wrapper), checkbox, collapsible, command, dialog, drawer,
  dropdown-menu, hover-card, input, label, popover, progress, radio-group, scroll-area, select,
  separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, toggle,
  toggle-group, tooltip.
- `useCurrentUser()` (`@/hooks/use-session`) → `{ user, company, can(capability) }` for
  permission-aware UI (hide AND guard actions).
- Formatting: `@/lib/format` (`formatDate`, `formatDateTime`, `formatTime`, `formatWeekday`,
  `timeZoneLabel`, `relativeTime`, `daysUntil`, `formatNumber`, `formatPercent`,
  `formatCurrency`, `plural`, `sentenceCase`, `downloadText` for demo downloads/exports).
- Motion: `Reveal`, `Stagger`/`StaggerItem` (`@/components/motion/Reveal`), `CountUp`,
  `celebrate()` (`@/components/motion/Celebrate`, confetti for milestones), `scrollToTarget`.

## Motion & interaction

- **Portal pages**: `motion/react` (Framer Motion). 150–250ms transitions. Use `layoutId` for
  active tab/segment indicators, `AnimatePresence` for wizard steps, list add/remove, drawers;
  `whileHover={{ y: -3 }}` on clickable cards; progress bars animate in; celebrate milestone
  moments (clinic unlocked, certificate issued, report submitted). Page entrance is handled by
  the shell — don’t add another page-level fade.
- **Public pages only**: GSAP + ScrollTrigger via `useGSAP` (scope to a ref; ScrollTrigger is
  registered in `SmoothScroll`) for hero timelines, pinned/scrubbed sections, parallax,
  counters; Lenis smooth scroll is already active in the public layout. No scroll hijacking;
  content stays visible without JS animation.
- Always respect reduced motion (`usePrefersReducedMotion` from `@/hooks/use-reduced-motion`,
  or motion’s `useReducedMotion`).
- Loading feedback on every mutation (button shows “Saving…” / spinner, disabled while pending);
  success → `toast.success(...)`; errors are toasted automatically unless you handle them.
  Mutations invalidate all queries automatically, so dashboards update everywhere.

## Responsive & accessible

- Must work at **390px** (no horizontal page scroll), 768px and 1440px. Grids collapse to one
  column; tables use `DataTable` (auto cards on mobile) or scroll inside a container; sticky
  action bars on mobile for long forms; tap targets ≥ 40px.
- Keyboard navigable, visible focus, labels for every input and icon button (`aria-label`),
  headings in order, charts have a table/text alternative, status = icon + text.

## Data & demo personas

- Sign in as a persona for QA with a deep link: `http://localhost:5173/<path>?demo-as=<userId>`.
  Personas: `u-admin` (UN Women admin), `u-leila` (CEO Asteria Group), `u-nora` (company admin /
  focal point), `u-maya` (HR employee, the only employee on sign-in; 620 redeemable and 175 qualifying points, one lesson from unlocking the
  clinic), `u-omar` (Procurement, 620 points), `u-elena` (Marketing), `u-sofia` (mentor/trainer),
  `u-cedar-applicant` (pending applicant, info requested).
- Demo date is 19 Oct 2026. Key numbers must reconcile (brief §26): Asteria 24 invited / 18
  activated (75%) / 12 path completions (67%); portfolio 120 / 96 / 60; reporting 5/8 = 62.5%.
- Dev server is running at http://localhost:5173 (do not start another on that port).
- Screenshot to check your work: `node scripts/shot.mjs "<path>" <out.png> <width> <userId>`
  (e.g. `node scripts/shot.mjs /portal/learn /tmp/claude-1000/-home-aliya-Projects-wep-mockup/abb1935d-33d2-4d29-9fee-78727760f248/scratchpad/learn.png 390 u-maya`),
  then Read the png. Use `FULL=1` env for full-page. Prints console errors if any. Check both
  1440 and 390 widths.

## Reference designs

Screenshots live on branch `origin/mockup-references` of `/home/aliya/Projects/potential-template`
(read with `git -C /home/aliya/Projects/potential-template show origin/mockup-references:<path> > <scratch>.png`
then Read the png). List: `git -C /home/aliya/Projects/potential-template ls-tree -r --name-only origin/mockup-references mockup-references`.
Layout rules: `mockup-references/layout-rules.md` (shell → breadcrumb → header → filters →
content; one primary action; empty/loading/error; 390px mobile). Borrow structure and feel only;
our brand and content replace theirs. Template source code to adapt UI ideas from:
`/home/aliya/Projects/potential-template/templates/{learning-module,mentorship,events,analytics,competition,hiring}/src/components/*`
(they use server functions — take only markup/UX ideas, wire to our queries).

## Definition of done (per page)

1. Real content and states (loading skeleton, empty, error, success), linked to the right next
   pages with `<Link to=…>` — no dead buttons.
2. Permission-aware (hide what a role can’t do; services also enforce).
3. Looks premium at 1440 and works at 390. Screenshot-checked.
4. `bunx tsc --noEmit` shows no errors in your files; `bunx biome check --write <your paths>`
   leaves no errors in your files.
5. Final report: what you built, any frozen-file change you need, any known gaps.
