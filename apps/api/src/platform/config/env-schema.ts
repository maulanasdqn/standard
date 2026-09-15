import { z } from "zod";
import { A } from "@mobily/ts-belt";

const stringListParse = (value: string): readonly string[] =>
	A.filterMap(value.split(","), (item): string | undefined => {
		const trimmed = item.trim();
		return trimmed === "" ? undefined : trimmed;
	});

export const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().default(3001),
	WEB_ORIGIN: z.url().default("http://localhost:5173"),
	WEB_DIST_PATH: z.string().optional(),
	DATABASE_URL: z.string().min(1),
	REDIS_URL: z.string().min(1),
	RABBITMQ_URL: z.string().min(1),
	SMTP_URL: z.string().min(1).default("smtp://localhost:1025"),
	MAIL_FROM: z.string().min(1).default("Standard <no-reply@standard.test>"),
	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(16),
	RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().default(60),
	RATE_LIMIT_MAX: z.coerce.number().int().default(100),
	RATE_LIMIT_TRUSTED_PROXY_IPS: z
		.string()
		.default("")
		.transform(stringListParse),
});

export type TEnv = z.infer<typeof envSchema>;
