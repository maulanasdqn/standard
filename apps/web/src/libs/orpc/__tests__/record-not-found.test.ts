import { ORPCError } from "@orpc/client";
import { describe, expect, it } from "vitest";
import {
	isRecordNotFound,
	ORPC_ERROR_CODE,
} from "#/libs/orpc/record-not-found.ts";

describe("isRecordNotFound", () => {
	it("recognises a not found answer from the API", (): void => {
		expect(isRecordNotFound(new ORPCError(ORPC_ERROR_CODE.NOT_FOUND))).toBe(
			true,
		);
	});

	it("treats an id the API rejects as malformed as a missing record", (): void => {
		expect(isRecordNotFound(new ORPCError(ORPC_ERROR_CODE.BAD_REQUEST))).toBe(
			true,
		);
	});

	it("does not treat another API failure as a missing record", (): void => {
		expect(isRecordNotFound(new ORPCError("FORBIDDEN"))).toBe(false);
		expect(isRecordNotFound(new ORPCError("INTERNAL_SERVER_ERROR"))).toBe(
			false,
		);
	});

	it("does not treat an ordinary error as a missing record", (): void => {
		expect(isRecordNotFound(new Error(ORPC_ERROR_CODE.NOT_FOUND))).toBe(false);
		expect(isRecordNotFound(undefined)).toBe(false);
	});
});
