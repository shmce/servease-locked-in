# ServEase

ServEase is a service marketplace with an HTTP-only NestJS microservices backend, an Expo mobile app, and separate Next.js surfaces for the public landing experience, provider dashboard, and admin panel.

## Active Apps

| Path | Purpose | Primary commands |
| --- | --- | --- |
| `backend/` | API Gateway and internal NestJS services | `npm run dev`, `npm run test`, `npm run build`, `npm run verify` |
| `mobile/` | Expo customer/provider app | `npm start`, `npm run web`, `npm run typecheck`, `npm test` |
| `admin/` | Next.js admin dashboard | `npm run dev`, `npm run typecheck`, `npm test`, `npm run build` |
| `FE_Web(Provider)/` | Next.js provider dashboard | `npm run dev`, `npm run typecheck`, `npm run build` |
| `Landing Page/` | Next.js public site and browser account flows | `npm run dev`, `npm run build` |

## Documentation

- [AGENTS.md](AGENTS.md): repository rules and agent operating constraints.
- [DESIGN.md](DESIGN.md): product experience and UI design source of truth.
- [docs/README.md](docs/README.md): canonical documentation index.
- [docs/architecture.md](docs/architecture.md): runtime topology and service boundaries.
- [docs/api-contracts.md](docs/api-contracts.md): public and internal API contract rules.
- [docs/testing.md](docs/testing.md): verification commands by app.
- [docs/github-packages.md](docs/github-packages.md): GitHub Packages setup for private npm packages.

## Local Setup

Install dependencies inside each app you work on:

```sh
cd backend && npm install
cd ../mobile && npm install
cd ../admin && npm install
cd '../FE_Web(Provider)' && npm install
cd '../Landing Page' && npm install
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
