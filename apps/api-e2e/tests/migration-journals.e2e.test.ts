import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrationsRun } from "@app/migrations";
import { A } from "@mobily/ts-belt";
import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { E2E_DATABASE_URL } from "../support/services.ts";

const SERVICE = "journal-e2e";
const JOURNAL_TABLE = "__drizzle_migrations";
const JOURNAL_SHARED = "journal_shared";
const SCHEMA_PREFIX = "journal_";
const TABLE_SUFFIX = "_item";
const STATEMENT_BREAKPOINT = "\n--> statement-breakpoint\n";
const JOURNAL_VERSION = "7";
const JOURNAL_DIALECT = "postgresql";
const WHEN = { OLDER: 1_000, NEWER: 2_000 } as const;
const ONE_ROW = 1;
const NO_ROWS = 0;

type TFixture = { name: string; path: string; schema: string; table: string };

const fixtures: TFixture[] = [];

const journalJson = (tag: string, when: number): string =>
	JSON.stringify({
		version: JOURNAL_VERSION,
		dialect: JOURNAL_DIALECT,
		entries: [
			{ idx: 0, version: JOURNAL_VERSION, when, tag, breakpoints: true },
		],
	});

const fixtureCreate = (name: string, when: number): TFixture => {
	const path = mkdtempSync(join(tmpdir(), `${SERVICE}-${name}-`));
	const schema = `${SCHEMA_PREFIX}${name}`;
	const table = `${name}${TABLE_SUFFIX}`;
	const tag = `0000_${name}`;
	mkdirSync(join(path, "meta"));
	writeFileSync(join(path, "meta", "_journal.json"), journalJson(tag, when));
	writeFileSync(
		join(path, `${tag}.sql`),
		[
			`CREATE SCHEMA IF NOT EXISTS "${schema}";`,
			`CREATE TABLE "${schema}"."${table}" ("id" text PRIMARY KEY);`,
		].join(STATEMENT_BREAKPOINT),
	);
	const fixture = { name, path, schema, table };
	fixtures.push(fixture);
	return fixture;
};

const runInto = (fixture: TFixture, journalSchema: string): Promise<void> =>
	migrationsRun({
		service: SERVICE,
		migrationsFolder: fixture.path,
		databaseUrl: E2E_DATABASE_URL,
		migrationsSchema: journalSchema,
		migrationsTable: JOURNAL_TABLE,
	});

const pool = new Pool({ connectionString: E2E_DATABASE_URL });

const tableExists = async (fixture: TFixture): Promise<boolean> => {
	const result = await pool.query<{ found: string | null }>(
		"SELECT to_regclass($1) AS found",
		[`"${fixture.schema}"."${fixture.table}"`],
	);
	return (result.rows[0]?.found ?? null) !== null;
};

const journalRows = async (schema: string): Promise<number> => {
	const result = await pool.query<{ count: string }>(
		`SELECT count(*)::text AS count FROM "${schema}"."${JOURNAL_TABLE}"`,
	);
	return Number(result.rows[0]?.count ?? NO_ROWS);
};

afterAll(async (): Promise<void> => {
	const schemas = A.uniq([
		JOURNAL_SHARED,
		...A.map(fixtures, (fixture) => fixture.schema),
	]);
	await Promise.all(
		A.map(schemas, (schema) =>
			pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`),
		),
	);
	await pool.end();
	A.forEach(fixtures, (fixture) =>
		rmSync(fixture.path, { recursive: true, force: true }),
	);
});

describe("migration journals on one database", () => {
	it("keeps one journal per app, so both apps apply and a rerun applies nothing", async (): Promise<void> => {
		const alpha = fixtureCreate("alpha", WHEN.NEWER);
		const beta = fixtureCreate("beta", WHEN.OLDER);

		await runInto(alpha, alpha.schema);
		await runInto(beta, beta.schema);
		await runInto(alpha, alpha.schema);
		await runInto(beta, beta.schema);

		expect(await tableExists(alpha)).toBe(true);
		expect(await tableExists(beta)).toBe(true);
		expect(await journalRows(alpha.schema)).toBe(ONE_ROW);
		expect(await journalRows(beta.schema)).toBe(ONE_ROW);
	});

	it("skips the older app's migration silently when two apps share one journal", async (): Promise<void> => {
		const gamma = fixtureCreate("gamma", WHEN.NEWER);
		const delta = fixtureCreate("delta", WHEN.OLDER);

		await runInto(gamma, JOURNAL_SHARED);
		await expect(runInto(delta, JOURNAL_SHARED)).resolves.toBeUndefined();

		expect(await tableExists(gamma)).toBe(true);
		expect(await tableExists(delta)).toBe(false);
		expect(await journalRows(JOURNAL_SHARED)).toBe(ONE_ROW);
	});
});
