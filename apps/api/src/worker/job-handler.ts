import type { Job } from "bullmq";

export type TExampleJobPayload = {
	noteId: string;
};

export const processExampleJob = async (
	job: Job<TExampleJobPayload>,
): Promise<void> => {
	console.log(`processing job ${job.id} for note ${job.data.noteId}`);
};
