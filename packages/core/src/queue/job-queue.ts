import { createHash } from "node:crypto";
import type { Channel, ConsumeMessage } from "amqplib";
import { match, P } from "ts-pattern";

const idempotencyMessageId = (name: string, payload: unknown): string =>
	createHash("sha256")
		.update(`${name}:${JSON.stringify(payload)}`)
		.digest("hex");

export type TJobQueue<TPayload> = {
	add: (payload: TPayload) => Promise<boolean>;
};

export const createJobQueue = <TPayload>(
	name: string,
	channel: Channel,
): TJobQueue<TPayload> => ({
	add: async (payload: TPayload): Promise<boolean> => {
		await channel.assertQueue(name, { durable: true });
		return channel.sendToQueue(name, Buffer.from(JSON.stringify(payload)), {
			persistent: true,
			messageId: idempotencyMessageId(name, payload),
		});
	},
});

export type TJobHandler<TPayload> = (
	payload: TPayload,
	message: ConsumeMessage,
) => Promise<void>;

export const createQueueWorker = async <TPayload>(
	name: string,
	channel: Channel,
	handler: TJobHandler<TPayload>,
): Promise<void> => {
	await channel.assertQueue(name, { durable: true });
	await channel.prefetch(1);

	await channel.consume(name, (message) => {
		match(message)
			.with(P.nullish, () => undefined)
			.otherwise((found) => {
				const payload = JSON.parse(found.content.toString()) as TPayload;
				handler(payload, found)
					.then(() => channel.ack(found))
					.catch(() => channel.nack(found, false, false));
			});
	});
};
