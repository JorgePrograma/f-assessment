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

| Assignment requirement                  | Implementation                                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Consume a REST API                      | The real Customers API: `GET /customers`, `GET /customers/{id}`, `GET /customers/summary`, `POST /customers`, `PATCH /customers/{id}/status`. |
| Table with name, email, status and date | `CustomerTable` (≥ 768 px, with avatar and action icons) and `CustomerCards` (mobile).                                                        |
| Status filter                           | All / Active / Pending / Blocked (`StatusFilter`).                                                                                            |
| Search by name or email                 | `SearchInput` with a 300 ms debounce; the search is resolved by the API.                                                                      |
| `<StatusBadge status="ACTIVE" />`       | Reusable component, exported through the feature's public API.                                                                                |
| Loading, API error and empty list       | Skeleton, error with **Retry**, empty state with and without filters.                                                                         |
| Responsive                              | Sidebar on desktop and drawer menu on mobile; table ↔ cards; no horizontal scroll.                                                            |
| **Extra:** View details                 | Dedicated page `/customers/{id}` (`GET /customers/{id}`) with every field, status change, and loading / not-found / error states.             |

Beyond the assignment:

- **Metric cards** (total and count per status, with its share) that also filter the list.
- **Customer creation** ("Nuevo cliente"): live validation and API errors (`409`, `422`) shown on their field.
- **SweetAlert2 dialogs** for actions: confirmation before changing a status, a loading dialog while the request runs and a success (or error) dialog at the end.
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
│   ├── +page.svelte            # Customer Dashboard (dashboard feature)
│   └── customers/[id]/         # Customer detail page
└── lib/
    ├── core/                   # Shared infrastructure, no business knowledge
    │   ├── http/               # HttpClient, ApiError, response envelope, error messages
    │   ├── utils/              # Date and number formatting
    │   └── testing/            # Generic test helpers
    ├── design-system/          # Generic, reusable UI organized with Atomic Design
    │   ├── atoms/              # Button, LinkButton, IconLink, Badge, Avatar
    │   ├── molecules/          # TextField, SearchInput, SegmentedControl, Pagination, Card,
    │   │                       # EmptyState, ErrorState
    │   ├── organisms/          # Modal, PageHeader, alerts (SweetAlert2 dialogs)
    │   └── templates/          # AppShell (sidebar layout)
    └── features/
        ├── customers/          # Customer list, detail and creation
        │   ├── index.ts        # Public API (the only thing imported from outside)
        │   ├── models/         # Customer (UI model) and CustomerDto (API contract)
        │   ├── mappers/        # CustomerDto → Customer
        │   ├── services/       # CustomerService: list, get by id, create, update status
        │   ├── state/          # CustomerListState, CustomerDetailState (runes)
        │   ├── components/     # CustomerListSection, table, cards, StatusBadge, create form…
        │   ├── screens/        # CustomerDetailScreen
        │   ├── utils/          # URL query, form validation, error messages, routes
        │   └── testing/        # Fixtures
        └── dashboard/          # Metrics; composes the "Customer Dashboard" page
            ├── index.ts
            ├── models/ · mappers/ · services/ · state/   # customer summary (GET /customers/summary)
            ├── components/     # StatCards, CustomerMetrics
            └── screens/        # CustomerDashboardScreen = metrics + CustomerListSection
```

Dependency rules (verifiable with `grep`):

- `design-system` imports nothing from `core` or `features`.
- `core` imports nothing from `features`.
- A feature may use `core` and `design-system`; from outside, only its `index.ts` is used.
- `dashboard` depends on `customers` only through `customers/index.ts`; `customers` knows nothing about `dashboard`.

Request flow:

```
Screen ──► State (runes) ──► Service ──► HttpClient ──► fetch ──► API
  ▲                            │
  └──── Customer (model) ◄── Mapper ◄── CustomerDto
```

## Technical decisions

- **Spec-Driven Development**: the behaviour is defined in [`specs/customer-dashboard.spec.md`](specs/customer-dashboard.spec.md) as acceptance criteria (`AC-01` … `AC-25`), and every test states the criterion it covers.
- **State with runes in classes** (`CustomerListState` in a `.svelte.ts` file): `$state` and `$derived` encapsulate data, loading and error in an object that can be tested without mounting components. No stores or external state libraries: runes are the recommended approach in Svelte 5.
- **The URL is the source of truth** for filter, search, page and page size: controls update the URL and the screen reacts. Reloading or sharing the link keeps the view.
- **Native `fetch` wrapped in `HttpClient`** instead of axios: no extra dependency, it understands the API's `success / data / error` envelope and turns every failure into a typed `ApiError` (`code`, `status`, `requestId`).
- **Stale requests are cancelled** with `AbortController`: if the user types fast, only the response to the latest query is applied.
- **DTO → model mapper**: the API speaks `snake_case` with dates as strings; the UI works with `camelCase` and `Date`. The conversion happens in a single place, so a change in the API contract only touches the DTO and the mapper.
- **Server-side search**: since the list is paginated, filtering in the browser would only search the loaded page. `?search=` was added to the backend.
- **Errors as useful messages**: users see a clear message depending on the kind of error (offline, server error…) and a reference (`X-Request-ID`) that matches the backend logs.
- **Own design system on Tailwind**: small, generic components; each status's look is defined once (`customer-status.ts`) and reused by the badge, the filter, the select and the metric cards.
- **Detail on its own page instead of a modal**: the URL can be shared or opened in a new tab, and it uses `GET /customers/{id}`, so a customer outside the current page can be shown too.
- **Atomic Design in the design system** (atoms → molecules → organisms → templates); the feature `screens/` play the role of pages, where real data is injected.
- **SweetAlert2 behind a small wrapper** (`organisms/alerts.ts`): screens call `confirmAction`, `showLoading`, `showSuccess` and `showError`, so the library can be swapped without touching them, it is loaded lazily (no SSR or bundle cost on first paint) and it is mocked in tests.
- **Create form on the native `<dialog>`**: the browser provides focus trapping, closing with `Esc` and returning focus to the button that opened it.
- **Tests in a real browser** (Vitest browser mode + Playwright): component tests load the real styles, so they truly verify the table ↔ cards switch depending on the width.
