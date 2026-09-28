import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import {
	bodyLimitMount,
	REQUEST_BODY_MAX_BYTES,
	UPLOAD_BODY_MAX_BYTES,
} from "#/platform/http/mount-body-limit.ts";
import { HTTP_METHOD } from "@app/contract";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import { UPLOAD_ROUTE } from "#/platform/http/route-paths.ts";

const ORDINARY_PATH = "/api/notes";
const UPLOAD_PATH =
	"/api/notes/11111111-1111-4111-8111-111111111111/attachments";
const OVER_BY = 1;

const appBuild = (): Hono => {
	const app = new Hono();
	bodyLimitMount(app);
	app.post("*", async (context): Promise<Response> => {
		await context.req.arrayBuffer();
		return context.body(null, HTTP_STATUS.NO_CONTENT);
	});
	return app;
};

const post = async (
	app: Hono,
	path: string,
	bytes: number,
): Promise<Response> =>
	await app.request(path, {
		method: HTTP_METHOD.POST,
		body: new Uint8Array(bytes),
	});

describe("bodyLimitMount", () => {
	it("refuses a body over the general limit on an ordinary route", async (): Promise<void> => {
		const response = await post(
			appBuild(),
			ORDINARY_PATH,
			REQUEST_BODY_MAX_BYTES + OVER_BY,
		);

		expect(response.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
	});

	it("lets an upload route take a body over the general limit", async (): Promise<void> => {
		const response = await post(
			appBuild(),
			UPLOAD_PATH,
			REQUEST_BODY_MAX_BYTES + OVER_BY,
		);

		expect(response.status).toBe(HTTP_STATUS.NO_CONTENT);
	});

	it("refuses an upload over the attachment limit on both transports", async (): Promise<void> => {
		const app = appBuild();
		const rpc = await post(
			app,
			UPLOAD_ROUTE.NOTE_ATTACHMENT_RPC,
			UPLOAD_BODY_MAX_BYTES + OVER_BY,
		);
		const rest = await post(app, UPLOAD_PATH, UPLOAD_BODY_MAX_BYTES + OVER_BY);

		expect(rpc.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
		expect(rest.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
	});
});
