import type { TJobHandler } from "@app/core";
import { logger } from "#/infrastructure/observability/logger.ts";

export type TExampleJobPayload = {
	noteId: string;
};

export const exampleJobProcess: TJobHandler<TExampleJobPayload> = async (
	payload,
): Promise<void> => {
	logger.info({ noteId: payload.noteId }, "processing job");
};
