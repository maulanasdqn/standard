import { ORPCError } from "@orpc/client";
import { describe, expect, it } from "vitest";
import { queryRetry } from "#/libs/tanstack-query/retry.ts";

const FIRST_FAILURE = 0;
const SECOND_FAILURE = 1;

describe("queryRetry", () => {
	it.each(["NOT_FOUND", "BAD_REQUEST", "FORBIDDEN", "UNAUTHORIZED"])(
		"does not retry %s, whose answer will not change",
		(code): void => {
			expect(queryRetry(FIRST_FAILURE, new ORPCError(code))).toBe(false);
		},
	);

	it.each(["INTERNAL_SERVER_ERROR", "TOO_MANY_REQUESTS", "TIMEOUT"])(
		"retries %s once",
		(code): void => {
			expect(queryRetry(FIRST_FAILURE, new ORPCError(code))).toBe(true);
			expect(queryRetry(SECOND_FAILURE, new ORPCError(code))).toBe(false);
		},
	);

	it("retries a network failure once", (): void => {
		const error = new TypeError("Failed to fetch");

		expect(queryRetry(FIRST_FAILURE, error)).toBe(true);
		expect(queryRetry(SECOND_FAILURE, error)).toBe(false);
	});
});
