import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "#/infrastructure/db/schema.ts";

export type TDb = NodePgDatabase<typeof schema>;

export const dbCreate = (databaseUrl: string): TDb => {
	const pool = new Pool({ connectionString: databaseUrl });
	return drizzle(pool, { schema });
};
