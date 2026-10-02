import { ORPCError } from "@orpc/client";

export const ORPC_ERROR_CODE = {
	NOT_FOUND: "NOT_FOUND",
} as const;

export const isRecordNotFound = (error: unknown): boolean =>
	error instanceof ORPCError && error.code === ORPC_ERROR_CODE.NOT_FOUND;
