import { connect, type Channel, type ChannelModel } from "amqplib";
import { Context, Effect, Layer } from "effect";
import { EQueue } from "#/shared/errors.ts";
import { env } from "#/platform/config/env.ts";
import type { TServiceId } from "#/shared/service-id.ts";
import { SERVICE_TAG } from "#/platform/service-tags.ts";

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

export type TQueueService = { readonly channel: Channel };

export type TQueueServiceId = TServiceId<typeof SERVICE_TAG.QUEUE>;

export const QueueService = Context.Service<TQueueServiceId, TQueueService>(
	SERVICE_TAG.QUEUE,
);

export const queueServiceLayer = Layer.effect(
	QueueService,
	Effect.gen(function* () {
		const { channel } = yield* Effect.tryPromise({
			try: () => queueConnectionCreate(env.RABBITMQ_URL),
			catch: (cause) => new EQueue({ cause }),
		});
		return QueueService.of({ channel });
	}),
);
