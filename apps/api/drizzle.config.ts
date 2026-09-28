import { defineConfig } from "drizzle-kit";

const OWNED_SCHEMA = "public";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/platform/db/schema.ts",
	dialect: "postgresql",
	schemaFilter: [OWNED_SCHEMA],
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/app",
	},
});
