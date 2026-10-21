import { ROLE } from "@app/permissions";
import {
	type TUserListInput,
	USER_STATUS,
	USER_TWO_FACTOR_FILTER,
	userListInputSchema,
} from "@app/schemas";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { userListWhere } from "#/user/infrastructure/user-list-where.ts";

const SEARCH = "ana";
const TO = "2026-03-31T23:59:59.999Z";
const dialect = new PgDialect();

const renderedFor = (
	patch: Partial<TUserListInput>,
): { sql: string; params: unknown[] } | undefined => {
	const where = userListWhere({ ...userListInputSchema.parse({}), ...patch });
	return where === undefined ? undefined : dialect.sqlToQuery(where);
};

const sqlFor = (patch: Partial<TUserListInput>): string | undefined =>
	renderedFor(patch)?.sql;

describe("userListWhere", () => {
	it("adds no condition when no filter is given", (): void => {
		expect(sqlFor({})).toBeUndefined();
	});

	it("matches the search in the name or the email", (): void => {
		expect(sqlFor({ search: SEARCH })).toMatch(
			/"name" ilike .* or .*"email" ilike/,
		);
	});

	it("keeps only the requested role", (): void => {
		expect(sqlFor({ role: ROLE.ADMIN })).toContain('"role" =');
	});

	it("tells active, pending and deactivated users apart", (): void => {
		const active = renderedFor({ status: USER_STATUS.ACTIVE });
		const pending = renderedFor({ status: USER_STATUS.PENDING });

		expect(active?.sql).toContain('"deactivated_at" is null');
		expect(active?.params).toEqual([true]);
		expect(pending?.sql).toBe(active?.sql);
		expect(pending?.params).toEqual([false]);
		expect(sqlFor({ status: USER_STATUS.DEACTIVATED })).toBe(
			'"user"."deactivated_at" is not null',
		);
	});

	it("counts a user with no two-factor record as off", (): void => {
		expect(sqlFor({ twoFactor: USER_TWO_FACTOR_FILTER.ON })).not.toContain(
			"is null",
		);
		expect(sqlFor({ twoFactor: USER_TWO_FACTOR_FILTER.OFF })).toMatch(
			/"two_factor_enabled" = .* or .*"two_factor_enabled" is null/,
		);
	});

	it("bounds the creation date", (): void => {
		expect(sqlFor({ dateTo: TO })).toContain('"created_at" <=');
	});
});
