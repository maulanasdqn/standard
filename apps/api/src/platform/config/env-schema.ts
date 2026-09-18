import { z } from "zod";
import { A } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";

const NODE_ENV = {
	PRODUCTION: "production",
} as const;

const URL_PROTOCOL = {
	HTTPS: "https:",
} as const;

const ENV_KEY = {
	BETTER_AUTH_URL: "BETTER_AUTH_URL",
	WEB_ORIGIN: "WEB_ORIGIN",
} as const;

const ENV_VALIDATION_MESSAGE = {
	HTTPS_REQUIRED: "HTTPS is required in production.",
} as const;

const blankAsUndefined = (value: unknown): unknown =>
	match(value)
		.with("", (): undefined => undefined)
		.otherwise((found): unknown => found);

const jsonObjectParse = (
	value: string | undefined,
): Record<string, unknown> | undefined =>
	match(value)
		.with(P.nullish, (): undefined => undefined)
		.otherwise(
			(found): Record<string, unknown> =>
				JSON.parse(found) as Record<string, unknown>,
		);

const stringListParse = (value: string): readonly string[] =>
	A.filterMap(value.split(","), (item): string | undefined => {
		const trimmed = item.trim();
		return trimmed === "" ? undefined : trimmed;
	});

export const envSchema = z
	.object({
		NODE_ENV: z
			.enum(["development", "test", NODE_ENV.PRODUCTION])
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
		BETTER_AUTH_SECRET: z.string().min(32),
		LOG_LEVEL: z.preprocess(
			blankAsUndefined,
			z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
		),
		LOG_TRANSPORT_TARGET: z.preprocess(
			blankAsUndefined,
			z.string().min(1).optional(),
		),
		LOG_TRANSPORT_OPTIONS: z
			.preprocess(blankAsUndefined, z.string().optional())
			.transform(jsonObjectParse),
		ACTIVITY_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
		RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().default(60),
		RATE_LIMIT_MAX: z.coerce.number().int().default(100),
		RATE_LIMIT_TRUSTED_PROXY_IPS: z
			.string()
			.default("")
			.transform(stringListParse),
	})
	.superRefine((env, context): void => {
		match(env.NODE_ENV)
			.with(NODE_ENV.PRODUCTION, (): void => {
				match(new URL(env.WEB_ORIGIN).protocol)
					.with(URL_PROTOCOL.HTTPS, (): void => undefined)
					.otherwise((): void => {
						context.addIssue({
							code: "custom",
							path: [ENV_KEY.WEB_ORIGIN],
							message: ENV_VALIDATION_MESSAGE.HTTPS_REQUIRED,
						});
					});
				match(new URL(env.BETTER_AUTH_URL).protocol)
					.with(URL_PROTOCOL.HTTPS, (): void => undefined)
					.otherwise((): void => {
						context.addIssue({
							code: "custom",
							path: [ENV_KEY.BETTER_AUTH_URL],
							message: ENV_VALIDATION_MESSAGE.HTTPS_REQUIRED,
						});
					});
			})
			.otherwise((): void => undefined);
	});

export type TEnv = z.infer<typeof envSchema>;
