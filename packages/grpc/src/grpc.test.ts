import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
	type IGrpcClient,
	type IGrpcServer,
	grpcClientCreate,
	grpcServerCreate,
} from "./grpc.ts";

const PROTO_PATH = fileURLToPath(new URL("./note.proto", import.meta.url));

type TNote = { id: string; title: string; content: string };

describe("grpcServerCreate + grpcClientCreate", () => {
	let server: IGrpcServer | undefined;
	let client: IGrpcClient | undefined;

	afterEach(async () => {
		client?.close();
		await server?.close();
		server = undefined;
		client = undefined;
	});

	it("round-trips a unary call through a real server and client", async () => {
		const notes: Record<string, TNote> = {
			"note-1": { id: "note-1", title: "First note", content: "Hello" },
		};

		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: "note",
			serviceName: "NoteService",
			handlers: {
				getNote: async (request: unknown) => {
					const { id } = request as { id: string };
					return notes[id];
				},
				createNote: async (request: unknown) => {
					const { title, content } = request as {
						title: string;
						content: string;
					};
					const created: TNote = { id: "note-2", title, content };
					notes[created.id] = created;
					return created;
				},
			},
		});

		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: "note",
			serviceName: "NoteService",
			address: `127.0.0.1:${server.port}`,
		});

		const fetched = await client.call<{ id: string }, TNote>("getNote", {
			id: "note-1",
		});
		expect(fetched.title).toBe("First note");

		const created = await client.call<
			{ title: string; content: string },
			TNote
		>("createNote", {
			title: "Second note",
			content: "World",
		});
		expect(created.id).toBe("note-2");
		expect(created.content).toBe("World");
	});

	it("rejects when the server handler throws", async () => {
		server = await grpcServerCreate({
			protoPath: PROTO_PATH,
			packageName: "note",
			serviceName: "NoteService",
			handlers: {
				getNote: async () => {
					throw new Error("not found");
				},
				createNote: async (request: unknown) => request as TNote,
			},
		});

		client = await grpcClientCreate({
			protoPath: PROTO_PATH,
			packageName: "note",
			serviceName: "NoteService",
			address: `127.0.0.1:${server.port}`,
		});

		await expect(
			client.call("getNote", { id: "missing" }),
		).rejects.toBeDefined();
	});
});
