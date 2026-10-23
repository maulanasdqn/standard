import { describe, expect, it } from "vitest";
import {
	apiReferenceEnabledOf,
	envSchema,
	NODE_ENV,
} from "#/platform/config/env-schema.ts";
import {
	ENV,
	METRICS_TOKEN,
} from "#/platform/config/env-schema-fakes.test-support.ts";

describe("envSchema security", () => {
	it("requires a 32-character authentication secret", () => {
		expect(
			envSchema.safeParse({ ...ENV, BETTER_AUTH_SECRET: "too-short" }).success,
		).toBe(false);
	});

	it("rejects an HTTP web origin in production", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: NODE_ENV.PRODUCTION,
				WEB_ORIGIN: "http://standard.test",
			}).success,
		).toBe(false);
	});

	it("rejects an HTTP auth URL in production", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: NODE_ENV.PRODUCTION,
				BETTER_AUTH_URL: "http://api.standard.test",
			}).success,
		).toBe(false);
	});

	it("accepts HTTPS URLs in production", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: NODE_ENV.PRODUCTION,
				METRICS_TOKEN,
			}).success,
		).toBe(true);
	});
});

describe("apiReferenceEnabledOf", () => {
	it("serves the API reference outside production unless told otherwise", () => {
		expect(apiReferenceEnabledOf(envSchema.parse(ENV))).toBe(true);
		expect(
			apiReferenceEnabledOf(
				envSchema.parse({ ...ENV, API_REFERENCE_ENABLED: "false" }),
			),
		).toBe(false);
	});

	it("hides the API reference in production unless told otherwise", () => {
		const production = { ...ENV, NODE_ENV: NODE_ENV.PRODUCTION, METRICS_TOKEN };

		expect(apiReferenceEnabledOf(envSchema.parse(production))).toBe(false);
		expect(
			apiReferenceEnabledOf(
				envSchema.parse({ ...production, API_REFERENCE_ENABLED: "true" }),
			),
		).toBe(true);
	});
});
