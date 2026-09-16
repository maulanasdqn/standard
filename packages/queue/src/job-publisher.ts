import { createHash } from "node:crypto";
import type { Channel } from "amqplib";
import { jobTopologyAssert } from "./job-topology.ts";

const idempotencyMessageId = (name: string, payload: unknown): string =>
	createHash("sha256")
		.update(`${name}:${JSON.stringify(payload)}`)
		.digest("hex");

export type TJobQueue<TPayload> = {
	add: (payload: TPayload) => Promise<boolean>;
};

export const jobPublisherCreate = <TPayload>(
	name: string,
	channel: Channel,
): TJobQueue<TPayload> => ({
	add: async (payload: TPayload): Promise<boolean> => {
		await jobTopologyAssert(name, channel);
		return channel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), {
			persistent: true,
			messageId: idempotencyMessageId(name, payload),
		});
	},
});
