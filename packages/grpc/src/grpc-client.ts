import * as grpc from "@grpc/grpc-js";
import { match, P } from "ts-pattern";
import { getServiceConstructor } from "./proto.ts";

export type TGrpcClientOptions = {
	protoPath: string;
	packageName: string;
	serviceName: string;
	address: string;
};

export type TGrpcClient = {
	call: <TRequest, TResponse>(
		method: string,
		request: TRequest,
	) => Promise<TResponse>;
	close: () => void;
};

export const grpcClientCreate = async (
	options: TGrpcClientOptions,
): Promise<TGrpcClient> => {
	const serviceCtor = await getServiceConstructor(
		options.protoPath,
		options.packageName,
		options.serviceName,
	);
	const client = new serviceCtor(
		options.address,
		grpc.credentials.createInsecure(),
	);

	type TUnaryMethod = (
		request: unknown,
		callback: grpc.requestCallback<unknown>,
	) => grpc.ClientUnaryCall;

	const call = <TRequest, TResponse>(
		method: string,
		request: TRequest,
	): Promise<TResponse> =>
		new Promise((resolve, reject) => {
			(client as unknown as Record<string, TUnaryMethod>)[method](
				request,
				(error, response) => {
					match(error)
						.with(P.nullish, () => resolve(response as TResponse))
						.otherwise((callError) => reject(callError));
				},
			);
		});

	const close = (): void => client.close();

	return { call, close };
};
