import { describe, expect, it } from "vitest";
import { violationsFor } from "./migration-check.ts";
import {
	MIGRATION_SAFETY_MARKER,
	PRE_POLICY_MIGRATIONS,
	UNSAFE_STATEMENT,
} from "./migration-rules.ts";

const FILE = "0099_example.sql";
const RENAME = 'ALTER TABLE "note" RENAME COLUMN "body" TO "content";';
const ADD =
	'ALTER TABLE "note" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;';

describe("violationsFor", () => {
	it("passes an additive migration, including one that adds a NOT NULL column", () => {
		expect(violationsFor(FILE, ADD)).toHaveLength(0);
	});

	it("passes CREATE TABLE and CREATE INDEX", () => {
		const sql =
			'CREATE TABLE "thing" ("id" uuid);\nCREATE INDEX "i" ON "thing" ("id");';

		expect(violationsFor(FILE, sql)).toHaveLength(0);
	});

	it("rejects a column rename and explains the release it would break", () => {
		const [violation] = violationsFor(FILE, RENAME);

		expect(violation?.statement).toBe(UNSAFE_STATEMENT.RENAME_COLUMN);
		expect(violation?.line).toBe(1);
		expect(violation?.remedy).toContain("running replica");
	});

	it("rejects dropping a column and dropping a table", () => {
		const sql = 'ALTER TABLE "note" DROP COLUMN "body";\nDROP TABLE "old";';
		const found = violationsFor(FILE, sql);

		expect(found.map((v) => v.statement)).toStrictEqual([
			UNSAFE_STATEMENT.DROP_COLUMN,
			UNSAFE_STATEMENT.DROP_TABLE,
		]);
	});

	it("rejects tightening an existing column to NOT NULL", () => {
		const sql = 'ALTER TABLE "note" ALTER COLUMN "body" SET NOT NULL;';

		expect(violationsFor(FILE, sql)).toHaveLength(1);
	});

	it("lets a deliberate contract phase through when the file is marked", () => {
		const sql = `-- ${MIGRATION_SAFETY_MARKER}\n${RENAME}`;

		expect(violationsFor(FILE, sql)).toHaveLength(0);
	});

	it("leaves migrations that predate the policy alone", () => {
		const [first] = PRE_POLICY_MIGRATIONS;

		expect(violationsFor(first ?? "", RENAME)).toHaveLength(0);
	});
});
