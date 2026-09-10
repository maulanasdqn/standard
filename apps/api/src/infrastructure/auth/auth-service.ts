import { ROLE } from "@app/permissions";
import { Context, Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EAuth } from "#/application/shared/errors.ts";
import type { TAuthService } from "#/domain/ports/auth-service.ts";
import type { TSession } from "#/domain/session/session.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { activityRepositoryCreate } from "#/infrastructure/db/repositories/activity-repository.ts";
import { authCreate, type TAuth } from "#/infrastructure/auth/better-auth.ts";
import {
	permissionsResolve,
	roleResolve,
} from "#/infrastructure/auth/permissions.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export type TAuthServiceShape = TAuthService & { readonly auth: TAuth };

export class AuthService extends Context.Service<
	AuthService,
	TAuthServiceShape
>()(SERVICE_TAG.AUTH) {
	static readonly layer = Layer.effect(
		AuthService,
		Effect.gen(function* () {
			const { db } = yield* DbService;
			const activityRepo = activityRepositoryCreate(db);
			const auth = authCreate({ db, activityRepo });

			const getSession: TAuthService["getSession"] = (headers: Headers) =>
				Effect.tryPromise({
					try: () => auth.api.getSession({ headers }),
					catch: (cause) => new EAuth({ cause }),
				}).pipe(
					Effect.map((result): TSession | null =>
						match(result)
							.with(P.nullish, () => null)
							.with({ session: P.nullish }, () => null)
							.with({ user: P.nullish }, () => null)
							.otherwise(({ user }) => {
								const role = roleResolve(
									(user as { role?: string }).role ?? ROLE.VIEWER,
								);
								return {
									user: {
										id: user.id,
										email: user.email,
										name: user.name,
										role,
									},
									permissions: permissionsResolve(role),
								};
							}),
					),
				);

			return AuthService.of({ auth, getSession });
		}),
	).pipe(Layer.provide(DbService.layer));
}
