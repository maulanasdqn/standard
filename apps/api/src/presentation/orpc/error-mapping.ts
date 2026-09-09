import { ORPCError } from "@orpc/server";
import { AppError } from "#/application/shared/errors.ts";

export const toORPCError = (error: unknown): ORPCError<string, undefined> => {
	if (error instanceof AppError) {
		return new ORPCError(error.code, { message: error.message });
	}
	if (error instanceof ORPCError) {
		return error;
	}
	return new ORPCError("INTERNAL_SERVER_ERROR", {
		message: error instanceof Error ? error.message : "Unexpected error",
	});
};
