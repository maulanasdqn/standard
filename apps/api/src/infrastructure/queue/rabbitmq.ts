import { connect, type Channel, type ChannelModel } from "amqplib";

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
