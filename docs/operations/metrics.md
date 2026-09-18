# Metrics

The API exposes Prometheus text on `GET /metrics`. Until this existed the only signal the application produced was a request log line, which meant the error rate and latency alerts in [alerting.md](alerting.md) had nothing to fire on unless the logs were shipped somewhere queryable first.

## What is exposed

| Metric | Type | Labels | Answers |
|---|---|---|---|
| `http_requests_total` | counter | `method`, `route`, `status` | Request volume, and the 5xx share that the error rate alert needs |
| `http_request_duration_seconds` | histogram | `method`, `route`, `status` | Latency percentiles per route, from ten buckets between 10ms and 10s. Read the route caveat below before trusting this per endpoint |
| `process_*`, `nodejs_*` | gauges and counters | none | Memory, CPU, event loop lag, garbage collection and handle counts |

Every series carries `service="api"`.

**The `route` label is the matched route template, never the request path.** A label whose values are unbounded turns a time series database into an outage, so the template is what gets recorded. A request that matches no route is labelled `unmatched` rather than left blank.

The consequence is worth stating plainly, because it limits what these numbers can answer. The RPC and REST surfaces are each mounted behind one wildcard, so every call through them collapses into a single series. Checked against a running API:

```
http_requests_total{method="GET",route="/healthz",status="200"}  1
http_requests_total{method="POST",route="/rpc/*",status="200"}   1
http_requests_total{method="GET",route="/api/*",status="200"}    1
http_requests_total{method="GET",route="/api/*",status="401"}    1
```

So error rate and overall latency are answerable, including error rate per surface, which is what the alert in [alerting.md](alerting.md) needs. **Latency for one specific endpoint is not**, because `note.list` and `user.create` are the same series. Resolving that means labelling RPC calls by their procedure path, which is a closed set and therefore safe, unlike the REST paths that carry resource ids. That is worth doing when someone needs per-endpoint latency, and not before.

## Reaching it

The endpoint is served on the application's own origin, next to the SPA, so it is reachable by anyone who can reach the site. That is why a token guards it.

| Variable | Default | Effect |
|---|---|---|
| `METRICS_ENABLED` | `true` | `false` does not register the route at all, so the endpoint 404s |
| `METRICS_TOKEN` | unset | When set, a scrape must send `Authorization: Bearer <token>`. At least 32 characters |

**In production the API refuses to start with metrics enabled and no token.** `envSchema` treats it the way it treats a weak authentication secret, because the alternative is publishing process internals and route names to the internet by default.

That rule applies to every process that reads the environment, including the worker, which serves no HTTP and therefore has no `/metrics` to protect. `docker-compose.staging.yml` sets `METRICS_ENABLED: "false"` on the worker for exactly that reason. A worker that will not boot in production is usually this.

A scrape looks like this:

```sh
curl -H "Authorization: Bearer $METRICS_TOKEN" https://staging.example.com/metrics
```

Rotate the token the way any other secret is rotated, and record it in [credentials.md](credentials.md).

## What is still missing

There is no tracing yet: no span propagation, and no exporter. A slow request shows up as a latency bucket and a log line, and finding out which query made it slow still means reading the code.

Job outcomes are not counted here either. The worker has no HTTP surface to scrape, and queue depth, retries and dead letters are already visible in the broker's own metrics, which is where the queue alerts in [alerting.md](alerting.md) read them from. A counter in the application would be a second, less reliable copy.
