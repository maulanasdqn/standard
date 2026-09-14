import http, { type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { match, P } from "ts-pattern";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { storageCreate } from "./storage.ts";

describe("storageCreate.getUrl", () => {
	it("signs a presigned GET url with the requested expiry", async (): Promise<void> => {
		const storage = storageCreate({
			accessKeyId: "test-access-key",
			secretAccessKey: "test-secret-key",
			bucket: "test-bucket",
			endpoint: "https://storage.example.com",
		});

		const url = await storage.getUrl("notes/welcome.txt", 120);

		expect(url).toContain("test-bucket/notes/welcome.txt");
		expect(url).toContain("X-Amz-Expires=120");
		expect(url).toContain("X-Amz-Signature=");
	});
});

describe("storageCreate against a local server", () => {
	let server: Server;
	let endpoint: string;

	beforeAll(async (): Promise<void> => {
		server = http.createServer((req, res) => {
			match(req.url)
				.with(
					P.when((url) => Boolean(url?.includes("missing"))),
					() => {
						res.writeHead(404).end();
					},
				)
				.otherwise(() => {
					res.writeHead(200).end("hello");
				});
		});
		await new Promise<void>((resolve) => {
			server.listen(0, resolve);
		});
		const address = server.address() as AddressInfo;
		endpoint = `http://127.0.0.1:${address.port}`;
	});

	afterAll(async (): Promise<void> => {
		await new Promise<void>((resolve) => {
			server.close(() => resolve());
		});
	});

	it("returns null for a 404", async (): Promise<void> => {
		const storage = storageCreate({
			accessKeyId: "a",
			secretAccessKey: "b",
			bucket: "bucket",
			endpoint,
		});

		expect(await storage.get("missing-key")).toBeNull();
	});

	it("returns the object bytes for a 200", async (): Promise<void> => {
		const storage = storageCreate({
			accessKeyId: "a",
			secretAccessKey: "b",
			bucket: "bucket",
			endpoint,
		});

		const result = await storage.get("present-key");

		expect(new TextDecoder().decode(result ?? new Uint8Array())).toBe("hello");
	});
});
