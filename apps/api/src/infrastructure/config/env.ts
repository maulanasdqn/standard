import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().default(3001),
	WEB_ORIGIN: z.url().default("http://localhost:5173"),
	DATABASE_URL: z.string().min(1),
	REDIS_URL: z.string().min(1),
	RABBITMQ_URL: z.string().min(1),
	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(16),
	WEB_DIST_PATH: z.string().optional(),
});

export type TEnv = z.infer<typeof envSchema>;

export const env: TEnv = envSchema.parse(process.env);
