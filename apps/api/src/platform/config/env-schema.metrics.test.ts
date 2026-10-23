import { describe, expect, it } from "vitest";
import { envSchema, NODE_ENV } from "#/platform/config/env-schema.ts";
import {
	ENV,
	METRICS_TOKEN,
} from "#/platform/config/env-schema-fakes.test-support.ts";

describe("envSchema metrics", () => {
	it("refuses to start in production with metrics enabled and no token", () => {
		const result = envSchema.safeParse({
			...ENV,
			NODE_ENV: NODE_ENV.PRODUCTION,
		});

		expect(result.success).toBe(false);
	});

	it("accepts production metrics behind a token", () => {
		const result = envSchema.safeParse({
			...ENV,
			NODE_ENV: NODE_ENV.PRODUCTION,
			METRICS_TOKEN,
		});

		expect(result.success).toBe(true);
	});

	it("accepts production with metrics switched off", () => {
		const result = envSchema.safeParse({
			...ENV,
			NODE_ENV: NODE_ENV.PRODUCTION,
			METRICS_ENABLED: "false",
		});

		expect(result.success).toBe(true);
	});

	it("rejects a metrics token that is too short to be a secret", () => {
		const result = envSchema.safeParse({ ...ENV, METRICS_TOKEN: "short" });

		expect(result.success).toBe(false);
	});
});
