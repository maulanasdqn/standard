import { describe, expect, it, vi } from "vitest";
import { jobDedupeFake } from "./job-dedupe-fake.ts";
import { retryQueueNameOf } from "./job-names.ts";
import { jobWorkerCreate } from "./job-worker.ts";
import {
	channelFake,
	messageOf,
	QUEUE,
	RETRY_POLICY,
} from "./job-worker-fake.ts";

describe("jobWorkerCreate failures", () => {
	it("retries rather than dead letters when the dedupe claim itself fails", async () => {
		const fake = channelFake();
		const onError = vi.fn();
		const dedupe = {
			claim: async (): Promise<boolean> => {
				throw new Error("cache unreachable");
			},
			release: async (): Promise<void> => undefined,
		};

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler: async (): Promise<void> => undefined,
			dedupe,
			retry: RETRY_POLICY,
			onError,
		});
		await fake.deliver(messageOf());

		expect(fake.sent).toHaveLength(1);
		expect(fake.sent[0]?.queue).toBe(retryQueueNameOf(QUEUE));
		expect(fake.acked).toHaveLength(1);
		expect(onError).toHaveBeenCalledTimes(1);
	});

	it("still retries and acks when releasing the claim fails", async () => {
		const fake = channelFake();
		const dedupe = {
			claim: async (): Promise<boolean> => true,
			release: async (): Promise<void> => {
				throw new Error("cache unreachable");
			},
		};

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
		expect(fake.acked).toHaveLength(1);
	});

	it("reports rather than rejects when the channel itself fails", async () => {
		const fake = channelFake();
		const onError = vi.fn();

		fake.failAck("channel closed");

		await jobWorkerCreate({
			name: QUEUE,
			channel: fake.channel,
			handler: async (): Promise<void> => undefined,
			dedupe: jobDedupeFake(),
			onError,
		});
		await fake.deliver(messageOf());

		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
	});
});
