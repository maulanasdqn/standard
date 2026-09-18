# Alerting

An alert without a named owner is a notification nobody acts on, so every alert below names one. `fradotech` is the default owner and receives anything not reassigned. Reassign by editing the row, not by adding a second name: two owners means neither of them is.

## What pages

| Alert | Condition | Severity | Runbook | Owner |
|---|---|---|---|---|
| API not ready | `GET /ready` non-200 for 2 minutes on any replica | Page | [Readiness is failing](runbooks.md#readiness-is-failing) | fradotech |
| API down | `GET /healthz` unreachable for 2 minutes | Page | [A deploy made things worse](runbooks.md#a-deploy-made-things-worse) | fradotech |
| Postgres unreachable | Readiness reports `database` down, or the server refuses connections | Page | [Postgres is unreachable](runbooks.md#postgres-is-unreachable) | fradotech |
| Error rate | 5xx above 2% of requests over 5 minutes | Page | Start from the request log, filter by `reqId` | fradotech |
| Redis unreachable | Readiness reports `cache` down for 5 minutes | Ticket | [Redis is unreachable](runbooks.md#redis-is-unreachable) | fradotech |
| Dead letter queue non-empty | `<queue>.dlq` depth above 0 for 15 minutes | Ticket | [Jobs are piling up](runbooks.md#jobs-are-piling-up-in-the-dead-letter-queue) | fradotech |
| Queue backlog | Main queue depth above 1000, or rising for 30 minutes | Ticket | [Jobs are not being processed](runbooks.md#jobs-are-not-being-processed-at-all) | fradotech |
| Backup missing | No successful dump in 26 hours | Ticket | [backup-restore.md](backup-restore.md) | fradotech |
| Restore drill overdue | No recorded drill in 100 days | Ticket | [The drill](backup-restore.md#the-drill) | fradotech |

**Page** means wake someone. **Ticket** means it waits for working hours. Anything that cannot be sorted into one of those two does not belong on this list.

A single default owner is honest for a team of this size, and it is better than an empty column, but it is not a rota. Once a second person shares the pager, split the rows by the system each person knows best rather than round-robining them.

## Why these thresholds

The two minute windows on readiness and liveness are longer than a rolling deploy takes to move a single replica, so a normal deploy does not page anyone. The dead-letter alert waits 15 minutes because a single poison message during a deploy is common and self-resolves once the deploy finishes; a depth that is still climbing after 15 minutes is a real handler bug.

The backup alert fires at 26 hours rather than 24 so that a nightly job which merely ran late does not page. The restore drill alert at 100 days gives most of a quarter of slack against the quarterly target.

## What is not wired yet

There is no metrics pipeline. `apps/api/src/main.ts` emits structured request logs through pino with `reqId`, method, path, status and duration, and that is the only signal the application produces today. Every alert above therefore has to be driven by either an external HTTP probe against `/healthz` and `/ready`, log-based rules over the request lines, or the broker's and database's own metrics.

Error rate and latency alerts need the request logs shipped somewhere queryable. That is the dependency to close first, and it is tracked as the `Monitoring beyond logs` row in [../kpi/README.md](../kpi/README.md).
