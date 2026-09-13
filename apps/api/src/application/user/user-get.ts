import { USER_MESSAGE } from "@app/messages";
import type { TUser, TUserIdInput } from "@app/schemas";
import { Effect } from "effect";
import { ENotFound, type EDatabase } from "#/domain/shared/errors.ts";
import { toUserDto } from "#/application/user/to-user-dto.ts";
import { UserRepo } from "#/domain/user/user.ts";

export const userGet = Effect.fn("userGet")(function* ({
	id,
}: TUserIdInput): Effect.fn.Return<TUser, ENotFound | EDatabase, UserRepo> {
	const userRepo = yield* UserRepo;
	const row = yield* userRepo.findById(id);

	if (row === null) {
		return yield* new ENotFound({ message: USER_MESSAGE.NOT_FOUND });
	}

	return toUserDto(row);
});
