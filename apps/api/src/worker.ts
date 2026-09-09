import "#/polyfill.ts";

import { createBullWorker } from "@app/core";
import { compose } from "#/compose.ts";
import { env } from "#/infrastructure/config/env.ts";
import { logger } from "#/infrastructure/observability/logger.ts";
import {
	processExampleJob,
	type TExampleJobPayload,
} from "#/worker/job-handler.ts";

const { cache } = compose();

const worker = createBullWorker<TExampleJobPayload>(
	"example",
	cache,
	processExampleJob,
);

worker.on("completed", (job): void => {
	logger.info({ jobId: job.id }, "job completed");
});
worker.on("failed", (job, error): void => {
	logger.error({ jobId: job?.id, err: error }, "job failed");
});

logger.info({ env: env.NODE_ENV }, "worker started");
