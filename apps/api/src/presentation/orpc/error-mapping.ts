import { ORPCError } from "@orpc/server";
import { match, P } from "ts-pattern";
import { AppError } from "#/application/shared/errors.ts";

export const toORPCError = (error: unknown): ORPCError<string, undefined> =>
	match(error)
		.with(
			P.instanceOf(AppError),
			(e): ORPCError<string, undefined> =>
				new ORPCError(e.code, { message: e.message }),
		)
		.with(
			P.instanceOf(ORPCError),
			(e): ORPCError<string, undefined> => e as ORPCError<string, undefined>,
		)
		.with(
			P.instanceOf(Error),
			(e): ORPCError<string, undefined> =>
				new ORPCError("INTERNAL_SERVER_ERROR", { message: e.message }),
		)
		.otherwise(
			(): ORPCError<string, undefined> =>
				new ORPCError("INTERNAL_SERVER_ERROR", { message: "Unexpected error" }),
		);
