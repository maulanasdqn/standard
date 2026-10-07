import { canAll, ROLE, type TPermission } from "@app/permissions";
import { Effect } from "effect";
import { match } from "ts-pattern";
import { permissionsResolve } from "#/role/domain/permissions-resolve.ts";
import type { TCustomRoleRepoId } from "#/role/domain/custom-role.ts";
import { type EDatabase, EForbidden } from "#/shared/errors.ts";
import type { TActorAuthority } from "#/shared/session.ts";

type TWithinEffect = Effect.Effect<boolean, EDatabase, TCustomRoleRepoId>;

export const permissionsWithin = (
	authority: TActorAuthority,
	permissions: readonly TPermission[],
): boolean => canAll(authority.permissions, permissions);

export const roleWithin = (
	authority: TActorAuthority,
	role: string,
): TWithinEffect =>
	match(role)
		.with(
			ROLE.SUPERADMIN,
			(): TWithinEffect => Effect.succeed(authority.role === ROLE.SUPERADMIN),
		)
		.otherwise(
			(other): TWithinEffect =>
				permissionsResolve(other).pipe(
					Effect.map((permissions) =>
						permissionsWithin(authority, permissions),
					),
				),
		);

export const roleWithinEnsure = Effect.fn("roleWithinEnsure")(function* (
	authority: TActorAuthority,
	role: string,
	message: string,
): Effect.fn.Return<void, EForbidden | EDatabase, TCustomRoleRepoId> {
	const within = yield* roleWithin(authority, role);

	if (!within) {
		return yield* new EForbidden({ message });
	}
});
