import type { Effect } from "effect";
import type { EAuth } from "#/application/shared/errors.ts";
import type { TSession } from "#/domain/session/session.ts";

export type TAuthService = {
	getSession: (headers: Headers) => Effect.Effect<TSession | null, EAuth>;
};
