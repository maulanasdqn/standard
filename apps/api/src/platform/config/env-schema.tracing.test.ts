import { A } from "@mobily/ts-belt";
import { describe, expect, it } from "vitest";
import { envSchema } from "#/platform/config/env-schema.ts";
import {
	ENV,
	NOT_AN_OBJECT,
} from "#/platform/config/env-schema-fakes.test-support.ts";

describe("envSchema tracing", () => {
	it("reads a blank sample ratio as the default rather than as zero", () => {
		const result = envSchema.safeParse({ ...ENV, TRACING_SAMPLE_RATIO: "" });

		expect(result.success && result.data.TRACING_SAMPLE_RATIO).toBe(1);
	});

	it("still honours an explicit sample ratio", () => {
		const result = envSchema.safeParse({
			...ENV,
			TRACING_SAMPLE_RATIO: "0.1",
		});

		expect(result.success && result.data.TRACING_SAMPLE_RATIO).toBe(0.1);
	});

	it("rejects a sample ratio outside zero to one", () => {
		expect(
			envSchema.safeParse({ ...ENV, TRACING_SAMPLE_RATIO: "2" }).success,
		).toBe(false);
	});

	it("rejects TRACING_HEADERS that is not valid JSON, naming that variable", () => {
		const result = envSchema.safeParse({
			...ENV,
			TRACING_HEADERS: "{not json",
		});

		expect(result.error?.issues[0]?.path).toEqual(["TRACING_HEADERS"]);
	});

	it("rejects TRACING_HEADERS that parses to something other than an object", () => {
		A.forEach(NOT_AN_OBJECT, (value): void => {
			expect(
				envSchema.safeParse({ ...ENV, TRACING_HEADERS: value }).success,
			).toBe(false);
		});
	});

	it("accepts TRACING_HEADERS as a JSON object and as an empty value", () => {
		const headers = '{"x-api-key":"collector-key"}';
		const parsed = envSchema.safeParse({ ...ENV, TRACING_HEADERS: headers });

		expect(parsed.success && parsed.data.TRACING_HEADERS).toEqual({
			"x-api-key": "collector-key",
		});
		expect(envSchema.safeParse({ ...ENV, TRACING_HEADERS: "" }).success).toBe(
			true,
		);
	});
});
