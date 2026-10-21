---
title: Deploy Standard as one image
description: Build one container that serves the API, the app and the landing page, migrate before rolling it out, and point your probes at the right endpoints.
publishedAt: 2026-10-21
tags:
  - deployment
  - operations
---

Standard ships as a single image. It holds the API, the built app and the built landing page, and the background worker runs from the same image with a different command. There is no build step for the API itself: Node runs the TypeScript sources directly.

## Build the image

```sh
make image
```

The image is tagged with the version in the root `package.json` and with `latest`. The landing page is static, so the address it names in its canonical links and sitemap is fixed when the image is built. Pass the public origin when you build an image that will serve it:

```sh
docker build --build-arg LANDING_SITE_URL=https://example.com -t standard:latest .
```

## Choose what the API serves

One API process answers on one origin:

| Path | Served when |
|---|---|
| `/api` and `/rpc` | Always |
| `/app/` | `WEB_DIST_PATH` is set, which the image does for you |
| `/` | `LANDING_DIST_PATH` is set to `/app/apps/landing/dist`; without it, `/` redirects to `/app/` |

The landing page is served with a Content-Security-Policy that allows scripts and styles from the same origin only. A page you add to it therefore carries no inline script or style, and the landing's own tests fail a build that does.

## Roll out in order

Migrations run as their own step, never when a process starts, so two API replicas starting at once cannot race each other:

1. Build and push the image for the commit
2. Run the migrations once against the target database, with `node src/scripts/migrate.ts` inside the image
3. Roll the API replicas
4. Roll the worker replicas, which run `node src/worker/run.ts`

Because the migrations run before the new code, the schema has to stay compatible with the code that is still running. Add a column as nullable or with a default, and remove an old one in a later release once nothing reads it.

## Point the probes at the right endpoints

| Probe | Endpoint | Answers |
|---|---|---|
| Liveness | `GET /healthz` | The process is alive, without checking any dependency |
| Readiness | `GET /ready` | Whether Postgres and Redis can be reached, with a 503 when either cannot |

Wiring liveness to `/ready` restarts healthy processes during every short database outage, so keep the two apart.

## Confirm what is live

```sh
curl -s https://example.com/api/health
```

The response names the version that is actually serving, which is the same tag the image was built with. To roll back, deploy the previous tag and check this endpoint again. A rehearsal environment is described in `docker-compose.staging.yml`, driven by `make staging-up`, `make staging-migrate` and `make staging-down`.
