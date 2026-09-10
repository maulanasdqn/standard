import type { TUserList, TUserListInput } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { Effect } from "effect";
import type { EDatabase } from "#/application/shared/errors.ts";
import { toUserDto } from "#/application/user/to-user-dto.ts";
import { UserRepo } from "#/infrastructure/db/repositories/user-repository.ts";

export const userList = Effect.fn("userList")(function* (
	input: TUserListInput,
): Effect.fn.Return<TUserList, EDatabase, UserRepo> {
	const userRepo = yield* UserRepo;
	const { items, total } = yield* userRepo.list(input);
	return {
		items: A.map(items, toUserDto),
		total,
		page: input.page,
		pageSize: input.pageSize,
	};
});
