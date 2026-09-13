import { ROLE } from "@app/permissions";
import type { TRoleList } from "@app/schemas";
import { A, D } from "@mobily/ts-belt";
import { Effect } from "effect";
import { fixedRoleDto, toRoleDto } from "#/application/role/to-role-dto.ts";
import type { EDatabase } from "#/domain/shared/errors.ts";
import { CustomRoleRepo } from "#/domain/role/custom-role.ts";
import { UserRepo } from "#/domain/user/user.ts";

export const roleList = Effect.fn("roleList")(function* (): Effect.fn.Return<
	TRoleList,
	EDatabase,
	CustomRoleRepo | UserRepo
> {
	const customRoleRepo = yield* CustomRoleRepo;
	const userRepo = yield* UserRepo;

	const [custom, counts] = yield* Effect.all([
		customRoleRepo.list(),
		userRepo.countByRole(),
	]);

	const fixed = A.map(D.values(ROLE), (key) => fixedRoleDto(key, counts));
	const items = A.map(custom, (row) => toRoleDto(row, counts));

	return { items: [...fixed, ...items] };
});
