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
		.with(P.nonNullable, (value): SQL | undefined =>
			or(containsWhere(user.name, value), containsWhere(user.email, value)),
		)
		.otherwise((): undefined => undefined);

const roleWhere = (role: string | undefined): SQL | undefined =>
	match(role)
		.with(P.nonNullable, (value): SQL => eq(user.role, value))
		.otherwise((): undefined => undefined);

const statusWhere = (status: TUserStatus | undefined): SQL | undefined =>
	match(status)
		.with(USER_STATUS.ACTIVE, (): SQL | undefined =>
			and(isNull(user.deactivatedAt), eq(user.emailVerified, true)),
		)
		.with(USER_STATUS.PENDING, (): SQL | undefined =>
			and(isNull(user.deactivatedAt), eq(user.emailVerified, false)),
		)
		.with(USER_STATUS.DEACTIVATED, (): SQL => isNotNull(user.deactivatedAt))
		.with(undefined, (): undefined => undefined)
		.exhaustive();

const twoFactorWhere = (
	filter: TUserTwoFactorFilter | undefined,
): SQL | undefined =>
	match(filter)
		.with(USER_TWO_FACTOR_FILTER.ON, (): SQL => eq(user.twoFactorEnabled, true))
		.with(USER_TWO_FACTOR_FILTER.OFF, (): SQL | undefined =>
			or(eq(user.twoFactorEnabled, false), isNull(user.twoFactorEnabled)),
		)
		.with(undefined, (): undefined => undefined)
		.exhaustive();

export const userListWhere = (input: TUserListInput): SQL | undefined =>
	and(
		searchWhere(input.search),
		roleWhere(input.role),
		statusWhere(input.status),
		twoFactorWhere(input.twoFactor),
		dateRangeWhere(user.createdAt, input.dateFrom, input.dateTo),
	);
