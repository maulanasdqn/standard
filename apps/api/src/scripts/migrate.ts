import { migrationsRun } from "@app/migrations";
import { env } from "#/platform/config/env.ts";

const MIGRATION_JOURNAL = {
	SCHEMA: "drizzle",
	TABLE: "__drizzle_migrations",
} as const;

await migrationsRun({
	service: "api",
	migrationsFolder: new URL("../../drizzle", import.meta.url).pathname,
	databaseUrl: env.DATABASE_URL,
	migrationsSchema: MIGRATION_JOURNAL.SCHEMA,
	migrationsTable: MIGRATION_JOURNAL.TABLE,
});
