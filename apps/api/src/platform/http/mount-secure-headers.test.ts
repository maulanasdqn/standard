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
});
