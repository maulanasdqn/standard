import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_LOAD_OPTIONS: protoLoader.Options = {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
};

export type TGrpcServiceClient = grpc.ServiceClientConstructor & {
	service: grpc.ServiceDefinition;
};

export const getServiceConstructor = async (
	protoPath: string,
	packageName: string,
	serviceName: string,
): Promise<TGrpcServiceClient> => {
	const packageDefinition = await protoLoader.load(
		protoPath,
		PROTO_LOAD_OPTIONS,
	);
	const packageObject = grpc.loadPackageDefinition(packageDefinition);
	const namespace = packageName
		.split(".")
		.reduce<grpc.GrpcObject>(
			(node, segment) => node[segment] as grpc.GrpcObject,
			packageObject,
		);
	return namespace[serviceName] as TGrpcServiceClient;
};
