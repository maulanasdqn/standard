import type { Job } from "bullmq";

export type TExampleJobPayload = {
	noteId: string;
};

/** Placeholder job processor — swap in real work (email, indexing, exports, ...). */
export const processExampleJob = async (
	job: Job<TExampleJobPayload>,
): Promise<void> => {
	console.log(`processing job ${job.id} for note ${job.data.noteId}`);
};
