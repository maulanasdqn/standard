import { ROLE } from "@app/permissions";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { ownershipWhere } from "#/platform/db/ownership.ts";
import { note } from "#/platform/db/tables/note.ts";

const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const dialect = new PgDialect();

const renderedFor = (
	role: string,
): { sql: string; params: unknown[] } | undefined => {
	const where = ownershipWhere({ id: ACTOR_ID, role }, note.authorId);
	return where === undefined ? undefined : dialect.sqlToQuery(where);
};

describe("ownershipWhere", () => {
	it("lets a superadmin see every row", (): void => {
		expect(renderedFor(ROLE.SUPERADMIN)).toBeUndefined();
	});

	it("restricts an admin to the rows they authored", (): void => {
		const rendered = renderedFor(ROLE.ADMIN);

		expect(rendered?.sql).toContain("author_id");
		expect(rendered?.params).toEqual([ACTOR_ID]);
	});

	it("restricts a member and a custom role the same way", (): void => {
		expect(renderedFor(ROLE.MEMBER)?.params).toEqual([ACTOR_ID]);
		expect(renderedFor("reviewer")?.params).toEqual([ACTOR_ID]);
	});
});
