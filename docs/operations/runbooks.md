# Runbooks

One section per failure that is expected to happen. Each starts with how you know, because an alert that nobody can act on is noise.

## Readiness is failing

**You know because** `GET /ready` answers 503 and names the dependency, and the orchestrator has pulled the pod out of rotation.

The response body lists each dependency, so read it before guessing:

```sh
curl -s https://<host>/ready | jq
```

| `dependencies` says | Go to |
|---|---|
| `database` down | [Postgres is unreachable](#postgres-is-unreachable) |
| `cache` down | [Redis is unreachable](#redis-is-unreachable) |

Readiness probes with a 2 second timeout, so a dependency that is merely slow reads as down. That is deliberate: a request that would hang is not better than a request that is refused.

## Postgres is unreachable

**Impact** Total outage. Every request that touches data fails and readiness keeps the process out of rotation.

1. Confirm from outside the app: `psql "$DATABASE_URL" -c 'select 1'`.
2. If the server is up but refusing connections, check the connection count against `max_connections`. The API uses a `pg` pool per process, so replica count multiplies it.
3. If it is a failover, wait for the new primary and confirm `DATABASE_URL` resolves to it. The app does not retry a DNS change on its own; restart the replicas once the endpoint moves.
4. If the database is gone rather than unreachable, this is a restore. Go to [backup-restore.md](backup-restore.md).

## Redis is unreachable

**Impact** Rate limiting fails **closed**, so authentication endpoints start rejecting real users with 429. Job de-duplication also stops, so a retried job can run twice.

This is deliberate in `apps/api/src/platform/http/rate-limit.ts`: an unavailable limiter refuses rather than waves everything through, because open would turn a Redis outage into a credential-stuffing window.

1. Confirm: `redis-cli -u "$REDIS_URL" ping`.
2. Restore Redis. No data migration is needed; counters and claims rebuild themselves.
3. Do not "fix" this by making the limiter fail open. If the outage is long and sign-in must keep working, raise `RATE_LIMIT_MAX` deliberately and put it back afterwards.

## Jobs are piling up in the dead-letter queue

**You know because** the depth of `<queue>.dlq` is above zero and climbing.

A message reaches the dead-letter queue only after exhausting its retry budget, so this means a handler failed repeatedly for the same payload.

1. Inspect without consuming, through the RabbitMQ management UI or `rabbitmqadmin get queue=<queue>.dlq requeue=true`.
2. Read the API logs for the handler error. Every request line carries `reqId`; worker failures carry the job payload.
3. Fix the cause, deploy, then republish the dead-lettered messages back to the main queue.
4. Republishing is safe against duplicates: the consumer claims each message id before running the handler, so a message already processed is acknowledged and skipped.

Do not purge the dead-letter queue to make the number go down. It is the only copy of that work.

## Jobs are not being processed at all

**Impact** The main queue depth climbs and nothing drains it.

1. Check the worker process is running at all. It is separate from the API and is easy to forget in a deploy.
2. Check RabbitMQ is reachable from the worker. A worker started while the broker is down waits and retries for about a minute before giving up and exiting, so the orchestrator restarts it; a worker that exits repeatedly means the broker has been unreachable for longer than that.
3. Confirm the worker is consuming: the main queue should show a consumer count above zero.

## A deploy made things worse

1. Confirm which build is live: `curl -s https://<host>/health | jq .version`. The two versions on `/health`, web and API, differing means they were deployed out of step.
2. Redeploy the previous image tag.
3. If the release carried a destructive migration, a code rollback is not enough. Go to [backup-restore.md](backup-restore.md).

## Someone reports a 409 when saving a note

Not an incident. Notes carry a version and a stale edit is refused rather than allowed to overwrite. The message tells the editor to reload. See the scope note in [../kpi/README.md](../kpi/README.md) for why this guard is on notes and not everywhere.
