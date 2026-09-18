import "#/bootstrap/polyfill.ts";

import { jobWorkerCreate } from "@app/queue";
import { Effect } from "effect";
import { runtime } from "#/bootstrap/compose.ts";
import { CacheService } from "#/platform/cache/redis.ts";
import { env } from "#/platform/config/env.ts";
import { logger } from "#/platform/observability/logger.ts";
import { jobDedupeCreate } from "#/platform/queue/job-dedupe.ts";
import { QUEUE_NAME } from "#/platform/queue/queue-names.ts";
import { QueueService, queueChannelAwait } from "#/platform/queue/rabbitmq.ts";
import {
	exampleJobProcess,
	type TExampleJobPayload,
} from "#/worker/job-handler.ts";

const EXIT_FAILURE = 1;

const queue = await runtime.runPromise(
	QueueService.use((service) => Effect.succeed(service)),
);

const { client } = await runtime.runPromise(
	CacheService.use((service) => Effect.succeed(service)),
);

logger.info({ url: env.RABBITMQ_URL }, "worker waiting for the broker");

const channel = await runtime
	.runPromise(queueChannelAwait(queue))
	.catch((cause: unknown): never => {
		logger.error({ err: cause }, "worker gave up waiting for the broker");
		process.exit(EXIT_FAILURE);
	});

await jobWorkerCreate<TExampleJobPayload>({
	name: QUEUE_NAME.EXAMPLE,
	channel,
	handler: exampleJobProcess,
	dedupe: jobDedupeCreate(client),
});

logger.info({ env: env.NODE_ENV }, "worker started");
