import { describe, expect, it } from "vitest";
import { envSchema } from "#/platform/config/env-schema.ts";

const ENV = {
	BETTER_AUTH_SECRET: "a-32-character-production-secret!",
	BETTER_AUTH_URL: "https://api.standard.test",
	DATABASE_URL: "postgres://app:app@localhost:5432/app",
	RABBITMQ_URL: "amqp://app:app@localhost:5672",
	REDIS_URL: "redis://localhost:6379",
	WEB_ORIGIN: "https://standard.test",
} as const;

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
				NODE_ENV: "production",
				WEB_ORIGIN: "http://standard.test",
			}).success,
		).toBe(false);
	});

	it("rejects an HTTP auth URL in production", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: "production",
				BETTER_AUTH_URL: "http://api.standard.test",
			}).success,
		).toBe(false);
	});

	it("accepts HTTPS URLs in production", () => {
		expect(
			envSchema.safeParse({ ...ENV, NODE_ENV: "production" }).success,
		).toBe(true);
	});

	it("rejects LOG_TRANSPORT_OPTIONS that is not valid JSON", () => {
		const result = envSchema.safeParse({
			...ENV,
			LOG_TRANSPORT_OPTIONS: "{not json",
		});

		expect(result.success).toBe(false);
	});

	it("rejects LOG_TRANSPORT_OPTIONS that parses to something other than an object", () => {
		const rejected = ["null", "[1,2]", '"a string"', "42"];

		for (const value of rejected) {
			expect(
				envSchema.safeParse({ ...ENV, LOG_TRANSPORT_OPTIONS: value }).success,
			).toBe(false);
		}
	});

	it("accepts a JSON object and an empty value", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				LOG_TRANSPORT_OPTIONS: '{"host":"http://loki:3100"}',
			}).success,
		).toBe(true);
		expect(
			envSchema.safeParse({ ...ENV, LOG_TRANSPORT_OPTIONS: "" }).success,
		).toBe(true);
	});

	it("rejects a log level outside the pino set", () => {
		expect(envSchema.safeParse({ ...ENV, LOG_LEVEL: "verbose" }).success).toBe(
			false,
		);
	});
});
