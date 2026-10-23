import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { envSchema } from "#/platform/config/env-schema.ts";
import { ENV } from "#/platform/config/env-schema-fakes.test-support.ts";

const NOT_AN_OBJECT = ["null", "[1,2]", '"a string"', "42"] as const;

describe("envSchema logging", () => {
	it("rejects LOG_TRANSPORT_OPTIONS that is not valid JSON", () => {
		const result = envSchema.safeParse({
			...ENV,
			LOG_TRANSPORT_OPTIONS: "{not json",
		});

		expect(result.error?.issues[0]?.path).toEqual(["LOG_TRANSPORT_OPTIONS"]);
	});

	it("rejects LOG_TRANSPORT_OPTIONS that parses to something other than an object", () => {
		A.forEach(NOT_AN_OBJECT, (value): void => {
			expect(
				envSchema.safeParse({ ...ENV, LOG_TRANSPORT_OPTIONS: value }).success,
			).toBe(false);
		});
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
