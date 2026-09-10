import { ROLE } from "@app/permissions";
import { Context, Effect, Layer } from "effect";
import { match, P } from "ts-pattern";
import { EAuth, type EDatabase } from "#/application/shared/errors.ts";
import { permissionsResolve } from "#/application/shared/permissions-resolve.ts";
import type { TAuthService } from "#/domain/ports/auth-service.ts";
import type { TSession, TSessionUser } from "#/domain/session/session.ts";
import { authCreate, type TAuth } from "#/infrastructure/auth/better-auth.ts";
import { DbService } from "#/infrastructure/db/db-service.ts";
import { activityRepositoryCreate } from "#/infrastructure/db/repositories/activity-repository.ts";
import { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { SERVICE_TAG } from "#/infrastructure/service-tags.ts";

export type TAuthServiceShape = TAuthService & { readonly auth: TAuth };

type TSessionEffect = Effect.Effect<TSession | null, EDatabase>;

export class AuthService extends Context.Service<
	AuthService,
	TAuthServiceShape
>()(SERVICE_TAG.AUTH) {
	static readonly layer = Layer.effect(
		AuthService,
		Effect.gen(function* () {
			const { db } = yield* DbService;
			const customRoleRepo = yield* CustomRoleRepo;
			const activityRepo = activityRepositoryCreate(db);
			const auth = authCreate({ db, activityRepo });

			const sessionBuild = (
				user: Pick<TSessionUser, "id" | "email" | "name">,
				role: string,
			): TSessionEffect =>
				permissionsResolve(role).pipe(
					Effect.provideService(CustomRoleRepo, customRoleRepo),
					Effect.map(
						(permissions): TSession => ({
							user: { id: user.id, email: user.email, name: user.name, role },
							permissions,
						}),
					),
				);

			const getSession: TAuthService["getSession"] = (headers: Headers) =>
				Effect.tryPromise({
					try: () => auth.api.getSession({ headers }),
					catch: (cause) => new EAuth({ cause }),
				}).pipe(
					Effect.flatMap(
						(result): TSessionEffect =>
							match(result)
								.with(P.nullish, (): TSessionEffect => Effect.succeed(null))
								.with(
									{ session: P.nullish },
									(): TSessionEffect => Effect.succeed(null),
								)
								.with(
									{ user: P.nullish },
									(): TSessionEffect => Effect.succeed(null),
								)
								.otherwise(({ user }) =>
									sessionBuild(
										user,
										(user as { role?: string }).role ?? ROLE.VIEWER,
									),
								),
					),
				);

			return AuthService.of({ auth, getSession });
		}),
	).pipe(Layer.provide(Layer.mergeAll(DbService.layer, CustomRoleRepo.layer)));
}
