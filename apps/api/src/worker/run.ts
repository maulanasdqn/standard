import "#/bootstrap/polyfill.ts";

import { queueWorkerCreate } from "@app/queue";
import { Effect } from "effect";
import { runtime } from "#/bootstrap/compose.ts";
import { env } from "#/infrastructure/config/env.ts";
import { logger } from "#/infrastructure/observability/logger.ts";
import { QueueService } from "#/infrastructure/queue/rabbitmq.ts";
import {
	exampleJobProcess,
	type TExampleJobPayload,
} from "#/worker/job-handler.ts";

const { channel } = await runtime.runPromise(
	QueueService.use((service) => Effect.succeed(service)),
);

await queueWorkerCreate<TExampleJobPayload>(
	"example",
	channel,
	exampleJobProcess,
);

logger.info({ env: env.NODE_ENV }, "worker started");
