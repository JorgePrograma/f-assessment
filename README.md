# Customer Dashboard

Screen to view and manage customers, built with **SvelteKit 3**, **Svelte 5 (runes)**, **TypeScript** and **Tailwind CSS 4**. It consumes the [Customers API](https://github.com/JorgePrograma/ms-assessment-customer) (FastAPI + PostgreSQL).

## Requirements

- Node.js 22+ (tested with Node 24)
- The Customers API running on `http://localhost:8000` (see the [`ms-assessment-customer`](https://github.com/JorgePrograma/ms-assessment-customer) README)

## Getting started

```bash
# 1. Backend (in the ms-assessment-customer repo)
docker compose up -d --build
docker compose exec api python -m scripts.seed   # optional: 25 sample customers

# 2. Frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

| Variable  | Description                    | Default                 |
| --------- | ------------------------------ | ----------------------- |
| `API_URL` | Base URL of the Customers API. | `http://localhost:8000` |

## Scripts

| Command         | What it does                                                   |
| --------------- | -------------------------------------------------------------- |
| `npm run dev`   | Development server.                                            |
| `npm run build` | Production build (`adapter-node`); serve it with `node build`. |
| `npm test`      | Unit tests (Node) and component tests (real Chromium).         |
| `npm run check` | Type checking (`svelte-check`).                                |
| `npm run lint`  | Prettier + ESLint.                                             |

> Component tests run in a real browser through Playwright. The first time, run:
> `npx playwright install chromium-headless-shell`.

## Features

| Assignment requirement                  | Implementation                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Consume a REST API                      | The real Customers API: `GET /customers`, `GET /customers/summary`, `POST /customers`, `PATCH /customers/{id}/status`. |
| Table with name, email, status and date | `CustomerTable` (≥ 768 px, with avatar and action icons) and `CustomerCards` (mobile).                                 |
| Status filter                           | All / Active / Pending / Blocked (`StatusFilter`).                                                                     |
| Search by name or email                 | `SearchInput` with a 300 ms debounce; the search is resolved by the API.                                               |
| `<StatusBadge status="ACTIVE" />`       | Reusable component, exported through the feature's public API.                                                         |
| Loading, API error and empty list       | Skeleton, error with **Retry**, empty state with and without filters.                                                  |
| Responsive                              | Sidebar on desktop and drawer menu on mobile; table ↔ cards; no horizontal scroll.                                     |
| **Extra:** View details                 | Accessible modal (native `<dialog>`) with every field and status change.                                               |

Beyond the assignment:

- **Metric cards** (total and count per status, with its share) that also filter the list.
- **Customer creation** ("Nuevo cliente"): live validation, API errors (`409`, `422`) shown on their field, and a confirmation toast.
- **Pagination** with a rows-per-page selector (5, 10, 20, 50).
- **Filters, search, page and page size in the URL**: reloading or sharing the link keeps the view.
- **Accessibility**: labels, `aria-pressed`, `aria-live`, managed focus and keyboard navigation.

The UI copy is in Spanish, the language of the platform's users.

## Architecture

Organized **by feature** so the frontend stays modular: each feature owns its layers, and shared code lives outside.

```
src/
├── routes/                     # Routing only: each page renders a screen
│   ├── +layout.svelte          # AppShell: sidebar and navigation
│   └── +page.svelte
└── lib/
    ├── core/                   # Shared infrastructure, no business knowledge
    │   ├── http/               # HttpClient, ApiError, response envelope, error messages
    │   ├── utils/              # Date and number formatting
    │   └── testing/            # Generic test helpers
    ├── design-system/          # Generic, reusable UI: AppShell, PageHeader, Card, Button,
    │                           # IconButton, Badge, Avatar, Modal, Toast, TextField, SearchInput,
    │                           # SegmentedControl, Pagination, EmptyState, ErrorState
    └── features/
        └── customers/
            ├── index.ts        # Public API of the feature (the only thing imported from outside)
            ├── models/         # Customer (UI model) and CustomerDto (API contract)
            ├── mappers/        # CustomerDto → Customer
            ├── services/       # CustomerService: customer endpoints
            ├── state/          # CustomerListState and CustomerSummaryState (runes)
            ├── components/     # StatusBadge, table, cards, detail and create modals…
            │   └── dashboard/  # StatCards (metrics)
            ├── screens/        # CustomerDashboardScreen: composes everything above
            ├── utils/          # URL query, form validation, error messages
            └── testing/        # Fixtures
```

Dependency rules (verifiable with `grep`):

- `design-system` imports nothing from `core` or `features`.
- `core` imports nothing from `features`.
- A feature may use `core` and `design-system`; from outside, only its `index.ts` is used.

Request flow:

```
Screen ──► State (runes) ──► Service ──► HttpClient ──► fetch ──► API
  ▲                            │
  └──── Customer (model) ◄── Mapper ◄── CustomerDto
```

## Technical decisions

- **Spec-Driven Development**: the behaviour is defined in [`specs/customer-dashboard.spec.md`](specs/customer-dashboard.spec.md) as acceptance criteria (`AC-01` … `AC-24`), and every test states the criterion it covers.
- **State with runes in classes** (`CustomerListState` in a `.svelte.ts` file): `$state` and `$derived` encapsulate data, loading and error in an object that can be tested without mounting components. No stores or external state libraries: runes are the recommended approach in Svelte 5.
- **The URL is the source of truth** for filter, search, page and page size: controls update the URL and the screen reacts. Reloading or sharing the link keeps the view.
- **Native `fetch` wrapped in `HttpClient`** instead of axios: no extra dependency, it understands the API's `success / data / error` envelope and turns every failure into a typed `ApiError` (`code`, `status`, `requestId`).
- **Stale requests are cancelled** with `AbortController`: if the user types fast, only the response to the latest query is applied.
- **DTO → model mapper**: the API speaks `snake_case` with dates as strings; the UI works with `camelCase` and `Date`. The conversion happens in a single place, so a change in the API contract only touches the DTO and the mapper.
- **Server-side search**: since the list is paginated, filtering in the browser would only search the loaded page. `?search=` was added to the backend.
- **Errors as useful messages**: users see a clear message depending on the kind of error (offline, server error…) and a reference (`X-Request-ID`) that matches the backend logs.
- **Own design system on Tailwind**: small, generic components; each status's look is defined once (`customer-status.ts`) and reused by the badge, the filter, the select and the metric cards.
- **Modals on the native `<dialog>`**: the browser provides focus trapping, closing with `Esc` and returning focus to the button that opened it.
- **Tests in a real browser** (Vitest browser mode + Playwright): component tests load the real styles, so they truly verify the table ↔ cards switch depending on the width.
