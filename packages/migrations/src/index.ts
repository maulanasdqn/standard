import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

type TRunMigrationsOptions = {
	service: string;
	migrationsFolder: string;
	databaseUrl: string;
};

/**
 * Applies pending Drizzle migrations from `migrationsFolder` against `databaseUrl`.
 * Each app's `src/migrate.ts` is a thin entrypoint over this.
 */
export const runMigrations = async ({
	service,
	migrationsFolder,
	databaseUrl,
}: TRunMigrationsOptions): Promise<void> => {
	const pool = new Pool({ connectionString: databaseUrl });
	const db = drizzle(pool);

	try {
		console.log(`[${service}] running migrations from ${migrationsFolder}`);
		await migrate(db, { migrationsFolder });
		console.log(`[${service}] migrations applied`);
	} finally {
		await pool.end();
	}
};
