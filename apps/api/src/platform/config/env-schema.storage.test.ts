import { describe, expect, it } from "vitest";
import { envSchema } from "#/platform/config/env-schema.ts";

const ENV = {
	BETTER_AUTH_SECRET: "a-32-character-production-secret!",
	BETTER_AUTH_URL: "https://api.standard.test",
	DATABASE_URL: "postgres://app:app@localhost:5432/app",
	RABBITMQ_URL: "amqp://app:app@localhost:5672",
	REDIS_URL: "redis://localhost:6379",
	STORAGE_ENDPOINT: "https://objects.standard.test",
	STORAGE_BUCKET: "standard",
	STORAGE_ACCESS_KEY_ID: "storage-key",
	STORAGE_SECRET_ACCESS_KEY: "storage-secret",
	WEB_ORIGIN: "https://standard.test",
} as const;

const METRICS_TOKEN = "a-32-character-metrics-scrape-tok";

describe("envSchema storage", () => {
	it("refuses to start without a bucket to write to", () => {
		const { STORAGE_BUCKET: _omitted, ...withoutBucket } = ENV;

		expect(envSchema.safeParse(withoutBucket).success).toBe(false);
	});

	it("rejects an HTTP storage endpoint in production", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: "production",
				STORAGE_ENDPOINT: "http://objects.standard.test",
			}).success,
		).toBe(false);
	});

	it("accepts an HTTP in-cluster storage endpoint behind an HTTPS public one", () => {
		expect(
			envSchema.safeParse({
				...ENV,
				NODE_ENV: "production",
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
				NODE_ENV: "production",
				METRICS_TOKEN,
				STORAGE_PUBLIC_ENDPOINT: "http://objects.standard.test",
			}).success,
		).toBe(false);
	});
});
