# ServEase

ServEase is a service marketplace with an HTTP-only NestJS microservices backend, an Expo mobile app, a Next.js admin panel, and a merged Next.js public/provider app in `servease-web/`.

## Active Apps

| Path | Purpose | Primary commands |
| --- | --- | --- |
| `backend/` | API Gateway and internal NestJS services | `npm run dev`, `npm run test`, `npm run build`, `npm run verify` |
| `mobile/` | Expo customer/provider app | `npm start`, `npm run web`, `npm run typecheck`, `npm test` |
| `admin/` | Next.js admin dashboard | `npm run dev`, `npm run typecheck`, `npm test`, `npm run build` |
| `servease-web/` | Next.js public site, browser account flows, and provider dashboard under `/provider/*` | `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run e2e` |
| `packages/servease-sdk/` | Typed public API client package | `npm run typecheck`, `npm test`, `npm run build` |

## Documentation

- [AGENTS.md](AGENTS.md): repository rules and agent operating constraints.
- [DESIGN.md](DESIGN.md): product experience and UI design source of truth.
- [docs/README.md](docs/README.md): canonical documentation index.
- [docs/architecture.md](docs/architecture.md): runtime topology and service boundaries.
- [docs/api-contracts.md](docs/api-contracts.md): public and internal API contract rules.
- [docs/call-flows.md](docs/call-flows.md): end-to-end request flows.
- [docs/internal-service-contracts.md](docs/internal-service-contracts.md): internal service route inventory.
- [docs/app-surface-contracts.md](docs/app-surface-contracts.md): app-to-Gateway usage map.
- [docs/testing.md](docs/testing.md): verification commands by app.
- [docs/documentation-status.md](docs/documentation-status.md): current source-of-truth and historical docs map.
- [docs/github-packages.md](docs/github-packages.md): GitHub Packages setup for private npm packages.

## Local Setup

Install dependencies inside each app you work on:

```sh
cd backend && npm install
cd ../mobile && npm install
cd ../admin && npm install
cd ../servease-web && npm install
```

The backend depends on the internal GitHub Packages package `@implementsprint/sdk`. Configure GitHub Packages before running `npm install` in `backend/`:

```sh
gh auth refresh -h github.com -s read:packages
export GITHUB_TOKEN="$(gh auth token)"
```

See [docs/github-packages.md](docs/github-packages.md) for full setup and troubleshooting.

## Backend Runtime

The API Gateway runs on port `5001`. Internal services run on ports `8501` through `8511` and communicate only through HTTP using environment-defined URLs. Copy `backend/.env.example` to `backend/.env` for local development.

```sh
cd backend
npm run dev
```

## Demo Accounts

Seed demo accounts with `cd backend && npm run seed:demo` after backend environment variables are configured.

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer.demo@servease.test` | `ServEaseDemo#2026` |
| Provider | `provider.demo@servease.test` | `ServEaseDemo#2026` |
| Admin | `admin.demo@servease.test` | `ServEaseDemo#2026` |

These accounts are for local and shared development only.
