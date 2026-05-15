# ServEase Backend

NestJS HTTP microservices backend for ServEase.

## Apps

- `apps/api-gateway`: public API gateway on port `5001`.
- `apps/*-service`: internal HTTP services on ports `8501` through `8511`.
- `libs/common`: shared infrastructure helpers only.
- `database`: database migrations and schema notes.

## Commands

```sh
npm run dev
npm run start:gateway:dev
npm run start:auth
npm run build
npm run lint
npm run test
npm run test:cov
```

## Rules

- Services communicate through HTTP only.
- The gateway does not access service databases.
- DTOs stay inside the owning service.
- Shared code is limited to generic helpers such as config, logging, health, and HTTP utilities.
