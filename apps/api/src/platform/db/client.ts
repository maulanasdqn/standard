import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "#/platform/db/schema.ts";

export const DB_CONNECTION_TIMEOUT_MS = 5_000;
export const DB_STATEMENT_TIMEOUT_MS = 30_000;

export type TDb = NodePgDatabase<typeof schema>;

export const dbCreate = (databaseUrl: string): TDb => {
	const pool = new Pool({
		connectionString: databaseUrl,
		connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
		statement_timeout: DB_STATEMENT_TIMEOUT_MS,
		query_timeout: DB_STATEMENT_TIMEOUT_MS,
	});
	return drizzle(pool, { schema });
};
