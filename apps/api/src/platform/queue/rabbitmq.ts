import { connect, type Channel, type ChannelModel } from "amqplib";
import { Context, Effect, Layer } from "effect";
import { match } from "ts-pattern";
import { EQueue } from "#/shared/errors.ts";
import { env } from "#/platform/config/env.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { SERVICE_TAG } from "#/platform/service-tags.ts";

export const QUEUE_CONNECT_ATTEMPTS = 30;
export const QUEUE_CONNECT_DELAY_MS = 2_000;

const NO_ATTEMPTS_LEFT = 0;
const ONE_ATTEMPT = 1;

export type TQueueConnection = {
	model: ChannelModel;
	channel: Channel;
};

export const queueConnectionCreate = async (
	rabbitmqUrl: string,
): Promise<TQueueConnection> => {
	const model = await connect(rabbitmqUrl);
	const channel = await model.createChannel();
	return { model, channel };
};

export type TQueueService = {
	readonly channel: () => Effect.Effect<Channel, EQueue>;
};

export type TQueueServiceId = TServiceId<typeof SERVICE_TAG.QUEUE>;

export const QueueService = Context.Service<TQueueServiceId, TQueueService>(
	SERVICE_TAG.QUEUE,
);

type TQueueState = {
	current: TQueueConnection | null;
	opening: Promise<TQueueConnection> | null;
};

export type TQueueOpen = (rabbitmqUrl: string) => Promise<TQueueConnection>;

export const queueServiceCreate = (
	rabbitmqUrl: string,
	openConnection: TQueueOpen = queueConnectionCreate,
): TQueueService => {
	const state: TQueueState = { current: null, opening: null };

	const forget = (): void => {
		state.current = null;
		state.opening = null;
	};

	const open = async (): Promise<TQueueConnection> => {
		const created = await openConnection(rabbitmqUrl);
		created.model.on("error", forget);
		created.model.on("close", forget);
		state.current = created;
		state.opening = null;
		return created;
	};

	const opened = (): Promise<TQueueConnection> =>
		match(state.opening)
			.with(null, (): Promise<TQueueConnection> => {
				const started = open();
				state.opening = started;
				return started;
			})
			.otherwise((pending): Promise<TQueueConnection> => pending);

	const channel = (): Effect.Effect<Channel, EQueue> =>
		Effect.tryPromise({
			try: async (): Promise<Channel> =>
				match(state.current)
					.with(null, async (): Promise<Channel> => (await opened()).channel)
					.otherwise(async (found): Promise<Channel> => found.channel),
			catch: (cause): EQueue => {
				forget();
				return new EQueue({ cause });
			},
		});

	return { channel };
};

export const queueServiceLayer = Layer.effect(
	QueueService,
	Effect.sync(() => QueueService.of(queueServiceCreate(env.RABBITMQ_URL))),
);

export const queueChannelAwait = (
	service: TQueueService,
	attempts: number = QUEUE_CONNECT_ATTEMPTS,
	delayMs: number = QUEUE_CONNECT_DELAY_MS,
): Effect.Effect<Channel, EQueue> =>
	service.channel().pipe(
		Effect.catch(
			(error: EQueue): Effect.Effect<Channel, EQueue> =>
				match(attempts > NO_ATTEMPTS_LEFT)
					.with(false, (): Effect.Effect<Channel, EQueue> => Effect.fail(error))
					.otherwise(
						(): Effect.Effect<Channel, EQueue> =>
							Effect.sleep(delayMs).pipe(
								Effect.flatMap(() =>
									queueChannelAwait(service, attempts - ONE_ATTEMPT, delayMs),
								),
							),
					),
		),
	);
