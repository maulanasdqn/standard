import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "#/infrastructure/db/schema.ts";

export const createDb = (databaseUrl: string) => {
	const pool = new Pool({ connectionString: databaseUrl });
	return drizzle(pool, { schema });
};

export type TDb = ReturnType<typeof createDb>;
