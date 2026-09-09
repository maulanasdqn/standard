import { connect, type Channel, type ChannelModel } from "amqplib";
import { Context, Effect, Layer } from "effect";
import { env } from "#/infrastructure/config/env.ts";
import { EQueue } from "#/application/shared/errors.ts";

export type TQueueConnection = {
	model: ChannelModel;
	channel: Channel;
};

export const createQueueConnection = async (
	rabbitmqUrl: string,
): Promise<TQueueConnection> => {
	const model = await connect(rabbitmqUrl);
	const channel = await model.createChannel();
	return { model, channel };
};

export class QueueService extends Context.Service<
	QueueService,
	{ readonly channel: Channel }
>()("app/QueueService") {
	static readonly layer = Layer.effect(
		QueueService,
		Effect.gen(function* () {
			const { channel } = yield* Effect.tryPromise({
				try: () => createQueueConnection(env.RABBITMQ_URL),
				catch: (cause) => new EQueue({ cause }),
			});
			return QueueService.of({ channel });
		}),
	);
}
