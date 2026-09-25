FROM node:24.16.0-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
WORKDIR /app

FROM base AS manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages ./packages

FROM manifests AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @app/web build

FROM manifests AS production-deps
RUN pnpm install --frozen-lockfile --prod --no-optional --filter-prod "@app/api..."

FROM node:24.16.0-alpine AS runtime
ENV NODE_ENV=production
ENV WEB_DIST_PATH=/app/apps/web/dist
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node apps/api ./apps/api
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=production-deps --chown=node:node /app/packages ./packages
COPY --from=production-deps --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=node:node /app/apps/web/dist ./apps/web/dist
WORKDIR /app/apps/api
EXPOSE 3001
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT ?? 3001) + '/healthz').then((response) => process.exit(response.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "src/main.ts"]
