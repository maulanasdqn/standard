import { ROLE_MESSAGE } from "@app/messages";
import { isRole } from "@app/permissions";
import type { TRoleDto, TRoleKeyInput } from "@app/schemas";
import { Effect } from "effect";
import { match } from "ts-pattern";
import { fixedRoleDto, toRoleDto } from "#/application/role/to-role-dto.ts";
import { type EDatabase, ENotFound } from "#/application/shared/errors.ts";
import type { TRoleMemberCounts } from "#/domain/user/user.ts";
import { CustomRoleRepo } from "#/infrastructure/db/repositories/custom-role-repository.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

type TRoleFindEffect = Effect.Effect<
	TRoleDto | null,
	EDatabase,
	CustomRoleRepo
>;

const roleFind = (key: string, counts: TRoleMemberCounts): TRoleFindEffect =>
	match(key)
		.when(
			isRole,
			(fixed): TRoleFindEffect => Effect.succeed(fixedRoleDto(fixed, counts)),
		)
		.otherwise(
			(custom): TRoleFindEffect =>
				CustomRoleRepo.use((repo) => repo.findByKey(custom)).pipe(
					Effect.map((row) => (row === null ? null : toRoleDto(row, counts))),
				),
		);

export const roleGet = Effect.fn("roleGet")(function* ({
	key,
}: TRoleKeyInput): Effect.fn.Return<
	TRoleDto,
	ENotFound | EDatabase,
	CustomRoleRepo | UserRepo
> {
	const userRepo = yield* UserRepo;
	const counts = yield* userRepo.countByRole();
	const role = yield* roleFind(key, counts);

	if (role === null) {
		return yield* new ENotFound({ message: ROLE_MESSAGE.NOT_FOUND });
	}

	return role;
});
