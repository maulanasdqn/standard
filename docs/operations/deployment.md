# Deployment

## The artifact

One image builds both processes. `Dockerfile` installs the workspace from the lockfile, builds the SPA, and starts the API with `WEB_DIST_PATH` pointed at the built assets so a single container serves both.

```sh
make image        # build, tagged with the root package.json version and latest
make image-run    # run it against the local services
```

The image is tagged with the root `package.json` version, which is the same value `/health` reports at runtime. That is what lets you confirm which build is actually live rather than which build you believe you deployed.

## Order of operations

Migrations are forward-only and run as a separate step, never on process start, so that two API replicas coming up at once cannot race each other.

1. Build and push the image for the commit.
2. Run `pnpm --filter @app/api migrate` once, as a job, against the target database.
3. Roll the API replicas.
4. Roll the worker replicas.

Step 2 before step 3 means the schema must stay backward compatible with the currently running code for the duration of the roll. Add columns as nullable or with a default, and remove them in a later release once nothing reads them.

## Probes

| Probe | Endpoint | Meaning |
|---|---|---|
| Liveness | `GET /healthz` | The process is alive. It never checks a dependency, because restarting a process does not fix a dead database |
| Readiness | `GET /ready` | The process can serve. It probes Postgres and Redis and answers 503 when either is down |

Point the orchestrator's liveness probe at `/healthz` and its readiness probe at `/ready`. Wiring liveness to `/ready` causes a restart loop during any dependency blip.

## Rollback

Roll back by deploying the previous image tag. Confirm with `/health`, which reports the version that is actually running.

Migrations are the constraint: there is no `down` migration, so a rollback of code is safe only while the newer schema still satisfies the older code. That is the reason for the backward-compatible migration rule above. A rollback across a destructive migration is a restore, not a rollback, and belongs in [backup-restore.md](backup-restore.md).

## Staged rollout

Not implemented. There are no feature flags and no canary. Until there are, treat every deploy as all-or-nothing and keep the previous image tag ready.
