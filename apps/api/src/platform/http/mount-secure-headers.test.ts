import { A } from "@mobily/ts-belt";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { HTTP_STATUS } from "#/platform/http/http-status.ts";
import {
	SECURE_HEADER,
	SECURE_HEADER_VALUE,
	secureHeadersMount,
} from "#/platform/http/mount-secure-headers.ts";

const PATHS = ["/api/notes", "/app/notes", "/", "/missing"] as const;
const POWERED_PATH = "/powered";
const POWERED_BY_HEADER = "X-Powered-By";
const POWERED_BY_VALUE = "Hono";

const OTHER_HEADERS = [
	"Strict-Transport-Security",
	"X-Frame-Options",
	"Cross-Origin-Resource-Policy",
	"Cross-Origin-Opener-Policy",
	"Content-Security-Policy",
] as const;

const appBuild = (): Hono => {
	const app = new Hono();
	secureHeadersMount(app);
	app.get("/missing", (context): Response | Promise<Response> =>
		context.notFound(),
	);
	app.get(POWERED_PATH, (context): Response => {
		context.header(POWERED_BY_HEADER, POWERED_BY_VALUE);
		return context.body(null, HTTP_STATUS.NO_CONTENT);
	});
	app.get(
		"*",
		(context): Response => context.body(null, HTTP_STATUS.NO_CONTENT),
	);
	return app;
};

describe("secureHeadersMount", () => {
	it.each(PATHS)(
		"sends nosniff and the referrer policy on %s",
		async (path): Promise<void> => {
			const response = await appBuild().request(path);

			expect(response.headers.get(SECURE_HEADER.CONTENT_TYPE_OPTIONS)).toBe(
				SECURE_HEADER_VALUE.NOSNIFF,
			);
			expect(response.headers.get(SECURE_HEADER.REFERRER_POLICY)).toBe(
				SECURE_HEADER_VALUE.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
			);
		},
	);

	it("adds none of the library's other headers", async (): Promise<void> => {
		const response = await appBuild().request(PATHS[0]);

		A.forEach(OTHER_HEADERS, (header): void => {
			expect(response.headers.get(header)).toBeNull();
		});
	});

	it("strips an X-Powered-By that a handler sets", async (): Promise<void> => {
		const response = await appBuild().request(POWERED_PATH);

		expect(response.headers.get(POWERED_BY_HEADER)).toBeNull();
	});
});
