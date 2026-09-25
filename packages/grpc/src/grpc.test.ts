import { fileURLToPath } from "node:url";
import { match } from "ts-pattern";
import { afterEach, describe, expect, it } from "vitest";
import {
	GRPC_CALL_ERROR,
	GRPC_LOAD_ERROR,
	type TGrpcClient,
	type TGrpcServer,
	grpcClientCreate,
	grpcServerCreate,
} from "./index.ts";

const PROTO_PATH = fileURLToPath(new URL("./sample.proto", import.meta.url));
const PACKAGE = "sample";
const SERVICE = "ItemService";

type TItem = { id: string; title: string; content: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isItem = (value: unknown): value is TItem =>
	isRecord(value) &&
	typeof value.id === "string" &&
	typeof value.title === "string" &&
	typeof value.content === "string";

const itemDecode = (value: unknown): TItem =>
	match(value)
		.when(isItem, (item): TItem => item)
		.otherwise((): never => {
			throw new Error("not an item");
		});

const stringField = (value: unknown, field: string): string =>
	isRecord(value) && typeof value[field] === "string" ? value[field] : "";

const idOf = (value: unknown): string => stringField(value, "id");

const draftOf = (value: unknown): Pick<TItem, "title" | "content"> => ({
	title: stringField(value, "title"),
	content: stringField(value, "content"),
});

const itemOf = (value: unknown): TItem => ({
	id: idOf(value),
	...draftOf(value),
});

describe("grpcServerCreate + grpcClientCreate", () => {
	let server: TGrpcServer | undefined;
	let client: TGrpcClient | undefined;

	afterEach(async () => {
		client?.close();
		await server?.close();
		server = undefined;
		client = undefined;
	});

	it("round-trips a unary call through a real server and client", async () => {
		const items: Record<string, TItem> = {
			"item-1": { id: "item-1", title: "First item", content: "Hello" },
		};

		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			handlers: {
				getItem: async (request: unknown) => items[idOf(request)],
				createItem: async (request: unknown) => {
					const created: TItem = { id: "item-2", ...draftOf(request) };
					items[created.id] = created;
					return created;
				},
			},
		});

		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			address: `127.0.0.1:${server.port}`,
		});

		const fetched = await client.call("getItem", { id: "item-1" }, itemDecode);
		expect(fetched.title).toBe("First item");

		const created = await client.call(
			"createItem",
			{ title: "Second item", content: "World" },
			itemDecode,
		);
		expect(created.id).toBe("item-2");
		expect(created.content).toBe("World");
	});

	it("rejects when the server handler throws", async () => {
		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			handlers: {
				getItem: async () => {
					throw new Error("not found");
				},
				createItem: async (request: unknown) => itemOf(request),
			},
		});

		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			address: `127.0.0.1:${server.port}`,
		});

		await expect(
			client.call("getItem", { id: "missing" }, itemDecode),
		).rejects.toMatchObject({ details: "not found" });
	});

	it("rejects a method the service does not define instead of exploding", async () => {
		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			handlers: {
				getItem: async (request: unknown) => itemOf(request),
				createItem: async (request: unknown) => itemOf(request),
			},
		});
		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: PACKAGE,
			serviceName: SERVICE,
			address: `127.0.0.1:${server.port}`,
		});

		await expect(
			client.call("deleteItem", { id: "item-1" }, itemDecode),
		).rejects.toThrow(GRPC_CALL_ERROR.METHOD_MISSING);
	});

	it("names a service that the proto does not define", async () => {
		await expect(
			grpcServerCreate({
				protoPath: PROTO_PATH,
				packageName: PACKAGE,
				serviceName: "TagService",
				handlers: {},
			}),
		).rejects.toThrow(GRPC_LOAD_ERROR.SERVICE_MISSING);
	});
});
