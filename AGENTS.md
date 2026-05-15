# Repository Guidelines

## Project Structure & Module Organization

- `backend/`: NestJS monorepo. Services live in `backend/apps/*-service`; shared code is in `backend/libs`; migrations are in `backend/database`.
- `mobile/`: Expo React Native app. Routes live in `mobile/app`; UI in `mobile/src/components`; API clients in `mobile/services`; constants in `mobile/constants`; assets in `mobile/assets`.
- Place tests near the package they verify, using `__tests__/`, `tests/`, or `*.spec.ts` / `*.test.ts(x)`.

## Architecture Overview

This project uses true microservices with pure HTTP communication. The API Gateway runs on port `5001` and routes requests to services on ports `8501` through `8511`. Do not add Kafka, RabbitMQ, event buses, or cross-service database access. The gateway must not access databases except Supabase Storage for uploads. Each service owns its schema and calls other services through HTTP using environment-defined URLs.

## Build, Test, and Development Commands

Backend commands:
- `cd backend && npm run dev`: start gateway and all services.
- `npm run start:gateway:dev`, `npm run start:auth`, etc.: run one service.
- `npm run build`: build Nest projects.
- `npm run lint`: run ESLint fixes.
- `npm run test` / `npm run test:cov`: run Jest tests.

Mobile commands:
- `cd mobile && npm start`: start Expo.
- `npm run ios`, `npm run android`, `npm run web`: launch platform targets.
- `npm run typecheck`: run TypeScript checks.
- `npm run lint`: run Expo lint.
- `npm test`: run Jest coverage.

## Coding Style & Naming Conventions

Use 2-space indentation, single quotes, trailing commas, camelCase identifiers, and PascalCase React components/classes. Prefer existing helpers and service patterns. Backend services should use `import 'dotenv/config'` and `ConfigModule.forRoot({ isGlobal: true })`. Keep DTOs per service; avoid shared DTO coupling.

## Testing Guidelines

Use Jest for backend and mobile tests. Add focused tests for changed business logic, API clients, guards, and user workflows. Run relevant checks before handoff: typecheck where available, lint, tests, and build/export for UI changes.

## Commit & Pull Request Guidelines

History is minimal, so use concise imperative commits such as `Refactor mobile booking flow`. Pull requests should include a summary, verification commands, linked issues, screenshots for UI changes, and notes for environment or migration changes.

## Agent-Specific Instructions

Prefer spec-driven development: define behavior, API contracts, data shape, and acceptance criteria before implementation. Keep specs near the feature or in `docs/`.
