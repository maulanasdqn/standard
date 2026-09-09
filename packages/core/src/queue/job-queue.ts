import { createHash } from "node:crypto";
import { Queue, Worker, type Processor } from "bullmq";
import type { Redis } from "ioredis";

const idempotencyJobId = (name: string, payload: unknown): string =>
	createHash("sha256")
		.update(`${name}:${JSON.stringify(payload)}`)
		.digest("hex");

/**
 * Creates a BullMQ queue whose `add` dedupes jobs by a sha256 of (name, payload) —
 * enqueuing the same logical job twice is a no-op rather than a duplicate.
 */
export const createJobQueue = <TPayload>(name: string, connection: Redis) => {
	// BullMQ's Queue<Data, Result, Name> conditional types can't infer cleanly through a
	// generic TPayload — fall back to `any` here; the public `add` below stays fully typed.
	// biome-ignore lint/suspicious/noExplicitAny: see comment above
	const queue = new Queue<any, any, string>(name, { connection });

	return {
		queue: queue as Queue<TPayload>,
		add: (payload: TPayload) =>
			queue.add(name, payload, { jobId: idempotencyJobId(name, payload) }),
	};
};

export const createBullWorker = <TPayload>(
	name: string,
	connection: Redis,
	processor: Processor<TPayload>,
) => new Worker<TPayload>(name, processor, { connection });
