import { describe, expect, it } from "vitest";
import { envSchema, NODE_ENV } from "#/platform/config/env-schema.ts";
import {
	ENV,
	METRICS_TOKEN,
} from "#/platform/config/env-schema-fakes.test-support.ts";

describe("envSchema storage", () => {
	it("refuses to start without a bucket to write to", () => {
		const { STORAGE_BUCKET: _omitted, ...withoutBucket } = ENV;

		expect(envSchema.safeParse(withoutBucket).success).toBe(false);
	});

	it("rejects an HTTP storage endpoint in production", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: NODE_ENV.PRODUCTION,
				STORAGE_ENDPOINT: "http://objects.standard.test",
			}).success,
		).toBe(false);
	});

	it("accepts an HTTP in-cluster storage endpoint behind an HTTPS public one", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: NODE_ENV.PRODUCTION,
				METRICS_TOKEN,
				STORAGE_ENDPOINT: "http://objects.internal:9000",
				STORAGE_PUBLIC_ENDPOINT: "https://objects.standard.test",
			}).success,
		).toBe(true);
	});

	it("rejects an HTTP public storage endpoint in production", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: NODE_ENV.PRODUCTION,
				METRICS_TOKEN,
				STORAGE_PUBLIC_ENDPOINT: "http://objects.standard.test",
			}).success,
		).toBe(false);
	});
});
