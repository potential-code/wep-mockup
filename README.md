# WEPs Portal Mockup

Clickable, frontend-only mockup of the UN Women Women’s Empowerment Principles portal. Proposed
features and illustrative demo data for client review. No backend: a mock API (`src/services`)
runs over seeded data (`src/mocks`) saved in the browser.

## Run

```bash
bun install
bun run dev        # http://localhost:5173
bun run build      # typecheck + production build to dist/
bun run lint
```

## Password protection

The dev and preview servers use HTTP Basic Auth (user `admin`, password `Potential`). The browser asks once and reuses it across the whole site. Override with `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`, or turn it off with `BASIC_AUTH=off`. Static hosting needs its own equivalent (e.g. nginx `auth_basic`).

## Demo

- Sign in page → **Explore the demo** buttons open the portal as any role.
- Inside the portal, **Demo mode** (top bar / sidebar) switches role or resets the demo data.
- Deep link for presenting or QA: `/<path>?demo-as=<userId>` (`u-admin`, `u-leila`, `u-nora`,
  `u-maya`, `u-omar`, `u-elena`, `u-sofia`, `u-cedar-applicant`).
- `node scripts/walkthroughs.mjs` runs the eight required walkthroughs (brief §27) end to end;
  `node scripts/sweep.mjs` checks every route at 1440 and 390 px.

## Structure

`routes` (thin) → `features/<domain>` (pages and components) → `queries` (TanStack Query) →
`services` (mock API and business rules) → `mocks` (seed and in-memory db). Shared types,
reference data, rules and permissions live in `shared/`. Swapping in a real backend means
replacing `services/` only. See `docs/BUILD_GUIDE.md` for conventions.
