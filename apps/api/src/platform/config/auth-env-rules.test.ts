import { describe, expect, it } from "vitest";
import {
	cookieDomainValid,
	trustedOriginValid,
} from "#/platform/config/auth-env-rules.ts";
import { envSchema } from "#/platform/config/env-schema.ts";

const AUTH_URL = "https://api.standard.test";

const ENV = {
	BETTER_AUTH_SECRET: "a-32-character-production-secret!",
	BETTER_AUTH_URL: AUTH_URL,
	DATABASE_URL: "postgres://app:app@localhost:5432/app",
	RABBITMQ_URL: "amqp://app:app@localhost:5672",
	REDIS_URL: "redis://localhost:6379",
	STORAGE_ENDPOINT: "https://objects.standard.test",
	STORAGE_BUCKET: "standard",
	STORAGE_ACCESS_KEY_ID: "storage-key",
	STORAGE_SECRET_ACCESS_KEY: "storage-secret",
	WEB_ORIGIN: "https://standard.test",
} as const;

const PRODUCTION = {
	...ENV,
	NODE_ENV: "production",
	METRICS_TOKEN: "a-32-character-metrics-scrape-tok",
} as const;

describe("trustedOriginValid", () => {
	it.each([
		"https://other.test",
		"https://*.standard.test",
		"https://*.eu.standard.test",
		"https://reports.standard.test:8443",
		"http://localhost:5174",
	])("accepts %s", (entry): void => {
		expect(trustedOriginValid(entry)).toBe(true);
	});

	it.each([
		"https://*",
		"https://*.com",
		"https://*example.com",
		"https://a.*.example.com",
		"https://*.*.example.com",
		"*.example.com",
		"https://Reports.standard.test",
		"https://*.Standard.test",
		"https://other.test/",
		"https://other.test/path",
		"https://*.standard.test/path",
		"https://other.test?next=1",
		"not an origin",
	])("rejects %s", (entry): void => {
		expect(trustedOriginValid(entry)).toBe(false);
	});
});

describe("cookieDomainValid", () => {
	it.each([".standard.test", "standard.test", "api.standard.test"])(
		"accepts %s for the auth host",
		(domain): void => {
			expect(cookieDomainValid(domain, AUTH_URL)).toBe(true);
		},
	);

	it.each([
		".test",
		"test",
		".other.test",
		"i.standard.test",
		"pi.standard.test",
		".Standard.test",
		".standard.test/",
	])("rejects %s for the auth host", (domain): void => {
		expect(cookieDomainValid(domain, AUTH_URL)).toBe(false);
	});
});

describe("envSchema auth settings", () => {
	it("keeps sign-up, JWT issuing and the shared cookie domain off by default", (): void => {
		const parsed = envSchema.safeParse(ENV);

		expect(parsed.data?.AUTH_SIGN_UP_ENABLED).toBe(false);
		expect(parsed.data?.AUTH_JWT_ENABLED).toBe(false);
		expect(parsed.data?.AUTH_COOKIE_DOMAIN).toBeUndefined();
		expect(parsed.data?.AUTH_TRUSTED_ORIGINS).toEqual([]);
	});

	it("turns sign-up on only when it is asked for", (): void => {
		expect(
			envSchema.safeParse({ ...ENV, AUTH_SIGN_UP_ENABLED: "true" }).data
				?.AUTH_SIGN_UP_ENABLED,
		).toBe(true);
		expect(
			envSchema.safeParse({ ...ENV, AUTH_SIGN_UP_ENABLED: "" }).data
				?.AUTH_SIGN_UP_ENABLED,
		).toBe(false);
	});

	it("accepts HTTPS trusted origins with wildcards in production", (): void => {
		const parsed = envSchema.safeParse({
			...PRODUCTION,
			AUTH_TRUSTED_ORIGINS: "https://*.standard.test, https://other.test",
		});

		expect(parsed.success).toBe(true);
		expect(parsed.data?.AUTH_TRUSTED_ORIGINS).toEqual([
			"https://*.standard.test",
			"https://other.test",
		]);
	});

	it("rejects a trusted origin that is not HTTPS in production", (): void => {
		expect(
			envSchema.safeParse({
				...PRODUCTION,
				AUTH_TRUSTED_ORIGINS: "https://*.standard.test, http://other.test",
			}).success,
		).toBe(false);
	});

	it("rejects a trusted origin that trusts every host outside production too", (): void => {
		expect(
			envSchema.safeParse({ ...ENV, AUTH_TRUSTED_ORIGINS: "https://*" })
				.success,
		).toBe(false);
	});

	it("accepts a cookie domain the auth host belongs to", (): void => {
		expect(
			envSchema.safeParse({
				...PRODUCTION,
				AUTH_COOKIE_DOMAIN: ".standard.test",
			}).success,
		).toBe(true);
	});

	it("rejects a cookie domain the browser would refuse for the auth host", (): void => {
		expect(
			envSchema.safeParse({ ...PRODUCTION, AUTH_COOKIE_DOMAIN: ".other.test" })
				.success,
		).toBe(false);
	});
});
