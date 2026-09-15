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
});
