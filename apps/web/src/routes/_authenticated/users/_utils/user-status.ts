import { type TUser, type TUserStatus, USER_STATUS } from "@app/schemas";
import { match, P } from "ts-pattern";

export const userStatusOf = (user: TUser): TUserStatus =>
	match(user)
		.with(
			{ deactivatedAt: P.string },
			(): TUserStatus => USER_STATUS.DEACTIVATED,
		)
		.with({ emailVerified: false }, (): TUserStatus => USER_STATUS.PENDING)
		.otherwise((): TUserStatus => USER_STATUS.ACTIVE);
