import "#/bootstrap/polyfill.ts";

import { createQueueWorker } from "@app/core";
import { compose } from "#/bootstrap/compose.ts";
import { env } from "#/infrastructure/config/env.ts";
import { logger } from "#/infrastructure/observability/logger.ts";
import {
	processExampleJob,
	type TExampleJobPayload,
} from "#/worker/job-handler.ts";

const { queueChannel } = await compose();

await createQueueWorker<TExampleJobPayload>(
	"example",
	queueChannel,
	processExampleJob,
);

logger.info({ env: env.NODE_ENV }, "worker started");
