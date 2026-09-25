import { ROLE_MESSAGE } from "@app/messages";
import { isRole } from "@app/permissions";
import { Effect } from "effect";
import { match } from "ts-pattern";
import { EBadRequest, type EDatabase } from "#/shared/errors.ts";
import { ROW_LOCK, type TRowLock } from "#/shared/row-lock.ts";
import {
	CustomRoleRepo,
	type TCustomRoleRepoId,
} from "#/role/domain/custom-role.ts";

type TRoleExistsEffect = Effect.Effect<boolean, EDatabase, TCustomRoleRepoId>;

export const roleExists = (key: string, lock?: TRowLock): TRoleExistsEffect =>
	match(key)
		.when(isRole, (): TRoleExistsEffect => Effect.succeed(true))
		.otherwise(
			(custom): TRoleExistsEffect =>
				CustomRoleRepo.use((repo) => repo.findByKey(custom, lock)).pipe(
					Effect.map((row) => row !== null),
				),
		);

export const roleEnsure = Effect.fn("roleEnsure")(function* (
	key: string,
): Effect.fn.Return<void, EBadRequest | EDatabase, TCustomRoleRepoId> {
	const exists = yield* roleExists(key, ROW_LOCK.SHARE);

	if (!exists) {
		return yield* new EBadRequest({ message: ROLE_MESSAGE.NOT_FOUND });
	}
});
