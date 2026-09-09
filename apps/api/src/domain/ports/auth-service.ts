import type { Effect } from "effect";
import type { EAuth } from "#/application/shared/errors.ts";
import type { ISession } from "#/domain/session/session.ts";

export type IAuthService = {
	getSession: (headers: Headers) => Effect.Effect<ISession | null, EAuth>;
};
