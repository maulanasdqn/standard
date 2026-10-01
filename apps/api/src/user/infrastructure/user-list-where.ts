import {
	type TUserListInput,
	type TUserStatus,
	type TUserTwoFactorFilter,
	USER_STATUS,
	USER_TWO_FACTOR_FILTER,
} from "@app/schemas";
import { and, eq, isNotNull, isNull, or, type SQL } from "drizzle-orm";
import { match, P } from "ts-pattern";
import { dateRangeWhere } from "#/platform/db/date-range.ts";
import { containsWhere } from "#/platform/db/search.ts";
import { user } from "#/platform/db/tables/auth.ts";

const searchWhere = (search: string | undefined): SQL | undefined =>
	match(search)
		.with(P.nonNullable, (value) =>
			or(containsWhere(user.name, value), containsWhere(user.email, value)),
		)
		.otherwise(() => undefined);

const roleWhere = (role: string | undefined): SQL | undefined =>
	match(role)
		.with(P.nonNullable, (value) => eq(user.role, value))
		.otherwise(() => undefined);

const statusWhere = (status: TUserStatus | undefined): SQL | undefined =>
	match(status)
		.with(USER_STATUS.ACTIVE, () =>
			and(isNull(user.deactivatedAt), eq(user.emailVerified, true)),
		)
		.with(USER_STATUS.PENDING, () =>
			and(isNull(user.deactivatedAt), eq(user.emailVerified, false)),
		)
		.with(USER_STATUS.DEACTIVATED, () => isNotNull(user.deactivatedAt))
		.with(undefined, () => undefined)
		.exhaustive();

const twoFactorWhere = (
	filter: TUserTwoFactorFilter | undefined,
): SQL | undefined =>
	match(filter)
		.with(USER_TWO_FACTOR_FILTER.ON, () => eq(user.twoFactorEnabled, true))
		.with(USER_TWO_FACTOR_FILTER.OFF, () =>
			or(eq(user.twoFactorEnabled, false), isNull(user.twoFactorEnabled)),
		)
		.with(undefined, () => undefined)
		.exhaustive();

export const userListWhere = (input: TUserListInput): SQL | undefined =>
	and(
		searchWhere(input.search),
		roleWhere(input.role),
		statusWhere(input.status),
		twoFactorWhere(input.twoFactor),
		dateRangeWhere(user.createdAt, input.dateFrom, input.dateTo),
	);
