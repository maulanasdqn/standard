import type { Channel, ConsumeMessage } from "amqplib";
import { match, P } from "ts-pattern";
import type { TJobDedupe } from "./job-dedupe.ts";
import { deadLetterQueueNameOf, retryQueueNameOf } from "./job-names.ts";
import { jobTopologyAssert } from "./job-topology.ts";

export const ATTEMPT_HEADER = "x-attempt";

const FIRST_ATTEMPT = 1;
const ATTEMPT_STEP = 1;
const PREFETCH_COUNT = 1;

export const JOB_RETRY_DEFAULT = {
	maxAttempts: 5,
	backoffBaseMs: 1_000,
	backoffFactor: 2,
} as const;

export type TJobHandler<TPayload> = (
	payload: TPayload,
	message: ConsumeMessage,
) => Promise<void>;

export type TJobRetryPolicy = {
	maxAttempts: number;
	backoffBaseMs: number;
	backoffFactor: number;
};

export type TJobWorkerOptions<TPayload> = {
	name: string;
	channel: Channel;
	handler: TJobHandler<TPayload>;
	dedupe: TJobDedupe;
	retry?: TJobRetryPolicy;
};

const messageIdOf = (message: ConsumeMessage): string | undefined =>
	message.properties.messageId ?? undefined;

export const attemptOf = (message: ConsumeMessage): number =>
	match(Number(message.properties.headers?.[ATTEMPT_HEADER]))
		.with(
			P.when(
				(value: number): boolean =>
					Number.isInteger(value) && value >= FIRST_ATTEMPT,
			),
			(found): number => found,
		)
		.otherwise((): number => FIRST_ATTEMPT);

export const backoffMsFor = (
	attempt: number,
	policy: TJobRetryPolicy,
): number =>
	policy.backoffBaseMs * policy.backoffFactor ** (attempt - ATTEMPT_STEP);

export const jobWorkerCreate = async <TPayload>(
	options: TJobWorkerOptions<TPayload>,
): Promise<void> => {
	const { name, channel, handler, dedupe } = options;
	const policy = options.retry ?? JOB_RETRY_DEFAULT;

	await jobTopologyAssert(name, channel);
	await channel.prefetch(PREFETCH_COUNT);

	const claimFor = async (message: ConsumeMessage): Promise<boolean> =>
		match(messageIdOf(message))
			.with(P.nullish, (): Promise<boolean> => Promise.resolve(true))
			.otherwise((id): Promise<boolean> => dedupe.claim(id));

	const releaseFor = async (message: ConsumeMessage): Promise<void> =>
		match(messageIdOf(message))
			.with(P.nullish, (): Promise<void> => Promise.resolve(undefined))
			.otherwise((id): Promise<void> => dedupe.release(id));

	const publishRetry = (message: ConsumeMessage, attempt: number): void => {
		channel.sendToQueue(retryQueueNameOf(name), message.content, {
			persistent: true,
			messageId: messageIdOf(message),
			expiration: String(backoffMsFor(attempt, policy)),
			headers: { [ATTEMPT_HEADER]: attempt + ATTEMPT_STEP },
		});
	};

	const publishDeadLetter = (message: ConsumeMessage): void => {
		channel.sendToQueue(deadLetterQueueNameOf(name), message.content, {
			persistent: true,
			messageId: messageIdOf(message),
			headers: message.properties.headers,
		});
	};

	const onFailure = async (message: ConsumeMessage): Promise<void> => {
		const attempt = attemptOf(message);
		await releaseFor(message);

		match(attempt >= policy.maxAttempts)
			.with(true, (): void => publishDeadLetter(message))
			.otherwise((): void => publishRetry(message, attempt));

		channel.ack(message);
	};

	const processMessage = async (message: ConsumeMessage): Promise<void> =>
		match(await claimFor(message))
			.with(false, async (): Promise<void> => {
				channel.ack(message);
			})
			.otherwise(async (): Promise<void> => {
				const payload = JSON.parse(message.content.toString()) as TPayload;
				return handler(payload, message)
					.then((): void => channel.ack(message))
					.catch((): Promise<void> => onFailure(message));
			});

	await channel.consume(name, (message): void => {
		match(message)
			.with(P.nullish, (): void => undefined)
			.otherwise((found): void => {
				void processMessage(found);
			});
	});
};
