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

Migrations are the constraint: there is no `down` migration, so a rollback of code is safe only while the newer schema still satisfies the older code. A rollback across a destructive migration is not a rollback at all, it is a restore, and it belongs in [backup-restore.md](backup-restore.md). Keeping that from happening is what the next section is for.

## Expand and contract

**A migration may not break the code that is currently running.** During a rolling deploy both the old and the new build serve traffic at the same time, so any change that the old build cannot survive takes the site down the moment it lands, and rolling the code back does not bring it up again.

Every schema change is therefore split across two releases:

| Phase | Release | What it does |
|---|---|---|
| Expand | First | Add the new column or table. It is nullable or has a default, so existing rows need no backfill. The new build writes to both the old and the new shape |
| Contract | Second, once the first is fully rolled out | Remove the old column or table. Nothing reads it any more, so nothing breaks |

That means renaming a column is never one migration. Add the new one, backfill it, write to both, and drop the old one in a later release. The same applies to dropping anything, and to tightening an existing column to `NOT NULL`, which fails on the next insert from a build that still writes null.

Additive changes are unaffected. `CREATE TABLE`, `CREATE INDEX`, and `ADD COLUMN` with a default or nullable are safe in a single release, and that is the large majority of schema work.

### Enforcement

`moon run api:migrations` fails the build on `DROP COLUMN`, `RENAME COLUMN`, `DROP TABLE`, and `SET NOT NULL` in `apps/api/drizzle`. It runs in CI as a dependency of `api:build`, so an unsafe migration cannot reach `trunk` by being missed in review.

The contract phase is legitimate, so there is a way through. Put this at the top of the migration file:

```sql
-- migration-safety: contract-phase
```

That marks the removal as the deliberate second half of an expand and contract, and it is visible in the diff, so the reviewer sees the claim being made rather than a rule quietly bypassed. Use it when the expand phase is already deployed everywhere, and not before.

`0003_brown_silk_fever.sql` renamed two columns in a single migration and predates this policy. It is listed as an exception in `apps/api/scripts/migration-rules.ts` rather than rewritten, since it shipped long ago. It is also the concrete example of what this rule exists to prevent.

## Staged rollout

Not implemented. There are no feature flags and no canary. Until there are, treat every deploy as all-or-nothing and keep the previous image tag ready.
