import { createHash } from "node:crypto";
import { Queue, Worker, type Job, type Processor } from "bullmq";
import type { Redis } from "ioredis";

const idempotencyJobId = (name: string, payload: unknown): string =>
	createHash("sha256")
		.update(`${name}:${JSON.stringify(payload)}`)
		.digest("hex");

export type TJobQueue<TPayload> = {
	queue: Queue<TPayload>;
	add: (payload: TPayload) => Promise<Job<TPayload>>;
};

export const createJobQueue = <TPayload>(
	name: string,
	connection: Redis,
): TJobQueue<TPayload> => {
	// biome-ignore lint/suspicious/noExplicitAny: bullmq's Queue<Data, Result, Name> generics
	const queue = new Queue<any, any, string>(name, { connection });

	return {
		queue: queue as Queue<TPayload>,
		add: (payload: TPayload): Promise<Job<TPayload>> =>
			queue.add(name, payload, {
				jobId: idempotencyJobId(name, payload),
			}) as Promise<Job<TPayload>>,
	};
};

export const createBullWorker = <TPayload>(
	name: string,
	connection: Redis,
	processor: Processor<TPayload>,
): Worker<TPayload> => new Worker<TPayload>(name, processor, { connection });
