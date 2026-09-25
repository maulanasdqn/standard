import { loggerCreate } from "@app/logger";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { MigrationConfig } from "drizzle-orm/migrator";
import { Pool } from "pg";

type TRunMigrationsOptions = {
	service: string;
	migrationsFolder: string;
	databaseUrl: string;
	migrationsSchema?: string;
	migrationsTable?: string;
};

const migrationConfigOf = (
	options: TRunMigrationsOptions,
): MigrationConfig => ({
	migrationsFolder: options.migrationsFolder,
	migrationsSchema: options.migrationsSchema,
	migrationsTable: options.migrationsTable,
});

export const migrationsRun = async (
	options: TRunMigrationsOptions,
): Promise<void> => {
	const logger = loggerCreate({
		service: options.service,
		env: process.env.NODE_ENV ?? "development",
	});
	const pool = new Pool({ connectionString: options.databaseUrl });
	const db = drizzle(pool);
	const config = migrationConfigOf(options);

	try {
		logger.info(config, "running migrations");
		await migrate(db, config);
		logger.info("migrations applied");
	} finally {
		await pool.end();
	}
};
