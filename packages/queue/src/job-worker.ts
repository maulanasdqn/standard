import type { Channel, ConsumeMessage } from "amqplib";
import { match, P } from "ts-pattern";

export type TJobHandler<TPayload> = (
	payload: TPayload,
	message: ConsumeMessage,
) => Promise<void>;

export const jobWorkerCreate = async <TPayload>(
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
