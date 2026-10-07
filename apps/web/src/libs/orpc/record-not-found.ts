import { A } from "@mobily/ts-belt";
import { ORPCError } from "@orpc/client";

export const ORPC_ERROR_CODE = {
	NOT_FOUND: "NOT_FOUND",
	BAD_REQUEST: "BAD_REQUEST",
} as const;

const RECORD_MISSING_CODES: readonly string[] = [
	ORPC_ERROR_CODE.NOT_FOUND,
	ORPC_ERROR_CODE.BAD_REQUEST,
];

export const isRecordNotFound = (error: unknown): boolean =>
	error instanceof ORPCError && A.includes(RECORD_MISSING_CODES, error.code);
