import "#/bootstrap/polyfill.ts";

import { connectionUrlRedact } from "@app/logger";
import { A } from "@mobily/ts-belt";
import { jobWorkerCreate } from "@app/queue";
import { activityModule } from "#/activity/index.ts";
import { noteModule, type TNoteAttachmentSweepReport } from "#/note/index.ts";
import { Effect } from "effect";
import { match } from "ts-pattern";
import { runtime } from "#/bootstrap/compose.ts";
import { CacheService } from "#/platform/cache/redis.ts";
import { env } from "#/platform/config/env.ts";
import { logger } from "#/platform/observability/logger.ts";
import { jobDedupeCreate } from "#/platform/queue/job-dedupe.ts";
import { QUEUE_NAME } from "#/platform/queue/queue-names.ts";
import {
	QueueService,
	queueConnectionAwait,
	queueConnectionWatch,
} from "#/platform/queue/rabbitmq.ts";
import {
	SHUTDOWN_SIGNAL,
	SHUTDOWN_STEP,
	shutdownOn,
	shutdownRun,
} from "#/platform/shutdown.ts";
import {
	exampleJobProcess,
	type TExampleJobPayload,
} from "#/worker/job-handler.ts";

const EXIT_OK = 0;
const EXIT_FAILURE = 1;
const PRUNE_INTERVAL_MS = 86_400_000;
const SWEEP_INTERVAL_MS = 900_000;
const SWEEP_BATCH = 200;

const queue = await runtime.runPromise(
	QueueService.use((service) => Effect.succeed(service)),
);

const { client } = await runtime.runPromise(
	CacheService.use((service) => Effect.succeed(service)),
);

logger.info(
	{ broker: connectionUrlRedact(env.RABBITMQ_URL) },
	"worker waiting for the broker",
);

const connection = await runtime
	.runPromise(queueConnectionAwait(queue))
	.catch((cause: unknown): never => {
		logger.error({ err: cause }, "worker gave up waiting for the broker");
		process.exit(EXIT_FAILURE);
	});

const stopping = { started: false };

queueConnectionWatch(connection.model, (reason, cause): void => {
	match(stopping.started)
		.with(true, (): void => undefined)
		.otherwise((): void => {
			logger.error({ err: cause, reason }, "worker.broker.lost");
			process.exit(EXIT_FAILURE);
		});
});

shutdownOn(
	[SHUTDOWN_SIGNAL.TERM, SHUTDOWN_SIGNAL.INT],
	async (signal): Promise<void> => {
		stopping.started = true;
		logger.info({ signal }, "worker stopping");

		const drained = await shutdownRun({
			logger,
			steps: [
				{
					name: SHUTDOWN_STEP.RUNTIME,
					close: (): Promise<void> => runtime.dispose(),
				},
			],
		});

		process.exit(drained ? EXIT_OK : EXIT_FAILURE);
	},
);

await jobWorkerCreate<TExampleJobPayload>({
	name: QUEUE_NAME.EXAMPLE,
	channel: connection.channel,
	handler: exampleJobProcess,
	dedupe: jobDedupeCreate(client),
	onError: (cause, message): void => {
		logger.error(
			{
				err: cause,
				queue: QUEUE_NAME.EXAMPLE,
				messageId: message.properties.messageId,
			},
			"job.consume.failed",
		);
	},
});

logger.info({ env: env.NODE_ENV }, "worker started");

const prune = async (): Promise<void> => {
	const removed = await runtime
		.runPromise(activityModule.prune(env.ACTIVITY_RETENTION_DAYS))
		.catch((cause: unknown): number => {
			logger.error({ err: cause }, "activity prune failed");
			return 0;
		});

	logger.info(
		{ removed, retentionDays: env.ACTIVITY_RETENTION_DAYS },
		"activity prune finished",
	);
};

await prune();
setInterval((): void => {
	void prune();
}, PRUNE_INTERVAL_MS).unref();

const SWEEP_NOTHING: TNoteAttachmentSweepReport = { removed: 0, failed: [] };

const sweep = async (): Promise<void> => {
	const report = await runtime
		.runPromise(noteModule.attachmentSweep(SWEEP_BATCH))
		.catch((cause: unknown): TNoteAttachmentSweepReport => {
			logger.error({ err: cause }, "attachment sweep failed");
			return SWEEP_NOTHING;
		});

	A.forEach(report.failed, (failure): void => {
		logger.warn(
			{ err: failure.cause, storageKey: failure.storageKey },
			"attachment sweep deferred a key",
		);
	});

	logger.info(
		{ removed: report.removed, deferred: report.failed.length },
		"attachment sweep finished",
	);
};

await sweep();
setInterval((): void => {
	void sweep();
}, SWEEP_INTERVAL_MS).unref();
