import { Context, Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EAuth } from "#/application/shared/errors.ts";
import type { IAuthService } from "#/domain/ports/auth-service.ts";
import type { ISession } from "#/domain/session/session.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { createActivityRepository } from "#/infrastructure/db/repositories/activity-repository.ts";
import { createAuth, type TAuth } from "#/infrastructure/auth/better-auth.ts";
import {
	resolvePermissions,
	resolveRole,
} from "#/infrastructure/auth/permissions.ts";

export type IAuthServiceShape = IAuthService & { readonly auth: TAuth };

export class AuthService extends Context.Service<
	AuthService,
	IAuthServiceShape
>()("app/AuthService") {
	static readonly layer = Layer.effect(
		AuthService,
		Effect.gen(function* () {
			const { db } = yield* DbService;
			const activityRepo = createActivityRepository(db);
			const auth = createAuth({ db, activityRepo });

			const getSession: IAuthService["getSession"] = (headers: Headers) =>
				Effect.tryPromise({
					try: () => auth.api.getSession({ headers }),
					catch: (cause) => new EAuth({ cause }),
				}).pipe(
					Effect.map((result): ISession | null =>
						match(result)
							.with(P.nullish, () => null)
							.with({ session: P.nullish }, () => null)
							.with({ user: P.nullish }, () => null)
							.otherwise(({ user }) => {
								const role = resolveRole(
									(user as { role?: string }).role ?? "viewer",
								);
								return {
									user: {
										id: user.id,
										email: user.email,
										name: user.name,
										role,
									},
									permissions: resolvePermissions(role),
								};
							}),
					),
				);

			return AuthService.of({ auth, getSession });
		}),
	).pipe(Layer.provide(DbService.layer));
}
