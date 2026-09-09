import type { Job } from "bullmq";
import { logger } from "#/infrastructure/observability/logger.ts";

export type TExampleJobPayload = {
	noteId: string;
};

export const processExampleJob = async (
	job: Job<TExampleJobPayload>,
): Promise<void> => {
	logger.info({ jobId: job.id, noteId: job.data.noteId }, "processing job");
};
