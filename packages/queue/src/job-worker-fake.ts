import type { Channel, ConsumeMessage, Options } from "amqplib";
import { match, P } from "ts-pattern";
import { ATTEMPT_HEADER } from "./job-worker.ts";

export const QUEUE = "example";
export const MESSAGE_ID = "b7d1";
const PAYLOAD = { noteId: "note-1" };

export const RETRY_POLICY = {
	maxAttempts: 3,
	backoffBaseMs: 1_000,
	backoffFactor: 2,
};

export type TSent = {
	queue: string;
	content: Buffer;
	options: Options.Publish;
};

export type TChannelFake = {
	channel: Channel;
	sent: TSent[];
	asserted: string[];
	acked: ConsumeMessage[];
	deliver: (message: ConsumeMessage) => Promise<void>;
	failAck: (reason: string) => void;
};

const flush = async (): Promise<void> => {
	for (const _ of [0, 1, 2, 3]) {
		await new Promise<void>((resolve): void => {
			setImmediate(resolve);
		});
	}
};

export const channelFake = (): TChannelFake => {
	const sent: TSent[] = [];
	const asserted: string[] = [];
	const acked: ConsumeMessage[] = [];
	let consumer: ((message: ConsumeMessage | null) => void) | null = null;
	let ackFailure: string | null = null;

	const failAck = (reason: string): void => {
		ackFailure = reason;
	};

	const channel = {
		assertQueue: async (queue: string): Promise<unknown> => {
			asserted.push(queue);
			return undefined;
		},
		prefetch: async (): Promise<unknown> => undefined,
		consume: async (
			_queue: string,
			handler: (message: ConsumeMessage | null) => void,
		): Promise<unknown> => {
			consumer = handler;
			return undefined;
		},
		sendToQueue: (
			queue: string,
			content: Buffer,
			options: Options.Publish,
		): boolean => {
			sent.push({ queue, content, options });
			return true;
		},
		ack: (message: ConsumeMessage): void => {
			match(ackFailure)
				.with(P.nullish, (): void => {
					acked.push(message);
				})
				.otherwise((reason): void => {
					throw new Error(reason);
				});
		},
		nack: (): void => undefined,
	} as unknown as Channel;

	const deliver = async (message: ConsumeMessage): Promise<void> => {
		consumer?.(message);
		await flush();
	};

	return { channel, sent, asserted, acked, deliver, failAck };
};

export const malformedMessage = (): ConsumeMessage =>
	({
		content: Buffer.from("{ this is not json"),
		fields: { routingKey: QUEUE },
		properties: { messageId: MESSAGE_ID, headers: {} },
	}) as unknown as ConsumeMessage;

export const messageOf = (attempt?: number): ConsumeMessage =>
	({
		content: Buffer.from(JSON.stringify(PAYLOAD)),
		fields: { routingKey: QUEUE },
		properties: {
			messageId: MESSAGE_ID,
			headers: attempt === undefined ? {} : { [ATTEMPT_HEADER]: attempt },
		},
	}) as unknown as ConsumeMessage;
