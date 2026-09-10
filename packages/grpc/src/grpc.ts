import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { match, P } from "ts-pattern";

const LOAD_OPTIONS: protoLoader.Options = {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
};

type TServiceClient = grpc.ServiceClientConstructor & {
	service: grpc.ServiceDefinition;
};

const serviceCtorGet = (
	packageDefinition: grpc.GrpcObject,
	packageName: string,
	serviceName: string,
): TServiceClient => {
	const namespace = packageName
		.split(".")
		.reduce<grpc.GrpcObject>(
			(node, segment) => node[segment] as grpc.GrpcObject,
			packageDefinition,
		);
	return namespace[serviceName] as TServiceClient;
};

export type TGrpcHandler<TRequest = unknown, TResponse = unknown> = (
	request: TRequest,
) => Promise<TResponse>;

export type TGrpcServerOptions = {
	protoPath: string;
	packageName: string;
	serviceName: string;
	handlers: Record<string, TGrpcHandler>;
	host?: string;
};

export type TGrpcServer = {
	port: number;
	close: () => Promise<void>;
};

const handlerWrap = (
	handler: TGrpcHandler,
): grpc.handleUnaryCall<unknown, unknown> => {
	return (call, callback) => {
		handler(call.request)
			.then((response) => callback(null, response))
			.catch((error: unknown) => callback(error as grpc.ServiceError, null));
	};
};

export const grpcServerCreate = async (
	options: TGrpcServerOptions,
): Promise<TGrpcServer> => {
	const packageDefinition = await protoLoader.load(
		options.protoPath,
		LOAD_OPTIONS,
	);
	const proto = grpc.loadPackageDefinition(packageDefinition);
	const serviceCtor = serviceCtorGet(
		proto,
		options.packageName,
		options.serviceName,
	);

	const implementation: grpc.UntypedServiceImplementation = Object.fromEntries(
		Object.entries(options.handlers).map(([method, handler]) => [
			method,
			handlerWrap(handler),
		]),
	);

	const server = new grpc.Server();
	server.addService(serviceCtor.service, implementation);

	const address = `${options.host ?? "127.0.0.1"}:0`;

	const port = await new Promise<number>((resolve, reject) => {
		server.bindAsync(
			address,
			grpc.ServerCredentials.createInsecure(),
			(error, boundPort) => {
				match(error)
					.with(P.nullish, () => resolve(boundPort))
					.otherwise((bindError) => reject(bindError));
			},
		);
	});

	const close = (): Promise<void> =>
		new Promise((resolve) => {
			server.tryShutdown(() => resolve());
		});

	return { port, close };
};

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
	const packageDefinition = await protoLoader.load(
		options.protoPath,
		LOAD_OPTIONS,
	);
	const proto = grpc.loadPackageDefinition(packageDefinition);
	const serviceCtor = serviceCtorGet(
		proto,
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
