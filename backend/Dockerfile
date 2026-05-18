# syntax=docker/dockerfile:1

FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=github_token \
  GITHUB_TOKEN="$(cat /run/secrets/github_token 2>/dev/null || true)" npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm run build \
  && npm prune --omit=dev

FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ARG SERVICE_MAIN=dist/apps/api-gateway/src/main.js
ENV SERVICE_MAIN=${SERVICE_MAIN}

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["sh", "-c", "node \"$SERVICE_MAIN\""]
