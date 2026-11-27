import { describe, expect, it, vi } from "vitest";
import { jobDedupeFake } from "./job-dedupe-fake.ts";
import { deadLetterQueueNameOf, retryQueueNameOf } from "./job-names.ts";
import { ATTEMPT_HEADER, jobWorkerCreate } from "./job-worker.ts";
import {
	channelFake,
	MESSAGE_ID,
	malformedMessage,
	messageOf,
	QUEUE,
	RETRY_POLICY,
} from "./job-worker-fake.ts";

describe("jobWorkerCreate", () => {
	it("declares the retry and dead letter queues alongside the main one", async () => {
		const fake = channelFake();

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler: async (): Promise<void> => undefined,
			dedupe: jobDedupeFake(),
		});

		expect(fake.asserted).toContain(QUEUE);
		expect(fake.asserted).toContain(retryQueueNameOf(QUEUE));
		expect(fake.asserted).toContain(deadLetterQueueNameOf(QUEUE));
	});

	it("acks a successful job without republishing it", async () => {
		const fake = channelFake();
		const handler = vi.fn(async (): Promise<void> => undefined);

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler,
			dedupe: jobDedupeFake(),
		});
		await fake.deliver(messageOf());

		expect(handler).toHaveBeenCalledTimes(1);
		expect(fake.acked).toHaveLength(1);
		expect(fake.sent).toHaveLength(0);
	});

	it("routes a failed job to the retry queue with a backoff and a raised attempt", async () => {
		const fake = channelFake();
		const dedupe = jobDedupeFake();

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler: async (): Promise<void> => {
				throw new Error("boom");
			},
			dedupe,
			retry: RETRY_POLICY,
		});
		await fake.deliver(messageOf());

		expect(fake.sent).toHaveLength(1);
		expect(fake.sent[0]?.queue).toBe(retryQueueNameOf(QUEUE));
		expect(fake.sent[0]?.options.expiration).toBe("1000");
		expect(fake.sent[0]?.options.headers).toMatchObject({
			[ATTEMPT_HEADER]: 2,
		});
		expect(fake.acked).toHaveLength(1);
		expect(dedupe.claimed.has(MESSAGE_ID)).toBe(false);
	});

	it("routes a job to the dead letter queue once the attempts are exhausted", async () => {
		const fake = channelFake();

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler: async (): Promise<void> => {
				throw new Error("boom");
			},
			dedupe: jobDedupeFake(),
			retry: RETRY_POLICY,
		});
		await fake.deliver(messageOf(RETRY_POLICY.maxAttempts));

		expect(fake.sent).toHaveLength(1);
		expect(fake.sent[0]?.queue).toBe(deadLetterQueueNameOf(QUEUE));
		expect(fake.acked).toHaveLength(1);
	});

	it("dead letters a malformed payload instead of leaving it unacked", async () => {
		const fake = channelFake();
		const handler = vi.fn(async (): Promise<void> => undefined);
		const onError = vi.fn();

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler,
			dedupe: jobDedupeFake(),
			retry: RETRY_POLICY,
			onError,
		});
		await fake.deliver(malformedMessage());

		expect(handler).not.toHaveBeenCalled();
		expect(fake.sent).toHaveLength(1);
		expect(fake.sent[0]?.queue).toBe(deadLetterQueueNameOf(QUEUE));
		expect(fake.acked).toHaveLength(1);
		expect(onError).not.toHaveBeenCalled();
	});

	it("processes a repeated message id only once", async () => {
		const fake = channelFake();
		const handler = vi.fn(async (): Promise<void> => undefined);
		const dedupe = jobDedupeFake();

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler,
			dedupe,
		});
		await fake.deliver(messageOf());
		await fake.deliver(messageOf());

		expect(handler).toHaveBeenCalledTimes(1);
		expect(fake.acked).toHaveLength(2);
		expect(fake.sent).toHaveLength(0);
	});
});
