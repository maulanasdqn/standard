import { ROLE_MESSAGE } from "@app/messages";
import { isRole } from "@app/permissions";
import { Effect } from "effect";
import { match } from "ts-pattern";
import { EBadRequest, type EDatabase } from "#/application/shared/errors.ts";
import { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";

type TRoleExistsEffect = Effect.Effect<boolean, EDatabase, CustomRoleRepo>;

export const roleExists = (key: string): TRoleExistsEffect =>
	match(key)
		.when(isRole, (): TRoleExistsEffect => Effect.succeed(true))
		.otherwise(
			(custom): TRoleExistsEffect =>
				CustomRoleRepo.use((repo) => repo.findByKey(custom)).pipe(
					Effect.map((row) => row !== null),
				),
		);

export const roleEnsure = Effect.fn("roleEnsure")(function* (
	key: string,
): Effect.fn.Return<void, EBadRequest | EDatabase, CustomRoleRepo> {
	const exists = yield* roleExists(key);

	if (!exists) {
		return yield* new EBadRequest({ message: ROLE_MESSAGE.NOT_FOUND });
	}
});
