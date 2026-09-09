import { runMigrations } from "@app/migrations";
import { env } from "#/infrastructure/config/env.ts";

await runMigrations({
	service: "api",
	migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
	databaseUrl: env.DATABASE_URL,
});
