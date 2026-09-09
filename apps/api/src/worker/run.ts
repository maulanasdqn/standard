import "#/bootstrap/polyfill.ts";

import { createQueueWorker } from "@app/core";
import { Effect } from "effect";
import { runtime } from "#/bootstrap/compose.ts";
import { env } from "#/infrastructure/config/env.ts";
import { logger } from "#/infrastructure/observability/logger.ts";
import { QueueService } from "#/infrastructure/queue/rabbitmq.ts";
import {
	processExampleJob,
	type TExampleJobPayload,
} from "#/worker/job-handler.ts";

const { channel } = await runtime.runPromise(
	QueueService.use((service) => Effect.succeed(service)),
);

await createQueueWorker<TExampleJobPayload>(
	"example",
	channel,
	processExampleJob,
);

logger.info({ env: env.NODE_ENV }, "worker started");
